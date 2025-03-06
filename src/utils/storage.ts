import KeyMirror from "keymirror";

import { Currency, Language } from "utils/constants";

export const storageKey = KeyMirror({
  CURRENCY: true,
  LANGUAGE: true,
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
