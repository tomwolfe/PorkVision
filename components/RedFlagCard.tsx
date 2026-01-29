"use client";

import { AlertTriangle, Fingerprint, History as HistoryIcon, TrendingDown, Info } from "lucide-react";

export type FlagType = "pork" | "lobbyist" | "contradiction" | "economic";

interface RedFlagCardProps {
  type: FlagType;
  title: string;
  description: string;
  risk?: "low" | "medium" | "high";
  evidence?: string;
  beneficiary?: string;
}

export default function RedFlagCard({
  type,
  title,
  description,
  risk,
  evidence,
  beneficiary,
}: RedFlagCardProps) {
  const getIcon = () => {
    switch (type) {
      case "pork":
        return <AlertTriangle className="text-red-500" />;
      case "lobbyist":
        return <Fingerprint className="text-amber-500" />;
      case "contradiction":
        return <HistoryIcon className="text-blue-500" />;
      case "economic":
        return <TrendingDown className="text-emerald-500" />;
      default:
        return <Info />;
    }
  };

  const getRiskColor = () => {
    switch (risk) {
      case "high":
        return "bg-red-500/20 text-red-500 border-red-500/50";
      case "medium":
        return "bg-amber-500/20 text-amber-500 border-amber-500/50";
      case "low":
        return "bg-emerald-500/20 text-emerald-500 border-emerald-500/50";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col gap-4 hover:border-zinc-700 transition-colors group relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black rounded border border-zinc-800 group-hover:border-zinc-700 transition-colors">
            {getIcon()}
          </div>
          <h3 className="font-bold uppercase tracking-tight text-white">{title}</h3>
        </div>
        {risk && (
          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${getRiskColor()}`}>
            {risk} RISK
          </span>
        )}
      </div>

      <p className="text-sm text-zinc-400 leading-relaxed font-medium">
        {description}
      </p>

      {(beneficiary || evidence) && (
        <div className="mt-2 pt-4 border-t border-zinc-800/50 space-y-3">
          {beneficiary && (
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                Primary Beneficiary
              </span>
              <span className="text-xs font-mono text-amber-500 bg-amber-500/5 px-2 py-1 rounded">
                {beneficiary}
              </span>
            </div>
          )}
          {evidence && (
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                Search Evidence (Grounding)
              </span>
              <p className="text-xs italic text-zinc-500 line-clamp-2">
                "{evidence}"
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Decorative scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.02] to-transparent h-[1px] animate-scan" />
    </div>
  );
}
