import { storageKeys } from "@/storage/constants";
import { getState } from "@/storage/state/get";
import { setState } from "@/storage/state/set";
import { Currency, defaultCurrency } from "@/utils/currency";

export const getCurrency = () => {
  return getState(storageKeys.currency, defaultCurrency);
};

export const setCurrency = (currency: Currency) => {
  setState(storageKeys.currency, currency);
};
