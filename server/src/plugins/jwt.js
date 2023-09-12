import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import { getEnvVars } from "../utils/getEnvVar.js";

/**
 * @param {import('fastify').FastifyInstance} fastify
 * @returns {Promise<void>}
 */
export const jwtPlugin = fp(async function (fastify) {
  const [JWT_SECRET, JWT_COOKIE_NAME] = getEnvVars([
    "JWT_SECRET",
    "JWT_COOKIE_NAME",
  ]);

  fastify.register(jwt, {
    secret: JWT_SECRET,
    cookie: {
      cookieName: JWT_COOKIE_NAME,
      signed: false,
    },
  });

  fastify.register(cookie);
});
