export const makeVbankAssetPath = () => `published.agoricNames.vbankAsset`;

export const makeBrandsPath = () => `published.agoricNames.brand`;

export const makeVaultPath = (managerId, vaultId) =>
  `published.vaultFactory.managers.manager${managerId}.vaults.vault${vaultId}`;

export const makeQuotePath = (managerId) =>
  `published.vaultFactory.managers.manager${managerId}.quotes`;

export const makeGovParamsPath = (managerId) =>
  `published.vaultFactory.managers.manager${managerId}.governance`;

export const rpcPath = (path) => `/custom/vstorage/data/${path}`;

export const managerIdFromPath = (path) =>
  Number(path.split("managers.")[1].split(".")[0].slice(7));

export const vaultIdFromPath = (path) =>
  Number(path.split("vaults.")[1].split(".")[0].slice(5));

/** @returns {import('../types').Vault} */
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

/** @returns {import('../types').Quote} */
export const quoteFromQuoteState = (path, quoteData) => {
  const { amountIn, amountOut } = quoteData.quoteAmount.value[0];
  return {
    vaultManagerId: managerIdFromPath(path),
    quoteAmountIn: Number(amountIn.value),
    quoteAmountOut: Number(amountOut.value),
  };
};
