import fp from "fastify-plugin";
import jwt from "@fastify/jwt";

/**
 * @param {import('fastify').FastifyInstance} fastify
 * @param {string} opts.secret JWT secret
 */
export const jwtPlugin = fp(async function (fastify, { secret }) {
  fastify.register(jwt, {
    secret: secret,
  });

  fastify.decorate("authenticate", async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      console.error(err);
      reply.status(401).send({ error: "Unauthorized" });
    }
  });
});
