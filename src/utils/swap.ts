import { Contract, formatUnits, parseUnits } from "ethers";
import { FeeAmount, computePoolAddress } from "@uniswap/v3-sdk";
import { encodeFunctionData, erc20Abi } from "viem";
import { useWalletClient } from "wagmi";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import Router from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";

import {
  ContractAddress,
  Currency,
  TickerKey,
  defaultTokens,
} from "utils/constants";
import { UniswapTokenProps } from "utils/interfaces";
import { getStoredGasSettings } from "utils/storage";
import api from "utils/api";
import { getRPCProvider } from "utils/providers";

export const checkApproval = async (
  allocateAmount: number,
  tokenAddress: string,
  tokenDecimals: number,
  vaultAddress: string
) => {
  try {
    const rpcClient = getRPCProvider();
    const tokenContract = new Contract(tokenAddress, erc20Abi, rpcClient);
    const approvedAmount: number = await tokenContract.allowance(
      vaultAddress,
      ContractAddress.SWAP_ROUTER
    );

    return {
      approvedAmount,
      needsApproval:
        allocateAmount > 0
          ? Number(formatUnits(approvedAmount, tokenDecimals)) < allocateAmount
          : false,
    };
  } catch (error) {
    console.error("Error checking approval:", error);

    return { approvedAmount: 0, needsApproval: true };
  }
};

export const encodeApproval = (spender: `0x${string}`, amount: bigint) => {
  return encodeFunctionData({
    abi: erc20Abi,
    functionName: "approve",
    args: [spender, amount],
  });
};

export const executeSwap = async (
  amountIn: number,
  amountOut: number,
  tokenIn: UniswapTokenProps,
  tokenOut: UniswapTokenProps,
  vaultAddress: string
) => {
  try {
    const { data } = useWalletClient();

    if (data) {
      const gasSetting = getStoredGasSettings();
      const rpcClient = getRPCProvider();
      const poolConstants = await getPoolConstants(tokenIn, tokenOut);
      const parsedAmountIn = parseUnits(String(amountIn), tokenIn.decimals);
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
            recipient: vaultAddress,
            deadline: Math.floor(Date.now() / 1000) + 60 * 10, // 10 min deadline
            amountIn: BigInt(parsedAmountIn),
            amountOutMinimum,
            sqrtPriceLimitX96,
          },
        ],
      });

      const tx = await data.sendTransaction({
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

      await rpcClient.waitForTransaction(tx);

      return tx;
    }
  } catch (error) {
    console.log(`Swap failed: ${error}`);
  }
};

export const getPoolConstant = async (
  tokenA: UniswapTokenProps,
  tokenB: UniswapTokenProps
) => {
  const currentPoolAddress = computePoolAddress({
    factoryAddress: ContractAddress.POOL_FACTORY,
    tokenA,
    tokenB,
    fee: FeeAmount.MEDIUM,
  });

  const poolContract = new Contract(
    currentPoolAddress,
    IUniswapV3PoolABI.abi,
    getRPCProvider()
  );

  return poolContract;
};

export const getPoolConstants = async (
  tokenA: UniswapTokenProps,
  tokenB: UniswapTokenProps
) => {
  const poolContract = await getPoolConstant(tokenA, tokenB);

  const [token0, token1, fee] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
  ]);

  return { token0, token1, fee };
};

export const getPoolPrice = async (
  tokenA: UniswapTokenProps,
  tokenB: UniswapTokenProps
): Promise<number> => {
  try {
    const poolContract = await getPoolConstant(tokenA, tokenB);
    const [rawPrice]: BigInt[] = await poolContract.slot0();

    if (rawPrice) {
      const price = Number(rawPrice) / Number(2n ** 96n);

      return parseFloat(price.toFixed(tokenB.decimals));
    } else {
      return 0;
    }
  } catch {
    return 0;
  }
};

export const getUniswapQuote = async (
  tokenA: UniswapTokenProps,
  tokenB: UniswapTokenProps,
  amountIn: number
) => {
  try {
    const quoterContract = new Contract(
      ContractAddress.QUOTER,
      Quoter.abi,
      getRPCProvider()
    );

    const quoteExactInputSingle = quoterContract.getFunction(
      "quoteExactInputSingle"
    );

    const poolConstants = await getPoolConstants(tokenA, tokenB);

    const quotedAmountOut = await quoteExactInputSingle.staticCall(
      tokenA.address,
      tokenB.address,
      poolConstants.fee,
      parseUnits(String(amountIn), tokenA.decimals).toString(),
      0
    );

    return parseFloat(
      parseFloat(formatUnits(quotedAmountOut, tokenB.decimals)).toFixed(3)
    );
  } catch (err) {
    if (err instanceof Error) {
      return Promise.reject(err.message);
    } else {
      return Promise.reject("An unknown error occurred");
    }
  }
};

export const getTokensValue = async () => {
  const data: Record<TickerKey, number> = {
    [TickerKey.ETH]: 0,
    [TickerKey.UNI]: 0,
    [TickerKey.USDC]: 0,
    [TickerKey.WETH]: 0,
  };

  return api
    .values(
      Object.values(defaultTokens).map(({ cmcId }) => cmcId),
      Currency.USD
    )
    .then((values) => {
      Object.values(defaultTokens).forEach(({ cmcId, ticker }) => {
        if (values[cmcId]) data[ticker] = values[cmcId];
      });

      return data;
    })
    .catch(() => data);
};

export const requestApproval = async (
  allocateAmount: number,
  tokenAddress: string,
  tokenDecimals: number
) => {
  try {
    const { data } = useWalletClient();

    if (data) {
      const gasSetting = getStoredGasSettings();
      const rpcClient = getRPCProvider();
      const approvalData = encodeApproval(
        ContractAddress.SWAP_ROUTER as `0x${string}`,
        parseUnits(String(allocateAmount), tokenDecimals)
      );

      const tx = await data.sendTransaction({
        to: tokenAddress as `0x${string}`,
        data: approvalData,
        gas: gasSetting.gasLimit > 0 ? BigInt(gasSetting.gasLimit) : undefined,
        maxPriorityFeePerGas:
          gasSetting.maxPriorityFee > 0
            ? BigInt(parseUnits(String(gasSetting.maxPriorityFee), "gwei"))
            : undefined,
        maxFeePerGas:
          gasSetting.maxFee > 0
            ? BigInt(parseUnits(String(gasSetting.maxFee), "gwei"))
            : undefined,
      });

      await rpcClient.waitForTransaction(tx);
    }
  } catch (error) {
    console.error("Approval failed:", error);
  }
};
