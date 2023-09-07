/**
 * @todo incorporate decimals logic. This assumes 6 decimals for both assets
 * @param {object} params - The calculated collateralization ratio.
 * @param {number} params.locked
 * @param {number} params.debt
 * @param {number} params.quoteAmountIn
 * @param {number} params.quoteAmountOut
 * @param {boolean} [params.bps] return ratio in basis points
 * @param {boolean} params.asString return ratio as a display string
 * @returns {number|string} ratio rounded to nearest percent (or basis points)
 */
export const calculateCollateralizationRatio = ({
  locked,
  debt,
  quoteAmountIn,
  quoteAmountOut,
  bps = false,
  asString,
}) => {
  const factor = bps ? 10_000n : 100n;
  if (debt === 0n && locked === 0n) {
    return asString ? "N/A" : new Error("debt must be greater than 0");
  }
  const ratio = Number(
    (BigInt(locked) * BigInt(quoteAmountOut) * factor) /
      BigInt(quoteAmountIn) /
      BigInt(debt)
  );
  return !asString ? ratio : bps ? `${ratio / 100}%` : `${ratio}%`;
};
