import React from "react";
import {
  Activity,
  History,
  TrendingUp,
  BarChart3,
  GitCompare,
  Zap,
  Bot,
  PieChart,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";
import { CryptoCoin, FiatCurrencyCode, SyncStatus } from "../types/crypto";
import { PriceCard } from "../components/PriceCard";
import { formatCurrency, formatLargeCurrency, formatPercent } from "../utils/formatters";
import { SUPPORTED_CURRENCIES } from "../utils/currencies";
import { SyncStatusBadge } from "../components/SyncStatusBadge";

interface DashboardPageProps {
  coins: CryptoCoin[];
  currency: FiatCurrencyCode;
  lastUpdated: string;
  loading: boolean;
  syncStatus?: SyncStatus;
  onRefresh: () => void;
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  coins,
  currency,
  lastUpdated,
  loading,
  syncStatus = "LIVE",
  onRefresh,
  onNavigate,
}) => {
  const currencyConfig = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;

  const featureCards = [
    {
      id: "market-overview",
      title: "Market Overview",
      path: "/overview",
      desc: "Macro view of aggregate cryptocurrency valuation, dominant market shares, liquidity depth, and sentiment.",
      icon: PieChart,
      color: "indigo",
      badge: "Macro Analytics",
      gradient: "from-indigo-500/20 to-cyan-500/10",
      borderColor: "border-indigo-500/30",
    },
    {
      id: "analysis",
      title: "Live Market Analysis",
      path: "/analysis",
      desc: `Live ${currencyConfig.code} telemetry: 24h volume, price delta, market cap, circulating supply, and high/lows.`,
      icon: TrendingUp,
      color: "emerald",
      badge: "Real-time Telemetry",
      gradient: "from-emerald-500/20 to-teal-500/10",
      borderColor: "border-emerald-500/30",
    },
    {
      id: "charts",
      title: "Graphical Analysis",
      path: "/charts",
      desc: "Interactive Recharts multi-timeframe curves (24H, 7D, 30D, 1Y) with tooltips, volumes, and crosshairs.",
      icon: BarChart3,
      color: "blue",
      badge: "Technical Charts",
      gradient: "from-blue-500/20 to-indigo-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      id: "comparison",
      title: "Cryptocurrency Comparison",
      path: "/comparison",
      desc: "Benchmark matrix comparing consensus models, throughput (TPS), average network fees, and market cap rank.",
      icon: GitCompare,
      color: "amber",
      badge: "Benchmark Matrix",
      gradient: "from-amber-500/20 to-orange-500/10",
      borderColor: "border-amber-500/30",
    },
    {
      id: "live-prices",
      title: "Live Price Chart",
      path: "/live-prices",
      desc: "High-frequency price monitor with automated polling, pulse flashes on change, and instant asset depth.",
      icon: Zap,
      color: "teal",
      badge: "Fast Ticker",
      gradient: "from-teal-500/20 to-cyan-500/10",
      borderColor: "border-teal-500/30",
    },
    {
      id: "intro",
      title: "Cryptocurrency Introduction",
      path: "/introduction",
      desc: "Master core blockchain principles, transaction lifecycles, wallets, consensus mechanisms, and key risks.",
      icon: Activity,
      color: "cyan",
      badge: "Fundamentals",
      gradient: "from-cyan-500/20 to-blue-500/10",
      borderColor: "border-cyan-500/30",
    },
    {
      id: "history",
      title: "Cryptocurrency History",
      path: "/history",
      desc: "Chronological evolution, founders, whitepapers, and major milestone timelines of BTC, ETH, USDT, BNB, and SOL.",
      icon: History,
      color: "violet",
      badge: "Deep Archive",
      gradient: "from-violet-500/20 to-purple-500/10",
      borderColor: "border-violet-500/30",
    },
    {
      id: "ai-assistant",
      title: "AI Crypto Analyst",
      path: "/ai-assistant",
      desc: "Provider-independent AI research assistant with live market context, calculated technical indicators, and educational insights.",
      icon: Bot,
      color: "violet",
      badge: "AI Analyst",
      gradient: "from-fuchsia-500/20 to-violet-500/10",
      borderColor: "border-fuchsia-500/30",
      highlight: true,
    },
  ];

  // Aggregate stats across the 5 coins
  const totalMarketCap = coins.reduce((acc, c) => acc + (c.market_cap || 0), 0);
  const totalVolume = coins.reduce((acc, c) => acc + (c.total_volume || 0), 0);
  const btcCoin = coins.find((c) => c.symbol === "btc");
  const btcDominance =
    totalMarketCap > 0 && btcCoin ? ((btcCoin.market_cap / totalMarketCap) * 100).toFixed(1) : "54.2";

  // Top gainer
  const topGainer = coins.length > 0
    ? [...coins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)[0]
    : null;

  return (
    <div className="relative min-h-screen bg-[#070913] text-slate-100 pb-20 cyber-grid">
      {/* Background neon glows */}
      <div className="pointer-events-none absolute top-0 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-[130px]" />

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* Header Status Bar */}
        <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <SyncStatusBadge status={syncStatus} lastUpdated={lastUpdated} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                • Base: {currencyConfig.code} ({currencyConfig.symbol})
              </span>
            </div>
            <h1 className="font-heading mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Central Intelligence Dashboard
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Interactive crypto education, multi-currency telemetry, graphical charts, and AI assistance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-300">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>
                Updated:{" "}
                <strong className="text-white font-mono-numbers">
                  {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "Syncing..."}
                </strong>
              </span>
            </div>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/60 px-4 py-2 text-xs font-bold text-cyan-300 shadow-sm transition-all hover:bg-cyan-500/20 hover:border-cyan-400"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-cyan-300" : ""}`} />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>

        {/* Macro Stat Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#0e1329]/80 to-[#080b18]/90 p-4 backdrop-blur-xl">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">Tracked Market Cap</span>
            <div className="mt-1 font-mono-numbers text-lg font-extrabold text-white sm:text-xl">
              {formatLargeCurrency(totalMarketCap, currency)}
            </div>
            <span className="text-[10px] text-slate-400">5 Major Cryptos ({currencyConfig.code})</span>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#0e1329]/80 to-[#080b18]/90 p-4 backdrop-blur-xl">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">24h Combined Volume</span>
            <div className="mt-1 font-mono-numbers text-lg font-extrabold text-cyan-300 sm:text-xl">
              {formatLargeCurrency(totalVolume, currency)}
            </div>
            <span className="text-[10px] text-slate-400">Total liquidity depth</span>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#0e1329]/80 to-[#080b18]/90 p-4 backdrop-blur-xl">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">BTC Dominance</span>
            <div className="mt-1 font-mono-numbers text-lg font-extrabold text-amber-400 sm:text-xl">
              {btcDominance}%
            </div>
            <span className="text-[10px] text-slate-400">Market share anchor</span>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#0e1329]/80 to-[#080b18]/90 p-4 backdrop-blur-xl">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">Top 24h Performer</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-heading font-bold text-white text-base">
                {topGainer?.name || "Bitcoin"}
              </span>
              <span
                className={`font-mono-numbers text-xs font-bold ${
                  (topGainer?.price_change_percentage_24h || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {formatPercent(topGainer?.price_change_percentage_24h)}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Relative performance</span>
          </div>
        </div>

        {/* 8 Feature Navigation Cards Hub */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Interactive Hub</span>
              <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
                Explore Analytics & Features
              </h2>
            </div>
            <span className="hidden text-xs text-slate-400 sm:inline">
              Click any card to open in a separate browser tab
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border ${card.borderColor} bg-gradient-to-b ${card.gradient} to-[#070914]/95 p-5 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1.5`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900/90 border border-slate-700/60 shadow-inner group-hover:scale-110 transition-transform">
                        <Icon className="h-5 w-5 text-cyan-400" />
                      </div>
                      <span className="rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300 border border-slate-800">
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="font-heading mt-4 text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400 line-clamp-3">
                      {card.desc}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <a
                      href={card.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-cyan-950/80 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all"
                      title="Open in new browser tab"
                    >
                      <span>New Tab</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <button
                      onClick={() => onNavigate(card.path)}
                      className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                    >
                      <span>Open Here</span>
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Cryptocurrency Cards (5 Major Coins) */}
        <div className="mt-14">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Live Asset Pricing</span>
              <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
                The 5 Benchmark Cryptocurrencies ({currencyConfig.code} {currencyConfig.symbol})
              </h2>
            </div>
            <a
              href="/analysis"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("/analysis");
              }}
              className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              <span>View Full Market Table</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {coins.map((coin) => (
              <PriceCard
                key={coin.id}
                coin={coin}
                currency={currency}
                onSelectCoin={() => onNavigate(`/analysis`)}
                onOpenChart={(id) => onNavigate(`/charts?coin=${id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
