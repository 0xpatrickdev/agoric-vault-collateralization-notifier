import crypto from "crypto";

/**
 * @param {number} [bytes] number of bytes to generate, defaults to 32
 * @returns {string} random 32 bit hexadecimal string
 */
export function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}
