import { GoogleGenAI } from "@google/genai";

export interface AIAnalysisRequest {
  message: string;
  selectedCoin: string;
  currency: string;
  currencySymbol: string;
  history?: { role: "user" | "model"; content: string }[];
  marketSummary: string;
  coinData?: any;
  technicalIndicators?: any;
}

export interface AIAnalysisResponse {
  reply: string;
  provider: string;
  model: string;
  isFallback?: boolean;
  structuredContext?: any;
}

export interface IAIProviderAdapter {
  name: string;
  generateAnalysis(req: AIAnalysisRequest): Promise<AIAnalysisResponse>;
}

// -----------------------------------------------------------------------------
// 1. Google Gemini Provider Adapter
// -----------------------------------------------------------------------------
export class GeminiProviderAdapter implements IAIProviderAdapter {
  name = "gemini";
  private apiKey: string;
  private primaryModel: string;
  private fallbackModel: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || process.env.AI_API_KEY || "";
    this.primaryModel = model || process.env.AI_MODEL || process.env.GEMINI_MODEL || "gemini-flash-latest";
    this.fallbackModel = "gemini-3.1-flash-lite";
  }

  async generateAnalysis(req: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    if (!this.apiKey) {
      throw new Error("AUTH_FAILED: No API key configured for Gemini provider.");
    }

    const ai = new GoogleGenAI({
      apiKey: this.apiKey,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" },
      },
    });

    const technicalSnippet = req.technicalIndicators
      ? `\nREAL COMPUTED TECHNICAL INDICATORS (Source: Actual 30-Day Historical Data):\n` +
        `• Asset: ${req.technicalIndicators.coinId.toUpperCase()} (${req.currencySymbol} ${req.technicalIndicators.currentPrice})\n` +
        `• RSI (14-period): ${req.technicalIndicators.rsi.value} (${req.technicalIndicators.rsi.signal})\n` +
        `• MACD: Line ${req.technicalIndicators.macd.macdLine} | Signal ${req.technicalIndicators.macd.signalLine} | Signal: ${req.technicalIndicators.macd.signal}\n` +
        `• Bollinger Bands (20, 2): Upper ${req.currencySymbol}${req.technicalIndicators.bollingerBands.upper} | Middle ${req.currencySymbol}${req.technicalIndicators.bollingerBands.middle} | Lower ${req.currencySymbol}${req.technicalIndicators.bollingerBands.lower}\n` +
        `• Moving Averages: SMA(7)=${req.currencySymbol}${req.technicalIndicators.sma.sma7} | SMA(20)=${req.currencySymbol}${req.technicalIndicators.sma.sma20} | SMA(50)=${req.currencySymbol}${req.technicalIndicators.sma.sma50}\n` +
        `• Support Floor: ${req.currencySymbol}${req.technicalIndicators.supportResistance.support} | Resistance Ceiling: ${req.currencySymbol}${req.technicalIndicators.supportResistance.resistance}\n` +
        `• Realized Volatility: ${req.technicalIndicators.volatility.annualizedPercent}% (${req.technicalIndicators.volatility.rating} Volatility)`
      : "";

    const systemInstruction = `You are KryptoPulse AI Analyst, an institutional-grade educational cryptocurrency research assistant.
You provide deep, data-driven market intelligence across the 5 benchmark assets: Bitcoin (BTC), Ethereum (ETH), Tether (USDT), BNB (BNB), and Solana (SOL).

CURRENT LIVE MARKET TELEMETRY (${req.currency} - ${req.currencySymbol}):
${req.marketSummary}
(Data timestamp: ${new Date().toUTCString()})
${technicalSnippet}

MANDATORY PROFESSIONAL GUIDELINES:
1. CURRENCY: Always quote prices and valuation metrics in the user's active currency: ${req.currency} (${req.currencySymbol}).
2. LIVE MARKET ACCURACY: When asked about current prices, 24h movements, or technical levels, use ONLY the verified data provided above. NEVER invent or hallucinate price levels or indicators.
3. STRUCTURED ANALYSIS FORMAT: For in-depth coin analyses, visually separate your report into:
   - ### 📊 LIVE MARKET DATA (${req.currency} ${req.currencySymbol})
   - ### 📈 TECHNICAL ANALYSIS (Interpret the calculated RSI, MACD, Moving Averages, and Support/Resistance)
   - ### 💡 AI INTERPRETATION & MARKET CONTEXT
   - ### ⚠️ RISKS & SCENARIOS (Key bullish catalysts vs critical downside risks)
   - ### 📝 KEY TAKEAWAYS
4. STRICT PROHIBITION ON FINANCIAL ADVICE:
   - For queries like "Should I buy?", NEVER tell a user to "BUY", "SELL", or promise guaranteed returns.
   - Use phrasing like "Based on the available market data...", "One possible interpretation is...", "Potential risks include...".
   - Conclude every analysis with:
     "\n\n*⚠️ Educational Analysis Only: This information is for educational and analytical purposes and does not constitute financial or investment advice. Cryptocurrency assets are subject to market volatility. Always conduct your own research (DYOR) and evaluate your personal risk tolerance before making financial commitments.*"`;

    const contents: any[] = [];
    if (Array.isArray(req.history) && req.history.length > 0) {
      for (const item of req.history.slice(-6)) {
        if (item && item.content) {
          contents.push({
            role: item.role === "user" ? "user" : "model",
            parts: [{ text: item.content }],
          });
        }
      }
    }

    contents.push({
      role: "user",
      parts: [
        {
          text: `Focus Asset: ${
            req.selectedCoin && req.selectedCoin !== "all"
              ? req.selectedCoin.toUpperCase()
              : "General Market"
          }\nActive Currency: ${req.currency} (${req.currencySymbol})\nUser Inquiry: ${req.message}`,
        },
      ],
    });

    // Retry with exponential backoff on primary model
    const backoffs = [1000, 2000, 4000];
    let lastError: any = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: this.primaryModel,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const text = response.text || "";
        if (text) {
          return {
            reply: text,
            provider: "gemini",
            model: this.primaryModel,
          };
        }
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || err);

        // Do not retry 401/403
        if (msg.includes("401") || msg.includes("403") || msg.includes("API key")) {
          throw new Error("AUTH_FAILED: Authentication error with Gemini API.");
        }

        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, backoffs[attempt - 1]));
        }
      }
    }

    // Try fallback model if 503 / 429 persisted
    try {
      const response = await ai.models.generateContent({
        model: this.fallbackModel,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (response.text) {
        return {
          reply: response.text,
          provider: "gemini",
          model: this.fallbackModel,
        };
      }
    } catch (fbErr) {
      lastError = fbErr;
    }

    throw lastError || new Error("Gemini generation failed after retries.");
  }
}

