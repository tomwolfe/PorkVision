"use client";

import { useState } from "react";
import { Upload, Link as LinkIcon, FileText, Search } from "lucide-react";

interface BillUploaderProps {
  onAnalyze: (content: string) => void;
  isAnalyzing: boolean;
  hasApiKey: boolean;
}

export default function BillUploader({ onAnalyze, isAnalyzing, hasApiKey }: BillUploaderProps) {
  const [inputType, setInputType] = useState<"url" | "text">("url");
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim() || !hasApiKey) return;
    onAnalyze(value);
  };

  return (
    <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-4xl mx-auto border-t-4 border-t-red-600">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
            Legislation Ingestor
          </h2>
          <p className="text-zinc-500 text-xs font-mono uppercase">
            Status: {hasApiKey ? "Ready for deployment" : "Connection Offline"}
          </p>
        </div>
        <div className="flex bg-black p-1 rounded border border-zinc-800">
          <button
            onClick={() => setInputType("url")}
            className={`px-4 py-2 text-xs font-bold uppercase transition-all ${
              inputType === "url" ? "bg-zinc-800 text-white" : "text-zinc-600"
            }`}
          >
            URL
          </button>
          <button
            onClick={() => setInputType("text")}
            className={`px-4 py-2 text-xs font-bold uppercase transition-all ${
              inputType === "text" ? "bg-zinc-800 text-white" : "text-zinc-600"
            }`}
          >
            RAW TEXT
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {inputType === "url" ? (
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
            <input
              type="url"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="HTTPS://WWW.CONGRESS.GOV/BILL/..."
              className="w-full bg-black border border-zinc-800 focus:border-red-600 outline-none p-4 pl-12 text-zinc-100 font-mono transition-all rounded"
            />
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="PASTE FULL LEGISLATION TEXT HERE..."
            className="w-full h-64 bg-black border border-zinc-800 focus:border-red-600 outline-none p-4 text-zinc-100 font-mono transition-all rounded resize-none"
          />
        )}

        <div className="space-y-3">
          <button
            onClick={handleSubmit}
            disabled={isAnalyzing || !value.trim() || !hasApiKey}
            className={`w-full py-4 rounded font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
              isAnalyzing || !hasApiKey
                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                : "bg-red-700 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(185,28,28,0.4)] active:scale-[0.98]"
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
                Processing Manifest...
              </>
            ) : (
              <>
                <Search size={20} />
                Execute Forensic Audit
              </>
            )}
          </button>
          
          {!hasApiKey && (
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">
              SYSTEM OFFLINE: NEURAL LINK REQUIRED
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
