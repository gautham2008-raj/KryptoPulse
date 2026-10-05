// Supported fiat currencies conversion matrix (vs USD)
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

// Map coin names to Binance symbols for fast live pricing
const COIN_TICKERS: Record<string, { symbol: string; name: string; binanceSymbol: string }> = {
  bitcoin: { symbol: "BTC", name: "Bitcoin", binanceSymbol: "BTCUSDT" },
  btc: { symbol: "BTC", name: "Bitcoin", binanceSymbol: "BTCUSDT" },
  ethereum: { symbol: "ETH", name: "Ethereum", binanceSymbol: "ETHUSDT" },
  eth: { symbol: "ETH", name: "Ethereum", binanceSymbol: "ETHUSDT" },
  tether: { symbol: "USDT", name: "Tether", binanceSymbol: "USDCUSDT" },
  usdt: { symbol: "USDT", name: "Tether", binanceSymbol: "USDCUSDT" },
  binancecoin: { symbol: "BNB", name: "BNB", binanceSymbol: "BNBUSDT" },
  bnb: { symbol: "BNB", name: "BNB", binanceSymbol: "BNBUSDT" },
  solana: { symbol: "SOL", name: "Solana", binanceSymbol: "SOLUSDT" },
  sol: { symbol: "SOL", name: "Solana", binanceSymbol: "SOLUSDT" },
};

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

/**
 * Fetch fast live ticker from Binance for grounding price questions
 */
async function fetchLiveTicker(coinKey: string, currencyRate: number, currencySymbol: string, currencyCode: string) {
  const meta = COIN_TICKERS[coinKey.toLowerCase()] || COIN_TICKERS.btc;
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${meta.binanceSymbol}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      const lastUsd = parseFloat(data.lastPrice) || 1.0;
      const changePct = parseFloat(data.priceChangePercent) || 0.0;
      const highUsd = parseFloat(data.highPrice) || lastUsd;
      const lowUsd = parseFloat(data.lowPrice) || lastUsd;
      const price = Math.round(lastUsd * currencyRate * 100) / 100;
      const high = Math.round(highUsd * currencyRate * 100) / 100;
      const low = Math.round(lowUsd * currencyRate * 100) / 100;
      return {
        name: meta.name,
        symbol: meta.symbol,
        price,
        changePct,
        high,
        low,
        summary: `• ${meta.name} (${meta.symbol}): Current Price: ${currencySymbol}${price.toLocaleString()} ${currencyCode} | 24h Change: ${changePct > 0 ? "+" : ""}${changePct.toFixed(2)}% | 24h High: ${currencySymbol}${high.toLocaleString()} | 24h Low: ${currencySymbol}${low.toLocaleString()}`,
      };
    }
  } catch (err: any) {
    console.warn(`[KryptoPulse AI Chat] Quick ticker fetch warning for ${coinKey}:`, err?.message || err);
  }
  return null;
}

/**
 * Normalizes Gemini model names to the active, supported model
 */
function resolveGeminiModel(userConfiguredModel?: string): string {
  const model = (userConfiguredModel || process.env.AI_MODEL || process.env.GEMINI_MODEL || "gemini-3.8-flash").trim();
  // Map deprecated / unavailable models to gemini-3.8-flash
  if (
    model === "gemini-1.5-flash" ||
    model === "gemini-2.5-flash" ||
    model === "gemini-flash-latest" ||
    model === "gemini-pro"
  ) {
    return "gemini-3.8-flash";
  }
  return model || "gemini-3.8-flash";
}

/**
 * Call Google Gemini using direct native REST API with backoff retry
 */
