import { FC, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Layout, Tabs, TabsProps } from "antd";
import { useAccount } from "wagmi";

import { useBaseContext } from "context";
import { ModalKey, PageKey } from "utils/constants";
import constantKeys from "i18n/constant-keys";

import { ArrowDown } from "icons";
import SecondaryButton from "components/secondary-button";

const { Content } = Layout;

const Component: FC = () => {
  const { t } = useTranslation();
  const { changePage } = useBaseContext();
  const { isConnected } = useAccount();

  const componentDidMount = () => {
    changePage(PageKey.MERGE);
  };

  useEffect(componentDidMount, []);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: t(constantKeys.MERGE),
      className: "merge-tab",
      children: (
        <>
          <div className="coins">
            <span className="coin">
              <span className="logo">
                <img src="/logo.svg" alt="Vult" />
              </span>
              <span className="ticker">Vult IOU</span>
            </span>
            <div className="switch">
              <ArrowDown />
            </div>
            <span className="coin">
              <span className="logo">
                <img src="/logo.svg" alt="Vult" />
              </span>
              <span className="ticker">Vult</span>
            </span>
          </div>
          {isConnected ? (
            <SecondaryButton>{t(constantKeys.MERGE)}</SecondaryButton>
          ) : (
            <SecondaryButton href={ModalKey.CONNECT}>
              {t(constantKeys.CONNECT_WALLET)}
            </SecondaryButton>
          )}
        </>
      ),
    },
    {
      key: "2",
      label: t(constantKeys.BRIDGE),
      className: "bridge-tab",
      children: (
        <>
          {isConnected ? (
            <SecondaryButton>{t(constantKeys.BRIDGE)}</SecondaryButton>
          ) : (
            <SecondaryButton href={ModalKey.CONNECT}>
              {t(constantKeys.CONNECT_WALLET)}
            </SecondaryButton>
          )}
        </>
      ),
    },
  ];

  return (
    <Content className="merge-page">
      <Tabs defaultActiveKey="1" items={items} />
    </Content>
  );
};

export default Component;
