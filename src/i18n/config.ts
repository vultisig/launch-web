import i18n from "i18next";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

import { resources } from "@/i18n/resources";
import { defaultLanguage } from "@/utils/language";

const i18nInstance = i18n.use(Backend).use(initReactI18next);

i18nInstance.init({
  resources,
  fallbackLng: defaultLanguage,
  debug: false,
  interpolation: { escapeValue: false },
  returnNull: false,
  returnEmptyString: false,
  parseMissingKeyHandler: (key) => {
    console.warn(`Missing translation key: ${key}`);
    return key;
  },
});

export { i18nInstance };
