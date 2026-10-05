import React, { useState } from "react";
import {
  Link,
  Lock,
  Cpu,
  Key,
  Database,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Wifi,
  Coins,
  Layers,
} from "lucide-react";

/**
 * 1. Blockchain Flow Diagram: Blocks linked by Cryptographic Hashes
 */
export const BlockchainFlowDiagram: React.FC = () => {
  const [activeBlock, setActiveBlock] = useState<number>(2);

  const blocks = [
    {
      index: 101,
      title: "Block #101",
      prevHash: "0000a4f...9bc",
      hash: "0000c82...1ea",
      txCount: 2480,
      miner: "Foundry USA",
      status: "Finalized",
    },
    {
      index: 102,
      title: "Block #102",
      prevHash: "0000c82...1ea",
      hash: "00003b7...d49",
      txCount: 2912,
      miner: "AntPool",
      status: "Finalized",
    },
    {
      index: 103,
      title: "Block #103 (Active)",
      prevHash: "00003b7...d49",
      hash: "000091f...f20",
      txCount: 3105,
      miner: "F2Pool",
      status: "Latest Block",
    },
  ];

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-slate-950/70 p-4 sm:p-6 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Interactive Architecture</span>
          <h4 className="font-heading text-sm font-bold text-white">Cryptographic Blockchain Chain Link Mechanism</h4>
        </div>
        <span className="text-[11px] text-slate-400">Click any block to inspect cryptographic headers</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {blocks.map((b, i) => {
          const isSelected = activeBlock === i;
          return (
            <div
              key={b.index}
              onClick={() => setActiveBlock(i)}
              className={`group relative cursor-pointer rounded-xl border p-4 transition-all ${
                isSelected
                  ? "border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-500/20"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{b.title}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    b.status === "Latest Block"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {b.status}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Prev Hash:</span>
                  <span className="text-cyan-300">{b.prevHash}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Block Hash:</span>
                  <span className="text-emerald-300 font-bold">{b.hash}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Transactions:</span>
                  <span className="text-slate-200">{b.txCount.toLocaleString()} txs</span>
                </div>
              </div>

              {i < 2 && (
                <div className="hidden md:flex absolute -right-3.5 top-1/2 -mt-2 z-10 h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-slate-950">
                  <ArrowRight className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg bg-cyan-950/40 p-3 border border-cyan-500/20 text-xs text-cyan-200/90 flex items-center gap-2">
        <Lock className="h-4 w-4 text-cyan-400 shrink-0" />
        <span>
          <strong>Why it's immutable:</strong> Notice how Block #103's <code>prevHash</code> strictly matches Block #102's{" "}
          <code>hash</code>. Changing a single comma in Block #101 recalculates its hash, breaking the entire chain forward.
        </span>
      </div>
    </div>
  );
};

/**
 * 2. Transaction Lifecycle Diagram
 */
export const TransactionLifecycleDiagram: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Initiate & Sign",
      desc: "Sender uses Private Key to generate a unique cryptographic digital signature.",
      icon: Key,
    },
    {
      num: "02",
      title: "Broadcast to Mempool",
      desc: "Signed transaction is propagated across peer-to-peer nodes into the memory pool.",
      icon: Wifi,
    },
    {
      num: "03",
      title: "Consensus Validation",
      desc: "Validators/miners verify nonces, account balances, and signature validity.",
      icon: Cpu,
    },
    {
      num: "04",
      title: "Ledger Finality",
      desc: "Transaction is bundled into a block and permanently inscribed onto the chain.",
      icon: Database,
    },
  ];

  return (
    <div className="rounded-xl border border-violet-500/20 bg-slate-950/70 p-4 sm:p-6 backdrop-blur-md">
      <div className="mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">State Transition</span>
        <h4 className="font-heading text-sm font-bold text-white">4-Step Transaction Execution Lifecycle</h4>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <div key={st.num} className="relative rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-mono text-xs font-bold text-slate-500">{st.num}</span>
              </div>
              <h5 className="mt-3 text-xs font-bold text-white">{st.title}</h5>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{st.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 3. Proof of Work vs Proof of Stake Comparison Diagram
 */
export const PowVsPosDiagram: React.FC = () => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 sm:p-6 backdrop-blur-md">
      <div className="mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Consensus Mechanics</span>
        <h4 className="font-heading text-sm font-bold text-white">Proof of Work (PoW) vs Proof of Stake (PoS)</h4>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* PoW */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300">
              Proof of Work (PoW)
            </span>
            <span className="text-xs font-mono text-slate-400">e.g. Bitcoin (BTC)</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Mechanism:</strong> Specialized ASIC miners expend physical electrical energy solving SHA-256 puzzles.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Security:</strong> Rooted in the laws of thermodynamics and unforgeable hardware computational cost.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Pros & Cons:</strong> Extreme censorship resistance, but slower block finality and high power consumption.</span>
            </li>
          </ul>
        </div>

        {/* PoS */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/10 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-xs font-bold text-cyan-300">
              Proof of Stake (PoS)
            </span>
            <span className="text-xs font-mono text-slate-400">e.g. Ethereum, Solana</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Mechanism:</strong> Validators bond cryptocurrency (e.g. 32 ETH) as collateral to propose blocks.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Security:</strong> Economic penalties ('slashing') burn staked capital if a validator attempts fraud.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Pros & Cons:</strong> 99.95% energy reduction, faster throughput, yields for holders; higher complexity.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
