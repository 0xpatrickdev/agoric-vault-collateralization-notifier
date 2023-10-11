import { db } from "./index.js";

/**
 * @param {import('../../types.js').Notification} notification - The notification to create.
 * @returns {Promise<import('../../types.js').Notification>} - The created notifier.
 */
export async function createNotification(notification) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO Notifications (userId, vaultManagerId, vaultId, collateralizationRatio, collateralizationRatioActual, notifierId, sentAt, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        notification.userId,
        notification.vaultManagerId,
        notification.vaultId,
        notification.collateralizationRatio,
        notification.collateralizationRatioActual,
        notification.notifierId,
        notification.sentAt,
        notification.message,
      ],
      function (err) {
        if (err) return reject(err);
        db.get(
          `SELECT * FROM Notifications WHERE id = ?`,
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
 * Get a list of notifiers by userId, ordered by sentAt (most recent first).
 *
 * @param {number} userId - The ID of the user to fetch notifiers for.
 * @returns {Promise<import('../../types.js').Notification[]>} - An array of notifications for the user.
 */
export async function getNotificationsByUserId(userId) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM Notifications WHERE userId = ? ORDER BY sentAt DESC`,
      [userId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}
