import { FeeAmount, Pool } from "@uniswap/v3-sdk";
import { Layout } from "antd";
import { Contract, formatEther } from "ethers";
import { useEffect, useState } from "react";
import MediaQuery from "react-responsive";
import { erc20Abi } from "viem";
import { useAccount } from "wagmi";

import { SettingsModal } from "@/components/SettingsModal";
import { SwapFees } from "@/components/SwapFees";
import { SwapHistory } from "@/components/SwapHistory";
import { SwapStats } from "@/components/SwapStats";
import { SwapVult } from "@/components/SwapVult";
import { SwapWhitelist } from "@/components/SwapWhitelist";
import { TradingViewWidget } from "@/components/TradingViewWidget";
import { useCore } from "@/hooks/useCore";
import { Stack, VStack } from "@/toolkits/Stack";
import { api } from "@/utils/api";
import { contractAddress, poolsAbi, uniswapTokens } from "@/utils/constants";
import { getRPCProvider } from "@/utils/providers";

const { Content } = Layout;

type StateProps = { marketCap: number; price: number; volume: number };

export const SwapPage = () => {
  const [state, setState] = useState<StateProps>({
    marketCap: 0,
    price: 0,
    volume: 0,
  });
  const { marketCap, price, volume } = state;
  const { setCurrentPage } = useCore();
  const { isConnected } = useAccount();

  const fetchPrice = async () => {
    const contract = new Contract(
      contractAddress.vultUsdcPool,
      poolsAbi,
      getRPCProvider()
    );
    const slot0 = await contract.slot0();
    const poolLiquidity = String(await contract.liquidity());
    const pool = new Pool(
      uniswapTokens.USDC,
      uniswapTokens.VULT,
      FeeAmount.HIGH,
      String(slot0.sqrtPriceX96),
      poolLiquidity,
      Number(slot0.tick)
    );
    return Number(pool.token1Price.toSignificant(8));
  };

  useEffect(() => {
    setCurrentPage("swap");

    api.volume().then((volume) => {
      setState((prevState) => ({ ...prevState, volume }));
    });

    fetchPrice().then((price) => {
      const contract = new Contract(
        contractAddress.vultToken,
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
    <>
      <Stack
        as={Content}
        $style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          maxWidth: "1600px",
          padding: "24px 16px",
          width: "100%",
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
          {!isConnected && <SwapWhitelist />}
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
          <TradingViewWidget />
          {isConnected && <SwapHistory />}
        </VStack>
      </Stack>
      <SettingsModal />
    </>
  );
};
