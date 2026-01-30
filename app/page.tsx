"use client";

import { useState, useEffect, useCallback } from "react";
import ApiKeyInput from "@/components/ApiKeyInput";
import BillUploader from "@/components/BillUploader";
import AnalysisView from "@/components/AnalysisView";
import { useGemini } from "@/hooks/useGemini";
import { Search, ShieldCheck, Cpu, Terminal, Circle } from "lucide-react";

export default function Home() {
  const { analyze, isAnalyzing, result, error } = useGemini();
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  const checkApiKey = useCallback(() => {
    const key = localStorage.getItem("gemini_api_key");
    setHasApiKey(!!key && key.trim().length > 0);
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  return (
    <main className="min-h-screen bg-black text-zinc-100 selection:bg-red-500/30">
      {/* HUD Header */}
      <header className="border-b border-zinc-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-2 rounded transform rotate-3 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter leading-none">
                PorkVision
              </h1>
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                Transparent Governance Auditor v3.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <a href="#" className="hover:text-white transition-colors">Active Audits</a>
              <a href="#" className="hover:text-white transition-colors">Forensic database</a>
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
            </nav>
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <Cpu size={14} className={hasApiKey ? "text-emerald-500 animate-pulse" : "text-zinc-600"} />
              Neural Link
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-20">
        {/* Connection Overlay */}
        {showKeyInput && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="relative">
              <button 
                onClick={() => setShowKeyInput(false)}
                className="absolute -top-12 right-0 text-zinc-500 hover:text-white text-xs font-bold uppercase"
              >
                Close Terminal
              </button>
              <ApiKeyInput onStatusChange={checkApiKey} />
            </div>
          </div>
        )}

        {!result && (
          <section className="text-center space-y-8 py-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              <Terminal size={12} className="animate-pulse text-red-600" />
              Awaiting Input Payload
            </div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter max-w-4xl mx-auto leading-[0.9]">
              Expose the <span className="text-red-600 italic">Pork</span> in 
              the System.
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
              Upload legislation to trigger a forensic audit. Our AI engine cross-references 
              bill language with lobbyist white papers and donor records using Google Search grounding.
            </p>
          </section>
        )}

        <section className={result ? "mt-4" : ""}>
          {!result && (
            <BillUploader 
              onAnalyze={analyze} 
              isAnalyzing={isAnalyzing} 
              hasApiKey={hasApiKey}
            />
          )}          
          {error && (
            <div className="mt-8 p-4 bg-red-900/20 border border-red-900 text-red-500 rounded flex items-center gap-3 font-bold uppercase text-xs tracking-widest max-w-4xl mx-auto">
              <Search size={16} />
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-6">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Audit Findings</h2>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-xs font-bold uppercase text-zinc-500 hover:text-white transition-colors underline underline-offset-4"
                >
                  New Analysis
                </button>
              </div>
              <AnalysisView data={result} />
            </div>
          )}
        </section>

        {/* Footer Meta */}
        {!result && (
          <footer className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-zinc-900">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest mb-4 text-zinc-400">Grounding Engine</h4>
              <p className="text-zinc-600 text-xs leading-relaxed">
                Every audit utilizes real-time Google Search retrieval to verify lobbyist 
                interests and corporate sponsorship of specific legislative clauses.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest mb-4 text-zinc-400">Zero-Trust Security</h4>
              <p className="text-zinc-600 text-xs leading-relaxed">
                Your Gemini API Key is stored exclusively in your browser's local storage. 
                PorkVision servers never see or process your credentials.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest mb-4 text-zinc-400">Open Audit</h4>
              <p className="text-zinc-600 text-xs leading-relaxed">
                Built for citizens, journalists, and researchers. No censorship, 
                no partisan bias—just objective data forensic.
              </p>
            </div>
          </footer>
        )}
      </div>
    </main>
  );
}
