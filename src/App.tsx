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
              Layout: {
                bodyBg: backgroundPrimary,
              },
              Modal: {
                contentBg: backgroundSecondary,
                headerBg: backgroundSecondary,
              },
              Tabs: {
                colorBorderSecondary: borderNormal,
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
