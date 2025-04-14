import { Token } from "@uniswap/sdk-core";

import {
  ContractAddress,
  GasSettingsMode,
  GasSettingsSpeed,
  TickerKey,
  TxStatus,
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
  allocateToken: TickerKey;
  buyAmount: number;
  buyToken: TickerKey;
}

export interface InvestClaimFormProps {
  rewardAmount: number;
  rewardToken: TickerKey;
  stakeAmount: number;
  stakeToken: TickerKey;
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

export interface TransactionProps extends SwapFormProps {
  date: number;
  hash: string;
  status: TxStatus;
}

export { Token as UniswapTokenProps };
