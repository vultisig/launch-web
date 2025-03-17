import { Token } from "@uniswap/sdk-core";

import {
  ContractAddress,
  GasSettingsMode,
  GasSettingsSpeed,
  TickerKey,
} from "utils/constants";

export interface GasSettingsProps {
  gasLimit: number;
  maxFee: number;
  maxPriorityFee: number;
  mode: GasSettingsMode;
  slippage: number;
  speed: GasSettingsSpeed;
}

export interface SwapFormProps {
  allocateAmount: number;
  allocateCoin: TickerKey;
  buyAmount: number;
  buyCoin: TickerKey;
}

export interface TokenProps {
  balance: number;
  cmcId: number;
  contractAddress: ContractAddress;
  decimals: number;
  isAirdropToken: boolean;
  isNative: boolean;
  name: string;
  ticker: TickerKey;
  value: number;
}

export { Token as UniswapTokenProps };
