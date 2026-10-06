import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import chatHandler from "./api/chat";
import healthHandler from "./api/health";
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
app.get("/api/health", async (req, res) => {
  return healthHandler(req, res);
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
  return chatHandler(req, res);
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
