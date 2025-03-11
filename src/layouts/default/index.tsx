import { FC, useEffect, useState } from "react";
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
  Tooltip,
} from "antd";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import MediaQuery from "react-responsive";

import { useBaseContext } from "context";
import { HashKey, PageKey } from "utils/constants";
import constantKeys from "i18n/constant-keys";
import constantPaths from "routes/constant-paths";

import { ArrowDownUp, ArrowRightToLine, Copy, Power, SettingsOne } from "icons";

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
          onClick={() => {
            connect({ connector }), navigate(-1);
          }}
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
  const initialState: { open: boolean } = { open: false };
  const [state, setState] = useState(initialState);
  const { open } = state;
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
            <Tooltip title={t(constantKeys.DISCONNECT)}>
              <Power onClick={() => disconnect()} className="disconnect" />
            </Tooltip>
          </>
        }
        width={360}
      >
        <div className="address">
          <img src="/avatars/1.png" alt="Avatar" />
          <Tooltip title={address}>{address}</Tooltip>
          <Copy onClick={handleCopy} />
        </div>
        <Divider />
        <div className="total">
          <span className="label">{t(constantKeys.VAULT_BALANCE)}</span>
          <span className="price ">{(123190.33).toPriceFormat(currency)}</span>
        </div>
        <Divider />
        <div className="token">
          <img src="/tokens/eth.svg" alt="USDC" className="logo" />
          <div className="info">
            <span className="ticker">ETH</span>
            <span className="name">Ethereum</span>
          </div>
          <div className="value">
            <span className="price">{(35789).toPriceFormat(currency)}</span>
            <span className="balance">{`${(5899).toBalanceFormat()} ETH`}</span>
          </div>
        </div>
        <Divider />
        <div className="token">
          <img src="/tokens/usdc.svg" alt="USDC" className="logo" />
          <div className="info">
            <span className="ticker">USDC</span>
            <span className="name">USD Coin</span>
          </div>
          <div className="value">
            <span className="price">{(65830).toPriceFormat(currency)}</span>
            <span className="balance">{`${(65830).toBalanceFormat()} USDC`}</span>
          </div>
        </div>
        <Divider />
        <div className="token">
          <img src="/tokens/vult.svg" alt="VULT" className="logo" />
          <div className="info">
            <span className="ticker">VULT</span>
            <span className="name">Vult</span>
          </div>
          <div className="value">
            <span className="price">{(23048).toPriceFormat(currency)}</span>
            <span className="balance">{`${(34394).toBalanceFormat()} VULT`}</span>
          </div>
        </div>
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
