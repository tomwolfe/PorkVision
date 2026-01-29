import { GoogleGenerativeAI, Tool } from "@google/generative-ai";

export const getGeminiModel = (apiKey: string) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const tools: Tool[] = [
    {
      googleSearchRetrieval: {},
    },
  ];
  
  return genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    tools,
    systemInstruction: "You are a non-partisan forensic auditor. Your task is to find hidden spending, special interest favors, and legislative 'pork.' Use Google Search to find who benefits from specific technical language in the text. Be cynical, objective, and precise.",
  });
};

export const ANALYSIS_PROMPT = `
Analyze the provided legislation text and identify potential red flags. 
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
  "overallRiskScore": 0-100
}

Use Google Search to cross-reference beneficiaries and lobbyist interests.
`;
