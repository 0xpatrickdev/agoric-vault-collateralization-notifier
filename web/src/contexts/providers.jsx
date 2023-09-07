import { ChainContextProvider } from "./chain";
import { NetworkContextProvider } from "./network";
import { WalletContextProvider } from "./wallet";
import { AuthContextProvider } from "./auth";
import { NotifierContextProvider } from "./notifiers";

const ContextProviders = ({ children }) => (
  <NetworkContextProvider>
    <WalletContextProvider>
      <AuthContextProvider>
        <ChainContextProvider>
          <NotifierContextProvider>{children}</NotifierContextProvider>
        </ChainContextProvider>
      </AuthContextProvider>
    </WalletContextProvider>
  </NetworkContextProvider>
);

export { ContextProviders };
