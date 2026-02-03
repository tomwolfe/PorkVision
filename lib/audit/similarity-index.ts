import { z } from 'zod';

/**
 * Model legislation database - contains known templates from organizations like ALEC, ACLU, etc.
 */
export const MODEL_LEGISLATION_DB = {
  alec: [
    {
      id: 'alec-1',
      title: 'Sample ALEC Template',
      text: 'This act shall be known and may be cited as the [State] [Subject] Act of [Year]. The purpose of this act is to [state purpose].',
      category: 'generic-template'
    },
    {
      id: 'alec-2',
      title: 'Standard Appropriations Clause',
      text: 'The sum of $[amount] is hereby appropriated from the [fund name] to the [department/agency] for [specific purpose] during fiscal year [year].',
      category: 'appropriations'
    },
    {
      id: 'alec-3',
      title: 'Regulatory Framework Template',
      text: 'The [department] shall promulgate rules to implement the provisions of this act. Such rules shall include [specific requirements] and [compliance measures].',
      category: 'regulation'
    }
  ],
  aclu: [
    {
      id: 'aclu-1',
      title: 'Civil Rights Protection Template',
      text: 'No person shall be discriminated against on the basis of [protected characteristic] in [context of protection]. This section applies to [covered entities].',
      category: 'civil-rights'
    }
  ],
  // Add more model legislation templates as needed
};

/**
 * Calculates similarity between two text strings using a combination of techniques
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  // Normalize the texts
  const normalized1 = normalizeText(text1);
  const normalized2 = normalizeText(text2);
  
  if (!normalized1 || !normalized2) return 0;
  
  // Calculate cosine similarity on n-grams
  const cosineSim = cosineSimilarity(normalized1, normalized2);
  
  // Calculate Jaccard similarity on word sets
  const jaccardSim = jaccardSimilarity(normalized1, normalized2);
  
  // Calculate longest common substring ratio
  const lcsSim = longestCommonSubstringRatio(normalized1, normalized2);
  
  // Weighted average of all similarity measures
  return Math.round((cosineSim * 0.4 + jaccardSim * 0.4 + lcsSim * 0.2) * 100);
}

/**
 * Normalizes text for comparison by removing common legal boilerplate and standard phrases
 */
function normalizeText(text: string): string {
  // Convert to lowercase and remove extra whitespace
  let normalized = text.toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
    
  // Remove common legal phrases that don't indicate specific influence
  const legalBoilerplate = [
    'be it enacted', 'the general assembly', 'section', 'subsection', 
    'paragraph', 'chapter', 'article', 'title', 'part', 'of the state of',
    'united states', 'fiscal year', 'appropriation', 'hereby declared',
    'it is hereby declared', 'the legislature finds', 'whereas',
    'therefore', 'be it further enacted', 'this act shall take effect'
  ];
  
  legalBoilerplate.forEach(phrase => {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    normalized = normalized.replace(regex, '');
  });
  
  // Remove dollar amounts, dates, and other variable placeholders
  normalized = normalized.replace(/\$\d+(?:,\d{3})*(?:\.\d{2})?/g, '[AMOUNT]');
  normalized = normalized.replace(/\b\d{4}\b/g, '[YEAR]');
  normalized = normalized.replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, '[DATE]');
  
  return normalized.replace(/\s+/g, ' ').trim();
}

/**
 * Calculates cosine similarity between two texts based on n-gram frequency
 */
function cosineSimilarity(text1: string, text2: string): number {
  const n = 3; // trigrams
  const grams1 = getNGrams(text1, n);
  const grams2 = getNGrams(text2, n);
  
  const allGrams = new Set([...Object.keys(grams1), ...Object.keys(grams2)]);
  
  if (allGrams.size === 0) return 0;
  
  const vector1: number[] = [];
  const vector2: number[] = [];
  
  allGrams.forEach(gram => {
    vector1.push(grams1[gram] || 0);
    vector2.push(grams2[gram] || 0);
  });
  
  return cosineVectorSimilarity(vector1, vector2);
}

/**
 * Gets n-grams from text and their frequencies
 */
function getNGrams(text: string, n: number): Record<string, number> {
  const grams: Record<string, number> = {};
  if (text.length < n) return grams;
  
  for (let i = 0; i <= text.length - n; i++) {
    const gram = text.substr(i, n);
    grams[gram] = (grams[gram] || 0) + 1;
  }
  
  return grams;
}

/**
 * Calculates cosine similarity between two vectors
 */
function cosineVectorSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) return 0;
  
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    magnitude1 += vec1[i] * vec1[i];
    magnitude2 += vec2[i] * vec2[i];
  }
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}

/**
 * Calculates Jaccard similarity between two texts based on word overlap
 */
function jaccardSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 0));
  const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 0));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  if (union.size === 0) return 0;
  
  return intersection.size / union.size;
}

/**
 * Calculates similarity based on longest common substring
 */
function longestCommonSubstringRatio(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  
  const matrix: number[][] = Array(text1.length + 1).fill(null)
    .map(() => Array(text2.length + 1).fill(0));
  
  let maxLength = 0;
  
  for (let i = 1; i <= text1.length; i++) {
    for (let j = 1; j <= text2.length; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1;
        maxLength = Math.max(maxLength, matrix[i][j]);
      }
    }
  }
  
  // Return ratio of longest common substring to the shorter text
  const minLength = Math.min(text1.length, text2.length);
  return minLength > 0 ? maxLength / minLength : 0;
}

/**
 * Searches for similarities between bill text and known model legislation
 */
export function findModelLegislationMatches(billText: string, threshold: number = 70): Array<{
  source: string;
  modelId: string;
  title: string;
  category: string;
  similarityScore: number;
  matchedText: string;
  modelText: string;
}> {
  const results: Array<{
    source: string;
    modelId: string;
    title: string;
    category: string;
    similarityScore: number;
    matchedText: string;
    modelText: string;
  }> = [];
  
  // Check against ALEC templates
  for (const template of MODEL_LEGISLATION_DB.alec) {
    const similarity = calculateTextSimilarity(billText, template.text);
    if (similarity >= threshold) {
      results.push({
        source: 'ALEC',
        modelId: template.id,
        title: template.title,
        category: template.category,
        similarityScore: similarity,
        matchedText: billText.substring(0, 200) + '...', // First 200 chars of matching section
        modelText: template.text
      });
    }
  }
  
  // Check against ACLU templates
  for (const template of MODEL_LEGISLATION_DB.aclu) {
    const similarity = calculateTextSimilarity(billText, template.text);
    if (similarity >= threshold) {
      results.push({
        source: 'ACLU',
        modelId: template.id,
        title: template.title,
        category: template.category,
        similarityScore: similarity,
        matchedText: billText.substring(0, 200) + '...',
        modelText: template.text
      });
    }
  }
  
  // Sort by similarity score descending
  return results.sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * Main function to analyze bill text for model legislation similarities
 */
export function analyzeBillForModelLegislation(billText: string): {
  hasModelLegislationMatches: boolean;
  matches: Array<{
    source: string;
    modelId: string;
    title: string;
    category: string;
    similarityScore: number;
    matchedText: string;
    modelText: string;
  }>;
  highestMatchScore: number;
} {
  const matches = findModelLegislationMatches(billText);
  
  return {
    hasModelLegislationMatches: matches.length > 0,
    matches,
    highestMatchScore: matches.length > 0 ? matches[0].similarityScore : 0
  };
}