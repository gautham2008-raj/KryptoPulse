import { aiService, AIAnalysisRequest, classifyAIError } from "../src/server/aiService";
import { getLiveMarkets, getTechnicalIndicators } from "../src/server/cryptoService";
import { SUPPORTED_CURRENCIES } from "../src/utils/currencies";
import { FiatCurrencyCode } from "../src/types/crypto";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  // Parse body if string or object
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (_) {}
  }
  body = body || {};

  const { message, history, selectedCoin, currency: clientCurrency } = body;

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
    console.warn("[Vercel API Chat] Could not fetch markets for context:", mErr);
  }

  const marketSummary = markets
    .map(
      (c) =>
        `• ${c.name} (${c.symbol.toUpperCase()}): Current Price: ${currencyConfig.symbol}${c.current_price?.toLocaleString()} | 24h Change: ${
          c.price_change_percentage_24h > 0 ? "+" : ""
        }${c.price_change_percentage_24h?.toFixed(2)}% | 24h High: ${currencyConfig.symbol}${c.high_24h?.toLocaleString()} | 24h Low: ${currencyConfig.symbol}${c.low_24h?.toLocaleString()} | Market Cap: ${currencyConfig.symbol}${c.market_cap?.toLocaleString()} | Rank #${c.market_cap_rank}`
    )
    .join("\n");

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
      console.warn("[Vercel API Chat] Could not calculate technical indicators:", tErr);
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
    return res.status(200).json({
      success: true,
      reply: response.reply,
      provider: response.provider,
      model: response.model,
      currency: currencyConfig.code,
      symbol: currencyConfig.symbol,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    const classified = classifyAIError(err);
    console.error(`[Vercel API Chat Error] Duration: ${Date.now() - startTime}ms [${classified.code}]:`, err?.message || err);

    // If live cryptocurrency data is available, formulate factual response from live market data with clean notice
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
}
