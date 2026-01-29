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

    try {
      const model = getGeminiModel(apiKey);
      const chat = model.startChat();
      
      const isUrl = content.trim().startsWith("http");
      const prompt = `${getAnalysisPrompt(isUrl ? "url" : "text")}\n\nINPUT PAYLOAD:\n${content}`;
      
      const response = await chat.sendMessage(prompt);
      const text = response.response.text();
      
      const validatedResult = extractJson(text, AuditResultSchema);
      setResult(validatedResult);
    } catch (err: unknown) {
      console.error(err);
      
      if (err instanceof ZodError) {
        setError("AI output failed validation: Schema Mismatch.");
      } else if (err instanceof SyntaxError) {
        setError("AI output failed validation: Malformed Payload.");
      } else {
        const errorMessage = err instanceof Error ? err.message : String(err);
        
        if (errorMessage.includes("API_KEY_INVALID")) {
          setError("Invalid API Key. Please check your credentials.");
        } else if (errorMessage.includes("fetch failed") || (err instanceof Error && err.name === "TypeError")) {
          setError("Network failure. Please check your internet connection.");
        } else {
          setError(errorMessage || "An error occurred during forensic analysis.");
        }
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analyze, isAnalyzing, result, error };
}
