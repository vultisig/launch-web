export const storageKeys = {
  chain: "chain",
  currency: "currency",
  language: "language",
  theme: "theme",
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];
