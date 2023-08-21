import { makeVstorageWatcher } from "./services/rpc.js";
import {
  getUniqueVaultManagerIds,
  getUniqueVaultManagerAndVaultIds,
  db,
} from "./services/db/index.js";
import { makeVaultPath, makeQuotePath } from "./utils/vstoragePaths.js";
import { handleQuote, handleVault } from "./services/followers.js";

let vstorageWatcher;

/** @returns {Promise<import('./services/rpc.js').VstorageWatcher>} */
export async function initVstorageWatcher() {
  if (!db) throw new Error("db not yet initialized");
  const [managerIds, vaultIds] = await Promise.all([
    getUniqueVaultManagerIds(),
    getUniqueVaultManagerAndVaultIds(),
  ]);

  const quotes = managerIds.map((id) => [makeQuotePath(id), "quote"]);
  const vaults = vaultIds.map((ids) => [makeVaultPath(...ids), "vault"]);

  vstorageWatcher = await makeVstorageWatcher(vaults, {
    quote: handleQuote,
    vault: handleVault,
  });
  vstorageWatcher.watchPaths(quotes);
  return vstorageWatcher;
}

export { vstorageWatcher };
