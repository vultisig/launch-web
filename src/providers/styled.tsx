import { FC, ReactNode } from "react";
import { ThemeProvider } from "styled-components";

import { useCore } from "@/hooks/useCore";
import { themes } from "@/utils/styled";

export const StyledProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { theme } = useCore();

  return <ThemeProvider theme={themes[theme]}>{children}</ThemeProvider>;
};
