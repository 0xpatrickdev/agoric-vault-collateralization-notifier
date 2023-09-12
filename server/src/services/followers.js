import {
  getNotifiersByThreshold,
  getAllVaultsByManagerId,
  updateQuote,
  getLatestQuote,
  insertOrReplaceVault,
  updateNotifierStatus,
  setNotifierExpired,
  getNotifiersToReset,
  getNotifiersByVaultId,
  insertOrReplaceBrand,
  createNotification,
} from "./db/index.js";
import {
  makeVaultPath,
  quoteFromQuoteState,
  vaultFromVaultState,
} from "../utils/vstoragePaths.js";
import { vstorageWatcher } from "../vstorageWatcher.js";
import { calculateCollateralizationRatio } from "../utils/vaultMath.js";
import { getNotificationTemplate } from "../utils/emailTemplates.js";
import { sendEmail } from "../services/email.js";

/**
 * Logic to handle notifications based on collateralization ratio.
 * @param {number} currentCollateralizationRatio - The calculated collateralization ratio.
 * @param {number} managerId - The manager ID for context.
 * @param {number} vaultId - The vault ID for context.
 * @returns {Promise<void>}
 */
export async function maybeSendNotification(
  currentCollateralizationRatio,
  vaultManagerId,
  vaultId
) {
  if (typeof currentCollateralizationRatio !== "number")
    return console.error(
      `Invalid ratio provided ${currentCollateralizationRatio}`
    );
  const notifiers = await getNotifiersByThreshold({
    collateralizationRatio: currentCollateralizationRatio,
    vaultManagerId,
    vaultId,
  });

  for (const notifier of notifiers) {
    const { email, brand, collateralizationRatio } = notifier;
    const { subject, text } = getNotificationTemplate({
      brand,
      vaultId,
      collateralizationRatio: collateralizationRatio,
    });
    // create record for db
    const notification = {
      ...notifier,
      collateralizationRatioActual: currentCollateralizationRatio,
      message: text,
      notifierId: notifier.id,
      sentAt: new Date().getTime(),
    };

    try {
      await createNotification(notification);
      await sendEmail({ email, subject, text });
      // mark Notifier as "sent" so we don't send it again
      await updateNotifierStatus(notifier.id, 1);
      console.log(
        `Sent notification to userId: ${notifier.userId} for managerId: ${vaultManagerId} and vaultId: ${vaultId} via notifierId: ${notifier.id}.`
      );
    } catch (e) {
      console.error(
        `Error processing notification for userId:${notifier.userId}, managerId:${vaultManagerId}, vaultId:${vaultId}`,
        e
      );
    }
  }

  const activeNotifiers = await getNotifiersToReset({
    collateralizationRatio: currentCollateralizationRatio,
    vaultManagerId,
    vaultId,
  });

  for (const notifier of activeNotifiers) {
    // mark Notifier as "inactive" so we can fire if it crosses the threshold again
    await updateNotifierStatus(notifier.id, 0);
    console.log(
      `Resetting active status for: userId: ${notifier.userId} for managerId: ${vaultManagerId} and vaultId: ${vaultId} via notifierId: ${notifier.id}.`
    );
  }
}

export async function handleVault(path, vaultData) {
  const vault = vaultFromVaultState(path, vaultData);
  const { state: vaultState, vaultManagerId, vaultId, locked, debt } = vault;
  try {
    await insertOrReplaceVault(vault);
  } catch (e) {
    console.warn("error updating vault", e.message);
  }

  if (vaultState === "closed" || vaultState === "liquidated") {
    console.log(`Skipping vault with state: ${vaultState}`);
    await stopWatchingVault(vaultManagerId, vaultId);
    return;
  }

  try {
    const {
      quoteAmountIn,
      quoteAmountOut,
      amountInDecimals,
      amountOutDecimals,
    } = await getLatestQuote(Number(vaultManagerId));
    if (!quoteAmountIn || !quoteAmountOut) throw new Error("Quote not found.");
    if (debt === 0) return;
    const ratio = calculateCollateralizationRatio({
      locked,
      debt,
      quoteAmountIn,
      quoteAmountOut,
      amountInDecimals,
      amountOutDecimals,
    });
    await maybeSendNotification(Number(ratio), vaultManagerId, vaultId);
  } catch (error) {
    console.warn(
      `Unable to fetch the latest quote for managerId: ${vaultManagerId}. Reason: ${error.message}`
    );
  }
}

export async function handleQuote(path, value) {
  const { vaultManagerId, quoteAmountIn, quoteAmountOut } = quoteFromQuoteState(
    path,
    value
  );

  try {
    const { amountInDecimals, amountOutDecimals } = await updateQuote({
      vaultManagerId,
      quoteAmountIn,
      quoteAmountOut,
    });
    const vaults = await getAllVaultsByManagerId(vaultManagerId);
    if (vaults) console.log(`found ${vaults.length} vaults`);

    for (const { locked, debt, vaultId } of vaults) {
      if (debt === 0) continue;
      const ratio = calculateCollateralizationRatio({
        locked,
        debt,
        quoteAmountIn,
        quoteAmountOut,
        amountInDecimals,
        amountOutDecimals,
      });
      await maybeSendNotification(ratio, vaultManagerId, vaultId);
    }
  } catch (error) {
    console.warn(
      `Unable to process quote update for: ${vaultManagerId}. Reason: ${error.message}`
    );
  }
}

export async function handleVbankAssets(_path, value) {
  try {
    const promises = value.map(([_denom, { displayInfo, brand, issuerName }]) =>
      insertOrReplaceBrand({
        issuerName,
        brand: String(brand),
        ...displayInfo,
      })
    );
    await Promise.all(promises);
  } catch (error) {
    console.warn(
      `Unable to process db upserts for vbank assets. Reason: ${error.message}`
    );
  }
}

/**
 * @param {import('../types').Vault['vaultManagerId']} vaultMangerId
 * @param {import('../types').Vault['vaultId']} vaultId
 * @returns {Promise<void>}
 */
export async function stopWatchingVault(vaultManagerId, vaultId) {
  vstorageWatcher.removePath(makeVaultPath(vaultManagerId, vaultId));
  const notifiers = await getNotifiersByVaultId({ vaultId, vaultManagerId });
  for (const { id } of notifiers) {
    await setNotifierExpired(id);
  }
}
