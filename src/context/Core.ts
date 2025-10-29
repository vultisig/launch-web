import { MessageInstance } from "antd/es/message/interface";
import { HookAPI } from "antd/es/modal/useModal";
import { createContext } from "react";

import { setCurrency } from "@/storage/currency";
import { setGasSettings } from "@/storage/gasSettings";
import { setLanguage } from "@/storage/language";
import { setTheme } from "@/storage/theme";
import { setTransactions } from "@/storage/transaction";
import { Currency } from "@/utils/currency";
import { Language } from "@/utils/language";
import { RouteKey } from "@/utils/routes";
import { Theme } from "@/utils/theme";
import { GasSettingsProps, Tokens, TransactionProps } from "@/utils/types";

export type CoreContextProps = {
  currency: Currency;
  currentPage: RouteKey;
  gasSettings: GasSettingsProps;
  language: Language;
  message: MessageInstance;
  modal: HookAPI;
  setCurrency: typeof setCurrency;
  setCurrentPage: (currentPage: RouteKey) => void;
  setGasSettings: typeof setGasSettings;
  setLanguage: typeof setLanguage;
  setTheme: typeof setTheme;
  setTransactions: typeof setTransactions;
  theme: Theme;
  tokens: Tokens;
  transactions: TransactionProps[];
  updateWallet: () => void;
  updating: boolean;
};

export const CoreContext = createContext<CoreContextProps | undefined>(
  undefined
);
