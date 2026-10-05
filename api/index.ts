import chatHandler from "./chat";
import {
  getLiveMarkets,
  getCoinHistory,
  getTechnicalIndicators,
  getMarketOverview,
  getCryptoHealth,
} from "../src/server/cryptoService";
import { aiService } from "../src/server/aiService";
import { SUPPORTED_CURRENCIES } from "../src/utils/currencies";
import { FiatCurrencyCode } from "../src/types/crypto";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const url = req.url || "";

  // Route 0: /api/health
  if (url.includes("/health")) {
    const cryptoHealth = await getCryptoHealth();
    const aiHealth = aiService.getStatus();
    const isHealthy = cryptoHealth.status === "OK";
    return res.status(isHealthy ? 200 : 503).json({
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
      },
      currencies: {
        status: "OK",
        supported: Object.keys(SUPPORTED_CURRENCIES),
        default: "INR",
      },
      environment: process.env.NODE_ENV || "production",
    });
  }

  // Route 1: /api/currencies
  if (url.includes("/currencies")) {
    return res.status(200).json({
      success: true,
      currencies: Object.values(SUPPORTED_CURRENCIES),
      default: "INR",
    });
  }

  // Route 2: /api/crypto/markets
  if (url.includes("/crypto/markets")) {
    const currency = String(req.query.vs_currency || "inr").toLowerCase();
    const upperCode = (currency.toUpperCase() as FiatCurrencyCode) || "INR";
    const currencyConfig = SUPPORTED_CURRENCIES[upperCode] || SUPPORTED_CURRENCIES.INR;
    try {
      const data = await getLiveMarkets(currency);
      return res.status(200).json({
        success: true,
        data,
        currency: currencyConfig.code,
        symbol: currencyConfig.symbol,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || "Failed to fetch markets" });
    }
  }

  // Route 3: /api/crypto/overview
  if (url.includes("/crypto/overview")) {
    const currency = String(req.query.vs_currency || "inr").toLowerCase();
    try {
      const data = await getMarketOverview(currency);
      return res.status(200).json({ success: true, ...data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || "Failed to fetch overview" });
    }
  }

  // Route 4: /api/crypto/history
  if (url.includes("/crypto/history")) {
    const match = url.match(/\/history\/([a-zA-Z0-9_-]+)/);
    const coinId = match ? match[1] : String(req.query.coinId || "bitcoin");
    const days = req.query.days ? String(req.query.days) : "7";
    const currency = String(req.query.vs_currency || "inr").toLowerCase();
    try {
      const result = await getCoinHistory(coinId, days, currency);
      return res.status(200).json({ success: true, ...result.data, cached: result.cached, fallback: result.fallback });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || "Failed to fetch history" });
    }
  }

  // Route 5: /api/crypto/technical
  if (url.includes("/crypto/technical")) {
    const match = url.match(/\/technical\/([a-zA-Z0-9_-]+)/);
    const coinId = match ? match[1] : String(req.query.coinId || "bitcoin");
    const currency = String(req.query.vs_currency || "inr").toLowerCase();
    try {
      const data = await getTechnicalIndicators(coinId, currency);
      return res.status(200).json({ success: true, ...data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || "Failed to compute indicators" });
    }
  }

  // Route 6: /api/chat
  if (url.includes("/chat")) {
    return chatHandler(req, res);
  }

  // Default healthcheck
  return res.status(200).json({
    name: "KryptoPulse API",
    status: "online",
    endpoints: [
      "/api/currencies",
      "/api/crypto/markets",
      "/api/crypto/overview",
      "/api/crypto/history/:coinId",
      "/api/crypto/technical/:coinId",
      "/api/chat",
    ],
  });
}
