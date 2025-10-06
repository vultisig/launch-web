import KeyMirror from "keymirror";

import { defaultGasSettings } from "@/utils/constants";
import { GasSettingsProps, TransactionProps } from "@/utils/types";

export const storageKey = KeyMirror({
  GAS_SETTINGS_V1: true,
  TRANSACTIONS: true,
});

export const getStoredGasSettings = (): GasSettingsProps => {
  let settings = defaultGasSettings;

  try {
    const data = localStorage.getItem(storageKey.GAS_SETTINGS_V1);

    if (data) settings = JSON.parse(data);

    return settings;
  } catch {
    return settings;
  }
};

export const setStoredGasSettings = (settings: GasSettingsProps): void => {
  localStorage.setItem(storageKey.GAS_SETTINGS_V1, JSON.stringify(settings));
};

export const getStoredTransaction = (
  address: string,
  hash: string
): TransactionProps | undefined => {
  try {
    const transactions = getStoredTransactions(address);

    return transactions.find((tx) => tx.hash === hash);
  } catch {
    return undefined;
  }
};

export const setStoredTransaction = (
  address: string,
  transaction: TransactionProps
): void => {
  const transactions = getStoredTransactions(address);
  const isUpdate = transactions.some(({ hash }) => hash === transaction.hash);

  if (transactions.length > 0) {
    setStoredTransactions(
      address,
      isUpdate
        ? transactions.map((tx) =>
            tx.hash === transaction.hash ? transaction : tx
          )
        : [transaction, ...transactions]
    );
  }
};

export const getStoredTransactions = (address: string): TransactionProps[] => {
  let transactions: TransactionProps[] = [];

  try {
    const data = localStorage.getItem(storageKey.TRANSACTIONS);

    if (data) {
      const vaults: Record<string, TransactionProps[]> = JSON.parse(data);

      if (vaults[address]) transactions = vaults[address];
    }

    return transactions;
  } catch {
    return transactions;
  }
};

export const setStoredTransactions = (
  address: string,
  transactions: TransactionProps[]
): void => {
  const data = localStorage.getItem(storageKey.TRANSACTIONS);
  let wallets: Record<string, TransactionProps[]>;

  try {
    if (data) {
      wallets = JSON.parse(data);

      wallets[address] = transactions;
    } else {
      wallets = { [address]: transactions };
    }
  } catch {
    wallets = {};
  }

  localStorage.setItem(storageKey.TRANSACTIONS, JSON.stringify(wallets));
};
