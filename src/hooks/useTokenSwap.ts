import { useState, useCallback } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { encodeFunctionData, parseUnits } from "viem";
import { JsonRpcProvider } from "ethers";

import Router from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json";
import { ContractAddress } from "utils/constants";
import { Token } from "utils/tokens";

interface TokenSwapParams {
  tokenIn?: Token;
  tokenOut?: Token;
  amountIn?: number;
  slippageBps?: number | undefined;
  fee?: number | undefined;
}
const useTokenSwap = ({
  tokenIn,
  tokenOut,
  amountIn,
  slippageBps = 50, // 0.5% default slippage
  fee = 3000, // 0.3% Uniswap pool fee
}: TokenSwapParams) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const rpcClient = new JsonRpcProvider(
    `${import.meta.env.VITE_SERVER_ADDRESS}/eth/`
  );

  const executeSwap = useCallback(async () => {
    if (!walletClient || !address || !tokenIn || !tokenOut || !amountIn) return;
    const parsedAmountIn = parseUnits(String(amountIn), tokenIn.decimals);
    try {
      setIsSwapping(true);
      setSwapError(null);
      const recipient = address;
      const amountOutMinimum =
        (BigInt(parsedAmountIn) * BigInt(10000 - slippageBps)) / BigInt(10000);
      const sqrtPriceLimitX96 = 0; // No price limit

      const swapData = encodeFunctionData({
        abi: Router.abi,
        functionName: "exactInputSingle",
        args: [
          {
            tokenIn: tokenIn.address as `0x${string}`,
            tokenOut: tokenOut.address as `0x${string}`,
            fee,
            recipient,
            deadline: Math.floor(Date.now() / 1000) + 60 * 10, // 10 min deadline
            amountIn: BigInt(parsedAmountIn),
            amountOutMinimum,
            sqrtPriceLimitX96,
          },
        ],
      });

      const tx = await walletClient.sendTransaction({
        to: ContractAddress.SWAP_ROUTER as `0x${string}`,
        data: swapData,
        value: 0n, // No ETH needed unless swapping ETH
      });

      setTxHash(tx);
      await rpcClient.waitForTransaction(tx);
    } catch (error) {
      setSwapError(`Swap failed: ${error}`);
    } finally {
      setIsSwapping(false);
    }
  }, [walletClient, address, tokenIn, tokenOut, amountIn, slippageBps, fee]);

  return { executeSwap, isSwapping, swapError, txHash };
};

export default useTokenSwap;