async function callGeminiRest(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  history: { role: string; content: string }[] = []
): Promise<{ reply: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const contents: any[] = [];
  if (Array.isArray(history) && history.length > 0) {
    for (const h of history.slice(-6)) {
      if (h && h.content) {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }],
        });
      }
    }
  }

  contents.push({
    role: "user",
    parts: [{ text: userPrompt }],
  });

  const payload = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
    },
  };

  const backoffs = [1000, 2000, 4000];
  let lastError: any = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "aistudio-build",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const status = res.status;
        const errMsg = json?.error?.message || `HTTP ${status}`;
        const error = new Error(errMsg) as any;
        error.status = status;
        error.raw = json;

        // Diagnostic log without exposing key
        console.error(`[KryptoPulse AI Diagnostic] Attempt ${attempt} failed: HTTP ${status} | Provider: gemini | Model: ${model} | Error: ${errMsg}`);

        // Do not retry authentication errors (401/403), missing models (404), or daily quota exhaustion
        if (
          status === 400 ||
          status === 401 ||
          status === 403 ||
          status === 404 ||
          (status === 429 && (errMsg.includes("Quota") || errMsg.includes("quota") || errMsg.includes("exceeded")))
        ) {
          throw error;
        }

        lastError = error;
        if (attempt < 3 && (status === 429 || status === 500 || status === 502 || status === 503)) {
          await new Promise((r) => setTimeout(r, backoffs[attempt - 1]));
          continue;
        }
        throw error;
      }

      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return { reply: text };
      }
      throw new Error("No text response in Gemini candidate output");
    } catch (err: any) {
      lastError = err;
      if (err.status === 401 || err.status === 403 || err.status === 404) {
        throw err;
      }
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, backoffs[attempt - 1]));
      }
    }
  }

  throw lastError || new Error("Gemini generation failed after retries.");
}

/**
 * Call OpenAI Compatible endpoint if AI_PROVIDER=openai
 */
async function callOpenAiCompatible(
  apiKey: string,
  model: string,
  baseUrl: string,
  systemPrompt: string,
  userPrompt: string,
  history: { role: string; content: string }[] = []
): Promise<{ reply: string }> {
  const messages = [
    { role: "system", content: systemPrompt },
    ...(history || []).map((h) => ({
      role: h.role === "model" ? "assistant" : "user",
      content: h.content,
    })),
    { role: "user", content: userPrompt },
  ];

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
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
    const error = new Error(json?.error?.message || `HTTP ${res.status}`) as any;
    error.status = res.status;
    console.error(`[KryptoPulse AI Diagnostic] OpenAI HTTP ${res.status}: ${error.message}`);
    throw error;
  }

  const reply = json?.choices?.[0]?.message?.content;
  if (reply) return { reply };
  throw new Error("No content received from OpenAI completion");
}

