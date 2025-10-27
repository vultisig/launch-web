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
import SwapStats from "components/swap-stats";
import SwapVult from "components/swap-vult";
import SwapWhitelistCheck from "components/swap-whitelist-check";

const { Content } = Layout;

interface InitialState {
  marketCap?: number;
  price?: number;
  volume?: number;
}

const Component: FC = () => {
  const initialState: InitialState = {};
  const [state, setState] = useState(initialState);
  const { marketCap, price, volume } = state;
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
        <iframe
          src={`https://www.geckoterminal.com/eth/pools/${ContractAddress.VULT_USDC_POOL}?embed=1&info=0&swaps=0&light_chart=0&chart_type=price&resolution=1m&bg_color=02122b`}
          allow="clipboard-write"
          style={{
            border: "none",
            borderRadius: 12,
            flexGrow: 1,
            width: "100%",
          }}
          allowFullScreen
        />
        <SwapHistory />
      </div>
    </Content>
  );
};

export default Component;
