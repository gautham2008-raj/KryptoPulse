import { GoogleGenAI } from "@google/genai";

// -----------------------------------------------------------------------------
// 1. Supported Fiat Currencies & Benchmark Coins
// -----------------------------------------------------------------------------

const FIAT_CONFIGS: Record<string, { code: string; symbol: string; name: string; rateVsUsd: number }> = {
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", rateVsUsd: 87.45 },
  USD: { code: "USD", symbol: "$", name: "US Dollar", rateVsUsd: 1.0 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", rateVsUsd: 0.92 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", rateVsUsd: 0.79 },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", rateVsUsd: 153.2 },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar", rateVsUsd: 1.38 },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", rateVsUsd: 1.52 },
  SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar", rateVsUsd: 1.35 },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham", rateVsUsd: 3.67 },
};

const COIN_METADATA: Record<string, { id: string; symbol: string; name: string; binanceSymbol: string; keywords: string[] }> = {
  bitcoin: { id: "bitcoin", symbol: "BTC", name: "Bitcoin", binanceSymbol: "BTCUSDT", keywords: ["bitcoin", "btc", "satoshi"] },
  ethereum: { id: "ethereum", symbol: "ETH", name: "Ethereum", binanceSymbol: "ETHUSDT", keywords: ["ethereum", "eth", "vitalik", "ether"] },
  tether: { id: "tether", symbol: "USDT", name: "Tether", binanceSymbol: "USDCUSDT", keywords: ["tether", "usdt", "stablecoin"] },
  binancecoin: { id: "binancecoin", symbol: "BNB", name: "BNB", binanceSymbol: "BNBUSDT", keywords: ["bnb", "binance", "binancecoin"] },
  solana: { id: "solana", symbol: "SOL", name: "Solana", binanceSymbol: "SOLUSDT", keywords: ["solana", "sol"] },
};

// -----------------------------------------------------------------------------
// 2. Safe Environment Variable Resolution (Server-Side Only)
// -----------------------------------------------------------------------------

export function getGeminiApiKey(): { key: string; source: string } {
  const envMap: Record<string, string | undefined> = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    AI_API_KEY: process.env.AI_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    GOOGLE_GENAI_API_KEY: process.env.GOOGLE_GENAI_API_KEY,
    VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY,
    VITE_AI_API_KEY: process.env.VITE_AI_API_KEY,
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    NEXT_PUBLIC_AI_API_KEY: process.env.NEXT_PUBLIC_AI_API_KEY,
  };

  for (const [name, val] of Object.entries(envMap)) {
    if (val && typeof val === "string" && val.trim().length > 5) {
      return { key: val.trim(), source: name };
    }
  }
  return { key: "", source: "NONE" };
}

export function getValidGeminiModel(): string {
  const envModel = (process.env.AI_MODEL || process.env.GEMINI_MODEL || "gemini-3.1-flash-lite").trim();
  // Map deprecated / unsupported model names to current active supported model
  if (
    envModel === "gemini-1.5-flash" ||
    envModel === "gemini-2.5-flash" ||
    envModel === "gemini-flash-latest" ||
    envModel === "gemini-pro" ||
    envModel === "gemini-2.0-flash"
  ) {
    return "gemini-3.1-flash-lite";
  }
  return envModel || "gemini-3.1-flash-lite";
}

// -----------------------------------------------------------------------------
// 3. Request Body Parsing
// -----------------------------------------------------------------------------

