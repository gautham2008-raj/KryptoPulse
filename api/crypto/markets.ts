import { getLiveMarkets } from "../../src/server/cryptoService";
import { SUPPORTED_CURRENCIES } from "../../src/utils/currencies";
import { FiatCurrencyCode } from "../../src/types/crypto";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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
    console.error("[Vercel API] /api/crypto/markets error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to retrieve cryptocurrency market data",
    });
  }
}
