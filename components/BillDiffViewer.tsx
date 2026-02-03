"use client";

import React from "react";
import { AlertTriangle, ArrowRight, Shield } from "lucide-react";

interface DiffImpact {
  item: string;
  change: string;
  impact: string;
  risk: "low" | "medium" | "high";
}

interface BillDiffViewerProps {
  diffs: DiffImpact[];
}

export const BillDiffViewer: React.FC<BillDiffViewerProps> = ({ diffs }) => {
  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden font-mono">
      <div className="bg-zinc-900 px-4 py-2 flex items-center justify-between border-b border-zinc-800">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
          <Shield size={12} className="text-red-600" />
          Plain English Audit Diff
        </span>
        <span className="text-[10px] text-zinc-600 uppercase">Forensic Comparison Engine v1.0</span>
      </div>
      <div className="divide-y divide-zinc-900">
        {diffs.map((diff, index) => (
          <div key={index} className="p-4 hover:bg-zinc-900/50 transition-colors group">
            <div className="flex items-start gap-4">
              <div className={`mt-1 p-1 rounded ${
                diff.risk === "high" ? "bg-red-500/10 text-red-500" : 
                diff.risk === "medium" ? "bg-amber-500/10 text-amber-500" : 
                "bg-emerald-500/10 text-emerald-500"
              }`}>
                <AlertTriangle size={14} />
              </div>
              <div className="space-y-2 flex-1">
                <h4 className="text-xs font-black uppercase tracking-tight text-zinc-200">{diff.item}</h4>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-zinc-500 line-through decoration-zinc-700">Previous Version</span>
                  <ArrowRight size={12} className="text-zinc-600" />
                  <span className="text-zinc-100 bg-zinc-800 px-1.5 py-0.5 rounded">{diff.change}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-500 group-hover:text-zinc-400 transition-colors">
                  <span className="text-zinc-300 font-bold uppercase tracking-tighter mr-2">Impact:</span>
                  {diff.impact}
                </p>
              </div>
            </div>
          </div>
        ))}
        {diffs.length === 0 && (
          <div className="p-8 text-center text-zinc-600 text-[10px] uppercase font-bold tracking-widest">
            No significant regulatory shifts detected between versions.
          </div>
        )}
      </div>
    </div>
  );
};
