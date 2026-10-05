import { GoogleGenAI } from "@google/genai";

// -----------------------------------------------------------------------------
// 1. Currency & Coin Configurations
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
// 2. Request Parsing Helper
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
// 3. Conversation Memory & Coin Detection
// -----------------------------------------------------------------------------

function extractCoinsFromContext(userQuery: string, history: any[] = [], selectedCoin: string = "all"): string[] {
  const queryLower = userQuery.toLowerCase();
  const detected: string[] = [];

  // 1. Direct mention in current message
  for (const [key, meta] of Object.entries(COIN_METADATA)) {
    if (meta.keywords.some((kw) => queryLower.includes(kw))) {
      if (!detected.includes(key)) detected.push(key);
    }
  }

  // 2. If no coin mentioned directly, inspect conversation memory for pronouns ("it", "its", "that coin", etc.)
  const hasPronoun = /\b(it|its|this|that|the coin|that coin|this coin|the asset)\b/i.test(userQuery);
  if (detected.length === 0 && (hasPronoun || history.length > 0)) {
    // Look backwards through recent history
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

  // 3. Dropdown selection fallback if available and specific
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
// 4. Smart Query Classification (Never rejects; only decides external data need)
// -----------------------------------------------------------------------------

export type QueryCategory =
  | "GENERAL"
  | "CRYPTO_EDUCATION"
  | "LIVE_MARKET_DATA"
  | "HISTORICAL_MARKET_DATA"
  | "MARKET_ANALYSIS"
  | "COMPARISON";

function classifyQuery(userQuery: string, coinMatches: string[]): { category: QueryCategory; needsLiveData: boolean } {
  const lower = userQuery.toLowerCase().trim();

  // Price inquiries
  const priceKeywords = [
    "price", "how much is", "what's", "whats", "rate", "cost", "value", "worth",
    "today's", "todays", "current price", "live price", "right now", "how much does"
  ];
  const isAskingPrice = priceKeywords.some((pk) => lower.includes(pk));

  // Comparison inquiries
  const comparisonKeywords = ["compare", "difference between", "versus", " vs ", "vs.", "better investment", "which is stronger"];
  const isComparison = comparisonKeywords.some((ck) => lower.includes(ck)) || coinMatches.length > 1;

  // Analysis inquiries
  const analysisKeywords = ["analyze", "analysis", "should i buy", "should i sell", "bullish", "bearish", "outlook", "trend", "indicator", "signals"];
  const isAnalysis = analysisKeywords.some((ak) => lower.includes(ak));

  // Historical inquiries
  const historicalKeywords = ["yesterday", "last week", "last month", "ath", "all time high", "historical", "past price"];
  const isHistorical = historicalKeywords.some((hk) => lower.includes(hk));

  // Determine category
  if (isComparison && (isAskingPrice || isAnalysis || coinMatches.length > 0)) {
    return { category: "COMPARISON", needsLiveData: true };
  }
  if (isAskingPrice && (coinMatches.length > 0 || lower.includes("crypto") || lower.includes("market") || lower.includes("coin"))) {
    return { category: "LIVE_MARKET_DATA", needsLiveData: true };
  }
  if (isAnalysis && (coinMatches.length > 0 || lower.includes("market") || lower.includes("crypto"))) {
    return { category: "MARKET_ANALYSIS", needsLiveData: true };
  }
  if (isHistorical && coinMatches.length > 0) {
    return { category: "HISTORICAL_MARKET_DATA", needsLiveData: true };
  }

  // Educational crypto questions (NO live data needed - direct AI reasoning)
  const educationalKeywords = [
    "what is", "explain", "how does", "why does", "definition", "concept", "meaning",
    "blockchain", "crypto", "bitcoin", "ethereum", "defi", "nft", "smart contract",
    "proof of work", "proof of stake", "mining", "halving", "rsi", "macd", "volatility",
    "market cap", "inflation", "tokenomics", "liquidity", "bull market", "bear market",
    "wallet", "ledger", "decentralized", "gas fee"
  ];
  const isEducational = educationalKeywords.some((ek) => lower.includes(ek));
  if (isEducational) {
    return { category: "CRYPTO_EDUCATION", needsLiveData: false };
  }

  // General conversational or general questions (NO live data needed)
  return { category: "GENERAL", needsLiveData: false };
}

// -----------------------------------------------------------------------------
// 5. Fast Live Ticker Retrieval (Only when conditional data is needed)
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
// 6. Gemini Inference with Multi-Model Quota Resilience
// -----------------------------------------------------------------------------

async function executeGeminiWithFallback(
  apiKey: string,
  configuredModel: string,
  systemInstruction: string,
  userMessage: string,
  history: { role: string; content: string }[] = []
): Promise<{ text: string; modelUsed: string }> {
  // Candidate models: Primary (gemini-3.8-flash or configured) -> Fallback (gemini-3.1-flash-lite)
  let primary = (configuredModel || process.env.AI_MODEL || "gemini-3.8-flash").trim();
  if (
    primary === "gemini-1.5-flash" ||
    primary === "gemini-2.5-flash" ||
    primary === "gemini-flash-latest" ||
    primary === "gemini-pro"
  ) {
    primary = "gemini-3.8-flash";
  }

  const modelCandidates = [primary];
  if (primary !== "gemini-3.1-flash-lite") {
    modelCandidates.push("gemini-3.1-flash-lite");
  }

  // Format conversation history for Gemini contents
  const contents: any[] = [];
  if (Array.isArray(history) && history.length > 0) {
    for (const h of history.slice(-10)) {
      if (h && h.content && typeof h.content === "string") {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }],
        });
      }
    }
  }
  contents.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  let lastError: any = null;

  // Try GoogleGenAI SDK first
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
    } catch (sdkErr: any) {
      lastError = sdkErr;
      const status = sdkErr?.status || sdkErr?.statusCode || 0;
      const msg = String(sdkErr?.message || sdkErr);
      console.warn(`[KryptoPulse AI] Model ${model} returned (${status}): ${msg.slice(0, 120)}`);

      // If auth failure (401/403), do not try next model - credentials invalid
      if (status === 401 || status === 403 || msg.includes("API key not valid")) {
        throw sdkErr;
      }
      // If 429 quota exhaustion or 404 missing model, continue to fallback model
    }
  }

  // If SDK attempts failed with transient error, try native REST API with backoff
  for (const model of modelCandidates) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
      const payload = {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: { temperature: 0.7 },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "aistudio-build" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(12000),
      });

      const json = await res.json().catch(() => null);
      if (res.ok && json?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return { text: json.candidates[0].content.parts[0].text, modelUsed: model };
      }
    } catch (restErr: any) {
      lastError = restErr;
    }
  }

  throw lastError || new Error("All AI model candidates failed to return a response.");
}

