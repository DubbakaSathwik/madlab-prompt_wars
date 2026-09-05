import { describe, it, expect } from 'vitest';
import { TemplateService, DEFAULT_TEMPLATES } from '../templateService';
import { Patient, ClinicalReport, LabResult } from '../../types/medical';

describe('TemplateService', () => {
  const dummyPatient: Patient = {
    id: 'pat-tmpl-test',
    patientId: 'MRN-445566',
    name: 'Sarah Connor',
    dateOfBirth: '1984-02-28',
    age: 42,
    sex: 'Female',
    bloodGroup: 'O Positive',
    allergies: [],
    conditions: [],
    medications: [],
    symptoms: [],
    history: [],
    reports: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  };

  const createDummyTest = (id: string, name: string, status: 'VERIFIED' | 'NEEDS_REVIEW' | 'LOW_CONFIDENCE', isAmbiguous = false): LabResult => ({
    id,
    testName: name,
    category: 'BIOCHEMISTRY',
    value: 120,
    numericValue: 120,
    unit: 'mg/dL',
    referenceRange: { low: 70, high: 99, unit: 'mg/dL', rawText: '70 - 99 mg/dL', sourceSpecific: true, isAvailable: true },
    status: 'HIGH',
    date: '2026-03-15',
    ambiguityDetected: isAmbiguous,
    provenance: {
      sourceDocument: 'Report.pdf',
      page: 1,
      section: 'Chemistry',
      originalText: `${name}: 120`,
      extractionMethod: 'OCR',
      confidence: 90,
      timestamp: '2026-03-15T10:00:00Z'
    },
    verification: { status }
  });

  const createDummyReport = (tests: LabResult[]): ClinicalReport => ({
    id: 'rep-test-01',
    patientId: 'pat-tmpl-test',
    reportName: 'Complete Metabolic Panel',
    reportType: 'METABOLIC_PANEL',
    date: '2026-03-15',
    facility: {
      name: 'St. Jude Clinical Pathology Institute',
      director: 'Dr. Robert Sterling, MD'
    },
    doctorName: 'Dr. Elizabeth Shaw, MD',
    documentId: 'DOC-8899',
    sourceDocument: 'CMP_Report.pdf',
    tests,
    observations: ['Patient demonstrates elevated glucose levels.'],
    verificationSummary: {
      total: tests.length,
      verified: tests.filter(t => t.verification.status === 'VERIFIED').length,
      needsReview: tests.filter(t => t.verification.status === 'NEEDS_REVIEW').length,
      rejected: 0
    }
  });

  describe('DEFAULT_TEMPLATES registry', () => {
    it('provides valid accredited lab templates', () => {
      expect(DEFAULT_TEMPLATES.length).toBeGreaterThanOrEqual(2);

      const medlab = DEFAULT_TEMPLATES.find(t => t.id === 'tmpl-medlab-official');
      expect(medlab).toBeDefined();
      expect(medlab?.name).toContain('MedLab Diagnostics');
      expect(medlab?.fields.length).toBeGreaterThan(5);

      const stJude = DEFAULT_TEMPLATES.find(t => t.id === 'tmpl-st-jude-hospital');
      expect(stJude).toBeDefined();
      expect(stJude?.category).toBe('HOSPITAL');
    });

    it('contains valid field coordinates within 0 to 100 boundaries', () => {
      DEFAULT_TEMPLATES.forEach(template => {
        template.fields.forEach(field => {
          expect(field.x).toBeGreaterThanOrEqual(0);
          expect(field.x).toBeLessThanOrEqual(100);
          expect(field.y).toBeGreaterThanOrEqual(0);
          expect(field.y).toBeLessThanOrEqual(100);
          expect(field.placeholder).toMatch(/^\{\{.*\}\}$/);
        });
      });
    });
  });

  describe('analyzeTemplate()', () => {
    it('returns candidate regions with high confidence and valid suggested coordinates', () => {
      const proposals = TemplateService.analyzeTemplate('custom-lab-layout.pdf');
      expect(proposals.length).toBeGreaterThanOrEqual(4);

      proposals.forEach(p => {
        expect(p.confidence).toBeGreaterThan(80);
        expect(p.suggestedX).toBeGreaterThanOrEqual(0);
        expect(p.suggestedY).toBeGreaterThanOrEqual(0);
        expect(p.placeholder).toMatch(/^\{\{.*\}\}$/);
      });

      const nameProposal = proposals.find(p => p.placeholder === '{{PATIENT_NAME}}');
      expect(nameProposal).toBeDefined();
      expect(nameProposal?.suggestedX).toBe(8);
    });
  });

  describe('resolveValue()', () => {
    it('resolves patient demographic placeholders correctly', () => {
      expect(TemplateService.resolveValue('{{PATIENT_NAME}}', dummyPatient)).toBe('Sarah Connor');
      expect(TemplateService.resolveValue('{{PATIENT_ID}}', dummyPatient)).toBe('MRN-445566');
      expect(TemplateService.resolveValue('{{AGE}}', dummyPatient)).toBe('42 Yrs');
      expect(TemplateService.resolveValue('{{SEX}}', dummyPatient)).toBe('Female');
      expect(TemplateService.resolveValue('{{AGE}} / {{SEX}}', dummyPatient)).toBe('42 Yrs / Female');
      expect(TemplateService.resolveValue('{{BLOOD_GROUP}}', dummyPatient)).toBe('O Positive');
    });

    it('handles fallback for missing blood group', () => {
      const patientWithoutBlood: Patient = { ...dummyPatient, bloodGroup: undefined };
      expect(TemplateService.resolveValue('{{BLOOD_GROUP}}', patientWithoutBlood)).toBe('Not Documented');
    });

    it('resolves clinical report placeholders correctly', () => {
      const report = createDummyReport([createDummyTest('t1', 'Glucose', 'VERIFIED')]);

      expect(TemplateService.resolveValue('{{REPORT_DATE}}', dummyPatient, report)).toBe('2026-03-15');
      expect(TemplateService.resolveValue('{{REPORT_NUMBER}}', dummyPatient, report)).toBe('DOC-8899');
      expect(TemplateService.resolveValue('{{DOCTOR_NAME}}', dummyPatient, report)).toBe('Dr. Elizabeth Shaw, MD');
      expect(TemplateService.resolveValue('{{LAB_NAME}}', dummyPatient, report)).toBe('St. Jude Clinical Pathology Institute');
      expect(TemplateService.resolveValue('{{SIGNATURE}}', dummyPatient, report)).toBe('Dr. Robert Sterling, MD');
      expect(TemplateService.resolveValue('{{OBSERVATIONS}}', dummyPatient, report)).toContain('elevated glucose levels');
    });

    it('returns literal placeholder for unknown tokens', () => {
      expect(TemplateService.resolveValue('{{UNKNOWN_CUSTOM_TAG}}', dummyPatient)).toBe('{{UNKNOWN_CUSTOM_TAG}}');
    });
  });

  describe('getReportStatus()', () => {
    it('returns DRAFT status when no report is provided', () => {
      const result = TemplateService.getReportStatus(undefined);
      expect(result.status).toBe('DRAFT');
      expect(result.unverifiedCount).toBe(0);
      expect(result.message).toContain('Draft');
    });

    it('returns NEEDS_REVIEW status when any test requires clinician review', () => {
      const tests = [
        createDummyTest('t1', 'Hemoglobin', 'VERIFIED'),
        createDummyTest('t2', 'Platelets', 'NEEDS_REVIEW')
      ];
      const report = createDummyReport(tests);

      const result = TemplateService.getReportStatus(report);
      expect(result.status).toBe('NEEDS_REVIEW');
      expect(result.unverifiedCount).toBe(1);
      expect(result.message).toContain('1 value(s) in this document require clinician verification');
    });

    it('returns NEEDS_REVIEW status when any test has ambiguity detected', () => {
      const tests = [
        createDummyTest('t1', 'Hemoglobin', 'VERIFIED', true)
      ];
      const report = createDummyReport(tests);

      const result = TemplateService.getReportStatus(report);
      expect(result.status).toBe('NEEDS_REVIEW');
      expect(result.unverifiedCount).toBe(1);
    });

    it('returns FINAL_PREVIEW status when all tests are confirmed verified', () => {
      const tests = [
        createDummyTest('t1', 'Hemoglobin', 'VERIFIED'),
        createDummyTest('t2', 'White Blood Cells', 'VERIFIED')
      ];
      const report = createDummyReport(tests);

      const result = TemplateService.getReportStatus(report);
      expect(result.status).toBe('FINAL_PREVIEW');
      expect(result.unverifiedCount).toBe(0);
      expect(result.message).toContain('human-verified and certified');
    });

    it('returns AI_EXTRACTED status when tests are not all verified but none flagged needs review', () => {
      const tests = [
        createDummyTest('t1', 'Hemoglobin', 'LOW_CONFIDENCE')
      ];
      const report = createDummyReport(tests);

      const result = TemplateService.getReportStatus(report);
      expect(result.status).toBe('AI_EXTRACTED');
      expect(result.unverifiedCount).toBe(0);
      expect(result.message).toContain('AI-extracted data populated');
    });
  });
});
