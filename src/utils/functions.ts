import { Currency, currencySymbols } from "@/utils/currency";
import { CSSProperties } from "@/utils/types";

const isObject = (obj: any): obj is Record<string, any> => {
  return (
    obj === Object(obj) && !Array.isArray(obj) && typeof obj !== "function"
  );
};

const toCamel = (value: string) => {
  return value.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace("-", "").replace("_", "");
  });
};

const toKebab = (value: string) => {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
};

const toSnake = (value: string) => {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

export const camelCaseToTitle = (input: string) => {
  if (!input) return input;

  return input
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const cssPropertiesToString = (styles: CSSProperties) => {
  return Object.entries(styles)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${toKebab(key)}: ${value};`)
    .join("\n");
};

export const match = <T extends string | number | symbol, V>(
  value: T,
  handlers: { [key in T]: () => V }
): V => {
  const handler = handlers[value];

  return handler();
};

export const shallowCloneObject = <T extends Record<string, any>>(obj: T) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, { ...value }])
  ) as T;
};

export const snakeCaseToTitle = (input: string) => {
  if (!input) return input;

  return input
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const toAmountFormat = (value: number) => {
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

export const toCamelCase = <T>(obj: T): T => {
  if (isObject(obj)) {
    const result: Record<string, unknown> = {};

    Object.keys(obj).forEach((key) => {
      const camelKey = toCamel(key);
      result[camelKey] = toCamelCase((obj as Record<string, unknown>)[key]);
    });

    return result as T;
  } else if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item)) as T;
  }

  return obj;
};

export const toKebabCase = <T>(obj: T): T => {
  if (isObject(obj)) {
    const result: Record<string, unknown> = {};

    Object.keys(obj).forEach((key) => {
      const kebabKey = toKebab(key);
      result[kebabKey] = toKebabCase((obj as Record<string, unknown>)[key]);
    });

    return result as T;
  } else if (Array.isArray(obj)) {
    return obj.map((item) => toKebabCase(item)) as T;
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

export const toSnakeCase = <T>(obj: T): T => {
  if (isObject(obj)) {
    const result: Record<string, unknown> = {};

    Object.keys(obj).forEach((key) => {
      const snakeKey = toSnake(key);
      result[snakeKey] = toSnakeCase((obj as Record<string, unknown>)[key]);
    });

    return result as T;
  } else if (Array.isArray(obj)) {
    return obj.map((item) => toSnakeCase(item)) as T;
  }

  return obj;
};

export const toValueFormat = (
  value: number | string,
  currency: Currency,
  decimal = 2
): string => {
  return `${currencySymbols[currency]}${toNumberFormat(value, decimal)}`;
};
