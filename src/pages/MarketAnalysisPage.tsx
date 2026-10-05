import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { CryptoCoin, FiatCurrencyCode, SyncStatus } from "../types/crypto";
import { formatCurrency, formatLargeCurrency, formatPercent, formatSupply } from "../utils/formatters";
import { SUPPORTED_CURRENCIES } from "../utils/currencies";
import { SyncStatusBadge } from "../components/SyncStatusBadge";

interface MarketAnalysisPageProps {
  coins: CryptoCoin[];
  currency: FiatCurrencyCode;
  loading: boolean;
  lastUpdated: string;
  syncStatus?: SyncStatus;
  onRefresh: () => void;
  onNavigate: (path: string) => void;
}

export const MarketAnalysisPage: React.FC<MarketAnalysisPageProps> = ({
  coins,
  currency,
  loading,
  lastUpdated,
  syncStatus = "LIVE",
  onRefresh,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"rank" | "price" | "change" | "market_cap" | "volume">("rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const currencyConfig = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;

  const filteredCoins = coins.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCoins = [...filteredCoins].sort((a, b) => {
    let diff = 0;
    if (sortBy === "rank") diff = a.market_cap_rank - b.market_cap_rank;
    else if (sortBy === "price") diff = a.current_price - b.current_price;
    else if (sortBy === "change") diff = a.price_change_percentage_24h - b.price_change_percentage_24h;
    else if (sortBy === "market_cap") diff = a.market_cap - b.market_cap;
    else if (sortBy === "volume") diff = a.total_volume - b.total_volume;

    return sortOrder === "asc" ? diff : -diff;
  });

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder(field === "rank" ? "asc" : "desc");
    }
  };

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
            <div className="flex flex-wrap items-center gap-2.5">
              <SyncStatusBadge status={syncStatus} lastUpdated={lastUpdated} />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                • {currencyConfig.code} ({currencyConfig.symbol})
              </span>
            </div>
            <h1 className="font-heading mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              Live Cryptocurrency Market Analysis
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Real-time {currencyConfig.name} price movements, liquidity depth, valuation tiers, and circulating supply.
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 self-start rounded-xl border border-cyan-500/30 bg-cyan-950/70 px-4 py-2.5 text-xs font-bold text-cyan-300 shadow-md hover:bg-cyan-500/20 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-cyan-300" : ""}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -mt-2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search coin by name or symbol (e.g., BTC, Solana)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Sort by:</span>
            <button
              onClick={() => handleSort("rank")}
              className={`rounded-lg px-2.5 py-1 font-semibold ${
                sortBy === "rank" ? "bg-cyan-500 text-slate-950" : "bg-slate-900 border border-slate-800"
              }`}
            >
              Rank
            </button>
            <button
              onClick={() => handleSort("price")}
              className={`rounded-lg px-2.5 py-1 font-semibold ${
                sortBy === "price" ? "bg-cyan-500 text-slate-950" : "bg-slate-900 border border-slate-800"
              }`}
            >
              Price
            </button>
            <button
              onClick={() => handleSort("change")}
              className={`rounded-lg px-2.5 py-1 font-semibold ${
                sortBy === "change" ? "bg-cyan-500 text-slate-950" : "bg-slate-900 border border-slate-800"
              }`}
            >
              24h %
            </button>
            <button
              onClick={() => handleSort("market_cap")}
              className={`rounded-lg px-2.5 py-1 font-semibold ${
                sortBy === "market_cap" ? "bg-cyan-500 text-slate-950" : "bg-slate-900 border border-slate-800"
              }`}
            >
              Market Cap
            </button>
          </div>
        </div>

        {/* Live Market Analysis Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-b from-[#0d1228]/90 to-[#070914]/95 backdrop-blur-xl shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-4 px-4 sm:px-6">Asset / Rank</th>
                  <th className="py-4 px-4 text-right">Price ({currencyConfig.code})</th>
                  <th className="py-4 px-4 text-right">24h Change</th>
                  <th className="py-4 px-4 text-right">24h High / Low</th>
                  <th className="py-4 px-4 text-right">Market Cap</th>
                  <th className="py-4 px-4 text-right">24h Volume</th>
                  <th className="py-4 px-4 text-right">Circulating Supply</th>
                  <th className="py-4 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
                {sortedCoins.map((coin) => {
                  const isPositive = coin.price_change_percentage_24h >= 0;
                  return (
                    <tr
                      key={coin.id}
                      className="group transition-colors hover:bg-cyan-950/20"
                    >
                      {/* Asset & Rank */}
                      <td className="py-4 px-4 sm:px-6 font-sans">
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-400 font-mono-numbers">
                            #{coin.market_cap_rank}
                          </span>
                          <img src={coin.image} alt={coin.name} className="h-7 w-7 rounded-full object-contain" />
                          <div>
                            <span className="font-heading font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {coin.name}
                            </span>
                            <span className="ml-1.5 text-[11px] font-bold uppercase text-slate-400">
                              {coin.symbol}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Current Price */}
                      <td className="py-4 px-4 text-right font-bold text-white text-sm">
                        {formatCurrency(coin.current_price, currency)}
                      </td>

                      {/* 24h Change with indicator */}
                      <td className="py-4 px-4 text-right">
                        <div
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                            isPositive
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          <span>{formatPercent(coin.price_change_percentage_24h)}</span>
                        </div>
                        <div
                          className={`text-[10px] mt-0.5 ${isPositive ? "text-emerald-500" : "text-rose-500"}`}
                        >
                          {isPositive ? "+" : ""}
                          {formatCurrency(coin.price_change_24h, currency)}
                        </div>
                      </td>

                      {/* 24h High / Low */}
                      <td className="py-4 px-4 text-right text-slate-300">
                        <div className="text-xs text-white">H: {formatCurrency(coin.high_24h, currency)}</div>
                        <div className="text-[11px] text-slate-400">L: {formatCurrency(coin.low_24h, currency)}</div>
                      </td>

                      {/* Market Cap */}
                      <td className="py-4 px-4 text-right font-semibold text-slate-200">
                        {formatLargeCurrency(coin.market_cap, currency)}
                      </td>

                      {/* 24h Volume */}
                      <td className="py-4 px-4 text-right font-semibold text-cyan-300">
                        {formatLargeCurrency(coin.total_volume, currency)}
                      </td>

                      {/* Circulating Supply */}
                      <td className="py-4 px-4 text-right text-slate-300">
                        {formatSupply(coin.circulating_supply, coin.symbol)}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-center font-sans">
                        <button
                          onClick={() => onNavigate(`/charts?coin=${coin.id}`)}
                          className="rounded-lg bg-cyan-950/80 px-2.5 py-1 text-xs font-semibold text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all"
                        >
                          Chart
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
