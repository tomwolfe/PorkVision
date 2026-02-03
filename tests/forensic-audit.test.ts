import { describe, it, expect } from 'vitest';
import { AuditResultSchema } from '../lib/schema';
import { AuditEngine } from '../lib/audit-engine';

describe('Forensic Audit Logic', () => {
  const mockAuditResult = {
    porkBarrel: [
      { item: "Section 4.2", reason: "Unrelated spending on private golf course", risk: "high" as const }
    ],
    lobbyistFingerprints: [
      { 
        clause: "Preferential zoning for tech hubs", 
        beneficiary: "BigTech Corp", 
        evidence: "Language matches BigTech white paper verbatim",
        donorCorrelation: {
          donorName: "TechPAC",
          contributionAmount: "$50,000",
          statementMatch: "We need more aggressive zoning for our hubs."
        }
      }
    ],
    localImpact: {
      cityCounty: "Oakland",
      affectedDemographics: "Low-income housing areas",
      regulatoryShift: "Removal of rent control penalties",
      regulatoryDiff: [
        {
          item: "Penalty for overcharging",
          change: "Reduced from $5000 to $500",
          impact: "Deterrence significantly weakened for large landlords",
          risk: "high" as const
        }
      ]
    },
    contradictions: [],
    economicImpact: {
      debtImpact: "Neutral",
      longTermOutlook: "Concentrated wealth accumulation"
    },
    porkPercentage: 45,
    overallRiskScore: 75,
    summary: "This bill favors large tech interests at the expense of local renters."
  };

  it('should validate the updated AuditResultSchema', () => {
    const result = AuditResultSchema.safeParse(mockAuditResult);
    expect(result.success).toBe(true);
  });

  it('should correctly calculate pork percentage if provided', () => {
    const percentage = AuditEngine.calculatePorkPercentage(mockAuditResult);
    expect(percentage).toBe(45);
  });

  it('should fallback to heuristic calculation if pork percentage is missing', () => {
    const { porkPercentage, ...missingPercentage } = mockAuditResult;
    // @ts-ignore - testing fallback
    const percentage = AuditEngine.calculatePorkPercentage(missingPercentage);
    // 2 red flags * 10 + 75 / 2 = 20 + 37.5 = 57.5
    expect(percentage).toBe(57.5);
  });

  it('should correctly extract lobbyist summaries', () => {
    const summary = AuditEngine.getLobbyistSummary(mockAuditResult);
    expect(summary).toHaveLength(1);
    expect(summary[0].donor).toBe("TechPAC");
    expect(summary[0].match).toContain("aggressive zoning");
  });

  it('should handle missing donor correlation gracefully', () => {
    const resultWithNoDonor = { ...mockAuditResult };
    resultWithNoDonor.lobbyistFingerprints[0] = { 
        ...resultWithNoDonor.lobbyistFingerprints[0], 
        donorCorrelation: undefined 
    };
    const summary = AuditEngine.getLobbyistSummary(resultWithNoDonor);
    expect(summary[0].donor).toBe("Unknown");
    expect(summary[0].match).toBe("No direct statement match found");
  });
});
