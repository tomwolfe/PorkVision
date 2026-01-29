import { z } from "zod";

/**
 * Resiliently extracts and validates JSON from a potentially messy AI response.
 * Handles markdown backticks, conversational preamble, and common syntax errors.
 */
export function extractJson<T>(text: string, schema: z.ZodType<T>): T {
  let cleaned = text.trim();

  // Remove markdown code blocks if present
  if (cleaned.includes("```")) {
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      cleaned = match[1];
    }
  }

  // Attempt to find the outermost JSON structure using regex for better resilience against noise
  const jsonRegex = /\{[\s\S]*\}/;
  const match = cleaned.match(jsonRegex);
  
  if (!match) {
    throw new Error("No valid JSON structure detected in AI response.");
  }

  let jsonCandidate = match[0];

  // Attempt to fix common AI artifacts like trailing commas before closing braces/brackets
  jsonCandidate = jsonCandidate
    .replace(/,\s*([}\]])/g, "$1")
    .trim();

  try {
    const parsed = JSON.parse(jsonCandidate);
    try {
      return schema.parse(parsed);
    } catch (zodErr) {
      if (zodErr instanceof z.ZodError) {
        console.error("DEBUG: Zod Validation Failed. Detailed Paths:");
        zodErr.issues.forEach(err => {
          console.error(`- [${err.path.join(".") || "root"}]: ${err.message}`);
        });
        throw zodErr;
      }
      throw zodErr;
    }
  } catch (err) {
    // If it's a SyntaxError, try one more aggressive cleaning for trailing commas in nested structures
    if (err instanceof SyntaxError) {
        try {
            // Very aggressive: replace all trailing commas
            const aggressivelyCleaned = jsonCandidate.replace(/,(\s*[}\]])/g, '$1');
            const parsed = JSON.parse(aggressivelyCleaned);
            return schema.parse(parsed);
        } catch (innerErr) {
            throw err; // Throw original SyntaxError if aggressive cleaning fails
        }
    }
    
    throw err;
  }
}
