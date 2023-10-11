import { makeImportContext } from "@agoric/smart-wallet/src/marshal-contexts.js";
import { getEnvVar, getEnvVars } from "../utils/getEnvVar.js";
import { makeAgoricChainStorageWatcher } from "../lib/chainStorageWatcher.js";
import { AgoricChainStoragePathKind } from "../lib/batchQuery.js";

const importContext = makeImportContext();

/** @returns {Promise<{ rpc: string, chainName: string }>}  */
export const getNetworkConfig = async () => {
  if (process.env.NODE_ENV === "test") {
    const [rpc, chainName] = getEnvVars(["TEST_RPC", "TEST_CHAIN_NAME"]);
    return { rpc, chainName };
  }
  const response = await fetch(getEnvVar("NETWORK_CONFIG_URL"), {
    headers: { accept: "application/json" },
  });
  const networkConfig = await response.json();
  if (!networkConfig?.chainName || !networkConfig?.rpcAddrs?.[0])
    throw new Error("Error fetching network config");
  return { rpc: networkConfig.rpcAddrs[0], chainName: networkConfig.chainName };
};

/** @param {{ body: string }} data */
function tryUnmarshal(data) {
  let unmarshalled;
  try {
    unmarshalled = importContext.fromBoard.fromCapData(data);
  } catch (e) {
    // workaround, as unmarshal throws an error "bad board slot null" for quotes query
    /** @param {{ body: string }} value */
    const _unserialize = (value) => {
      return JSON.parse(value.body.slice(1));
    };
    unmarshalled = _unserialize(data);
  }
  return unmarshalled;
}

/**
 * @template T
 * @param {string} path
 * @param {AgoricChainStoragePathKind} [type] default to data
 * @returns {Promise<T>}
 */
export const abciQuery = async (
  path,
  type = AgoricChainStoragePathKind.Data
) => {
  try {
    const { rpc } = await getNetworkConfig();
    const options = {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "abci_query",
        params: { path: `custom/vstorage/${type}/${path}` },
      }),
    };
    const response = await fetch(rpc, options);
    const { result } = await response.json();
    if (!result.response.value) throw new Error(result.response.log);
    const data = JSON.parse(
      Buffer.from(result.response.value, "base64").toString("binary")
    );
    const { values } = JSON.parse(data.value);
    const parsed = tryUnmarshal(JSON.parse(values[values.length - 1]));
    return /** @type {T} */ (parsed);
  } catch (e) {
    throw new Error(e);
  }
};

export const makeBatchQueryWatcher = async () => {
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

/** @typedef {('vault'|'quote'|'vbank')} HandlerType */

/** @typedef {[path: string, HandlerType]} PathHandlerPair */

/**
 * @typedef {Object} VstorageWatcher
 * @property {(path: string, handler: HandlerType) => void} watchPath - new path to watch
 * @property {(paths: PathHandlerPair[]) => void} watchPaths - list of new paths to watch with their handler keys
 * @property {(path: string) => void} removePath - path to stop watching
 * @property {() => string[]} getPaths - list of actively watched vstorage paths
 */

/**
 * @param {[path: string, HandlerType][]} initialPaths list of paths to watch along with their handler keys
 * @param {Record<HandlerType, UpdateHandler>} handlers - An object containing handlers for different quote types
 * @param {(path: string, e: string) => void} [errorHandler] callback function rpc path error
 * @returns {Promise<VstorageWatcher>}
 */
export const makeVstorageWatcher = async (
  initialPaths,
  handlers,
  errorHandler
) => {
  let subscriptions = new Map();
  const chainStorageWatcher = await makeBatchQueryWatcher();

  /**
   * @param {string} path
   * @param {string} e */
  const _errorHandler = (path, e) => {
    if (errorHandler && typeof errorHandler === "function") {
      return errorHandler(path, e);
    }
    console.error("Error watching brand price feed", path, e);
  };

  /**
   * @param {string} path
   * @param {HandlerType} type */
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
    getPaths: () => [...subscriptions.keys()],
  };
};
