import { stringifyValue } from "@agoric/ui-components";
import { AssetKind, AmountMath } from "@agoric/ertp";
import {
  floorMultiplyBy,
  makeRatioFromAmounts,
} from "@agoric/zoe/src/contractSupport";

/**
 * @param {import('@agoric/ertp/src/types').Brand} brand
 * @param {any[]} brandList
 * @returns {number}
 */
export const getDecimalPlaces = (brand, brandList) =>
  brandList.find((b) => String(b.brand) === String(brand))?.displayInfo
    ?.decimalPlaces;
/**
 *
 * @param {import('@agoric/ertp/src/types').Amount} amount
 * @param {any[]} brandList
 * @param {number} [placesToShow]
 * @param {'usd'|'locale'} [format]
 * @returns {string}
 */
export const displayAmount = (amount, brandList, placesToShow, format) => {
  const decimalPlaces = getDecimalPlaces(amount.brand, brandList);
  const parsed = stringifyValue(
    amount.value,
    AssetKind.NAT,
    decimalPlaces,
    placesToShow
  );

  if (format) {
    const placesShown = parsed.split(".")[1]?.length ?? 0;
    const usdOpts =
      format === "usd" ? { style: "currency", currency: "USD" } : {};

    return new Intl.NumberFormat(navigator.language, {
      minimumFractionDigits: placesShown,
      ...usdOpts,
    }).format(Number(parsed));
  }

  return parsed;
};
/**
 *
 * @param {{ amountIn: import('@agoric/ertp/src/types').Amount<'nat'>, amountOut: import('@agoric/ertp/src/types').Amount<'nat'>, timestamp?: { absValue: bigint }}} price
 * @param {number} placesToShow
 * @param {any[]} brandList
 * @param {bigint} [qty]
 * @returns {string}
 */
export const displayPrice = (price, placesToShow, brandList, qty) => {
  const { amountIn, amountOut } = price;
  const { brand: brandIn } = amountIn;
  const brandInDecimals = getDecimalPlaces(brandIn, brandList);

  const decimals = 10n ** BigInt(brandInDecimals);
  const unitAmountOfBrandIn = AmountMath.make(brandIn, qty ?? decimals);

  const brandOutAmountPerUnitOfBrandIn = floorMultiplyBy(
    unitAmountOfBrandIn,
    makeRatioFromAmounts(amountOut, amountIn)
  );

  return displayAmount(
    brandOutAmountPerUnitOfBrandIn,
    brandList,
    placesToShow,
    "usd"
  );
};
