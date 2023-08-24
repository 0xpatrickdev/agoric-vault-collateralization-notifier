/**
 * @todo incorporate decimals logic. This assumes 6 decimals for both assets
 * @param {object} params - The calculated collateralization ratio.
 * @param {number} params.locked
 * @param {number} params.debt
 * @param {number} params.quoteAmountIn
 * @param {number} params.quoteAmountOut
 * @param {boolean} params.bps return ratio in basis points
 * @returns {number} ratio rounded to nearest percent (or basis points)
 */
export const calculateCollateralizationRatio = ({
  locked,
  debt,
  quoteAmountIn,
  quoteAmountOut,
  bps = false,
}) => {
  const factor = bps ? 10_000n : 100n;
  return Number(
    (BigInt(locked) * BigInt(quoteAmountOut) * factor) /
      BigInt(quoteAmountIn) /
      BigInt(debt)
  );
};