export default async function handler(req: any, res: any) {
  // CORS & Methods
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
  const { message, history, selectedCoin = "all", currency = "INR" } = body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ success: false, error: "A non-empty message is required." });
  }

  const userQuery = message.trim();
  const upperCurrency = (String(currency || "INR").toUpperCase()) as string;
  const currencyConfig = FIAT_CONFIGS[upperCurrency] || FIAT_CONFIGS.INR;

  // Provider & Model configuration
  const aiProvider = (process.env.AI_PROVIDER || "gemini").trim().toLowerCase();
  const isGemini = aiProvider !== "openai" && aiProvider !== "openai-compatible";
  const apiKey = isGemini
    ? (process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "").trim()
    : (process.env.OPENAI_API_KEY || "").trim();
  const model = isGemini ? resolveGeminiModel(process.env.AI_MODEL) : (process.env.AI_MODEL || "gpt-4o-mini");

  // Log request arrival safely (NEVER logging the secret key)
  console.log(`[KryptoPulse AI Chat] Inquiry: "${userQuery.slice(0, 60)}" | Provider: ${aiProvider} | Model: ${model} | Key configured: ${Boolean(apiKey && apiKey.length > 5)}`);

  // Detect query intent: Is it a simple greeting or does it request live crypto telemetry?
  const lowerQuery = userQuery.toLowerCase();
  const isSimpleGreeting =
    /^(hi|hello|hey|greetings|hola|good\s(morning|afternoon|evening)|who\sare\syou|what\scan\syou\sdo)(\s|!|\.|\?)*$/i.test(
      userQuery
    );

  const coinMentioned =
    Object.keys(COIN_TICKERS).find((k) => lowerQuery.includes(k)) ||
    (selectedCoin && selectedCoin !== "all" ? selectedCoin.toLowerCase() : null);

  const requestsPriceOrAnalysis =
    lowerQuery.includes("price") ||
    lowerQuery.includes("rate") ||
    lowerQuery.includes("cost") ||
    lowerQuery.includes("value") ||
    lowerQuery.includes("worth") ||
    lowerQuery.includes("market") ||
    lowerQuery.includes("analyze") ||
    lowerQuery.includes("analysis") ||
    lowerQuery.includes("rsi") ||
    lowerQuery.includes("today") ||
    lowerQuery.includes("high") ||
    lowerQuery.includes("low") ||
    lowerQuery.includes("volume") ||
    lowerQuery.includes("gain") ||
    lowerQuery.includes("drop");

  // Retrieve fast live ticker if market data is relevant
  let liveTicker: any = null;
  if (!isSimpleGreeting && (coinMentioned || requestsPriceOrAnalysis)) {
    liveTicker = await fetchLiveTicker(coinMentioned || "btc", currencyConfig.rateVsUsd, currencyConfig.symbol, currencyConfig.code);
  }

  // Check API key configuration
  if (!apiKey || apiKey.length < 5) {
    console.error("[KryptoPulse AI Diagnostic] Authentication missing: AI_API_KEY / GEMINI_API_KEY is not configured in environment.");

    if (liveTicker) {
      return res.status(200).json({
        success: true,
        reply: `### 📊 Live Telemetry: ${liveTicker.name} (${liveTicker.symbol})\n\n• **Current Price:** ${currencyConfig.symbol}${liveTicker.price.toLocaleString()} ${currencyConfig.code}\n• **24-Hour Movement:** ${liveTicker.changePct > 0 ? "+" : ""}${liveTicker.changePct.toFixed(2)}%\n• **24h Range:** ${currencyConfig.symbol}${liveTicker.low.toLocaleString()} – ${currencyConfig.symbol}${liveTicker.high.toLocaleString()}\n\n*Notice: AI authentication needs to be checked (add AI_API_KEY in Vercel Project Settings > Environment Variables). Verified real-time cryptocurrency telemetry is shown above.*\n\n*⚠️ Educational Information Only: Always do your own research (DYOR).*`,
        isFallback: true,
        notice: "AI authentication needs to be checked.",
        currency: currencyConfig.code,
        symbol: currencyConfig.symbol,
      });
    }

    if (isSimpleGreeting) {
      return res.status(200).json({
        success: true,
        reply: `Hello! I'm KryptoPulse AI Analyst, your institutional-grade cryptocurrency research assistant.\n\nI can help you:\n• **Real-Time Prices & Telemetry:** Monitor benchmark coins (BTC, ETH, USDT, BNB, SOL) in ${currencyConfig.name} (${currencyConfig.code} ${currencyConfig.symbol}).\n• **Deep Market Analysis:** Inspect 24-hour changes, volume, market cap, and momentum.\n• **Technical Indicators:** Review RSI, MACD, Bollinger Bands, and support/resistance levels.\n• **Comparative Research:** Compare performance across major crypto assets.\n\nHow can I assist your market analysis today?`,
        isFallback: true,
        notice: "AI key is being configured. Real-time cryptocurrency telemetry is fully operational.",
        currency: currencyConfig.code,
        symbol: currencyConfig.symbol,
      });
    }

    return res.status(401).json({
      success: false,
      error: "AI authentication needs to be checked. Please set AI_API_KEY in Vercel Project Settings.",
      statusCode: 401,
      retryable: false,
    });
  }

  // Construct grounded system prompt
  const systemPrompt = `You are KryptoPulse AI Analyst, an institutional-grade cryptocurrency research assistant.
Active Currency: ${currencyConfig.name} (${currencyConfig.code} - ${currencyConfig.symbol}).

${liveTicker ? `VERIFIED LIVE CRYPTOCURRENCY MARKET DATA:\n${liveTicker.summary}\n(Timestamp: ${new Date().toUTCString()})\n` : ""}
GUIDELINES:
1. Always quote prices and financial amounts in ${currencyConfig.code} (${currencyConfig.symbol}).
2. Use verified market numbers provided. Never invent or hallucinate price levels.
3. For conversational questions like "hi" or "who are you", be welcoming, concise, and helpful.
4. For coin analysis, organize your output with clear markdown headings (### 📊 Live Data, ### 📈 Analysis, ### ⚠️ Risks & Insights).
5. Always conclude educational investment analyses with a disclaimer that cryptocurrency assets are volatile and this is for educational purposes only.`;

  try {
    let result: { reply: string };

    if (isGemini) {
      result = await callGeminiRest(apiKey, model, systemPrompt, userQuery, history);
    } else {
      const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
      result = await callOpenAiCompatible(apiKey, model, baseUrl, systemPrompt, userQuery, history);
    }

    const duration = Date.now() - startTime;
    console.log(`[KryptoPulse AI Chat] Success in ${duration}ms | Provider: ${aiProvider} | Model: ${model}`);

    return res.status(200).json({
      success: true,
      reply: result.reply,
      provider: aiProvider,
      model,
      currency: currencyConfig.code,
      symbol: currencyConfig.symbol,
      durationMs: duration,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    const duration = Date.now() - startTime;
    const status = err?.status || 500;
    const errorMsg = String(err?.message || err);

    let category = "PROVIDER_ERROR";
    let userFacingNotice = "AI service is temporarily unavailable. Please try again.";

    if (status === 429 || errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota")) {
      category = "RATE_LIMIT";
      userFacingNotice = "AI service is currently rate limited. Please try again shortly.";
    } else if (status === 401 || status === 403 || errorMsg.includes("API key") || errorMsg.includes("auth")) {
      category = "AUTHENTICATION";
      userFacingNotice = "AI authentication needs to be checked.";
    } else if (status === 404 || errorMsg.includes("not found")) {
      category = "INVALID_MODEL";
      userFacingNotice = `AI model configuration issue: ${model}. Please verify AI_MODEL.`;
    }

    // Safe diagnostic log in Vercel Function logs
    console.error(`[KryptoPulse AI Diagnostic Error] Duration: ${duration}ms | HTTP Status: ${status} | Category: ${category} | Provider: ${aiProvider} | Model: ${model} | Message: ${errorMsg}`);

    // If live cryptocurrency data is available, answer with factual live telemetry
    if (liveTicker) {
      return res.status(200).json({
        success: true,
        reply: `### 📊 Live Telemetry: ${liveTicker.name} (${liveTicker.symbol})\n\n• **Current Price:** ${currencyConfig.symbol}${liveTicker.price.toLocaleString()} ${currencyConfig.code}\n• **24-Hour Movement:** ${liveTicker.changePct > 0 ? "+" : ""}${liveTicker.changePct.toFixed(2)}%\n• **24h Range:** ${currencyConfig.symbol}${liveTicker.low.toLocaleString()} – ${currencyConfig.symbol}${liveTicker.high.toLocaleString()}\n\n*Notice: ${userFacingNotice} Verified real-time cryptocurrency telemetry is shown above.*\n\n*⚠️ Educational Information Only: Always do your own research (DYOR).*`,
        isFallback: true,
        notice: userFacingNotice,
        currency: currencyConfig.code,
        symbol: currencyConfig.symbol,
      });
    }

    if (isSimpleGreeting) {
      return res.status(200).json({
        success: true,
        reply: `Hello! I'm KryptoPulse AI Analyst, your institutional-grade cryptocurrency research assistant.\n\nI can help you:\n• **Real-Time Prices & Telemetry:** Monitor benchmark coins (BTC, ETH, USDT, BNB, SOL) in ${currencyConfig.name} (${currencyConfig.code} ${currencyConfig.symbol}).\n• **Deep Market Analysis:** Inspect 24-hour changes, volume, market cap, and momentum.\n• **Technical Indicators:** Review RSI, MACD, Bollinger Bands, and support/resistance levels.\n• **Comparative Research:** Compare performance across major crypto assets.\n\nHow can I assist your market analysis today?`,
        isFallback: true,
        notice: userFacingNotice,
        currency: currencyConfig.code,
        symbol: currencyConfig.symbol,
      });
    }

    return res.status(status === 401 ? 401 : status === 429 ? 429 : 503).json({
      success: false,
      error: userFacingNotice,
      statusCode: status,
      category,
      retryable: status === 429 || status >= 500,
    });
  }
}
