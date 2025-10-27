import { FC, useEffect, useState, useRef } from "react";
import { Layout } from "antd";
import { FeeAmount, Pool } from "@uniswap/v3-sdk";
import { Contract, formatEther } from "ethers";
import { erc20Abi } from "viem";
import MediaQuery from "react-responsive";
import {
  createChart,
  IChartApi,
  CandlestickData,
  CandlestickSeries,
} from "lightweight-charts";

import { useBaseContext } from "context";
import {
  POOLS_ABI,
  ContractAddress,
  PageKey,
  uniswapTokens,
  TickerKey,
} from "utils/constants";
import { getRPCProvider } from "utils/providers";
import api from "utils/api";

import SwapFees from "components/swap-fees";
import SwapHistory from "components/swap-history";
import SwapStats from "components/swap-stats";
import SwapVult from "components/swap-vult";
import SwapWhitelistCheck from "components/swap-whitelist-check";

const { Content } = Layout;

interface InitialState {
  marketCap?: number;
  price?: number;
  volume?: number;
  candlestickData?: CandlestickData[];
  priceChange?: number;
  priceChangePercent?: number;
}

interface CandlestickChartProps {
  data: CandlestickData[];
  symbol?: string;
  currentPrice?: number;
  priceChange?: number;
  priceChangePercent?: number;
  volume?: number;
}

const CandlestickChart: FC<CandlestickChartProps> = ({
  data,
  symbol = "VULT/USDC",
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#061b3a" },
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: { color: "#2B2B43" },
        horzLines: { color: "#2B2B43" },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "#485c7b",
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        autoScale: true,
        alignLabels: true,
        borderVisible: true,
        entireTextOnly: false,
        visible: true,
        ticksVisible: true,
      },
      timeScale: {
        borderColor: "#485c7b",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      borderVisible: true,
      priceFormat: {
        type: "price",
        precision: 6,
        minMove: 0.000001,
      },
    });

    candlestickSeries.setData(data);

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [data]);

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#061b3a",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #2B2B43",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #2B2B43",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#d1d4dc",
                marginBottom: "2px",
              }}
            >
              {symbol}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div
        ref={chartContainerRef}
        style={{
          width: "100%",
          height: "400px",
        }}
      />
    </div>
  );
};

const Component: FC = () => {
  const initialState: InitialState = {};
  const [state, setState] = useState(initialState);
  const { marketCap, price, volume, candlestickData } = state;
  const { changePage } = useBaseContext();

  const fetchPrice = async () => {
    const contract = new Contract(
      ContractAddress.VULT_USDC_POOL,
      POOLS_ABI,
      getRPCProvider()
    );
    const slot0 = await contract.slot0();
    const poolLiquidity = String(await contract.liquidity());
    const pool = new Pool(
      uniswapTokens[TickerKey.USDC],
      uniswapTokens[TickerKey.VULT],
      FeeAmount.HIGH,
      String(slot0.sqrtPriceX96),
      poolLiquidity,
      Number(slot0.tick)
    );
    return Number(pool.token1Price.toSignificant(8));
  };

  const fetchCandlestickData = async () => {
    try {
      const response = await fetch(
        "https://api.geckoterminal.com/api/v2/networks/eth/pools/0x6Df52cC6E2E6f6531E4ceB4b083CF49864A89020/ohlcv/minute?aggregate=1&limit=100&currency=usd&include_empty_intervals=false&token=quote"
      );
      const data = await response.json();

      const candlestickData: CandlestickData[] = data.data.attributes.ohlcv_list
        .map((item: number[]) => ({
          time: item[0] as any, // timestamp
          open: item[1], // open price
          high: item[2], // high price
          low: item[3], // low price
          close: item[4], // close price
        }))
        .sort((a: { time: number }, b: { time: number }) => a.time - b.time);

      if (candlestickData.length > 0) {
        setState((prevState) => ({
          ...prevState,
          candlestickData,
        }));
      } else {
        setState((prevState) => ({ ...prevState, candlestickData }));
      }
    } catch (error) {
      console.error("Error fetching candlestick data:", error);
    }
  };

  const componentDidMount = () => {
    changePage(PageKey.SWAP);

    api.volume().then((volume) => {
      setState((prevState) => ({ ...prevState, volume }));
    });

    fetchPrice().then((price) => {
      const contract = new Contract(
        ContractAddress.VULT_TOKEN,
        erc20Abi,
        getRPCProvider()
      );

      contract.totalSupply().then((totalSupply) => {
        setState((prevState) => ({
          ...prevState,
          marketCap: Number(formatEther(totalSupply)) * price,
          price,
        }));
      });
    });

    fetchCandlestickData();
  };

  useEffect(componentDidMount, []);

  // Update candlestick data every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCandlestickData();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Content className="swap-page">
      <div className="aside">
        <MediaQuery maxWidth={1399}>
          <SwapStats marketCap={marketCap} price={price} volume={volume} />
        </MediaQuery>
        <SwapWhitelistCheck />
        <SwapVult />
        <SwapFees />
      </div>
      <div className="main">
        <MediaQuery minWidth={1400}>
          <SwapStats marketCap={marketCap} price={price} volume={volume} />
        </MediaQuery>
        {candlestickData && (
          <CandlestickChart data={candlestickData} symbol="VULT/USDC" />
        )}
        <SwapHistory />
      </div>
    </Content>
  );
};

export default Component;
