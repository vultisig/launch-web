import { storageKeys } from "@/storage/constants";
import { getState } from "@/storage/state/get";
import { setState } from "@/storage/state/set";
import { defaultGasSettings } from "@/utils/constants";
import { GasSettingsProps } from "@/utils/types";

export const getGasSettings = () => {
  return getState(storageKeys.gasSettings, defaultGasSettings);
};

export const setGasSettings = (gasSettings: GasSettingsProps) => {
  setState(storageKeys.gasSettings, gasSettings);
};
