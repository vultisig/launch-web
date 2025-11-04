import { Token } from "@uniswap/sdk-core";
import * as CSS from "csstype";
import { TxStatus } from "./constants";

type GasFeeEstimate = {
  suggestedMaxPriorityFeePerGas: string;
  suggestedMaxFeePerGas: string;
  minWaitTimeEstimate: number;
  maxWaitTimeEstimate: number;
};

export type CSSProperties = CSS.Properties<string>;

export type HistoricalPriceProps = { date: number; price: number };

export type GasSettingsProps = {
  gasLimit: number;
  maxFee: number;
  maxPriorityFee: number;
  mode: "ADVANCED" | "BASIC";
  slippage: number;
  speed: "Custom" | "Fast" | "Slow" | "Standard";
};

export type SuggestedGasFeeProps = {
  low: GasFeeEstimate;
  medium: GasFeeEstimate;
  high: GasFeeEstimate;
  estimatedBaseFee: string;
  networkCongestion: number;
  latestPriorityFeeRange: [string, string];
  historicalPriorityFeeRange: [string, string];
  historicalBaseFeeRange: [string, string];
  priorityFeeTrend: "up" | "down" | "stable";
  baseFeeTrend: "up" | "down" | "stable";
  version: string;
};

export type SwapFormProps = {
  allocateAmount: number;
  allocateToken: TickerKey;
  buyAmount: number;
  buyToken: TickerKey;
};

export type CreateLPTokensFormProps = {
  amount0: number;
  amount1: number;
  token0: TickerKey;
  token1: TickerKey;
};

export type TickerKey = "ETH" | "VULT" | "UNI" | "USDC" | "WETH";

export type TokenProps = {
  balance: number;
  cmcId: number;
  contractAddress?: string;
  decimals: number;
  isAirdropToken: boolean;
  isNative: boolean;
  name: string;
  ticker: TickerKey;
  value: number;
};

export type Tokens = Record<TickerKey, TokenProps>;

export type TransactionProps = {
  date: number;
  hash: string;
  status: TxStatus;
} & SwapFormProps;

export type ClaimTransactionProps = {
  amount: number;
  date: number;
  hash: string;
  status: TxStatus;
  isClaimed: boolean;
  eventId: number;
};

export type VultisigWalletProps = {
  hexChainCode: string;
  isFastVault: boolean;
  name: string;
  publicKeyEcdsa: string;
  publicKeyEddsa: string;
  uid: string;
};

export { Token as UniswapTokenProps };
