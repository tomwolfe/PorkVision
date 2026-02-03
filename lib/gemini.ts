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
      systemInstruction: `You are a non-partisan forensic auditor specializing in local government transparency (City/County Council level). Your task is to find hidden spending, special interest favors, and legislative 'pork.' 
    
    ${useTools ? "CRITICAL: If the user provides a URL, you MUST use the googleSearch tool to fetch and read the content of that URL before performing your analysis. Do not hallucinate content for a URL you haven't retrieved." : "Analyze the provided text directly."}
    
    Use your search grounding capabilities to cross-reference bill clauses with donor statements and campaign contributions. Look for 'Lobbyist Fingerprints'—specific language that mirrors special interest white papers or donor public statements. 
    
    Focus on:
    1. Local Impact: How this affects city/county residents, specifically regulatory removals or penalty changes.
    2. Donor Correlation: Cross-reference beneficiaries with their public campaign finance data or public statements.
    3. Pork Percentage: Calculate a percentage (0-100) of the bill's content that serves special interests rather than the general public.
    
    Be cynical, objective, and precise.`,
    }
  });
};

export const getAnalysisPrompt = (type: 'url' | 'text', level: 'local' | 'state' = 'local', useTools: boolean = true) => {
  const context = type === 'url' 
    ? (useTools 
        ? `The user has provided a URL for a ${level} level bill. First, retrieve the content of this URL using Google Search. Then, analyze the retrieved legislation text.`
        : `The user has provided a URL for a ${level} level bill, but Search Grounding is currently disabled. Try to analyze based on your training data or identify if you cannot proceed without the full text.`)
    : `Analyze the provided ${level} level legislation text.`;

  return `
${context}
Identify potential red flags, pork-barrel spending, and lobbyist influence.
Output your analysis strictly in the following JSON format:

{
  "porkBarrel": [
    { "item": "string", "reason": "string", "risk": "low" | "medium" | "high" }
  ],
  "lobbyistFingerprints": [
    { 
      "clause": "string", 
      "beneficiary": "string", 
      "evidence": "string",
      "donorCorrelation": {
        "donorName": "string",
        "contributionAmount": "string",
        "statementMatch": "string (quote from public statement or campaign promise)"
      }
    }
  ],
  "localImpact": {
    "cityCounty": "string",
    "affectedDemographics": "string",
    "regulatoryShift": "string (detail any changes in penalties or regulations)"
  },
  "contradictions": [
    { "statement": "string", "contradicts": "string", "source": "string" }
  ],
  "economicImpact": {
    "debtImpact": "string",
    "longTermOutlook": "string"
  },
  "porkPercentage": 0-100,
  "overallRiskScore": 0-100,
  "summary": "2-3 sentence high-level overview of the audit findings"
}

${useTools ? "Use Google Search to cross-reference beneficiaries with campaign finance data and lobbyist public statements." : "Use your internal knowledge to cross-reference beneficiaries and lobbyist interests."}
`;
};