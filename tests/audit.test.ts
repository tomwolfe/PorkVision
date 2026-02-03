import { describe, it, expect } from 'vitest';
import { detectEconomicImpactRedFlags } from '../lib/audit/economic-red-flags';

describe('Economic Impact Red Flags Detection', () => {
  it('should detect committee chair district allocations', () => {
    const billText = `The sum of $500,000 is hereby allocated to the district of Representative Johnson for infrastructure improvements during fiscal year 2024.`;
    
    const redFlags = detectEconomicImpactRedFlags(billText);
    const chairDistrictFlag = redFlags.find(flag => flag.type === 'Committee Chair District Allocation');
    
    expect(chairDistrictFlag).toBeDefined();
    expect(chairDistrictFlag?.severity).toBe('high');
    expect(chairDistrictFlag?.description).toContain('$500,000');
  });

  it('should detect no-bid contract provisions', () => {
    const billText = `This contract shall be awarded on a sole source basis without competitive bidding due to emergency circumstances.`;
    
    const redFlags = detectEconomicImpactRedFlags(billText);
    const noBidFlag = redFlags.find(flag => flag.type === 'No-Bid Contract Provision');
    
    expect(noBidFlag).toBeDefined();
    expect(noBidFlag?.severity).toBe('high');
    expect(noBidFlag?.description).toContain('sole source');
  });

  it('should detect revolving door provisions', () => {
    const billText = `Former employees of the agency shall be eligible for consulting contracts within two years of leaving service.`;
    
    const redFlags = detectEconomicImpactRedFlags(billText);
    const revolvingDoorFlag = redFlags.find(flag => flag.type === 'Revolving Door Provision');
    
    expect(revolvingDoorFlag).toBeDefined();
    expect(revolvingDoorFlag?.severity).toBe('medium');
  });

  it('should detect specific entity funding (earmarks)', () => {
    const billText = `Funds specifically designated for Acme Corporation for the development of new technology systems.`;
    
    const redFlags = detectEconomicImpactRedFlags(billText);
    const earmarkFlag = redFlags.find(flag => flag.type === 'Specific Entity Funding');
    
    expect(earmarkFlag).toBeDefined();
    expect(earmarkFlag?.severity).toBe('medium');
  });

  it('should detect vague language that could hide pork', () => {
    const billText = `Administrative costs and miscellaneous expenses as determined by the department head.`;
    
    const redFlags = detectEconomicImpactRedFlags(billText);
    const vagueLanguageFlag = redFlags.find(flag => flag.type === 'Vague Language');
    
    expect(vagueLanguageFlag).toBeDefined();
    expect(vagueLanguageFlag?.severity).toBe('low');
  });

  it('should return empty array for text without red flags', () => {
    const billText = `This act shall establish general guidelines for environmental protection in the state.`;
    
    const redFlags = detectEconomicImpactRedFlags(billText);
    
    expect(redFlags).toHaveLength(0);
  });

  it('should detect multiple red flags in the same text', () => {
    const billText = `The sum of $1,000,000 is hereby allocated to the district of Senator Smith. 
                     This contract shall be awarded on a sole source basis without competition.
                     Former officials may receive consulting fees.`;
    
    const redFlags = detectEconomicImpactRedFlags(billText);
    
    expect(redFlags).toHaveLength(2); // Should find both district allocation and no-bid contract
    expect(redFlags.some(flag => flag.type === 'Committee Chair District Allocation')).toBe(true);
    expect(redFlags.some(flag => flag.type === 'No-Bid Contract Provision')).toBe(true);
  });
});