import { makeVstorageWatcher } from "./services/rpc.js";
import {
  getUniqueVaultManagerIds,
  getUniqueVaultManagerAndVaultIds,
  db,
} from "./services/db/index.js";
import {
  makeVaultPath,
  makeQuotePath,
  makeVbankAssetPath,
} from "./utils/vstoragePaths.js";
import {
  handleQuote,
  handleVault,
  handleVbankAssets,
} from "./services/followers.js";

let vstorageWatcher;

/** @returns {Promise<import('./services/rpc.js').VstorageWatcher>} */
export async function initVstorageWatcher() {
  if (!db) throw new Error("db not yet initialized");
  const [managerIds, vaultIds] = await Promise.all([
    getUniqueVaultManagerIds(),
    getUniqueVaultManagerAndVaultIds(),
  ]);
  if (managerIds.length)
    console.info(`Found ${managerIds.length} quotes from db to follow.`);
  if (vaultIds.length)
    console.info(`Found ${vaultIds.length} vaults from db to follow.`);

  const brands = [[makeVbankAssetPath(), "vbank"]];
  const quotes = managerIds.map((id) => [makeQuotePath(id), "quote"]);
  const vaults = vaultIds.map((ids) => [makeVaultPath(...ids), "vault"]);

  vstorageWatcher = await makeVstorageWatcher(brands, {
    quote: handleQuote,
    vault: handleVault,
    vbank: handleVbankAssets,
  });
  vstorageWatcher.watchPaths(quotes);
  vstorageWatcher.watchPaths(vaults);
  return vstorageWatcher;
}

export { vstorageWatcher };
