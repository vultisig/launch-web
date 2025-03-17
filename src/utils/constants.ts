import { ChainId, Token } from "@uniswap/sdk-core";

import { TokenProps } from "utils/interfaces";

export enum ChainKey {
  ARBITRUM = "Arbitrum",
  AVALANCHE = "Avalanche",
  BASE = "Base",
  BITCOIN = "Bitcoin",
  BITCOINCASH = "BitcoinCash",
  BLAST = "Blast",
  BSCCHAIN = "BSC",
  CRONOSCHAIN = "CronosChain",
  DASH = "Dash",
  DOGECOIN = "Dogecoin",
  DYDX = "Dydx",
  ETHEREUM = "Ethereum",
  GAIACHAIN = "Cosmos",
  KUJIRA = "Kujira",
  LITECOIN = "Litecoin",
  MAYACHAIN = "MayaChain",
  NOBLE = "Noble",
  OPTIMISM = "Optimism",
  OSMOSIS = "Osmosis",
  POLKADOT = "Polkadot",
  POLYGON = "Polygon",
  SOLANA = "Solana",
  SUI = "Sui",
  TERRA = "Terra",
  TERRACLASSIC = "TerraClassic",
  THORCHAIN = "THORChain",
  TON = "TON",
  TRON = "Tron",
  XRP = "XRP",
  ZKSYNC = "Zksync",
}

export enum HashKey {
  BRIDGE = "#BRIDGE",
  CONNECT = "#CONNECT",
  MERGE = "#MERGE",
  WALLET = "#WALLET",
}

export enum PageKey {
  MERGE = "1",
  SETTINGS = "2",
  SWAP = "3",
}

export enum ContractAddress {
  POOL_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  QUOTER = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  SWAP_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  UNI_TOKEN = "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
  USDC_TOKEN = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  WETH_USDC_POOL = "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
  WETH_TOKEN = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
}

export enum Currency {
  AUD = "AUD",
  CAD = "CAD",
  CNY = "CNY",
  EUR = "EUR",
  GBP = "GBP",
  JPY = "JPY",
  RUB = "RUB",
  SEK = "SEK",
  SGD = "SGD",
  USD = "USD",
}

export enum Language {
  CROATIA = "hr",
  DUTCH = "nl",
  ENGLISH = "en",
  GERMAN = "de",
  ITALIAN = "it",
  RUSSIAN = "ru",
  PORTUGUESE = "pt",
  SPANISH = "es",
}

export enum Period {
  DAY = 1,
  WEEK = 7,
  MONTH = 30,
}

export enum TickerKey {
  ETH = "ETH",
  //VULT = "VULT",
  UNI = "UNI",
  USDC = "USDC",
  WETH = "WETH",
}

export enum GasSettingsSpeed {
  FAST = "FAST",
  SLOW = "SLOW",
  STANDARD = "STANDARD",
}

export enum GasSettingsMode {
  ADVANCED = "ADVANCED",
  BASIC = "BASIC",
}

export const currencyName: Record<Currency, string> = {
  [Currency.AUD]: "Australian Dollar",
  [Currency.CAD]: "Canadian Dollar",
  [Currency.CNY]: "Chinese Yuan",
  [Currency.EUR]: "European Euro",
  [Currency.GBP]: "British Pound",
  [Currency.JPY]: "Japanese Yen",
  [Currency.RUB]: "Russian Ruble",
  [Currency.SEK]: "Swedish Krona",
  [Currency.SGD]: "Singapore Dollar",
  [Currency.USD]: "United States Dollar",
};

export const currencySymbol: Record<Currency, string> = {
  [Currency.AUD]: "A$",
  [Currency.CAD]: "C$",
  [Currency.CNY]: "¥",
  [Currency.EUR]: "€",
  [Currency.GBP]: "£",
  [Currency.JPY]: "¥",
  [Currency.RUB]: "₽",
  [Currency.SEK]: "kr",
  [Currency.SGD]: "S$",
  [Currency.USD]: "$",
};

