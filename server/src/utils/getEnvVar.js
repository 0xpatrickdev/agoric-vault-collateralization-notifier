/**
 * @param {import('../types.js').ProcessEnvKey} key environment variable key (process.env[key])
 * @returns {string}
 * @throws {Error} if environment variable is not present
 */
export const getEnvVar = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} not set`);
  return value;
};

/**
 * @param {import('../types.js').ProcessEnvKey[]} keys environment variable keys (process.env[key])
 * @returns {string[]}
 * @throws {Error} if environment variable is not present
 */
export const getEnvVars = (keys) =>
  keys.reduce((acc, curr, i) => {
    acc[i] = getEnvVar(curr);
    return acc;
  }, /** @type {string[]} */ ([]));
