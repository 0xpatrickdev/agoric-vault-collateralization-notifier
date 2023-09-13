import { displayAmount, displayPrice, getDecimalPlaces } from "./formatters";
import { calculateCollateralizationRatio } from "./vaultMath";
import { capitalize } from "./capitalize";

export const getFormattedVault = (vault, brands, quotes) => {
  if (!vault || Object.keys(quotes).length === 0) return null;
  const quote = quotes[`manager${vault.managerId}`];
  const collateralBrand = vault?.locked?.brand
    ?.toString()
    ?.split("Alleged: ")[1]
    ?.split(" brand")[0];
  const collateralAmountDisplay = vault?.locked
    ? displayAmount(vault.locked, brands, 2)
    : null;
  const collateralValueDisplay = quote?.quoteAmount
    ? displayPrice(quote.quoteAmount.value[0], 2, brands, vault?.locked?.value)
    : null;
  const debtAmountDisplay = vault?.debtSnapshot?.debt
    ? displayAmount(vault.debtSnapshot.debt, brands, 2)
    : null;
  const oraclePrice = quote?.displayPrice;
  const vaultStatus = capitalize(vault?.vaultState);

  const amountInDecimals = getDecimalPlaces(
    vault?.debtSnapshot?.debt?.brand,
    brands
  );
  const amountOutDecimals = getDecimalPlaces(vault?.locked?.brand, brands);
  const collateralizationRatio = calculateCollateralizationRatio({
    locked: vault?.locked?.value,
    debt: vault?.debtSnapshot?.debt?.value,
    quoteAmountIn: quote?.quoteAmount?.value?.[0]?.amountIn?.value,
    quoteAmountOut: quote?.quoteAmount?.value?.[0]?.amountOut?.value,
    amountOutDecimals,
    amountInDecimals,
    asString: true,
    bps: false,
  });

  return {
    collateralBrand,
    collateralAmountDisplay,
    oraclePrice,
    collateralValueDisplay,
    debtAmountDisplay,
    collateralizationRatio,
    vaultStatus,
  };
};
