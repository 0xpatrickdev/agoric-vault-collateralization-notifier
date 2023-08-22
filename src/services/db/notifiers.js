import { db } from "./index.js";

/**
 * @param {import('../../types').Notifier} notifier - The notifier to create.
 * @returns {Promise<import('../../types').Notifier|Error>} - The created notifier.
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
 * @param {string} notifierId id of notifier to delete
 * @param {string} userId user's id
 * @returns {Promise<unknown|Error>} user
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
            resolve(`Notifier with id: ${notifierId} was deleted.`);
          }
        );
      }
    );
  });
}

/**
 * list of all notifiers for a user
 * @returns {Promise<Array<import('../../types').Notifier>} Array of notifiers
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

/**
 * finds all unsent notifiers for a vaultId-vaultManagerId pair below a certain collateralization ratio
 * @param {object} opts
 * @param {number} opts.collateralizationRatio collateralization ratio
 * @param {number} opts.vaultId vault's id
 * @param {number} opts.vaultManagerId vault manager's id
 * @returns {Promise<Array<import('../../types').Notifier>>} Notifiers that meet the criteria
 */
export async function getNotifiersByThreshold({
  collateralizationRatio,
  vaultId,
  vaultManagerId,
}) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM Notifiers WHERE active = 0 AND expired = 0 AND collateralizationRatio >= ? AND vaultId = ? AND vaultManagerId = ? ORDER BY collateralizationRatio ASC",
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
 * @returns {Promise<Array<import('../../types').Notifier>>} Notifiers that meet the criteria
 */
export async function getNotifiersToReset({
  collateralizationRatio,
  vaultId,
  vaultManagerId,
}) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM Notifiers WHERE active = 1 AND expired = 0 AND collateralizationRatio < ? AND vaultId = ? AND vaultManagerId = ? ORDER BY collateralizationRatio ASC",
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
 * @returns {Promise<Array<import('../../types').Notifier>>} Notifiers that meet the criteria
 */
export async function getNotifiersByVaultId({ vaultId, vaultManagerId }) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM Notifiers WHERE expired = 0 AND vaultId = ? AND vaultManagerId = ? ORDER BY collateralizationRatio ASC",
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
