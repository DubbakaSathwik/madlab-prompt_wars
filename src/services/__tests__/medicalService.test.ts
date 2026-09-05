import '../../testSetup';
import { describe, it, expect, beforeEach } from 'vitest';
import { MedicalService } from '../medicalService';
import { LabResult, Allergy, Condition, Medication } from '../../types/medical';

describe('MedicalService', () => {
  beforeEach(() => {
    localStorage.clear();
    MedicalService.clearAllData();
    MedicalService.init();
  });

  it('should initialize with an empty patient list when localStorage is fresh', () => {
    const patients = MedicalService.getPatients();
    expect(Array.isArray(patients)).toBe(true);
    expect(patients.length).toBe(0);
  });

  it('should create a new patient profile with generated patientId', () => {
    const created = MedicalService.createPatient({
      name: 'James Wilson',
      age: 42,
      sex: 'Male',
      bloodGroup: 'A+'
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('James Wilson');
    expect(created.patientId).toMatch(/^ML-/);
    expect(created.age).toBe(42);
    expect(created.sex).toBe('Male');

    const retrieved = MedicalService.getPatientById(created.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('James Wilson');
  });

  it('should add a clinical report to an existing patient', () => {
    const patient = MedicalService.createPatient({ name: 'Lisa Cuddy', sex: 'Female' });
    const report = MedicalService.addReport(patient.id, {
      reportName: 'Metabolic Panel',
      reportType: 'METABOLIC_PANEL',
      date: '2026-03-01',
      sourceDocument: 'metabolic.pdf',
      documentId: 'doc-meta-1',
      facility: { name: 'Princeton Diagnostics' },
      tests: [
        {
          id: 'test-glucose',
          testName: 'Fasting Blood Glucose',
          category: 'METABOLIC',
          value: '95',
          numericValue: 95,
          unit: 'mg/dL',
          referenceRange: { low: 70, high: 99, unit: 'mg/dL', rawText: '70 - 99', isAvailable: true, sourceSpecific: true },
          status: 'NORMAL',
          date: '2026-03-01',
          provenance: { sourceDocument: 'metabolic.pdf', page: 1, section: 'Metabolic', originalText: 'Glucose: 95', extractionMethod: 'OCR', confidence: 99, timestamp: '2026-03-01T00:00:00Z' },
          verification: { status: 'VERIFIED' }
        }
      ]
    });

    expect(report.id).toBeDefined();
    expect(report.tests.length).toBe(1);

    const updatedPatient = MedicalService.getPatientById(patient.id);
    expect(updatedPatient?.reports.length).toBe(1);
    expect(updatedPatient?.reports[0].reportName).toBe('Metabolic Panel');
  });

  it('should add or update a biomarker test and recalculate verificationSummary', () => {
    const patient = MedicalService.createPatient({ name: 'Robert Chase', sex: 'Male' });
    const report = MedicalService.addReport(patient.id, {
      reportName: 'CBC Panel',
      reportType: 'CBC',
      date: '2026-03-01',
      sourceDocument: 'cbc.pdf',
      documentId: 'doc-cbc-1',
      facility: { name: 'LabCorp' },
      tests: []
    });

    const newTest: LabResult = {
      id: 'test-hgb-new',
      testName: 'Hemoglobin',
      category: 'HEMATOLOGY',
      value: '14.5',
      numericValue: 14.5,
      unit: 'g/dL',
      referenceRange: { low: 13.0, high: 17.0, unit: 'g/dL', rawText: '13.0 - 17.0', isAvailable: true, sourceSpecific: true },
      status: 'NORMAL',
      date: '2026-03-01',
      provenance: { sourceDocument: 'cbc.pdf', page: 1, section: 'CBC', originalText: 'Hgb: 14.5', extractionMethod: 'Manual Entry', confidence: 100, timestamp: '2026-03-01T00:00:00Z' },
      verification: { status: 'VERIFIED' }
    };

    MedicalService.addOrUpdateTest(patient.id, report.id, newTest);

    const updatedPatient = MedicalService.getPatientById(patient.id);
    const updatedReport = updatedPatient?.reports.find(r => r.id === report.id);
    expect(updatedReport?.tests.length).toBe(1);
    expect(updatedReport?.verificationSummary.total).toBe(1);
    expect(updatedReport?.verificationSummary.verified).toBe(1);
    expect(updatedReport?.verificationSummary.needsReview).toBe(0);
  });

  it('should delete an uploaded report and record an audit trail event', () => {
    const patient = MedicalService.createPatient({ name: 'Allison Cameron', sex: 'Female' });
    const report = MedicalService.addReport(patient.id, {
      reportName: 'Lipid Profile',
      reportType: 'LIPID_PROFILE',
      date: '2026-03-01',
      sourceDocument: 'lipid.pdf',
      documentId: 'doc-lipid-1',
      facility: { name: 'Quest Diagnostics' },
      tests: []
    });

    expect(patient.reports.length).toBe(1);

    MedicalService.deleteReport(patient.id, report.id);

    const updatedPatient = MedicalService.getPatientById(patient.id);
    expect(updatedPatient?.reports.length).toBe(0);

    const auditTrail = MedicalService.getAuditTrail();
    const deleteEvent = auditTrail.find(e => e.action === 'Report Deleted');
    expect(deleteEvent).toBeDefined();
    expect(deleteEvent?.details).toContain('Lipid Profile');
  });

  it('should add allergies, conditions, and medications to a patient record', () => {
    const patient = MedicalService.createPatient({ name: 'Eric Foreman', sex: 'Male' });

    const allergy: Allergy = {
      id: 'alg-1',
      substance: 'Penicillin',
      reaction: 'Hives',
      severity: 'SEVERE',
      source: 'PATIENT_PROVIDED',
      verified: true
    };
    MedicalService.addAllergy(patient.id, allergy);

    const condition: Condition = {
      id: 'cnd-1',
      name: 'Hypertension',
      status: 'ACTIVE',
      source: 'PATIENT_PROVIDED'
    };
    MedicalService.addCondition(patient.id, condition);

    const medication: Medication = {
      id: 'med-1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      route: 'Oral',
      source: 'PATIENT_PROVIDED',
      active: true
    };
    MedicalService.addMedication(patient.id, medication);

    const updated = MedicalService.getPatientById(patient.id);
    expect(updated?.allergies.length).toBe(1);
    expect(updated?.allergies[0].substance).toBe('Penicillin');
    expect(updated?.conditions.length).toBe(1);
    expect(updated?.conditions[0].name).toBe('Hypertension');
    expect(updated?.medications.length).toBe(1);
    expect(updated?.medications[0].name).toBe('Lisinopril');
  });

  it('should export structured Medical JSON root format for a patient', () => {
    const patient = MedicalService.createPatient({ name: 'Chris Taub', sex: 'Male' });
    MedicalService.addReport(patient.id, {
      reportName: 'Electrolytes',
      reportType: 'OTHER',
      date: '2026-03-01',
      sourceDocument: 'lytes.pdf',
      documentId: 'doc-lytes-1',
      facility: { name: 'Metro Lab' },
      tests: [
        {
          id: 'test-na',
          testName: 'Sodium',
          category: 'BIOCHEMISTRY',
          value: '138',
          numericValue: 138,
          unit: 'mmol/L',
          referenceRange: { low: 135, high: 145, unit: 'mmol/L', rawText: '135 - 145', isAvailable: true, sourceSpecific: true },
          status: 'NORMAL',
          date: '2026-03-01',
          provenance: { sourceDocument: 'lytes.pdf', page: 1, section: 'Biochem', originalText: 'Sodium: 138', extractionMethod: 'OCR', confidence: 97, timestamp: '2026-03-01T00:00:00Z' },
          verification: { status: 'VERIFIED' }
        }
      ]
    });

    const exported = MedicalService.exportMedicalJSON(patient.id);
    expect(exported).not.toBeNull();
    expect(exported?.patient.name).toBe('Chris Taub');
    expect(exported?.reports.length).toBe(1);
    expect(exported?.reports[0].tests.length).toBe(1);
    expect(exported?.reports[0].tests[0].name).toBe('Sodium');
  });
});
