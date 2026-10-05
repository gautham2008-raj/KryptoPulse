import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { aiService, AIAnalysisRequest, classifyAIError } from "./src/server/aiService";
import {
  getLiveMarkets,
  getCoinHistory,
  getTechnicalIndicators,
  getMarketOverview,
  getCryptoHealth,
} from "./src/server/cryptoService";
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

// -----------------------------------------------------------------------------
// REST API Endpoints
// -----------------------------------------------------------------------------

// 0. Diagnostic Health Check Endpoint
app.get("/api/health", async (_req, res) => {
  const cryptoHealth = await getCryptoHealth();
  const aiHealth = aiService.getStatus();
  const isHealthy = cryptoHealth.status === "OK";

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "OK" : "DEGRADED",
    timestamp: new Date().toISOString(),
    application: "OK",
    cryptoApi: {
      status: cryptoHealth.status,
      provider: cryptoHealth.provider,
      latencyMs: cryptoHealth.latencyMs,
      trackedCoins: cryptoHealth.trackedCoins || ["BTC", "ETH", "USDT", "BNB", "SOL"],
      coinsSynced: cryptoHealth.coinsSynced,
      lastSync: cryptoHealth.lastSync,
    },
    aiApi: {
      status: aiHealth.status,
      provider: aiHealth.provider,
      model: aiHealth.model,
      keyConfigured: aiHealth.keyConfigured,
      note: aiHealth.keyConfigured
        ? "AI key configured and authenticated"
        : "AI key not configured; add AI_API_KEY in Vercel Project Settings > Environment Variables",
    },
    currencies: {
      status: "OK",
      supported: Object.keys(SUPPORTED_CURRENCIES),
      default: "INR",
    },
    environment: process.env.NODE_ENV || "development",
  });
});

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
    const data = await getLiveMarkets(currency);
    res.json({
      success: true,
      data,
      currency: currencyConfig.code,
      symbol: currencyConfig.symbol,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Server API] /api/crypto/markets error:", err?.message || err);
    res.status(500).json({ success: false, error: err.message || "Failed to fetch market data" });
  }
});

// 3. Historical chart data for a coin & timeframe
app.get("/api/crypto/history/:coinId", async (req, res) => {
  const { coinId } = req.params;
  const days = req.query.days ? String(req.query.days) : "7";
  const currency = String(req.query.vs_currency || "inr").toLowerCase();

  try {
    const result = await getCoinHistory(coinId, days, currency);
    res.json({ success: true, ...result.data, cached: result.cached, fallback: result.fallback });
  } catch (err: any) {
    console.error(`[Server API] /api/crypto/history/${coinId} error:`, err?.message || err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Real Technical Indicators calculation endpoint
app.get("/api/crypto/technical/:coinId", async (req, res) => {
  const { coinId } = req.params;
  const currency = String(req.query.vs_currency || "inr").toLowerCase();

  try {
    const data = await getTechnicalIndicators(coinId, currency);
    res.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    console.error(`[Server API] /api/crypto/technical/${coinId} error:`, err?.message || err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Global Market Overview endpoint
app.get("/api/crypto/overview", async (req, res) => {
  const currency = String(req.query.vs_currency || "inr").toLowerCase();

  try {
    const data = await getMarketOverview(currency);
    res.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    console.error("[Server API] /api/crypto/overview error:", err?.message || err);
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

  let markets: any[] = [];
  try {
    markets = await getLiveMarkets(currencyConfig.code.toLowerCase());
  } catch (mErr) {
    console.warn("[Server API Chat] Market retrieval for context failed:", mErr);
  }

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
  if (matchedCoin) {
    try {
      const techResult = await getTechnicalIndicators(matchedCoin.id, currencyConfig.code.toLowerCase());
      technicalIndicators = techResult.indicators;
    } catch (tErr) {
      console.warn("Could not calculate technical indicators for AI context:", tErr);
    }
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
    const classified = classifyAIError(err);
    console.error(`[AI Production Service Error] Duration: ${duration}ms [${classified.code}]:`, err?.message || err);

    if (matchedCoin) {
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
        `*Notice: ${classified.message} Verified real-time cryptocurrency telemetry is shown above.*\n\n` +
        `*⚠️ Educational Information Only: Cryptocurrency assets are volatile. Always do your own research (DYOR).*`;

      return res.status(200).json({
        success: true,
        reply: fallbackReply,
        isFallback: true,
        notice: classified.message,
        currency: currencyConfig.code,
        symbol: currencyConfig.symbol,
      });
    }

    return res.status(classified.statusCode).json({
      success: false,
      error: classified.message,
      statusCode: classified.statusCode,
      retryable: classified.statusCode === 503 || classified.statusCode === 429,
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

export default app;
