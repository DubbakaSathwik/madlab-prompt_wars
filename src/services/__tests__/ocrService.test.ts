import { describe, it, expect } from 'vitest';
import { OCRService } from '../ocrService';

describe('OCRService', () => {
  describe('detectAmbiguity()', () => {
    it('should detect alphabetic "I" or "l" substituted for "1" in decimal numbers', () => {
      const ambigI = OCRService.detectAmbiguity('I1.2');
      expect(ambigI.isAmbiguous).toBe(true);
      expect(ambigI.reason).toContain('alphabetic');

      const ambigl = OCRService.detectAmbiguity('1l.5');
      expect(ambigl.isAmbiguous).toBe(true);

      const ambigPipe = OCRService.detectAmbiguity('|4.2');
      expect(ambigPipe.isAmbiguous).toBe(true);
    });

    it('should detect alphabetic capital "O" substituted for zero in decimal numbers', () => {
      const ambigO = OCRService.detectAmbiguity('O.85');
      expect(ambigO.isAmbiguous).toBe(true);
      expect(ambigO.reason).toContain('zero ambiguity');

      const ambigTrailingO = OCRService.detectAmbiguity('12.O');
      expect(ambigTrailingO.isAmbiguous).toBe(true);
    });

    it('should detect smudge and artifact symbols (#, ?, ~, *) in values', () => {
      const smudgeHash = OCRService.detectAmbiguity('#14.2');
      expect(smudgeHash.isAmbiguous).toBe(true);
      expect(smudgeHash.reason).toContain('Artifact or scan smudge');

      const smudgeTilde = OCRService.detectAmbiguity('~5.4');
      expect(smudgeTilde.isAmbiguous).toBe(true);

      const smudgeAsterisk = OCRService.detectAmbiguity('140*');
      expect(smudgeAsterisk.isAmbiguous).toBe(true);
    });

    it('should confirm clean, standard numeric values as non-ambiguous', () => {
      expect(OCRService.detectAmbiguity('11.2').isAmbiguous).toBe(false);
      expect(OCRService.detectAmbiguity('0.85').isAmbiguous).toBe(false);
      expect(OCRService.detectAmbiguity('140').isAmbiguous).toBe(false);
      expect(OCRService.detectAmbiguity('4.50').isAmbiguous).toBe(false);
      expect(OCRService.detectAmbiguity('218').isAmbiguous).toBe(false);
    });
  });

  describe('parseClinicalText() Patient Detection', () => {
    it('should extract patient name from "Patient Name: Dubbaka Somanarsaiah"', () => {
      const text = `
Apollo Health City Diagnostic Laboratory
Patient Name : Dubbaka Somanarsaiah
Age: 54   Sex: Male   Date: 2026-03-01
Hemoglobin: 14.2 g/dL (Ref: 13.0 - 17.0)
      `;
      const result = OCRService.parseClinicalText(text, 'blood_report.pdf');
      expect(result.patient.name).toBe('Dubbaka Somanarsaiah');
    });

    it('should extract patient name from "Name: Dubbaka Somanarsaiah"', () => {
      const text = `
Vijaya Diagnostic Centre
Name: Dubbaka Somanarsaiah
Doctor: Dr. Ramesh Kumar, MD
Platelet Count: 240 10^3/uL (Ref: 150 - 450)
      `;
      const result = OCRService.parseClinicalText(text, 'lab_scan.pdf');
      expect(result.patient.name).toBe('Dubbaka Somanarsaiah');
    });

    it('should fallback to extracting patient name from filename when text has no label', () => {
      const text = `
Diagnostic Laboratory Services
Hemoglobin: 13.5 g/dL (Ref: 12.0 - 16.0)
      `;
      const result = OCRService.parseClinicalText(text, 'Dubbaka_Somanarsaiah_Report.pdf');
      expect(result.patient.name).toBe('Dubbaka Somanarsaiah');
    });
  });
});
