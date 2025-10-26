import {
  Drawer,
  Layout,
  message,
  Modal,
  Popconfirm,
  Spin,
  Tabs,
  TabsProps,
  Tooltip,
} from "antd";
import { Fragment, useEffect, useMemo, useState } from "react";
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
import { routeTree } from "@/utils/routes";

const { Footer, Header } = Layout;

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
  const { updateWallet, currency, tokens, updating } = useCore();
  const { disconnect } = useDisconnect();
  const { hash, pathname } = useLocation();
  const [messageApi, messageHolder] = message.useMessage();
  const navigate = useNavigate();
  const colors = useTheme();

  const handleCopy = () => {
    navigator.clipboard
      .writeText(address ?? "")
      .then(() => {
        messageApi.success("Address copied to clipboard");
      })
      .catch(() => {
        messageApi.error("Failed to copy address");
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
    <>
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
                <Stack
                  as="span"
                  $style={{ fontSize: "16px", fontWeight: "600" }}
                >
                  {ticker}
                </Stack>
                <Stack
                  as="span"
                  $style={{ color: colors.textTertiary.toHex() }}
                >
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

      {messageHolder}
    </>
  );
};

export const DefaultLayout = () => {
  const { t } = useTranslation();
  const { currentPage } = useCore();
  const { address = "", isConnected } = useAccount();

  const items: TabsProps["items"] = [
    {
      key: "swap",
      label: <Link to={routeTree.swap.path}>{t("swap")}</Link>,
    },
    {
      key: "pool",
      label: <Link to={routeTree.pool.path}>{t("pool")}</Link>,
    },
  ];

  return (
    <Layout className="default-layout">
      <Header>
        <div className="logo">
          <img src="/logo.svg" alt="Vultisig" className="icon" />
          <span className="name">Vultisig</span>
        </div>
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
      </Header>
      <Outlet />
      <Connect />
      <MediaQuery maxWidth={767}>
        <Footer>
          <Link
            to={routeTree.swap.path}
            className={currentPage === "swap" ? "active" : ""}
          >
            <ArrowDownUpIcon />
            {t("swap")}
          </Link>
          <Link
            to={routeTree.pool.path}
            className={currentPage === "pool" ? "active" : ""}
          >
            <DatabaseIcon />
            {t("pool")}
          </Link>
        </Footer>
      </MediaQuery>
      <Content />
    </Layout>
  );
};
