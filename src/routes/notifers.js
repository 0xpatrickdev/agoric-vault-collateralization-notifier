import { isNumber, isNaturalNumber } from "../utils/validation.js";
import {
  createNotifier,
  getNotifiersByUser,
  deleteNotifier,
  checkVaultExists,
  checkQuoteExists,
  insertQuote,
  insertBrand,
  checkBrandExists,
} from "../services/db/index.js";
import { makeVaultPath, makeQuotePath } from "../utils/vstoragePaths.js";
import { vstorageWatcher } from "../vstorageWatcher.js";

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

      const quoteExists = await checkQuoteExists(vaultManagerId);
      if (!quoteExists) {
        // First, check if the related Brands exist or not
        try {
          const brandInExists = await checkBrandExists("IST");
          const brandOutExists = await checkBrandExists("ATOM");

          // If brands do not exist, add them
          if (!brandInExists)
            await insertBrand({
              issuerName: "IST",
              assetKind: "nat",
              decimalPlaces: 6,
            });
          if (!brandOutExists)
            await insertBrand({
              issuerName: "ATOM",
              assetKind: "nat",
              decimalPlaces: 6,
            });
        } catch (e) {
          console.warn("Error adding brand", e.message);
        }
        
        try {
          await insertQuote({
            vaultManagerId,
            quoteAmountIn: 0, // @todo, get real value from RPC
            quoteAmountOut: 0, // @todo, get real value from RPC
            inIssuerName: "IST",
            inIssuerName: "ATOM", // @todo, get real value from RPC
          });
        } catch (e) {
          console.warn("error inserting quote");
        }
      }

      const vaultExists = await checkVaultExists(vaultManagerId, vaultId);
      // if (!vaultExists) {
      //   // v2. query 1x rpc to see if vault and vaultManager exists
      //   await insertOrUpdateVault({ vaultManagerId, vaultId });
      // }

      // @todo see if quote exists via 1x rpc and add to db

      await createNotifier({
        userId,
        vaultManagerId,
        vaultId,
        collateralizationRatio,
      });

      reply.send({ success: true });
      if (!quoteExists)
        vstorageWatcher.watchPath(makeQuotePath(vaultManagerId), "quote");

      if (!vaultExists)
        vstorageWatcher.watchPath(
          makeVaultPath(vaultManagerId, vaultId),
          "vault"
        );
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
