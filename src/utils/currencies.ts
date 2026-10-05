import { FiatCurrencyCode, FiatCurrencyConfig } from "../types/crypto";

export const SUPPORTED_CURRENCIES: Record<FiatCurrencyCode, FiatCurrencyConfig> = {
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    locale: "en-IN",
    rateVsUsd: 87.45,
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    locale: "en-US",
    rateVsUsd: 1.0,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    locale: "de-DE",
    rateVsUsd: 0.92,
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    locale: "en-GB",
    rateVsUsd: 0.79,
  },
  JPY: {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    locale: "ja-JP",
    rateVsUsd: 153.2,
  },
  CAD: {
    code: "CAD",
    symbol: "C$",
    name: "Canadian Dollar",
    locale: "en-CA",
    rateVsUsd: 1.38,
  },
  AUD: {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    locale: "en-AU",
    rateVsUsd: 1.52,
  },
  SGD: {
    code: "SGD",
    symbol: "S$",
    name: "Singapore Dollar",
    locale: "en-SG",
    rateVsUsd: 1.35,
  },
  AED: {
    code: "AED",
    symbol: "د.إ",
    name: "UAE Dirham",
    locale: "ar-AE",
    rateVsUsd: 3.67,
  },
};

export const CURRENCY_LIST = Object.values(SUPPORTED_CURRENCIES);

export const DEFAULT_CURRENCY: FiatCurrencyCode = "INR";

/**
 * Persist user's chosen currency to localStorage
 */
export function getSavedCurrency(): FiatCurrencyCode {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  try {
    const saved = localStorage.getItem("kryptopulse_currency") as FiatCurrencyCode;
    if (saved && SUPPORTED_CURRENCIES[saved]) {
      return saved;
    }
  } catch (_) {}
  return DEFAULT_CURRENCY;
}

export function saveCurrency(currency: FiatCurrencyCode): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("kryptopulse_currency", currency);
  } catch (_) {}
}
