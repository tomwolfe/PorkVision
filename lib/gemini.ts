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

    Your analysis must be grounded in verifiable evidence. Look for 'Shadow Lobbyist' patterns by comparing the bill text against known model legislation from organizations like ALEC, ACLU, etc. Assign similarity scores to indicate how closely the bill matches these templates.

    Focus on detecting 'Hidden Pork' by identifying:
    1. Committee chair district allocations
    2. No-bid contracts or sole-source provisions
    3. Revolving door provisions
    4. Specific entity funding (earmarks)
    5. Vague language that could hide undisclosed spending

    Be cynical, objective, and precise. Every claim must be tied to specific text in the legislation.`,
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
Perform a forensic audit of this legislation focusing on identifying hidden spending, special interest influence, and legislative 'pork'.

SPECIFIC INVESTIGATION AREAS:
1. Shadow Lobbyist Detection: Compare the bill text against known model legislation templates. Look for language patterns similar to ALEC, ACLU, or other model legislation. Assign a similarity score (0-100) and identify the source of model legislation if found.

2. Economic Impact Red Flags: Specifically look for:
   - Allocations to districts of committee chairs or legislators
   - No-bid contracts or sole-source provisions
   - Revolving door arrangements
   - Earmarks or specific entity funding
   - Vague language that could hide undisclosed spending

3. Cross-reference beneficiaries and lobbyist interests using Google Search if available.

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
      "similarityScore": 0-100,
      "sourceModelLegislation": "string (optional)"
    }
  ],
  "contradictions": [
    { "statement": "string", "contradicts": "string", "source": "string" }
  ],
  "economicImpact": {
    "debtImpact": "string",
    "longTermOutlook": "string",
    "redFlags": [
      {
        "type": "string",
        "description": "string",
        "severity": "low" | "medium" | "high",
        "triggerClause": "string"
      }
    ]
  },
  "overallRiskScore": 0-100,
  "summary": "2-3 sentence high-level overview of the audit findings"
}

${useTools ? "Use Google Search to cross-reference beneficiaries and lobbyist interests, and to verify any suspected model legislation matches." : "Use your internal knowledge to cross-reference beneficiaries and lobbyist interests."}
`;
};