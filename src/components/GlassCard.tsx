import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "cyan" | "violet" | "emerald" | "amber" | "none";
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  glow = "none",
  hoverEffect = true,
}) => {
  const glowStyles = {
    cyan: "border-cyan-500/25 shadow-lg shadow-cyan-500/10 hover:border-cyan-400/50 hover:shadow-cyan-500/20",
    violet: "border-violet-500/25 shadow-lg shadow-violet-500/10 hover:border-violet-400/50 hover:shadow-violet-500/20",
    emerald: "border-emerald-500/25 shadow-lg shadow-emerald-500/10 hover:border-emerald-400/50 hover:shadow-emerald-500/20",
    amber: "border-amber-500/25 shadow-lg shadow-amber-500/10 hover:border-amber-400/50 hover:shadow-amber-500/20",
    none: "border-slate-800/80 hover:border-slate-700/80",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0d1226]/80 to-[#080b18]/90 backdrop-blur-xl border ${
        glowStyles[glow]
      } ${hoverEffect ? "transition-all duration-300 hover:-translate-y-1" : ""} ${className}`}
    >
      {/* Subtle top reflective rim light */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />
      {children}
    </div>
  );
};
