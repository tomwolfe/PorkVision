"use client";

import { useState, useEffect } from "react";
import { Key, Save, AlertCircle } from "lucide-react";

export default function ApiKeyInput() {
  const [apiKey, setApiKey] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("gemini_api_key", apiKey);
    setIsSaved(true);
    // Notify user or close modal
  };

  return (
    <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl max-w-md w-full">
      <div className="flex items-center gap-3 mb-4">
        <Key className="text-amber-500" size={24} />
        <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-100">
          Neural Connection
        </h2>
      </div>
      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
        Establish a secure link to Gemini 3 Flash. Your key is stored locally
        and never touches our servers.
      </p>
      <div className="relative group">
        <input
          type={isVisible ? "text" : "password"}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="ENTER API KEY..."
          className="w-full bg-black border-2 border-zinc-800 focus:border-amber-500 outline-none p-4 text-amber-500 font-mono transition-all rounded"
        />
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          {isVisible ? "HIDE" : "SHOW"}
        </button>
      </div>
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSave}
          className="flex-1 bg-amber-600 hover:bg-amber-500 text-black font-black py-3 rounded flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Save size={18} />
          {isSaved ? "UPDATE CONNECTION" : "INITIALIZE"}
        </button>
      </div>
      {isSaved && (
        <div className="mt-4 flex items-center gap-2 text-green-500 text-xs font-bold uppercase">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Connection Active
        </div>
      )}
    </div>
  );
}
