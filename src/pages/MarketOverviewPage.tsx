import React, { useState, useEffect } from "react";
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowLeft,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  RefreshCw,
  BarChart2,
  Clock,
  Sparkles,
} from "lucide-react";
import { CryptoCoin, FiatCurrencyCode } from "../types/crypto";
import { formatCurrency, formatLargeCurrency, formatPercent } from "../utils/formatters";
import { SUPPORTED_CURRENCIES } from "../utils/currencies";
import { PriceCard } from "../components/PriceCard";

interface MarketOverviewPageProps {
  coins: CryptoCoin[];
  currency: FiatCurrencyCode;
  lastUpdated: string;
  loading: boolean;
  onRefresh: () => void;
  onNavigate: (path: string) => void;
}

export const MarketOverviewPage: React.FC<MarketOverviewPageProps> = ({
  coins,
  currency,
  lastUpdated,
  loading,
  onRefresh,
  onNavigate,
}) => {
  const currencyConfig = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;

  const totalMarketCap = coins.reduce((acc, c) => acc + (c.market_cap || 0), 0);
  const totalVolume24h = coins.reduce((acc, c) => acc + (c.total_volume || 0), 0);
  const btcCoin = coins.find((c) => c.symbol === "btc");
  const btcDominance =
    totalMarketCap > 0 && btcCoin ? ((btcCoin.market_cap / totalMarketCap) * 100).toFixed(1) : "54.2";

  const sortedByChange = [...coins].sort(
    (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
  );
  const topGainer = sortedByChange[0];
  const topLoser = sortedByChange[sortedByChange.length - 1];

  return (
    <div className="relative min-h-screen bg-[#070913] text-slate-100 pb-20 cyber-grid">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <button
            onClick={() => onNavigate("/dashboard")}
            className="flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard Hub</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <span>Synced: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "Syncing..."}</span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/60 px-3.5 py-1 text-xs font-semibold text-indigo-300">
              <PieChart className="h-3.5 w-3.5 text-indigo-400" />
              <span>Global Macro Telemetry ({currencyConfig.code})</span>
            </div>
            <h1 className="font-heading mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              Cryptocurrency Market Overview
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Aggregate global capitalization, trading liquidity, Bitcoin dominance, and market sentiment.
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 self-start rounded-xl border border-cyan-500/30 bg-cyan-950/70 px-4 py-2 text-xs font-bold text-cyan-300 shadow-md hover:bg-cyan-500/20 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-cyan-300" : ""}`} />
            <span>Sync Market Telemetry</span>
          </button>
        </div>

        {/* Top 4 Macro Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#0e1329]/80 to-[#080b18]/90 p-5 backdrop-blur-xl">
            <span className="text-xs uppercase tracking-wider text-slate-400">Total Market Cap</span>
            <div className="mt-2 font-mono-numbers text-xl font-black text-white sm:text-2xl">
              {formatLargeCurrency(totalMarketCap, currency)}
            </div>
            <span className="text-[11px] text-slate-400">Across 5 major assets</span>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#0e1329]/80 to-[#080b18]/90 p-5 backdrop-blur-xl">
            <span className="text-xs uppercase tracking-wider text-slate-400">24h Market Volume</span>
            <div className="mt-2 font-mono-numbers text-xl font-black text-cyan-300 sm:text-2xl">
              {formatLargeCurrency(totalVolume24h, currency)}
            </div>
            <span className="text-[11px] text-slate-400">Combined global turnover</span>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#0e1329]/80 to-[#080b18]/90 p-5 backdrop-blur-xl">
            <span className="text-xs uppercase tracking-wider text-slate-400">BTC Dominance</span>
            <div className="mt-2 font-mono-numbers text-xl font-black text-amber-400 sm:text-2xl">
              {btcDominance}%
            </div>
            <span className="text-[11px] text-slate-400">Primary market anchor</span>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#0e1329]/80 to-[#080b18]/90 p-5 backdrop-blur-xl">
            <span className="text-xs uppercase tracking-wider text-slate-400">Market Sentiment</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-heading text-lg font-bold text-emerald-300">Greed (62/100)</span>
            </div>
            <span className="text-[11px] text-slate-400">Bullish momentum bias</span>
          </div>
        </div>

        {/* Top Performer & Underperformer Highlights */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Top Gainer */}
          {topGainer && (
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-slate-900/80 to-slate-900/80 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
                  Top 24h Gainer
                </span>
                <span className="font-mono-numbers text-sm font-bold text-emerald-400">
                  {formatPercent(topGainer.price_change_percentage_24h)}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <img src={topGainer.image} alt={topGainer.name} className="h-10 w-10 rounded-full" />
                <div>
                  <h3 className="font-heading font-bold text-white text-lg">{topGainer.name}</h3>
                  <div className="font-mono-numbers text-sm font-semibold text-slate-300">
                    {formatCurrency(topGainer.current_price, currency)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Loser */}
          {topLoser && (
            <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/20 via-slate-900/80 to-slate-900/80 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-300 border border-rose-500/30">
                  24h Retracement
                </span>
                <span className="font-mono-numbers text-sm font-bold text-rose-400">
                  {formatPercent(topLoser.price_change_percentage_24h)}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <img src={topLoser.image} alt={topLoser.name} className="h-10 w-10 rounded-full" />
                <div>
                  <h3 className="font-heading font-bold text-white text-lg">{topLoser.name}</h3>
                  <div className="font-mono-numbers text-sm font-semibold text-slate-300">
                    {formatCurrency(topLoser.current_price, currency)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5 Tracked Assets Grid */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Cohort Telemetry</span>
              <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
                The 5 Benchmark Assets ({currencyConfig.code})
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {coins.map((coin) => (
              <PriceCard
                key={coin.id}
                coin={coin}
                currency={currency}
                onSelectCoin={() => onNavigate("/analysis")}
                onOpenChart={(id) => onNavigate(`/charts?coin=${id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
