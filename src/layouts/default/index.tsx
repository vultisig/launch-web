import {
  Divider,
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
import { FC, Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MediaQuery from "react-responsive";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Connector, useAccount, useConnect, useDisconnect } from "wagmi";

import { MiddleTruncate } from "@/components/MiddleTruncate";
import { useCore } from "@/hooks/useCore";
import {
  ArrowDownUp,
  ArrowRightToLine,
  Copy,
  Database,
  Power,
  RefreshCW,
} from "@/icons";
import { modalHash } from "@/utils/constants";
import { toAmountFormat, toValueFormat } from "@/utils/functions";
import { routeTree } from "@/utils/routes";
import { Button } from "@/toolkits/Button";

const { Footer, Header } = Layout;

type InitialState = { open?: boolean };

const Connect: FC = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<InitialState>({});
  const { open } = state;
  const { isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { hash, pathname } = useLocation();
  const navigate = useNavigate();

  const connectorsConfig = [
    {
      name: "WalletConnect",
      icon: "connectors/walletConnect.jpg",
      isShow: true,
    },
    { name: "MetaMask", icon: "connectors/metamask.png", isShow: true },
    { name: "Safe", icon: "", isShow: false },
  ];

  const handleConnect = (connector: Connector) => {
    connect({ connector });
    navigate(-1);
  };

  useEffect(() => {
    if (hash === modalHash.connect) {
      if (isConnected) {
        navigate(pathname, { replace: true });
      } else {
        setState((prevState) => ({ ...prevState, open: true }));
      }
    } else {
      setState((prevState) => ({ ...prevState, open: false }));
    }
  }, [hash, isConnected]);

  const getConnectorIcon = (name: string) => {
    const config = connectorsConfig.find((c) => c.name === name);
    return config?.icon || "";
  };

  return (
    <Modal
      className="default-layout-wallet-connect"
      closable={false}
      footer={false}
      onCancel={() => navigate(-1)}
      open={open}
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
            <span
              key={connector.uid}
              onClick={() => handleConnect(connector)}
              className="btn"
            >
              {icon ? <img src={icon} alt={connector.name} /> : null}
              {connector.name}
            </span>
          );
        })}
    </Modal>
  );
};

const Content: FC = () => {
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
        className="default-layout-wallet-content"
        closable={false}
        footer={false}
        onClose={() => navigate(-1)}
        open={open}
        title={
          <>
            <span className="text">{t("connectedWallet")}</span>
            <RefreshCW className="refresh" onClick={updateWallet} />
            <Popconfirm title={t("disconnect")} onConfirm={() => disconnect()}>
              <Power className="disconnect" />
            </Popconfirm>
          </>
        }
        width={360}
      >
        <div className="address">
          <img src="/avatars/1.png" alt="Avatar" />
          <MiddleTruncate>{address}</MiddleTruncate>
          <Tooltip title={t("copy")}>
            <Copy onClick={handleCopy} />
          </Tooltip>
        </div>
        <Divider />
        <div className="total">
          <span className="label">{t("vaultBalance")}</span>
          {updating ? (
            <Spin size="small" />
          ) : (
            <span className="price">
              {toValueFormat(
                Object.values(tokens).reduce(
                  (accumulator, { balance, value }) =>
                    accumulator + balance * value,
                  0
                ),
                currency
              )}
            </span>
          )}
        </div>
        {Object.values(tokens).map(({ balance, name, ticker, value }) => (
          <Fragment key={ticker}>
            <Divider />
            <div className="token">
              <img
                src={`/tokens/${ticker.toLowerCase()}.svg`}
                alt={ticker}
                className="logo"
              />
              <div className="info">
                <span className="ticker">{ticker}</span>
                <span className="name">{name}</span>
              </div>
              {updating ? (
                <Spin size="small" />
              ) : (
                <div className="value">
                  <span className="price">
                    {toValueFormat(balance * value, currency)}
                  </span>
                  <span className="balance">{`${toAmountFormat(
                    balance
                  )} ${ticker}`}</span>
                </div>
              )}
            </div>
          </Fragment>
        ))}
      </Drawer>

      {messageHolder}
    </>
  );
};

export const DefaultLayout: FC = () => {
  const { t } = useTranslation();
  const { currentPage } = useCore();
  const { address = "", isConnected } = useAccount();

  const items: TabsProps["items"] = [
    {
      key: "swap",
      label: <Link to={routeTree.swap.path}>{t("swap")}</Link>,
    },
    {
      key: "staking",
      label: <Link to={routeTree.stakingStake.path}>{t("staking")}</Link>,
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
        <MediaQuery minWidth={992}>
          <Tabs activeKey={currentPage} items={items} />
        </MediaQuery>
        {isConnected ? (
          <Button href={modalHash.wallet}>
            <MiddleTruncate $style={{ width: "110px" }}>
              {address}
            </MiddleTruncate>
          </Button>
        ) : (
          <Button href={modalHash.connect}>{t("connectWallet")}</Button>
        )}
      </Header>
      <Outlet />
      <Connect />
      <MediaQuery maxWidth={991}>
        <Footer>
          <Link
            to={routeTree.swap.path}
            className={currentPage === "swap" ? "active" : ""}
          >
            <ArrowDownUp />
            {t("swap")}
          </Link>
          <Link
            to={routeTree.stakingStake.path}
            className={currentPage === "staking" ? "active" : ""}
          >
            <ArrowRightToLine />
            {t("staking")}
          </Link>
          <Link
            to={routeTree.pool.path}
            className={currentPage === "pool" ? "active" : ""}
          >
            <Database />
            {t("pool")}
          </Link>
        </Footer>
      </MediaQuery>
      <Content />
    </Layout>
  );
};
