import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown, InputNumber, Layout, MenuProps } from "antd";
import { useAccount } from "wagmi";
import HighchartsReact, {
  HighchartsReactProps,
} from "highcharts-react-official";
import Highcharts from "highcharts";
import MediaQuery from "react-responsive";

import { useBaseContext } from "context";
import { ModalKey, PageKey } from "utils/constants";

import { ArrowDownUp, ChevronDown, ChevronUp, SettingsTwo } from "icons";
import constantKeys from "i18n/constant-keys";

import SecondaryButton from "components/secondary-button";

const { Content } = Layout;

const Reports: FC<{ data: number[][] }> = ({ data }) => {
  const { t } = useTranslation();
  const descending = false;

  const options: HighchartsReactProps["options"] = {
    chart: { backgroundColor: "transparent", zooming: { type: "x" } },
    legend: { enabled: false },
    plotOptions: {
      area: {
        marker: { radius: 2 },
        lineColor: descending ? "#ff5c5c" : "#33e6bf",
        lineWidth: 1,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, descending ? "rgba(255, 92, 92, 1)" : "rgba(51, 230, 191, 1)"],
            [1, "rgba(2, 18, 43, 0)"],
          ],
        },
        states: { hover: { lineWidth: 1 } },
        threshold: null,
      },
    },
    series: [{ type: "area", name: "USD to EUR", data: data }],
    title: { text: undefined },
    tooltip: { backgroundColor: "#061b3a", style: { color: "#f0f4fc" } },
    xAxis: {
      labels: { style: { color: "#f0f4fc" } },
      title: { text: undefined },
      type: "datetime",
      lineColor: "#11284a",
      tickColor: "#11284a",
    },
    yAxis: {
      labels: { style: { color: "#f0f4fc" } },
      title: { text: undefined },
      gridLineColor: "#11284a",
    },
  };

  return (
    <div className="reports">
      <div className="heading">
        <span className="title">{t(constantKeys.PRICE)}</span>
        <ul className="period">
          <li className="active">24h</li>
          <li>7d</li>
          <li>1m</li>
        </ul>
      </div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

const Stats: FC = () => {
  const { t } = useTranslation();
  const { currency } = useBaseContext();

  return (
    <div className="stats">
      <div className="item">
        <span className="title">{t(constantKeys.MARKET_CAP)}</span>
        <span className="value">{(1000000).toPriceFormat(currency)}</span>
      </div>
      <div className="item ascending">
        <span className="title">
          {t(constantKeys.PRICE)}
          <ChevronUp />
          <span>6.81%</span>
        </span>
        <span className="value">{(1000000).toPriceFormat(currency)}</span>
      </div>
      <div className="item">
        <span className="title">24h Vol</span>
        <span className="value">{(25293).toPriceFormat(currency)}</span>
      </div>
      <div className="item ascending">
        <span className="title">
          {t(constantKeys.ALL_TIME_LOW)}
          <ChevronUp />
          <span>6.81%</span>
        </span>
        <span className="value">{(0.00394).toPriceFormat(currency)}</span>
      </div>
      <div className="item descending">
        <span className="title">
          {t(constantKeys.ALL_TIME_HIGH)}
          <ChevronDown />
          <span>12.31%</span>
        </span>
        <span className="value">{(1000000).toPriceFormat(currency)}</span>
      </div>
    </div>
  );
};

const SwapVult: FC = () => {
  const { t } = useTranslation();
  const initialState: { currencyToVult: boolean } = { currencyToVult: true };
  const [state, setState] = useState(initialState);
  const { currencyToVult } = state;
  const { currency } = useBaseContext();
  const { isConnected } = useAccount();

  const handleChain: MenuProps["onClick"] = ({ key }) => {
    console.log(key);
  };

  const handleToggle = () => {
    setState((prevState) => ({
      ...prevState,
      currencyToVult: !prevState.currencyToVult,
    }));
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "Ethereum",
      icon: <img src="/tokens/ethereum.svg" alt="Ethereum" />,
      onClick: handleChain,
    },
  ];

  const buyingCoin = (
    <>
      <InputNumber min={0} defaultValue={0} controls={false} />
      <span className="token-dropdown vult">
        <span className="logo">
          <img src="/logo.svg" alt="Vult" />
        </span>
        <span className="ticker">Vult</span>
      </span>
    </>
  );

  const sellingCoin = (
    <>
      <InputNumber min={0} defaultValue={0} controls={false} />
      <Dropdown
        menu={{ items }}
        className="token-dropdown"
        rootClassName="token-dropdown-menu"
      >
        <span className="token-dropdown">
          <img src="/tokens/usdc.svg" alt="USDC" className="logo" />
          <span className="ticker">USDC</span>
          <ChevronDown className="arrow" />
        </span>
      </Dropdown>
    </>
  );

  return (
    <div className="vultswap">
      <span className="heading">{t(constantKeys.SWAP)}</span>
      <div className="chain">
        <Dropdown
          menu={{ items }}
          className="token-dropdown"
          rootClassName="token-dropdown-menu"
        >
          <span>
            <img src="/tokens/ethereum.svg" alt="Ethereum" className="logo" />
            <span className="ticker">Ethereum</span>
            <ChevronDown className="arrow" />
          </span>
        </Dropdown>
        <SettingsTwo />
      </div>
      <div className="swap">
        <div className="item">
          <span className="title">{t(constantKeys.I_WANT_TO_ALLOCATE)}</span>
          <div className="balance">
            {currencyToVult ? sellingCoin : buyingCoin}
          </div>
          <span className="price">{(0).toPriceFormat(currency)}</span>
        </div>
        <div className="divider" onClick={handleToggle}>
          <ArrowDownUp />
        </div>
        <div className="item">
          <span className="title">{t(constantKeys.TO_BUY)}</span>
          <div className="balance">
            {currencyToVult ? buyingCoin : sellingCoin}
          </div>
          <span className="price">{(0).toPriceFormat(currency)}</span>
        </div>
      </div>
      {isConnected ? (
        <SecondaryButton>{t(constantKeys.SWAP)}</SecondaryButton>
      ) : (
        <SecondaryButton href={ModalKey.CONNECT}>
          {t(constantKeys.CONNECT_WALLET)}
        </SecondaryButton>
      )}
    </div>
  );
};

const Component: FC = () => {
  const initialState: { data: number[][] } = { data: [] };
  const [state, setState] = useState(initialState);
  const { data } = state;
  const { changePage } = useBaseContext();

  const componentDidMount = () => {
    changePage(PageKey.SWAP);

    fetch("https://www.highcharts.com/samples/data/usdeur.json")
      .then((response) => response.json())
      .then((data) => setState((prevState) => ({ ...prevState, data })));
  };

  useEffect(componentDidMount, []);

  return (
    <Content className="swap-page">
      <MediaQuery minWidth={1400}>
        <div className="aside">
          <SwapVult />
        </div>
        <div className="main">
          <Stats />
          <Reports data={data} />
        </div>
      </MediaQuery>
      <MediaQuery maxWidth={1399}>
        <Stats />
        <SwapVult />
        <Reports data={data} />
      </MediaQuery>
    </Content>
  );
};

export default Component;
