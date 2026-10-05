import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe, Check } from "lucide-react";
import { FiatCurrencyCode } from "../types/crypto";
import { SUPPORTED_CURRENCIES, CURRENCY_LIST } from "../utils/currencies";

interface CurrencySelectorProps {
  currentCurrency: FiatCurrencyCode;
  onSelectCurrency: (currency: FiatCurrencyCode) => void;
  compact?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  currentCurrency,
  onSelectCurrency,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = SUPPORTED_CURRENCIES[currentCurrency] || SUPPORTED_CURRENCIES.INR;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-[#090e24]/90 px-3 py-1.5 text-xs font-semibold text-cyan-300 shadow-sm transition-all hover:bg-cyan-500/20 hover:border-cyan-400 focus:outline-none"
        aria-label="Select display currency"
      >
        <span className="font-mono-numbers font-bold text-white">{selected.symbol}</span>
        <span>{selected.code}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-700/80 bg-[#090d22]/98 p-1.5 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Select Display Currency
          </div>
          <div className="mt-1 max-h-64 overflow-y-auto space-y-0.5">
            {CURRENCY_LIST.map((cur) => {
              const isSelected = cur.code === currentCurrency;
              return (
                <button
                  key={cur.code}
                  type="button"
                  onClick={() => {
                    onSelectCurrency(cur.code);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 font-mono-numbers font-bold text-cyan-400 text-xs">
                      {cur.symbol}
                    </span>
                    <div className="text-left">
                      <div className="font-bold text-white">{cur.code}</div>
                      <div className="text-[10px] text-slate-400">{cur.name}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