async function parseRequestBody(req: any): Promise<any> {
  if (req.body) {
    if (typeof req.body === "object") return req.body;
    if (typeof req.body === "string") {
      try {
        return JSON.parse(req.body);
      } catch (_) {
        return {};
      }
    }
  }
  return new Promise((resolve) => {
    let data = "";
    if (typeof req.on !== "function") {
      return resolve({});
    }
    req.on("data", (chunk: any) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (_) {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
    setTimeout(() => resolve({}), 500);
  });
}

// -----------------------------------------------------------------------------
// 4. Conversation Memory & Pronoun Resolution
// -----------------------------------------------------------------------------

function extractCoinsFromContext(userQuery: string, history: any[] = [], selectedCoin: string = "all"): string[] {
  const queryLower = userQuery.toLowerCase();
  const detected: string[] = [];

  // Direct keyword match in query
  for (const [key, meta] of Object.entries(COIN_METADATA)) {
    if (meta.keywords.some((kw) => queryLower.includes(kw))) {
      if (!detected.includes(key)) detected.push(key);
    }
  }

  // If no direct coin mentioned, inspect conversation history for pronouns ("it", "its", "that coin")
  const hasPronoun = /\b(it|its|this|that|the coin|that coin|this coin|the asset)\b/i.test(userQuery);
  if (detected.length === 0 && (hasPronoun || history.length > 0)) {
    for (let i = history.length - 1; i >= 0; i--) {
      const pastText = (history[i]?.content || "").toLowerCase();
      for (const [key, meta] of Object.entries(COIN_METADATA)) {
        if (meta.keywords.some((kw) => pastText.includes(kw))) {
          if (!detected.includes(key)) {
            detected.push(key);
            break;
          }
        }
      }
      if (detected.length > 0) break;
    }
  }

  // Selected coin dropdown fallback
  if (detected.length === 0 && selectedCoin && selectedCoin !== "all") {
    const sel = selectedCoin.toLowerCase();
    for (const [key, meta] of Object.entries(COIN_METADATA)) {
      if (key === sel || meta.symbol.toLowerCase() === sel) {
        detected.push(key);
        break;
      }
    }
  }

  return detected;
}

// -----------------------------------------------------------------------------
// 5. Smart Intent Classification (Determines conditional live data need ONLY)
// -----------------------------------------------------------------------------

function shouldFetchLiveData(userQuery: string, coinMatches: string[]): boolean {
  const lower = userQuery.toLowerCase().trim();

  const priceKeywords = [
    "price", "how much is", "what's", "whats", "rate", "cost", "value", "worth",
    "today's price", "todays price", "current price", "live price", "right now",
    "how much does", "today price", "trading at"
  ];
  const isAskingPrice = priceKeywords.some((pk) => lower.includes(pk));

  const comparisonKeywords = ["compare current", "price comparison", "which is higher", "which is stronger right now"];
  const isPriceComparison = comparisonKeywords.some((ck) => lower.includes(ck));

  const liveAnalysisKeywords = ["analyze bitcoin right now", "analyze right now", "live analysis", "current market indicate"];
  const isLiveAnalysis = liveAnalysisKeywords.some((ak) => lower.includes(ak));

  // Only fetch live market data when specific live price/market metrics are explicitly requested
  if ((isAskingPrice || isPriceComparison || isLiveAnalysis) && (coinMatches.length > 0 || lower.includes("crypto") || lower.includes("market"))) {
    return true;
  }

  return false;
}

// -----------------------------------------------------------------------------
// 6. Live Market Data Fetching (DENOMINATED IN USER'S ACTIVE CURRENCY)
// -----------------------------------------------------------------------------

interface LiveTicker {
  name: string;
  symbol: string;
  price: number;
  changePct: number;
  high: number;
  low: number;
  formattedSummary: string;
}

async function fetchSingleTicker(
  coinKey: string,
  rateVsUsd: number,
  symbol: string,
  currencyCode: string
): Promise<LiveTicker | null> {
  const meta = COIN_METADATA[coinKey.toLowerCase()] || COIN_METADATA.bitcoin;
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${meta.binanceSymbol}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const data = await res.json();
      const lastUsd = parseFloat(data.lastPrice) || 1.0;
      const changePct = parseFloat(data.priceChangePercent) || 0.0;
      const highUsd = parseFloat(data.highPrice) || lastUsd;
      const lowUsd = parseFloat(data.lowPrice) || lastUsd;
      const price = Math.round(lastUsd * rateVsUsd * 100) / 100;
      const high = Math.round(highUsd * rateVsUsd * 100) / 100;
      const low = Math.round(lowUsd * rateVsUsd * 100) / 100;

      return {
        name: meta.name,
        symbol: meta.symbol,
        price,
        changePct,
        high,
        low,
        formattedSummary: `• ${meta.name} (${meta.symbol}): Current Price: ${symbol}${price.toLocaleString()} ${currencyCode} | 24h Change: ${changePct > 0 ? "+" : ""}${changePct.toFixed(2)}% | 24h Range: ${symbol}${low.toLocaleString()} – ${symbol}${high.toLocaleString()}`,
      };
    }
  } catch (err: any) {
    console.warn(`[KryptoPulse Ticker] Warning for ${coinKey}:`, err?.message || err);
  }
  return null;
}

