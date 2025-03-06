import { FC } from "react";
import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout, Menu, MenuProps } from "antd";
import { useAccount } from "wagmi";
import MediaQuery from "react-responsive";

import { useBaseContext } from "context";
import { ModalKey, PageKey } from "utils/constants";
import constantKeys from "i18n/constant-keys";
import constantPaths from "routes/constant-paths";

import { ArrowDownUp, ArrowRightToLine, SettingsOne } from "icons";
import SecondaryButton from "components/secondary-button";
import WalletConnect from "components/wallet-connect";

const { Footer, Header } = Layout;

const Component: FC = () => {
  const { t } = useTranslation();
  const { activePage } = useBaseContext();
  const { address, isConnected } = useAccount();

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
        <SecondaryButton href={ModalKey.CONNECT}>
          {isConnected
            ? address
              ? `${address.substring(0, 10)}...`
              : "-"
            : t(constantKeys.CONNECT_WALLET)}
        </SecondaryButton>
      </Header>
      <Outlet />
      <WalletConnect />
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
    </Layout>
  );
};

export default Component;
