import { createContext, useState } from "react";
import { useNetwork } from "../hooks/network";
import { suggestChain } from "../lib/suggestChain";
import { getNetConfigUrl } from "../lib/getNetworkConfig";

export const WalletContext = createContext();

export const WalletContextProvider = ({ children }) => {
  const { netName } = useNetwork();
  const [walletAddress, setWalletAddress] = useState(() => {
    if (window.localStorage.getItem("walletAddress")) {
      return window.localStorage.getItem("walletAddress");
    }
  });

  const saveAddress = ({ address }) => {
    window.localStorage.setItem("walletAddress", address);
    setWalletAddress(address);
  };

  const connectWallet = async () => {
    const { chainId } = await suggestChain(getNetConfigUrl(netName));
    if (chainId) {
      await window.keplr.enable(chainId);
      const offlineSigner = window.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();
      saveAddress(accounts[0]);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        connectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
