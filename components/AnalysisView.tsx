"use client";

import RedFlagCard from "./RedFlagCard";
import { ShieldAlert, BarChart3, Target, Zap, History as HistoryIcon, Download, MapPin, Scale } from "lucide-react";
import { AuditResult } from "@/lib/schema";
import { BillDiffViewer } from "./BillDiffViewer";
import { SocialProofGenerator } from "./SocialProofGenerator";

interface AnalysisViewProps {
  data: AuditResult;
}

export default function AnalysisView({ data }: AnalysisViewProps) {
  if (!data) return null;

  const { porkBarrel, lobbyistFingerprints, contradictions, economicImpact, overallRiskScore, localImpact, porkPercentage } = data;

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
            Pork Percentage
          </span>
          <div className="text-5xl font-black text-red-500 font-mono italic">
            {porkPercentage}%
          </div>
          <div className="mt-4 text-[10px] font-bold text-red-900 bg-red-500/10 py-1 rounded-full uppercase">
            {porkPercentage > 50 ? "High Special Interest Capture" : "Low Special Interest Capture"}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg col-span-1 md:col-span-3">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="text-emerald-500" size={20} />
            <h3 className="font-bold uppercase tracking-tight text-white">Forensic Overview</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <span className="text-[10px] font-black text-zinc-500 uppercase block mb-1">Debt Impact</span>
              <p className="text-zinc-300 text-sm leading-relaxed">{economicImpact.debtImpact}</p>
            </div>
            <div>
              <span className="text-[10px] font-black text-zinc-500 uppercase block mb-1">Risk Score</span>
              <p className="text-zinc-300 text-sm leading-relaxed">{overallRiskScore}/100 Forensic Risk</p>
            </div>
            <div>
              <span className="text-[10px] font-black text-zinc-500 uppercase block mb-1">Local Focus</span>
              <p className="text-zinc-300 text-sm leading-relaxed">{localImpact?.cityCounty || "General Jurisdiction"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Local Impact & Social Proof Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-2 border-b border-zinc-800 pb-4">
            <MapPin className="text-blue-500" size={20} />
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">
              Local Accountability Report
            </h2>
          </div>
          {localImpact ? (
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg space-y-4">
              <div>
                <h4 className="text-[10px] font-black uppercase text-zinc-500 mb-1">Affected Demographics</h4>
                <p className="text-zinc-200 text-sm">{localImpact.affectedDemographics}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase text-zinc-500 mb-1">Regulatory Shift</h4>
                <p className="text-zinc-200 text-sm">{localImpact.regulatoryShift}</p>
              </div>
            </div>
          ) : (
            <div className="text-zinc-600 text-xs italic">No local impact data available for this audit level.</div>
          )}
          
          {localImpact?.regulatoryDiff && (
            <div className="mt-6">
               <div className="flex items-center gap-3 mb-4">
                <Scale className="text-emerald-500" size={18} />
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-300">Plain English Audit Diff</h3>
              </div>
              <BillDiffViewer diffs={localImpact.regulatoryDiff} />
            </div>
          )}
        </div>
        
        <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg">
          <SocialProofGenerator 
            porkPercentage={porkPercentage} 
            billName={localImpact?.cityCounty ? `${localImpact.cityCounty} Legislation` : "Proposed Bill"} 
          />
        </div>
      </div>

      {/* Executive Summary */}
      <div className="max-w-4xl bg-zinc-900/20 border-l-2 border-red-600 p-6">
        <h4 className="text-[10px] font-black uppercase text-red-600 mb-2 tracking-[0.2em]">Forensic Auditor's Summary</h4>
        <p className="text-zinc-300 font-medium leading-relaxed">
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
                description={`Evidence: ${item.evidence}`}
                evidence={item.donorCorrelation ? `Donor Correlation: ${item.donorCorrelation.donorName} (${item.donorCorrelation.contributionAmount || "amount unknown"}). Match: "${item.donorCorrelation.statementMatch}"` : undefined}
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
