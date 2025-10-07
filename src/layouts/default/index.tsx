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
import { FC, Fragment, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import MediaQuery from "react-responsive";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Connector, useAccount, useConnect, useDisconnect } from "wagmi";

import { MiddleTruncate } from "@/components/middle-truncate";
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
import { toBalanceFormat, toPriceFormat } from "@/utils/functions";
import { routeTree } from "@/utils/routes";

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
  const { address, isConnected } = useAccount();
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
          <MiddleTruncate text={address ?? ""} />
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
              {toPriceFormat(
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
                    {toPriceFormat(balance * value, currency)}
                  </span>
                  <span className="balance">{`${toBalanceFormat(
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
  const [indicatorStyle, setIndicatorStyle] = useState({
    width: "0px",
    transform: "translateX(0)",
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const prevPositionRef = useRef({ width: "0px", left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const items: MenuProps["items"] = [
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
      label: t("pool"),
    },
  ];

  useEffect(() => {
    if (!menuRef.current) return;

    const menuEl = menuRef.current;
    if (!menuEl) return;

    const menuItems = menuEl.querySelectorAll(".ant-menu-item");
    if (!menuItems.length) return;

    let activeItem: Element | null = null;

    menuItems.forEach((item) => {
      if (item.classList.contains("ant-menu-item-selected")) {
        activeItem = item;
      }
    });

    if (activeItem && indicatorRef.current) {
      const width = (activeItem as HTMLElement).clientWidth;
      const offsetLeft = (activeItem as HTMLElement).offsetLeft;

      const prevWidth = prevPositionRef.current.width;
      const prevLeft = prevPositionRef.current.left;

      prevPositionRef.current = {
        width: `${width}px`,
        left: offsetLeft,
      };

      const indicator = indicatorRef.current;
      indicator.style.setProperty("--start-x", `${prevLeft}px`);
      indicator.style.setProperty("--start-width", prevWidth);
      indicator.style.setProperty("--end-x", `${offsetLeft}px`);
      indicator.style.setProperty("--end-width", `${width}px`);

      setIsAnimating(true);

      setIndicatorStyle({
        width: `${width}px`,
        transform: `translateX(${offsetLeft}px)`,
      });

      const animationTimeout = setTimeout(() => {
        setIsAnimating(false);
      }, 500);

      return () => clearTimeout(animationTimeout);
    }
  }, [currentPage]);

  return (
    <Layout className="default-layout">
      <Header>
        <div className="logo">
          <img src="/logo.svg" alt="Vultisig" className="icon" />
          <span className="name">Vultisig</span>
        </div>
        <MediaQuery minWidth={992}>
          <div className="menu-container" ref={menuRef}>
            <Menu
              selectedKeys={[currentPage]}
              items={items}
              mode="horizontal"
              style={{ width: "100%" }}
            />
            <div
              className={`menu-indicator ${isAnimating ? "animate" : ""}`}
              style={indicatorStyle}
              ref={indicatorRef}
            />
          </div>
        </MediaQuery>
        {isConnected ? (
          <Link to={modalHash.wallet} className="button button-secondary">
            <MiddleTruncate text={address ?? ""} />
          </Link>
        ) : (
          <Link to={modalHash.connect} className="button button-secondary">
            {t("connectWallet")}
          </Link>
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
          <Link to="" className={currentPage === "pool" ? "active" : ""}>
            <Database />
            {t("pool")}
          </Link>
        </Footer>
      </MediaQuery>
      <Content />
    </Layout>
  );
};
