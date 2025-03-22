import {
  FC,
  ReactNode,
  useState,
  createContext,
  useEffect,
  useContext,
} from "react";
import { useAccount } from "wagmi";

import {
  Currency,
  Language,
  PageKey,
  TickerKey,
  defaultTokens,
} from "utils/constants";
import { TokenProps } from "utils/interfaces";
import {
  getStoredCurrency,
  getStoredLanguage,
  setStoredCurrency,
  setStoredLanguage,
} from "utils/storage";
import i18n from "i18n/config";
import api from "utils/api";

interface BaseContext {
  changeCurrency: (currency: Currency) => void;
  changeLanguage: (language: Language) => void;
  changePage: (language: PageKey) => void;
  updateWallet: () => void;
  activePage: PageKey;
  currency: Currency;
  language: Language;
  tokens: Record<TickerKey, TokenProps>;
  updating: boolean;
}

interface InitialState {
  activePage: PageKey;
  currency: Currency;
  language: Language;
  tokens: Record<TickerKey, TokenProps>;
  updating: boolean;
}

const BaseContext = createContext<BaseContext | undefined>(undefined);

const Component: FC<{ children: ReactNode }> = ({ children }) => {
  const initialState: InitialState = {
    activePage: PageKey.SWAP,
    currency: getStoredCurrency(),
    language: getStoredLanguage(),
    tokens: defaultTokens,
    updating: false,
  };
  const [state, setState] = useState(initialState);
  const { activePage, currency, language, tokens, updating } = state;
  const { address, isConnected } = useAccount();

  const changeCurrency = (currency: Currency): void => {
    setStoredCurrency(currency);

    setState((prevState) => ({ ...prevState, currency }));
  };

  const changeLanguage = (language: Language): void => {
    i18n.changeLanguage(language);

    setStoredLanguage(language);

    setState((prevState) => ({ ...prevState, language }));
  };

  const changePage = (activePage: PageKey): void => {
    setState((prevState) => ({ ...prevState, activePage }));
  };

  const componentDidUpdate = () => {
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
            const tokens = prevState.tokens;

            balances.forEach(({ balance, ticker }) => {
              tokens[ticker].balance = balance;
            });

            return { ...prevState, tokens };
          });
        }),
        api
          .values(
            Object.values(tokens).map(({ cmcId }) => cmcId),
            Currency.USD
          )
          .then((values) => {
            setState((prevState) => {
              const tokens = prevState.tokens;

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

  const componentDidMount = () => {
    i18n.changeLanguage(language);
  };

  useEffect(componentDidUpdate, [address, isConnected]);
  useEffect(componentDidMount, []);

  return (
    <BaseContext.Provider
      value={{
        changeCurrency,
        changeLanguage,
        changePage,
        updateWallet: componentDidUpdate,
        activePage,
        currency,
        language,
        tokens,
        updating,
      }}
    >
      {children}
    </BaseContext.Provider>
  );
};

export default Component;

export const useBaseContext = (): BaseContext => {
  const context = useContext(BaseContext);

  if (!context) {
    throw new Error("useBaseContext must be used within a BaseProvider");
  }

  return context;
};
