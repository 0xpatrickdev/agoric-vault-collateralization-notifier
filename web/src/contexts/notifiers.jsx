import { createContext, useContext, useCallback, useState } from "react";
import {
  createNotifier,
  getNotifiers as getNotifiersReq,
  deleteNotifier,
} from "../lib/api";
import { useAuth } from "../contexts/auth";

const NotifierContext = createContext();

export const NotifierContextProvider = ({ children }) => {
  /** @type {undefined | [] | Array<import('@shared/types').Notifier>} */
  const [notifiers, setNotifiers] = useState(undefined);
  const { isLoggedIn, setIsLoggedIn } = useAuth();

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
  const getNotifiers = useCallback(
    async (refetch = false) => {
      if (!isLoggedIn) return [];
      if (Array.isArray(notifiers) && !refetch) return notifiers;
      try {
        const notifiers = await getNotifiersReq();
        setNotifiers(notifiers);
        return notifiers;
      } catch (e) {
        if (e.message === "Unauthorized") {
          setIsLoggedIn(false);
        }
      }
    },
    [notifiers, isLoggedIn, setIsLoggedIn]
  );

  return (
    <NotifierContext.Provider
      value={{
        getNotifiers,
        create,
        remove,
      }}
    >
      {children}
    </NotifierContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifiers = () => {
  return useContext(NotifierContext);
};