export const languageName: Record<Language, string> = {
  [Language.CROATIA]: "Hrvatski",
  [Language.DUTCH]: "Dutch",
  [Language.ENGLISH]: "English",
  [Language.GERMAN]: "Deutsch",
  [Language.ITALIAN]: "Italiano",
  [Language.PORTUGUESE]: "Português",
  [Language.RUSSIAN]: "Русский",
  [Language.SPANISH]: "Espanol",
};

export const defaultTokens: Record<TickerKey, TokenProps> = {
  [TickerKey.ETH]: {
    balance: 0,
    cmcId: 1027,
    contractAddress: ContractAddress.WETH_TOKEN,
    decimals: 18,
    isAirdropToken: false,
    isNative: true,
    name: "Ethereum",
    ticker: TickerKey.ETH,
    value: 0,
  },
  // [TickerKey.VULT]: {
  //   balance: 0,
  //   cmcId: 0,
  //   contractAddress: "",
  //   decimals: 18,
  //   isAirdropToken: true,
  //   isNative: false,
  //   name: "Vult",
  //   ticker: TickerKey.VULT,
  //   value: 0,
  // },
  [TickerKey.UNI]: {
    balance: 0,
    cmcId: 7083,
    contractAddress: ContractAddress.UNI_TOKEN,
    decimals: 18,
    isAirdropToken: true,
    isNative: false,
    name: "Uniswap",
    ticker: TickerKey.UNI,
    value: 0,
  },
  [TickerKey.USDC]: {
    balance: 0,
    cmcId: 3408,
    contractAddress: ContractAddress.USDC_TOKEN,
    decimals: 6,
    isAirdropToken: false,
    isNative: false,
    name: "USD Coin",
    ticker: TickerKey.USDC,
    value: 0,
  },
  [TickerKey.WETH]: {
    balance: 0,
    cmcId: 2396,
    contractAddress: ContractAddress.WETH_TOKEN,
    decimals: 18,
    isAirdropToken: false,
    isNative: false,
    name: "Wrapped Ether",
    ticker: TickerKey.WETH,
    value: 0,
  },
};

export const uniswapTokens: Record<TickerKey, Token> = {
  [TickerKey.ETH]: new Token(
    ChainId.MAINNET,
    defaultTokens[TickerKey.ETH].contractAddress,
    defaultTokens[TickerKey.ETH].decimals,
    TickerKey.ETH,
    defaultTokens[TickerKey.ETH].name
  ),
  [TickerKey.UNI]: new Token(
    ChainId.MAINNET,
    defaultTokens[TickerKey.UNI].contractAddress,
    defaultTokens[TickerKey.UNI].decimals,
    defaultTokens[TickerKey.UNI].ticker,
    defaultTokens[TickerKey.UNI].name
  ),
  // [TickerKey.VULT]: new Token(
  //   ChainId.MAINNET,
  //   ContractAddress.WETH_TOKEN,
  //   defaultTokens[TickerKey.VULT].decimals,
  //   defaultTokens[TickerKey.VULT].ticker,
  //   defaultTokens[TickerKey.VULT].name,
  // ),
  [TickerKey.USDC]: new Token(
    ChainId.MAINNET,
    defaultTokens[TickerKey.USDC].contractAddress,
    defaultTokens[TickerKey.USDC].decimals,
    defaultTokens[TickerKey.USDC].ticker,
    defaultTokens[TickerKey.USDC].name
  ),
  [TickerKey.WETH]: new Token(
    ChainId.MAINNET,
    defaultTokens[TickerKey.WETH].contractAddress,
    defaultTokens[TickerKey.WETH].decimals,
    defaultTokens[TickerKey.WETH].ticker,
    defaultTokens[TickerKey.WETH].name
  ),
};

export const POOLS_ABI = [
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
