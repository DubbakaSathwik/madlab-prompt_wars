import { describe, it, expect } from 'vitest';
import { ReferenceRangeEngine } from '../referenceRangeEngine';

describe('ReferenceRangeEngine', () => {
  describe('parse()', () => {
    it('should parse standard two-sided intervals correctly', () => {
      const parsed = ReferenceRangeEngine.parse('13.0 - 17.0', 'g/dL');
      expect(parsed.isAvailable).toBe(true);
      expect(parsed.low).toBe(13.0);
      expect(parsed.high).toBe(17.0);
      expect(parsed.unit).toBe('g/dL');
      expect(parsed.isAmbiguous).toBe(false);
      expect(parsed.sourceSpecific).toBe(true);
    });

    it('should handle unicode en-dash and em-dash in intervals', () => {
      const enDash = ReferenceRangeEngine.parse('4.5–11.0', 'x10^3/µL');
      expect(enDash.low).toBe(4.5);
      expect(enDash.high).toBe(11.0);
      expect(enDash.isAmbiguous).toBe(false);

      const emDash = ReferenceRangeEngine.parse('150—450', 'x10^3/µL');
      expect(emDash.low).toBe(150);
      expect(emDash.high).toBe(450);
      expect(emDash.isAmbiguous).toBe(false);
    });

    it('should parse "to" formatted intervals', () => {
      const parsed = ReferenceRangeEngine.parse('70 to 99', 'mg/dL');
      expect(parsed.low).toBe(70);
      expect(parsed.high).toBe(99);
      expect(parsed.isAmbiguous).toBe(false);
    });

    it('should parse upper threshold "<" bounds correctly', () => {
      const parsed = ReferenceRangeEngine.parse('< 150', 'mg/dL');
      expect(parsed.isAvailable).toBe(true);
      expect(parsed.low).toBe(0);
      expect(parsed.high).toBe(150);
      expect(parsed.isAmbiguous).toBe(false);
    });

    it('should parse lower threshold ">" bounds correctly', () => {
      const parsed = ReferenceRangeEngine.parse('> 40', 'mg/dL');
      expect(parsed.isAvailable).toBe(true);
      expect(parsed.low).toBe(40);
      expect(parsed.high).toBeUndefined();
      expect(parsed.isAmbiguous).toBe(false);
    });

    it('should parse lower threshold with plus sign "13+"', () => {
      const parsed = ReferenceRangeEngine.parse('13+', 'g/dL');
      expect(parsed.low).toBe(13);
      expect(parsed.high).toBeUndefined();
      expect(parsed.isAmbiguous).toBe(false);
    });

    it('should handle unavailable or n/a ranges without inventing numbers', () => {
      const notAvail = ReferenceRangeEngine.parse('Not Available');
      expect(notAvail.isAvailable).toBe(false);
      expect(notAvail.low).toBeUndefined();
      expect(notAvail.high).toBeUndefined();

      const na = ReferenceRangeEngine.parse('N/A');
      expect(na.isAvailable).toBe(false);

      const empty = ReferenceRangeEngine.parse('');
      expect(empty.isAvailable).toBe(false);
    });

    it('should flag unstructured or unparsable ranges as isAmbiguous', () => {
      const amb = ReferenceRangeEngine.parse('Variable depending on clinical context');
      expect(amb.isAvailable).toBe(true);
      expect(amb.isAmbiguous).toBe(true);
      expect(amb.low).toBeUndefined();
      expect(amb.high).toBeUndefined();
    });
  });

  describe('evaluate()', () => {
    const normalRange = ReferenceRangeEngine.parse('13.0 - 17.0', 'g/dL');
    const upperLimitRange = ReferenceRangeEngine.parse('< 150', 'mg/dL');
    const lowerLimitRange = ReferenceRangeEngine.parse('> 40', 'mg/dL');

    it('should evaluate values within normal bounds as NORMAL', () => {
      const result = ReferenceRangeEngine.evaluate(15.2, normalRange);
      expect(result.status).toBe('NORMAL');
      expect(result.isAmbiguous).toBe(false);
    });

    it('should evaluate values below lower bound as LOW', () => {
      const result = ReferenceRangeEngine.evaluate(11.2, normalRange);
      expect(result.status).toBe('LOW');
      expect(result.isAmbiguous).toBe(false);
    });

    it('should evaluate values above upper bound as HIGH', () => {
      const result = ReferenceRangeEngine.evaluate(19.5, normalRange);
      expect(result.status).toBe('HIGH');
      expect(result.isAmbiguous).toBe(false);
    });

    it('should evaluate numeric strings correctly', () => {
      const result = ReferenceRangeEngine.evaluate('11.2 g/dL', normalRange);
      expect(result.status).toBe('LOW');
    });

    it('should evaluate upper-limit ranges (< 150)', () => {
      expect(ReferenceRangeEngine.evaluate(120, upperLimitRange).status).toBe('NORMAL');
      expect(ReferenceRangeEngine.evaluate(180, upperLimitRange).status).toBe('HIGH');
    });

    it('should evaluate lower-limit ranges (> 40)', () => {
      expect(ReferenceRangeEngine.evaluate(48, lowerLimitRange).status).toBe('NORMAL');
      expect(ReferenceRangeEngine.evaluate(32, lowerLimitRange).status).toBe('LOW');
    });

    it('should return UNKNOWN for missing or unavailable ranges', () => {
      const unavail = ReferenceRangeEngine.parse('N/A');
      const result = ReferenceRangeEngine.evaluate(15.0, unavail);
      expect(result.status).toBe('UNKNOWN');
      expect(result.notes).toContain('No reference interval');
    });

    it('should return UNKNOWN with isAmbiguous for ambiguous ranges', () => {
      const ambiguousRange = ReferenceRangeEngine.parse('Clinical assessment only');
      const result = ReferenceRangeEngine.evaluate(15.0, ambiguousRange);
      expect(result.status).toBe('UNKNOWN');
      expect(result.isAmbiguous).toBe(true);
    });

    it('should return UNKNOWN for qualitative non-numeric values', () => {
      const result = ReferenceRangeEngine.evaluate('Negative / Non-Reactive', normalRange);
      expect(result.status).toBe('UNKNOWN');
      expect(result.notes).toContain('Non-numeric');
    });
  });
});
