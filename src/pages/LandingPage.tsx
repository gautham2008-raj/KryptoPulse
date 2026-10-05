import React from "react";
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  Bot,
  BarChart3,
  GitCompare,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { CryptoCoin, FiatCurrencyCode } from "../types/crypto";
import { formatCurrency } from "../utils/formatters";
import { SUPPORTED_CURRENCIES } from "../utils/currencies";

interface LandingPageProps {
  onEnterDashboard: () => void;
  coins?: CryptoCoin[];
  currency?: FiatCurrencyCode;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterDashboard,
  coins = [],
  currency = "INR",
}) => {
  const currencyConfig = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#070913] text-slate-100 cyber-grid">
      {/* Background glow orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-violet-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/10 blur-[100px]" />

      {/* Split-Screen Main Container */}
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col items-center justify-center px-4 py-8 sm:px-6 lg:flex-row lg:gap-12 lg:py-12">
        {/* Left Side: Large Cryptocurrency visual & glowing elements */}
        <div className="relative flex w-full flex-1 flex-col items-center justify-center py-8 text-center lg:items-start lg:text-left">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-md shadow-sm shadow-cyan-500/10">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
            <span className="tracking-wide uppercase">Standalone Crypto Intelligence • {currencyConfig.code}</span>
          </div>

          {/* Main Tagline */}
          <h1 className="font-heading mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Understand. <br />
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
              Analyze. Explore.
            </span>
            <br />
            Crypto Intelligence.
          </h1>

          {/* Subtext */}
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Master the decentralized markets with live {currencyConfig.name} spot prices, historical milestones, deep graphical charts, and interactive AI market analysis across Bitcoin, Ethereum, Tether, BNB, and Solana.
          </p>

          {/* Futuristic Crypto Graphics Sphere & Live Float Badges */}
          <div className="relative mt-8 h-64 w-full max-w-md sm:h-72">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-44 w-44 rounded-full border border-cyan-500/30 bg-gradient-to-tr from-cyan-500/10 to-violet-500/10 backdrop-blur-xl animate-pulse-subtle flex items-center justify-center">
                <div className="h-32 w-32 rounded-full border border-violet-500/40 bg-slate-950/80 flex flex-col items-center justify-center shadow-2xl shadow-cyan-500/30">
                  <Zap className="h-10 w-10 text-cyan-400 animate-bounce" />
                  <span className="mt-1 font-heading text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Live Feed
                  </span>
                </div>
              </div>
            </div>

            {coins.length > 0 && (
              <>
                <div className="absolute top-2 left-2 rounded-xl border border-amber-500/40 bg-slate-900/90 px-3 py-2 backdrop-blur-md shadow-lg shadow-amber-500/10 animate-float">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold text-white">BTC:</span>
                    <span className="font-mono-numbers text-xs text-amber-300">
                      {formatCurrency(coins.find((c) => c.symbol === "btc")?.current_price, currency)}
                    </span>
                  </div>
                </div>

                <div
                  className="absolute top-4 right-2 rounded-xl border border-blue-500/40 bg-slate-900/90 px-3 py-2 backdrop-blur-md shadow-lg shadow-blue-500/10 animate-float"
                  style={{ animationDelay: "1s" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-blue-400" />
                    <span className="text-xs font-bold text-white">ETH:</span>
                    <span className="font-mono-numbers text-xs text-blue-300">
                      {formatCurrency(coins.find((c) => c.symbol === "eth")?.current_price, currency)}
                    </span>
                  </div>
                </div>

                <div
                  className="absolute bottom-4 left-4 rounded-xl border border-teal-500/40 bg-slate-900/90 px-3 py-2 backdrop-blur-md shadow-lg shadow-teal-500/10 animate-float"
                  style={{ animationDelay: "2s" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-teal-400" />
                    <span className="text-xs font-bold text-white">SOL:</span>
                    <span className="font-mono-numbers text-xs text-teal-300">
                      {formatCurrency(coins.find((c) => c.symbol === "sol")?.current_price, currency)}
                    </span>
                  </div>
                </div>

                <div
                  className="absolute bottom-2 right-4 rounded-xl border border-yellow-500/40 bg-slate-900/90 px-3 py-2 backdrop-blur-md shadow-lg shadow-yellow-500/10 animate-float"
                  style={{ animationDelay: "3s" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-yellow-400" />
                    <span className="text-xs font-bold text-white">BNB:</span>
                    <span className="font-mono-numbers text-xs text-yellow-300">
                      {formatCurrency(coins.find((c) => c.symbol === "bnb")?.current_price, currency)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Website name/logo, short introduction, large glowing ENTER DASHBOARD button */}
        <div className="flex w-full flex-1 flex-col items-center justify-center py-8 lg:items-end">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-cyan-500/25 bg-gradient-to-b from-[#0e142c]/90 via-[#0a0e20]/95 to-[#060814]/98 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-cyan-500/15">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyan-500 via-indigo-400 to-violet-500" />

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-400 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/30">
                <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-[#070a18]">
                  <Zap className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
              <div>
                <h2 className="font-heading text-2xl font-black tracking-tight text-white sm:text-3xl">
                  KRYPTO<span className="text-cyan-400">PULSE</span>
                </h2>
                <p className="text-xs uppercase tracking-wider text-slate-400">Independent Production Terminal</p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-slate-300">
              Welcome to the premier cryptocurrency analysis environment. Seamlessly transition between real-time multi-currency market telemetry, multi-timeframe interactive graphical charts, blockchain foundational principles, historical milestone timelines, and our provider-independent AI Crypto Analyst.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
                <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-slate-200">Multi-Currency Live Rates</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
                <BarChart3 className="h-4 w-4 text-cyan-400 shrink-0" />
                <span className="text-slate-200">Interactive Charts</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
                <GitCompare className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-slate-200">5-Coin Comparison</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
                <Bot className="h-4 w-4 text-violet-400 shrink-0" />
                <span className="text-slate-200">AI Research Terminal</span>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={onEnterDashboard}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 p-4 font-heading text-base font-bold text-white shadow-xl shadow-cyan-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-400/50 hover:scale-[1.02] active:scale-[0.99]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="tracking-wider uppercase">ENTER DASHBOARD</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Independent Web App • Multi-Currency • Zero Studio Dependencies</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
