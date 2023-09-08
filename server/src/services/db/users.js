import { db } from "./index.js";

/**
 * @param {import('../types').User} user
 * @returns {Promise<number|Error>} number of rows inserted or updated
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
 * @param {import('../types').User.token} token access token
 * @returns {Promise<import('../types').User|Error>} user
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
 * @param {import('../types').User.id} id userId
 * @returns {Promise<import('../types').User|Error>} user
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
 * @param {import('../types').User.id} id userId
 * @returns {Promise<object|Error>} user
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
 * @returns {Promise<import('../types').Notifier[]|Error>} list of a user's notifiers
 */
export async function getNotifersByUser(userId) {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM Notifiers WHERE userId = ?", userId, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}
