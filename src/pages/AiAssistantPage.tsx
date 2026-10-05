import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  User,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Clock,
  Layers,
  Info,
  TrendingUp,
  BarChart2,
  Shield,
  Zap,
} from "lucide-react";
import { CryptoCoin, ChatMessage, FiatCurrencyCode } from "../types/crypto";
import { sendChatMessage } from "../services/api";
import { SUPPORTED_CURRENCIES } from "../utils/currencies";

interface ExtendedChatMessage extends ChatMessage {
  isError?: boolean;
  retryable?: boolean;
  failedPrompt?: string;
  isFallback?: boolean;
  notice?: string;
  provider?: string;
  model?: string;
}

interface AiAssistantPageProps {
  coins: CryptoCoin[];
  currency: FiatCurrencyCode;
  onNavigate: (path: string) => void;
}

export const AiAssistantPage: React.FC<AiAssistantPageProps> = ({
  coins,
  currency,
  onNavigate,
}) => {
  const [selectedCoin, setSelectedCoin] = useState<string>("all");
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currencyConfig = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;

  // Initial welcome message
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([
    {
      id: "welcome-1",
      role: "model",
      content:
        `### 👋 Welcome to KryptoPulse AI Financial Research Terminal\n\n` +
        `I am your institutional cryptocurrency research analyst, grounded in **live market data and genuine calculated technical indicators** (RSI, MACD, Moving Averages, Bollinger Bands, Support/Resistance) denominated in **${currencyConfig.name} (${currencyConfig.code} ${currencyConfig.symbol})**.\n\n` +
        `**Terminal Research Capabilities:**\n` +
        `• **Deep Asset Analysis:** Live price trends, volatility metrics, and support floors\n` +
        `• **Cross-Coin Benchmarking:** Compare Bitcoin, Ethereum, Tether, BNB, and Solana\n` +
        `• **Mathematical Indicators:** Genuine 30-day SMA, EMA, RSI(14), and MACD calculations\n` +
        `• **Macro & Risk Evaluation:** Balanced perspective with strict educational guardrails\n\n` +
        `*Select a quick action below or type any research inquiry to begin.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Quick Action Buttons requested in Section 8
  const quickActions = [
    { label: "Analyze Bitcoin", prompt: `Analyze Bitcoin current price, technical indicators, and support/resistance in ${currencyConfig.code}.`, icon: TrendingUp },
    { label: "Analyze Ethereum", prompt: `Analyze Ethereum current price, technical indicators, and momentum in ${currencyConfig.code}.`, icon: TrendingUp },
    { label: "Compare BTC vs ETH", prompt: `Compare Bitcoin and Ethereum current prices, market cap, and relative performance in ${currencyConfig.code}.`, icon: Layers },
    { label: "Market Overview", prompt: `Provide an executive market overview of the 5 major cryptocurrencies with dominance and volume in ${currencyConfig.code}.`, icon: BarChart2 },
    { label: "Top Gainers", prompt: `Which cryptocurrency has increased the most today among the top assets in ${currencyConfig.code}?`, icon: Zap },
    { label: "Top Losers", prompt: `Which cryptocurrency has retraced the most today and what are the key support levels?`, icon: AlertTriangle },
    { label: "Explain Today's Market", prompt: `Explain today's cryptocurrency market sentiment, macro drivers, and volatility trends in ${currencyConfig.code}.`, icon: Sparkles },
    { label: "Technical Analysis", prompt: `Provide a technical analysis report for Solana (SOL) including calculated RSI, MACD, and Bollinger Bands in ${currencyConfig.code}.`, icon: BarChart2 },
    { label: "Risk Analysis", prompt: `What are the critical macroeconomic, regulatory, and market risks to consider when analyzing cryptocurrency investments in ${currencyConfig.code}?`, icon: Shield },
  ];

  const handleSend = async (messageToSend?: string) => {
    const query = (messageToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsg: ExtendedChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => !m.isError)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await sendChatMessage(query, historyPayload, selectedCoin, currency);

      if (res && res.success && res.reply) {
        const aiMsg: ExtendedChatMessage = {
          id: `ai-${Date.now()}`,
          role: "model",
          content: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isFallback: res.isFallback,
          notice: res.notice,
          provider: res.provider,
          model: res.model,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const errorText =
          res?.error || "The AI assistant is temporarily unavailable. Please try again.";

        const errorMsg: ExtendedChatMessage = {
          id: `error-${Date.now()}`,
          role: "model",
          content: errorText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
          retryable: res?.retryable ?? true,
          failedPrompt: query,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: ExtendedChatMessage = {
        id: `error-${Date.now()}`,
        role: "model",
        content: "Unable to reach the AI service. Please check your connection and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isError: true,
        retryable: true,
        failedPrompt: query,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "model",
        content:
          `Conversation context cleared. How may I assist your cryptocurrency research today in **${currencyConfig.code} (${currencyConfig.symbol})**?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="relative min-h-screen bg-[#070913] text-slate-100 pb-16 cyber-grid">
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <button
            onClick={() => onNavigate("/dashboard")}
            className="flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard Hub</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-400 hover:text-white transition-colors"
              title="Clear conversation history"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear Chat</span>
            </button>
          </div>
        </div>

        {/* Live Context Telemetry Ribbon */}
        <div className="mt-4 rounded-xl border border-violet-500/20 bg-slate-950/80 p-3 backdrop-blur-md">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs">
            <div className="flex items-center gap-2 text-violet-300">
              <Sparkles className="h-4 w-4 text-violet-400 shrink-0" />
              <span>
                <strong>Terminal Engine Active:</strong> Multi-Currency Grounding ({currencyConfig.code} {currencyConfig.symbol}) & Mathematical Technical Indicators.
              </span>
            </div>

            {/* Asset Focus Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">Focus Asset:</span>
              <select
                value={selectedCoin}
                onChange={(e) => setSelectedCoin(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Cryptocurrencies</option>
                <option value="bitcoin">Bitcoin (BTC)</option>
                <option value="ethereum">Ethereum (ETH)</option>
                <option value="tether">Tether (USDT)</option>
                <option value="binancecoin">BNB (BNB)</option>
                <option value="solana">Solana (SOL)</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Quick Actions Bar (Section 8) */}
        <div className="mt-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Research Quick Actions</span>
            <span className="text-cyan-400 font-mono-numbers">Base: {currencyConfig.code}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickActions.map((qa, idx) => {
              const Icon = qa.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(qa.prompt)}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-xl border border-cyan-500/20 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/40 transition-all disabled:opacity-50"
                >
                  <Icon className="h-3 w-3 text-cyan-400" />
                  <span>{qa.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Messages Container */}
        <div className="mt-4 flex flex-col rounded-3xl border border-slate-800/90 bg-gradient-to-b from-[#0c1024]/90 to-[#070914]/95 backdrop-blur-2xl shadow-2xl overflow-hidden min-h-[520px]">
          {/* Messages Scroll Area */}
          <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 max-h-[580px]">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const isError = msg.isError;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 sm:gap-4 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl p-[1px] shadow-md ${
                        isError
                          ? "bg-gradient-to-tr from-amber-500 to-rose-600"
                          : "bg-gradient-to-tr from-cyan-500 to-violet-600"
                      }`}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#090d1f]">
                        {isError ? (
                          <AlertTriangle className="h-4 w-4 text-amber-400" />
                        ) : (
                          <Bot className="h-4 w-4 text-cyan-400" />
                        )}
                      </div>
                    </div>
                  )}

                  <div
                    className={`relative max-w-2xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/10"
                        : isError
                        ? "border border-amber-500/40 bg-amber-950/20 text-amber-200/95 shadow-xl"
                        : "border border-slate-800/90 bg-slate-900/80 text-slate-200 shadow-xl"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400 border-b border-white/10 pb-1.5">
                      <span className="font-bold text-slate-300">
                        {isUser ? "You" : isError ? "Service Notice" : "KryptoPulse AI Analyst"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{msg.timestamp}</span>
                        {!isUser && !isError && (
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            title="Copy response"
                            className="text-slate-400 hover:text-white transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {msg.isFallback && (
                      <div className="mb-3 rounded-lg bg-cyan-950/60 p-2.5 border border-cyan-500/30 text-xs text-cyan-200 flex items-center gap-2">
                        <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span>Live market data provided directly from verified cryptocurrency feed.</span>
                      </div>
                    )}

                    <div className="prose prose-invert max-w-none text-xs sm:text-sm space-y-2 whitespace-pre-wrap font-sans">
                      {msg.content}
                    </div>

                    {isError && msg.retryable && msg.failedPrompt && (
                      <div className="mt-4 pt-3 border-t border-amber-500/30 flex items-center justify-between">
                        <span className="text-[11px] text-amber-300/80">
                          Temporary issue encountered.
                        </span>
                        <button
                          onClick={() => handleSend(msg.failedPrompt)}
                          disabled={loading}
                          className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Try Again</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 p-[1px]">
                  <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#090d1f]">
                    <Bot className="h-4 w-4 text-cyan-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-2xl border border-cyan-500/30 bg-slate-900/90 px-4 py-3 text-xs text-cyan-300 shadow-lg shadow-cyan-500/10">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" />
                  <span
                    className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <span
                    className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                  <span className="ml-1.5 font-semibold text-white tracking-wide">
                    Thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="border-t border-slate-800/90 bg-[#090d1f] p-4 sm:p-5">
            <div className="relative flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                placeholder={
                  loading
                    ? "Thinking..."
                    : `Ask about ${currencyConfig.code} spot prices, technical indicators, tokenomics, or comparison...`
                }
                rows={2}
                className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950/90 p-3 pr-12 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none disabled:opacity-60"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputMessage.trim() || loading}
                className="absolute right-2.5 bottom-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 text-white shadow-md shadow-cyan-500/20 disabled:opacity-40 hover:scale-105 active:scale-95 transition-all"
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 text-amber-400" />
                <span>Educational analysis only • Not financial advice</span>
              </span>
              <span>Press Enter to send (Shift+Enter for newline)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
