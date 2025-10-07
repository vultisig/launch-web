import { message as Message, Modal } from "antd";
import { FC, ReactNode, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { CoreContext } from "@/context";
import { i18nInstance } from "@/i18n/config";
import { storageKeys } from "@/storage/constants";
import {
  getCurrency,
  setCurrency as setCurrencyStorage,
} from "@/storage/currency";
import { useLocalStorageWatcher } from "@/storage/hooks/useLocalStorageWatcher";
import {
  getLanguage,
  setLanguage as setLanguageStorage,
} from "@/storage/language";
import { getTheme, setTheme as setThemeStorage } from "@/storage/theme";
import { api } from "@/utils/api";
import { defaultTokens } from "@/utils/constants";
import { Currency } from "@/utils/currency";
import { shallowCloneObject } from "@/utils/functions";
import { Language } from "@/utils/language";
import { RouteKey } from "@/utils/routes";
import { Theme } from "@/utils/theme";
import { Tokens } from "@/utils/types";

interface InitialState {
  currency: Currency;
  currentPage: RouteKey;
  language: Language;
  theme: Theme;
  tokens: Tokens;
  updating: boolean;
}

export const CoreProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const initialState: InitialState = useMemo(() => {
    return {
      currency: getCurrency(),
      currentPage: "swap",
      language: getLanguage(),
      theme: getTheme(),
      tokens: shallowCloneObject(defaultTokens),
      updating: false,
    };
  }, []);
  const [state, setState] = useState(initialState);
  const { currency, currentPage, language, theme, tokens, updating } = state;
  const [message, messageHolder] = Message.useMessage();
  const [modal, modalHolder] = Modal.useModal();
  const { address, isConnected } = useAccount();

  const setCurrency = (currency: Currency, fromStorage?: boolean) => {
    if (!fromStorage) setCurrencyStorage(currency);

    setState((prevState) => ({ ...prevState, currency }));
  };

  const setCurrentPage = (currentPage: RouteKey) => {
    setState((prevState) => ({ ...prevState, currentPage }));
  };

  const setLanguage = (language: Language, fromStorage?: boolean) => {
    if (!fromStorage) setLanguageStorage(language);

    i18nInstance.changeLanguage(language);

    setState((prevState) => ({ ...prevState, language }));
  };

  const setTheme = (theme: Theme, fromStorage?: boolean) => {
    if (!fromStorage) setThemeStorage(theme);

    setState((prevState) => ({ ...prevState, theme }));
  };

  const updateWallet = () => {
    if (address) {
      setState((prevState) => ({ ...prevState, updating: true }));

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

  useLocalStorageWatcher(storageKeys.language, () => {
    setLanguage(getLanguage(), true);
  });

  useLocalStorageWatcher(storageKeys.theme, () => {
    setTheme(getTheme(), true);
  });

  useEffect(updateWallet, [address, currency, isConnected]);

  return (
    <CoreContext.Provider
      value={{
        currency,
        currentPage,
        language,
        message,
        modal,
        setCurrency,
        setCurrentPage,
        setLanguage,
        setTheme,
        theme,
        tokens,
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
