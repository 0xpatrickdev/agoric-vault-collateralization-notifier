import { ChainContextProvider } from "./chain";
import { NetworkContextProvider } from "./network";
import { WalletContextProvider } from "./wallet";
import { AuthContextProvider } from "./auth";
import { NotifierContextProvider } from "./notifiers";

const ContextProviders = ({ children }) => (
  <NetworkContextProvider>
    <WalletContextProvider>
      <AuthContextProvider>
        <NotifierContextProvider>
          <ChainContextProvider>{children}</ChainContextProvider>
        </NotifierContextProvider>
      </AuthContextProvider>
    </WalletContextProvider>
  </NetworkContextProvider>
);

export { ContextProviders };
