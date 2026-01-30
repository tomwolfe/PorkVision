import { z } from "zod";

/**
 * Resiliently extracts and validates JSON from a potentially messy AI response.
 * Handles markdown backticks, conversational preamble, and common syntax errors.
 */
export function extractJson<T>(text: string, schema: z.ZodType<T>): T {
  // Sanitize non-printable ASCII characters (0-31) that occasionally appear in LLM streams
  let sanitizedText = text.replace(/[\x00-\x1F\x7F]/g, '');

  let cleaned = sanitizedText.trim();

  // Remove markdown code blocks if present
  if (cleaned.includes("```")) {
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      cleaned = match[1];
    }
  }

  // Find all JSON structures using a character-by-character approach to handle nested braces properly
  const matches: string[] = [];
  let braceCount = 0;
  let startIdx = -1;

  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{') {
      if (braceCount === 0) {
        startIdx = i; // Start of a potential JSON object
      }
      braceCount++;
    } else if (cleaned[i] === '}') {
      braceCount--;
      if (braceCount === 0 && startIdx !== -1) {
        // Found a complete JSON object
        matches.push(cleaned.substring(startIdx, i + 1));
      }
    }
  }

  if (matches.length === 0) {
    throw new Error("No valid JSON structure detected in AI response.");
  }

  // If multiple matches exist, attempt to parse the one with the greatest string length
  let jsonCandidate = matches.length === 1
    ? matches[0]
    : matches.reduce((longest, current) =>
      current.length > longest.length ? current : longest
    );

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
