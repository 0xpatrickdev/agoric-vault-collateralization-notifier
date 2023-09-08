import { db } from "./index.js";

/**
 * Insert a brand in the Brands table.
 * @param {Object} brandData
 * @param {string} brandData.issuerName - The name of the brand
 * @param {string} brandData.assetKind - The kind of asset (e.g., 'fungible', 'non-fungible')
 * @param {number} brandData.decimalPlaces - The number of decimal places for the asset
 * @param {number} brandData.brand - String of ERTP brand object
 * @returns {Promise<void>}
 */
export async function insertOrReplaceBrand(brandData) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO Brands (issuerName, assetKind, decimalPlaces, brand) VALUES (?, ?, ?, ?)`,
      [
        brandData.issuerName,
        brandData.assetKind,
        brandData.decimalPlaces,
        brandData.brand,
      ],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

/**
 * Retrieve an issuerName from a brand
 * @param {string} brand
 * @returns {Promise<boolean>}
 */
export function getIssuerNameFromBrand(brand) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM Brands WHERE brand = ?", [brand], (err, row) => {
      if (err) return reject(err);
      resolve(row?.issuerName);
    });
  });
}

