import { describe, it, expect } from 'vitest';
import { ConflictService } from '../conflictService';
import { Patient, ClinicalReport, LabResult } from '../../types/medical';

describe('ConflictService', () => {
  const createBasePatient = (overrides?: Partial<Patient>): Patient => ({
    id: 'pat-conflict-test',
    patientId: 'MRN-998877',
    name: 'Eleanor Vance',
    dateOfBirth: '1985-04-12',
    age: 41,
    sex: 'Female',
    allergies: [],
    conditions: [],
    medications: [],
    symptoms: [],
    history: [],
    reports: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides
  });

  const createDummyTest = (name: string, value: number | string, unit = 'mg/dL'): LabResult => ({
    id: `tst-${name.toLowerCase().replace(/\s+/g, '-')}`,
    testName: name,
    category: 'BIOCHEMISTRY',
    value,
    numericValue: typeof value === 'number' ? value : parseFloat(value as string) || undefined,
    unit,
    referenceRange: { low: 70, high: 99, unit, rawText: '70 - 99 mg/dL', sourceSpecific: true, isAvailable: true },
    status: 'NORMAL',
    date: '2026-03-15',
    provenance: {
      sourceDocument: 'CBC_Report.pdf',
      page: 1,
      section: 'Chemistry',
      originalText: `${name}: ${value}`,
      extractionMethod: 'OCR',
      confidence: 95,
      timestamp: '2026-03-15T10:00:00Z'
    },
    verification: { status: 'VERIFIED' }
  });

  const createDummyReport = (id: string, date: string, sourceDocument: string, tests: LabResult[]): ClinicalReport => ({
    id,
    patientId: 'pat-conflict-test',
    reportName: 'Metabolic Profile',
    reportType: 'METABOLIC_PANEL',
    date,
    facility: { name: 'Metro Diagnostics' },
    documentId: `DOC-${id}`,
    sourceDocument,
    tests,
    verificationSummary: { total: tests.length, verified: tests.length, needsReview: 0, rejected: 0 }
  });

  it('returns empty array when patient has no allergies or reports', () => {
    const patient = createBasePatient();
    const conflicts = ConflictService.detectConflicts(patient);
    expect(conflicts).toHaveLength(0);
  });

  it('returns empty array when patient is null or undefined', () => {
    // @ts-expect-error Testing invalid input safety
    expect(ConflictService.detectConflicts(null)).toEqual([]);
    // @ts-expect-error Testing invalid input safety
    expect(ConflictService.detectConflicts(undefined)).toEqual([]);
  });

  it('detects direct medication vs allergy contradiction', () => {
    const patient = createBasePatient({
      allergies: [
        {
          id: 'alg-1',
          substance: 'Ciprofloxacin',
          severity: 'SEVERE',
          source: 'PATIENT_PROVIDED',
          verified: true,
          reaction: 'Anaphylaxis',
          dateNoted: '2024-05-10'
        }
      ],
      medications: [
        {
          id: 'med-1',
          name: 'Ciprofloxacin HCL',
          dosage: '500mg',
          frequency: 'BID',
          route: 'Oral',
          source: 'PATIENT_PROVIDED',
          active: true,
          startDate: '2026-03-10'
        }
      ]
    });

    const conflicts = ConflictService.detectConflicts(patient);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].conflictType).toBe('ALLERGY');
    expect(conflicts[0].title).toContain('Ciprofloxacin');
    expect(conflicts[0].isResolved).toBe(false);
    expect(conflicts[0].valueA).toContain('Ciprofloxacin');
    expect(conflicts[0].valueB).toContain('500mg');
  });

  it('detects cross-reactivity for Penicillin allergy and Amoxicillin prescription', () => {
    const patient = createBasePatient({
      allergies: [
        {
          id: 'alg-pen',
          substance: 'Penicillin',
          severity: 'SEVERE',
          source: 'VERIFIED',
          verified: true,
          reaction: 'Hives, swelling',
          dateNoted: '2023-01-15'
        }
      ],
      medications: [
        {
          id: 'med-amox',
          name: 'Amoxicillin Clavulanate',
          dosage: '875mg',
          frequency: 'Twice daily',
          route: 'Oral',
          prescribingDoctor: 'Dr. Gregory House',
          source: 'DOCUMENT_EXTRACTED',
          active: true,
          startDate: '2026-03-14'
        }
      ]
    });

    const conflicts = ConflictService.detectConflicts(patient);
    expect(conflicts.length).toBeGreaterThanOrEqual(1);
    const penicillinConflict = conflicts.find(c => c.conflictType === 'ALLERGY');
    expect(penicillinConflict).toBeDefined();
    expect(penicillinConflict?.description).toContain('Penicillin');
    expect(penicillinConflict?.description).toContain('Amoxicillin Clavulanate');
    expect(penicillinConflict?.sourceB).toContain('Dr. Gregory House');
  });

  it('detects cross-reactivity for Sulfa allergy and Trimethoprim prescription', () => {
    const patient = createBasePatient({
      allergies: [
        {
          id: 'alg-sulfa',
          substance: 'Sulfa Drugs',
          severity: 'MODERATE',
          source: 'PATIENT_PROVIDED',
          verified: true
        }
      ],
      medications: [
        {
          id: 'med-bactrim',
          name: 'Trimethoprim-Sulfamethoxazole',
          dosage: '160/800mg',
          frequency: 'Daily',
          route: 'Oral',
          source: 'PATIENT_PROVIDED',
          active: true
        }
      ]
    });

    const conflicts = ConflictService.detectConflicts(patient);
    expect(conflicts.some(c => c.conflictType === 'ALLERGY')).toBe(true);
  });

  it('ignores safe medications that do not trigger allergy alerts', () => {
    const patient = createBasePatient({
      allergies: [
        {
          id: 'alg-peanut',
          substance: 'Peanuts',
          severity: 'SEVERE',
          source: 'PATIENT_PROVIDED',
          verified: true
        }
      ],
      medications: [
        {
          id: 'med-tylenol',
          name: 'Acetaminophen',
          dosage: '500mg',
          frequency: 'PRN',
          route: 'Oral',
          source: 'PATIENT_PROVIDED',
          active: true
        }
      ]
    });

    const conflicts = ConflictService.detectConflicts(patient);
    expect(conflicts).toHaveLength(0);
  });

  it('detects divergent lab test values on the same date across distinct reports', () => {
    const testDocA = createDummyTest('Fasting Blood Glucose', 95, 'mg/dL');
    const testDocB = createDummyTest('Fasting Blood Glucose', 142, 'mg/dL');

    const reportA = createDummyReport('rep-1', '2026-03-15', 'Morning_Lab.pdf', [testDocA]);
    const reportB = createDummyReport('rep-2', '2026-03-15', 'Hospital_Panel.pdf', [testDocB]);

    const patient = createBasePatient({
      reports: [reportA, reportB]
    });

    const conflicts = ConflictService.detectConflicts(patient);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].conflictType).toBe('TEST_VALUE');
    expect(conflicts[0].title).toContain('Fasting Blood Glucose');
    expect(conflicts[0].valueA).toBe('95 mg/dL');
    expect(conflicts[0].valueB).toBe('142 mg/dL');
    expect(conflicts[0].sourceA).toBe('Morning_Lab.pdf');
    expect(conflicts[0].sourceB).toBe('Hospital_Panel.pdf');
  });

  it('does not flag divergent values when tests are conducted on different dates', () => {
    const testDay1 = createDummyTest('Hemoglobin', 13.5, 'g/dL');
    const testDay2 = createDummyTest('Hemoglobin', 14.1, 'g/dL');

    const reportA = createDummyReport('rep-1', '2026-02-10', 'Feb_CBC.pdf', [testDay1]);
    const reportB = createDummyReport('rep-2', '2026-03-10', 'Mar_CBC.pdf', [testDay2]);

    const patient = createBasePatient({
      reports: [reportA, reportB]
    });

    const conflicts = ConflictService.detectConflicts(patient);
    expect(conflicts).toHaveLength(0);
  });

  it('does not flag identical values on the same date', () => {
    const testDocA = createDummyTest('Platelets', 250, '10^3/uL');
    const testDocB = createDummyTest('Platelets', 250, '10^3/uL');

    const reportA = createDummyReport('rep-1', '2026-03-15', 'DocA.pdf', [testDocA]);
    const reportB = createDummyReport('rep-2', '2026-03-15', 'DocB.pdf', [testDocB]);

    const patient = createBasePatient({
      reports: [reportA, reportB]
    });

    const conflicts = ConflictService.detectConflicts(patient);
    expect(conflicts).toHaveLength(0);
  });
});
