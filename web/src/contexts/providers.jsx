import { ChainContextProvider } from "./chain";
import { NetworkContextProvider } from "./network";

const ContextProviders = ({ children }) => (
  <NetworkContextProvider>
    <ChainContextProvider>{children}</ChainContextProvider>
  </NetworkContextProvider>
);

export { ContextProviders };
