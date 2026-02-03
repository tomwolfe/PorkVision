import { z } from "zod";

export const AuditResultSchema = z.object({
  porkBarrel: z.array(
    z.object({
      item: z.string(),
      reason: z.string(),
      risk: z.enum(["low", "medium", "high"]),
    })
  ),
  lobbyistFingerprints: z.array(
    z.object({
      clause: z.string(),
      beneficiary: z.string(),
      evidence: z.string(),
      donorCorrelation: z.object({
        donorName: z.string(),
        contributionAmount: z.string().optional(),
        statementMatch: z.string().describe("Public statement from the donor that matches this clause"),
      }).optional(),
    })
  ),
  localImpact: z.object({
    cityCounty: z.string(),
    affectedDemographics: z.string(),
    regulatoryShift: z.string().describe("Specific changes to local penalties or regulations"),
    regulatoryDiff: z.array(z.object({
      item: z.string(),
      change: z.string(),
      impact: z.string(),
      risk: z.enum(["low", "medium", "high"]),
    })).optional().describe("Detailed comparison of regulatory changes"),
  }).optional(),
  contradictions: z.array(
    z.object({
      statement: z.string(),
      contradicts: z.string(),
      source: z.string(),
    })
  ),
  economicImpact: z.object({
    debtImpact: z.string(),
    longTermOutlook: z.string(),
  }),
  porkPercentage: z.number().min(0).max(100),
  overallRiskScore: z.number().min(0).max(100),
  summary: z.string(),
});

export type AuditResult = z.infer<typeof AuditResultSchema>;
