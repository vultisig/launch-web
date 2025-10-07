import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { WagmiProvider } from "wagmi";

import { i18nInstance } from "@/i18n/config";
import { DefaultLayout } from "@/layouts/default";
import { MergePage } from "@/pages/merge";
import { NotFoundPage } from "@/pages/not-found";
import { SettingsPage } from "@/pages/settings";
import { StakingPage } from "@/pages/staking";
import { SwapPage } from "@/pages/swap";
import { AntdProvider } from "@/providers/antd";
import { CoreProvider } from "@/providers/core";
import { StyledProvider } from "@/providers/styled";
import { routeTree } from "@/utils/routes";
import { wagmiConfig } from "@/utils/wagmi";

export const App = () => {
  const queryClient = new QueryClient();

  return (
    <I18nextProvider i18n={i18nInstance}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <CoreProvider>
            <StyledProvider>
              <AntdProvider>
                <BrowserRouter>
                  <Routes>
                    <Route
                      path={routeTree.root.path}
                      element={<DefaultLayout />}
                    >
                      <Route
                        element={<Navigate to={routeTree.swap.path} replace />}
                        index
                      />
                      <Route
                        element={
                          <Navigate to={routeTree.stakingStake.path} replace />
                        }
                        path={routeTree.staking.path}
                      />
                      <Route
                        element={<SwapPage />}
                        path={routeTree.swap.path}
                      />
                      <Route
                        element={<StakingPage />}
                        path={routeTree.stakingStake.path}
                      />
                      <Route
                        element={<StakingPage />}
                        path={routeTree.stakingWithdraw.path}
                      />
                      <Route
                        element={<MergePage />}
                        path={routeTree.merge.path}
                      />
                      <Route
                        element={<SettingsPage />}
                        path={routeTree.settings.path}
                      />
                    </Route>
                    <Route
                      path={routeTree.notFound.path}
                      element={<NotFoundPage />}
                    />
                  </Routes>
                </BrowserRouter>
              </AntdProvider>
            </StyledProvider>
          </CoreProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </I18nextProvider>
  );
};
