import { db } from "./index.js";

/**
 * Insert a brand in the Brands table.
 * @param {Object} brandData
 * @param {string} brandData.issuerName - The name of the brand
 * @param {string} brandData.assetKind - The kind of asset (e.g., 'fungible', 'non-fungible')
 * @param {number} brandData.decimalPlaces - The number of decimal places for the asset
 * @returns {Promise<void>}
 */
export async function insertBrand(brandData) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO Brands (issuerName, assetKind, decimalPlaces) VALUES (?, ?, ?)`,
      [brandData.issuerName, brandData.assetKind, brandData.decimalPlaces],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

/**
 * Check if a brand exists based on issuerName.
 * @param {number} issuerName
 * @returns {Promise<boolean>}
 */
export function checkBrandExists(issuerName) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT 1 FROM Brands WHERE issuerName = ?",
      [issuerName],
      (err, row) => {
        if (err) return reject(err);
        resolve(!!row);
      }
    );
  });
}
