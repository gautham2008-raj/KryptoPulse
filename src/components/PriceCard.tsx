import React from "react";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { CryptoCoin, FiatCurrencyCode } from "../types/crypto";
import { formatCurrency, formatPercent, formatLargeCurrency } from "../utils/formatters";

interface PriceCardProps {
  coin: CryptoCoin;
  currency?: FiatCurrencyCode;
  onSelectCoin?: (coinId: string) => void;
  onOpenChart?: (coinId: string) => void;
}

export const PriceCard: React.FC<PriceCardProps> = ({
  coin,
  currency = "INR",
  onSelectCoin,
  onOpenChart,
}) => {
  const isPositive = coin.price_change_percentage_24h >= 0;

  // Calculate 24h range position percentage
  const rangeSpan = coin.high_24h - coin.low_24h;
  const currentPos = rangeSpan > 0 ? ((coin.current_price - coin.low_24h) / rangeSpan) * 100 : 50;
  const clampedPos = Math.max(5, Math.min(95, currentPos));

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#0e1329]/80 to-[#080b19]/90 p-5 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1">
      {/* Top glowing line */}
      <div
        className={`absolute inset-x-0 top-0 h-[2px] transition-opacity duration-300 ${
          isPositive ? "bg-emerald-500/80" : "bg-rose-500/80"
        } opacity-70 group-hover:opacity-100`}
      />

      {/* Header: Coin Info + Rank */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900/90 p-1.5 border border-slate-700/60 shadow-inner">
            <img
              src={coin.image}
              alt={coin.name}
              className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://assets.coingecko.com/coins/images/1/large/bitcoin.png";
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-white text-base tracking-tight">{coin.name}</h3>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-300">
                {coin.symbol}
              </span>
            </div>
            <span className="text-xs text-slate-400">Market Rank #{coin.market_cap_rank}</span>
          </div>
        </div>

        {/* 24h Change Pill */}
        <div
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
            isPositive
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
          }`}
        >
          {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          <span>{formatPercent(coin.price_change_percentage_24h)}</span>
        </div>
      </div>

      {/* Main Price Block */}
      <div className="mt-4">
        <div className="text-xs uppercase tracking-wider text-slate-400">
          Spot Price ({currency})
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-mono-numbers text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {formatCurrency(coin.current_price, currency)}
          </span>
          <span
            className={`text-xs font-medium font-mono-numbers ${
              isPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isPositive ? "+" : ""}
            {formatCurrency(coin.price_change_24h, currency)} (24h)
          </span>
        </div>
      </div>

      {/* 24h Range Slider Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>24h Low: {formatCurrency(coin.low_24h, currency)}</span>
          <span>24h High: {formatCurrency(coin.high_24h, currency)}</span>
        </div>
        <div className="relative mt-1.5 h-1.5 w-full rounded-full bg-slate-800">
          <div
            className={`absolute top-0 bottom-0 left-0 rounded-full ${
              isPositive ? "bg-gradient-to-r from-emerald-500 to-cyan-400" : "bg-gradient-to-r from-rose-500 to-amber-500"
            }`}
            style={{ width: `${clampedPos}%` }}
          />
          <div
            className="absolute top-1/2 -mt-1.5 h-3 w-3 rounded-full bg-white shadow-md border-2 border-slate-900"
            style={{ left: `calc(${clampedPos}% - 6px)` }}
          />
        </div>
      </div>

      {/* Key Metric Highlights: Market Cap & 24h Volume */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-800/60">
          <span className="text-[10px] uppercase text-slate-400">Market Cap</span>
          <p className="mt-0.5 font-mono-numbers font-semibold text-slate-200">
            {formatLargeCurrency(coin.market_cap, currency)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-900/60 p-2 border border-slate-800/60">
          <span className="text-[10px] uppercase text-slate-400">24h Volume</span>
          <p className="mt-0.5 font-mono-numbers font-semibold text-slate-200">
            {formatLargeCurrency(coin.total_volume, currency)}
          </p>
        </div>
      </div>

      {/* Footer Quick Action */}
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
        <span className="text-[11px] text-slate-400">
          ATH: {formatCurrency(coin.ath, currency)} ({formatPercent(coin.ath_change_percentage)})
        </span>
        <button
          onClick={() => onOpenChart?.(coin.id)}
          className="flex items-center gap-1 font-medium text-cyan-400 transition-colors hover:text-cyan-300"
        >
          <span>Chart & Depth</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
