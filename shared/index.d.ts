export type SQLBool = 0 | 1;

export interface User {
  id: number;
  email: string;
  token: string | null;
  tokenExpiry: number | null;
  verified: SQLBool;
}

export interface Notifier {
  id: number;
  userId: number;
  vaultManagerId: number;
  vaultId: number;
  collateralizationRatio: number;
  active: SQLBool;
  expired: SQLBool;
}

export interface Brand {
  issuerName: string;
  assetKind: "nat" | "set" | "copy_set" | "copy_bag";
  decimalPlaces: number;
  brand: string;
}

export interface Quote {
  vaultManagerId: number;
  quoteAmountIn: number;
  quoteAmountOut: number;
  inIssuerName: string;
  outIssuerName: string;
  latestTimestamp: number;
}

export interface Vault {
  vaultManagerId: number;
  vaultId: number;
  locked: number;
  debt: number;
  state: "active" | "liquidating" | "liquidated" | "closed";
}

export interface AgoricChainStoragePathKind {
  Children: string;
  Data: string;
}

export type NetName = "local" | "devnet" | "ollinet" | "emerynet" | "main";
