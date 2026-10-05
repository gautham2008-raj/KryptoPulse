import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  GitCompare,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { CryptoCoin, FiatCurrencyCode } from "../types/crypto";
import { CRYPTO_HISTORIES } from "../data/cryptoHistoryData";
import { formatCurrency, formatLargeCurrency, formatPercent, formatSupply } from "../utils/formatters";
import { SUPPORTED_CURRENCIES } from "../utils/currencies";

interface ComparisonPageProps {
  coins: CryptoCoin[];
  currency: FiatCurrencyCode;
  onNavigate: (path: string) => void;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({ coins, currency, onNavigate }) => {
  const [metricTab, setMetricTab] = useState<"market_cap" | "volume" | "change">("market_cap");
  const currencyConfig = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;

  const colors = ["#f7931a", "#627eea", "#26a17b", "#f3ba2f", "#14f195"];

  const chartData = coins.map((c, i) => ({
    name: c.symbol.toUpperCase(),
    fullName: c.name,
    market_cap: c.market_cap,
    volume: c.total_volume,
    change: c.price_change_percentage_24h,
    color: colors[i % colors.length],
  }));

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
          <span className="text-xs text-slate-400">
            Multi-Asset Comparison ({currencyConfig.code} {currencyConfig.symbol})
          </span>
        </div>

        {/* Hero Header */}
        <div className="mt-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-950/60 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <GitCompare className="h-3.5 w-3.5 text-amber-400" />
            <span>5-Asset Cross-Evaluation</span>
          </div>
          <h1 className="font-heading mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Cryptocurrency Comparison Matrix
          </h1>
          <p className="mt-1 text-sm text-slate-300 max-w-3xl">
            Side-by-side technical and economic comparative analysis between Bitcoin, Ethereum, Tether, BNB, and Solana denominated in {currencyConfig.name}.
          </p>
        </div>

        {/* Visual Benchmark Charts */}
        <div className="mt-8 rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#0d1226]/80 to-[#070914]/90 p-5 sm:p-8 backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Visual Distribution</span>
              <h3 className="font-heading text-lg font-bold text-white">Comparative Breakdown</h3>
            </div>

            {/* Metric Switcher */}
            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
              <button
                onClick={() => setMetricTab("market_cap")}
                className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                  metricTab === "market_cap" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                Market Cap ({currencyConfig.code})
              </button>
              <button
                onClick={() => setMetricTab("volume")}
                className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                  metricTab === "volume" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                24h Volume ({currencyConfig.code})
              </button>
              <button
                onClick={() => setMetricTab("change")}
                className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                  metricTab === "change" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                24h Performance (%)
              </button>
            </div>
          </div>

          <div className="mt-6 h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={(val) => (metricTab === "change" ? `${val}%` : formatLargeCurrency(val, currency))}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const val =
                        metricTab === "market_cap"
                          ? formatLargeCurrency(data.market_cap, currency)
                          : metricTab === "volume"
                          ? formatLargeCurrency(data.volume, currency)
                          : formatPercent(data.change);
                      return (
                        <div className="rounded-xl border border-cyan-500/40 bg-slate-950/95 p-3 shadow-xl">
                          <div className="text-xs text-slate-400">{data.fullName}</div>
                          <div className="mt-1 font-mono-numbers text-base font-bold text-white">
                            {val}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey={metricTab === "market_cap" ? "market_cap" : metricTab === "volume" ? "volume" : "change"}
                  radius={[6, 6, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={metricTab === "change" ? (entry.change >= 0 ? "#10b981" : "#f43f5e") : entry.color}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Master Comparison Table */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-b from-[#0d1228]/90 to-[#070914]/95 backdrop-blur-xl shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-4 px-4 sm:px-6">Metric</th>
                  {coins.map((c) => (
                    <th key={c.id} className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <img src={c.image} alt={c.name} className="h-6 w-6 rounded-full object-contain" />
                        <span className="font-heading font-bold text-white text-xs">{c.name}</span>
                        <span className="text-[10px] text-slate-400">({c.symbol.toUpperCase()})</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
                <tr className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 sm:px-6 font-sans font-bold text-slate-300">
                    Spot Price ({currencyConfig.code})
                  </td>
                  {coins.map((c) => (
                    <td key={c.id} className="py-3.5 px-4 text-center font-bold text-white text-sm">
                      {formatCurrency(c.current_price, currency)}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 sm:px-6 font-sans font-bold text-slate-300">24h Price Change</td>
                  {coins.map((c) => {
                    const isPositive = c.price_change_percentage_24h >= 0;
                    return (
                      <td key={c.id} className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-bold ${
                            isPositive
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {formatPercent(c.price_change_percentage_24h)}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 sm:px-6 font-sans font-bold text-slate-300">Market Cap</td>
                  {coins.map((c) => (
                    <td key={c.id} className="py-3.5 px-4 text-center font-semibold text-slate-200">
                      {formatLargeCurrency(c.market_cap, currency)}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 sm:px-6 font-sans font-bold text-slate-300">24h Trading Volume</td>
                  {coins.map((c) => (
                    <td key={c.id} className="py-3.5 px-4 text-center font-semibold text-cyan-300">
                      {formatLargeCurrency(c.total_volume, currency)}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 sm:px-6 font-sans font-bold text-slate-300">Market Rank</td>
                  {coins.map((c) => (
                    <td key={c.id} className="py-3.5 px-4 text-center">
                      <span className="rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-xs font-bold text-cyan-400">
                        #{c.market_cap_rank}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 sm:px-6 font-sans font-bold text-slate-300">Circulating Supply</td>
                  {coins.map((c) => (
                    <td key={c.id} className="py-3.5 px-4 text-center text-slate-300">
                      {formatSupply(c.circulating_supply, c.symbol)}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 sm:px-6 font-sans font-bold text-slate-300">Consensus Engine</td>
                  {coins.map((c) => {
                    const info = CRYPTO_HISTORIES[c.id];
                    return (
                      <td key={c.id} className="py-3.5 px-4 text-center font-sans text-xs text-slate-300">
                        {info?.consensus?.split(" - ")[0] || "Decentralized"}
                      </td>
                    );
                  })}
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 sm:px-6 font-sans font-bold text-slate-300">Throughput (TPS)</td>
                  {coins.map((c) => {
                    const info = CRYPTO_HISTORIES[c.id];
                    return (
                      <td key={c.id} className="py-3.5 px-4 text-center font-bold text-emerald-400">
                        {info?.tps || "N/A"}
                      </td>
                    );
                  })}
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 sm:px-6 font-sans font-bold text-slate-300">Inspect Deep Dive</td>
                  {coins.map((c) => (
                    <td key={c.id} className="py-3.5 px-4 text-center font-sans">
                      <button
                        onClick={() => onNavigate(`/charts?coin=${c.id}`)}
                        className="rounded-lg bg-cyan-950 px-2.5 py-1 text-xs font-semibold text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all"
                      >
                        Chart
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
