import { db } from "./index.js";

/**
 * list of unique vaultIds
 * @returns {Promise<Array<import('../types').Notifier>} Array of unique pairs of vaultManagerId and vaultId
 */
export async function getUniqueVaultManagerAndVaultIds() {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT DISTINCT vaultManagerId, vaultId FROM Vaults",
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows.map((row) => [row.vaultManagerId, row.vaultId]));
      }
    );
  });
}

/**
 * Insert a quote in the Quotes table.
 * @param {Object} quoteData
 * @param {number} quoteData.vaultManagerId - The vault manager ID (e.g., 0)
 * @param {number} quoteData.quoteAmountIn - The amount in
 * @param {number} quoteData.quoteAmountOut - The amount out
 * @param {string} quoteData.inIssuerName - The amount out
 * @param {string} quoteData.outIssuerName - The amount out
 * @returns {Promise<void>}
 */
export async function insertQuote(quoteData) {
  return new Promise((resolve, reject) => {
    db.run(
      `
        INSERT INTO Quotes 
        (vaultManagerId, quoteAmountIn, quoteAmountOut, inIssuerName, outIssuerName, latestTimestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        quoteData.vaultManagerId,
        quoteData.quoteAmountIn,
        quoteData.quoteAmountOut,
        quoteData.inIssuerName,
        quoteData.outIssuerName,
        new Date().getTime(),
      ],
      (err) => (err ? reject(err) : resolve())
    );
  });
}

/**
 * Retrieve the latest quote for a given manager.
 * @param {number} managerId - The manager ID.
 * @returns {Promise<{ amountIn: number, amountOut: number }>} The latest quote.
 */
export function getLatestQuote(managerId) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT 1 FROM Quotes WHERE vaultManagerId = ?",
      [managerId],
      (err, row) => {
        if (err) return reject(err);
        if (!row)
          return reject(
            new Error(`No quotes found for managerId ${managerId}`)
          );
        resolve(row);
      }
    );
  });
}

/**
 * Check if a quote exists based on managerId.
 * @param {number} managerId - The manager ID.
 * @returns {Promise<boolean>} True if the vault exists, false otherwise.
 */
export function checkQuoteExists(managerId) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT 1 FROM Quotes WHERE vaultManagerId = ?",
      [managerId],
      (err, row) => {
        if (err) return reject(err);
        resolve(!!row);
      }
    );
  });
}

/**
 * Update the quoteAmountIn and quoteAmountOut for a specific vaultManagerId in the Quotes table.
 * @param {object} opts
 * @param {number} opts.vaultManagerId - The vault manager ID (e.g., 0)
 * @param {number} opts.quoteAmountIn
 * @param {number} opts.quoteAmountOut
 * @returns {Promise<void>}
 */
export async function updateQuote({
  vaultManagerId,
  quoteAmountIn,
  quoteAmountOut,
}) {
  return new Promise((resolve, reject) => {
    db.run(
      `
        UPDATE Quotes 
        SET quoteAmountIn = ?, quoteAmountOut = ?, latestTimestamp = ?
        WHERE vaultManagerId = ?
      `,
      [quoteAmountIn, quoteAmountOut, new Date().getTime(), vaultManagerId],
      (err) => (err ? reject(err) : resolve())
    );
  });
}
