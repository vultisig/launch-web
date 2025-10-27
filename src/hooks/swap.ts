import { Contract, formatUnits, parseUnits } from "ethers";
import { encodeFunctionData, erc20Abi } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import {
  FeeAmount,
  Pool,
  TICK_SPACINGS,
  computePoolAddress,
} from "@uniswap/v3-sdk";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import Router from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";

import { LAUNCH_LIST_ABI } from "utils/abis/launchList";
import {
  ContractAddress,
  Currency,
  TickerKey,
  TxStatus,
  defaultTokens,
} from "utils/constants";
import { UniswapTokenProps } from "utils/interfaces";
import { getBrowserProvider, getRPCProvider } from "utils/providers";
import { getStoredGasSettings } from "utils/storage";
import api from "utils/api";
import { useEffect, useState } from "react";

interface InitialState {
  isWhitelist: boolean;
}

const useSwapVult = () => {
  const initialState: InitialState = {
    isWhitelist: false,
  };
  const [state, setState] = useState(initialState);
  const { isWhitelist } = state;
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const gasSetting = getStoredGasSettings();
  const rpcClient = getRPCProvider();

  const checkApproval = async (
    allocateAmount: number,
    token: UniswapTokenProps
  ) => {
    try {
      if (!address) {
        return { approvedAmount: 0, needsApproval: true };
      }

      if (isETH(token)) {
        // ETH doesn't need approval
        return {
          approvedAmount: allocateAmount,
          needsApproval: false,
        };
      }

      const tokenContract = new Contract(token.address, erc20Abi, rpcClient);
      const approvedAmount: number = await tokenContract.allowance(
        address,
        ContractAddress.SWAP_ROUTER
      );

      return {
        approvedAmount,
        needsApproval:
          allocateAmount > 0
            ? Number(formatUnits(approvedAmount, token.decimals)) <
              allocateAmount
            : false,
      };
    } catch (error) {
      console.error("Error checking approval:", error);

      return { approvedAmount: 0, needsApproval: true };
    }
  };

  const encodeApproval = (spender: `0x${string}`, amount: bigint) => {
    return encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, amount],
    });
  };
  const isETH = (token: UniswapTokenProps) => token.symbol === "ETH";
  const executeSwap = async (
    amountIn: number,
    amountOut: number,
    tokenIn: UniswapTokenProps,
    tokenOut: UniswapTokenProps
  ) => {
    try {
      if (!address || !walletClient) throw new Error("");

      const poolConstants = await getPoolConstants(tokenIn, tokenOut);
      const parsedAmountIn = parseUnits(String(amountIn), tokenIn.decimals);
      const amountOutMinimum = parseUnits(
        String(amountOut * (1 - gasSetting.slippage / 100)),
        tokenOut.decimals
      );
      const sqrtPriceLimitX96 = 0; // No price limit
      // Always use WETH address for Uniswap
      const isOutETH = isETH(tokenOut);
      const actualTokenIn = isETH(tokenIn)
        ? ContractAddress.WETH_TOKEN
        : tokenIn.address;
      const actualTokenOut = isETH(tokenOut)
        ? ContractAddress.WETH_TOKEN
        : tokenOut.address;
      const swapCallData = encodeFunctionData({
        abi: Router.abi,
        functionName: "exactInputSingle",
        args: [
          {
            tokenIn: actualTokenIn as `0x${string}`,
            tokenOut: actualTokenOut as `0x${string}`,
            fee: poolConstants.fee,
            recipient: isOutETH ? ContractAddress.SWAP_ROUTER : address,
            deadline: Math.floor(Date.now() / 1000) + 60 * 10, // 10 min deadline
            amountIn: BigInt(parsedAmountIn),
            amountOutMinimum,
            sqrtPriceLimitX96,
          },
        ],
      });

      const callData = isOutETH
        ? encodeFunctionData({
            abi: Router.abi,
            functionName: "multicall",
            args: [
              [
                swapCallData,
                encodeFunctionData({
                  abi: Router.abi,
                  functionName: "unwrapWETH9",
                  args: [amountOutMinimum, address],
                }),
              ],
            ],
          })
        : swapCallData;

      const tx = await walletClient.sendTransaction({
        to: ContractAddress.SWAP_ROUTER as `0x${string}`,
        data: callData,
        gas: gasSetting.gasLimit > 0 ? BigInt(gasSetting.gasLimit) : undefined,
        maxPriorityFeePerGas:
          gasSetting.maxPriorityFee > 0
            ? BigInt(parseUnits(gasSetting.maxPriorityFee.toString(), "gwei"))
            : undefined,
        maxFeePerGas:
          gasSetting.maxFee > 0
            ? BigInt(parseUnits(gasSetting.maxFee.toString(), "gwei"))
            : undefined,
        value: isETH(tokenIn) ? BigInt(parsedAmountIn) : 0n,
      });

      return tx;
    } catch (error) {
      console.log(`Swap failed: ${error}`);
    }
  };

  const getAddressSpentUSDC = async (address: string): Promise<number> => {
    const launchListContract = new Contract(
      ContractAddress.LAUNCH_LIST,
      LAUNCH_LIST_ABI,
      rpcClient
    );

    try {
      const usdcValue = await launchListContract.addressUsdcSpent(address);
      return Number(formatUnits(usdcValue, 6));
    } catch (error) {
      console.error("Error fetching spent USDC of address:", error);
      return 0;
    }
  };

  const getCurrentPhase = async (): Promise<number> => {
    const launchListContract = new Contract(
      ContractAddress.LAUNCH_LIST,
      LAUNCH_LIST_ABI,
      rpcClient
    );

    try {
      const currentPhase = await launchListContract.currentPhase();
      return Number(currentPhase);
    } catch (error) {
      console.error("Error fetching current phase:", error);
      return 0;
    }
  };

  const getMaxNetworkFee = (ethPrice: number) => {
    // Convert Gwei to ETH (1 Gwei = 10^-9 ETH)
    const maxFeeEth = gasSetting.maxFee * 1e-9;
    const maxPriorityFeeEth = gasSetting.maxPriorityFee * 1e-9;

    // Calculate max network fee in ETH
    const maxNetworkFeeEth =
      (maxFeeEth + maxPriorityFeeEth) * gasSetting.gasLimit;

    // Convert to USD
    const maxNetworkFeeUsd = maxNetworkFeeEth * ethPrice;

    return maxNetworkFeeUsd;
  };

  const getPoolConstant = async (
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
      rpcClient
    );

    return poolContract;
  };

  const getPoolConstants = async (
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

  const getPoolPrice = async (
    tokenA: UniswapTokenProps,
    tokenB: UniswapTokenProps
  ): Promise<number> => {
    try {
      const poolContract = await getPoolConstant(tokenA, tokenB);
      const [sqrtPriceX96]: BigInt[] = await poolContract.slot0();

      if (sqrtPriceX96) {
        const price = (Number(sqrtPriceX96) / Number(2n ** 96n)) ** 2;

        return parseFloat(price.toFixed(tokenB.decimals));
      } else {
        return 0;
      }
    } catch {
      return 0;
    }
  };

  const getPriceImpact = async (
    tokenA: UniswapTokenProps,
    tokenB: UniswapTokenProps,
    amountIn: number
  ): Promise<number> => {
    try {
      const poolContract = await getPoolConstant(tokenA, tokenB);
      const fee = await poolContract.fee();
      const liquidity = await poolContract.liquidity();
      const slot0 = await poolContract.slot0();
      const sqrtPriceX96 = slot0.sqrtPriceX96;
      const currentTick = Number(slot0.tick);
      const feeAmount = Number(fee);

      const tickSpacing =
        TICK_SPACINGS[feeAmount as keyof typeof TICK_SPACINGS];
      if (!tickSpacing) {
        throw new Error(`Unsupported fee amount: ${feeAmount}`);
      }

      const pool = new Pool(
        tokenA,
        tokenB,
        feeAmount,
        String(sqrtPriceX96),
        String(liquidity),
        currentTick
      );

      // Calculate actual pool TVL based on current liquidity and prices
      const token0Price = parseFloat(pool.token0Price.toSignificant(18));
      const token1Price = parseFloat(pool.token1Price.toSignificant(18));

      // Get the prices in a common denomination (USD)
      // Assuming one of the tokens is a stablecoin or we have price feeds
      // For token price in USD, we may need external price feeds if neither token is a stablecoin
      const token0PriceUSD =
        tokenA.symbol === "USDC" ||
        tokenA.symbol === "USDT" ||
        tokenA.symbol === "DAI"
          ? 1
          : token0Price;
      const token1PriceUSD =
        tokenB.symbol === "USDC" ||
        tokenB.symbol === "USDT" ||
        tokenB.symbol === "DAI"
          ? 1
          : token1Price;

      // Calculate the square root of the price for the geometric mean
      const priceRatio = Math.sqrt(token0PriceUSD * token1PriceUSD);

      // Calculate approximate TVL using the liquidity value
      // This is a simplified approximation based on the liquidity formula L = sqrt(x * y)
      const poolLiquidityInUnits = parseFloat(liquidity.toString()) / 1e18; // Normalize the liquidity units
      const poolTVL = poolLiquidityInUnits * priceRatio * 2; // Multiply by 2 for both sides of the pool

      // Fallback to a reasonable default if the calculation gives an unrealistic value
      const effectivePoolTVL =
        poolTVL > 100000 && poolTVL < 1000000000 ? poolTVL : 10000000; // Fallback to $10M if calculation seems off

      // Linear impact calculation - more realistic for typical trade sizes
      const baseImpact = (amountIn / (effectivePoolTVL * 0.5)) * 100;

      // Ensure minimum impact (even small trades have some impact)
      return Math.max(baseImpact, 0.01);
    } catch (error) {
      console.error("Error calculating price impact:", error);
      return 0;
    }
  };

  const getTxStatus = async (txHash: string): Promise<TxStatus> => {
    const provider = await getBrowserProvider();
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return TxStatus.PENDING;
    }

    return receipt.status === 1 ? TxStatus.SUCCESS : TxStatus.FAILED;
  };

  const getTxStatuses = async (txHashes: string[]): Promise<TxStatus[]> => {
    const provider = await getBrowserProvider();
    if (!provider) {
      console.error("Ethereum provider is not available.");
      return [];
    }

    const receipts = await Promise.all(
      txHashes.map((txHash) => provider.getTransactionReceipt(txHash))
    );

    return receipts.map((receipt) =>
      receipt === null
        ? TxStatus.PENDING
        : receipt.status === 1
        ? TxStatus.SUCCESS
        : TxStatus.FAILED
    );
  };

  const getTokensValue = async () => {
    const data: Record<TickerKey, number> = {
      [TickerKey.ETH]: 0,
      [TickerKey.VULT]: 0,
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

  const getUniswapQuote = async (
    tokenA: UniswapTokenProps,
    tokenB: UniswapTokenProps,
    amountIn: number
  ) => {
    try {
      const quoterContract = new Contract(
        ContractAddress.QUOTER,
        Quoter.abi,
        rpcClient
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

  const isAddressWhitelisted = async (address: string): Promise<boolean> => {
    const launchListContract = new Contract(
      ContractAddress.LAUNCH_LIST,
      LAUNCH_LIST_ABI,
      rpcClient
    );

    try {
      const isWhitelisted = await launchListContract.isAddressOnLaunchList(
        address
      );
      return isWhitelisted;
    } catch (error) {
      console.error("Error checking whitelist status:", error);
      return false;
    }
  };

  const requestApproval = async (
    allocateAmount: number,
    tokenAddress: string,
    tokenDecimals: number
  ) => {
    try {
      if (!walletClient) throw new Error("");

      const approvalData = encodeApproval(
        ContractAddress.SWAP_ROUTER as `0x${string}`,
        parseUnits(String(allocateAmount), tokenDecimals)
      );

      const tx = await walletClient.sendTransaction({
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

      return tx;
    } catch (error) {
      console.error("Approval failed:", error);
      throw new Error("Approval failed:");
    }
  };

  const waitForTxConfirmation = async (txHash: string): Promise<TxStatus> => {
    const provider = await getBrowserProvider();

    try {
      const receipt = await provider.waitForTransaction(txHash);
      if (receipt) {
        return receipt.status === 1 ? TxStatus.SUCCESS : TxStatus.FAILED;
      }
    } catch (error) {
      console.error("Error waiting for transaction:", error);
    }

    return TxStatus.PENDING; // If an error occurs or receipt is null, assume pending
  };

  useEffect(() => {
    if (address) {
      isAddressWhitelisted(address).then((isWhitelist) => {
        setState((prevState) => ({ ...prevState, isWhitelist }));
      });
    } else {
      setState((prevState) => ({ ...prevState, isWhitelist: false }));
    }
  }, [address]);

  return {
    isWhitelist,
    checkApproval,
    executeSwap,
    getAddressSpentUSDC,
    getCurrentPhase,
    getPoolConstants,
    getMaxNetworkFee,
    getPoolPrice,
    getPriceImpact,
    getTxStatus,
    getTxStatuses,
    getTokensValue,
    getUniswapQuote,
    isAddressWhitelisted,
    requestApproval,
    waitForTxConfirmation,
  };
};

export default useSwapVult;
