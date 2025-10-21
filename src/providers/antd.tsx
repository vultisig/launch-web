import { ConfigProvider, theme, ThemeConfig } from "antd";
import { FC, ReactNode, useMemo } from "react";

import {
  backgroundPrimary,
  backgroundSecondary,
  backgroundTertiary,
  borderNormal,
  buttonPrimary,
  buttonPrimaryHover,
  buttonSecondary,
  textPrimary,
} from "@/colors";
import { useCore } from "@/hooks/useCore";
import { Theme } from "@/utils/theme";

const algorithm: Record<Theme, ThemeConfig["algorithm"]> = {
  dark: theme.darkAlgorithm,
  light: theme.defaultAlgorithm,
} as const;

export const AntdProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { theme } = useCore();

  const themeConfig: ThemeConfig = useMemo(() => {
    return {
      algorithm: algorithm[theme],
      components: {
        Button: {
          colorBgContainer: backgroundTertiary,
          colorBorder: borderNormal,
          borderColorDisabled: backgroundTertiary,
          colorBgContainerDisabled: backgroundTertiary,
        },
        Divider: {
          colorSplit: borderNormal,
        },
        Drawer: {
          colorBgElevated: backgroundSecondary,
          colorSplit: borderNormal,
        },
        Input: {
          activeBorderColor: buttonSecondary,
          activeShadow: buttonSecondary,
          colorBgContainer: backgroundSecondary,
          colorBorder: borderNormal,
          hoverBorderColor: buttonSecondary,
        },
        InputNumber: {
          activeBorderColor: buttonSecondary,
          activeShadow: buttonSecondary,
          colorBgContainer: backgroundSecondary,
          colorBorder: borderNormal,
          hoverBorderColor: buttonSecondary,
        },
        Layout: {
          bodyBg: backgroundPrimary,
        },
        Message: {
          contentBg: backgroundTertiary,
        },
        Modal: {
          contentBg: backgroundSecondary,
          headerBg: backgroundSecondary,
        },
        Popover: {
          colorBgElevated: backgroundSecondary,
        },
        Tabs: {
          colorBorderSecondary: borderNormal,
          horizontalItemGutter: 0,
          horizontalItemPadding: "0",
          horizontalMargin: "0",
        },
        Tooltip: {
          colorBgSpotlight: backgroundTertiary,
        },
      },
      token: {
        colorLink: textPrimary,
        colorLinkHover: "inherit",
        colorPrimary: buttonPrimary,
        colorPrimaryHover: buttonPrimaryHover,
        fontFamily: "inherit",
      },
    };
  }, [theme]);

  return <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>;
};
