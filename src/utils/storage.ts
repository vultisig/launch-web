import KeyMirror from "keymirror";

import { DEFAULT_GAS_SETTING, Currency, Language } from "utils/constants";
import { GasSettingsProps, TransactionProps } from "utils/interfaces";

export const storageKey = KeyMirror({
  CURRENCY: true,
  LANGUAGE: true,
  GAS_SETTINGS: true,
  TRANSACTIONS: true,
});

export const getStoredCurrency = (): Currency => {
  switch (localStorage.getItem(storageKey.CURRENCY)) {
    case Currency.AUD:
      return Currency.AUD;
    case Currency.CNY:
      return Currency.CNY;
    case Currency.CAD:
      return Currency.CAD;
    case Currency.EUR:
      return Currency.EUR;
    case Currency.GBP:
      return Currency.GBP;
    case Currency.JPY:
      return Currency.JPY;
    case Currency.RUB:
      return Currency.RUB;
    case Currency.SEK:
      return Currency.SEK;
    case Currency.SGD:
      return Currency.SGD;
    default:
      return Currency.USD;
  }
};

export const setStoredCurrency = (currency: Currency): void => {
  localStorage.setItem(storageKey.CURRENCY, currency);
};

export const getStoredLanguage = (): Language => {
  switch (localStorage.getItem(storageKey.LANGUAGE)) {
    case Language.CROATIA:
      return Language.CROATIA;
    case Language.DUTCH:
      return Language.DUTCH;
    case Language.GERMAN:
      return Language.GERMAN;
    case Language.ITALIAN:
      return Language.ITALIAN;
    case Language.PORTUGUESE:
      return Language.PORTUGUESE;
    case Language.RUSSIAN:
      return Language.RUSSIAN;
    case Language.SPANISH:
      return Language.SPANISH;
    default:
      return Language.ENGLISH;
  }
};

export const setStoredLanguage = (language: Language): void => {
  localStorage.setItem(storageKey.LANGUAGE, language);
};

export const getStoredGasSettings = (): GasSettingsProps => {
  let settings = DEFAULT_GAS_SETTING;
  try {
    const data = localStorage.getItem(storageKey.GAS_SETTINGS);

    if (data) settings = JSON.parse(data);

    return settings;
  } catch {
    return settings;
  }
};

export const setStoredGasSettings = (settings: GasSettingsProps): void => {
  localStorage.setItem(storageKey.GAS_SETTINGS, JSON.stringify(settings));
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
