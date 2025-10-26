import {
  Drawer,
  Layout,
  Modal,
  Popconfirm,
  Spin,
  Tabs,
  TabsProps,
  Tooltip,
} from "antd";
import { FC, Fragment, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import MediaQuery from "react-responsive";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "styled-components";
import { Connector, useAccount, useConnect, useDisconnect } from "wagmi";

import { MiddleTruncate } from "@/components/MiddleTruncate";
import { useCore } from "@/hooks/useCore";
import { ArrowDownUpIcon } from "@/icons/ArrowDownUpIcon";
import { CopyIcon } from "@/icons/CopyIcon";
import { DatabaseIcon } from "@/icons/DatabaseIcon";
import { PowerIcon } from "@/icons/PowerIcon";
import { RefreshIcon } from "@/icons/RefreshIcon";
import { Button } from "@/toolkits/Button";
import { Divider } from "@/toolkits/Divider";
import { HStack, Stack, VStack } from "@/toolkits/Stack";
import { modalHash } from "@/utils/constants";
import { toAmountFormat, toValueFormat } from "@/utils/functions";
import { RouteKey, routeTree } from "@/utils/routes";

const { Footer, Header } = Layout;

type Menu = {
  href: string;
  icon: FC;
  key: RouteKey;
  title: string;
};

const Connect = () => {
  const { t } = useTranslation();
  const { isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const colors = useTheme();

  const connectorsConfig = [
    {
      name: "WalletConnect",
      icon: "connectors/walletConnect.jpg",
      isShow: true,
    },
    { name: "MetaMask", icon: "connectors/metamask.png", isShow: true },
    { name: "Safe", icon: "", isShow: false },
  ];

  const getConnectorIcon = (name: string) => {
    const config = connectorsConfig.find((c) => c.name === name);
    return config?.icon || "";
  };

  const handleConnect = (connector: Connector) => {
    connect({ connector });
    navigate(-1);
  };

  const open = useMemo(() => {
    return !isConnected && hash === modalHash.connect;
  }, [hash]);

  return (
    <Modal
      closable={false}
      footer={false}
      onCancel={() => navigate(-1)}
      open={open}
      styles={{
        body: { display: "flex", flexDirection: "column", gap: "16px" },
      }}
      title={t("connectWallet")}
      width={360}
    >
      {connectors
        .filter((connector) => {
          const config = connectorsConfig.find(
            (c) => c.name === connector.name
          );
          return config ? config.isShow : true;
        })
        .map((connector) => {
          const icon = connector.icon || getConnectorIcon(connector.name);

          return (
            <HStack
              key={connector.uid}
              onClick={() => handleConnect(connector)}
              $style={{
                alignItems: "center",
                backgroundColor: colors.bgTertiary.toHex(),
                borderColor: colors.borderNormal.toHex(),
                borderRadius: "8px",
                borderStyle: "solid",
                borderWidth: "1px",
                cursor: "pointer",
                fontWeight: "500",
                gap: "8px",
                lineHeight: "32px",
                padding: "12px",
              }}
              $hover={{ borderColor: colors.accentFour.toHex() }}
            >
              {icon ? (
                <Stack
                  as="img"
                  src={icon}
                  alt={connector.name}
                  $style={{
                    borderRadius: "4px",
                    height: "32px",
                    width: "32px",
                  }}
                />
              ) : null}
              {connector.name}
            </HStack>
          );
        })}
    </Modal>
  );
};

const Content = () => {
  const { t } = useTranslation();
  const initialState: { open: boolean } = { open: false };
  const [state, setState] = useState(initialState);
  const { open } = state;
  const { address = "", isConnected } = useAccount();
  const { updateWallet, currency, message, tokens, updating } = useCore();
  const { disconnect } = useDisconnect();
  const { hash, pathname } = useLocation();
  const navigate = useNavigate();
  const colors = useTheme();

  const handleCopy = () => {
    navigator.clipboard
      .writeText(address ?? "")
      .then(() => {
        message.success("Address copied to clipboard");
      })
      .catch(() => {
        message.error("Failed to copy address");
      });
  };

  useEffect(() => {
    if (hash === modalHash.wallet) {
      if (isConnected) {
        setState((prevState) => ({ ...prevState, open: true }));
      } else {
        navigate(pathname, { replace: true });
      }
    } else {
      setState((prevState) => ({ ...prevState, open: false }));
    }
  }, [hash, isConnected]);

  return (
    <Drawer
      closable={false}
      footer={false}
      onClose={() => navigate(-1)}
      open={open}
      styles={{
        body: {
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          padding: "24px 16px",
        },
        header: { padding: "24px 16px" },
      }}
      title={
        <HStack
          $style={{
            alignItems: "center",
            gap: "12px",
            justifyContent: "space-between",
          }}
        >
          <Stack as="span" $style={{ flexGrow: "1" }}>
            {t("connectedWallet")}
          </Stack>
          <Button onClick={updateWallet} ghost>
            <RefreshIcon fontSize={20} />
          </Button>
          <Popconfirm title={t("disconnect")} onConfirm={() => disconnect()}>
            <Button kind="danger" ghost>
              <PowerIcon fontSize={20} />
            </Button>
          </Popconfirm>
        </HStack>
      }
      width={360}
    >
      <HStack
        $style={{
          alignItems: "center",
          gap: "12px",
          justifyContent: "space-between",
        }}
      >
        <Stack
          as="img"
          alt="Avatar"
          src="/avatars/1.png"
          $style={{
            borderRadius: "50%",
            flex: "none",
            height: "32px",
            width: "32px",
          }}
        />
        <MiddleTruncate
          $style={{ flexGrow: "1", fontWeight: "500", overflow: "hidden" }}
        >
          {address}
        </MiddleTruncate>
        <Tooltip title={t("copy")}>
          <Stack
            as={Button}
            onClick={handleCopy}
            $style={{ flex: "none" }}
            ghost
          >
            <CopyIcon fontSize={20} />
          </Stack>
        </Tooltip>
      </HStack>
      <Divider />
      <HStack
        $style={{
          alignItems: "center",
          gap: "8px",
          justifyContent: "space-between",
        }}
      >
        <Stack as="span" $style={{ lineHeight: "32px", fontWeight: "500" }}>
          {t("vaultBalance")}
        </Stack>
        {updating ? (
          <Spin size="small" />
        ) : (
          <Stack
            as="span"
            $style={{
              fontSize: "16px",
              fontWeight: "600",
              lineHeight: "32px",
            }}
          >
            {toValueFormat(
              Object.values(tokens).reduce(
                (accumulator, { balance, value }) =>
                  accumulator + balance * value,
                0
              ),
              currency
            )}
          </Stack>
        )}
      </HStack>
      {Object.values(tokens).map(({ balance, name, ticker, value }) => (
        <Fragment key={ticker}>
          <Divider />
          <HStack $style={{ gap: "8px" }}>
            <Stack
              as="img"
              alt={ticker}
              src={`/tokens/${ticker.toLowerCase()}.svg`}
              $style={{ height: "32px", width: "32px" }}
            />
            <VStack $style={{ gap: "2px", flexGrow: "1" }}>
              <Stack as="span" $style={{ fontSize: "16px", fontWeight: "600" }}>
                {ticker}
              </Stack>
              <Stack as="span" $style={{ color: colors.textTertiary.toHex() }}>
                {name}
              </Stack>
            </VStack>
            {updating ? (
              <Spin size="small" />
            ) : (
              <VStack $style={{ alignItems: "flex-end", gap: "2px" }}>
                <Stack
                  as="span"
                  $style={{ fontSize: "16px", fontWeight: "600" }}
                >
                  {toValueFormat(balance * value, currency)}
                </Stack>
                <Stack
                  as="span"
                  $style={{ color: colors.textSecondary.toHex() }}
                >{`${toAmountFormat(balance)} ${ticker}`}</Stack>
              </VStack>
            )}
          </HStack>
        </Fragment>
      ))}
    </Drawer>
  );
};

export const DefaultLayout = () => {
  const { t } = useTranslation();
  const { currentPage } = useCore();
  const { address = "", isConnected } = useAccount();
  const colors = useTheme();

  const menu: Menu[] = [
    {
      href: routeTree.swap.path,
      icon: ArrowDownUpIcon,
      key: "swap",
      title: t("swap"),
    },
    {
      href: routeTree.pool.path,
      icon: DatabaseIcon,
      key: "pool",
      title: t("pool"),
    },
  ];

  const items: TabsProps["items"] = menu.map(({ href, key, title }) => ({
    key,
    label: <Link to={href}>{title}</Link>,
  }));

  return (
    <Layout className="default-layout">
      <HStack
        as={Header}
        $style={{
          alignItems: "center",
          backgroundColor: colors.bgSecondary.toHex(),
          borderBottomColor: colors.borderLight.toHex(),
          borderBottomStyle: "solid",
          borderBottomWidth: "1px",
          gap: "32px",
          height: "68px",
          justifyContent: "space-between",
          padding: "0 16px",
          position: "sticky",
          top: "0",
          zIndex: "2",
        }}
      >
        <HStack $style={{ alignItems: "center", gap: "8px" }}>
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
          <Tabs activeKey={currentPage} items={items} />
        </MediaQuery>
        {isConnected ? (
          <Button href={modalHash.wallet}>
            <MiddleTruncate $style={{ textAlign: "center", width: "110px" }}>
              {address}
            </MiddleTruncate>
          </Button>
        ) : (
          <Button href={modalHash.connect}>{t("connectWallet")}</Button>
        )}
      </HStack>
      <Outlet />
      <Connect />
      <MediaQuery maxWidth={767}>
        <HStack
          as={Footer}
          $style={{
            backgroundColor: colors.bgSecondary.toHex(),
            borderTopColor: colors.borderLight.toHex(),
            borderTopStyle: "solid",
            borderTopWidth: "1px",
            bottom: "0",
            padding: "0",
            position: "sticky",
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
      <Content />
    </Layout>
  );
};
