import React, { useState, useEffect } from "react";
import {
  Zap,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Info,
  Radio,
} from "lucide-react";
import { CryptoCoin, FiatCurrencyCode } from "../types/crypto";
import { CryptoChart } from "../components/CryptoChart";
import { formatCurrency, formatPercent } from "../utils/formatters";
import { SUPPORTED_CURRENCIES } from "../utils/currencies";

interface LivePricesPageProps {
  coins: CryptoCoin[];
  currency: FiatCurrencyCode;
  loading: boolean;
  lastUpdated: string;
  onRefresh: () => void;
  onNavigate: (path: string) => void;
}

export const LivePricesPage: React.FC<LivePricesPageProps> = ({
  coins,
  currency,
  loading,
  lastUpdated,
  onRefresh,
  onNavigate,
}) => {
  const [selectedCoinId, setSelectedCoinId] = useState<string>("bitcoin");
  const [pollInterval, setPollInterval] = useState<number>(30);
  const [countdown, setCountdown] = useState<number>(30);

  const currencyConfig = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;

  useEffect(() => {
    setCountdown(pollInterval);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onRefresh();
          return pollInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pollInterval, onRefresh]);

  const selectedCoin = coins.find((c) => c.id === selectedCoinId) || coins[0];
  const isPositive = (selectedCoin?.price_change_percentage_24h || 0) >= 0;

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
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>Data Polling: Every {pollInterval}s ({currencyConfig.code})</span>
          </div>
        </div>

        {/* Transparent Update Frequency Banner */}
        <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 backdrop-blur-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs">
            <div className="flex items-start gap-2.5 text-cyan-200">
              <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Live Telemetry Feed:</strong> Market rates are polled via our
                server-cached public cryptocurrency API feed every {pollInterval}s. Next refresh in:{" "}
                <span className="font-mono-numbers font-bold text-cyan-300">{countdown}s</span>.
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-slate-400">Interval:</span>
              <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
                {[15, 30, 60].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setPollInterval(sec)}
                    className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                      pollInterval === sec
                        ? "bg-cyan-500 text-slate-950"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>

              <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-950 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                <span>Sync Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Selected Coin Live Price Display */}
        {selectedCoin && (
          <div className="mt-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#0e1530]/90 to-[#070914]/95 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedCoin.image}
                  alt={selectedCoin.name}
                  className="h-14 w-14 rounded-2xl object-contain bg-slate-900 p-2 border border-slate-700/80"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-2xl font-black text-white sm:text-3xl">
                      {selectedCoin.name}
                    </h2>
                    <span className="rounded-lg bg-cyan-500/20 px-2 py-0.5 text-xs font-bold uppercase text-cyan-300 border border-cyan-500/30">
                      {selectedCoin.symbol}
                    </span>
                    <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-400">
                      Rank #{selectedCoin.market_cap_rank}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Live {currencyConfig.name} ({currencyConfig.code}) Valuation • Synced:{" "}
                    {new Date(selectedCoin.last_updated).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Spot Price */}
              <div className="text-left md:text-right">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Spot Price ({currencyConfig.code})
                </div>
                <div className="mt-1 flex items-baseline gap-3 md:justify-end">
                  <span className="font-mono-numbers text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                    {formatCurrency(selectedCoin.current_price, currency)}
                  </span>
                  <div
                    className={`flex items-center gap-1 rounded-xl px-3 py-1 text-sm font-bold ${
                      isPositive
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span>{formatPercent(selectedCoin.price_change_percentage_24h)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Coin Selector Ribbon */}
            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-6">
              {coins.map((c) => {
                const isSelected = c.id === selectedCoinId;
                const coinPositive = c.price_change_percentage_24h >= 0;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCoinId(c.id)}
                    className={`flex items-center gap-2.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400 shadow-lg shadow-cyan-500/20 scale-105"
                        : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    <img src={c.image} alt={c.name} className="h-4 w-4 rounded-full object-contain" />
                    <span>{c.name}</span>
                    <span className="font-mono-numbers text-[11px] text-white">
                      {formatCurrency(c.current_price, currency)}
                    </span>
                    <span className={`text-[10px] ${coinPositive ? "text-emerald-400" : "text-rose-400"}`}>
                      {formatPercent(c.price_change_percentage_24h)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Embedded Interactive Chart */}
        <div className="mt-8">
          <CryptoChart
            coins={coins}
            currency={currency}
            initialCoinId={selectedCoinId}
            onCoinChange={(id) => setSelectedCoinId(id)}
          />
        </div>
      </div>
    </div>
  );
};
