import { GoogleGenAI } from "@google/genai";

export const getGeminiModel = (apiKey: string, useTools: boolean = true) => {
  const client = new GoogleGenAI({ apiKey });
  
  return client.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      tools: useTools ? [
        {
          googleSearch: {},
        },
      ] : [],
      systemInstruction: `You are a non-partisan forensic auditor. Your task is to find hidden spending, special interest favors, and legislative 'pork.' 
    
    ${useTools ? "CRITICAL: If the user provides a URL, you MUST use the googleSearch tool to fetch and read the content of that URL before performing your analysis. Do not hallucinate content for a URL you haven't retrieved." : "Analyze the provided text directly."}
    
    Use your internal knowledge to cross-reference beneficiaries and lobbyist interests based on technical language in the text. Be cynical, objective, and precise.`,
    }
  });
};

export const getAnalysisPrompt = (type: 'url' | 'text', useTools: boolean = true) => {
  const context = type === 'url' 
    ? (useTools 
        ? "The user has provided a URL. First, retrieve the content of this URL using Google Search. Then, analyze the retrieved legislation text."
        : "The user has provided a URL, but Search Grounding is currently disabled. Try to analyze based on your training data or identify if you cannot proceed without the full text.")
    : "Analyze the provided legislation text.";

  return `
${context}
Identify potential red flags, pork-barrel spending, and lobbyist influence.
Output your analysis strictly in the following JSON format:

{
  "porkBarrel": [
    { "item": "string", "reason": "string", "risk": "low" | "medium" | "high" }
  ],
  "lobbyistFingerprints": [
    { "clause": "string", "beneficiary": "string", "evidence": "string" }
  ],
  "contradictions": [
    { "statement": "string", "contradicts": "string", "source": "string" }
  ],
  "economicImpact": {
    "debtImpact": "string",
    "longTermOutlook": "string"
  },
  "overallRiskScore": 0-100,
  "summary": "2-3 sentence high-level overview of the audit findings"
}

${useTools ? "Use Google Search to cross-reference beneficiaries and lobbyist interests." : "Use your internal knowledge to cross-reference beneficiaries and lobbyist interests."}
`;
};