import { isNaturalNumber } from "../utils/validation.js";
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

/** @typedef {{ vaultManagerId: number, vaultId: number, collateralizationRatio: number }} CreateNotifierRequestBody */
/** @typedef {{ notifierId: number }} DeleteRequestParams */

/** @type {import('fastify').FastifyPluginCallback} */
export const notifiers = (fastify, _, done) => {
  fastify.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
      if (!request.user.userId)
        reply.status(500).send({ message: "Unexpected error." });
    } catch (err) {
      reply.status(401).send({ message: "Unauthorized" });
    }
  });

  /**
   * Route to create a new Notifier
   * @param {import('fastify').FastifyRequest<{Body: CreateNotifierRequestBody}>} request
   * @param {import('fastify').FastifyReply} reply
   * @returns {Promise<void>}
   */
  fastify.post("/notifiers", async (request, reply) => {
    const { userId } = /** @type {import('./auth.js').JwtUserPayload} */ (
      request.user
    );
    const { vaultManagerId, vaultId, collateralizationRatio } =
      /** @type {CreateNotifierRequestBody} */ (request.body);
    try {
      if (!isNaturalNumber(vaultManagerId))
        return reply
          .status(400)
          .send({ message: "Vault Manager ID must be a positive integer" });

      if (!isNaturalNumber(vaultId))
        return reply
          .status(400)
          .send({ message: "Vault ID must be a positive integer" });

      if (!isNaturalNumber(collateralizationRatio))
        return reply.status(400).send({
          message: "Collateralization Ratio must be a positive integer",
        });

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
            return reply.status(400).send({ message: "Vault does not exist" });
          } else
            return reply.status(500).send({ message: "Unexpected error." });
        }
        const vault = vaultFromVaultState(vaultPath, vaultData);
        if (vault.state === "liquidated" || vault.state === "closed") {
          return reply.status(400).send({ message: "Vault is inactive" });
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
            return reply.status(500).send({ message: "Unexpected error." });
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

      reply.send({ ok: true });

      vstorageWatcher.watchPath(quotePath, "quote");
      vstorageWatcher.watchPath(vaultPath, "vault");
    } catch (e) {
      console.error(e);
      return reply.status(500).send({ message: "Unexpected error." });
    }
  });

  /**
   * Returns a list of notifiers for an authenticated user
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply} reply
   * @returns {Promise<void>}
   */
  fastify.get("/notifiers", async (request, reply) => {
    const { userId } = /** @type {import('./auth.js').JwtUserPayload} */ (
      request.user
    );
    let notifiers;
    try {
      notifiers = await getNotifiersByUser(userId);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ message: "Unexpected error." });
    }
    return notifiers;
  });

  /**
   * Route to delete a new Notifier
   * @param {import('fastify').FastifyRequest<{Params: DeleteRequestParams}>} request
   * @param {import('fastify').FastifyReply} reply
   * @returns {Promise<void>}
   */
  fastify.delete("/notifiers/:notifierId", async (request, reply) => {
    const { userId } = /** @type {import('./auth.js').JwtUserPayload} */ (
      request.user
    );
    const { notifierId } = /** @type {DeleteRequestParams} */ (request.params);
    try {
      const res = await deleteNotifier({ userId, notifierId });
      // query if it's the last notifier for the vault. If yes, remove watcher
      const remainingNotifiers = await getNotifiersByVaultId(res);
      if (!remainingNotifiers.length) {
        const path = makeVaultPath(res.vaultManagerId, res.vaultId);
        vstorageWatcher.removePath(path);
      }
      // @todo can check for quote followers to stop, but probably not necessary rn
      reply.send({ ok: true });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ message: "Unexpected error." });
    }
  });

  done();
};
