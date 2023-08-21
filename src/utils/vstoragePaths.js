export const makeVbankAssetPath = () => `published.agoricNames.vbankAsset`;

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
