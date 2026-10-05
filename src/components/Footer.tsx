import React from "react";
import { Shield, AlertTriangle, ExternalLink, Zap, Terminal, Heart } from "lucide-react";

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-[#060812] text-slate-400">
      {/* Educational & Risk Warning Banner */}
      <div className="border-b border-slate-800/50 bg-amber-500/5 py-4 px-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-start gap-3 text-xs text-amber-200/90">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300 uppercase tracking-wide text-[11px]">
              Important Educational Disclaimer
            </p>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              KryptoPulse is an interactive educational and research platform. All cryptocurrency data, valuation metrics, charts,
              and AI-generated analyses are provided strictly for educational and informational purposes and do not constitute financial, investment,
              legal, or trading advice. Digital asset markets are highly volatile. Never invest capital you cannot afford to lose. Always perform your own
              independent research (DYOR).
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#090d1f]">
                  <Zap className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-heading text-lg font-bold tracking-tight text-white">
                KRYPTO<span className="text-cyan-400">PULSE</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 max-w-md">
              A futuristic, educational cryptocurrency intelligence platform providing real-time INR market data, deep historical analytics,
              comparative insights, and intelligent Gemini AI market analysis for Bitcoin, Ethereum, Tether, BNB, and Solana.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Public Crypto Live Feeds
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[11px] text-violet-300">
                <Terminal className="h-3 w-3" />
                Gemini 3.8 Intelligence
              </span>
            </div>
          </div>

          {/* Core Sections */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Platform Features</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <a href="/dashboard" onClick={(e) => handleNav(e, "/dashboard")} className="hover:text-cyan-300 transition-colors">
                  Main Dashboard Hub
                </a>
              </li>
              <li>
                <a href="/analysis" onClick={(e) => handleNav(e, "/analysis")} className="hover:text-cyan-300 transition-colors">
                  Live Market Analysis (INR)
                </a>
              </li>
              <li>
                <a href="/charts" onClick={(e) => handleNav(e, "/charts")} className="hover:text-cyan-300 transition-colors">
                  Interactive Graphical Charts
                </a>
              </li>
              <li>
                <a href="/comparison" onClick={(e) => handleNav(e, "/comparison")} className="hover:text-cyan-300 transition-colors">
                  Multi-Coin Comparison
                </a>
              </li>
              <li>
                <a href="/live-prices" onClick={(e) => handleNav(e, "/live-prices")} className="hover:text-cyan-300 transition-colors">
                  Live Fast Ticker
                </a>
              </li>
            </ul>
          </div>

          {/* Educational Modules */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Knowledge & History</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <a href="/introduction" onClick={(e) => handleNav(e, "/introduction")} className="hover:text-cyan-300 transition-colors">
                  Crypto & Blockchain Basics
                </a>
              </li>
              <li>
                <a href="/history" onClick={(e) => handleNav(e, "/history")} className="hover:text-cyan-300 transition-colors">
                  5 Cryptocurrencies History
                </a>
              </li>
              <li>
                <a href="/ai-assistant" onClick={(e) => handleNav(e, "/ai-assistant")} className="hover:text-cyan-300 transition-colors">
                  AI Cryptocurrency Assistant
                </a>
              </li>
              <li>
                <a href="/introduction#mining-and-consensus" onClick={(e) => handleNav(e, "/introduction")} className="hover:text-cyan-300 transition-colors">
                  PoW vs PoS Consensus
                </a>
              </li>
              <li>
                <a href="/introduction#risks-and-security" onClick={(e) => handleNav(e, "/introduction")} className="hover:text-cyan-300 transition-colors">
                  Risk Management & Wallets
                </a>
              </li>
            </ul>
          </div>

          {/* Cryptos Tracked */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Tracked Assets (INR)</h4>
            <ul className="mt-3 space-y-2 text-xs font-mono-numbers">
              <li className="flex items-center justify-between">
                <span className="text-amber-400">Bitcoin (BTC)</span>
                <span className="text-slate-400">Rank #1</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-blue-400">Ethereum (ETH)</span>
                <span className="text-slate-400">Rank #2</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-emerald-400">Tether (USDT)</span>
                <span className="text-slate-400">Rank #3</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-yellow-400">BNB (BNB)</span>
                <span className="text-slate-400">Rank #4</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-teal-400">Solana (SOL)</span>
                <span className="text-slate-400">Rank #5</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-6 text-xs sm:flex-row">
          <p className="text-slate-400">
            © {new Date().getFullYear()} KryptoPulse. All cryptocurrency prices quoted in Indian Rupees (₹).
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Server Proxy Caching Enabled</span>
            <span>•</span>
            <span>Real-time Market Sync</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
