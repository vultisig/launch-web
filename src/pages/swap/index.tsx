import { FC, useEffect, useState } from "react";
import { Layout } from "antd";
import { FeeAmount, Pool } from "@uniswap/v3-sdk";
import { Contract, formatEther, JsonRpcProvider } from "ethers";
import { erc20Abi } from "viem";
import MediaQuery from "react-responsive";

import { useBaseContext } from "context";
import {
  POOLS_ABI,
  ContractAddress,
  PageKey,
  Period,
  uniswapTokens,
  TickerKey,
} from "utils/constants";
import api from "utils/api";

import SwapFees from "components/swap-fees";
import SwapReports from "components/swap-reports";
import SwapStats from "components/swap-stats";
import SwapVult from "components/swap-vult";

const { Content } = Layout;

type DataProps = [number, number][];

interface InitialState {
  marketCap: number;
  period: Period;
  price: number;
  reports: DataProps;
  volume: number;
}

const Component: FC = () => {
  const initialState: InitialState = {
    marketCap: 0,
    period: Period.DAY,
    price: 0,
    reports: [],
    volume: 0,
  };

  const [state, setState] = useState(initialState);
  const { marketCap, period, price, reports, volume } = state;
  const { changePage } = useBaseContext();

  const fetchPrice = async () => {
    const provider = new JsonRpcProvider("https://api.vultisig.com/eth/");
    const contract = new Contract(
      ContractAddress.WETH_USDC_POOL,
      POOLS_ABI,
      provider
    );
    const slot0 = await contract.slot0();
    const poolLiquidity = String(await contract.liquidity());
    const pool = new Pool(
      uniswapTokens[TickerKey.WETH],
      uniswapTokens[TickerKey.USDC],
      FeeAmount.HIGH,
      String(slot0.sqrtPriceX96),
      poolLiquidity,
      Number(slot0.tick)
    );
    return Number(pool.token1Price.toSignificant(6));
  };

  const handlePeriod = (period: Period) => {
    setState((preState) => ({ ...preState, period }));
  };

  const componentDidUpdate = () => {
    api.historicalPrice(period).then((rawData) => {
      const reports: DataProps = rawData.map(({ date, price }) => [
        date,
        parseFloat(price.toFixed(2)),
      ]);

      setState((prevState) => ({ ...prevState, reports }));
    });
  };

  const componentDidMount = () => {
    changePage(PageKey.SWAP);

    api.volume(1).then((volume) => {
      setState((prevState) => ({ ...prevState, volume }));
    });

    fetchPrice().then((price) => {
      const provider = new JsonRpcProvider("https://api.vultisig.com/eth/");
      const contract = new Contract(
        ContractAddress.WETH_TOKEN,
        erc20Abi,
        provider
      );

      contract.totalSupply().then((totalSupply) => {
        setState((prevState) => ({
          ...prevState,
          marketCap: Number(formatEther(totalSupply)) * price,
          price,
        }));
      });
    });
  };

  useEffect(componentDidUpdate, [period]);
  useEffect(componentDidMount, []);

  return (
    <Content className="swap-page">
      <MediaQuery minWidth={1400}>
        <div className="aside">
          <SwapVult />
          <SwapFees />
        </div>
        <div className="main">
          <SwapStats marketCap={marketCap} price={price} volume={volume} />
          <SwapReports
            data={reports}
            period={period}
            onChangePeriod={handlePeriod}
          />
        </div>
      </MediaQuery>
      <MediaQuery maxWidth={1399}>
        <SwapStats marketCap={marketCap} price={price} volume={volume} />
        <SwapVult />
        <SwapFees />
        <SwapReports
          data={reports}
          period={period}
          onChangePeriod={handlePeriod}
        />
      </MediaQuery>
    </Content>
  );
};

export default Component;
