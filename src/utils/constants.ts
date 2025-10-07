import { ChainId, Token } from "@uniswap/sdk-core";

import { GasSettingsProps, TickerKey, TokenProps } from "@/utils/types";

export const modalHash = {
  bridge: "#bridge",
  connect: "#connect",
  merge: "#merge",
  pool: "#pool",
  stake: "#stake",
  staking: "#staking",
  wallet: "#wallet",
  withdraw: "#withdraw",
} as const;

export const contractAddress = {
  ethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  launchList: "0x334eb11D23c0C187A844B234BA0e52121F60Fdf7",
  poolFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  quoter: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  uniToken: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
  usdcToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  vult: "0xb788144df611029c60b859df47e79b7726c4deba",
  vultStake: "0xea56819d589d266b165b287e57d1b63efceb630c",
  vultWethPool: "0xeDeC8b375f256B7cf34f0b0d85A13E7b2E3F46af",
  wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  wethUsdcPool: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
} as const;

export const defaultTokens: Record<TickerKey, TokenProps> = {
  ETH: {
    balance: 0,
    cmcId: 1027,
    contractAddress: contractAddress.ethToken,
    decimals: 18,
    isAirdropToken: false,
    isNative: true,
    name: "Ethereum",
    ticker: "ETH",
    value: 0,
  },
  VULT: {
    balance: 0,
    cmcId: 33502,
    contractAddress: contractAddress.vult,
    decimals: 18,
    isAirdropToken: true,
    isNative: false,
    name: "Vult",
    ticker: "VULT",
    value: 0,
  },
  UNI: {
    balance: 0,
    cmcId: 7083,
    contractAddress: contractAddress.uniToken,
    decimals: 18,
    isAirdropToken: true,
    isNative: false,
    name: "Uniswap",
    ticker: "UNI",
    value: 0,
  },
  USDC: {
    balance: 0,
    cmcId: 3408,
    contractAddress: contractAddress.usdcToken,
    decimals: 6,
    isAirdropToken: false,
    isNative: false,
    name: "USD Coin",
    ticker: "USDC",
    value: 0,
  },
  WETH: {
    balance: 0,
    cmcId: 2396,
    contractAddress: contractAddress.wethToken,
    decimals: 18,
    isAirdropToken: false,
    isNative: false,
    name: "Wrapped Ether",
    ticker: "WETH",
    value: 0,
  },
};

export const uniswapTokens: Record<TickerKey, Token> = {
  ETH: new Token(
    ChainId.MAINNET,
    defaultTokens["ETH"].contractAddress,
    defaultTokens["ETH"].decimals,
    defaultTokens["ETH"].ticker,
    defaultTokens["ETH"].name
  ),
  UNI: new Token(
    ChainId.MAINNET,
    defaultTokens["UNI"].contractAddress,
    defaultTokens["UNI"].decimals,
    defaultTokens["UNI"].ticker,
    defaultTokens["UNI"].name
  ),
  VULT: new Token(
    ChainId.MAINNET,
    defaultTokens["VULT"].contractAddress,
    defaultTokens["VULT"].decimals,
    defaultTokens["VULT"].ticker,
    defaultTokens["VULT"].name
  ),
  USDC: new Token(
    ChainId.MAINNET,
    defaultTokens["USDC"].contractAddress,
    defaultTokens["USDC"].decimals,
    defaultTokens["USDC"].ticker,
    defaultTokens["USDC"].name
  ),
  WETH: new Token(
    ChainId.MAINNET,
    defaultTokens["WETH"].contractAddress,
    defaultTokens["WETH"].decimals,
    defaultTokens["WETH"].ticker,
    defaultTokens["WETH"].name
  ),
};

export const defaultGasSettings: GasSettingsProps = {
  gasLimit: 200000,
  maxFee: 4,
  maxPriorityFee: 1,
  mode: "BASIC",
  slippage: 0.5,
  speed: "Standard",
};

export const poolsAbi = [
  {
    inputs: [],
    name: "slot0",
    outputs: [
      { internalType: "uint160", name: "sqrtPriceX96", type: "uint160" },
      { internalType: "int24", name: "tick", type: "int24" },
      { internalType: "uint16", name: "observationIndex", type: "uint16" },
      {
        internalType: "uint16",
        name: "observationCardinality",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "observationCardinalityNext",
        type: "uint16",
      },
      { internalType: "uint8", name: "feeProtocol", type: "uint8" },
      { internalType: "bool", name: "unlocked", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "liquidity",
    outputs: [{ internalType: "uint128", name: "", type: "uint128" }],
    stateMutability: "view",
    type: "function",
  },
];
