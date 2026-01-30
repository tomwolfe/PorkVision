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
  }),
  overallRiskScore: z.number().min(0).max(100),
  summary: z.string(),
});

export type AuditResult = z.infer<typeof AuditResultSchema>;