// -----------------------------------------------------------------------------
// 7. OpenAI Compatible Endpoint (When AI_PROVIDER=openai)
// -----------------------------------------------------------------------------

async function executeOpenAI(
  apiKey: string,
  model: string,
  systemInstruction: string,
  userMessage: string,
  history: { role: string; content: string }[] = []
): Promise<{ text: string; modelUsed: string }> {
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const messages = [
    { role: "system", content: systemInstruction },
    ...(history || []).slice(-10).map((h) => ({
      role: h.role === "model" ? "assistant" : h.role === "user" ? "user" : "assistant",
      content: h.content,
    })),
    { role: "user", content: userMessage },
  ];

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: model || "gpt-4o-mini",
      messages,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(15000),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.error?.message || `OpenAI HTTP ${res.status}`);
  }
  const reply = json?.choices?.[0]?.message?.content;
  if (reply) return { text: reply, modelUsed: model || "gpt-4o-mini" };
  throw new Error("No content received from OpenAI completion.");
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
    return res.status(400).json({ success: false, error: "A message is required." });
  }

  const userQuery = message.trim();
  const upperCurrency = String(currency || "INR").toUpperCase();
  const currencyConfig = FIAT_CONFIGS[upperCurrency] || FIAT_CONFIGS.INR;

  // Provider & Key resolution
  const aiProvider = (process.env.AI_PROVIDER || "gemini").trim().toLowerCase();
  const isGemini = aiProvider !== "openai" && aiProvider !== "openai-compatible";
  const apiKey = isGemini
    ? (process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "").trim()
    : (process.env.OPENAI_API_KEY || "").trim();
  const configuredModel = process.env.AI_MODEL || (isGemini ? "gemini-3.8-flash" : "gpt-4o-mini");

  // Step A: Extract coin mentions from message or conversation memory
  const coinMatches = extractCoinsFromContext(userQuery, history, selectedCoin);

  // Step B: Smart classification for CONDITIONAL live market data
  const { category, needsLiveData } = classifyQuery(userQuery, coinMatches);

  console.log(
    `[KryptoPulse AI Request] Query: "${userQuery.slice(0, 60)}" | Category: ${category} | Needs Live Data: ${needsLiveData} | Coins: [${coinMatches.join(", ")}] | Currency: ${currencyConfig.code}`
  );

  // Step C: Retrieve live market data ONLY IF NEEDED
  let liveTickers: LiveTicker[] = [];
  if (needsLiveData) {
    liveTickers = await fetchMarketContext(
      coinMatches,
      currencyConfig.rateVsUsd,
      currencyConfig.symbol,
      currencyConfig.code
    );
  }

  // Step D: Construct institutional system prompt
  const liveMarketTelemetrySection =
    liveTickers.length > 0
      ? `VERIFIED REAL-TIME MARKET TELEMETRY (${currencyConfig.name} - ${currencyConfig.code} ${currencyConfig.symbol}):
Timestamp: ${new Date().toUTCString()}
Source: Multi-Tier Aggregator
${liveTickers.map((t) => t.formattedSummary).join("\n")}
`
      : "";

  const systemInstruction = `You are KryptoPulse AI Analyst, an institutional-grade educational cryptocurrency, blockchain, and financial research assistant.

CORE PRINCIPLES:
1. COMPREHENSIVE & CONVERSATIONAL: You are a genuine general-purpose conversational AI assistant with deep domain specialization in cryptocurrency, decentralized finance (DeFi), blockchain protocols, tokenomics, technical analysis, and market mechanics. Answer the user's actual question directly, accurately, and clearly. If asked general educational or conversational questions (such as greetings, general science, economics, inflation, or coding), answer helpfully and politely. Never refuse a question just because it is outside crypto.
2. VERIFIED MARKET DATA INTEGRITY: When VERIFIED REAL-TIME MARKET TELEMETRY is provided in your context, rely strictly on those numbers to quote current prices, 24-hour ranges, percentage movements, and volumes in ${currencyConfig.code} (${currencyConfig.symbol}). NEVER invent, fabricate, or hallucinate live cryptocurrency prices, market statistics, or current trading levels. If asked for current prices of assets not in your verified live context, clearly explain that you only have real-time telemetry for supported benchmark assets rather than guessing.
3. CLEAR SEPARATION OF DATA & ANALYSIS: Visually distinguish factual live market telemetry from your qualitative insights and educational analysis.
4. BALANCED EDUCATIONAL INSIGHTS (NO FINANCIAL ADVICE):
   - When asked "Should I buy?", "Is it bullish?", or for market analysis, provide a balanced educational overview detailing both upside catalysts and downside risks.
   - Never guarantee future profits or give direct investment orders.
   - Use professional educational phrasing ("Based on current market data...", "Factors to evaluate...", "Digital assets carry inherent volatility...").
   - Conclude market and investment analyses with:
     "\n\n*⚠️ Educational Analysis Only: This information is for educational purposes and does not constitute financial or investment advice. Always conduct your own research (DYOR).*"
5. REAL-WORLD DATA BOUNDARIES: If asked about live real-world events outside cryptocurrency (such as today's live weather or live sports), state clearly that you do not have live access to non-financial sensors/weather feeds, and answer any underlying conceptual knowledge helpfully.
6. CONVERSATION CONTINUITY: Maintain conversation memory and understand follow-up questions referencing previous turns (e.g. "Who created it?", "How much is it worth now?").

${liveMarketTelemetrySection}`.trim();

  // Step E: Execute AI Model Inference
  if (apiKey && apiKey.length > 5) {
    try {
      let result: { text: string; modelUsed: string };
      if (isGemini) {
        result = await executeGeminiWithFallback(apiKey, configuredModel, systemInstruction, userQuery, history);
      } else {
        result = await executeOpenAI(apiKey, configuredModel, systemInstruction, userQuery, history);
      }

      const duration = Date.now() - startTime;
      console.log(`[KryptoPulse AI Success] Duration: ${duration}ms | Model: ${result.modelUsed}`);

      return res.status(200).json({
        success: true,
        reply: result.text,
        provider: aiProvider,
        model: result.modelUsed,
        category,
        currency: currencyConfig.code,
        symbol: currencyConfig.symbol,
        durationMs: duration,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      const status = err?.status || err?.statusCode || 500;
      const errorMsg = String(err?.message || err);
      console.error(`[KryptoPulse AI Diagnostic] HTTP ${status} | Provider: ${aiProvider} | Model: ${configuredModel} | Error: ${errorMsg}`);

      // If live market data was retrieved, formulate an exact factual response so the user gets real numbers
      if (liveTickers.length > 0) {
        const primaryTicker = liveTickers[0];
        return res.status(200).json({
          success: true,
          reply: `### 📊 Live Telemetry: ${primaryTicker.name} (${primaryTicker.symbol})\n\n• **Current Price:** ${currencyConfig.symbol}${primaryTicker.price.toLocaleString()} ${currencyConfig.code}\n• **24-Hour Movement:** ${primaryTicker.changePct > 0 ? "+" : ""}${primaryTicker.changePct.toFixed(2)}%\n• **24h Range:** ${currencyConfig.symbol}${primaryTicker.low.toLocaleString()} – ${currencyConfig.symbol}${primaryTicker.high.toLocaleString()}\n\n*Notice: AI generative reasoning is temporarily delayed. Real-time cryptocurrency telemetry is shown directly above.*\n\n*⚠️ Educational Information Only: Always do your own research (DYOR).*`,
          isFallback: true,
          category,
          notice: "Real-time cryptocurrency telemetry active.",
          currency: currencyConfig.code,
          symbol: currencyConfig.symbol,
        });
      }

      // Safe error response without exposing secrets
      return res.status(status === 401 ? 401 : status === 429 ? 429 : 503).json({
        success: false,
        error: status === 429 ? "AI service is currently rate limited. Please try again shortly." : "AI service is temporarily unavailable. Please try again.",
        category,
        statusCode: status,
        retryable: true,
      });
    }
  }

  // Step F: Graceful fallback if AI_API_KEY is not configured in environment
  console.warn("[KryptoPulse AI] API key is not configured in runtime environment.");

  if (liveTickers.length > 0) {
    const primaryTicker = liveTickers[0];
    return res.status(200).json({
      success: true,
      reply: `### 📊 Live Telemetry: ${primaryTicker.name} (${primaryTicker.symbol})\n\n• **Current Price:** ${currencyConfig.symbol}${primaryTicker.price.toLocaleString()} ${currencyConfig.code}\n• **24-Hour Movement:** ${primaryTicker.changePct > 0 ? "+" : ""}${primaryTicker.changePct.toFixed(2)}%\n• **24h Range:** ${currencyConfig.symbol}${primaryTicker.low.toLocaleString()} – ${currencyConfig.symbol}${primaryTicker.high.toLocaleString()}\n\n*Notice: AI key configuration in progress. Real-time cryptocurrency telemetry is fully operational.*\n\n*⚠️ Educational Information Only: Always do your own research (DYOR).*`,
      isFallback: true,
      category,
      currency: currencyConfig.code,
      symbol: currencyConfig.symbol,
    });
  }

  return res.status(200).json({
    success: true,
    reply: `Hello! I'm KryptoPulse AI Analyst, your educational cryptocurrency and market research assistant.\n\nI can help you:\n• Track live prices across benchmark coins (BTC, ETH, USDT, BNB, SOL) in ${currencyConfig.name} (${currencyConfig.code} ${currencyConfig.symbol})\n• Explain blockchain technology, consensus protocols (PoW, PoS), and smart contracts\n• Break down technical indicators (RSI, MACD, Bollinger Bands)\n• Conduct comparative market research\n\n*(To enable full open-domain AI completions in production, ensure \`AI_API_KEY\` is set in Vercel Project Settings > Environment Variables.)*`,
    isFallback: true,
    category,
    currency: currencyConfig.code,
    symbol: currencyConfig.symbol,
  });
}