// -----------------------------------------------------------------------------
// 2. OpenAI / Compatible Provider Adapter (for modular multi-provider support)
// -----------------------------------------------------------------------------
export class OpenAICompatibleAdapter implements IAIProviderAdapter {
  name = "openai-compatible";
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey?: string, model?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || "";
    this.model = model || process.env.AI_MODEL || "gpt-4o-mini";
    this.baseUrl = baseUrl || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  }

  async generateAnalysis(req: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    if (!this.apiKey) {
      throw new Error("AUTH_FAILED: No OpenAI-compatible API key configured.");
    }

    const messages = [
      {
        role: "system",
        content: `You are KryptoPulse AI Analyst. Currency: ${req.currency} (${req.currencySymbol}). Live Data:\n${req.marketSummary}`,
      },
      ...(req.history || []).map((h) => ({
        role: h.role === "model" ? "assistant" : "user",
        content: h.content,
      })),
      { role: "user", content: req.message },
    ];

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI API returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "";

    return {
      reply,
      provider: "openai-compatible",
      model: this.model,
    };
  }
}

// -----------------------------------------------------------------------------
// 3. Central AI Service Manager (Factory Pattern)
// -----------------------------------------------------------------------------
export class AIService {
  private adapter: IAIProviderAdapter;

  constructor() {
    const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();

    if (provider === "openai" || provider === "openai-compatible") {
      this.adapter = new OpenAICompatibleAdapter();
    } else {
      this.adapter = new GeminiProviderAdapter();
    }
  }

  getProviderName(): string {
    return this.adapter.name;
  }

  async analyze(req: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    return this.adapter.generateAnalysis(req);
  }
}

export const aiService = new AIService();
