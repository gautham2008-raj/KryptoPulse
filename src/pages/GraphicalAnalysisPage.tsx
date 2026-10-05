import React, { useState, useEffect } from "react";
import { BarChart3, ArrowLeft } from "lucide-react";
import { CryptoCoin, FiatCurrencyCode } from "../types/crypto";
import { CryptoChart } from "../components/CryptoChart";
import { formatCurrency, formatPercent } from "../utils/formatters";
import { SUPPORTED_CURRENCIES } from "../utils/currencies";

interface GraphicalAnalysisPageProps {
  coins: CryptoCoin[];
  currency: FiatCurrencyCode;
  onNavigate: (path: string) => void;
  initialCoinId?: string;
}

export const GraphicalAnalysisPage: React.FC<GraphicalAnalysisPageProps> = ({
  coins,
  currency,
  onNavigate,
  initialCoinId = "bitcoin",
}) => {
  const [selectedCoinId, setSelectedCoinId] = useState<string>(initialCoinId);
  const currencyConfig = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const coinParam = urlParams.get("coin");
    if (coinParam && coins.some((c) => c.id === coinParam)) {
      setSelectedCoinId(coinParam);
    }
  }, [coins]);

  const selectedCoin = coins.find((c) => c.id === selectedCoinId) || coins[0];

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
            Technical Analysis • Base: {currencyConfig.code} ({currencyConfig.symbol})
          </span>
        </div>

        {/* Hero Header */}
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/60 px-3.5 py-1 text-xs font-semibold text-blue-300">
              <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
              <span>Interactive Time-Series Engine</span>
            </div>
            <h1 className="font-heading mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              Graphical Price & Volume Analysis
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              High-resolution historical charts across 24h, 7d, 30d, and 1y intervals in {currencyConfig.name}.
            </p>
          </div>
        </div>

        {/* Main Chart Card */}
        <div className="mt-8">
          <CryptoChart
            coins={coins}
            currency={currency}
            initialCoinId={selectedCoinId}
            onCoinChange={(id) => setSelectedCoinId(id)}
          />
        </div>

        {/* Technical Insights Grid for Selected Coin */}
        {selectedCoin && (
          <div className="mt-10 rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#0d1226]/80 to-[#070914]/90 p-6 sm:p-8 backdrop-blur-xl">
            <h3 className="font-heading text-lg font-bold text-white mb-4">
              Telemetry Summary: {selectedCoin.name} ({selectedCoin.symbol.toUpperCase()})
            </h3>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-slate-900/70 p-4 border border-slate-800">
                <span className="text-xs text-slate-400">All-Time High (ATH)</span>
                <div className="mt-1 font-mono-numbers text-base font-bold text-white">
                  {formatCurrency(selectedCoin.ath, currency)}
                </div>
                <span className="text-[11px] text-rose-400 font-mono-numbers">
                  {formatPercent(selectedCoin.ath_change_percentage)} from peak
                </span>
              </div>

              <div className="rounded-xl bg-slate-900/70 p-4 border border-slate-800">
                <span className="text-xs text-slate-400">24h Volatility Spread</span>
                <div className="mt-1 font-mono-numbers text-base font-bold text-cyan-300">
                  {formatCurrency(selectedCoin.high_24h - selectedCoin.low_24h, currency)}
                </div>
                <span className="text-[11px] text-slate-400">Intraday range</span>
              </div>

              <div className="rounded-xl bg-slate-900/70 p-4 border border-slate-800">
                <span className="text-xs text-slate-400">Circulating Supply</span>
                <div className="mt-1 font-mono-numbers text-base font-bold text-slate-200">
                  {selectedCoin.circulating_supply?.toLocaleString()}
                </div>
                <span className="text-[11px] uppercase text-slate-400">{selectedCoin.symbol}</span>
              </div>

              <div className="rounded-xl bg-slate-900/70 p-4 border border-slate-800">
                <span className="text-xs text-slate-400">Volume / Cap Ratio</span>
                <div className="mt-1 font-mono-numbers text-base font-bold text-amber-300">
                  {selectedCoin.market_cap > 0
                    ? ((selectedCoin.total_volume / selectedCoin.market_cap) * 100).toFixed(2)
                    : "0.00"}
                  %
                </div>
                <span className="text-[11px] text-slate-400">Trading activity depth</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
