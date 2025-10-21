import {
  Dropdown,
  InputNumber,
  Layout,
  MenuProps,
  Tabs,
  TabsProps,
} from "antd";
import { FC, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";

import { useCore } from "@/hooks/useCore";
import { ArrowDown, ChevronDown, RefreshCW } from "@/icons";
import { defaultTokens, modalHash } from "@/utils/constants";
import {
  toAmountFormat,
  toNumberFormat,
  toValueFormat,
} from "@/utils/functions";

const { Content } = Layout;

const BridgeTab: FC = () => {
  const { t } = useTranslation();
  const { currency } = useCore();
  const { isConnected } = useAccount();

  const handlePrice = (percentage: number) => {
    console.log(percentage);
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: defaultTokens.USDC.ticker,
      icon: (
        <img
          src={`/tokens/${defaultTokens.USDC.ticker.toLowerCase()}.svg`}
          alt="Ethereum"
        />
      ),
    },
    {
      key: "2",
      label: defaultTokens.WETH.ticker,
      icon: (
        <img
          src={`/tokens/${defaultTokens.WETH.ticker.toLowerCase()}.svg`}
          alt="Ethereum"
        />
      ),
    },
  ];

  return (
    <>
      <div className="coins">
        <div className="group">
          <div className="item">
            <span className="label">{t("token")}</span>
            <span className="dropdown">
              <img src="/tokens/vult.svg" alt="VULT" className="logo" />
              <span className="ticker">VULT</span>
            </span>
          </div>
          <div className="item">
            <span className="label">{t("from")}</span>
            <Dropdown menu={{ items }} rootClassName="token-dropdown-menu">
              <span className="dropdown">
                <img
                  src={`/tokens/${defaultTokens.USDC.ticker.toLowerCase()}.svg`}
                  alt={defaultTokens.USDC.ticker}
                  className="logo"
                />
                <span className="ticker">{defaultTokens.USDC.ticker}</span>
                <ChevronDown className="arrow" />
              </span>
            </Dropdown>
          </div>
        </div>
        <div className="refresh">
          <RefreshCW />
        </div>
        <div className="group">
          <div className="item">
            <span className="label">{t("token")}</span>
            <span className="dropdown">
              <img src="/tokens/vult.svg" alt="VULT" className="logo" />
              <span className="ticker">VULT</span>
            </span>
          </div>
          <div className="item">
            <span className="label">{t("to")}</span>
            <Dropdown menu={{ items }} rootClassName="token-dropdown-menu">
              <span className="dropdown">
                <img
                  src={`/tokens/${defaultTokens.WETH.ticker.toLowerCase()}.svg`}
                  alt={defaultTokens.WETH.ticker}
                  className="logo"
                />
                <span className="ticker">{defaultTokens.WETH.ticker}</span>
                <ChevronDown className="arrow" />
              </span>
            </Dropdown>
          </div>
        </div>
      </div>
      <InputNumber
        controls={false}
        formatter={(value = 0) => toNumberFormat(value)}
        min={0}
        placeholder="0.00"
      />
      <span className="price">{`${t("available")}: ${toValueFormat(
        0,
        currency
      )}`}</span>
      <ul className="percentage">
        <li onClick={() => handlePrice(25)}>25%</li>
        <li onClick={() => handlePrice(50)}>50%</li>
        <li onClick={() => handlePrice(100)}>{t("max")}</li>
      </ul>
      {isConnected ? (
        <span className="button button-secondary">{t("bridge")}</span>
      ) : (
        <Link to={modalHash.connect} className="button button-secondary">
          {t("connectWallet")}
        </Link>
      )}
    </>
  );
};

const MergeTab: FC = () => {
  const { t } = useTranslation();
  const { currency } = useCore();
  const { isConnected } = useAccount();

  const handlePrice = (percentage: number) => {
    console.log(percentage);
  };

  return (
    <>
      <div className="coins">
        <span className="coin">
          <span className="logo">
            <img src="/logo.svg" alt="Vult" />
          </span>
          <span className="ticker">Vult IOU</span>
        </span>
        <div className="pointer">
          <ArrowDown />
        </div>
        <span className="coin">
          <span className="logo">
            <img src="/logo.svg" alt="Vult" />
          </span>
          <span className="ticker">Vult</span>
        </span>
      </div>
      <div className="balance">
        <InputNumber
          controls={false}
          formatter={(value = 0) => toNumberFormat(value)}
          min={0}
          placeholder="0.00"
        />
        <span className="result">{`${toAmountFormat(0)} VULT`}</span>
      </div>
      <span className="price">{`${t("available")}: ${toValueFormat(
        0,
        currency
      )}`}</span>
      <ul className="percentage">
        <li onClick={() => handlePrice(25)}>25%</li>
        <li onClick={() => handlePrice(50)}>50%</li>
        <li onClick={() => handlePrice(100)}>{t("max")}</li>
      </ul>
      {isConnected ? (
        <span className="button button-secondary">{t("merge")}</span>
      ) : (
        <Link to={modalHash.connect} className="button button-secondary">
          {t("connectWallet")}
        </Link>
      )}
    </>
  );
};

export const MergePage: FC = () => {
  const { t } = useTranslation();
  const { setCurrentPage } = useCore();
  const { hash } = useLocation();
  const navigate = useNavigate();

  const handleTab: TabsProps["onTabClick"] = (tab) => {
    navigate(tab);
  };

  useEffect(() => {
    setCurrentPage("merge");
  }, []);

  const items: TabsProps["items"] = [
    {
      key: modalHash.merge,
      label: t("merge"),
      className: "merge-tab",
      children: <MergeTab />,
    },
    {
      key: modalHash.bridge,
      label: t("bridge"),
      className: "bridge-tab",
      children: <BridgeTab />,
    },
  ];

  return (
    <Content className="merge-page">
      <Tabs
        activeKey={
          hash === modalHash.bridge ? modalHash.bridge : modalHash.merge
        }
        items={items}
        onTabClick={handleTab}
      />
    </Content>
  );
};
