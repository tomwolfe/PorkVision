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
      similarityScore: z.number().min(0).max(100),
      sourceModelLegislation: z.string().optional(),
    })
  ),
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
    redFlags: z.array(
      z.object({
        type: z.string(),
        description: z.string(),
        severity: z.enum(["low", "medium", "high"]),
        triggerClause: z.string(),
      })
    ).optional(),
  }),
  overallRiskScore: z.number().min(0).max(100),
  summary: z.string(),
});

export type AuditResult = z.infer<typeof AuditResultSchema>;
