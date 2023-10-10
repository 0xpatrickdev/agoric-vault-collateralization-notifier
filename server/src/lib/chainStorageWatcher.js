/* c8 ignore start */
/* global harden */
import { batchVstorageQuery, keyToPath, pathToKey } from "./batchQuery.js";

const defaults = {
  newPathQueryDelayMs: 20,
  refreshLowerBoundMs: 2000,
  refreshUpperBoundMs: 4000,
};

const randomRefreshPeriod = (refreshLowerBoundMs, refreshUpperBoundMs) =>
  Math.round(Math.random() * (refreshUpperBoundMs - refreshLowerBoundMs)) +
  refreshLowerBoundMs;

const makePathSubscriber = (onUpdate, onError) => ({
  onUpdate,
  onError,
});

/**
 * @callback onErrorCallback
 * @param {Error} error
 */

/**
 * Periodically queries the most recent data from chain storage, batching RPC
 * requests for efficiency.
 * @param {string} rpcAddr RPC server URL
 * @param {string} chainId the chain id to use
 * @param {import('@endo/marshal').FromCapData<string>} unmarshal unserializer to use
 * @param {onErrorCallback} [onError]
 * @param {number} [newPathQueryDelayMs]
 * @param {number} [refreshLowerBoundMs]
 * @param {number} [refreshUpperBoundMs]
 */
export const makeAgoricChainStorageWatcher = (
  rpcAddr,
  chainId,
  unmarshal,
  onError,
  newPathQueryDelayMs = defaults.newPathQueryDelayMs,
  refreshLowerBoundMs = defaults.refreshLowerBoundMs,
  refreshUpperBoundMs = defaults.refreshUpperBoundMs
) => {
  const latestValueCache = new Map();

  const watchedPathsToSubscribers = new Map();
  let isNewPathWatched = false;
  let isQueryInProgress = false;
  let nextQueryTimeout = null;

  const queueNextQuery = () => {
    if (isQueryInProgress || !watchedPathsToSubscribers.size) {
      return;
    }

    if (isNewPathWatched) {
      if (nextQueryTimeout) {
        clearTimeout(nextQueryTimeout);
      }
      nextQueryTimeout = global.setTimeout(queryUpdates, newPathQueryDelayMs);
    } else {
      nextQueryTimeout = global.setTimeout(
        queryUpdates,
        randomRefreshPeriod(refreshLowerBoundMs, refreshUpperBoundMs)
      );
    }
  };

  const queryUpdates = async () => {
    isQueryInProgress = true;
    nextQueryTimeout = null;
    isNewPathWatched = false;

    const paths = [...watchedPathsToSubscribers.keys()].map(keyToPath);

    if (!paths.length) {
      isQueryInProgress = false;
      return;
    }

    try {
      const data = await batchVstorageQuery(rpcAddr, unmarshal, paths);
      watchedPathsToSubscribers.forEach((subscribers, path) => {
        if (!data[path]) return;

        if (data[path].error) {
          subscribers.forEach((s) => {
            if (s.onError) {
              s.onError(harden(data[path].error));
            }
          });
          return;
        }

        const { blockHeight, value } = data[path];
        const lastValue = latestValueCache.get(path);

        if (
          lastValue &&
          (blockHeight === lastValue[0] ||
            (blockHeight === undefined &&
              JSON.stringify(value) === lastValue[0]))
        ) {
          return;
        }

        latestValueCache.set(path, [
          blockHeight ?? JSON.stringify(value),
          value,
        ]);

        subscribers.forEach((s) => {
          s.onUpdate(harden(value));
        });
      });
    } catch (e) {
      onError && onError(e);
    } finally {
      isQueryInProgress = false;
      queueNextQuery();
    }
  };

  const stopWatching = (pathKey, subscriber) => {
    const subscribersForPath = watchedPathsToSubscribers.get(pathKey);
    if (!subscribersForPath?.size) {
      throw new Error(`cannot unsubscribe from unwatched path ${pathKey}`);
    }

    if (subscribersForPath.size === 1) {
      watchedPathsToSubscribers.delete(pathKey);
      latestValueCache.delete(pathKey);
    } else {
      subscribersForPath.delete(subscriber);
    }
  };

  const queueNewPathForQuery = () => {
    if (!isNewPathWatched) {
      isNewPathWatched = true;
      queueNextQuery();
    }
  };

  /**
   *
   * @param {[import('./batchQuery.js').AgoricChainStoragePathKind, string]} path
   * @param {(latestValue: T) => void} onUpdate
   * @param {(log: string) => void} onPathError
   * @returns
   */
  const watchLatest = (path, onUpdate, onPathError) => {
    const pathKey = pathToKey(path);
    const subscriber = makePathSubscriber(onUpdate, onPathError);

    const latestValue = latestValueCache.get(pathKey);
    if (latestValue) {
      subscriber.onUpdate(harden(latestValue[1]));
    }

    const samePathSubscribers = watchedPathsToSubscribers.get(pathKey);
    if (samePathSubscribers !== undefined) {
      samePathSubscribers.add(subscriber);
    } else {
      watchedPathsToSubscribers.set(pathKey, new Set([subscriber]));
      queueNewPathForQuery();
    }

    return () => stopWatching(pathKey, subscriber);
  };

  return {
    watchLatest,
    chainId,
    rpcAddr,
  };
};
/* c8 ignore stop */
