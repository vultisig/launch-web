import { useState, useCallback } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { encodeFunctionData } from "viem";
import { JsonRpcProvider, parseUnits } from "ethers";

import Router from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json";
import { ContractAddress } from "utils/constants";
import { UniswapTokenProps } from "utils/interfaces";
import { getStoredGasSettings } from "utils/storage";
import { getPoolConstants } from "utils/swap";

interface TokenSwapParams {
  tokenIn?: UniswapTokenProps;
  tokenOut?: UniswapTokenProps;
  amountIn?: number;
  amountOut?: number;
}
const useTokenSwap = ({
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
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
    if (
      !walletClient ||
      !address ||
      !tokenIn ||
      !tokenOut ||
      !amountIn ||
      !amountOut
    )
      return;
    const gasSetting = getStoredGasSettings();
    const poolConstants = await getPoolConstants(tokenIn, tokenOut);
    const parsedAmountIn = parseUnits(String(amountIn), tokenIn.decimals);
    try {
      setIsSwapping(true);
      setSwapError(null);
      const amountOutMinimum = parseUnits(
        String(amountOut * (100 - gasSetting.slippage)),
        tokenOut.decimals
      );
      const sqrtPriceLimitX96 = 0; // No price limit
      const swapData = encodeFunctionData({
        abi: Router.abi,
        functionName: "exactInputSingle",
        args: [
          {
            tokenIn: tokenIn.address as `0x${string}`,
            tokenOut: tokenOut.address as `0x${string}`,
            fee: poolConstants.fee,
            recipient: address,
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
        gas: gasSetting.gasLimit > 0 ? BigInt(gasSetting.gasLimit) : undefined,
        maxPriorityFeePerGas:
          gasSetting.maxPriorityFee > 0
            ? BigInt(parseUnits(gasSetting.maxPriorityFee.toString(), "gwei"))
            : undefined,
        maxFeePerGas:
          gasSetting.maxFee > 0
            ? BigInt(parseUnits(gasSetting.maxFee.toString(), "gwei"))
            : undefined,
        value: 0n, // No ETH needed unless swapping ETH
      });

      setTxHash(tx);
      await rpcClient.waitForTransaction(tx);
    } catch (error) {
      setSwapError(`Swap failed: ${error}`);
    } finally {
      setIsSwapping(false);
    }
  }, [
    walletClient,
    address,
    tokenIn,
    tokenOut,
    amountIn,
    getStoredGasSettings(),
  ]);

  return { executeSwap, isSwapping, swapError, txHash };
};

export default useTokenSwap;
