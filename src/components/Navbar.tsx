import React, { useState } from "react";
import {
  Activity,
  Layers,
  History,
  TrendingUp,
  BarChart3,
  GitCompare,
  Zap,
  Bot,
  Menu,
  X,
  PieChart,
  ChevronRight,
} from "lucide-react";
import { CryptoCoin, FiatCurrencyCode, SyncStatus } from "../types/crypto";
import { formatCurrency, formatPercent } from "../utils/formatters";
import { CurrencySelector } from "./CurrencySelector";
import { SyncStatusBadge } from "./SyncStatusBadge";
import { SUPPORTED_CURRENCIES } from "../utils/currencies";

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  coins?: CryptoCoin[];
  lastUpdated?: string;
  syncStatus?: SyncStatus;
  isLive?: boolean;
  currency: FiatCurrencyCode;
  onSelectCurrency: (currency: FiatCurrencyCode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  coins = [],
  lastUpdated,
  syncStatus = "LIVE",
  isLive = true,
  currency,
  onSelectCurrency,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currencyConfig = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: Layers },
    { label: "Market Overview", path: "/overview", icon: PieChart },
    { label: "Analysis", path: "/analysis", icon: TrendingUp },
    { label: "Charts", path: "/charts", icon: BarChart3 },
    { label: "Comparison", path: "/comparison", icon: GitCompare },
    { label: "Live Prices", path: "/live-prices", icon: Zap },
    { label: "Introduction", path: "/introduction", icon: Activity },
    { label: "History", path: "/history", icon: History },
    { label: "AI Analyst", path: "/ai-assistant", icon: Bot, isSpecial: true },
  ];

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      return;
    }
    e.preventDefault();
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/15 bg-[#070913]/90 backdrop-blur-xl transition-all">
      {/* Top Mini Live Ticker Bar */}
      {coins.length > 0 && (
        <div className="hidden border-b border-slate-800/80 bg-slate-950/60 py-1.5 px-4 lg:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <SyncStatusBadge status={syncStatus} lastUpdated={lastUpdated} />
              <span className="font-semibold uppercase tracking-wider text-slate-400">
                Market Telemetry ({currencyConfig.code} {currencyConfig.symbol})
              </span>
            </div>

            <div className="flex items-center gap-6 overflow-x-auto font-mono-numbers">
              {coins.map((coin) => {
                const isPositive = coin.price_change_percentage_24h >= 0;
                return (
                  <a
                    key={coin.id}
                    href={`/live-prices?coin=${coin.id}`}
                    onClick={(e) => handleLinkClick(e, `/live-prices`)}
                    className="flex items-center gap-1.5 transition-colors hover:text-cyan-300"
                  >
                    <span className="font-semibold text-slate-300 uppercase">{coin.symbol}:</span>
                    <span className="text-slate-200">{formatCurrency(coin.current_price, currency)}</span>
                    <span
                      className={`text-[11px] font-semibold ${
                        isPositive ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {formatPercent(coin.price_change_percentage_24h)}
                    </span>
                  </a>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <CurrencySelector currentCurrency={currency} onSelectCurrency={onSelectCurrency} compact />
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, "/")}
          className="group flex items-center gap-3"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-all duration-300">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#090d1f]">
              <Zap className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-xl font-bold tracking-tight text-white">
                KRYPTO<span className="text-cyan-400">PULSE</span>
              </span>
              <span className="rounded border border-cyan-400/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
                PRO
              </span>
            </div>
            <p className="text-[10px] tracking-wide text-slate-400">Crypto Analytics & AI Analyst</p>
          </div>
        </a>

        {/* Desktop Nav Items */}
        <nav className="hidden items-center gap-1 xl:gap-1.5 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleLinkClick(e, item.path)}
                className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10"
                    : item.isSpecial
                    ? "bg-gradient-to-r from-violet-600/20 to-cyan-600/20 text-cyan-200 border border-violet-500/30 hover:border-cyan-400/50"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-cyan-400" : item.isSpecial ? "text-violet-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
                {item.isSpecial && (
                  <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right Action: Currency Switcher + Quick Actions */}
        <div className="hidden items-center gap-3 sm:flex">
          <div className="lg:hidden">
            <CurrencySelector currentCurrency={currency} onSelectCurrency={onSelectCurrency} />
          </div>

          <a
            href="/ai-assistant"
            onClick={(e) => handleLinkClick(e, "/ai-assistant")}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:scale-[1.02]"
          >
            <Bot className="h-3.5 w-3.5" />
            <span>AI Analyst</span>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <CurrencySelector currentCurrency={currency} onSelectCurrency={onSelectCurrency} compact />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-[#090d1f]/95 px-4 pt-2 pb-6 backdrop-blur-2xl lg:hidden">
          <div className="mb-3 flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs text-slate-400">
            <span>Navigation Sections</span>
            <span className="text-cyan-400 font-mono-numbers">Base: {currencyConfig.code} ({currencyConfig.symbol})</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleLinkClick(e, item.path)}
                  className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-slate-300 hover:bg-slate-800/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-cyan-400" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
