import { ChainId, Token } from "@uniswap/sdk-core";

import { ContractAddress, TickerKey } from "utils/constants";

// Constants
export { Token };

export const ETH_TOKEN = new Token(
  ChainId.MAINNET,
  ContractAddress.WETH_TOKEN,
  18,
  TickerKey.ETH,
  "Ethereum"
);

export const USDC_TOKEN = new Token(
  ChainId.MAINNET,
  ContractAddress.USDC_TOKEN,
  6,
  TickerKey.USDC,
  "USD Coin"
);

export const VULT_TOKEN = new Token(
  ChainId.MAINNET,
  ContractAddress.WETH_TOKEN,
  18,
  TickerKey.VULT,
  "Vult"
);

export const WETH_TOKEN = new Token(
  ChainId.MAINNET,
  ContractAddress.WETH_TOKEN,
  18,
  TickerKey.WETH,
  "Wrapped Ether"
);

export const tokens: Record<TickerKey, Token> = {
  [TickerKey.ETH]: ETH_TOKEN,
  [TickerKey.VULT]: VULT_TOKEN,
  [TickerKey.USDC]: USDC_TOKEN,
  [TickerKey.WETH]: WETH_TOKEN,
};
