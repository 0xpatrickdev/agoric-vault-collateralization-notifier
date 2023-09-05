import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { makeAgoricChainStorageWatcher } from "@agoric/rpc";
import { getNetworkConfig } from "../lib/getNetworkConfig";

const NetworkContext = createContext();

const getNameName = (netName) =>
  ["local" | "devnet" | "ollinet" | "emerynet" | "main"].includes(netName)
    ? netName
    : "main";

export const NetworkContextProvider = ({ children }) => {
  /** @type {import('@shared/types').NetName} */
  const { network } = useParams();
  const [netName, setNameName] = useState(getNameName(network));
  const [networkConfig, setNetworkConfig] = useState(undefined);
  const [error, setError] = useState(undefined);

  let watcher;
  if (networkConfig) {
    watcher = makeAgoricChainStorageWatcher(
      networkConfig.rpc,
      networkConfig.chainName
    );
  }

  useEffect(() => {
    if (network && network !== netName) {
      const newNetName = getNameName(network);
      if (newNetName !== netName) setNameName(newNetName);
    }
  }, [network, netName]);

  useEffect(() => {
    if (networkConfig?.netName !== netName)
      getNetworkConfig(netName).then(setNetworkConfig).catch(setError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [netName]);

  /**
   * @param {import('@shared/types').NetName} netName
   * @returns {Promise<void>}
   */
  const setNetwork = (netName) =>
    getNetworkConfig(netName)
      .then((newNetConfig) => {
        setNetworkConfig(newNetConfig);
        setNameName(netName);
        watcher = makeAgoricChainStorageWatcher(
          newNetConfig.rpc,
          newNetConfig.chainName
        );
      })
      .catch(setError);

  return (
    <NetworkContext.Provider
      value={{
        netName,
        setNetwork,
        networkConfig,
        watcher,
        error,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNetwork = () => {
  return useContext(NetworkContext);
};
