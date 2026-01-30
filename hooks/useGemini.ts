"use client";

import { useState } from "react";
import { getGeminiModel, getAnalysisPrompt } from "@/lib/gemini";
import { AuditResult, AuditResultSchema } from "@/lib/schema";
import { ZodError } from "zod";

const FORENSIC_ERRORS: Record<string, string> = {
  "429": "Quota Exceeded",
  "500": "AI Engine Malfunction",
  "API_KEY_INVALID": "Authentication Failed",
};

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

    if (!apiKey.startsWith("AIza")) {
      setError("Invalid API Key format detected.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const maxRetries = 2;
    let useTools = true;
    const isUrl = content.trim().startsWith("http");

    const attemptAnalysis = async (attempt: number): Promise<void> => {
      try {
        const chat = getGeminiModel(apiKey, useTools);
        
        let prompt = `${getAnalysisPrompt(isUrl ? "url" : "text", useTools)}\n\nINPUT PAYLOAD:\n${content}`;
        
        if (!useTools && isUrl) {
          prompt = `CRITICAL NOTICE: Search capabilities are CURRENTLY UNAVAILABLE due to system quota limits. You MUST perform this forensic audit using only your internal knowledge base. Do not attempt to use tools.\n\n${prompt}`;
        }

        const response = await chat.sendMessage({ message: prompt });
        const validatedResult = AuditResultSchema.parse(JSON.parse(response.text || "{}"));
        setResult(validatedResult);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const isQuotaError = errorMessage.includes("429") || errorMessage.toLowerCase().includes("quota");

        if (isQuotaError && useTools) {
          console.warn("Search tool quota exceeded. Falling back to base model analysis...");
          useTools = false;
          return attemptAnalysis(attempt); // Immediate retry with tools disabled
        }

        if (isQuotaError && attempt < maxRetries) {
          const delay = Math.pow(2, attempt + 1) * 1000;
          console.warn(`Quota exceeded. Retrying in ${delay}ms... (Attempt ${attempt + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptAnalysis(attempt + 1);
        }

        console.error("Forensic Audit Failure:", err);
        
        if (err instanceof ZodError) {
          setError("AI output failed validation: Schema Mismatch.");
        } else if (err instanceof SyntaxError) {
          setError("AI output failed validation: Malformed Payload.");
        } else {
          let mappedError = errorMessage;
          
          if (errorMessage.includes("API_KEY_INVALID")) {
            mappedError = FORENSIC_ERRORS["API_KEY_INVALID"];
          } else if (isQuotaError) {
            mappedError = FORENSIC_ERRORS["429"];
          } else if (errorMessage.includes("500")) {
            mappedError = FORENSIC_ERRORS["500"];
          }

          if (mappedError === errorMessage) {
            if (errorMessage.includes("fetch failed") || (err instanceof Error && err.name === "TypeError")) {
              setError("Network failure. Please check your internet connection.");
            } else {
              setError(errorMessage || "An error occurred during forensic analysis.");
            }
          } else {
            setError(mappedError);
          }
        }
      }
    };

    await attemptAnalysis(0);
    setIsAnalyzing(false);
  };

  return { analyze, isAnalyzing, result, error };
}