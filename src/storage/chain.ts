import { storageKeys } from "@/storage/constants";
import { getState } from "@/storage/state/get";
import { setState } from "@/storage/state/set";
import { Chain, defaultChain } from "@/utils/chain";

export const getChain = () => {
  return getState(storageKeys.chain, defaultChain);
};

export const setChain = (chain: Chain) => {
  setState(storageKeys.chain, chain);
};
