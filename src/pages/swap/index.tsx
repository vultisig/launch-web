import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Dropdown,
  InputNumber,
  InputNumberProps,
  Layout,
  MenuProps,
} from "antd";
import { debounce } from "lodash";
import { useAccount } from "wagmi";
import HighchartsReact, {
  HighchartsReactProps,
} from "highcharts-react-official";
import Highcharts from "highcharts";
import MediaQuery from "react-responsive";
import { useBaseContext } from "context";
import { HashKey, PageKey } from "utils/constants";

import { ArrowDownUp, ChevronDown, ChevronUp, SettingsTwo } from "icons";
import constantKeys from "i18n/constant-keys";
import api from "utils/api";

import { USDC_TOKEN, WETH_TOKEN, quote } from "utils/quote-provider";
import { FeeAmount, Pool } from "@uniswap/v3-sdk";
import { CONTRACTS, POOLS_ABI } from "utils/contracts";
import { Contract, formatEther, JsonRpcProvider } from "ethers";
import { erc20Abi } from "viem";
import useTokenApproval from "hooks/useTokenApproval";

const { Content } = Layout;

type DataProps = [number, number][];

interface InitialState {
  data: DataProps;
  period: number;
  volume: number;
}

const Reports = () => {
  const { t } = useTranslation();
  const initialState: InitialState = { data: [], period: 1, volume: 0 };
  const [state, setState] = useState(initialState);
  const { data, period } = state;
  useEffect(() => {
    getChartData();
  }, [period]);

  const getChartData = () => {
    api.historicalPrice(period).then((rawData) => {
      const data: InitialState["data"] = rawData.map(({ date, price }) => [
        date,
        parseFloat(price.toFixed(2)),
      ]);

      setState((prevState) => ({ ...prevState, data }));
    });
  };

  const options: HighchartsReactProps["options"] = {
    chart: { backgroundColor: "transparent", zooming: { type: "x" } },
    legend: { enabled: false },
    plotOptions: {
      area: {
        marker: { radius: 2 },
        lineColor: "#33e6bf",
        lineWidth: 1,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, "rgba(51, 230, 191, 1)"],
            [1, "rgba(2, 18, 43, 0)"],
          ],
        },
        states: { hover: { lineWidth: 1 } },
        threshold: null,
      },
    },
    series: [{ type: "area", name: t(constantKeys.PRICE), data: data }],
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
  const handleInterval = (interval: number) => {
    setState((preState) => ({ ...preState, period: interval }));
  };

  return (
    <div className="reports">
      <div className="heading">
        <span className="title">{t(constantKeys.PRICE)}</span>
        <ul className="period">
          <li
            className={period === 1 ? "active" : ""}
            onClick={() => handleInterval(1)}
          >
            24h
          </li>
          <li
            className={period === 7 ? "active" : ""}
            onClick={() => handleInterval(7)}
          >
            7d
          </li>
          <li
            className={period === 30 ? "active" : ""}
            onClick={() => handleInterval(30)}
          >
            30d
          </li>
        </ul>
      </div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

interface StatsInitialState {
  price: number;
  marketCap: number;
}
const Stats: FC<{ volume: number }> = ({ volume }) => {
  const { t } = useTranslation();
  const initialState: StatsInitialState = { price: 0, marketCap: 0 };
  const [state, setState] = useState<StatsInitialState>(initialState);
  const { price, marketCap } = state;
  const { currency } = useBaseContext();
  useEffect(() => {
    fetchPrice().then((price) => {
      setState((prevState) => ({ ...prevState, price: price }));
      const provider = new JsonRpcProvider("https://api.vultisig.com/eth/");
      const contract = new Contract(CONTRACTS.WETHToken, erc20Abi, provider);
      contract.totalSupply().then((totalSupply) => {
        setState((prevState) => ({
          ...prevState,
          marketCap: Number(formatEther(totalSupply)) * price,
        }));
      });
    });
  }, []);

  const fetchPrice = async () => {
    const provider = new JsonRpcProvider("https://api.vultisig.com/eth/");
    const contract = new Contract(CONTRACTS.WETHUSDCPool, POOLS_ABI, provider);
    const slot0 = await contract.slot0();
    const poolLiquidity = String(await contract.liquidity());
    const pool = new Pool(
      WETH_TOKEN,
      USDC_TOKEN,
      FeeAmount.HIGH,
      String(slot0.sqrtPriceX96),
      poolLiquidity,
      Number(slot0.tick)
    );
    return Number(pool.token1Price.toSignificant(6));
  };

  return (
    <div className="stats">
      <div className="item">
        <span className="title">{t(constantKeys.MARKET_CAP)}</span>
        <span className="value">{marketCap.toPriceFormat(currency)}</span>
      </div>
      <div className="item ascending">
        <span className="title">
          {t(constantKeys.PRICE)}
          <ChevronUp />
          <span>6.81%</span>
        </span>
        <span className="value">{price.toPriceFormat(currency)}</span>
      </div>
      <div className="item">
        <span className="title">24h Vol</span>
        <span className="value">{volume.toPriceFormat(currency)}</span>
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

  const initialState: {
    currencyToVult: boolean;
    tokenAmountA?: number;
    tokenAmountB?: number;
  } = { currencyToVult: true };

  const [state, setState] = useState(initialState);
  const { tokenAmountA, tokenAmountB, currencyToVult } = state;
  const { approvedAmount, isApproving, needsApproval, requestApproval } =
    useTokenApproval(CONTRACTS.USDCToken, CONTRACTS.swapRouter, tokenAmountA);
  const { currency } = useBaseContext();
  const { isConnected } = useAccount();

  const handleChangeTokenA: InputNumberProps["onChange"] = debounce(
    (tokenAmountA) => {
      quote(USDC_TOKEN, WETH_TOKEN, tokenAmountA).then((tokenAmountB) => {
        setState((prevState) => ({
          ...prevState,
          tokenAmountA,
          tokenAmountB,
        }));
        console.log({
          approvedAmount,
          isApproving,
          needsApproval,
          requestApproval,
        });
      });
    },
    200
  );

  const handleChangeTokenB: InputNumberProps["onChange"] = debounce(
    (tokenAmountB) => {
      quote(WETH_TOKEN, USDC_TOKEN, tokenAmountB).then((tokenAmountA) => {
        setState((prevState) => ({
          ...prevState,
          tokenAmountA,
          tokenAmountB,
        }));
      });
    },
    200
  );

  const handleChain: MenuProps["onClick"] = ({ key }) => {
    console.log(key);
  };

  const handleToggle = () => {
    // setState((prevState) => ({
    //   ...prevState,
    //   currencyToVult: !prevState.currencyToVult,
    // }));
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "Ethereum",
      icon: <img src="/tokens/ethereum.svg" alt="Ethereum" />,
      onClick: handleChain,
    },
  ];

  const tokenA = (
    <>
      <InputNumber
        controls={false}
        formatter={(value) => `${value}`.toNumberFormat()}
        min={0}
        onChange={handleChangeTokenA}
        placeholder="0.00"
        value={tokenAmountA}
      />
      <Dropdown
        menu={{ items: [] }}
        className="token-dropdown"
        rootClassName="token-dropdown-menu"
      >
        <span className="token-dropdown">
          <img
            src={`/tokens/${USDC_TOKEN.symbol?.toLowerCase()}.svg`}
            alt={USDC_TOKEN.symbol}
            className="logo"
          />
          <span className="ticker">{USDC_TOKEN.symbol}</span>
          <ChevronDown className="arrow" />
        </span>
      </Dropdown>
    </>
  );

  const tokenB = (
    <>
      <InputNumber
        controls={false}
        formatter={(value) => `${value}`.toNumberFormat()}
        min={0}
        onChange={handleChangeTokenB}
        placeholder="0.00"
        value={tokenAmountB}
      />
      <Dropdown
        menu={{ items: [] }}
        className="token-dropdown"
        rootClassName="token-dropdown-menu"
      >
        <span className="token-dropdown">
          <img
            src={`/tokens/${WETH_TOKEN.symbol?.toLowerCase()}.svg`}
            alt={WETH_TOKEN.symbol}
            className="logo"
          />
          <span className="ticker">{WETH_TOKEN.symbol}</span>
          <ChevronDown className="arrow" />
        </span>
      </Dropdown>
      {/* <span className="token-dropdown vult">
        <span className="logo">
          <img src="/logo.svg" alt="Vult" />
        </span>
        <span className="ticker">Vult</span>
      </span> */}
    </>
  );
  const handleSwapButton = () => {
    if (needsApproval) {
      requestApproval().then((res) => {
        console.log("approve res:", res);
      });
    }
  };
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
          <div className="balance">{currencyToVult ? tokenA : tokenB}</div>
          <span className="price">{(0).toPriceFormat(currency)}</span>
        </div>
        <div className="switch" onClick={handleToggle}>
          <ArrowDownUp />
        </div>
        <div className="item">
          <span className="title">{t(constantKeys.TO_BUY)}</span>
          <div className="balance">{currencyToVult ? tokenB : tokenA}</div>
          <span className="price">{(0).toPriceFormat(currency)}</span>
        </div>
      </div>
      {isConnected ? (
        <span className="secondary-button" onClick={handleSwapButton}>
          {needsApproval ? t(constantKeys.APPROVE) : t(constantKeys.SWAP)}
        </span>
      ) : (
        <Link to={HashKey.CONNECT} className="secondary-button">
          {t(constantKeys.CONNECT_WALLET)}
        </Link>
      )}
    </div>
  );
};

const Component: FC = () => {
  const initialState: InitialState = { data: [], period: 7, volume: 0 };
  const [state, setState] = useState(initialState);
  const { volume } = state;
  const { changePage } = useBaseContext();

  const componentDidMount = () => {
    changePage(PageKey.SWAP);

    api.volume(1).then((volume) => {
      setState((prevState) => ({ ...prevState, volume }));
    });
  };

  useEffect(componentDidMount, []);

  return (
    <Content className="swap-page">
      <MediaQuery minWidth={1400}>
        <div className="aside">
          <SwapVult />
        </div>
        <div className="main">
          <Stats volume={volume} />
          <Reports />
        </div>
      </MediaQuery>
      <MediaQuery maxWidth={1399}>
        <Stats volume={volume} />
        <SwapVult />
        <Reports />
      </MediaQuery>
    </Content>
  );
};

export default Component;
