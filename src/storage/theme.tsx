import { storageKeys } from "@/storage/constants";
import { getState } from "@/storage/state/get";
import { setState } from "@/storage/state/set";
import { defaultTheme, Theme } from "@/utils/theme";

export const getTheme = () => {
  return getState(storageKeys.theme, defaultTheme);
};

export const setTheme = (theme: Theme) => {
  setState(storageKeys.theme, theme);
};
