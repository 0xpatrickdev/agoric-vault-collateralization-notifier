import {
  addOrUpdateUser,
  getUserByToken,
  markUserVerified,
} from "../services/db/index.js";
import { sendVerifyEmail } from "../services/email.js";
import { generateToken } from "../services/encryption.js";
import { isValidEmail } from "../utils/isValidEmail.js";
import { THIRTY_MINUTES_IN_MS } from "../utils/constants.js";

const JWT_EXPIRY = process.env.JWT_EXPIRY || "30d";

/** @returns {import('fastify').FastifyPluginCallback} */
export const auth = (fastify, _, done) => {
  // Route to create a new user
  fastify.post("/register", async (request, reply) => {
    // validate email
    const { email } = request.body;
    if (!isValidEmail(email)) {
      return reply.status(400).send({ error: "Invalid email address." });
    }

    // generate access token and send via email
    const token = generateToken();
    try {
      await sendVerifyEmail(email, token);
    } catch (e) {
      console.warn('Email service error', e.message)
      console.log("auth token", token); // for testing
      // disabled for development/testing purposes
      // return reply.status(500).send({
      //   error:
      //     "Error sending email. Please try again or use a different address.",
      // });
    }

    // save user + token in database
    try {
      const tokenExpiry = Date.now() + THIRTY_MINUTES_IN_MS;
      await addOrUpdateUser({ email, token, tokenExpiry, verified: 0 });
    } catch (e) {
      return reply.status(500).send({
        error: "Unexpected error occured.",
      });
    }

    // send success response
    reply.send({
      message: "Verification email sent. Please check your email.",
    });
  });

  // Route to verify a user and log them in
  fastify.post("/verify", async (request, reply) => {
    const { token } = request.body;
    let user;
    try {
      user = await getUserByToken(token);
    } catch (err) {
      return reply.status(500).send({ error: "Unexpected error occured." });
    }

    // if user not found, send an error
    if (!user) {
      return reply.status(400).send({ error: "Unexpected error occured." });
    }

    // check if token is expired
    if (Date.now() > user.tokenExpiry) {
      return reply
        .status(400)
        .send({ error: "Token expired. Please register again." });
    }

    // set user `verified` to true (1)
    try {
      await markUserVerified(user.id);
    } catch (err) {
      return reply.status(500).send({ error: "Unexpected error occured." });
    }

    // Generate a JWT and send success message
    const jwt = fastify.jwt.sign(
      { email: user.email, userId: user.id },
      { expiresIn: JWT_EXPIRY }
    );
    reply.header("Authorization", "Bearer " + jwt);
    reply.send({ success: true });
  });

  done();
};
