"use client";

import { useState } from "react";
import { getGeminiModel, ANALYSIS_PROMPT } from "@/lib/gemini";
import { AuditResult, AuditResultSchema } from "@/lib/schema";
import { ZodError } from "zod";

export function useGemini() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractAndValidateJson = (text: string): AuditResult => {
    try {
      // Attempt 1: Direct parse (handling potential markdown wrappers)
      const cleanJson = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      return AuditResultSchema.parse(parsed);
    } catch (e) {
      // Attempt 2: Robust extraction by finding the first { and last }
      try {
        const firstBrace = text.indexOf("{");
        const lastBrace = text.lastIndexOf("}");
        
        if (firstBrace === -1 || lastBrace === -1) {
          throw new Error("No JSON object found in AI response.");
        }
        
        const extractedJson = text.substring(firstBrace, lastBrace + 1);
        const parsed = JSON.parse(extractedJson);
        return AuditResultSchema.parse(parsed);
      } catch (innerError) {
        if (innerError instanceof ZodError) {
          console.error("Schema Mismatch:", innerError.issues);
          throw new Error("AI output failed validation: Schema Mismatch.");
        }
        if (innerError instanceof SyntaxError) {
          throw new Error("AI output failed validation: Malformed JSON.");
        }
        throw innerError;
      }
    }
  };

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
      const prompt = `${ANALYSIS_PROMPT}\n\nLEGISLATION TEXT:\n${content}`;
      
      const response = await chat.sendMessage(prompt);
      const text = response.response.text();
      
      const validatedResult = extractAndValidateJson(text);
      setResult(validatedResult);
    } catch (err: unknown) {
      console.error(err);
      
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      if (errorMessage.includes("API_KEY_INVALID")) {
        setError("Invalid API Key. Please check your credentials.");
      } else if (errorMessage.includes("fetch failed") || (err instanceof Error && err.name === "TypeError")) {
        setError("Network failure. Please check your internet connection.");
      } else {
        setError(errorMessage || "An error occurred during forensic analysis.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analyze, isAnalyzing, result, error };
}
