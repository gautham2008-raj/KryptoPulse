import { getCoinHistory } from "../../../src/server/cryptoService";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Extract coinId from dynamic route, query, or path
  let coinId = req.query.coinId || req.query.id;
  if (!coinId && req.url) {
    const match = req.url.match(/\/history\/([a-zA-Z0-9_-]+)/);
    if (match) {
      coinId = match[1];
    }
  }
  coinId = String(coinId || "bitcoin").toLowerCase();

  const days = req.query.days ? String(req.query.days) : "7";
  const currency = String(req.query.vs_currency || "inr").toLowerCase();

  try {
    const result = await getCoinHistory(coinId, days, currency);
    return res.status(200).json({
      success: true,
      ...result.data,
      cached: result.cached,
      fallback: result.fallback,
    });
  } catch (err: any) {
    console.error(`[Vercel API] /api/crypto/history/${coinId} error:`, err?.message || err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to retrieve coin history data",
    });
  }
}
