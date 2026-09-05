import { describe, it, expect } from 'vitest';
import { FHIRService } from '../fhirService';
import { ClinicalReport, Patient } from '../../types/medical';

describe('FHIRService', () => {
  const mockPatient: Patient = {
    id: 'pat-101',
    patientId: 'MRN-77492',
    name: 'Eleanor Vance',
    dateOfBirth: '1970-04-12',
    age: 55,
    sex: 'Female',
    phone: '+1 555-0199',
    bloodGroup: 'O+',
    allergies: [],
    conditions: [],
    medications: [],
    symptoms: [],
    history: [],
    reports: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  };

  const mockReport: ClinicalReport = {
    id: 'rep-202',
    patientId: 'pat-101',
    reportName: 'Complete Blood Count',
    reportType: 'CBC',
    date: '2026-02-15',
    facility: {
      name: 'Central Diagnostic Lab',
      address: '100 Health Way'
    },
    doctorName: 'Dr. Gregory House',
    documentId: 'doc-303',
    sourceDocument: 'cbc_report.pdf',
    verificationSummary: {
      total: 2,
      verified: 2,
      needsReview: 0,
      rejected: 0
    },
    tests: [
      {
        id: 'test-1',
        testName: 'Hemoglobin',
        category: 'HEMATOLOGY',
        value: '11.2',
        numericValue: 11.2,
        unit: 'g/dL',
        referenceRange: {
          low: 13.0,
          high: 17.0,
          unit: 'g/dL',
          rawText: '13.0 - 17.0',
          sourceSpecific: true,
          isAvailable: true
        },
        status: 'LOW',
        date: '2026-02-15',
        provenance: {
          sourceDocument: 'cbc_report.pdf',
          page: 1,
          section: 'Hematology',
          originalText: 'Hemoglobin: 11.2 g/dL [13.0 - 17.0]',
          extractionMethod: 'OCR',
          confidence: 98,
          timestamp: '2026-02-15T10:00:00Z'
        },
        verification: {
          status: 'VERIFIED',
          verifiedBy: 'Dr. House'
        }
      },
      {
        id: 'test-2',
        testName: 'WBC Count',
        category: 'HEMATOLOGY',
        value: '7.2',
        numericValue: 7.2,
        unit: 'x10^3/µL',
        referenceRange: {
          low: 4.5,
          high: 11.0,
          unit: 'x10^3/µL',
          rawText: '4.5 - 11.0',
          sourceSpecific: true,
          isAvailable: true
        },
        status: 'NORMAL',
        date: '2026-02-15',
        provenance: {
          sourceDocument: 'cbc_report.pdf',
          page: 1,
          section: 'Hematology',
          originalText: 'WBC: 7.2 [4.5 - 11.0]',
          extractionMethod: 'OCR',
          confidence: 96,
          timestamp: '2026-02-15T10:00:00Z'
        },
        verification: {
          status: 'VERIFIED'
        }
      }
    ],
    observations: ['Microcytic hypochromic red cell indices noted.']
  };

  it('should export to a valid HL7 FHIR R4 collection Bundle', () => {
    const bundle = FHIRService.exportToFHIR(mockReport, mockPatient);

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('collection');
    expect(bundle.entry.length).toBe(4); // Patient + DiagnosticReport + 2 Observations

    // Patient Resource Check
    const patientResource = bundle.entry[0].resource;
    expect(patientResource.resourceType).toBe('Patient');
    expect(patientResource.name[0].text).toBe('Eleanor Vance');
    expect(patientResource.gender).toBe('female');

    // DiagnosticReport Resource Check
    const reportResource = bundle.entry[1].resource;
    expect(reportResource.resourceType).toBe('DiagnosticReport');
    expect(reportResource.code.text).toBe('Complete Blood Count');
    expect(reportResource.result.length).toBe(2);

    // Observation Resource Checks
    const hgbObs = bundle.entry[2].resource;
    expect(hgbObs.resourceType).toBe('Observation');
    expect(hgbObs.code.text).toBe('Hemoglobin');
    expect(hgbObs.valueQuantity.value).toBe(11.2);
    expect(hgbObs.interpretation[0].coding[0].code).toBe('L');
    expect(hgbObs.referenceRange[0].low.value).toBe(13.0);
    expect(hgbObs.referenceRange[0].high.value).toBe(17.0);

    const wbcObs = bundle.entry[3].resource;
    expect(wbcObs.code.text).toBe('WBC Count');
    expect(wbcObs.interpretation[0].coding[0].code).toBe('N');
  });
});
