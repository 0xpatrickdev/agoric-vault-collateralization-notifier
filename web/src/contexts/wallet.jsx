import { createContext, useContext, useState } from "react";
import { useNetwork } from "./network";
import { suggestChain } from "../lib/suggestChain";
import { getNetConfigUrl } from "../lib/getNetworkConfig";

const WalletContext = createContext();

export const WalletContextProvider = ({ children }) => {
  const { netName } = useNetwork();
  const [wallet, setWallet] = useState(undefined);

  const connectWallet = async () => {
    const { chainId } = await suggestChain(getNetConfigUrl(netName));
    if (chainId) {
      await window.keplr.enable(chainId);
      const offlineSigner = window.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();
      setWallet(accounts[0]);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWallet = () => {
  return useContext(WalletContext);
};