async function fetchMarketContext(
  coins: string[],
  rateVsUsd: number,
  symbol: string,
  currencyCode: string
): Promise<LiveTicker[]> {
  const targets = coins.length > 0 ? coins.slice(0, 3) : ["bitcoin"];
  const tickers: LiveTicker[] = [];

  await Promise.all(
    targets.map(async (c) => {
      const t = await fetchSingleTicker(c, rateVsUsd, symbol, currencyCode);
      if (t) tickers.push(t);
    })
  );

  return tickers;
}

// -----------------------------------------------------------------------------
// 7. Official Gemini Execution with SDK & Multi-Model Resilience
// -----------------------------------------------------------------------------

async function executeGemini(
  apiKey: string,
  primaryModel: string,
  systemInstruction: string,
  userMessage: string,
  history: { role: string; content: string }[] = []
): Promise<{ text: string; modelUsed: string }> {
  const modelCandidates = [primaryModel];
  if (primaryModel !== "gemini-3.1-flash-lite") {
    modelCandidates.push("gemini-3.1-flash-lite");
  }

  // Format multi-turn conversation contents
  const contents: any[] = [];
  if (Array.isArray(history) && history.length > 0) {
    for (const h of history.slice(-10)) {
      if (h && typeof h.content === "string" && h.content.trim()) {
        contents.push({
          role: h.role === "assistant" || h.role === "model" ? "model" : "user",
          parts: [{ text: h.content.trim() }],
        });
      }
    }
  }
  contents.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  let lastError: any = null;

  for (const model of modelCandidates) {
    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey.trim(),
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      const res = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (res && res.text) {
        return { text: res.text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.statusCode || 0;
      const msg = String(err?.message || err);
      console.warn(`[KryptoPulse AI] Model ${model} returned (${status}): ${msg.slice(0, 100)}`);

      // If credentials invalid (401/403), stop immediately
      if (status === 401 || status === 403 || msg.includes("API key not valid")) {
        throw err;
      }
      // If 429 quota exhaustion or 404, try candidate model
    }
  }

  throw lastError || new Error("Gemini AI execution failed across candidate models.");
}

// -----------------------------------------------------------------------------
// 8. Main Serverless Request Handler
// -----------------------------------------------------------------------------

export default async function handler(req: any, res: any) {
  // CORS & Security Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  const startTime = Date.now();
  const body = await parseRequestBody(req);
  const { message, history = [], selectedCoin = "all", currency = "INR" } = body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ success: false, error: "A non-empty message is required." });
  }

  const userQuery = message.trim();
  const upperCurrency = String(currency || "INR").toUpperCase();
  const currencyConfig = FIAT_CONFIGS[upperCurrency] || FIAT_CONFIGS.INR;

  // Step A: Environment Variable Detection (Server-Side Only)
  const { key: apiKey, source: keySource } = getGeminiApiKey();
  const configuredModel = getValidGeminiModel();
  const isKeyConfigured = Boolean(apiKey && apiKey.length > 5);

  // Safe Production Diagnostics in Vercel Logs (NO SECRETS PRINTED)
  console.log(`[KryptoPulse AI] Provider: gemini | Model: ${configuredModel} | API key configured: ${isKeyConfigured} (source: ${keySource}) | Currency: ${currencyConfig.code}`);

  // Step B: If API key is not configured, return meaningful 401 error (NEVER return fake welcome message!)
  if (!isKeyConfigured) {
    console.error("[KryptoPulse AI] Authentication Error: No Gemini API key detected in server environment.");
    return res.status(401).json({
      success: false,
      error: "AI authentication is not configured. Please ensure GEMINI_API_KEY or AI_API_KEY is configured in Vercel Project Settings > Environment Variables, and trigger a redeploy.",
      statusCode: 401,
      retryable: false,
    });
  }

  // Step C: Determine if live market data is conditionally needed
  const coinMatches = extractCoinsFromContext(userQuery, history, selectedCoin);
  const needsLiveData = shouldFetchLiveData(userQuery, coinMatches);

  let liveTickers: LiveTicker[] = [];
  if (needsLiveData) {
    liveTickers = await fetchMarketContext(
      coinMatches,
      currencyConfig.rateVsUsd,
      currencyConfig.symbol,
      currencyConfig.code
    );
  }

  // Step D: Build institutional system prompt with verified market telemetry when applicable
  const liveMarketTelemetrySection =
    liveTickers.length > 0
      ? `VERIFIED REAL-TIME MARKET TELEMETRY (${currencyConfig.name} - ${currencyConfig.code} ${currencyConfig.symbol}):
Timestamp: ${new Date().toUTCString()}
Source: Multi-Tier Aggregator
${liveTickers.map((t) => t.formattedSummary).join("\n")}
`
      : "";

  const systemInstruction = `You are KryptoPulse AI Analyst, an intelligent conversational assistant specializing in cryptocurrency, blockchain, digital assets, market concepts, and financial education.

OPERATIONAL INSTRUCTIONS:
1. DIRECT & CLEAR RESPONSES: Answer the user's actual question directly, accurately, and clearly. You are a conversational AI capable of answering general educational and conversational questions as well as in-depth cryptocurrency topics. If a user asks a general question (e.g., greetings, how are you, general technology, economics, inflation), answer helpfully and politely. Never refuse a question merely because it is not about crypto.
2. VERIFIED MARKET DATA INTEGRITY: When VERIFIED REAL-TIME MARKET TELEMETRY is supplied in this context, use that verified data and do not invent current prices. Quote prices and values in ${currencyConfig.code} (${currencyConfig.symbol}). Never fabricate live prices, market statistics, or current trading figures. If asked for live prices of assets not in your verified context, state clearly what data you have access to rather than guessing.
3. CLEAR SEPARATION OF DATA & INTERPRETATION: Clearly distinguish verified market data from your analysis and qualitative interpretation.
4. BALANCED EDUCATIONAL INSIGHTS (NO FINANCIAL ADVICE): For questions about markets or investing, provide balanced educational information and explain uncertainty and risk. Do not guarantee profits or claim certainty about future market movements. Conclude investment analyses with:
   "\n\n*⚠️ Educational Analysis Only: This information is for educational purposes and does not constitute financial or investment advice. Always conduct your own research (DYOR).*"
5. REAL-WORLD DATA BOUNDARIES: Do not claim to have live information unless live information has actually been provided to you (for example, if asked about real-time weather outside financial markets, explain your data boundaries helpfully).
6. CONVERSATION CONTINUITY: Maintain conversation context and understand follow-up questions across multiple turns (e.g. "Who created it?", "What is its current price?").

${liveMarketTelemetrySection}`.trim();

  // Step E: Send actual user message to Gemini using @google/genai SDK
  try {
    const result = await executeGemini(apiKey, configuredModel, systemInstruction, userQuery, history);
    const duration = Date.now() - startTime;
    console.log(`[KryptoPulse AI] Response generated successfully in ${duration}ms using ${result.modelUsed}`);

    return res.status(200).json({
      success: true,
      reply: result.text,
      message: result.text,
      provider: "gemini",
      model: result.modelUsed,
      currency: currencyConfig.code,
      symbol: currencyConfig.symbol,
      durationMs: duration,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    const duration = Date.now() - startTime;
    const status = err?.status || err?.statusCode || 500;
    const errorMsg = String(err?.message || err);

    console.error(`[KryptoPulse AI Error] Duration: ${duration}ms | HTTP ${status} | Message: ${errorMsg}`);

    // Map error codes according to Requirement 16
    let userFacingError = "AI service is temporarily unavailable.";
    let responseStatus = 503;

    if (status === 401 || status === 403 || errorMsg.includes("API key not valid") || errorMsg.includes("auth")) {
      userFacingError = "AI authentication is not configured correctly.";
      responseStatus = 401;
    } else if (status === 404 || errorMsg.includes("not found")) {
      userFacingError = "Configured AI model or endpoint is unavailable.";
      responseStatus = 404;
    } else if (status === 429 || errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
      userFacingError = "AI service is temporarily rate limited. Please try again shortly.";
      responseStatus = 429;
    } else if (status >= 500) {
      userFacingError = "AI service is temporarily unavailable.";
      responseStatus = 503;
    }

    return res.status(responseStatus).json({
      success: false,
      error: userFacingError,
      statusCode: responseStatus,
      retryable: responseStatus === 429 || responseStatus >= 500,
    });
  }
}
