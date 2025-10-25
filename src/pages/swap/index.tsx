import { FeeAmount, Pool } from "@uniswap/v3-sdk";
import { Layout } from "antd";
import { Contract, formatEther } from "ethers";
import { FC, useEffect, useState } from "react";
import MediaQuery from "react-responsive";
import { erc20Abi } from "viem";

import { SwapFees } from "@/components/swap-fees";
import { SwapHistory } from "@/components/swap-history";
import { SwapStats } from "@/components/swap-stats";
import { SwapVult } from "@/components/swap-vult";
import { SwapWhitelistCheck } from "@/components/swap-whitelist-check";
import { SwapReports } from "@/components/SwapReports";
import { useCore } from "@/hooks/useCore";
import { Stack, VStack } from "@/toolkits/Stack";
import { api } from "@/utils/api";
import { contractAddress, poolsAbi, uniswapTokens } from "@/utils/constants";
import { getRPCProvider } from "@/utils/providers";

const { Content } = Layout;

interface InitialState {
  marketCap: number;
  price: number;
  volume: number;
}

export const SwapPage: FC = () => {
  const initialState: InitialState = { marketCap: 0, price: 0, volume: 0 };
  const [state, setState] = useState(initialState);
  const { marketCap, price, volume } = state;
  const { setCurrentPage } = useCore();

  const fetchPrice = async () => {
    const contract = new Contract(
      contractAddress.wethUsdcPool,
      poolsAbi,
      getRPCProvider()
    );
    const slot0 = await contract.slot0();
    const poolLiquidity = String(await contract.liquidity());
    const pool = new Pool(
      uniswapTokens.WETH,
      uniswapTokens.USDC,
      FeeAmount.HIGH,
      String(slot0.sqrtPriceX96),
      poolLiquidity,
      Number(slot0.tick)
    );
    return Number(pool.token1Price.toSignificant(6));
  };

  useEffect(() => {
    setCurrentPage("swap");

    api.volume(1).then((volume) => {
      setState((prevState) => ({ ...prevState, volume }));
    });

    fetchPrice().then((price) => {
      const contract = new Contract(
        contractAddress.wethToken,
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
  }, []);

  return (
    <Stack
      as={Content}
      $style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        maxWidth: "1600px",
      }}
      $media={{ xl: { $style: { flexDirection: "row-reverse" } } }}
    >
      <VStack
        $style={{ gap: "16px" }}
        $media={{ xl: { $style: { flex: "none", width: "400px" } } }}
      >
        <MediaQuery maxWidth={1199}>
          <SwapStats marketCap={marketCap} price={price} volume={volume} />
        </MediaQuery>
        <SwapWhitelistCheck />
        <SwapVult />
        <SwapFees />
      </VStack>
      <VStack
        $style={{ gap: "16px" }}
        $media={{ xl: { $style: { flexGrow: "1", overflow: "hidden" } } }}
      >
        <MediaQuery minWidth={1200}>
          <SwapStats marketCap={marketCap} price={price} volume={volume} />
        </MediaQuery>
        <SwapReports />
        <SwapHistory />
      </VStack>
    </Stack>
  );
};
