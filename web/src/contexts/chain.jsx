import { createContext, useEffect, useMemo, useState } from "react";
import { AgoricChainStoragePathKind as Kind } from "@agoric/rpc";
import { addRatios } from "@agoric/zoe/src/contractSupport";
import isEqual from "lodash/isEqual";
import {
  vaultIdFromPath,
  managerIdFromPath,
  makeVaultPath,
} from "../lib/vstoragePaths";
import { useNetwork } from "../hooks/network";
import { useWallet } from "../hooks/wallet";
import { brandToString } from "../utils/brandToString";
import { displayPrice } from "../utils/formatters";
import { ratioToDisplayPercent } from "../utils/ratioToDisplayPercent";

export const ChainContext = createContext();

export const ChainContextProvider = ({ children }) => {
  const paths = new Set();
  const stoppers = new Array();
  const { watcher, chainName } = useNetwork();
  const [currChainName, setCurrChainName] = useState(undefined);
  const [brands, setBrands] = useState([]);
  const [managerBrands, setManagerBrands] = useState({});
  const [managerGovParams, setManagerGovParams] = useState({});
  const [managerIds, setManagerIds] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [vaults, setVaults] = useState([]);
  const [vaultIds, setVaultIds] = useState({});
  const [userVaultMap, setUserVaultMap] = useState({});
  const { walletAddress } = useWallet();
  const [currWalletAddress, setCurrWalletAddress] = useState(undefined);

  useEffect(() => {
    if (currChainName !== chainName) {
      setCurrChainName(chainName);
      setBrands([]);
      setManagerIds([]);
      setQuotes({});
      setVaults([]);
      setVaultIds({});
      setUserVaultMap({});
      setCurrWalletAddress(undefined);
      setManagerGovParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainName]);

  const watchPath = (kind, path, handler) => {
    if (!paths.has(path)) {
      paths.add(path);
      stoppers.push(watcher.watchLatest([kind, path], handler));
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
    if (watcher && walletAddress && walletAddress !== currWalletAddress) {
      setCurrWalletAddress(walletAddress);
      watchPath(
        Kind.Data,
        `published.wallet.${walletAddress}.current`,
        ({ offerToPublicSubscriberPaths }) => {
          const vaults = offerToPublicSubscriberPaths.reduce((acc, curr) => {
            const [_offerId, { vault }] = curr;
            if (vault) {
              const vaultId = `vault${vaultIdFromPath(vault)}`;
              const managerId = `manager${managerIdFromPath(vault)}`;
              watchVault(managerId.slice(7), vaultId.slice(5), true); // effect
              if (!acc[managerId]) acc[managerId] = [vaultId];
              else acc[managerId].push(vaultId);
              return acc;
            }
            return acc;
          }, {});
          setUserVaultMap(vaults);
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watcher, walletAddress]);

  useEffect(() => {
    for (const id of managerIds) {
      if (!quotes[id]) {
        watcher.watchLatest(
          [Kind.Data, `published.vaultFactory.managers.${id}.quotes`],
          (data) => {
            if (isEqual(data, quotes[id])) return;
            const formattedQuote = Object.assign({}, data, {
              displayPrice: displayPrice(data.quoteAmount.value[0], 2, brands),
            });
            setQuotes((curr) =>
              Object.assign({}, curr, { [id]: formattedQuote })
            );
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
            const brand = brandToString(data.retainedCollateral.brand);
            if (isEqual(brand, managerBrands[id])) return;
            setManagerBrands((curr) =>
              Object.assign({}, curr, { [id]: brand })
            );
          }
        );
        watcher.watchLatest(
          [Kind.Data, `published.vaultFactory.managers.${id}.governance`],
          (data) => {
            if (isEqual(data.current, managerGovParams[id])) return;
            setManagerGovParams((curr) =>
              Object.assign({}, curr, {
                [id]: Object.assign({}, data.current, {
                  liquidationRatio: ratioToDisplayPercent(
                    data.current.LiquidationMargin.value
                  ),
                  minimumCollateralRatio: ratioToDisplayPercent(
                    addRatios(
                      data.current.LiquidationMargin.value,
                      data.current.LiquidationPadding.value
                    )
                  ),
                }),
              })
            );
          }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managerIds]);

  const watchVault = (managerId, vaultId, owned) => {
    if (
      !vaults.find((x) => x.vaultId === vaultId && x.managerId === managerId)
    ) {
      watcher.watchLatest(
        [Kind.Data, makeVaultPath(managerId, vaultId)],
        (data) => {
          setVaults((currVaults) => {
            const currentIdx = currVaults.findIndex(
              (x) => x.vaultId === vaultId && x.managerId === managerId
            );
            if (currentIdx >= 0) {
              const {
                vaultId,
                managerId,
                owned: _owned,
                ...rest
              } = currVaults[currentIdx];
              if (isEqual(data, rest)) return currVaults;
              const updatedVaults = [...currVaults];
              updatedVaults[currentIdx] = {
                ...data,
                vaultId,
                managerId,
                owned: !!owned,
              };
              return updatedVaults;
            } else {
              return [
                ...currVaults,
                { ...data, vaultId, managerId, owned: !!owned },
              ];
            }
          });
        }
      );
    }
  };

  const vaultManagerOpts = useMemo(
    () =>
      Object.entries(managerBrands)
        .map(([managerKey, brand]) => ({
          managerKey,
          managerId: managerKey.slice(7),
          brand,
        }))
        .filter(({ managerKey }) => vaultIds[managerKey]?.length > 0),
    [managerBrands, vaultIds]
  );

  const vaultOptsMap = useMemo(
    () =>
      Object.keys(vaultIds).reduce((optsMap, managerId) => {
        optsMap[managerId] = vaultIds[managerId]
          .map((vaultId) => ({
            managerKey: managerId,
            managerId: managerId.slice(7),
            vaultKey: vaultId,
            vaultId: vaultId.slice(5),
            brand: managerBrands[managerId],
            owned: !!(
              userVaultMap[managerId] &&
              userVaultMap[managerId].includes(vaultId)
            ),
          }))
          .sort((a, b) => {
            if (a.owned !== b.owned) return a.owned ? -1 : 1;
            return Number(a.vaultId) - Number(b.vaultId);
          });
        return optsMap;
      }, {}),
    [vaultIds, managerBrands, userVaultMap]
  );

  const userVaults = useMemo(
    () => vaults.filter((vault) => vault.owned),
    [vaults]
  );

  return (
    <ChainContext.Provider
      value={{
        brands,
        quotes,
        vaults,
        watchVault,
        managerBrands,
        vaultManagerOpts,
        vaultOptsMap,
        userVaults,
        watcher,
        managerGovParams,
      }}
    >
      {children}
    </ChainContext.Provider>
  );
};
