import { makeVaultFollower, makeQuoteFollower } from "./rpc";

export const makeQuoteFollower = (vaultManagerId) => {
  let isFollowing = false;
  let iterator = null;
  let lastAmountIn = null;
  let lastAmountOut = null;

  const startFollowing = async () => {
    if (isFollowing) return;
    isFollowing = true;
    iterator = makeQuoteFollower(vaultManagerId)[Symbol.asyncIterator]();

    for await (const value of iterator) {
      // if lastAmountIn !== value.amountIn, or lastAmountOut !== value.amountOut,
      // update local state in this object, and update sql (updateAsset)
    }
  };

  const stopFollowing = () => {
    isFollowing = false;
    if (iterator) {
      iterator.return();
      iterator = null;
    }
  };

  return {
    startFollowing,
    stopFollowing,
  };
};

export const makeVaultFollower = (vaultManagerId, vaultId) => {
  let isFollowing = false;
  let iterator = null;
  let lastLockedValue = null; // qty of ATOM
  let lastDebtValue = null; // qty of IST

  const checkThreshold = (vault) => {
    // query db for vault asset price
    // determine collateralization factor
    // query db for Notifiers <% this collatteralization factor
    // send emails (promise.all)
  };

  const startFollowing = async () => {
    if (isFollowing) return;
    isFollowing = true;
    iterator = makeVaultFollower(vaultManagerId, vaultId)[
      Symbol.asyncIterator
    ]();

    for await (const value of iterator) {
      checkThreshold(vaultManagerId, vaultId, value);
    }
  };

  const stopFollowing = () => {
    isFollowing = false;
    if (iterator) {
      iterator.return();
      iterator = null;
    }
  };

  return {
    startFollowing,
    stopFollowing,
  };
};

/** intendend to be used as a singleton */
export const makeFollowerManager = () => {
  const quoteFollowers = new WeakMap();
  const vaultFollowers = new WeakMap();

  const getFollower = (followersMap, key, createFollowerFunc) => {
    let follower = followersMap.get(key);
    if (!follower) {
      follower = createFollowerFunc(key);
      followersMap.set(key, follower);
    }
    return follower;
  };

  const removeFollower = (followersMap, key) => {
    const follower = followersMap.get(key);
    if (follower) {
      follower.stopFollowing();
      followersMap.delete(key);
    }
  };

  const getQuoteFollower = (vaultManagerId) =>
    getFollower(quoteFollowers, vaultManagerId, makeQuoteFollower);

  const removeQuoteFollower = (vaultManagerId) =>
    removeFollower(quoteFollowers, vaultManagerId);

  const getVaultFollower = (vaultManagerId, vaultId) => {
    const key = `${vaultManagerId}-${vaultId}`;
    return getFollower(vaultFollowers, key, () =>
      makeVaultFollower(vaultManagerId, vaultId)
    );
  };

  const removeVaultFollower = (vaultManagerId, vaultId) => {
    const key = `${vaultManagerId}-${vaultId}`;
    removeFollower(vaultFollowers, key);
  };

  return {
    getQuoteFollower,
    removeQuoteFollower,
    getVaultFollower,
    removeVaultFollower,
  };
};
