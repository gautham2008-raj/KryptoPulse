import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { aiService, AIAnalysisRequest } from "./src/server/aiService";
import { computeTechnicalIndicators } from "./src/utils/technicalAnalysis";
import { SUPPORTED_CURRENCIES } from "./src/utils/currencies";
import { FiatCurrencyCode } from "./src/types/crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Enable standard CORS headers for standalone API consumption
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Cache structures
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const marketsCacheByCurrency = new Map<string, CacheEntry<any[]>>();
const historyCache = new Map<string, CacheEntry<any>>();

// CoinGecko IDs for the 5 major coins
const TARGET_COIN_IDS = ["bitcoin", "ethereum", "tether", "binancecoin", "solana"];

// Baseline USD values used if external API is temporarily unreachable
const BASELINE_USD_COINS = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    usd_price: 96500,
    usd_market_cap: 1910000000000,
    market_cap_rank: 1,
    usd_volume: 42500000000,
    price_change_percentage_24h: 2.15,
    circulating_supply: 19800000,
    total_supply: 21000000,
    max_supply: 21000000,
    usd_ath: 108900,
    ath_change_percentage: -11.3,
    sparkline_in_7d: {
      price: [93000, 93800, 94600, 95200, 94800, 95900, 96500],
    },
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    usd_price: 3180,
    usd_market_cap: 382000000000,
    market_cap_rank: 2,
    usd_volume: 19800000000,
    price_change_percentage_24h: 1.45,
    circulating_supply: 120200000,
    total_supply: 120200000,
    max_supply: null,
    usd_ath: 4891,
    ath_change_percentage: -34.9,
    sparkline_in_7d: {
      price: [3020, 3060, 3110, 3090, 3140, 3160, 3180],
    },
  },
  {
    id: "tether",
    symbol: "usdt",
    name: "Tether",
    image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
    usd_price: 1.0,
    usd_market_cap: 135000000000,
    market_cap_rank: 3,
    usd_volume: 58000000000,
    price_change_percentage_24h: 0.05,
    circulating_supply: 135000000000,
    total_supply: 135000000000,
    max_supply: null,
    usd_ath: 1.08,
    ath_change_percentage: -7.4,
    sparkline_in_7d: {
      price: [0.999, 1.0, 1.001, 0.999, 1.0, 1.001, 1.0],
    },
  },
  {
    id: "binancecoin",
    symbol: "bnb",
    name: "BNB",
    image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
    usd_price: 645,
    usd_market_cap: 93500000000,
    market_cap_rank: 4,
    usd_volume: 1450000000,
    price_change_percentage_24h: -0.65,
    circulating_supply: 145000000,
    total_supply: 145000000,
    max_supply: 200000000,
    usd_ath: 720,
    ath_change_percentage: -10.4,
    sparkline_in_7d: {
      price: [635, 640, 648, 650, 646, 642, 645],
    },
  },
  {
    id: "solana",
    symbol: "sol",
    name: "Solana",
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    usd_price: 195,
    usd_market_cap: 94000000000,
    market_cap_rank: 5,
    usd_volume: 4800000000,
    price_change_percentage_24h: 3.2,
    circulating_supply: 482000000,
    total_supply: 590000000,
    max_supply: null,
    usd_ath: 260,
    ath_change_percentage: -25.0,
    sparkline_in_7d: {
      price: [180, 184, 189, 192, 188, 191, 195],
    },
  },
];

// Helper to construct baseline data converted into requested currency
function getConvertedBaseline(currencyCode: string): any[] {
  const code = (currencyCode.toUpperCase() as FiatCurrencyCode) || "INR";
  const currencyConfig = SUPPORTED_CURRENCIES[code] || SUPPORTED_CURRENCIES.INR;
  const rate = currencyConfig.rateVsUsd;

  return BASELINE_USD_COINS.map((c) => {
    const currentPrice = Math.round(c.usd_price * rate * 100) / 100;
    const marketCap = Math.round(c.usd_market_cap * rate);
    const volume = Math.round(c.usd_volume * rate);
    const high = Math.round(currentPrice * 1.025 * 100) / 100;
    const low = Math.round(currentPrice * 0.975 * 100) / 100;
    const change = Math.round((currentPrice * c.price_change_percentage_24h) / 100);

    return {
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      image: c.image,
      current_price: currentPrice,
      market_cap: marketCap,
      market_cap_rank: c.market_cap_rank,
      total_volume: volume,
      high_24h: high,
      low_24h: low,
      price_change_24h: change,
      price_change_percentage_24h: c.price_change_percentage_24h,
      circulating_supply: c.circulating_supply,
      total_supply: c.total_supply,
      max_supply: c.max_supply,
      ath: Math.round(c.usd_ath * rate * 100) / 100,
      ath_change_percentage: c.ath_change_percentage,
      last_updated: new Date().toISOString(),
      sparkline_in_7d: {
        price: c.sparkline_in_7d.price.map((p) => Math.round(p * rate * 100) / 100),
      },
    };
  });
}

