import { createContext, useContext, useEffect, useState } from "react";
import { AgoricChainStoragePathKind as Kind } from "@agoric/rpc";
import isEqual from "lodash/isEqual";
import {
  vaultIdFromPath,
  managerIdFromPath,
  makeVaultPath,
} from "../lib/vstoragePaths";
import { useNetwork } from "./network";
import { useWallet } from "./wallet";

const ChainContext = createContext();

export const ChainContextProvider = ({ children }) => {
  const paths = new Set();
  const stoppers = new Array();
  const { watcher, chainName } = useNetwork();
  const [currChainName, setCurrChainName] = useState(undefined);
  const [brands, setBrands] = useState([]);
  const [managerBrands, setManagerBrands] = useState({});
  const [managerIds, setManagerIds] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [vaults, setVaults] = useState([]);
  const [vaultIds, setVaultIds] = useState({});
  const [userVaults, setUserVaults] = useState({});
  const { wallet } = useWallet();
  const [currWallet, setCurrWallet] = useState(undefined);

  useEffect(() => {
    if (currChainName !== chainName) {
      setCurrChainName(chainName);
      setBrands([]);
      setManagerIds([]);
      setQuotes({});
      setVaults([]);
      setVaultIds({});
      setUserVaults({});
      setCurrWallet(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainName]);

  const watchPath = (kind, path, handler) => {
    // console.log("path", path);
    if (!paths.has(path)) {
      paths.add(path);
      stoppers.push(watcher.watchLatest([kind, path], handler));
      // console.log("new watcher", path);
    }
  };

  useEffect(() => {
    if (watcher && !brands.length) {
      watchPath(Kind.Data, "published.agoricNames.vbankAsset", (data) => {
        const formatted = data.map(([_, d]) => d);
        if (isEqual(formatted, brands)) return;
        setBrands(formatted);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watcher, brands]);

  useEffect(() => {
    if (watcher && !managerIds.length) {
      watchPath(Kind.Children, "published.vaultFactory.managers", (data) => {
        if (isEqual(data, managerIds)) return;
        setManagerIds(data);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watcher, managerIds]);

  useEffect(() => {
    if (watcher && wallet?.address && wallet?.address !== currWallet?.address) {
      setCurrWallet(wallet);
      watchPath(
        Kind.Data,
        `published.wallet.${wallet.address}.current`,
        ({ offerToPublicSubscriberPaths }) => {
          const vaults = offerToPublicSubscriberPaths.reduce((acc, curr) => {
            const [_offerId, { vault }] = curr;
            if (vault) {
              const vaultId = `vault${vaultIdFromPath(vault)}`;
              const managerId = `manager${managerIdFromPath(vault)}`;
              watchVault(managerId.slice(-1), vaultId.slice(-1)); // effect
              if (!acc[managerId]) acc[managerId] = [vaultId];
              else acc[managerId].push(vaultId);
              return acc;
            }
            return acc;
          }, []);
          setUserVaults(vaults);
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watcher, wallet]);

  useEffect(() => {
    for (const id of managerIds) {
      if (!quotes[id]) {
        watcher.watchLatest(
          [Kind.Data, `published.vaultFactory.managers.${id}.quotes`],
          (data) => {
            if (isEqual(data, quotes[id])) return;
            setQuotes((curr) => Object.assign({}, curr, { [id]: data }));
          }
        );
        watcher.watchLatest(
          [Kind.Children, `published.vaultFactory.managers.${id}.vaults`],
          (data) => {
            if (isEqual(data, vaultIds[id])) return;
            setVaultIds((curr) => Object.assign({}, curr, { [id]: data }));
          }
        );
        watcher.watchLatest(
          [Kind.Data, `published.vaultFactory.managers.${id}.metrics`],
          (data) => {
            const { brand } = data.retainedCollateral;
            if (isEqual(brand, managerBrands[id])) return;
            setManagerBrands((curr) =>
              Object.assign({}, curr, { [id]: brand })
            );
          }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managerIds]);

  const watchVault = (managerId, vaultId) => {
    if (!vaults.find((x) => x.id === vaultId && x.managerId === managerId)) {
      watcher.watchLatest(
        [Kind.Data, makeVaultPath(managerId, vaultId)],
        (data) => {
          const currentIdx = vaults.findIndex(
            (x) => x.id === vaultId && x.managerId === managerId
          );
          if (currentIdx >= 0) {
            const { vaultId, managerId, ...rest } = vaults[currentIdx];
            if (isEqual(data, rest)) return;
            const updated = [...vaults];
            updated[currentIdx] = { ...data, vaultId, managerId };
            setVaults(updated);
          } else {
            setVaults((prev) => [...prev, { ...data, vaultId, managerId }]);
          }
        }
      );
    }
  };

  return (
    <ChainContext.Provider
      value={{
        brands,
        quotes,
        managerIds,
        vaults,
        watchVault,
        userVaults,
        vaultIds,
        managerBrands,
      }}
    >
      {children}
    </ChainContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useChain = () => {
  return useContext(ChainContext);
};
