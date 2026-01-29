"use client";

import { useState } from "react";
import { getGeminiModel, getAnalysisPrompt } from "@/lib/gemini";
import { AuditResult, AuditResultSchema } from "@/lib/schema";
import { extractJson } from "@/lib/parser";
import { ZodError } from "zod";

export function useGemini() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (content: string) => {
    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) {
      setError("API Key missing. Please set your API key in the settings.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const maxRetries = 2;
    let attempt = 0;
    let success = false;
    let useTools = true;

    while (attempt <= maxRetries && !success) {
      try {
        const chat = getGeminiModel(apiKey, useTools);
        
        const isUrl = content.trim().startsWith("http");
        const prompt = `${getAnalysisPrompt(isUrl ? "url" : "text", useTools)}\n\nINPUT PAYLOAD:\n${content}`;
        
        const response = await chat.sendMessage({ message: prompt });
        const text = response.text || "";
        
        const validatedResult = extractJson(text, AuditResultSchema);
        setResult(validatedResult);
        success = true;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const isQuotaError = errorMessage.includes("429") || errorMessage.toLowerCase().includes("quota");

        // If we hit a quota error and we were using tools, try one last time without tools
        if (isQuotaError && useTools) {
          console.warn("Search tool quota exceeded. Falling back to base model analysis...");
          useTools = false;
          // Don't increment attempt here, just retry immediately without tools
          continue;
        }

        if (isQuotaError && attempt < maxRetries) {
          attempt++;
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`Quota exceeded. Retrying in ${delay}ms... (Attempt ${attempt})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        console.error("Forensic Audit Failure:", err);
        
        if (err instanceof ZodError) {
          setError("AI output failed validation: Schema Mismatch.");
        } else if (err instanceof SyntaxError) {
          setError("AI output failed validation: Malformed Payload.");
        } else {
          if (errorMessage.includes("API_KEY_INVALID")) {
            setError("Invalid API Key. Please check your credentials.");
          } else if (isQuotaError) {
            setError("Neural Link Congestion: You've exceeded your Gemini 3 Flash quota or Search Grounding limit. Try again in a few minutes or paste the RAW TEXT instead of a URL.");
          } else if (errorMessage.includes("fetch failed") || (err instanceof Error && err.name === "TypeError")) {
            setError("Network failure. Please check your internet connection.");
          } else {
            setError(errorMessage || "An error occurred during forensic analysis.");
          }
        }
        break; 
      }
    }

    setIsAnalyzing(false);
  };

  return { analyze, isAnalyzing, result, error };
}