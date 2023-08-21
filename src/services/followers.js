import {
  getNotifiersByThreshold,
  getAllVaultsByManagerId,
  updateQuote,
  getLatestQuote,
  insertOrUpdateVault,
} from "./db/index.js";
import { managerIdFromPath, vaultIdFromPath } from "../utils/vstoragePaths.js";

/**
 * @param {object} params - The calculated collateralization ratio.
 * @param {number} params.locked
 * @param {number} params.debt
 * @param {number} params.quoteAmountIn
 * @param {number} params.quoteAmountOut
 * @returns {number} ratio rounded to nearest percent
 */
export const calculateCollateralizationRatio = ({
  locked,
  debt,
  quoteAmountIn,
  quoteAmountOut,
}) => {
  return Number(
    ((BigInt(locked) * BigInt(quoteAmountOut)) /
      BigInt(quoteAmountIn) /
      BigInt(debt)) *
      100n
  );
};

/**
 * Logic to handle notifications based on collateralization ratio.
 * @param {number} collateralizationRatio - The calculated collateralization ratio.
 * @param {number} managerId - The manager ID for context.
 * @param {number} vaultId - The vault ID for context.
 * @returns {Promise<void>}
 */
export async function maybeSendNotification(
  collateralizationRatio,
  vaultManagerId,
  vaultId
) {
  if (typeof collateralizationRatio !== "number")
    return console.error(`Invalid ratio provided ${collateralizationRatio}`);
  const notifiers = await getNotifiersByThreshold({
    collateralizationRatio,
    vaultManagerId,
    vaultId,
  });

  for (const notifier of notifiers) {
    // @todo call email api
    // @todo mark Notifier as "sent" so we don't send it again
    console.log(
      `Sending notification to userId: ${notifier.userId} for managerId: ${vaultManagerId} and vaultId: ${vaultId}`
    );
  }

  // @todo check for notifiers that "cleared the threshold". We need to mark them as "unsent"
}

export async function handleVault(path, vaultData) {
  const { locked: _locked, debtSnapshot, vaultState } = vaultData;
  const vaultManagerId = managerIdFromPath(path);
  const vaultId = vaultIdFromPath(path);
  const locked = Number(_locked.value);
  const debt = Number(debtSnapshot.debt.value);
  try {
    await insertOrUpdateVault({
      vaultId,
      vaultManagerId,
      locked,
      debt,
      state: vaultState,
    });
  } catch (e) {
    console.warn("error updating vault", e.message);
  }

  if (vaultState === "closed" || vaultState === "liquidated") {
    console.log(`Skipping vault with state: ${vaultState}`);
    return;
  }

  try {
    const { quoteAmountIn, quoteAmountOut } = await getLatestQuote(
      vaultManagerId
    );
    if (!quoteAmountIn || !quoteAmountOut) throw new Error('Quote not found.')
    const ratio = calculateCollateralizationRatio({
      locked,
      debt,
      quoteAmountIn,
      quoteAmountOut,
    });
    await maybeSendNotification(Number(ratio), vaultManagerId, vaultId);
  } catch (error) {
    console.warn(
      `Unable to fetch the latest quote for managerId: ${vaultManagerId}. Reason: ${error.message}`
    );
  }
}

export async function handleQuote(path, value) {
  const { amountIn, amountOut } = value.quoteAmount.value[0];
  const vaultManagerId = managerIdFromPath(path);
  const quoteAmountIn = Number(amountIn.value);
  const quoteAmountOut = Number(amountOut.value);

  try {
    await updateQuote({ vaultManagerId, quoteAmountIn, quoteAmountOut });
    const vaults = await getAllVaultsByManagerId(vaultManagerId);
    if (vaults) console.log(`found ${vaults.length} vaults`);

    for (const { locked, debt, vaultId } of vaults) {
      const ratio = calculateCollateralizationRatio({
        locked,
        debt,
        quoteAmountIn,
        quoteAmountOut,
      });
      await maybeSendNotification(ratio, vaultManagerId, vaultId);
    }
  } catch (error) {
    console.warn(
      `Unable to process quote update for: ${vaultManagerId}. Reason: ${error.message}`
    );
  }
}
