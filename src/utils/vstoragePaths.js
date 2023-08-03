export const makeVbankAssetPath = () => `published.agoricNames.vbankAsset`;

export const makeVaultPath = (managerId, vaultId) =>
  `published.vaultFactory.managers.manager${managerId}.vaults.vault${vaultId}`;

export const makeVaultManagerQuotePath = (managerId) =>
  `published.vaultFactory.managers.manager${managerId}.quotes`;

export const makeVaultManagerParamsPath = (managerId) =>
  `published.vaultFactory.managers.manager${managerId}.governance`;

export const rpcPath = (path) => `/custom/vstorage/data/${path}`;
