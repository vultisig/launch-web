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
  QUOTER = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  POOL_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  SWAP_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  WETH_TOKEN = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  USDC_TOKEN = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  WETH_USDC_POOL = "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
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
  day = 1,
  week = 7,
  month = 30,
}

export enum TickerKey {
  ETH = "ETH",
  VULT = "VULT",
  USDC = "USDC",
  WETH = "WETH",
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

export const defaultTokens: TokenProps[] = [
  {
    balance: 0,
    cmcId: 1027,
    contractAddress: "",
    decimals: 18,
    isNative: true,
    name: "Ethereum",
    ticker: TickerKey.ETH,
    value: 0,
  },
  {
    balance: 0,
    cmcId: 3408,
    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
    isNative: false,
    name: "USD Coin",
    ticker: TickerKey.USDC,
    value: 0,
  },
  {
    balance: 0,
    cmcId: 2396,
    contractAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    decimals: 18,
    isNative: false,
    name: "Wrapped Ether",
    ticker: TickerKey.WETH,
    value: 0,
  },
  // {
  //   balance: 0,
  //   cmcId: 0,
  //   contractAddress: "",
  //   decimals: 18,
  //   isNative: false,
  //   name: "Vult",
  //   ticker: TickerKey.VULT,
  //   value: 0,
  // },
];

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
