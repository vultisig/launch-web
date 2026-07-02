import { Layout, Menu } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import MediaQuery from "react-responsive";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { createGlobalStyle, useTheme } from "styled-components";
import { formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { mainnet } from "wagmi/chains";

import { ConnectModal } from "@/components/ConnectModal";
import { MiddleTruncate } from "@/components/MiddleTruncate";
import { WalletDrawer } from "@/components/WalletDrawer";
import { useCore } from "@/hooks/useCore";
import { ArrowDownUpIcon } from "@/icons/ArrowDownUpIcon";
import { ChartPieIcon } from "@/icons/ChartPieIcon";
import { Button } from "@/toolkits/Button";
import { HStack, Stack, VStack } from "@/toolkits/Stack";
import { modalHash } from "@/utils/constants";
import { RouteKey, routeTree } from "@/utils/routes";

const { Footer, Header } = Layout;
const VULT_CONTRACT = "0xb788144df611029c60b859df47e79b7726c4deba" as const;
const tokenAbi = [{
  type: "function",
  name: "balanceOf",
  stateMutability: "view",
  inputs: [{ name: "account", type: "address" }],
  outputs: [{ name: "", type: "uint256" }],
}] as const;

type NavItem = {
  href: string;
  icon: FC;
  key: RouteKey;
  title: string;
};

export const DefaultLayout = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentPage } = useCore();
  const { address = "", isConnected } = useAccount();
  const { data: rawVultBalance, isLoading: vultBalanceLoading } = useReadContract({
    address: VULT_CONTRACT,
    abi: tokenAbi,
    chainId: mainnet.id,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });
  const vultBalance = rawVultBalance === undefined
    ? 0
    : Number(formatUnits(rawVultBalance, 18));
  const colors = useTheme();

  const menu: NavItem[] = [
    {
      href: routeTree.features.path,
      icon: ChartPieIcon,
      key: "features",
      title: "Features",
    },
    {
      href: routeTree.swap.path,
      icon: ArrowDownUpIcon,
      key: "swap",
      title: t("swap"),
    },
  ];

  return (
    <>
      <Stack as={Layout} $style={{ alignItems: "center", minHeight: "100vh" }}>
        <HStack
          as={Header}
          $style={{
            alignItems: "center",
            borderBottomColor: colors.borderLight.toHex(),
            borderBottomStyle: "solid",
            borderBottomWidth: "1px",
            gap: "32px",
            height: "68px",
            justifyContent: "space-between",
            padding: "0 16px",
            position: "sticky",
            top: "0",
            width: "100%",
            zIndex: "2",
          }}
        >
          <HStack
            as={Link}
            to={routeTree.features.path}
            $style={{ alignItems: "center", gap: "8px" }}
          >
            <Stack
              as="img"
              alt="Vultisig"
              src="/logo.svg"
              $style={{ height: "28px" }}
            />
            <Stack
              as="span"
              $style={{
                fontSize: "24px",
                fontWeight: "600",
                lineHeight: "28px",
              }}
            >
              Vultisig
            </Stack>
          </HStack>
          <MediaQuery minWidth={768}>
            <Stack
              as={Menu}
              items={menu.map(({ key, title }) => ({
                key,
                label: (
                  <span style={{ display: "block", padding: "0 12px" }}>
                    {title}
                  </span>
                ),
              }))}
              mode="horizontal"
              onClick={({ key }) => {
                const item = menu.find((entry) => entry.key === key);
                if (item) navigate(item.href);
              }}
              selectedKeys={[currentPage]}
              $style={{ flexGrow: "1" }}
            />
          </MediaQuery>
          {isConnected ? (
            <Button href={modalHash.wallet}>
              <MiddleTruncate $style={{ textAlign: "center", width: "110px" }}>
                {address}
              </MiddleTruncate>
              <MediaQuery minWidth={768}>
                <Stack
                  as="span"
                  $style={{ fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap" }}
                >
                  {vultBalanceLoading
                    ? "Checking VULT…"
                    : `${vultBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} VULT`}
                </Stack>
              </MediaQuery>
            </Button>
          ) : (
            <Button href={modalHash.connect}>{t("connectWallet")}</Button>
          )}
        </HStack>
        <Outlet />
        <MediaQuery maxWidth={767}>
          <HStack
            as={Footer}
            $style={{
              borderTopColor: colors.borderLight.toHex(),
              borderTopStyle: "solid",
              borderTopWidth: "1px",
              bottom: "0",
              position: "sticky",
              width: "100%",
              zIndex: "2",
            }}
          >
            {menu.map(({ href, icon, key, title }) => (
              <VStack
                as={Link}
                key={key}
                to={href}
                $style={{
                  alignItems: "center",
                  color: colors.textTertiary.toHex(),
                  gap: "4px",
                  padding: "8px 0 12px",
                  width: "100%",
                }}
                $hover={{ color: colors.textPrimary.toHex() }}
              >
                <Stack
                  as={icon}
                  $style={{
                    borderRadius: "8px",
                    fontSize: "32px",
                    padding: "6px",
                    ...(key === currentPage
                      ? {
                          backgroundColor: colors.bgPrimary.toHex(),
                          color: colors.accentFour.toHex(),
                        }
                      : {}),
                  }}
                />
                <Stack
                  as="span"
                  $style={{
                    ...(key === currentPage
                      ? { color: colors.textPrimary.toHex() }
                      : {}),
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  {title}
                </Stack>
              </VStack>
            ))}
          </HStack>
        </MediaQuery>
      </Stack>
      <ConnectModal />
      <WalletDrawer />
      <GlobalStyle />
    </>
  );
};

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${({ theme }) => theme.bgPrimary.toHex()};
    color: ${({ theme }) => theme.textPrimary.toHex()};
  }
`;
