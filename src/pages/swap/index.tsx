import { FC, useEffect, useState } from "react";
import { Layout } from "antd";
import { FeeAmount, Pool } from "@uniswap/v3-sdk";
import { Contract, formatEther } from "ethers";
import { erc20Abi } from "viem";
import MediaQuery from "react-responsive";

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
import SwapReports from "components/swap-reports";
import SwapStats from "components/swap-stats";
import SwapVult from "components/swap-vult";
import SwapWhitelistCheck from "components/swap-whitelist-check";

const { Content } = Layout;

interface InitialState {
  marketCap: number;
  price: number;
  volume: number;
}

const Component: FC = () => {
  const initialState: InitialState = { marketCap: 0, price: 0, volume: 0 };
  const [state, setState] = useState(initialState);
  const { marketCap, price, volume } = state;
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

  const componentDidMount = () => {
    changePage(PageKey.SWAP);

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

  useEffect(componentDidMount, []);

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
        <SwapReports />
        <SwapHistory />
      </div>
    </Content>
  );
};

export default Component;
