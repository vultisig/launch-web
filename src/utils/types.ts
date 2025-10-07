import { Token } from "@uniswap/sdk-core";

export type GasSettingsMode = "ADVANCED" | "BASIC";

export type GasSettingsProps = {
  gasLimit: number;
  maxFee: number;
  maxPriorityFee: number;
  mode: GasSettingsMode;
  slippage: number;
  speed: "Custom" | "Fast" | "Slow" | "Standard";
};

export type SwapFormProps = {
  allocateAmount: number;
  allocateToken: TickerKey;
  buyAmount: number;
  buyToken: TickerKey;
};

export type TickerKey = "ETH" | "VULT" | "UNI" | "USDC" | "WETH";

export type TokenProps = {
  balance: number;
  cmcId: number;
  contractAddress: string;
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

export type TxStatus = "failed" | "pending" | "success";

export { Token as UniswapTokenProps };
