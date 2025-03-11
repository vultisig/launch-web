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

export const VULT_CONTRACT_ADDRESS =
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"; // currently WETH

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
