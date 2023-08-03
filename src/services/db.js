import fs from "fs";
import path from "path";
import sqlite from "sqlite3";
import { getEnvVar } from "../utils/getEnvVar.js";

/** @type {import('sqlite3'.Database|undefined)} */
let db;

/** @returns {Promise<import('sqlite3').Database>} - A promise that resolves when the database has been initialized. */
export const initDb = () => {
  const DB_PATH = path.join(process.cwd(), getEnvVar("DB_PATH"));

  // create directory if it doesn't exist
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  sqlite.verbose();
  db = new sqlite.Database(DB_PATH);
  return db;
};

export const resetDb = () => {
  const DB_PATH = path.join(process.cwd(), getEnvVar("DB_PATH"));
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
};

/**
 * creates Users and Notifer tables if they do not exist
 * @param {import('sqlite3').Database} db - The SQLite database connection.
 * @returns {Promise<import('sqlite3').Database>} - A promise that resolves when the database has been set up.
 */
export const setupDb = async () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        token TEXT,
        tokenExpiry INTEGER,
        verified INTEGER CHECK(verified IN (0, 1))
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS Notifier (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        vaultManagerId INTEGER,
        vaultId INTEGER,
        collateralizationRatio REAL,
        FOREIGN KEY(userId) REFERENCES Users(id)
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS Brands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        issuerName TEXT UNIQUE,
        assetKind TEXT CHECK(assetKind IN ('nat', 'set', 'copy_set', 'copy_bag')),
        decimalPlaces INTEGER
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS VaultManagerQuotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vaultManagerId INTEGER UNIQUE,
        quoteAmountIn REAL,
        quoteAmountOut REAL,
        quoteBrandIn INTEGER,
        quoteBrandOut INTEGER,
        timestamp INTEGER,
        FOREIGN KEY(quoteBrandIn) REFERENCES Brands(id),
        FOREIGN KEY(quoteBrandOut) REFERENCES Brands(id)
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS FollowerNotifierMapping (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        followerId INTEGER,
        notifierId INTEGER,
        FOREIGN KEY(followerId) REFERENCES VaultManagerQuotes(id),
        FOREIGN KEY(notifierId) REFERENCES Notifier(id)
      );
    `);
  });
  return db;
};

/**
 * @param {import('sqlite3').Database} db - The SQLite database connection.
 * @returns {Promise<void>} - A promise that resolves when the database has been torn down.
 */
export async function teardownDb() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

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
    db.all("SELECT * FROM Notifier WHERE userId = ?", userId, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/**
 * @param {import('../types').Notifier} notifier - The notifier to create.
 * @returns {Promise<import('../types').Notifier|Error>} - The created notifier.
 */
export async function createNotifier(notifier) {
  return new Promise((resolve, reject) => {
    const { userId, vaultManagerId, vaultId, collateralizationRatio } =
      notifier;

    db.run(
      `INSERT INTO Notifier (userId, vaultManagerId, vaultId, collateralizationRatio)
       VALUES (?, ?, ?, ?)`,
      [userId, vaultManagerId, vaultId, collateralizationRatio],
      function (err) {
        if (err) return reject(err);
        db.get(
          `SELECT * FROM Notifier WHERE id = ?`,
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
export async function deleteNotifier(notifierId, userId) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM Notifier WHERE id = ? AND userId = ?",
      [notifierId, userId],
      (err, row) => {
        if (err) return reject(err);
        if (!row) return reject(new Error("Notifier not found"));
        db.run(
          "DELETE FROM Notifier WHERE id = ? AND userId = ?",
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
 * @description for testing purposes only
 * @returns {Promise<Array<import('../types').User>|Error>} array of users or error
 */
export async function getAllUsers() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM users", (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/**
 * list of all notifiers (testing only?)
 * @returns {Promise<Array<import('../types').Notifier>} Array of notifiers
 */
export async function getNotifiers() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM Notifier", (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/**
 * list of unique vaultManagerIds (collateralTypes)
 * @returns {Promise<Array<import('../types').Notifier>} Array of unique vaultManagerIds
 */
export async function getUniqueVaultManagerIds() {
  return new Promise((resolve, reject) => {
    db.all("SELECT DISTINCT vaultManagerId FROM Notifier", (err, rows) => {
      if (err) return reject(err);
      resolve(rows.map((row) => row.vaultManagerId));
    });
  });
}

/**
 * list of unique vaultIds
 * @returns {Promise<Array<import('../types').Notifier>} Array of unique pairs of vaultManagerId and vaultId
 */
export async function getUniqueVaultManagerAndVaultIds() {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT DISTINCT vaultManagerId, vaultId FROM Notifier",
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows.map((row) => [row.vaultManagerId, row.vaultId]));
      }
    );
  });
}

/**
 * finds all notifiers for a vaultId-vaultManagerId pair below a certain collateralization ratio
 * @param {number} collateralizationRatio collateralization ratio
 * @param {number} vaultId vault's id
 * @param {number} vaultManagerId vault manager's id
 * @returns {Promise<Array<import('../types').Notifier>>} Notifiers that meet the criteria
 */
export async function getNotifiersByThreshold(
  collateralizationRatio,
  vaultId,
  vaultManagerId
) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM Notifier WHERE collateralizationRatio <= ? AND vaultId = ? AND vaultManagerId = ?",
      [collateralizationRatio, vaultId, vaultManagerId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

