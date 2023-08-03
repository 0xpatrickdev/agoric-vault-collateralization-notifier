// First, obtain a Hardened JS environment via Endo.
import "@endo/init/pre-remoting.js"; // needed only for the next line
import "@agoric/casting/node-fetch-shim.js"; // needed for Node.js
import "@endo/init";

import {
  iterateLatest,
  makeFollower,
  makeLeader,
  makeCastingSpec,
} from "@agoric/casting";
import { makeMarshal } from "@endo/marshal";
import { getEnvVar } from "../utils/getEnvVar.js";
import {
  makeVbankAssetPath,
  makeVaultPath,
  makeVaultManagerQuotePath,
  makeVaultManagerParamsPath,
} from "../utils/vstoragePaths.js";
// import { makeQueryService } from "../lib/queryService.js";

const { fromCapData } = makeMarshal();

/** @param {string} path published path */
export const makeVstorageFollower = (path) => {
  const leader = makeLeader(getEnvVar("NETWORK_CONFIG_URL"));
  const castingSpec = makeCastingSpec(`:${path}`);
  const follower = makeFollower(castingSpec, leader);
  return iterateLatest(follower);
};

export const makeVaultFollower = (managerId, vaultId) =>
  makeVstorageFollower(makeVaultPath(managerId, vaultId));

export const makeQuoteFollower = (managerId) =>
  makeVstorageFollower(makeVaultManagerQuotePath(managerId));

export const makeVaultManagerParamsFollower = (managerId) =>
  makeVstorageFollower(makeVaultManagerParamsPath(managerId));

export const makeVbankAssetFollower = () =>
  makeVstorageFollower(makeVbankAssetPath());

export const getRpcAddress = async () => {
  const response = await fetch(getEnvVar("NETWORK_CONFIG_URL"), {
    headers: { accept: "application/json" },
  });
  const networkConfig = await response.json();
  if (!networkConfig?.rpcAddrs?.[0])
    throw new Error("Error fetching network config");
  return networkConfig.rpcAddrs[0];
};
