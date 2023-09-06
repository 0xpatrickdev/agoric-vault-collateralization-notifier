import { displayAmount, displayPrice } from "./formatters";
import { calculateCollateralizationRatio } from "./vaultMath";

export const getFormattedVault = (vault, brands, quotes) => {
  const quote = quotes[`manager${vault.managerId}`];
  const collateralBrand = vault?.locked?.brand
    ?.toString()
    ?.split("Alleged: ")[1]
    ?.split(" brand")[0];
  const collateralAmountDisplay = vault?.locked
    ? displayAmount(vault.locked, brands)
    : null;
  const collateralValueDisplay = quote?.quoteAmount
    ? displayPrice(quote.quoteAmount.value[0], 2, brands, vault?.locked?.value)
    : null;
  const debtAmountDisplay = vault?.debtSnapshot?.debt
    ? displayAmount(vault.debtSnapshot.debt, brands)
    : null;
  const oraclePrice = quote?.displayPrice;

  const collateralizationRatio = `${calculateCollateralizationRatio({
    locked: vault?.locked?.value,
    debt: vault?.debtSnapshot?.debt?.value,
    quoteAmountIn: quote?.quoteAmount?.value?.[0]?.amountIn?.value,
    quoteAmountOut: quote?.quoteAmount?.value?.[0]?.amountOut?.value,
  })}%`;

  return {
    collateralBrand,
    collateralAmountDisplay,
    oraclePrice,
    collateralValueDisplay,
    debtAmountDisplay,
    collateralizationRatio,
  };
};
