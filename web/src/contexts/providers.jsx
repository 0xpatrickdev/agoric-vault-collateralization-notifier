import { ChainContextProvider } from "./chain";
import { NetworkContextProvider } from "./network";
import { WalletContextProvider } from "./wallet";
import { AuthContextProvider } from "./auth";

const ContextProviders = ({ children }) => (
  <NetworkContextProvider>
    <WalletContextProvider>
      <AuthContextProvider>
        <ChainContextProvider>{children}</ChainContextProvider>
      </AuthContextProvider>
    </WalletContextProvider>
  </NetworkContextProvider>
);

export { ContextProviders };
