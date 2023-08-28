import { ChainContextProvider } from "./chain";
import { NetworkContextProvider } from "./network";
import { WalletContextProvider } from "./wallet";

const ContextProviders = ({ children }) => (
  <NetworkContextProvider>
    <WalletContextProvider>
      <ChainContextProvider>{children}</ChainContextProvider>
    </WalletContextProvider>
  </NetworkContextProvider>
);

export { ContextProviders };
