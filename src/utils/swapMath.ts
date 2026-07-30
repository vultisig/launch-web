import { parseUnits } from "ethers";

/**
 * Convert a human number to a `parseUnits`-safe decimal string, truncated to the
 * token's decimal precision. `Number.prototype.toFixed`/exponential notation would
 * make `parseUnits` throw ("too many decimals" / invalid), so we build the string
 * ourselves with full precision and clamp the fractional part.
 */
export const clampDecimalString = (value: number, decimals: number): string => {
  if (!Number.isFinite(value) || value <= 0) return "0";
  // maximumFractionDigits: 20 avoids exponential notation for tiny/large values.
  const plain = value.toLocaleString("en-US", {
    useGrouping: false,
    maximumFractionDigits: 20,
  });
  const [whole, fraction = ""] = plain.split(".");
  const clamped = fraction.slice(0, decimals);
  return clamped ? `${whole}.${clamped}` : whole;
};

/** Parse a human amount into base units, tolerant of excess input precision. */
export const parseAmount = (value: number, decimals: number): bigint =>
  parseUnits(clampDecimalString(value, decimals), decimals);

/**
 * Minimum output (in base units) tolerated for a swap, applying slippage in
 * integer/basis-point space. This is the ONLY on-chain protection for the swap
 * (`sqrtPriceLimitX96 = 0`), so it must never be derived from a lossy float string.
 */
export const minOutAfterSlippage = (
  amountOut: number,
  decimals: number,
  slippagePercent: number,
): bigint => {
  const out = parseAmount(amountOut, decimals);
  const bps = BigInt(Math.max(0, Math.round(slippagePercent * 100)));
  return out - (out * bps) / 10_000n;
};
