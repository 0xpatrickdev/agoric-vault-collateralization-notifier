export const makeVbankAssetPath = () => `published.agoricNames.vbankAsset`;

export const makeBrandsPath = () => `published.agoricNames.brand`;

/** @param {string|number} managerId @param {string|number} vaultId */
export const makeVaultPath = (managerId, vaultId) =>
  `published.vaultFactory.managers.manager${managerId}.vaults.vault${vaultId}`;

/** @param {string|number} managerId */
export const makeQuotePath = (managerId) =>
  `published.vaultFactory.managers.manager${managerId}.quotes`;

/** @param {string|number} managerId */
export const makeGovParamsPath = (managerId) =>
  `published.vaultFactory.managers.manager${managerId}.governance`;

/** @param {string} path */
export const rpcPath = (path) => `/custom/vstorage/data/${path}`;

/** @param {string} path */
export const managerIdFromPath = (path) =>
  Number(path.split("managers.")[1].split(".")[0].slice(7));

/** @param {string} path */
export const vaultIdFromPath = (path) =>
  Number(path.split("vaults.")[1].split(".")[0].slice(5));

/**
 * @param {string} path
 * @param {any} vaultData // @todo get type from @agoric/inter-protocol
 * @returns {import('../types.js').Vault} */
export const vaultFromVaultState = (path, vaultData) => {
  const { locked: _locked, debtSnapshot, vaultState } = vaultData;
  return {
    vaultId: vaultIdFromPath(path),
    vaultManagerId: managerIdFromPath(path),
    locked: Number(_locked.value),
    debt: Number(debtSnapshot.debt.value),
    state: vaultState,
  };
};

/** 
 * @param {string} path
 * @param {any} quoteData // @todo get type from @agoric/inter
 * @returns {Omit<import('../types.js').Quote, "inIssuerName" | "outIssuerName" | "latestTimestamp">} */
export const quoteFromQuoteState = (path, quoteData) => {
  const { amountIn, amountOut } = quoteData.quoteAmount.value[0];
  return {
    vaultManagerId: managerIdFromPath(path),
    quoteAmountIn: Number(amountIn.value),
    quoteAmountOut: Number(amountOut.value),
  };
};
