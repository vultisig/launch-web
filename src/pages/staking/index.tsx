import { FC, useEffect, useState } from "react";
import { Layout } from "antd";
import { FeeAmount, Pool } from "@uniswap/v3-sdk";
import { Contract, formatEther } from "ethers";
import { erc20Abi } from "viem";

import { useBaseContext } from "context";
import {
  POOLS_ABI,
  ContractAddress,
  PageKey,
  Period,
  uniswapTokens,
  TickerKey,
} from "utils/constants";
import { getRPCProvider } from "utils/providers";
import api from "utils/api";

import Staking from "components/stake-vult";

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
  const {  period } = state;
  const { changePage } = useBaseContext();

  const fetchPrice = async () => {
    const contract = new Contract(
      ContractAddress.WETH_USDC_POOL,
      POOLS_ABI,
      getRPCProvider()
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
;

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
    changePage(PageKey.STAKING);

    api.volume(1).then((volume) => {
      setState((prevState) => ({ ...prevState, volume }));
    });

    fetchPrice().then((price) => {
      const contract = new Contract(
        ContractAddress.WETH_TOKEN,
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
  };

  useEffect(componentDidUpdate, [period]);
  useEffect(componentDidMount, []);

  return (
    <Content className="stacking">
      <div className="aside">
        <Staking />
      </div>
    </Content>
  );
};

export default Component;
