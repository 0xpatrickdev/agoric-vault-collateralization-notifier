/**
 * @description requests auth token from server, via email
 * @param {string} email
 * @returns {Promise<{success: boolean}|Error>}
 */
export const requestAuthToken = async (email) => {
  const response = await fetch("api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Request failed");
  }

  return response.json();
};

/**
 * @description verifies auth token, and exchanges for JWT token
 * @param {string} token
 * @returns {Promise<{success: boolean}|Error>}
 */
export const verifyAuthToken = async (token) => {
  const response = await fetch("api/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Request failed");
  }

  return response.json();
};

/**
 * @description creates a Notifier for a particular vault
 * @param {object} vault
 * @param {number} vault.vaultId
 * @param {number} vault.vaultManagerId
 * @param {number} vault.collateralizationRatio positive integer, e.g. 235
 * @returns {Promise<{success: boolean}|Error>}
 */
export const createNotifier = async ({
  vaultId,
  vaultManagerId,
  collateralizationRatio,
}) => {
  const response = await fetch("api/notifiers", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ vaultId, vaultManagerId, collateralizationRatio }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Request failed");
  }

  return response.json();
};

/** @returns {Promise<import('@shared/types').Notifier[]>} */
export const getNotifiers = async () => {
  const response = await fetch("api/notifiers", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Request failed");
  }

  return response.json();
};

/**
 * @param {import('@shared/types').Notifier['id']} id
 * @returns {Promise<{success: boolean}|Error>}
 */
export const deleteNotifier = async (id) => {
  const response = await fetch(`api/notifiers/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Request failed");
  }

  return response.json();
};
