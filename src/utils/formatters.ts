import { FiatCurrencyCode } from "../types/crypto";
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from "./currencies";

/**
 * Format number into any supported fiat currency (INR, USD, EUR, GBP, JPY, CAD, AUD, SGD, AED)
 */
export function formatCurrency(
  val: number | null | undefined,
  currencyCode: FiatCurrencyCode | string = DEFAULT_CURRENCY,
  maximumFractionDigits = 2
): string {
  if (val === null || val === undefined || isNaN(val)) return "—";

  const config =
    SUPPORTED_CURRENCIES[currencyCode as FiatCurrencyCode] ||
    SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];

  const symbol = config.symbol;
  const absVal = Math.abs(val);

  // For very small unit values (e.g. USDT in USD or small fractions)
  if (absVal > 0 && absVal < 1) {
    return `${symbol}${val.toLocaleString(config.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })}`;
  }

  // JPY typically has 0 decimal places
  if (config.code === "JPY") {
    return `${symbol}${Math.round(val).toLocaleString(config.locale)}`;
  }

  // Standard Indian formatting for INR
  if (config.code === "INR") {
    return `${symbol}${val.toLocaleString("en-IN", {
      minimumFractionDigits: val % 1 === 0 ? 0 : 2,
      maximumFractionDigits,
    })}`;
  }

  // International standard formatting
  return `${symbol}${val.toLocaleString(config.locale, {
    minimumFractionDigits: val % 1 === 0 ? 0 : 2,
    maximumFractionDigits,
  })}`;
}

/**
 * Backward compatibility alias for INR
 */
export function formatINR(val: number | null | undefined, maximumFractionDigits = 2): string {
  return formatCurrency(val, "INR", maximumFractionDigits);
}

/**
 * Format large numbers in compact units (Lakhs/Crores for INR, B/M/T for USD/EUR/etc.)
 */
export function formatLargeCurrency(
  val: number | null | undefined,
  currencyCode: FiatCurrencyCode | string = DEFAULT_CURRENCY
): string {
  if (val === null || val === undefined || isNaN(val)) return "—";

  const config =
    SUPPORTED_CURRENCIES[currencyCode as FiatCurrencyCode] ||
    SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
  const symbol = config.symbol;
  const absVal = Math.abs(val);

  // INR specific: Lakhs and Crores
  if (config.code === "INR") {
    if (absVal >= 1e12) {
      return `${symbol}${(val / 1e12).toFixed(2)} Lakh Cr`;
    }
    if (absVal >= 1e7) {
      return `${symbol}${(val / 1e7).toFixed(2)} Cr`;
    }
    if (absVal >= 1e5) {
      return `${symbol}${(val / 1e5).toFixed(2)} Lakh`;
    }
    return formatCurrency(val, "INR");
  }

  // Standard International: Trillions, Billions, Millions, Thousands
  if (absVal >= 1e12) {
    return `${symbol}${(val / 1e12).toFixed(2)}T`;
  }
  if (absVal >= 1e9) {
    return `${symbol}${(val / 1e9).toFixed(2)}B`;
  }
  if (absVal >= 1e6) {
    return `${symbol}${(val / 1e6).toFixed(2)}M`;
  }
  if (absVal >= 1e3) {
    return `${symbol}${(val / 1e3).toFixed(1)}K`;
  }
  return formatCurrency(val, currencyCode);
}

/**
 * Backward compatibility alias for Large INR
 */
export function formatLargeINR(val: number | null | undefined): string {
  return formatLargeCurrency(val, "INR");
}

/**
 * Format percentage with positive/negative sign
 */
export function formatPercent(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "0.00%";
  const sign = val > 0 ? "+" : "";
  return `${sign}${val.toFixed(2)}%`;
}

/**
 * Format supply with coin symbol
 */
export function formatSupply(supply: number | null | undefined, symbol: string): string {
  if (!supply) return "N/A";
  if (supply >= 1e9) {
    return `${(supply / 1e9).toFixed(2)}B ${symbol.toUpperCase()}`;
  }
  if (supply >= 1e6) {
    return `${(supply / 1e6).toFixed(2)}M ${symbol.toUpperCase()}`;
  }
  return `${supply.toLocaleString()} ${symbol.toUpperCase()}`;
}

/**
 * Format timestamp into readable date & time
 */
export function formatDateTime(isoString: string | number): string {
  const d = new Date(isoString);
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}
