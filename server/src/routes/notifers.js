import { isNumber, isNaturalNumber } from "../utils/validation.js";
import {
  createNotifier,
  checkQuoteExists,
  checkVaultExists,
  deleteNotifier,
  getIssuerNameFromBrand,
  getNotifiersByVaultId,
  getNotifiersByUser,
  insertOrReplaceVault,
  insertOrReplaceQuote,
} from "../services/db/index.js";
import {
  makeQuotePath,
  makeVaultPath,
  quoteFromQuoteState,
  vaultFromVaultState,
} from "../utils/vstoragePaths.js";
import { vstorageWatcher } from "../vstorageWatcher.js";
import { abciQuery } from "../services/rpc.js";

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

      // ensure vault exists and is active, then add to db
      const vaultExistsInDb = await checkVaultExists(vaultManagerId, vaultId);
      const vaultPath = makeVaultPath(vaultManagerId, vaultId);
      const quotePath = makeQuotePath(vaultManagerId);
      if (!vaultExistsInDb) {
        let vaultData;
        try {
          vaultData = await abciQuery(vaultPath);
        } catch (e) {
          if (e.message.includes("could not get vstorage path")) {
            return reply.status(400).send({ error: "Vault does not exist" });
          } else return reply.status(500).send({ error: "Unexpected error." });
        }
        const vault = vaultFromVaultState(vaultPath, vaultData);
        if (vault.state === "liquidated" || vault.state === "closed") {
          return reply.status(400).send({ error: "Vault is inactive." });
        }
        await insertOrReplaceVault(vault);

        // add quote record to db if it doesn't exist
        const quoteExists = await checkQuoteExists(vaultManagerId);
        if (!quoteExists) {
          const outIssuerName = await getIssuerNameFromBrand(
            String(vaultData.locked.brand)
          );
          let quoteData;
          try {
            quoteData = await abciQuery(quotePath);
          } catch (e) {
            return reply.status(500).send({ error: "Unexpected error." });
          }
          const quote = quoteFromQuoteState(quotePath, quoteData);
          await insertOrReplaceQuote({
            ...quote,
            inIssuerName: "IST",
            outIssuerName,
          });
        }
      }

      await createNotifier({
        userId,
        vaultManagerId,
        vaultId,
        collateralizationRatio,
      });

      reply.send({ success: true });

      vstorageWatcher.watchPath(quotePath, "quote");
      vstorageWatcher.watchPath(vaultPath, "vault");
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
      const res = await deleteNotifier({ userId, notifierId });
      // query if it's the last notifier for the vault. If yes, remove watcher
      const remainingNotifiers = await getNotifiersByVaultId(res);
      if (!remainingNotifiers.length) {
        const path = makeVaultPath(res.vaultManagerId, res.vaultId);
        vstorageWatcher.removePath(path);
      }
      // @todo can check for quote followers to stop, but probably not necessary rn
      reply.send({ success: true });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: "Unexpected error." });
    }
  });

  done();
};
