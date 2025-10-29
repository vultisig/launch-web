import { message as Message, Modal } from "antd";
import { FC, ReactNode, useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { CoreContext, CoreContextProps } from "@/context/Core";
import { i18nInstance } from "@/i18n/config";
import { storageKeys } from "@/storage/constants";
import {
  getCurrency,
  setCurrency as setCurrencyStorage,
} from "@/storage/currency";
import {
  getGasSettings,
  setGasSettings as setGasSettingsStorage,
} from "@/storage/gasSettings";
import { useLocalStorageWatcher } from "@/storage/hooks/useLocalStorageWatcher";
import {
  getLanguage,
  setLanguage as setLanguageStorage,
} from "@/storage/language";
import { getTheme, setTheme as setThemeStorage } from "@/storage/theme";
import {
  getTransactions,
  setTransaction,
  setTransactions as setTransactionsStorage,
} from "@/storage/transaction";
import { api } from "@/utils/api";
import { defaultTokens } from "@/utils/constants";
import { Currency } from "@/utils/currency";
import { shallowCloneObject } from "@/utils/functions";
import { Language } from "@/utils/language";
import { RouteKey } from "@/utils/routes";
import { Theme } from "@/utils/theme";
import { GasSettingsProps, TransactionProps } from "@/utils/types";

type StateProps = Pick<
  CoreContextProps,
  | "currency"
  | "currentPage"
  | "gasSettings"
  | "language"
  | "theme"
  | "tokens"
  | "transactions"
  | "updating"
>;

export const CoreProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StateProps>({
    currency: getCurrency(),
    currentPage: "swap",
    gasSettings: getGasSettings(),
    language: getLanguage(),
    theme: getTheme(),
    tokens: shallowCloneObject(defaultTokens),
    transactions: [],
    updating: false,
  });
  const {
    currency,
    currentPage,
    gasSettings,
    language,
    theme,
    tokens,
    transactions,
    updating,
  } = state;
  const [message, messageHolder] = Message.useMessage();
  const [modal, modalHolder] = Modal.useModal();
  const { address } = useAccount();

  const setCurrency = (currency: Currency, fromStorage?: boolean) => {
    if (!fromStorage) setCurrencyStorage(currency);

    setState((prevState) => ({ ...prevState, currency }));
  };

  const setCurrentPage = (currentPage: RouteKey) => {
    setState((prevState) => ({ ...prevState, currentPage }));
  };

  const setGasSettings = (
    gasSettings: GasSettingsProps,
    fromStorage?: boolean
  ) => {
    if (!fromStorage) setGasSettingsStorage(gasSettings);

    setState((prevState) => ({ ...prevState, gasSettings }));
  };

  const setLanguage = (language: Language, fromStorage?: boolean) => {
    if (!fromStorage) setLanguageStorage(language);

    i18nInstance.changeLanguage(language);

    setState((prevState) => ({ ...prevState, language }));
  };

  const setTransactions = (
    address: string,
    transactions: TransactionProps[],
    fromStorage?: boolean
  ) => {
    if (!fromStorage) {
      if (transactions.length === 1) {
        const [transaction] = transactions;

        setTransaction(address, transaction);

        transactions = getTransactions(address);
      } else {
        setTransactionsStorage(address, transactions);
      }
    }

    setState((prevState) => ({ ...prevState, transactions }));
  };

  const setTheme = (theme: Theme, fromStorage?: boolean) => {
    if (!fromStorage) setThemeStorage(theme);

    setState((prevState) => ({ ...prevState, theme }));
  };

  const updateWallet = () => {
    if (address) {
      setState((prevState) => ({
        ...prevState,
        transactions: getTransactions(address),
        updating: true,
      }));

      Promise.all([
        Promise.all(
          Object.values(tokens).map((token) =>
            api
              .balance(
                address,
                token.decimals,
                token.contractAddress,
                token.isNative
              )
              .then((balance) => ({ balance, ticker: token.ticker }))
          )
        ).then((balances) => {
          setState((prevState) => {
            const tokens = shallowCloneObject(prevState.tokens);

            balances.forEach(({ balance, ticker }) => {
              tokens[ticker].balance = balance;
            });

            return { ...prevState, tokens };
          });
        }),
        api
          .values(
            Object.values(tokens).map(({ cmcId }) => cmcId),
            currency
          )
          .then((values) => {
            setState((prevState) => {
              const tokens = shallowCloneObject(prevState.tokens);

              Object.values(tokens).forEach(({ cmcId, ticker, value }) => {
                tokens[ticker].value = values[cmcId] || value;
              });

              return { ...prevState, tokens };
            });
          }),
      ]).then(() => {
        setState((prevState) => ({ ...prevState, updating: false }));
      });
    }
  };

  useLocalStorageWatcher(storageKeys.currency, () => {
    setCurrency(getCurrency(), true);
  });

  useLocalStorageWatcher(storageKeys.gasSettings, () => {
    setGasSettings(getGasSettings(), true);
  });

  useLocalStorageWatcher(storageKeys.language, () => {
    setLanguage(getLanguage(), true);
  });

  useLocalStorageWatcher(storageKeys.theme, () => {
    setTheme(getTheme(), true);
  });

  useLocalStorageWatcher(storageKeys.transactions, () => {
    if (address) setTransactions(address, getTransactions(address), true);
  });

  useEffect(updateWallet, [address, currency]);

  return (
    <CoreContext.Provider
      value={{
        currency,
        currentPage,
        gasSettings,
        language,
        message,
        modal,
        setCurrency,
        setCurrentPage,
        setGasSettings,
        setLanguage,
        setTheme,
        setTransactions,
        theme,
        tokens,
        transactions,
        updateWallet,
        updating,
      }}
    >
      {children}
      {messageHolder}
      {modalHolder}
    </CoreContext.Provider>
  );
};
