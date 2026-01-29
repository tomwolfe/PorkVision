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

  // Attempt to find the first '{' and last '}' to isolate the JSON object
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON object found in AI response.");
  }

  let jsonCandidate = cleaned.substring(firstBrace, lastBrace + 1);

  // Attempt to fix common AI artifacts like trailing commas before closing braces/brackets
  jsonCandidate = jsonCandidate
    .replace(/,\s*([}\]])/g, "$1")
    // Fix potential multi-line string issues (though JSON.parse usually handles them if they are escaped)
    .trim();

  try {
    const parsed = JSON.parse(jsonCandidate);
    return schema.parse(parsed);
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw err; // Let the caller handle ZodError specifically
    }
    
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
