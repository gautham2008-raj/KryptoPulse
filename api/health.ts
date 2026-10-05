import { getCryptoHealth } from "../src/server/cryptoService";
import { aiService } from "../src/server/aiService";
import { SUPPORTED_CURRENCIES } from "../src/utils/currencies";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const cryptoHealth = await getCryptoHealth();
  const aiHealth = aiService.getStatus();

  const isHealthy = cryptoHealth.status === "OK";

  // Safe health report - NEVER exposes secrets, tokens, or API keys
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
      note: aiHealth.keyConfigured
        ? "AI key configured and authenticated"
        : "AI key not configured; add AI_API_KEY in Vercel Project Settings > Environment Variables",
    },
    currencies: {
      status: "OK",
      supported: Object.keys(SUPPORTED_CURRENCIES),
      default: "INR",
    },
    environment: process.env.NODE_ENV || "production",
  });
}
