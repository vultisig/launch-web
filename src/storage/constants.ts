export const storageKeys = {
  chain: "chain",
  currency: "currency",
  gasSettings: "gasSettings",
  language: "language",
  theme: "theme",
  transactions: "transactions",
  claimTransactions: "claimTransactions",
  featureBoardSession: "featureBoardSession",
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];
