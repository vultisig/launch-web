export const currencies = [
  "usd",
  "eur",
  "gbp",
  "chf",
  "jpy",
  "cny",
  "cad",
  "sgd",
  "sek",
] as const;

export type Currency = (typeof currencies)[number];

export const defaultCurrency: Currency = "usd";

export const currencyNames: Record<Currency, string> = {
  //aud: "Australian Dollar",
  cad: "Canadian Dollar",
  chf: "Swiss franc",
  cny: "Chinese Yuan",
  eur: "European Euro",
  gbp: "British Pound",
  jpy: "Japanese Yen",
  //rub: "Russian Ruble",
  sek: "Swedish Krona",
  sgd: "Singapore Dollar",
  usd: "United States Dollar",
};

export const currencySymbols: Record<Currency, string> = {
  usd: "US$",
  eur: "€",
  gbp: "£",
  chf: "CHF",
  jpy: "JP¥",
  cny: "CN¥",
  cad: "CA$",
  sgd: "SGD",
  sek: "SEK",
};
