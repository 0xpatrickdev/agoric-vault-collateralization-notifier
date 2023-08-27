import { createContext, useContext, useEffect, useState } from "react";
import { AgoricChainStoragePathKind as Kind } from "@agoric/rpc";
import isEqual from "lodash/isEqual";
import { useNetwork } from "./network";

const ChainContext = createContext();

export const ChainContextProvider = ({ children }) => {
  const paths = new Set();
  const stoppers = new Array();
  const { watcher, chainName } = useNetwork();
  const [currChainName, setCurrChainName] = useState(undefined);
  const [brands, setBrands] = useState([]);
  const [managerIds, setManagerIds] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [vaults, setVaults] = useState([]);

  useEffect(() => {
    if (currChainName !== chainName) {
      setCurrChainName(chainName);
      setBrands([]);
      setManagerIds([]);
      setQuotes({});
      setVaults([]);
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
    for (const id of managerIds) {
      if (!quotes[id]) {
        watcher.watchLatest(
          [Kind.Data, `published.vaultFactory.managers.${id}.quotes`],
          (data) => {
            if (isEqual(data, quotes[id])) return;
            setQuotes((curr) => Object.assign({}, curr, { [id]: data }));
          }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managerIds]);

  const watchVault = (managerId, vaultId) => {
    if (!vaults.find((x) => x.id === vaultId && x.managerId === managerId)) {
      watcher.watchLatest(
        [
          Kind.Data,
          `published.vaultFactory.managers.${managerId}.vaults.${vaultId}`,
        ],
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
