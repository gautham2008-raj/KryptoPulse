import { CryptoCoin, CoinHistoryData, TechnicalIndicators, FiatCurrencyCode } from "../types/crypto";

export interface MarketsApiResponse {
  success: boolean;
  data: CryptoCoin[];
  currency: string;
  symbol: string;
  lastUpdated: string;
  error?: string;
}

export interface HistoryApiResponse extends CoinHistoryData {
  success: boolean;
  cached?: boolean;
  fallback?: boolean;
  error?: string;
}

export interface TechnicalApiResponse {
  success: boolean;
  indicators: TechnicalIndicators;
  coinName: string;
  symbol: string;
  currentPrice: number;
  error?: string;
}

export interface MarketOverviewData {
  success: boolean;
  currency: string;
  symbol: string;
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: string;
  topGainer?: CryptoCoin;
  topLoser?: CryptoCoin;
  sentiment: string;
  trackedCount: number;
  lastUpdated: string;
}

export interface ChatApiResponse {
  success: boolean;
  reply?: string;
  error?: string;
  statusCode?: number;
  retryable?: boolean;
  isFallback?: boolean;
  notice?: string;
  model?: string;
  provider?: string;
  currency?: string;
  symbol?: string;
  timestamp?: string;
}

export async function fetchLiveMarkets(currency: FiatCurrencyCode = "INR"): Promise<MarketsApiResponse> {
  const res = await fetch(`/api/crypto/markets?vs_currency=${encodeURIComponent(currency.toLowerCase())}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch markets: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchCoinHistory(
  coinId: string,
  days: number | string = 7,
  currency: FiatCurrencyCode = "INR"
): Promise<HistoryApiResponse> {
  const res = await fetch(
    `/api/crypto/history/${encodeURIComponent(coinId)}?days=${days}&vs_currency=${encodeURIComponent(currency.toLowerCase())}`
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch history for ${coinId}: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchTechnicalIndicators(
  coinId: string,
  currency: FiatCurrencyCode = "INR"
): Promise<TechnicalApiResponse> {
  const res = await fetch(
    `/api/crypto/technical/${encodeURIComponent(coinId)}?vs_currency=${encodeURIComponent(currency.toLowerCase())}`
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch technical indicators: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchMarketOverview(currency: FiatCurrencyCode = "INR"): Promise<MarketOverviewData> {
  const res = await fetch(`/api/crypto/overview?vs_currency=${encodeURIComponent(currency.toLowerCase())}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch market overview: HTTP ${res.status}`);
  }
  return res.json();
}

export async function sendChatMessage(
  message: string,
  history: { role: "user" | "model"; content: string }[] = [],
  selectedCoin: string = "all",
  currency: FiatCurrencyCode = "INR"
): Promise<ChatApiResponse> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, history, selectedCoin, currency }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const status = res.status;
      let userFriendlyMsg = "The AI assistant is temporarily unavailable. Please try again.";

      if (status === 503) {
        userFriendlyMsg = "The AI service is temporarily busy. Please try again in a moment.";
      } else if (status === 429) {
        userFriendlyMsg = "The AI service is currently rate-limited. Please try again shortly.";
      } else if (status === 401 || status === 403) {
        userFriendlyMsg = "AI service authentication failed. Please check the API configuration.";
      } else if (data?.error && typeof data.error === "string" && !data.error.includes("{")) {
        userFriendlyMsg = data.error;
      }

      return {
        success: false,
        error: userFriendlyMsg,
        statusCode: status,
        retryable: status === 503 || status === 429 || status === 500,
        reply: data?.reply,
      };
    }

    return (
      data || {
        success: true,
        reply: "No response text was received from the assistant.",
      }
    );
  } catch (err: any) {
    return {
      success: false,
      error: "Unable to reach the AI service. Please check your connection and try again.",
      statusCode: 0,
      retryable: true,
    };
  }
}
