import { FC, Fragment, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Divider,
  Drawer,
  Layout,
  Menu,
  MenuProps,
  message,
  Modal,
  Popconfirm,
  Spin,
  Tooltip,
} from "antd";
import { Connector, useAccount, useConnect, useDisconnect } from "wagmi";
import MediaQuery from "react-responsive";

import { useBaseContext } from "context";
import { HashKey, PageKey, defaultTokens } from "utils/constants";
import { TokenProps } from "utils/interfaces";
import constantKeys from "i18n/constant-keys";
import constantPaths from "routes/constant-paths";
import api from "utils/api";

import {
  ArrowDownUp,
  ArrowRightToLine,
  Copy,
  Power,
  RefreshCW,
  SettingsOne,
} from "icons";

const { Footer, Header } = Layout;

const Connect: FC = () => {
  const { t } = useTranslation();
  const initialState: { open: boolean } = { open: false };
  const [state, setState] = useState(initialState);
  const { open } = state;
  const { isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { hash, pathname } = useLocation();
  const navigate = useNavigate();

  const handleConnect = (connector: Connector) => {
    connect({ connector });
    navigate(-1);
  };

  const componentDidUpdate = () => {
    if (hash === HashKey.CONNECT) {
      if (isConnected) {
        navigate(pathname, { replace: true });
      } else {
        setState((prevState) => ({ ...prevState, open: true }));
      }
    } else {
      setState((prevState) => ({ ...prevState, open: false }));
    }
  };

  useEffect(componentDidUpdate, [hash, isConnected]);

  return (
    <Modal
      className="default-layout-wallet-connect"
      closable={false}
      footer={false}
      onCancel={() => navigate(-1)}
      open={open}
      title={t(constantKeys.CONNECT_WALLET)}
      width={360}
    >
      {connectors.map((connector) => (
        <span
          key={connector.uid}
          onClick={() => handleConnect(connector)}
          className="btn"
        >
          {connector.icon ? <img src={connector.icon} /> : null}
          {connector.name}
        </span>
      ))}
    </Modal>
  );
};

const Content: FC = () => {
  const { t } = useTranslation();
  const initialState: {
    loading: boolean;
    open: boolean;
    tokens: TokenProps[];
  } = {
    loading: true,
    open: false,
    tokens: defaultTokens,
  };
  const [state, setState] = useState(initialState);
  const { loading, open, tokens } = state;
  const { address, isConnected } = useAccount();
  const { currency } = useBaseContext();
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

  const componentMustUpdate = () => {
    if (address) {
      setState((prevState) => ({ ...prevState, loading: true }));

      Promise.all([
        Promise.all(
          tokens.map((token) =>
            api.balance(
              address,
              token.decimals,
              token.contractAddress,
              token.isNative
            )
          )
        ).then((balances) => {
          setState((prevState) => ({
            ...prevState,
            tokens: prevState.tokens.map((token, index) => ({
              ...token,
              balance: balances[index],
            })),
          }));
        }),
        api
          .values(
            tokens.map(({ cmcId }) => cmcId),
            currency
          )
          .then((values) => {
            setState((prevState) => ({
              ...prevState,
              tokens: prevState.tokens.map((token) => ({
                ...token,
                value: values[token.cmcId] || token.value,
              })),
            }));
          }),
      ]).then(() => {
        setState((prevState) => ({ ...prevState, loading: false }));
      });
    }
  };

  const componentDidUpdate = () => {
    if (hash === HashKey.WALLET) {
      if (isConnected) {
        setState((prevState) => ({ ...prevState, open: true }));
      } else {
        navigate(pathname, { replace: true });
      }
    } else {
      setState((prevState) => ({ ...prevState, open: false }));
    }
  };

  useEffect(componentMustUpdate, [address]);
  useEffect(componentDidUpdate, [hash, isConnected]);

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
            <span className="text">{t(constantKeys.CONNECTED_WALLET)}</span>
            <RefreshCW className="refresh" onClick={componentMustUpdate} />
            <Popconfirm
              title={t(constantKeys.DISCONNECT)}
              onConfirm={() => disconnect()}
            >
              <Power className="disconnect" />
            </Popconfirm>
          </>
        }
        width={360}
      >
        <div className="address">
          <img src="/avatars/1.png" alt="Avatar" />
          <span>{address}</span>
          <Tooltip title={t(constantKeys.COPY)}>
            <Copy onClick={handleCopy} />
          </Tooltip>
        </div>
        <Divider />
        <div className="total">
          <span className="label">{t(constantKeys.VAULT_BALANCE)}</span>
          {loading ? (
            <Spin size="small" />
          ) : (
            <span className="price">
              {tokens
                .reduce(
                  (accumulator, { balance, value }) =>
                    accumulator + balance * value,
                  0
                )
                .toPriceFormat(currency)}
            </span>
          )}
        </div>
        {tokens.map(({ balance, name, ticker, value }) => (
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
              {loading ? (
                <Spin size="small" />
              ) : (
                <div className="value">
                  <span className="price">
                    {(balance * value).toPriceFormat(currency)}
                  </span>
                  <span className="balance">{`${balance.toBalanceFormat()} ${ticker}`}</span>
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

const Component: FC = () => {
  const { t } = useTranslation();
  const { activePage } = useBaseContext();
  const { address = "", isConnected } = useAccount();

  const items: MenuProps["items"] = [
    {
      key: PageKey.SWAP,
      icon: <ArrowDownUp />,
      label: <Link to={constantPaths.swap}>{t(constantKeys.SWAP)}</Link>,
    },
    {
      key: PageKey.MERGE,
      icon: <ArrowRightToLine />,
      label: <Link to={constantPaths.merge}>{t(constantKeys.MERGE)}</Link>,
    },
    {
      key: PageKey.SETTINGS,
      icon: <SettingsOne />,
      label: (
        <Link to={constantPaths.settings}>{t(constantKeys.SETTINGS)}</Link>
      ),
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
          <Menu selectedKeys={[activePage]} items={items} mode="horizontal" />
        </MediaQuery>
        {isConnected ? (
          <Link to={HashKey.WALLET} className="secondary-button">
            {`${address.substring(0, 10)}...`}
          </Link>
        ) : (
          <Link to={HashKey.CONNECT} className="secondary-button">
            {t(constantKeys.CONNECT_WALLET)}
          </Link>
        )}
      </Header>
      <Outlet />
      <Connect />
      <MediaQuery maxWidth={991}>
        <Footer>
          <Link
            to={constantPaths.swap}
            className={activePage === PageKey.SWAP ? "active" : ""}
          >
            <ArrowDownUp />
            {t(constantKeys.SWAP)}
          </Link>
          <Link
            to={constantPaths.merge}
            className={activePage === PageKey.MERGE ? "active" : ""}
          >
            <ArrowRightToLine />
            {t(constantKeys.MERGE)}
          </Link>
          <Link
            to={constantPaths.settings}
            className={activePage === PageKey.SETTINGS ? "active" : ""}
          >
            <SettingsOne />
            {t(constantKeys.SETTINGS)}
          </Link>
        </Footer>
      </MediaQuery>
      <Content />
    </Layout>
  );
};

export default Component;
