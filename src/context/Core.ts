import { MessageInstance } from "antd/es/message/interface";
import { HookAPI } from "antd/es/modal/useModal";
import { createContext } from "react";

import { setCurrency } from "@/storage/currency";
import { setLanguage } from "@/storage/language";
import { setTheme } from "@/storage/theme";
import { Currency } from "@/utils/currency";
import { Language } from "@/utils/language";
import { RouteKey } from "@/utils/routes";
import { Theme } from "@/utils/theme";
import { Tokens } from "@/utils/types";

type CoreContextType = {
  currency: Currency;
  currentPage: RouteKey;
  language: Language;
  message: MessageInstance;
  modal: HookAPI;
  setCurrency: typeof setCurrency;
  setCurrentPage: (currentPage: RouteKey) => void;
  setLanguage: typeof setLanguage;
  setTheme: typeof setTheme;
  theme: Theme;
  tokens: Tokens;
  updateWallet: () => void;
  updating: boolean;
};

export const CoreContext = createContext<CoreContextType | undefined>(
  undefined
);
