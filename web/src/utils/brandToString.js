/**
 * @param {string | object} brand
 * @returns {string}
 */
export const brandToString = (brand) =>
  String(brand)?.split("Alleged: ")?.[1]?.split(" brand")?.[0];
