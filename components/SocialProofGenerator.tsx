"use client";

import React, { useRef } from "react";
import { Download, Share2 } from "lucide-react";

interface SocialProofGeneratorProps {
  porkPercentage: number;
  billName: string;
}

export const SocialProofGenerator: React.FC<SocialProofGeneratorProps> = ({ porkPercentage, billName }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const downloadSvg = () => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `pork-audit-${billName.toLowerCase().replace(/\s+/g, "-")}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Social Proof Generator</h3>
        <button 
          onClick={downloadSvg}
          className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <Download size={12} />
          Export Badge
        </button>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-8 flex items-center justify-center">
        <svg 
          ref={svgRef}
          width="400" 
          height="200" 
          viewBox="0 0 400 200" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto max-w-sm"
        >
          <rect width="400" height="200" fill="black"/>
          <rect x="1" y="1" width="398" height="198" stroke="#27272a" strokeWidth="2"/>
          
          <text x="20" y="40" fill="#71717a" fontFamily="monospace" fontSize="12" fontWeight="bold" letterSpacing="2">
            PORKVISION AUDIT v3.0
          </text>
          
          <text x="20" y="80" fill="white" fontFamily="sans-serif" fontSize="24" fontWeight="900" style={{ textTransform: "uppercase" }}>
            {billName.length > 25 ? billName.substring(0, 22) + "..." : billName}
          </text>
          
          <text x="20" y="120" fill="#dc2626" fontFamily="sans-serif" fontSize="48" fontWeight="900">
            {porkPercentage}% PORK
          </text>
          
          <rect x="20" y="140" width="360" height="10" fill="#18181b"/>
          <rect x="20" y="140" width={360 * (porkPercentage / 100)} height="10" fill="#dc2626">
             <animate attributeName="width" from="0" to={360 * (porkPercentage / 100)} dur="1s" fill="freeze" />
          </rect>
          
          <text x="20" y="180" fill="#52525b" fontFamily="monospace" fontSize="10" fontWeight="bold">
            FORENSIC CLASSIFICATION: {porkPercentage > 50 ? "CRITICAL INTEREST CAPTURE" : "MODERATE LOBBYIST INFLUENCE"}
          </text>
        </svg>
      </div>
      
      <p className="text-[10px] text-zinc-600 text-center font-medium leading-relaxed italic">
        "Transparent governance starts with visual proof. Share this audit to hold your local council accountable."
      </p>
    </div>
  );
};
