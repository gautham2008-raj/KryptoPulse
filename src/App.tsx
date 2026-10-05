/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MarketOverviewPage } from "./pages/MarketOverviewPage";
import { IntroductionPage } from "./pages/IntroductionPage";
import { HistoryPage } from "./pages/HistoryPage";
import { MarketAnalysisPage } from "./pages/MarketAnalysisPage";
import { GraphicalAnalysisPage } from "./pages/GraphicalAnalysisPage";
import { ComparisonPage } from "./pages/ComparisonPage";
import { LivePricesPage } from "./pages/LivePricesPage";
import { AiAssistantPage } from "./pages/AiAssistantPage";
import { CryptoCoin, FiatCurrencyCode } from "./types/crypto";
import { fetchLiveMarkets } from "./services/api";
import { getSavedCurrency, saveCurrency } from "./utils/currencies";

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || "/";
  });
  const [currency, setCurrency] = useState<FiatCurrencyCode>(() => {
    return getSavedCurrency();
  });
  const [coins, setCoins] = useState<CryptoCoin[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync route with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || "/");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCurrencyChange = (newCurrency: FiatCurrencyCode) => {
    setCurrency(newCurrency);
    saveCurrency(newCurrency);
  };

  // Centralized live market data loader
  const loadMarketData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchLiveMarkets(currency);
      if (res && res.data && Array.isArray(res.data)) {
        setCoins(res.data);
        setLastUpdated(res.lastUpdated || new Date().toISOString());
        setError(null);
      } else {
        throw new Error("Invalid market response format");
      }
    } catch (err: any) {
      console.warn("Market sync notice:", err);
      if (coins.length === 0) {
        setError("Market telemetry syncing with public feed...");
      }
    } finally {
      setLoading(false);
    }
  }, [currency, coins.length]);

  useEffect(() => {
    loadMarketData();

    // Auto-polling interval (every 45s)
    const interval = setInterval(() => {
      loadMarketData();
    }, 45000);

    return () => clearInterval(interval);
  }, [loadMarketData]);

  // Route renderer
  const renderCurrentPage = () => {
    switch (currentPath) {
      case "/":
        return (
          <LandingPage
            onEnterDashboard={() => navigateTo("/dashboard")}
            coins={coins}
            currency={currency}
          />
        );
      case "/dashboard":
        return (
          <DashboardPage
            coins={coins}
            currency={currency}
            lastUpdated={lastUpdated}
            loading={loading}
            onRefresh={loadMarketData}
            onNavigate={navigateTo}
          />
        );
      case "/overview":
        return (
          <MarketOverviewPage
            coins={coins}
            currency={currency}
            lastUpdated={lastUpdated}
            loading={loading}
            onRefresh={loadMarketData}
            onNavigate={navigateTo}
          />
        );
      case "/introduction":
        return <IntroductionPage onNavigate={navigateTo} />;
      case "/history":
        return <HistoryPage onNavigate={navigateTo} />;
      case "/analysis":
        return (
          <MarketAnalysisPage
            coins={coins}
            currency={currency}
            loading={loading}
            lastUpdated={lastUpdated}
            onRefresh={loadMarketData}
            onNavigate={navigateTo}
          />
        );
      case "/charts":
        return (
          <GraphicalAnalysisPage
            coins={coins}
            currency={currency}
            onNavigate={navigateTo}
          />
        );
      case "/comparison":
        return (
          <ComparisonPage
            coins={coins}
            currency={currency}
            onNavigate={navigateTo}
          />
        );
      case "/live-prices":
        return (
          <LivePricesPage
            coins={coins}
            currency={currency}
            loading={loading}
            lastUpdated={lastUpdated}
            onRefresh={loadMarketData}
            onNavigate={navigateTo}
          />
        );
      case "/ai-assistant":
        return (
          <AiAssistantPage
            coins={coins}
            currency={currency}
            onNavigate={navigateTo}
          />
        );
      default:
        return (
          <DashboardPage
            coins={coins}
            currency={currency}
            lastUpdated={lastUpdated}
            loading={loading}
            onRefresh={loadMarketData}
            onNavigate={navigateTo}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#070913] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar
        currentPath={currentPath}
        onNavigate={navigateTo}
        coins={coins}
        lastUpdated={lastUpdated}
        isLive={!error}
        currency={currency}
        onSelectCurrency={handleCurrencyChange}
      />

      <main className="flex-1">{renderCurrentPage()}</main>

      <Footer onNavigate={navigateTo} />
    </div>
  );
}
