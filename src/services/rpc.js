import { makeImportContext } from "@agoric/smart-wallet/src/marshal-contexts.js";
import { getEnvVar } from "../utils/getEnvVar.js";
import { makeAgoricChainStorageWatcher } from "../lib/chainStorageWatcher.js";
import { AgoricChainStoragePathKind } from "../lib/batchQuery.js";

const importContext = makeImportContext();

export const getRpcAddress = async () => {
  const response = await fetch(getEnvVar("NETWORK_CONFIG_URL"), {
    headers: { accept: "application/json" },
  });
  const networkConfig = await response.json();
  if (!networkConfig?.rpcAddrs?.[0])
    throw new Error("Error fetching network config");
  return networkConfig.rpcAddrs[0];
};

/** @returns {Promise<{ rpc: string, chainName: string }>}  */
export const getNetworkConfig = async () => {
  const response = await fetch(getEnvVar("NETWORK_CONFIG_URL"), {
    headers: { accept: "application/json" },
  });
  const networkConfig = await response.json();
  if (!networkConfig?.chainName || !networkConfig?.rpcAddrs?.[0])
    throw new Error("Error fetching network config");
  return { rpc: networkConfig.rpcAddrs[0], chainName: networkConfig.chainName };
};

export const getBatchQueryWatcher = async () => {
  const { rpc, chainName } = await getNetworkConfig();
  const watcher = makeAgoricChainStorageWatcher(
    rpc,
    chainName,
    importContext.fromBoard.fromCapData
  );
  return watcher;
};

/**
 * @callback UpdateHandler
 * @param {string} path
 * @param {object} value
 * @returns {void}
 */

/**
 * @typedef {('vault'|'quote')} HandlerType
 */

/**
 * @typedef {Object} VstorageWatcher
 * @property {(path: string, HandlerType) => void} watchPath - new path to watch
 * @property {(paths: [path: string, HandlerType][]) => void} watchPaths - list of new paths to watch with their handler keys
 * @property {(path: string) => void} removePath - path to stop watching
 */

/**
 * @param {[path: string, HandlerType][]} initialPaths list of paths to watch along with their handler keys
 * @param {Object<HandlerType, UpdateHandler>} handlers - An object containing handlers for different quote types
 * @param {(path, e) => void} [errorHandler] callback function rpc path error
 * @returns {Promise<VstorageWatcher>}
 */
export const makeVstorageWatcher = async (
  initialPaths,
  handlers,
  errorHandler
) => {
  let subscriptions = new Map();
  const chainStorageWatcher = await getBatchQueryWatcher();

  const _errorHandler = (path, e) => {
    if (errorHandler && typeof errorHandler === "function") {
      return errorHandler(path, e);
    }
    console.error("Error watching brand price feed", path, e);
  };

  /**
   * @param {string} path
   * @param {HandlerType} */
  const watchPath = (path, type) => {
    if (subscriptions.has(path)) return;
    if (!handlers[type]) return console.error("Handler not found for", type);

    subscriptions.set(
      path,
      chainStorageWatcher.watchLatest(
        [AgoricChainStoragePathKind.Data, path],
        (value) => handlers[type](path, value),
        (e) => _errorHandler(path, e)
      )
    );
  };

  (initialPaths || []).forEach(([path, type]) => watchPath(path, type));

  return {
    watchPath,
    watchPaths: (paths) => paths.forEach(([p, t]) => watchPath(p, t)),
    removePath: (path) => {
      if (subscriptions.has(path)) subscriptions.delete(path);
      // @todo do we need explicitly tell chainStorageWatcher to stop watching?
    },
    getPaths: () => subscriptions.keys(),
  };
};
