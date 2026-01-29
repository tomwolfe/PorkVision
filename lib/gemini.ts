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
    systemInstruction: `You are a non-partisan forensic auditor. Your task is to find hidden spending, special interest favors, and legislative 'pork.' 
    
    CRITICAL: If the user provides a URL, you MUST use the googleSearchRetrieval tool to fetch and read the content of that URL before performing your analysis. Do not hallucinate content for a URL you haven't retrieved.
    
    Use Google Search to cross-reference beneficiaries and lobbyist interests based on technical language in the text. Be cynical, objective, and precise.`,
  });
};

export const getAnalysisPrompt = (type: 'url' | 'text') => {
  const context = type === 'url' 
    ? "The user has provided a URL. First, retrieve the content of this URL using Google Search. Then, analyze the retrieved legislation text."
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
  "overallRiskScore": 0-100
}

Use Google Search to cross-reference beneficiaries and lobbyist interests.
`;
};
