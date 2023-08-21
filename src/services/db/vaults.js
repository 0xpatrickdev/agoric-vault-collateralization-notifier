import { db } from "./index.js";

/**
 * list of unique vaultManagerIds (collateralTypes)
 * @returns {Promise<Array<import('../types').Notifier>} Array of unique vaultManagerIds
 */
export async function getUniqueVaultManagerIds() {
  return new Promise((resolve, reject) => {
    // db.all("SELECT DISTINCT vaultManagerId FROM Notifiers", (err, rows) => {
    db.all("SELECT DISTINCT vaultManagerId FROM Vaults", (err, rows) => {
      if (err) return reject(err);
      resolve(rows.map((row) => row.vaultManagerId));
    });
  });
}

/**
 * Insert or update a vault's data in the Vaults table.
 * @param {Object} vaultData
 * @param {number} vaultData.vaultManagerId - The vault manager ID
 * @param {number} vaultData.vaultId - The vault ID
 * @param {number} vaultData.locked - The collateral
 * @param {number} vaultData.debt - The debt
 * @param {string} vaultData.state - The state of the vault
 * @returns {Promise<void>}
 */
export async function insertOrUpdateVault(vaultData) {
  return new Promise((resolve, reject) => {
    db.run(
      `
        INSERT OR REPLACE INTO Vaults 
        (vaultManagerId, vaultId, locked, debt, state)
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        vaultData.vaultManagerId,
        vaultData.vaultId,
        vaultData.locked,
        vaultData.debt,
        vaultData.state,
      ],
      (err) => (err ? reject(err) : resolve())
    );
  });
}

/**
 * Check if a vault exists based on manager and vault IDs.
 * @param {number} managerId - The manager ID.
 * @param {number} vaultId - The vault ID.
 * @returns {Promise<boolean>} True if the vault exists, false otherwise.
 */
export function checkVaultExists(managerId, vaultId) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT 1 FROM Vaults WHERE vaultManagerId = ? AND vaultId = ?",
      [managerId, vaultId],
      (err, row) => {
        if (err) return reject(err);
        resolve(!!row);
      }
    );
  });
}

/**
 * Return a list of vaults for a particular asset (managerId)
 * @param {number} managerId - The manager ID.
 * @returns {Promise<Array<import('../../types').Vault>}
 */
export function getAllVaultsByManagerId(managerId) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM Vaults WHERE vaultManagerId = ?",
      [managerId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}
