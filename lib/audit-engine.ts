import { AuditResult } from "./schema";

/**
 * AuditEngine provides additional forensic analysis logic on top of the raw AI results.
 */
export class AuditEngine {
  /**
   * Calculates a "Pork Percentage" based on identified red flags and beneficiary impact.
   * This is used if the AI doesn't provide it or to verify the AI's calculation.
   */
  static calculatePorkPercentage(result: AuditResult): number {
    if (result.porkPercentage !== undefined) {
      return result.porkPercentage;
    }

    const totalRedFlags = result.porkBarrel.length + result.lobbyistFingerprints.length;
    if (totalRedFlags === 0) return 0;

    // Simple heuristic for demo purposes
    // In a real app, this would be more complex
    const score = (totalRedFlags * 10) + (result.overallRiskScore / 2);
    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Formats the donor correlation data for display.
   */
  static getLobbyistSummary(result: AuditResult) {
    return result.lobbyistFingerprints.map(fingerprint => ({
      beneficiary: fingerprint.beneficiary,
      donor: fingerprint.donorCorrelation?.donorName || "Unknown",
      match: fingerprint.donorCorrelation?.statementMatch || "No direct statement match found"
    }));
  }
}
