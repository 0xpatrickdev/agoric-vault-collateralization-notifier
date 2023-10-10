import { db } from "./index.js";

/**
 * @param {Omit<import('../../types.js').Notifier, "id"| "active" | "expired">} notifier - The notifier to create.
 * @returns {Promise<import('../../types.js').Notifier|Error>} - The created notifier.
 */
export async function createNotifier(notifier) {
  return new Promise((resolve, reject) => {
    const { userId, vaultManagerId, vaultId, collateralizationRatio } =
      notifier;

    db.run(
      `INSERT INTO Notifiers (userId, vaultManagerId, vaultId, collateralizationRatio)
       VALUES (?, ?, ?, ?)`,
      [userId, vaultManagerId, vaultId, collateralizationRatio],
      function (err) {
        if (err) return reject(err);
        db.get(
          `SELECT * FROM Notifiers WHERE id = ?`,
          this.lastID,
          (err, row) => {
            if (err) return reject(err);
            resolve(row);
          }
        );
      }
    );
  });
}

/**
 * checks if user owns Notifier then deletes it
 * @param {object} args
 * @param {number} args.notifierId id of notifier to delete
 * @param {number} args.userId user's id
 * @returns {Promise<{success: boolean, vaultId: number, vaultManagerId: number}>}
 */
export async function deleteNotifier({ notifierId, userId }) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM Notifiers WHERE id = ? AND userId = ?",
      [notifierId, userId],
      (err, row) => {
        if (err) return reject(err);
        if (!row) return reject(new Error("Notifier not found"));
        db.run(
          "DELETE FROM Notifiers WHERE id = ? AND userId = ?",
          [notifierId, userId],
          (err) => {
            if (err) return reject(err);
            resolve({
              success: true,
              vaultId: row.vaultId,
              vaultManagerId: row.vaultManagerId,
            });
          }
        );
      }
    );
  });
}

/**
 * list of all notifiers for a user
 * @param {number} userId
 * @returns {Promise<Array<import('../../types.js').Notifier>>} Array of notifiers
 */
export async function getNotifiersByUser(userId) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM Notifiers WHERE userId = ? ORDER BY collateralizationRatio ASC",
      userId,
      (err, rows) => (err ? reject(err) : resolve(rows))
    );
  });
}

/** @typedef {import('../../types.js').Notifier & { email: string, brand: string }} NotifierWithUserData */

/**
 * Finds all unsent notifiers for a vaultId-vaultManagerId pair below a certain collateralization ratio
 * and includes the email for the relevant user and the outIssuerName from the related Quote.
 *
 * @param {object} opts
 * @param {number} opts.collateralizationRatio - Collateralization ratio
 * @param {number} opts.vaultId - Vault's id
 * @param {number} opts.vaultManagerId - Vault manager's id
 * @returns {Promise<NotifierWithUserData[]>} - Notifiers that meet the criteria with user email and outIssuerName.
 */
export async function getNotifiersByThreshold({
  collateralizationRatio,
  vaultId,
  vaultManagerId,
}) {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT Notifiers.*,
             Users.email AS email,
             Quotes.outIssuerName AS brand
      FROM Notifiers
      INNER JOIN Users ON Notifiers.userId = Users.id
      INNER JOIN Quotes ON Notifiers.vaultManagerId = Quotes.vaultManagerId
      WHERE Notifiers.active = 0
        AND Notifiers.expired = 0
        AND Notifiers.collateralizationRatio >= ?
        AND Notifiers.vaultId = ?
        AND Notifiers.vaultManagerId = ?
      ORDER BY Notifiers.collateralizationRatio DESC
      `,
      [collateralizationRatio, vaultId, vaultManagerId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

/**
 * finds all sent notifiers for a vaultId-vaultManagerId pair below a certain collateralization ratio
 * @param {object} opts
 * @param {number} opts.collateralizationRatio collateralization ratio
 * @param {number} opts.vaultId vault's id
 * @param {number} opts.vaultManagerId vault manager's id
 * @returns {Promise<Array<import('../../types.js').Notifier>>} Notifiers that meet the criteria
 */
export async function getNotifiersToReset({
  collateralizationRatio,
  vaultId,
  vaultManagerId,
}) {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT * FROM Notifiers
      WHERE active = 1
        AND expired = 0
        AND collateralizationRatio < ?
        AND vaultId = ?
        AND vaultManagerId = ?
      ORDER BY collateralizationRatio ASC
      `,
      [collateralizationRatio, vaultId, vaultManagerId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

/**
 * finds all non-expired Notifiers for a vaultId<>vaultManagerId pair
 * @param {object} opts
 * @param {number} opts.vaultId vault's id
 * @param {number} opts.vaultManagerId vault manager's id
 * @returns {Promise<Array<import('../../types.js').Notifier>>} Notifiers that meet the criteria
 */
export async function getNotifiersByVaultId({ vaultId, vaultManagerId }) {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT * FROM Notifiers
      WHERE expired = 0
        AND vaultId = ?
        AND vaultManagerId = ?
      ORDER BY collateralizationRatio ASC
      `,
      [vaultId, vaultManagerId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

/**
 * Marks a Notifier active or inactive.
 * @param {number} id
 * @param {0|1} active
 * @returns {Promise<void>}
 */
export async function updateNotifierStatus(id, active) {
  return new Promise((resolve, reject) => {
    db.run(
      `
        UPDATE Notifiers 
        SET active = ?
        WHERE id = ?
      `,
      [active, id],
      (err) => (err ? reject(err) : resolve())
    );
  });
}

/**
 * Sets a Notifier to expired.
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function setNotifierExpired(id) {
  return new Promise((resolve, reject) => {
    db.run(
      `
        UPDATE Notifiers 
        SET expired = 1
        WHERE id = ?
      `,
      [id],
      (err) => (err ? reject(err) : resolve())
    );
  });
}
