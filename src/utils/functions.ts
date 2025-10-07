import { Currency, currencySymbols } from "@/utils/currency";

const isArray = (arr: any): arr is any[] => {
  return Array.isArray(arr);
};

const isObject = (obj: any): obj is Record<string, any> => {
  return obj === Object(obj) && !isArray(obj) && typeof obj !== "function";
};

const toCamel = (value: string): string => {
  return value.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace("-", "").replace("_", "");
  });
};

// const toSnake = (value: string): string => {
//   return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
// };

export const toBalanceFormat = (value: number) => {
  const MILLION = 1_000_000;
  const BILLION = 1_000_000_000;
  const TRILLION = 1_000_000_000_000;

  let symbol = "";
  let scaledValue = value;
  let decimals = 2;

  if (value >= TRILLION) {
    symbol = "T";
    scaledValue = value / TRILLION;
  } else if (value >= BILLION) {
    symbol = "B";
    scaledValue = value / BILLION;
  } else if (value >= MILLION) {
    symbol = "M";
    scaledValue = value / MILLION;
  } else {
    const decimalPart = value.toString().split(".")[1];
    const length = decimalPart?.length ?? 0;

    decimals = value >= 1000 ? Math.min(length, 3) : Math.min(length, 6);
  }

  const formatted = scaledValue.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${formatted}${symbol}`;
};

export const toCamelCase = (obj: any): any => {
  if (isObject(obj)) {
    const n: Record<string, any> = {};

    Object.keys(obj).forEach((k) => {
      n[toCamel(k)] = toCamelCase(obj[k]);
    });

    return n;
  } else if (isArray(obj)) {
    return obj.map((i) => {
      return toCamelCase(i);
    });
  }

  return obj;
};

export const toNumberFormat = (value: number | string, decimal = 20) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: decimal,
    useGrouping: true,
  });

  const num = typeof value === "string" ? Number(value.trim()) : value;

  return isNaN(num) ? value.toString() : formatter.format(num);
};

export const toPriceFormat = (
  value: number | string,
  currency: Currency,
  decimal = 2
): string => {
  return `${currencySymbols[currency]}${toNumberFormat(value, decimal)}`;
};

// export const toSnakeCase = (obj: any): any => {
//   if (isObject(obj)) {
//     const n: Record<string, any> = {};

//     Object.keys(obj).forEach((k) => {
//       n[toSnake(k)] = toSnakeCase(obj[k]);
//     });

//     return n;
//   } else if (isArray(obj)) {
//     return obj.map((i) => {
//       return toSnakeCase(i);
//     });
//   }

//   return obj;
// };
