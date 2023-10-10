import { db } from "./index.js";

/**
 * @param {Omit<import('../../types.js').User, 'id'>} user
 * @returns {Promise<number>} number of rows inserted or updated
 * @throws error if user not found
 */
export async function addOrUpdateUser({ email, token, tokenExpiry, verified }) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO Users (email, token, tokenExpiry, verified) 
      VALUES (?, ?, ?, ?) 
      ON CONFLICT(email) 
      DO UPDATE SET token = excluded.token, tokenExpiry = excluded.tokenExpiry, verified = excluded.verified`,
      [email, token, tokenExpiry, verified],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      }
    );
  });
}

/**
 * @param {import('../../types.js').User['token']} token access token
 * @returns {Promise<import('../../types.js').User>} user
 * @throws error if user not found
 */
export async function getUserByToken(token) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE token = ?", token, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

/**
 * @param {import('../../types.js').User['id']} id userId
 * @returns {Promise<import('../../types.js').User>} user
 * @throws error if user not found
 */
export async function getUserById(id) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE id = ?", id, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

/**
 * marks user as verified and removes token, tokenExpiry
 * @param {import('../../types.js').User['id']} id userId
 * @returns {Promise<void>} user
 * @throws error if user not found
 */
export async function markUserVerified(id) {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE users SET verified = 1, token = NULL, tokenExpiry = NULL WHERE id = ?",
      id,
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

/**
 * @param {string} userId user's id
 * @returns {Promise<import('../../types.js').Notifier[]>} list of a user's notifiers
 * @throws error if user not found
 */
export async function getNotifersByUser(userId) {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM Notifiers WHERE userId = ?", userId, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}
