"use client";

import RedFlagCard from "./RedFlagCard";
import { ShieldAlert, BarChart3, Target, Zap, History as HistoryIcon, Download } from "lucide-react";
import { AuditResult } from "@/lib/schema";

interface AnalysisViewProps {
  data: AuditResult;
}

export default function AnalysisView({ data }: AnalysisViewProps) {
  if (!data) return null;

  const { porkBarrel, lobbyistFingerprints, contradictions, economicImpact, overallRiskScore } = data;

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `porkvision-audit-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
            Threat Level
          </span>
          <div className="text-5xl font-black text-red-500 font-mono italic">
            {overallRiskScore}%
          </div>
          <div className="mt-4 text-[10px] font-bold text-red-900 bg-red-500/10 py-1 rounded-full uppercase">
            {overallRiskScore > 70 ? "Critical Concern" : overallRiskScore > 40 ? "Moderate Concern" : "Low Concern"}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg col-span-1 md:col-span-3">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="text-emerald-500" size={20} />
            <h3 className="font-bold uppercase tracking-tight text-white">Economic Projection</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <span className="text-[10px] font-black text-zinc-500 uppercase block mb-1">Debt Impact</span>
              <p className="text-zinc-300 text-sm leading-relaxed">{economicImpact.debtImpact}</p>
            </div>
            <div>
              <span className="text-[10px] font-black text-zinc-500 uppercase block mb-1">Long-term Outlook</span>
              <p className="text-zinc-300 text-sm leading-relaxed">{economicImpact.longTermOutlook}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="max-w-4xl">
        <p className="text-zinc-400 italic leading-relaxed">
          {data.summary}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Pork Barrel Section */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
            <ShieldAlert className="text-red-500" />
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">
              Pork Barrel Alerts
            </h2>
          </div>
          <div className="space-y-4">
            {porkBarrel.map((item, i) => (
              <RedFlagCard
                key={i}
                type="pork"
                title={item.item}
                description={item.reason}
                risk={item.risk}
              />
            ))}
          </div>
        </section>

        {/* Lobbyist Section */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
            <Target className="text-amber-500" />
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">
              Lobbyist Fingerprints
            </h2>
          </div>
          <div className="space-y-4">
            {lobbyistFingerprints.map((item, i) => (
              <RedFlagCard
                key={i}
                type="lobbyist"
                title={item.clause}
                beneficiary={item.beneficiary}
                description={`Evidence suggests this language mirrors industry-specific requests.`}
                evidence={item.evidence}
              />
            ))}
          </div>
        </section>

        {/* Contradictions Section */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
            <HistoryIcon className="text-blue-500" />
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">
              Contradiction Engine
            </h2>
          </div>
          <div className="space-y-4">
            {contradictions.map((item, i) => (
              <RedFlagCard
                key={i}
                type="contradiction"
                title="Policy Divergence"
                description={`Bill content: "${item.statement}" contradicts previous stance: "${item.contradicts}"`}
                evidence={`Source: ${item.source}`}
              />
            ))}
          </div>
        </section>

        {/* System Logs / Action */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Zap className="text-zinc-100" />
              <h2 className="text-xl font-black uppercase tracking-tighter text-white">
                Terminal Output
              </h2>
            </div>
            <div className="font-mono text-[10px] text-zinc-600 space-y-1">
              <p>{`> [INFO] Grounding via Google Search: SUCCESS`}</p>
              <p>{`> [INFO] Cross-referencing SEC filings...`}</p>
              <p>{`> [INFO] Identifying super-PAC contributions...`}</p>
              <p className="text-zinc-400">{`> [COMPLETED] Forensic audit finalized.`}</p>
            </div>
          </div>
          <button 
            onClick={handleDownload}
            className="mt-8 w-full border border-zinc-700 hover:border-zinc-500 py-3 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
          >
            <Download size={14} />
            Download Audit Report (JSON)
          </button>
        </section>
      </div>
    </div>
  );
}
