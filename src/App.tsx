import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { WagmiProvider } from "wagmi";

import { i18nInstance } from "@/i18n/config";
import { DefaultLayout } from "@/layouts/Default";
import { ClaimPage } from "@/pages/Claim";
import { NotFoundPage } from "@/pages/NotFound";
import { SwapPage } from "@/pages/Swap";
import { AntdProvider } from "@/providers/antd";
import { CoreProvider } from "@/providers/core";
import { StyledProvider } from "@/providers/styled";
import { routeTree } from "@/utils/routes";
import { wagmiConfig } from "@/utils/wagmi";

export const App = () => {
  const [queryClient] = useState(() => new QueryClient());

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
                        element={<SwapPage />}
                        path={routeTree.swap.path}
                      />
                      <Route
                        element={<ClaimPage />}
                        path={routeTree.claim.path}
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
