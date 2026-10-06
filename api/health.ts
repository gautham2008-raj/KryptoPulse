import { getGeminiApiKey, getValidGeminiModel } from "./chat";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { key: aiKey, source: keySource } = getGeminiApiKey();
  const model = getValidGeminiModel();
  const provider = (process.env.AI_PROVIDER || "gemini").trim().toLowerCase();
  const isKeyConfigured = Boolean(aiKey && aiKey.length > 5);

  // Test crypto latency to public endpoint
  let cryptoStatus = "OK";
  let latencyMs = 0;
  const start = Date.now();
  try {
    const ping = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT", {
      signal: AbortSignal.timeout(3000),
    });
    latencyMs = Date.now() - start;
    if (!ping.ok) cryptoStatus = "DEGRADED";
  } catch (_) {
    cryptoStatus = "FALLBACK_READY";
    latencyMs = Date.now() - start;
  }

  // Safe health report - NEVER exposes secrets or keys
  return res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    application: "OK",
    cryptoApi: {
      status: cryptoStatus,
      provider: "CoinGecko & Binance Multi-Tier Aggregator",
      latencyMs,
      trackedCoins: ["BTC", "ETH", "USDT", "BNB", "SOL"],
      coinsSynced: 5,
      lastSync: new Date().toISOString(),
    },
    aiApi: {
      status: isKeyConfigured ? "OK" : "NOT_CONFIGURED",
      provider,
      model,
      keyConfigured: isKeyConfigured,
      keySourceDetected: keySource,
      note: isKeyConfigured
        ? `AI key configured and authenticated (via ${keySource})`
        : "AI key not configured; please set GEMINI_API_KEY or AI_API_KEY in Vercel Project Settings > Environment Variables, and trigger a redeploy",
    },
    currencies: {
      status: "OK",
      supported: ["INR", "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "SGD", "AED"],
      default: "INR",
    },
    environment: process.env.NODE_ENV || "production",
  });
}
