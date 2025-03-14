import { useState, useCallback } from "react";
import {
  BrowserProvider,
  Contract,
  formatUnits,
  parseUnits,
  Provider,
} from "ethers";
import { Token } from "@uniswap/sdk-core";
import { FeeAmount, computePoolAddress } from "@uniswap/v3-sdk";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";

import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { ContractAddress } from "utils/constants";

export const getBrowserProvider = (): Provider => {
  return new BrowserProvider(window.ethereum);
};
const getPoolConstants = async (tokenA: Token, tokenB: Token) => {
  const currentPoolAddress = computePoolAddress({
    factoryAddress: ContractAddress.POOL_FACTORY,
    tokenA,
    tokenB,
    fee: FeeAmount.MEDIUM,
  });

  const poolContract = new Contract(
    currentPoolAddress,
    IUniswapV3PoolABI.abi,
    getBrowserProvider()
  );

  const [token0, token1, fee] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
  ]);

  return { token0, token1, fee };
};

export const useUniswapQuote = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quote = useCallback(
    async (tokenA: Token, tokenB: Token, amountIn: number) => {
      setLoading(true);
      setError(null);
      try {
        const quoterContract = new Contract(
          ContractAddress.QUOTER,
          Quoter.abi,
          getBrowserProvider()
        );

        const quoteExactInputSingle = quoterContract.getFunction(
          "quoteExactInputSingle"
        );
        const poolConstants = await getPoolConstants(tokenA, tokenB);
        const quotedAmountOut = await quoteExactInputSingle.staticCall(
          poolConstants.token0,
          poolConstants.token1,
          poolConstants.fee,
          parseUnits(String(amountIn), tokenA.decimals).toString(),
          0
        );

        return parseFloat(
          formatUnits(quotedAmountOut, tokenB.decimals)
        ).toFixed(3);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { quote, loading, error };
};
