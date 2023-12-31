import {
  addOrUpdateUser,
  getUserByToken,
  markUserVerified,
} from "../services/db/index.js";
import { sendEmail } from "../services/email.js";
import { generateToken } from "../services/encryption.js";
import { isValidEmail } from "../utils/isValidEmail.js";
import { THIRTY_MINUTES_IN_MS } from "../utils/constants.js";
import { getEnvVar } from "../utils/getEnvVar.js";
import { getVerifyEmailTemplate } from "../utils/emailTemplates.js";

/** @typedef {{ email: string }} RegisterRequestBody */
/** @typedef {{ token: string }} VerifyRequestBody */
/** @typedef {{ userId: number, email: string }} JwtUserPayload */

const JWT_EXPIRY = process.env.JWT_EXPIRY || "30d";

/** @type {import('fastify').FastifyPluginCallback} */
export const auth = (fastify, _, done) => {
  /**
   * Route to create a new user
   * @param {import('fastify').FastifyRequest<{Body: RegisterRequestBody}>} request
   * @param {import('fastify').FastifyReply} reply
   * @returns {Promise<void>}
   */
  fastify.post("/register", async (request, reply) => {
    // validate email
    const { email } = /** @type {RegisterRequestBody} */ (request.body);
    if (!isValidEmail(email)) {
      return reply.status(400).send({ message: "Email address is invalid." });
    }

    // generate access token and send via email
    const token = generateToken();
    try {
      await sendEmail({
        email,
        ...getVerifyEmailTemplate(token),
      });
    } catch (e) {
      return reply.status(500).send({
        message:
          "Error sending email. Please try again or use a different address.",
      });
    }

    // save user + token in database
    const tokenExpiry = Date.now() + THIRTY_MINUTES_IN_MS;
    await addOrUpdateUser({ email, token, tokenExpiry, verified: 0 });

    // send success response
    reply.send({
      message: "Verification email sent. Please check your email.",
    });
  });

  /**
   * Route to verify a user and log them in
   * @param {import('fastify').FastifyRequest<{Body: VerifyRequestBody}>} request
   * @param {import('fastify').FastifyReply} reply
   * @returns {Promise<void>}
   */
  fastify.post("/verify", async (request, reply) => {
    const { token } = /** @type {VerifyRequestBody} */ (request.body);
    let user;
    try {
      user = await getUserByToken(token);
    } catch (err) {
      return reply.status(500).send({ message: "Unexpected error occured." });
    }

    // if user not found, send an error
    if (!user) {
      return reply.status(400).send({ message: "Unexpected error occured." });
    }

    // check if token is expired
    if (Date.now() > user.tokenExpiry) {
      return reply
        .status(400)
        .send({ message: "Token expired. Please register again." });
    }

    // set user `verified` to true (1)
    try {
      await markUserVerified(user.id);
    } catch (err) {
      return reply.status(500).send({ message: "Unexpected error occured." });
    }

    // Generate a JWT and send success message
    const jwt = fastify.jwt.sign(
      /** @type {JwtUserPayload} */ ({ email: user.email, userId: user.id }),
      { expiresIn: JWT_EXPIRY }
    );

    reply
      .setCookie(getEnvVar("JWT_COOKIE_NAME"), jwt, {
        secure: true,
        httpOnly: true,
        sameSite: "strict",
        path: "/",
      })
      .send({ ok: true });
  });

  done();
};
