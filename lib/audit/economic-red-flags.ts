/**
 * Detects economic impact red flags in bill text, specifically looking for high-risk allocations
 */

export interface RedFlag {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  triggerClause: string;
}

/**
 * Checks for economic impact red flags in bill text
 */
export function detectEconomicImpactRedFlags(billText: string): RedFlag[] {
  const redFlags: RedFlag[] = [];
  
  // Look for committee chair district allocations
  const chairDistrictPatterns = [
    /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s+(?:is )?(?:hereby )?allocated?\s+(?:to|for)\s+(?:the\s+)?(?:district|constituency)\s+(?:of\s+)?(?:representative|senator)?\s*(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|\[[^\]]*\])/gi,
    /appropriation\s+of\s+\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s+(?:to|for)\s+(?:the\s+)?(?:district|constituency)\s+(?:of\s+)?(?:representative|senator)?\s*(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|\[[^\]]*\])/gi,
    /funds?\s+(?:of\s+)?\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s+(?:are\s+)?(?:directed|allocated|assigned)\s+(?:to|for)\s+(?:the\s+)?(?:district|constituency)\s+(?:of\s+)?(?:representative|senator)?\s*(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|\[[^\]]*\])/gi,
    /committee chair\s+(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|\[[^\]]*\])\s+(?:receives?|gets?|obtains?)\s+funding\s+of\s+\$(\d+(?:,\d{3})*(?:\.\d{2})?)/gi,
  ];
  
  for (const pattern of chairDistrictPatterns) {
    let match;
    while ((match = pattern.exec(billText)) !== null) {
      redFlags.push({
        type: 'Committee Chair District Allocation',
        description: `Potential allocation of $${match[1]} to district of committee chair or legislator`,
        severity: 'high',
        triggerClause: match[0].substring(0, 100) + '...'
      });
    }
  }
  
  // Look for no-bid contracts or sole-source provisions
  const noBidPatterns = [
    /sole source/i,
    /no competitive bidding/i,
    /without competition/i,
    /waiver.*competitive.*bid/i,
    /emergency procurement/i,
  ];
  
  for (const pattern of noBidPatterns) {
    let match;
    while ((match = pattern.exec(billText)) !== null) {
      redFlags.push({
        type: 'No-Bid Contract Provision',
        description: `Found potential no-bid contract language: "${match[0]}"`,
        severity: 'high',
        triggerClause: match[0].substring(0, 100) + '...'
      });
    }
  }
  
  // Look for revolving door provisions (former officials getting contracts)
  const revolvingDoorPatterns = [
    /former (?:employee|official|staff member).*shall be eligible for/i,
    /retired.*may receive.*contract/i,
    /past (?:member|official|employee).*entitled to/i,
  ];
  
  for (const pattern of revolvingDoorPatterns) {
    let match;
    while ((match = pattern.exec(billText)) !== null) {
      redFlags.push({
        type: 'Revolving Door Provision',
        description: `Potential revolving door provision: "${match[0]}"`,
        severity: 'medium',
        triggerClause: match[0].substring(0, 100) + '...'
      });
    }
  }
  
  // Look for earmarks or specific entity funding
  const earmarkPatterns = [
    /specifically designated for (?!the state|education|health|transportation)/i,
    /funds allocated to (?!general fund|state agencies)/i,
    /appropriated directly to (?!state department)/i,
  ];
  
  for (const pattern of earmarkPatterns) {
    let match;
    while ((match = pattern.exec(billText)) !== null) {
      redFlags.push({
        type: 'Specific Entity Funding',
        description: `Potential earmark or specific entity funding: "${match[0]}"`,
        severity: 'medium',
        triggerClause: match[0].substring(0, 100) + '...'
      });
    }
  }
  
  // Look for vague language that could hide pork
  const vagueLanguagePatterns = [
    /other purposes as determined by/i,
    /miscellaneous expenses/i,
    /administrative costs/i,
    /consulting services/i,
    /study and evaluation/i,
  ];
  
  for (const pattern of vagueLanguagePatterns) {
    let match;
    while ((match = pattern.exec(billText)) !== null) {
      redFlags.push({
        type: 'Vague Language',
        description: `Potentially vague language that could hide undisclosed spending: "${match[0]}"`,
        severity: 'low',
        triggerClause: match[0].substring(0, 100) + '...'
      });
    }
  }
  
  return redFlags;
}