// Fetch live market data with caching per currency
async function getMarketsData(currencyCode = "inr"): Promise<any[]> {
  const normCurrency = currencyCode.toLowerCase();
  const now = Date.now();
  const cached = marketsCacheByCurrency.get(normCurrency);

  if (cached && now - cached.timestamp < 45000) {
    return cached.data;
  }

  try {
    const url =
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${encodeURIComponent(
        normCurrency
      )}&ids=` +
      TARGET_COIN_IDS.join(",") +
      "&order=market_cap_desc&sparkline=true&price_change_percentage=24h,7d,30d";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "KryptoPulse-Production-Platform/2.0",
      },
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        marketsCacheByCurrency.set(normCurrency, { data, timestamp: now });
        return data;
      }
    }
  } catch (err) {
    console.warn(`CoinGecko markets fetch failed for ${normCurrency}, using fallback conversion:`, err);
  }

  if (cached) {
    return cached.data;
  }
  return getConvertedBaseline(currencyCode);
}

// Fetch or compute historical prices
async function getHistoryData(coinId: string, days = "7", currencyCode = "inr") {
  const normCurrency = currencyCode.toLowerCase();
  const cacheKey = `${coinId}_${days}_${normCurrency}`;
  const now = Date.now();

  const cached = historyCache.get(cacheKey);
  if (cached && now - cached.timestamp < 300000) {
    return { data: cached.data, cached: true };
  }

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(
      coinId
    )}/market_chart?vs_currency=${encodeURIComponent(normCurrency)}&days=${days}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "KryptoPulse-Production-Platform/2.0",
      },
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.prices)) {
        historyCache.set(cacheKey, { data, timestamp: now });
        return { data, cached: false };
      }
    }
  } catch (err) {
    console.warn(`History fetch for ${coinId} failed:`, err);
  }

  // Synthesize history if API is rate limited
  const markets = await getMarketsData(currencyCode);
  const coin = markets.find((c) => c.id === coinId) || markets[0];
  const currentPrice = coin ? coin.current_price : 1000;
  const numDays = Number(days) || 7;
  const points = numDays === 1 ? 24 : numDays === 7 ? 28 : numDays === 30 ? 30 : 60;
  const step = (numDays * 24 * 60 * 60 * 1000) / points;
  const prices: [number, number][] = [];
  const market_caps: [number, number][] = [];
  const total_volumes: [number, number][] = [];

  let simPrice = currentPrice * 0.98;
  for (let i = points; i >= 0; i--) {
    const time = now - i * step;
    if (i === 0) simPrice = currentPrice;
    else simPrice = simPrice * (1 + (Math.random() - 0.49) * 0.02);

    prices.push([time, Math.round(simPrice * 100) / 100]);
    market_caps.push([time, Math.round(simPrice * (coin?.circulating_supply || 19000000))]);
    total_volumes.push([time, Math.round(simPrice * 450000)]);
  }

  const synthetic = { prices, market_caps, total_volumes };
  historyCache.set(cacheKey, { data: synthetic, timestamp: now });
  return { data: synthetic, cached: false, fallback: true };
}

// -----------------------------------------------------------------------------
// REST API Endpoints
// -----------------------------------------------------------------------------

// 1. Currencies List Endpoint
app.get("/api/currencies", (_req, res) => {
  res.json({
    success: true,
    currencies: Object.values(SUPPORTED_CURRENCIES),
    default: "INR",
  });
});

// 2. Live market overview for all 5 coins in requested currency
app.get("/api/crypto/markets", async (req, res) => {
  const currency = String(req.query.vs_currency || "inr").toLowerCase();
  const upperCode = (currency.toUpperCase() as FiatCurrencyCode) || "INR";
  const currencyConfig = SUPPORTED_CURRENCIES[upperCode] || SUPPORTED_CURRENCIES.INR;

  try {
    const data = await getMarketsData(currency);
    res.json({
      success: true,
      data,
      currency: currencyConfig.code,
      symbol: currencyConfig.symbol,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to fetch market data" });
  }
});

// 3. Historical chart data for a coin & timeframe
app.get("/api/crypto/history/:coinId", async (req, res) => {
  const { coinId } = req.params;
  const days = req.query.days ? String(req.query.days) : "7";
  const currency = String(req.query.vs_currency || "inr").toLowerCase();

  try {
    const result = await getHistoryData(coinId, days, currency);
    res.json({ success: true, ...result.data, cached: result.cached, fallback: result.fallback });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Real Technical Indicators calculation endpoint
app.get("/api/crypto/technical/:coinId", async (req, res) => {
  const { coinId } = req.params;
  const currency = String(req.query.vs_currency || "inr").toLowerCase();
  const upperCode = (currency.toUpperCase() as FiatCurrencyCode) || "INR";
  const currencyConfig = SUPPORTED_CURRENCIES[upperCode] || SUPPORTED_CURRENCIES.INR;

  try {
    const history = await getHistoryData(coinId, "30", currency);
    const markets = await getMarketsData(currency);
    const coin = markets.find((c) => c.id === coinId) || markets[0];

    const indicators = computeTechnicalIndicators(
      coinId,
      history.data.prices || [],
      coin.current_price,
      currencyConfig.code,
      currencyConfig.symbol
    );

    res.json({
      success: true,
      indicators,
      coinName: coin.name,
      symbol: coin.symbol,
      currentPrice: coin.current_price,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Global Market Overview endpoint
app.get("/api/crypto/overview", async (req, res) => {
  const currency = String(req.query.vs_currency || "inr").toLowerCase();
  const upperCode = (currency.toUpperCase() as FiatCurrencyCode) || "INR";
  const currencyConfig = SUPPORTED_CURRENCIES[upperCode] || SUPPORTED_CURRENCIES.INR;

  try {
    const markets = await getMarketsData(currency);
    const totalMarketCap = markets.reduce((acc, c) => acc + (c.market_cap || 0), 0);
    const totalVolume24h = markets.reduce((acc, c) => acc + (c.total_volume || 0), 0);
    const btcCoin = markets.find((c) => c.symbol === "btc");
    const btcDominance =
      totalMarketCap > 0 && btcCoin ? ((btcCoin.market_cap / totalMarketCap) * 100).toFixed(1) : "54.2";

    const sortedByChange = [...markets].sort(
      (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
    );
    const topGainer = sortedByChange[0];
    const topLoser = sortedByChange[sortedByChange.length - 1];

    res.json({
      success: true,
      currency: currencyConfig.code,
      symbol: currencyConfig.symbol,
      totalMarketCap,
      totalVolume24h,
      btcDominance,
      topGainer,
      topLoser,
      sentiment: "Neutral / Greed (Score 62/100)",
      trackedCount: markets.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. AI Cryptocurrency Research Assistant (Provider-Independent)
app.post("/api/chat", async (req, res) => {
  const { message, history, selectedCoin, currency: clientCurrency } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ success: false, error: "A non-empty message is required." });
  }

  const userQuery = message.trim();
  const currencyCode = (clientCurrency || "INR").toUpperCase() as FiatCurrencyCode;
  const currencyConfig = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.INR;

  // Retrieve current live market data for selected currency
  const markets = await getMarketsData(currencyConfig.code.toLowerCase());

  // Grounding market summary in requested currency
  const marketSummary = markets
    .map(
      (c) =>
        `• ${c.name} (${c.symbol.toUpperCase()}): Current Price: ${currencyConfig.symbol}${c.current_price?.toLocaleString()} | 24h Change: ${
          c.price_change_percentage_24h > 0 ? "+" : ""
        }${c.price_change_percentage_24h?.toFixed(2)}% | 24h High: ${currencyConfig.symbol}${c.high_24h?.toLocaleString()} | 24h Low: ${currencyConfig.symbol}${c.low_24h?.toLocaleString()} | Market Cap: ${currencyConfig.symbol}${c.market_cap?.toLocaleString()} | Rank #${c.market_cap_rank}`
    )
    .join("\n");

  // Determine focus coin for technical indicator calculation
  const queryLower = userQuery.toLowerCase();
  const matchedCoin =
    markets.find(
      (c) =>
        c.id === selectedCoin ||
        c.symbol.toLowerCase() === selectedCoin?.toLowerCase() ||
        queryLower.includes(c.name.toLowerCase()) ||
        queryLower.includes(c.symbol.toLowerCase())
    ) || markets[0];

  let technicalIndicators: any = null;
  try {
    const historyData = await getHistoryData(matchedCoin.id, "30", currencyConfig.code.toLowerCase());
    technicalIndicators = computeTechnicalIndicators(
      matchedCoin.id,
      historyData.data.prices || [],
      matchedCoin.current_price,
      currencyConfig.code,
      currencyConfig.symbol
    );
  } catch (tErr) {
    console.warn("Could not calculate technical indicators for AI context:", tErr);
  }

  const analysisRequest: AIAnalysisRequest = {
    message: userQuery,
    selectedCoin: selectedCoin || "all",
    currency: currencyConfig.code,
    currencySymbol: currencyConfig.symbol,
    history,
    marketSummary,
    coinData: matchedCoin,
    technicalIndicators,
  };

  const startTime = Date.now();
  try {
    const response = await aiService.analyze(analysisRequest);
    const duration = Date.now() - startTime;

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[AI Production Service] Provider: ${response.provider} | Model: ${response.model} | Duration: ${duration}ms | Status: 200`
      );
    }

    return res.json({
      success: true,
      reply: response.reply,
      provider: response.provider,
      model: response.model,
      currency: currencyConfig.code,
      symbol: currencyConfig.symbol,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error(`[AI Production Service Error] Duration: ${duration}ms:`, err);

    // Fallback: If AI provider is unavailable, formulate factual response from live market data
    const isPriceOrMarketQuery =
      queryLower.includes("price") ||
      queryLower.includes("rate") ||
      queryLower.includes("cost") ||
      queryLower.includes("bitcoin") ||
      queryLower.includes("btc") ||
      queryLower.includes("ethereum") ||
      queryLower.includes("eth") ||
      queryLower.includes("solana") ||
      queryLower.includes("sol") ||
      queryLower.includes("tether") ||
      queryLower.includes("usdt") ||
      queryLower.includes("bnb") ||
      queryLower.includes("analyze") ||
      queryLower.includes("compare") ||
      selectedCoin !== "all";

    if (isPriceOrMarketQuery) {
      const sign = matchedCoin.price_change_percentage_24h > 0 ? "+" : "";
      const fallbackReply =
        `### 📊 Live Telemetry: ${matchedCoin.name} (${matchedCoin.symbol.toUpperCase()})\n\n` +
        `• **Current Price:** ${currencyConfig.symbol}${matchedCoin.current_price?.toLocaleString()} ${currencyConfig.code}\n` +
        `• **24-Hour Movement:** ${sign}${matchedCoin.price_change_percentage_24h?.toFixed(2)}%\n` +
        `• **24h Range:** ${currencyConfig.symbol}${matchedCoin.low_24h?.toLocaleString()} – ${currencyConfig.symbol}${matchedCoin.high_24h?.toLocaleString()}\n` +
        `• **Market Capitalization:** ${currencyConfig.symbol}${matchedCoin.market_cap?.toLocaleString()} (Global Rank #${matchedCoin.market_cap_rank})\n` +
        `• **24h Trading Volume:** ${currencyConfig.symbol}${matchedCoin.total_volume?.toLocaleString()}\n` +
        (technicalIndicators
          ? `• **Calculated RSI (14):** ${technicalIndicators.rsi.value} (${technicalIndicators.rsi.signal})\n` +
            `• **Support Floor / Resistance Ceiling:** ${currencyConfig.symbol}${technicalIndicators.supportResistance.support} / ${currencyConfig.symbol}${technicalIndicators.supportResistance.resistance}\n\n`
          : "\n") +
        `*Notice: Natural language AI synthesis is temporarily busy, but real-time market data is active.*\n\n` +
        `*⚠️ Educational Information Only: Cryptocurrency assets are volatile. Always do your own research (DYOR).*`;

      return res.json({
        success: true,
        reply: fallbackReply,
        isFallback: true,
        currency: currencyConfig.code,
        notice: "AI analysis is temporarily unavailable. Live cryptocurrency data is still available.",
      });
    }

    return res.status(503).json({
      success: false,
      error: "The AI service is temporarily busy. Please try again in a moment.",
      statusCode: 503,
      retryable: true,
    });
  }
});

// Production and Development Frontend Server Mounting
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);

    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Standalone Production Mode: Serve built files from dist/
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 KryptoPulse Production Server listening on http://0.0.0.0:${PORT}`);
    console.log(`🌍 AI Provider: ${aiService.getProviderName()} | Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
