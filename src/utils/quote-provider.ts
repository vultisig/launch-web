import {
  Contract,
  JsonRpcProvider,
  formatUnits,
  parseUnits,
  Provider,
} from "ethers";
import { ChainId, Token } from "@uniswap/sdk-core";
import { FeeAmount, computePoolAddress } from "@uniswap/v3-sdk";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { CONTRACTS } from "./contracts";

// Constants
const READABLE_FORM_LEN = 4;
export const WETH_TOKEN = new Token(
  ChainId.MAINNET,
  CONTRACTS.WETHToken,
  18,
  "WETH",
  "Wrapped Ether"
);
export const USDC_TOKEN = new Token(
  ChainId.MAINNET,
  CONTRACTS.USDCToken,
  6,
  "USDC",
  "USD//C"
);

// Functions
const fromReadableAmount = (amount: number, decimals: number): bigint => {
  return parseUnits(amount.toString(), decimals);
};

const toReadableAmount = (rawAmount: number, decimals: number): string => {
  return formatUnits(rawAmount, decimals).slice(0, READABLE_FORM_LEN);
};

const getProvider = (): Provider => {
  return new JsonRpcProvider(import.meta.env.VITE_RPC_MAINNET);
};

const getPoolConstants = async (
  tokenA: Token,
  tokenB: Token
): Promise<{
  token0: string;
  token1: string;
  fee: number;
}> => {
  const currentPoolAddress = computePoolAddress({
    factoryAddress: CONTRACTS.poolFactory,
    tokenA,
    tokenB,
    fee: FeeAmount.MEDIUM,
  });

  const poolContract = new Contract(
    currentPoolAddress,
    IUniswapV3PoolABI.abi,
    getProvider()
  );

  const [token0, token1, fee] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
  ]);

  return { token0, token1, fee };
};

export const quote = async (
  tokenA: Token,
  tokenB: Token,
  amountIn: number
): Promise<number> => {
  const quoterContract = new Contract(
    CONTRACTS.quoter,
    Quoter.abi,
    getProvider()
  );
  const quoteExactInputSingle = quoterContract.getFunction(
    "quoteExactInputSingle"
  );
  const poolConstants = await getPoolConstants(tokenA, tokenB);
  const quotedAmountOut = await quoteExactInputSingle.staticCall(
    poolConstants.token0,
    poolConstants.token1,
    poolConstants.fee,
    fromReadableAmount(amountIn, tokenA.decimals).toString(),
    0
  );

  return parseFloat(toReadableAmount(quotedAmountOut, tokenB.decimals));
};
