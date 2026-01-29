"use client";

import { useState } from "react";
import { getGeminiModel, ANALYSIS_PROMPT } from "@/lib/gemini";

export function useGemini() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (content: string) => {
    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) {
      setError("API Key missing. Please connect to the neural network.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const model = getGeminiModel(apiKey);
      
      // For a real app, we'd handle PDF extraction or URL fetching.
      // Here we assume 'content' is the text to analyze.
      const chat = model.startChat();
      const prompt = `${ANALYSIS_PROMPT}\n\nLEGISLATION TEXT:\n${content}`;
      
      const response = await chat.sendMessage(prompt);
      const text = response.response.text();
      
      // Clean the response if it contains markdown code blocks
      const cleanJson = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      
      setResult(parsed);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during forensic analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analyze, isAnalyzing, result, error };
}
