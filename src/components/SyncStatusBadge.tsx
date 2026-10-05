import React from "react";
import { SyncStatus } from "../types/crypto";
import { RefreshCw, WifiOff, AlertTriangle, ShieldAlert } from "lucide-react";

interface SyncStatusBadgeProps {
  status: SyncStatus;
  lastUpdated?: string;
  className?: string;
  showTime?: boolean;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  status,
  lastUpdated,
  className = "",
  showTime = true,
}) => {
  switch (status) {
    case "LIVE":
      return (
        <div
          className={`inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-300 shadow-sm ${className}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="tracking-wide">CONNECTED / LIVE</span>
          {showTime && lastUpdated && (
            <span className="text-[10px] text-emerald-400/70 font-mono-numbers">
              • {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
      );

    case "SYNCING":
      return (
        <div
          className={`inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-1 text-xs font-semibold text-cyan-300 shadow-sm ${className}`}
        >
          <RefreshCw className="h-3 w-3 animate-spin text-cyan-400" />
          <span className="tracking-wide">SYNCING...</span>
        </div>
      );

    case "STALE":
      return (
        <div
          className={`inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-950/50 px-2.5 py-1 text-xs font-semibold text-amber-300 shadow-sm ${className}`}
          title="Background sync delayed; showing latest cached telemetry"
        >
          <AlertTriangle className="h-3 w-3 text-amber-400" />
          <span className="tracking-wide">STALE DATA</span>
          {showTime && lastUpdated && (
            <span className="text-[10px] text-amber-400/70 font-mono-numbers">
              • {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
      );

    case "API_ERROR":
      return (
        <div
          className={`inline-flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-950/50 px-2.5 py-1 text-xs font-semibold text-rose-300 shadow-sm ${className}`}
          title="Unable to reach cryptocurrency feeds"
        >
          <ShieldAlert className="h-3 w-3 text-rose-400" />
          <span className="tracking-wide">API ERROR</span>
        </div>
      );

    case "OFFLINE":
      return (
        <div
          className={`inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-slate-400 shadow-sm ${className}`}
          title="No internet connection detected"
        >
          <WifiOff className="h-3 w-3 text-slate-400" />
          <span className="tracking-wide">OFFLINE</span>
        </div>
      );

    default:
      return null;
  }
};
