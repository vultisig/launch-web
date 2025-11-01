import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useGoBack = (): ((path?: string) => void) => {
  const { pathname, state } = useLocation();
  const navigate = useNavigate();

  const goBack = useCallback(
    (path?: string) => {
      if (state) {
        navigate(-1);
      } else if (path) {
        navigate(path);
      } else {
        navigate(pathname, { replace: true });
      }
    },
    [navigate, pathname, state]
  );

  return goBack;
};
