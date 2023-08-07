import { isNumber, isNaturalNumber } from "../utils/validation.js";
import {
  createNotifier,
  getNotifiersByUser,
  deleteNotifier,
} from "../services/db.js";

/** @returns {import('fastify').FastifyPluginCallback} */
export const notifiers = (fastify, _, done) => {
  fastify.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
      if (!request.user.userId)
        reply.status(500).send({ error: "Unexpected error." });
    } catch (err) {
      reply.status(401).send({ error: "Unauthorized" });
    }
  });

  fastify.post("/notifiers", async (request, reply) => {
    const { userId } = request.user;
    const { vaultManagerId, vaultId, collateralizationRatio } = request.body;
    try {
      if (!isNaturalNumber(vaultManagerId))
        return reply
          .status(400)
          .send({ error: "Vault Manager ID must be a positive integer" });

      if (!isNaturalNumber(vaultId))
        return reply
          .status(400)
          .send({ error: "Vault ID must be a positive integer" });

      if (!isNumber(collateralizationRatio))
        return reply
          .status(400)
          .send({ error: "collateralizationRatio must be a number" });

      await createNotifier({
        userId,
        vaultManagerId,
        vaultId,
        collateralizationRatio,
      });
      // @todo update follower service
      // console.log('notifier', notifier)
      reply.send({ success: true });
    } catch (e) {
      console.error(e);
      return reply.status(500).send({ error: "Unexpected error." });
    }
  });

  fastify.get("/notifiers", async (request, reply) => {
    const { userId } = request.user;
    let notifiers;
    try {
      notifiers = await getNotifiersByUser(userId);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: "Unexpected error." });
    }
    return notifiers;
  });

  fastify.delete("/notifiers/:notifierId", async (request, reply) => {
    const { userId } = request.user;
    const { notifierId } = request.params;
    try {
      await deleteNotifier({ userId, notifierId });
      // @todo update follower service
      reply.send({ success: true });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: "Unexpected error." });
    }
  });

  done();
};
