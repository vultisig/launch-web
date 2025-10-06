import { storageKeys } from "@/storage/constants";
import { getState } from "@/storage/state/get";
import { setState } from "@/storage/state/set";
import { defaultLanguage, type Language } from "@/utils/language";

export const getLanguage = () => {
  return getState(storageKeys.language, defaultLanguage);
};

export const setLanguage = (language: Language) => {
  setState(storageKeys.language, language);
};
