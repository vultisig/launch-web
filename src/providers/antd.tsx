import { ConfigProvider, theme, ThemeConfig } from "antd";
import { FC, ReactNode, useMemo } from "react";
import { useTheme } from "styled-components";

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
  const colors = useTheme();

  const themeConfig: ThemeConfig = useMemo(() => {
    return {
      algorithm: algorithm[theme],
      components: {
        Anchor: {
          colorSplit: colors.borderLight.toHex(),
          linkPaddingBlock: 0,
          linkPaddingInlineStart: 0,
        },
        Button: {
          colorBgContainer: colors.bgTertiary.toHex(),
          colorBorder: colors.borderNormal.toHex(),
          borderColorDisabled: colors.bgTertiary.toHex(),
          colorBgContainerDisabled: colors.bgTertiary.toHex(),
        },
        DatePicker: {
          activeBorderColor: colors.borderNormal.toHex(),
          activeShadow: "none",
          hoverBorderColor: colors.borderNormal.toHex(),
        },
        Dropdown: {
          fontSize: 16,
          fontSizeSM: 20,
          paddingBlock: 8,
        },
        Divider: {
          colorSplit: colors.borderNormal.toHex(),
        },
        Drawer: {
          colorBgElevated: colors.bgSecondary.toHex(),
          colorSplit: colors.borderNormal.toHex(),
        },
        Input: {
          activeBorderColor: colors.borderNormal.toHex(),
          activeShadow: "none",
          colorBgContainer: colors.bgSecondary.toHex(),
          colorBorder: colors.borderNormal.toHex(),
          hoverBorderColor: colors.borderNormal.toHex(),
        },
        InputNumber: {
          activeBorderColor: colors.borderNormal.toHex(),
          activeShadow: "none",
          colorBgContainer: colors.bgSecondary.toHex(),
          colorBorder: colors.borderNormal.toHex(),
          hoverBorderColor: colors.borderNormal.toHex(),
        },
        Layout: {
          bodyBg: "transparent",
          footerBg: colors.bgSecondary.toHex(),
          footerPadding: 0,
          headerBg: colors.bgSecondary.toHex(),
          headerPadding: 0,
        },
        Menu: {
          colorBgContainer: "transparent",
          colorSplit: "transparent",
          itemPaddingInline: 0,
        },
        Message: {
          contentBg: colors.bgTertiary.toHex(),
        },
        Modal: {
          contentBg: colors.bgPrimary.toHex(),
          headerBg: "transparent",
        },
        Popover: {
          colorBgElevated: colors.bgSecondary.toHex(),
        },
        Radio: {
          wrapperMarginInlineEnd: 0,
        },
        Rate: {
          starColor: colors.warning.toHex(),
          starSize: 16,
          marginXS: 2,
        },
        Select: {
          activeBorderColor: colors.borderNormal.toHex(),
          activeOutlineColor: "transparent",
          hoverBorderColor: colors.borderNormal.toHex(),
          optionLineHeight: 2,
          optionPadding: "4px 12px",
        },
        Table: {
          borderColor: colors.borderLight.toHex(),
          headerBg: colors.bgTertiary.toHex(),
          headerSplitColor: colors.borderNormal.toHex(),
        },
        Tabs: {
          horizontalItemGutter: 0,
          horizontalItemPadding: "0",
          horizontalMargin: "0",
          inkBarColor: colors.accentFour.toHex(),
          itemHoverColor: colors.accentFour.toHex(),
          itemSelectedColor: colors.accentFour.toHex(),
        },
        Tooltip: {
          colorBgSpotlight: colors.bgTertiary.toHex(),
        },
      },
      token: {
        borderRadius: 10,
        colorBgBase: colors.bgPrimary.toHex(),
        colorBgContainer: colors.bgPrimary.toHex(),
        colorBgElevated: colors.bgSecondary.toHex(),
        colorBorder: colors.borderLight.toHex(),
        colorSplit: colors.borderNormal.toHex(),
        colorBorderSecondary: colors.borderNormal.toHex(),
        colorPrimary: colors.accentFour.toHex(),
        colorWarning: colors.warning.toHex(),
        colorLinkHover: "inherit",
        colorLink: colors.textPrimary.toHex(),
        fontFamily: "inherit",
      },
    };
  }, [theme]);

  return <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>;
};
