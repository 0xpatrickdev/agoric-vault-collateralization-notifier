import { createContext, useCallback, useEffect, useState } from "react";
import { createNotifier, getNotifiers, deleteNotifier } from "../lib/api";
import { useAuth } from "../hooks/auth";
import { useChain } from "../hooks/chain";

export const NotifierContext = createContext();

export const NotifierContextProvider = ({ children }) => {
  /** @type {undefined | [] | Array<import('@shared/types').Notifier>} */
  const [notifiers, setNotifiers] = useState(undefined);
  const [isLoading, setIsLoading] = useState(undefined);
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const { watchVault, vaults, watcher } = useChain();

  /**
   * @param {string} notifierId
   * @returns {Promise<{success: boolean}|Error>}
   */
  const remove = async (notifierId) => {
    try {
      return await deleteNotifier(notifierId);
    } catch (error) {
      throw new Error(error);
    }
  };

  /**
   * @param {object} notifier
   * @param {string} notifier.vaultManagerId
   * @param {string} notifier.vaultId
   * @param {string} notifier.collateralizationRatio
   * @returns {Promise<{success: boolean}|Error>}
   */
  const create = async (notifier) => {
    try {
      return await createNotifier(notifier);
    } catch (error) {
      throw new Error(error);
    }
  };

  /**
   * @param {boolean} refetch ignore cached data and force refetch
   * @returns {Promise<import('@shared/types').Notifiers[]>}
   */
  const fetchNotifiers = useCallback(
    async (refetch = false) => {
      if (!isLoggedIn) return [];
      if (Array.isArray(notifiers) && !refetch) return notifiers;
      try {
        setIsLoading(true);
        const notifiers = await getNotifiers();
        setNotifiers(notifiers);
        return notifiers;
      } catch (e) {
        if (e.message === "Unauthorized") {
          setIsLoggedIn(false);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [notifiers, isLoggedIn, setIsLoggedIn]
  );

  useEffect(() => {
    if (watcher && notifiers?.length) {
      const timer = setTimeout(
        () =>
          notifiers.forEach(({ vaultId, vaultManagerId }) => {
            if (!vaults.find((v) => v.vaultId === String(vaultId))) {
              watchVault(String(vaultManagerId), String(vaultId), false);
            }
          }),
        500
      );
      return () => clearTimeout(timer);
    }
  }, [watcher, notifiers, watchVault, vaults]);

  return (
    <NotifierContext.Provider
      value={{
        fetchNotifiers,
        create,
        remove,
        notifiers,
        isLoading,
      }}
    >
      {children}
    </NotifierContext.Provider>
  );
};
