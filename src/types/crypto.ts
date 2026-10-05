export type FiatCurrencyCode =
  | "INR"
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "CAD"
  | "AUD"
  | "SGD"
  | "AED";

export interface FiatCurrencyConfig {
  code: FiatCurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  rateVsUsd: number; // For fallback conversion if external provider is rate-limited
}

export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  last_updated: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface HistoricalPricePoint {
  timestamp: number;
  date: string;
  price: number;
  marketCap?: number;
  volume?: number;
}

export interface CoinHistoryData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface TechnicalIndicators {
  coinId: string;
  currentPrice: number;
  currency: string;
  symbol: string;
  sma: {
    sma7: number;
    sma20: number;
    sma50: number;
  };
  ema: {
    ema12: number;
    ema26: number;
  };
  rsi: {
    value: number;
    period: number;
    signal: "Overbought" | "Oversold" | "Neutral";
  };
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
    signal: "Bullish Crossover" | "Bearish Crossover" | "Neutral";
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    bandwidthPercent: number;
  };
  supportResistance: {
    support: number;
    resistance: number;
    pivot: number;
  };
  volatility: {
    dailyPercent: number;
    annualizedPercent: number;
    rating: "Low" | "Moderate" | "High" | "Extreme";
  };
  calculatedAt: string;
  dataPointsUsed: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  isError?: boolean;
  retryable?: boolean;
  failedPrompt?: string;
  isFallback?: boolean;
  notice?: string;
  structuredAnalysis?: {
    coinName?: string;
    price?: string;
    change24h?: string;
    rsi?: number;
    rsiSignal?: string;
    macdSignal?: string;
    support?: string;
    resistance?: string;
  };
}

export interface CryptoHistoryMilestone {
  year: string;
  title: string;
  description: string;
  category: "launch" | "milestone" | "upgrade" | "event";
}

export interface CryptoCoinHistoryInfo {
  id: string;
  name: string;
  symbol: string;
  launchDate: string;
  founder: string;
  foundingOrg: string;
  originalPurpose: string;
  consensus: string;
  tps: string;
  avgFeeINR: string;
  milestones: CryptoHistoryMilestone[];
  majorDevelopments: string[];
  currentRole: string;
  color: string;
  gradient: string;
}
