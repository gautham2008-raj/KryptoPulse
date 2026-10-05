import React, { useState } from "react";
import {
  History,
  Calendar,
  User,
  Building,
  Target,
  Cpu,
  Zap,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
} from "lucide-react";
import { CRYPTO_HISTORIES } from "../data/cryptoHistoryData";
import { CryptoCoinHistoryInfo } from "../types/crypto";

interface HistoryPageProps {
  onNavigate: (path: string) => void;
  initialCoin?: string;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate, initialCoin = "bitcoin" }) => {
  const [selectedCoinId, setSelectedCoinId] = useState<string>(initialCoin);

  const coinList = [
    { id: "bitcoin", name: "Bitcoin", symbol: "BTC", color: "text-amber-400" },
    { id: "ethereum", name: "Ethereum", symbol: "ETH", color: "text-blue-400" },
    { id: "tether", name: "Tether", symbol: "USDT", color: "text-emerald-400" },
    { id: "binancecoin", name: "BNB", symbol: "BNB", color: "text-yellow-400" },
    { id: "solana", name: "Solana", symbol: "SOL", color: "text-teal-400" },
  ];

  const currentCoin: CryptoCoinHistoryInfo = CRYPTO_HISTORIES[selectedCoinId] || CRYPTO_HISTORIES.bitcoin;

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
          <span className="text-xs text-slate-400">Historical Archives • 5 Benchmark Cryptocurrencies</span>
        </div>

        {/* Hero Header */}
        <div className="mt-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/60 px-3.5 py-1 text-xs font-semibold text-violet-300">
            <History className="h-3.5 w-3.5 text-violet-400" />
            <span>Chronological Genesis & Milestones</span>
          </div>
          <h1 className="font-heading mt-4 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            History of the 5 Major Cryptocurrencies
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Explore the architectural evolution, founders, origin motives, key historical turning points, and modern ecosystem roles of Bitcoin, Ethereum, Tether, BNB, and Solana.
          </p>
        </div>

        {/* Coin Selector Switcher Tabs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {coinList.map((c) => {
            const isSelected = c.id === selectedCoinId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCoinId(c.id)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                  isSelected
                    ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/25 scale-105"
                    : "bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white"
                }`}
              >
                <span>{c.name}</span>
                <span className="text-xs uppercase opacity-80">({c.symbol})</span>
              </button>
            );
          })}
        </div>

        {/* Selected Coin Historical Dossier */}
        <div className="mt-10 rounded-3xl border border-slate-800/80 bg-gradient-to-b from-[#0e142c]/90 to-[#070914]/95 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl">
          {/* Header Card Profile */}
          <div className="flex flex-col gap-4 border-b border-slate-800 pb-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-heading text-3xl font-black text-white">{currentCoin.name}</h2>
                <span className="rounded-lg bg-cyan-500/20 px-2.5 py-1 text-xs font-bold uppercase text-cyan-300 border border-cyan-500/30">
                  {currentCoin.symbol}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300 max-w-2xl">
                {currentCoin.originalPurpose}
              </p>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Launch Date</span>
                </div>
                <div className="mt-1 font-bold text-white">{currentCoin.launchDate}</div>
              </div>

              <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <User className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Founder</span>
                </div>
                <div className="mt-1 font-bold text-white line-clamp-1">{currentCoin.founder}</div>
              </div>

              <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800 col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Consensus Engine</span>
                </div>
                <div className="mt-1 font-bold text-cyan-300 line-clamp-1">{currentCoin.consensus}</div>
              </div>
            </div>
          </div>

          {/* Current Ecosystem Role Highlight */}
          <div className="mt-8 rounded-2xl bg-cyan-950/30 p-5 border border-cyan-500/30">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Modern Role in Global Web3
            </span>
            <p className="mt-1 text-sm leading-relaxed text-slate-200">
              {currentCoin.currentRole}
            </p>
          </div>

          {/* Interactive Milestone Timeline */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Chronology</span>
                <h3 className="font-heading text-xl font-bold text-white">Historical Milestones & Turning Points</h3>
              </div>
            </div>

            <div className="relative border-l-2 border-cyan-500/30 ml-4 sm:ml-6 space-y-8 pl-6 sm:pl-8">
              {currentCoin.milestones.map((ms, idx) => {
                const badgeColor =
                  ms.category === "launch"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : ms.category === "upgrade"
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                    : ms.category === "event"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : "bg-violet-500/20 text-violet-300 border-violet-500/30";

                return (
                  <div key={idx} className="relative group">
                    {/* Glowing timeline dot */}
                    <div className="absolute -left-[31px] sm:-left-[39px] top-1 h-4 w-4 rounded-full border-2 border-[#070913] bg-cyan-400 shadow-md shadow-cyan-400/50 group-hover:scale-125 transition-transform" />

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md transition-all group-hover:border-cyan-500/40">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-numbers text-sm font-extrabold text-cyan-300">
                            {ms.year}
                          </span>
                          <span className="text-slate-500">•</span>
                          <h4 className="font-heading text-base font-bold text-white">{ms.title}</h4>
                        </div>
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border ${badgeColor}`}>
                          {ms.category}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-300">{ms.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Major Architectural Developments */}
          <div className="mt-12 border-t border-slate-800 pt-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Key Technical & Economic Breakthroughs
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {currentCoin.majorDevelopments.map((dev, dIdx) => (
                <div
                  key={dIdx}
                  className="flex items-start gap-3 rounded-xl bg-slate-900/40 p-3.5 border border-slate-800/80 text-xs text-slate-300"
                >
                  <Zap className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{dev}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Navigation Footer */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6">
            <button
              onClick={() => onNavigate(`/charts?coin=${currentCoin.id}`)}
              className="flex items-center gap-2 rounded-xl bg-cyan-500/20 px-4 py-2 text-xs font-bold text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all"
            >
              <span>View {currentCoin.name} Interactive Chart</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => onNavigate("/comparison")}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 border border-slate-700 hover:text-white transition-all"
            >
              <span>Compare All 5 Cryptos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
