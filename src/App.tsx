import { ConfigProvider, theme } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import {
  backgroundPrimary,
  backgroundSecondary,
  backgroundTertiary,
  borderNormal,
  buttonPrimary,
  buttonPrimaryHover,
  buttonSecondary,
} from "colors";
import { config } from "utils/wagmi-config";

import BaseContext from "context";
import Routes from "routes";

const Component = () => {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm,
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
              },
              Tooltip: {
                colorBgSpotlight: backgroundTertiary,
              },
            },
            token: {
              colorPrimary: buttonPrimary,
              colorPrimaryHover: buttonPrimaryHover,
              fontFamily: "inherit",
            },
          }}
        >
          <BaseContext>
            <Routes />
          </BaseContext>
        </ConfigProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Component;
