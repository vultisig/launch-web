import { FC, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Dropdown,
  InputNumber,
  Layout,
  MenuProps,
  Tabs,
  TabsProps,
} from "antd";
import { useAccount } from "wagmi";

import { useBaseContext } from "context";
import { HashKey, PageKey, TickerKey, defaultTokens } from "utils/constants";
import constantKeys from "i18n/constant-keys";

import { ArrowDown, ChevronDown, RefreshCW } from "icons";

const { Content } = Layout;

const BridgeTab: FC = () => {
  const { t } = useTranslation();
  const { currency } = useBaseContext();
  const { isConnected } = useAccount();

  const handlePrice = (percentage: number) => {
    console.log(percentage);
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: defaultTokens[TickerKey.USDC].ticker,
      icon: (
        <img
          src={`/tokens/${defaultTokens[
            TickerKey.USDC
          ].ticker.toLowerCase()}.svg`}
          alt="Ethereum"
        />
      ),
    },
    {
      key: "2",
      label: defaultTokens[TickerKey.WETH].ticker,
      icon: (
        <img
          src={`/tokens/${defaultTokens[
            TickerKey.WETH
          ].ticker.toLowerCase()}.svg`}
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
            <span className="label">{t(constantKeys.TOKEN)}</span>
            <span className="dropdown">
              <img src="/tokens/vult.svg" alt="VULT" className="logo" />
              <span className="ticker">VULT</span>
            </span>
          </div>
          <div className="item">
            <span className="label">{t(constantKeys.FROM)}</span>
            <Dropdown menu={{ items }} rootClassName="token-dropdown-menu">
              <span className="dropdown">
                <img
                  src={`/tokens/${defaultTokens[
                    TickerKey.USDC
                  ].ticker.toLowerCase()}.svg`}
                  alt={defaultTokens[TickerKey.USDC].ticker}
                  className="logo"
                />
                <span className="ticker">
                  {defaultTokens[TickerKey.USDC].ticker}
                </span>
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
            <span className="label">{t(constantKeys.TOKEN)}</span>
            <span className="dropdown">
              <img src="/tokens/vult.svg" alt="VULT" className="logo" />
              <span className="ticker">VULT</span>
            </span>
          </div>
          <div className="item">
            <span className="label">{t(constantKeys.TO)}</span>
            <Dropdown menu={{ items }} rootClassName="token-dropdown-menu">
              <span className="dropdown">
                <img
                  src={`/tokens/${defaultTokens[
                    TickerKey.WETH
                  ].ticker.toLowerCase()}.svg`}
                  alt={defaultTokens[TickerKey.WETH].ticker}
                  className="logo"
                />
                <span className="ticker">
                  {defaultTokens[TickerKey.WETH].ticker}
                </span>
                <ChevronDown className="arrow" />
              </span>
            </Dropdown>
          </div>
        </div>
      </div>
      <InputNumber
        controls={false}
        formatter={(value) => `${value}`.toNumberFormat()}
        min={0}
        placeholder="0.00"
      />
      <span className="price">{`${t(
        constantKeys.AVAILABLE
      )}: ${(0).toPriceFormat(currency)}`}</span>
      <ul className="percentage">
        <li onClick={() => handlePrice(25)}>25%</li>
        <li onClick={() => handlePrice(50)}>50%</li>
        <li onClick={() => handlePrice(100)}>{t(constantKeys.MAX)}</li>
      </ul>
      {isConnected ? (
        <span className="secondary-button">{t(constantKeys.BRIDGE)}</span>
      ) : (
        <Link to={HashKey.CONNECT} className="secondary-button">
          {t(constantKeys.CONNECT_WALLET)}
        </Link>
      )}
    </>
  );
};

const MergeTab: FC = () => {
  const { t } = useTranslation();
  const { currency } = useBaseContext();
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
          formatter={(value) => `${value}`.toNumberFormat()}
          min={0}
          placeholder="0.00"
        />
        <span className="result">{`${(0).toBalanceFormat()} VULT`}</span>
      </div>
      <span className="price">{`${t(
        constantKeys.AVAILABLE
      )}: ${(0).toPriceFormat(currency)}`}</span>
      <ul className="percentage">
        <li onClick={() => handlePrice(25)}>25%</li>
        <li onClick={() => handlePrice(50)}>50%</li>
        <li onClick={() => handlePrice(100)}>{t(constantKeys.MAX)}</li>
      </ul>
      {isConnected ? (
        <span className="secondary-button">{t(constantKeys.MERGE)}</span>
      ) : (
        <Link to={HashKey.CONNECT} className="secondary-button">
          {t(constantKeys.CONNECT_WALLET)}
        </Link>
      )}
    </>
  );
};

const Component: FC = () => {
  const { t } = useTranslation();
  const { changePage } = useBaseContext();
  const { hash } = useLocation();
  const navigate = useNavigate();

  const handleTab: TabsProps["onTabClick"] = (tab) => {
    navigate(tab);
  };

  const componentDidMount = () => {
    changePage(PageKey.MERGE);
  };

  useEffect(componentDidMount, []);

  const items: TabsProps["items"] = [
    {
      key: HashKey.MERGE,
      label: t(constantKeys.MERGE),
      className: "merge-tab",
      children: <MergeTab />,
    },
    {
      key: HashKey.BRIDGE,
      label: t(constantKeys.BRIDGE),
      className: "bridge-tab",
      children: <BridgeTab />,
    },
  ];

  return (
    <Content className="merge-page">
      <Tabs
        activeKey={hash === HashKey.BRIDGE ? HashKey.BRIDGE : HashKey.MERGE}
        items={items}
        onTabClick={handleTab}
      />
    </Content>
  );
};

export default Component;
