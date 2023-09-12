/**
 * @param {object} args
 * @param {number} args.amountInDecimals
 * @param {number} args.amountOutDecimals
 * @returns {{ numeratorFactor: bigint, denominatorFactor: bigint}}
 */
const getDecimalFactor = ({ amountInDecimals, amountOutDecimals }) => {
  if (
    !amountInDecimals ||
    !amountOutDecimals ||
    amountInDecimals === 0 ||
    amountOutDecimals === 0
  ) {
    throw new Error("Invalid amountInDecimals or amountOutDecimals provided.");
  }

  let numeratorFactor = 1n,
    denominatorFactor = 1n;
  if (amountOutDecimals === amountInDecimals) {
    denominatorFactor = 1n;
  } else {
    // squared, since we need to adjust both locked and quoteAmountOut
    const factor =
      (10n ** BigInt(Math.abs(amountOutDecimals - amountInDecimals))) ** 2n;
    if (amountOutDecimals > amountInDecimals) {
      denominatorFactor = factor;
    } else {
      numeratorFactor = factor;
    }
  }

  return { numeratorFactor, denominatorFactor };
};

/**
 * @param {object} params
 * @param {number} params.locked
 * @param {number} params.debt
 * @param {number} params.quoteAmountIn
 * @param {number} params.quoteAmountOut
 * @param {number} params.amountInDecimals number of decimals as integer
 * @param {number} params.amountOutDecimals number of decimals as integer
 * @param {boolean} [params.bps] return ratio in basis points
 * @param {boolean} params.asString return ratio as a display string
 * @returns {number|string} ratio rounded to nearest percent (or basis points)
 */
export const calculateCollateralizationRatio = ({
  locked,
  debt,
  quoteAmountIn,
  quoteAmountOut,
  amountInDecimals,
  amountOutDecimals,
  bps = false,
  asString,
}) => {
  if (debt === 0n && locked === 0n) {
    return asString ? "N/A" : new Error("debt must be greater than 0");
  }
  const bpsFactor = bps ? 10_000n : 100n;
  const { numeratorFactor, denominatorFactor } = getDecimalFactor({
    amountInDecimals,
    amountOutDecimals,
  });

  const numerator =
    BigInt(locked) * BigInt(quoteAmountOut) * bpsFactor * numeratorFactor;
  const denominator = denominatorFactor * BigInt(quoteAmountIn) * BigInt(debt);

  const ratio = Number(numerator / denominator);
  return !asString ? ratio : bps ? `${ratio / 100}%` : `${ratio}%`;
};
