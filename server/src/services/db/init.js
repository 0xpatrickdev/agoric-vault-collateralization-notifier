import fs from "fs";
import path from "path";
import sqlite from "sqlite3";
import { getEnvVar } from "../../utils/getEnvVar.js";

/** @type {import('sqlite3').Database} */
let db;

/** @returns {import('sqlite3').Database} */
export const initDb = () => {
  const DB_FILENAME = getEnvVar("DB_PATH");

  let DB_PATH;
  if (DB_FILENAME === ":memory:") {
    DB_PATH = DB_FILENAME;
  } else {
    DB_PATH = path.join(process.cwd(), DB_FILENAME);
    // create directory if fs based and it doesn't exist
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

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
      CREATE TABLE IF NOT EXISTS Notifiers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        vaultManagerId INTEGER,
        vaultId INTEGER,
        collateralizationRatio INTEGER,
        active BOOLEAN DEFAULT 0,
        expired BOOLEAN DEFAULT 0,
        FOREIGN KEY(userId) REFERENCES Users(id),
        FOREIGN KEY(vaultManagerId, vaultId) REFERENCES Vaults(vaultManagerId, vaultId)
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS Brands (
        issuerName TEXT PRIMARY KEY,
        assetKind TEXT CHECK(assetKind IN ('nat', 'set', 'copy_set', 'copy_bag')),
        decimalPlaces INTEGER,
        brand TEXT
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS Quotes (
        vaultManagerId INTEGER PRIMARY KEY,
        quoteAmountIn INTEGER,
        quoteAmountOut INTEGER,
        inIssuerName TEXT,
        outIssuerName TEXT,
        latestTimestamp INTEGER,
        FOREIGN KEY(inIssuerName) REFERENCES Brands(issuerName),
        FOREIGN KEY(outIssuerName) REFERENCES Brands(issuerName)
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS Vaults (
        vaultManagerId INTEGER,
        vaultId INTEGER,
        locked INTEGER,
        debt INTEGER,
        state TEXT CHECK(state IN ('active', 'liquidating', 'liquidated', 'closed')),
        PRIMARY KEY(vaultManagerId, vaultId),
        FOREIGN KEY(vaultManagerId) REFERENCES Quotes(vaultManagerId)
      );
    `);
    db.run(`
    CREATE TABLE IF NOT EXISTS Notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      vaultManagerId INTEGER,
      vaultId INTEGER,
      collateralizationRatio INTEGER,
      collateralizationRatioActual INTEGER,
      notifierId INTEGER,
      sentAt INTEGER,
      message TEXT,
      FOREIGN KEY(userId) REFERENCES Users(id),
      FOREIGN KEY(vaultManagerId, vaultId) REFERENCES Vaults(vaultManagerId, vaultId),
      FOREIGN KEY(notifierId) REFERENCES Notifiers(id)
    );
  `);
  });
  return db;
};

/**
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

export { db };
