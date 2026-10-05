import { getMarketOverview } from "../../src/server/cryptoService";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const currency = String(req.query.vs_currency || "inr").toLowerCase();

  try {
    const data = await getMarketOverview(currency);
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    console.error("[Vercel API] /api/crypto/overview error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to retrieve market overview",
    });
  }
}
