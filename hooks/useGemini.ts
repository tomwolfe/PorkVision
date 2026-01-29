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

    while (attempt <= maxRetries && !success) {
      try {
        const model = getGeminiModel(apiKey);
        const chat = model.startChat();
        
        const isUrl = content.trim().startsWith("http");
        const prompt = `${getAnalysisPrompt(isUrl ? "url" : "text")}\n\nINPUT PAYLOAD:\n${content}`;
        
        const response = await chat.sendMessage(prompt);
        const text = response.response.text();
        
        const validatedResult = extractJson(text, AuditResultSchema);
        setResult(validatedResult);
        success = true;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const isQuotaError = errorMessage.includes("429") || errorMessage.toLowerCase().includes("quota");

        if (isQuotaError && attempt < maxRetries) {
          attempt++;
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`Quota exceeded. Retrying in ${delay}ms... (Attempt ${attempt})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        console.error(err);
        
        if (err instanceof ZodError) {
          setError("AI output failed validation: Schema Mismatch.");
        } else if (err instanceof SyntaxError) {
          setError("AI output failed validation: Malformed Payload.");
        } else {
          if (errorMessage.includes("API_KEY_INVALID")) {
            setError("Invalid API Key. Please check your credentials.");
          } else if (isQuotaError) {
            setError("Neural Link Congestion: You've exceeded your Gemini 3 Flash quota. This model has strict rate limits. Please check your billing plan at ai.google.dev or try again in a few minutes.");
          } else if (errorMessage.includes("fetch failed") || (err instanceof Error && err.name === "TypeError")) {
            setError("Network failure. Please check your internet connection.");
          } else {
            setError(errorMessage || "An error occurred during forensic analysis.");
          }
        }
        break; // Exit loop on non-quota error or after max retries
      }
    }

    setIsAnalyzing(false);
  };

  return { analyze, isAnalyzing, result, error };
}