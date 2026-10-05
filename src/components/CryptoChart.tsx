import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Activity,
  Sliders,
} from "lucide-react";
import { fetchCoinHistory } from "../services/api";
import { formatCurrency, formatLargeCurrency, formatPercent } from "../utils/formatters";
import { CryptoCoin, FiatCurrencyCode } from "../types/crypto";
import { SUPPORTED_CURRENCIES } from "../utils/currencies";

interface CryptoChartProps {
  coins: CryptoCoin[];
  initialCoinId?: string;
  currency?: FiatCurrencyCode;
  onCoinChange?: (coinId: string) => void;
}

export const CryptoChart: React.FC<CryptoChartProps> = ({
  coins,
  initialCoinId = "bitcoin",
  currency = "INR",
  onCoinChange,
}) => {
  const [selectedCoinId, setSelectedCoinId] = useState<string>(initialCoinId);
  const [timeframe, setTimeframe] = useState<"1" | "7" | "30" | "365">("7");
  const [chartType, setChartType] = useState<"price" | "volume">("price");
  const [loading, setLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const currencyConfig = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;

  useEffect(() => {
    if (initialCoinId && initialCoinId !== selectedCoinId) {
      setSelectedCoinId(initialCoinId);
    }
  }, [initialCoinId]);

  const selectedCoin = coins.find((c) => c.id === selectedCoinId) || coins[0];

  const timeframes = [
    { label: "24 Hours", value: "1" as const },
    { label: "7 Days", value: "7" as const },
    { label: "30 Days", value: "30" as const },
    { label: "1 Year", value: "365" as const },
  ];

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCoinHistory(selectedCoinId, timeframe, currency);
      if (res && res.prices && Array.isArray(res.prices)) {
        const points = res.prices.map(([time, price], index) => {
          const vol = res.total_volumes?.[index]?.[1] || 0;
          const dateObj = new Date(time);
          const formattedDate =
            timeframe === "1"
              ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : dateObj.toLocaleDateString([], { month: "short", day: "numeric" });
          const fullDateTime = dateObj.toLocaleString([], {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return {
            timestamp: time,
            displayTime: formattedDate,
            fullDateTime,
            price,
            volume: vol,
          };
        });
        setChartData(points);
      } else {
        throw new Error("Invalid chart data structure");
      }
    } catch (err: any) {
      console.error("Failed to load chart history:", err);
      setError("Historical market data currently unavailable. Retrying...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCoinId, timeframe, currency]);

  const handleCoinSelect = (id: string) => {
    setSelectedCoinId(id);
    onCoinChange?.(id);
  };

  // Calculations for chosen timeframe
  const minPrice = chartData.length > 0 ? Math.min(...chartData.map((d) => d.price)) : 0;
  const maxPrice = chartData.length > 0 ? Math.max(...chartData.map((d) => d.price)) : 0;
  const firstPrice = chartData.length > 0 ? chartData[0].price : 0;
  const lastPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;
  const periodChangePercent = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
  const isPeriodPositive = periodChangePercent >= 0;

  const strokeColor = isPeriodPositive ? "#10b981" : "#f43f5e";
  const gradientId = `glowGradient_${selectedCoinId}_${isPeriodPositive ? "green" : "red"}_${currency}`;

  return (
    <div className="rounded-2xl border border-slate-800/90 bg-gradient-to-b from-[#0b0f22]/90 to-[#070914]/95 p-4 sm:p-6 backdrop-blur-2xl shadow-2xl shadow-black/60">
      {/* Top Controls Bar */}
      <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Coin Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {coins.map((c) => {
            const isSelected = c.id === selectedCoinId;
            return (
              <button
                key={c.id}
                onClick={() => handleCoinSelect(c.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/20"
                    : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <img src={c.image} alt={c.name} className="h-4 w-4 rounded-full object-contain" />
                <span>{c.name}</span>
                <span className="text-[10px] uppercase opacity-75">{c.symbol}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Timeframe & Chart Type */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Chart Metric Toggle */}
          <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800">
            <button
              onClick={() => setChartType("price")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                chartType === "price"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Price ({currencyConfig.code})
            </button>
            <button
              onClick={() => setChartType("volume")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                chartType === "volume"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Volume (24h)
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  timeframe === tf.value
                    ? "bg-slate-800 text-cyan-300 font-bold border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Reload Button */}
          <button
            onClick={loadData}
            title="Refresh chart data"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Hero Stats for Selected Coin & Timeframe */}
      {selectedCoin && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800/80">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">
              Spot Price ({currencyConfig.code})
            </span>
            <div className="mt-1 font-mono-numbers text-xl font-bold text-white sm:text-2xl">
              {formatCurrency(selectedCoin.current_price, currency)}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-xs font-semibold font-mono-numbers">
              <span className={isPeriodPositive ? "text-emerald-400" : "text-rose-400"}>
                {formatPercent(periodChangePercent)} ({timeframe === "1" ? "24h" : `${timeframe}d`})
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800/80">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">Period Low</span>
            <div className="mt-1 font-mono-numbers text-lg font-bold text-slate-200 sm:text-xl">
              {formatCurrency(minPrice, currency)}
            </div>
            <span className="text-[11px] text-slate-400">Support base</span>
          </div>

          <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800/80">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">Period High</span>
            <div className="mt-1 font-mono-numbers text-lg font-bold text-slate-200 sm:text-xl">
              {formatCurrency(maxPrice, currency)}
            </div>
            <span className="text-[11px] text-slate-400">Resistance peak</span>
          </div>

          <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800/80">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">Market Cap</span>
            <div className="mt-1 font-mono-numbers text-lg font-bold text-cyan-300 sm:text-xl">
              {formatLargeCurrency(selectedCoin.market_cap, currency)}
            </div>
            <span className="text-[11px] text-slate-400">Global Rank #{selectedCoin.market_cap_rank}</span>
          </div>
        </div>
      )}

      {/* Chart Canvas Area */}
      <div className="relative mt-6 h-80 w-full sm:h-96">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-slate-950/60 backdrop-blur-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            <p className="mt-3 text-xs font-medium text-cyan-300">Synchronizing chart telemetry...</p>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-slate-950/80 p-6 text-center">
            <Activity className="h-8 w-8 text-rose-400 mb-2" />
            <p className="text-sm font-semibold text-rose-300">{error}</p>
            <button
              onClick={loadData}
              className="mt-3 rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-cyan-500"
            >
              Retry Sync
            </button>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          {chartType === "price" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
                  <stop offset="60%" stopColor={strokeColor} stopOpacity={0.08} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis
                dataKey="displayTime"
                stroke="#64748b"
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
              />
              <YAxis
                domain={["auto", "auto"]}
                stroke="#64748b"
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                tickFormatter={(val) => formatLargeCurrency(val, currency)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-cyan-500/40 bg-slate-950/95 p-3.5 shadow-2xl backdrop-blur-md">
                        <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                          <span>{data.fullDateTime}</span>
                          <span className="font-bold text-cyan-300 uppercase">{selectedCoin.symbol}</span>
                        </div>
                        <div className="mt-1.5 font-mono-numbers text-lg font-extrabold text-white">
                          {formatCurrency(data.price, currency)}
                        </div>
                        {data.volume > 0 && (
                          <div className="mt-1 text-xs text-slate-400">
                            Vol: <span className="font-mono-numbers text-slate-300">{formatLargeCurrency(data.volume, currency)}</span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                isAnimationActive={true}
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis
                dataKey="displayTime"
                stroke="#64748b"
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                tickFormatter={(val) => formatLargeCurrency(val, currency)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-cyan-500/40 bg-slate-950/95 p-3.5 shadow-2xl backdrop-blur-md">
                        <div className="text-xs text-slate-400">{data.fullDateTime}</div>
                        <div className="mt-1 font-mono-numbers text-base font-bold text-cyan-300">
                          Volume: {formatLargeCurrency(data.volume, currency)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="volume" fill="#06b6d4" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
