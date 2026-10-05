import React, { useState } from "react";
import {
  Activity,
  Layers,
  ShieldAlert,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { INTRO_SECTIONS } from "../data/introContent";
import {
  BlockchainFlowDiagram,
  TransactionLifecycleDiagram,
  PowVsPosDiagram,
} from "../components/diagrams/EducationalDiagrams";

interface IntroductionPageProps {
  onNavigate: (path: string) => void;
}

export const IntroductionPage: React.FC<IntroductionPageProps> = ({ onNavigate }) => {
  const [activeSectionId, setActiveSectionId] = useState<string>("what-is-crypto");

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
          <span className="text-xs text-slate-400">Curriculum • Crypto Fundamentals</span>
        </div>

        {/* Hero Header */}
        <div className="mt-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-3.5 py-1 text-xs font-semibold text-cyan-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Comprehensive Educational Masterclass</span>
          </div>
          <h1 className="font-heading mt-4 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Cryptocurrency Introduction & Fundamentals
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            A beginner-friendly yet technically precise journey into the architecture of decentralized ledgers, cryptographic ownership, consensus models, valuation mechanics, and risk management.
          </p>
        </div>

        {/* Table of Contents Quick Tabs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {INTRO_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSectionId(sec.id);
                document.getElementById(sec.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                activeSectionId === sec.id
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                  : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {sec.title.split(". ")[1]}
            </button>
          ))}
        </div>

        {/* Main Content Sections */}
        <div className="mt-12 space-y-12">
          {INTRO_SECTIONS.map((sec) => {
            return (
              <section
                key={sec.id}
                id={sec.id}
                className="scroll-mt-24 rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#0d1226]/80 to-[#070914]/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl transition-all"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-cyan-500/20 px-2.5 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/30">
                      {sec.badge}
                    </span>
                    <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">{sec.title}</h2>
                  </div>
                </div>

                <p className="mt-3 text-sm font-medium text-cyan-200/90 leading-relaxed border-l-2 border-cyan-500 pl-3">
                  {sec.summary}
                </p>

                <div className="mt-5 space-y-3 text-sm text-slate-300 leading-relaxed">
                  {sec.content.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {/* Optional Interactive Diagrams */}
                {sec.diagramType === "blockchain_flow" && (
                  <div className="mt-6">
                    <BlockchainFlowDiagram />
                  </div>
                )}

                {sec.diagramType === "transaction_lifecycle" && (
                  <div className="mt-6">
                    <TransactionLifecycleDiagram />
                  </div>
                )}

                {sec.diagramType === "pow_vs_pos" && (
                  <div className="mt-6">
                    <PowVsPosDiagram />
                  </div>
                )}

                {/* Key Points Checklist */}
                {sec.keyPoints && sec.keyPoints.length > 0 && (
                  <div className="mt-6 rounded-xl bg-slate-900/60 p-4 border border-slate-800/80">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                      Key Takeaways & Core Principles
                    </h4>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {sec.keyPoints.map((point, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Bottom CTA to Continue Learning */}
        <div className="mt-16 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-violet-950/40 p-8 text-center backdrop-blur-xl">
          <h3 className="font-heading text-xl font-bold text-white sm:text-2xl">
            Ready to explore the historical origins?
          </h3>
          <p className="mt-2 text-sm text-slate-300 max-w-xl mx-auto">
            Discover how Satoshi Nakamoto, Vitalik Buterin, and Anatoly Yakovenko revolutionized decentralized architecture.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate("/history")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:scale-105 transition-all"
            >
              <span>Explore 5 Cryptos History</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate("/analysis")}
              className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 px-6 py-3 text-sm font-bold text-slate-200 hover:border-cyan-400 transition-all"
            >
              <span>View Live Market Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
