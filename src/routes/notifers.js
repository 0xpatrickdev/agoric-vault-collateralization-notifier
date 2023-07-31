export const notifiers = (fastify, _, done) => {
  fastify.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
      if (!request.user.userId) {
        reply.status(500).send({ error: "Unexpected error." });
      }
    } catch (err) {
      reply.status(401).send({ error: "Unauthorized" });
    }
  });

  fastify.get("/notifiers", async (request, reply) => {
    const { userId } = request.user;
    let notifiers;
    try {
      notifiers = await new Promise((resolve, reject) => {
        db.all(
          "SELECT * FROM Notifier WHERE userId = ?",
          userId,
          function (err, rows) {
            if (err) return reject(err);
            resolve(rows);
          }
        );
      });
    } catch (err) {
      return reply.status(500).send({ error: "Database error" });
    }

    return notifiers;
  });
  done();
};
