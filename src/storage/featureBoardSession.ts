import type { Session } from "@/services/featureBoard";
import { storageKeys } from "@/storage/constants";
import { getState } from "@/storage/state/get";
import { setState } from "@/storage/state/set";

export const getFeatureBoardSession = () => {
  const session = getState<Session | null>(storageKeys.featureBoardSession, null);
  return session?.token && session?.address ? session : null;
};

export const setFeatureBoardSession = (session: Session) =>
  setState(storageKeys.featureBoardSession, session);

export const clearFeatureBoardSession = () =>
  localStorage.removeItem(storageKeys.featureBoardSession);
