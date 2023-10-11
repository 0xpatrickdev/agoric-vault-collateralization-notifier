/** @type {import('fastify').FastifyPluginCallback} */
export const health = (fastify, _, done) => {
  fastify.get("/health-check", async (_, reply) => {
    reply.status(200).send({ ok: true });
  });
  done();
};
