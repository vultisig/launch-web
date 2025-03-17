import {
  BrowserProvider,
  Contract,
  Provider,
  formatUnits,
  parseUnits,
} from "ethers";
import { FeeAmount, computePoolAddress } from "@uniswap/v3-sdk";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";

import {
  ContractAddress,
  Currency,
  TickerKey,
  defaultTokens,
} from "utils/constants";
import { UniswapTokenProps } from "utils/interfaces";
import api from "utils/api";

export const getBrowserProvider = (): Provider => {
  return new BrowserProvider(window.ethereum);
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
    getBrowserProvider()
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
  const poolContract = await getPoolConstant(tokenA, tokenB);
  const [rawPrice]: BigInt[] = await poolContract.slot0();

  if (rawPrice) {
    const price = Number(rawPrice) / Number(2n ** 96n);

    return parseFloat(price.toFixed(tokenB.decimals));
  } else {
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
      getBrowserProvider()
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

    return parseFloat(formatUnits(quotedAmountOut, tokenB.decimals)).toFixed(3);
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
