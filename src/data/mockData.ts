import { Patient, AuditEvent, ReportTemplate } from '../types/medical';

/**
 * SYNTHETIC DEMONSTRATION PATIENTS (Section 41 Validated)
 * Pure synthetic clinical data containing multi-panel longitudinal records,
 * normal/low/high findings, missing reference intervals, OCR review flags,
 * and cross-document conflict discrepancies.
 */
export const DEMO_PATIENTS: Patient[] = [
  {
    id: 'pat-eleanor-vance',
    patientId: 'ML-89421',
    name: 'Eleanor Vance',
    dateOfBirth: '1984-06-15',
    age: 42,
    sex: 'Female',
    bloodGroup: 'A+',
    phone: '(555) 234-8901',
    email: 'e.vance@example-patient.org',
    emergencyContact: 'Thomas Vance (Spouse) - (555) 234-8902',
    allergies: [
      {
        id: 'alg-penicillin',
        substance: 'Penicillin',
        reaction: 'Hives, facial erythema, and bronchospasm',
        severity: 'SEVERE',
        source: 'VERIFIED',
        verified: true,
        dateNoted: '2023-04-10'
      }
    ],
    conditions: [
      {
        id: 'cond-htn',
        name: 'Mild Essential Hypertension',
        status: 'ACTIVE',
        diagnosedDate: '2022-11-05',
        source: 'DOCUMENT_EXTRACTED',
        notes: 'Maintained on Lisinopril 10mg daily'
      }
    ],
    medications: [
      {
        id: 'med-lisinopril',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily in morning',
        route: 'Oral',
        startDate: '2023-01-15',
        prescribingDoctor: 'Dr. Sarah Jenkins, MD',
        source: 'DOCUMENT_EXTRACTED',
        active: true
      }
    ],
    symptoms: [
      {
        id: 'sym-fatigue',
        description: 'Occasional mild mid-afternoon fatigue',
        source: 'PATIENT_PROVIDED'
      }
    ],
    history: [
      {
        id: 'hist-appendectomy',
        description: 'Appendectomy (Laparoscopic) - Uncomplicated recovery',
        date: '2015-08-20',
        category: 'SURGICAL',
        source: 'PATIENT_PROVIDED'
      }
    ],
    createdAt: '2025-11-20T08:00:00Z',
    updatedAt: '2026-03-01T14:30:00Z',
    reports: [
      // 1. CBC Report (2026-03-01) - Demonstrates Normal, Low, Needs Review, and Missing Range
      {
        id: 'rep-cbc-2026',
        patientId: 'pat-eleanor-vance',
        reportName: 'Complete Blood Count (CBC) with Differential',
        reportType: 'CBC',
        date: '2026-03-01',
        facility: {
          name: 'Metropolitan Clinical Pathology Laboratory',
          address: '450 Healthcare Blvd, Suite 200, Metro City',
          phone: '(555) 901-4400',
          license: 'CLIA #05D9981244',
          director: 'Robert Sterling, MD, FCAP'
        },
        doctorName: 'Dr. Kenneth Reed, MD',
        documentId: 'REP-CBC-8812',
        sourceDocument: 'CBC_Report_01Mar2026.pdf',
        tests: [
          {
            id: 'tst-wbc',
            testName: 'White Blood Cell Count (WBC)',
            canonicalCode: '6690-2',
            category: 'HEMATOLOGY',
            value: 6.5,
            numericValue: 6.5,
            unit: '10^3/uL',
            referenceRange: {
              low: 4.5,
              high: 11.0,
              unit: '10^3/uL',
              rawText: '4.5 - 11.0 10^3/uL',
              sourceSpecific: true,
              isAvailable: true
            },
            status: 'NORMAL',
            date: '2026-03-01',
            provenance: {
              sourceDocument: 'CBC_Report_01Mar2026.pdf',
              page: 1,
              section: 'Hematology Automated Cell Count',
              originalText: 'WBC: 6.5 x10^3/uL (Ref: 4.5 - 11.0)',
              extractionMethod: 'MedLens OCR Engine v2.0',
              confidence: 99,
              timestamp: '2026-03-01T10:14:00Z'
            },
            verification: { status: 'VERIFIED', verifiedBy: 'Dr. Kenneth Reed, MD' }
          },
          {
            id: 'tst-hgb',
            testName: 'Hemoglobin',
            canonicalCode: '718-7',
            category: 'HEMATOLOGY',
            value: 11.2,
            numericValue: 11.2,
            unit: 'g/dL',
            referenceRange: {
              low: 12.0,
              high: 16.0,
              unit: 'g/dL',
              rawText: '12.0 - 16.0 g/dL',
              sourceSpecific: true,
              isAvailable: true
            },
            status: 'LOW',
            date: '2026-03-01',
            provenance: {
              sourceDocument: 'CBC_Report_01Mar2026.pdf',
              page: 1,
              section: 'Hematology Automated Cell Count',
              originalText: 'Hemoglobin: 11.2 L g/dL (Ref: 12.0 - 16.0)',
              extractionMethod: 'MedLens OCR Engine v2.0',
              confidence: 98,
              timestamp: '2026-03-01T10:14:00Z'
            },
            verification: { status: 'VERIFIED', verifiedBy: 'Dr. Kenneth Reed, MD' }
          },
          {
            id: 'tst-hct',
            testName: 'Hematocrit',
            canonicalCode: '4544-3',
            category: 'HEMATOLOGY',
            value: 34.0,
            numericValue: 34.0,
            unit: '%',
            referenceRange: {
              low: 37.0,
              high: 48.0,
              unit: '%',
              rawText: '37.0 - 48.0 %',
              sourceSpecific: true,
              isAvailable: true
            },
            status: 'LOW',
            date: '2026-03-01',
            provenance: {
              sourceDocument: 'CBC_Report_01Mar2026.pdf',
              page: 1,
              section: 'Hematology Automated Cell Count',
              originalText: 'Hematocrit: 34.0 L % (Ref: 37.0 - 48.0)',
              extractionMethod: 'MedLens OCR Engine v2.0',
              confidence: 97,
              timestamp: '2026-03-01T10:14:00Z'
            },
            verification: { status: 'VERIFIED', verifiedBy: 'Dr. Kenneth Reed, MD' }
          },
          {
            id: 'tst-plt',
            testName: 'Platelet Count',
            canonicalCode: '777-3',
            category: 'HEMATOLOGY',
            value: 142,
            numericValue: 142,
            unit: '10^3/uL',
            referenceRange: {
              low: 150,
              high: 450,
              unit: '10^3/uL',
              rawText: '150 - 450 10^3/uL',
              sourceSpecific: true,
              isAvailable: true
            },
            status: 'LOW',
            date: '2026-03-01',
            ambiguityDetected: true,
            ambiguityReason: 'Digit smudge artifact on character "4" in printed matrix table',
            provenance: {
              sourceDocument: 'CBC_Report_01Mar2026.pdf',
              page: 1,
              section: 'Hematology Automated Cell Count',
              originalText: 'Platelet Count: I42* 10^3/uL (Ref: 150 - 450)',
              extractionMethod: 'MedLens OCR Engine v2.0',
              confidence: 72,
              timestamp: '2026-03-01T10:14:00Z'
            },
            verification: { status: 'NEEDS_REVIEW' }
          },
          {
            id: 'tst-mpv',
            testName: 'Mean Platelet Volume (MPV)',
            canonicalCode: '32623-1',
            category: 'HEMATOLOGY',
            value: 10.4,
            numericValue: 10.4,
            unit: 'fL',
            referenceRange: {
              unit: 'fL',
              rawText: 'Not Provided',
              sourceSpecific: false,
              isAvailable: false
            },
            status: 'UNKNOWN',
            date: '2026-03-01',
            provenance: {
              sourceDocument: 'CBC_Report_01Mar2026.pdf',
              page: 1,
              section: 'Platelet Indices',
              originalText: 'MPV: 10.4 fL [Ref Range: None Printed]',
              extractionMethod: 'MedLens OCR Engine v2.0',
              confidence: 95,
              timestamp: '2026-03-01T10:14:00Z'
            },
            verification: { status: 'VERIFIED', verifiedBy: 'Dr. Kenneth Reed, MD' }
          }
        ],
        observations: [
          'Mild microcytic normochromic anemia indicated by Hemoglobin 11.2 g/dL and Hematocrit 34.0%.',
          'Borderline thrombocytopenia (Platelets 142 x10^3/uL) flagged with OCR smudge caveat for clinician confirmation.'
        ],
        verificationSummary: { total: 5, verified: 4, needsReview: 1, rejected: 0 }
      },

      // 2. LFT Report (2026-02-15) - Demonstrates Elevated Biomarkers (High Results)
      {
        id: 'rep-lft-2026',
        patientId: 'pat-eleanor-vance',
        reportName: 'Comprehensive Liver Function Panel (LFT)',
        reportType: 'LFT',
        date: '2026-02-15',
        facility: {
          name: 'St. Jude Clinical Pathology Institute',
          address: '1200 University Way, Medical District',
          phone: '(555) 332-1100',
          director: 'Dr. Elizabeth Shaw, MD'
        },
        doctorName: 'Dr. Kenneth Reed, MD',
        documentId: 'REP-LFT-4029',
        sourceDocument: 'LFT_Panel_15Feb2026.pdf',
        tests: [
          {
            id: 'tst-alt',
            testName: 'Alanine Aminotransferase (ALT)',
            canonicalCode: '1742-6',
            category: 'BIOCHEMISTRY',
            value: 68,
            numericValue: 68,
            unit: 'U/L',
            referenceRange: {
              low: 7,
              high: 56,
              unit: 'U/L',
              rawText: '7 - 56 U/L',
              sourceSpecific: true,
              isAvailable: true
            },
            status: 'HIGH',
            date: '2026-02-15',
            provenance: {
              sourceDocument: 'LFT_Panel_15Feb2026.pdf',
              page: 1,
              section: 'Hepatic Enzymes',
              originalText: 'ALT: 68 H U/L (7 - 56)',
              extractionMethod: 'MedLens OCR Engine v2.0',
              confidence: 99,
              timestamp: '2026-02-15T09:30:00Z'
            },
            verification: { status: 'VERIFIED', verifiedBy: 'Dr. Elizabeth Shaw, MD' }
          },
          {
            id: 'tst-ast',
            testName: 'Aspartate Aminotransferase (AST)',
            canonicalCode: '1920-8',
            category: 'BIOCHEMISTRY',
            value: 42,
            numericValue: 42,
            unit: 'U/L',
            referenceRange: {
              low: 10,
              high: 40,
              unit: 'U/L',
              rawText: '10 - 40 U/L',
              sourceSpecific: true,
              isAvailable: true
            },
            status: 'HIGH',
            date: '2026-02-15',
            provenance: {
              sourceDocument: 'LFT_Panel_15Feb2026.pdf',
              page: 1,
              section: 'Hepatic Enzymes',
              originalText: 'AST: 42 H U/L (10 - 40)',
              extractionMethod: 'MedLens OCR Engine v2.0',
              confidence: 98,
              timestamp: '2026-02-15T09:30:00Z'
            },
            verification: { status: 'VERIFIED', verifiedBy: 'Dr. Elizabeth Shaw, MD' }
          },
          {
            id: 'tst-tbil',
            testName: 'Total Bilirubin',
            canonicalCode: '1975-2',
            category: 'BIOCHEMISTRY',
            value: 0.8,
            numericValue: 0.8,
            unit: 'mg/dL',
            referenceRange: {
              low: 0.2,
              high: 1.2,
              unit: 'mg/dL',
              rawText: '0.2 - 1.2 mg/dL',
              sourceSpecific: true,
              isAvailable: true
            },
            status: 'NORMAL',
            date: '2026-02-15',
            provenance: {
              sourceDocument: 'LFT_Panel_15Feb2026.pdf',
              page: 1,
              section: 'Bile Pigments',
              originalText: 'Total Bilirubin: 0.8 mg/dL (0.2 - 1.2)',
              extractionMethod: 'MedLens OCR Engine v2.0',
              confidence: 99,
              timestamp: '2026-02-15T09:30:00Z'
            },
            verification: { status: 'VERIFIED', verifiedBy: 'Dr. Elizabeth Shaw, MD' }
          },
          {
            id: 'tst-alb',
            testName: 'Albumin',
            canonicalCode: '1751-7',
            category: 'BIOCHEMISTRY',
            value: 4.2,
            numericValue: 4.2,
            unit: 'g/dL',
            referenceRange: {
              low: 3.5,
              high: 5.0,
              unit: 'g/dL',
              rawText: '3.5 - 5.0 g/dL',
              sourceSpecific: true,
              isAvailable: true
            },
            status: 'NORMAL',
            date: '2026-02-15',
            provenance: {
              sourceDocument: 'LFT_Panel_15Feb2026.pdf',
              page: 1,
              section: 'Serum Proteins',
              originalText: 'Albumin: 4.2 g/dL (3.5 - 5.0)',
              extractionMethod: 'MedLens OCR Engine v2.0',
              confidence: 99,
              timestamp: '2026-02-15T09:30:00Z'
            },
            verification: { status: 'VERIFIED', verifiedBy: 'Dr. Elizabeth Shaw, MD' }
          }
        ],
        observations: [
          'Mild transaminase elevation (ALT 68 U/L, AST 42 U/L). Bilirubin and synthetic liver function markers remain normal.'
        ],
        verificationSummary: { total: 4, verified: 4, needsReview: 0, rejected: 0 }
      },

      // 3. Fasting Lipid Profile (2025-11-20) - Demonstrates Baseline & High Total Cholesterol
      {
        id: 'rep-lipid-2025',
        patientId: 'pat-eleanor-vance',
        reportName: 'Fasting Lipid & Cardiovascular Risk Panel',
        reportType: 'LIPID_PROFILE',
        date: '2025-11-20',
        facility: {
          name: 'Metro Health Alliance Ambulatory Laboratory',
          address: '88 River Street, Downtown Health Pavilion',
          director: 'Dr. Kenneth Reed, MD'
        },
        doctorName: 'Dr. Sarah Jenkins, MD',
        documentId: 'REP-LIPID-1102',
        sourceDocument: 'Lipid_Profile_20Nov2025.pdf',
        tests: [
          {
            id: 'tst-chol',
            testName: 'Total Cholesterol',
            canonicalCode: '2093-3',
            category: 'LIPID',
            value: 215,
            numericValue: 215,
            unit: 'mg/dL',
            referenceRange: {
              high: 200,
              unit: 'mg/dL',
              rawText: '< 200 mg/dL',
              sourceSpecific: true,
              isAvailable: true
            },
            status: 'HIGH',
            date: '2025-11-20',
            provenance: {
              sourceDocument: 'Lipid_Profile_20Nov2025.pdf',
              page: 1,
              section: 'Lipid Fractionation',
              originalText: 'Total Cholesterol: 215 H mg/dL (< 200)',
              extractionMethod: 'MedLens OCR Engine v2.0',
              confidence: 98,
              timestamp: '2025-11-20T08:45:00Z'
            },
            verification: { status: 'VERIFIED', verifiedBy: 'Dr. Kenneth Reed, MD' }
          },
          {
            id: 'tst-hdl',
            testName: 'HDL Cholesterol',
            canonicalCode: '2085-9',
            category: 'LIPID',
            value: 54,
            numericValue: 54,
            unit: 'mg/dL',
            referenceRange: {
              low: 40,
              unit: 'mg/dL',
              rawText: '> 40 mg/dL',
              sourceSpecific: true,
              isAvailable: true
            },
            status: 'NORMAL',
            date: '2025-11-20',
            provenance: {
              sourceDocument: 'Lipid_Profile_20Nov2025.pdf',
              page: 1,
              section: 'Lipid Fractionation',
              originalText: 'HDL Cholesterol: 54 mg/dL (> 40)',
              extractionMethod: 'MedLens OCR Engine v2.0',
              confidence: 99,
              timestamp: '2025-11-20T08:45:00Z'
            },
            verification: { status: 'VERIFIED', verifiedBy: 'Dr. Kenneth Reed, MD' }
          },
          {
            id: 'tst-trig',
            testName: 'Triglycerides',
            canonicalCode: '2571-8',
            category: 'LIPID',
            value: 145,
            numericValue: 145,
            unit: 'mg/dL',
            referenceRange: {
              high: 150,
              unit: 'mg/dL',
              rawText: '< 150 mg/dL',
              sourceSpecific: true,
              isAvailable: true
            },
            status: 'NORMAL',
            date: '2025-11-20',
            provenance: {
              sourceDocument: 'Lipid_Profile_20Nov2025.pdf',
              page: 1,
              section: 'Lipid Fractionation',
              originalText: 'Triglycerides: 145 mg/dL (< 150)',
              extractionMethod: 'MedLens OCR Engine v2.0',
              confidence: 99,
              timestamp: '2025-11-20T08:45:00Z'
            },
            verification: { status: 'VERIFIED', verifiedBy: 'Dr. Kenneth Reed, MD' }
          }
        ],
        observations: [
          'Borderline elevated total cholesterol (215 mg/dL). HDL is cardioprotective at 54 mg/dL.'
        ],
        verificationSummary: { total: 3, verified: 3, needsReview: 0, rejected: 0 }
      },

      // 4. Conflicting Record (2026-03-01) - Demonstrates Cross-Document Discrepancy
      {
        id: 'rep-urgentcare-cbc-2026',
        patientId: 'pat-eleanor-vance',
        reportName: 'Urgent Care Rapid CBC & Triage Screen',
        reportType: 'CBC',
        date: '2026-03-01',
        facility: {
          name: 'Westside Urgent Care Diagnostic Center',
          address: '772 Western Ave, Metro City',
          director: 'Dr. Alan Harper, MD'
        },
        doctorName: 'Dr. Alan Harper, MD',
        documentId: 'REP-UC-9931',
        sourceDocument: 'UrgentCare_CBC_01Mar2026.pdf',
        tests: [
          {
            id: 'tst-uc-hgb',
            testName: 'Hemoglobin',
            canonicalCode: '718-7',
            category: 'HEMATOLOGY',
            value: 12.8,
            numericValue: 12.8,
            unit: 'g/dL',
            referenceRange: {
              low: 12.0,
              high: 16.0,
              unit: 'g/dL',
              rawText: '12.0 - 16.0 g/dL',
              sourceSpecific: true,
              isAvailable: true
            },
            status: 'NORMAL',
            date: '2026-03-01',
            provenance: {
              sourceDocument: 'UrgentCare_CBC_01Mar2026.pdf',
              page: 1,
              section: 'Rapid Point of Care Hematology',
              originalText: 'HGB POC: 12.8 g/dL (12.0 - 16.0)',
              extractionMethod: 'MedLens Rapid Scan OCR',
              confidence: 94,
              timestamp: '2026-03-01T15:30:00Z'
            },
            verification: { status: 'VERIFIED', verifiedBy: 'Dr. Alan Harper, MD' }
          }
        ],
        observations: [
          'Point-of-care rapid blood draw conducted during afternoon urgent care visit. Hemoglobin reads 12.8 g/dL.'
        ],
        verificationSummary: { total: 1, verified: 1, needsReview: 0, rejected: 0 }
      }
    ]
  }
];

export const MOCK_AUDIT_TRAIL: AuditEvent[] = [
  {
    id: 'aud-init-001',
    timestamp: '2026-03-01 10:14:22',
    action: 'Document Ingestion & OCR Structuring',
    actor: 'MedLens Ingestion Pipeline',
    details: 'Processed CBC_Report_01Mar2026.pdf (5 tests extracted into Medical JSON)',
    patientId: 'pat-eleanor-vance',
    reportId: 'rep-cbc-2026'
  },
  {
    id: 'aud-init-002',
    timestamp: '2026-03-01 10:20:15',
    action: 'Clinician Verification',
    actor: 'Dr. Kenneth Reed, MD',
    details: 'Confirmed 4 laboratory parameters; flagged Platelet Count for secondary smudge inspection.',
    patientId: 'pat-eleanor-vance',
    reportId: 'rep-cbc-2026'
  },
  {
    id: 'aud-init-003',
    timestamp: '2026-03-01 15:45:00',
    action: 'Inconsistency Detection Triggered',
    actor: 'Conflict Engine',
    details: 'Flagged divergent measurements for Hemoglobin on 2026-03-01 (11.2 g/dL vs 12.8 g/dL across distinct laboratory sources).',
    patientId: 'pat-eleanor-vance'
  }
];

export const MOCK_REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'tmpl-medlab-std',
    name: 'MedLab Diagnostics Official Letterhead',
    description: 'Two-column branded clinical report layout with laboratory certification watermark and signature block.',
    category: 'DIAGNOSTIC_LAB',
    placeholders: [
      '{{PATIENT_NAME}}',
      '{{PATIENT_ID}}',
      '{{AGE}}',
      '{{SEX}}',
      '{{REPORT_DATE}}',
      '{{LAB_RESULTS_TABLE}}',
      '{{DOCTOR_NAME}}',
      '{{DIRECTOR_SIGNATURE}}'
    ]
  },
  {
    id: 'tmpl-hospital-discharge',
    name: 'St. Jude Inpatient Clinical Summary',
    description: 'Formal hospital clinical pathology format with diagnostic panel grid and physician sign-off.',
    category: 'HOSPITAL_DISCHARGE',
    placeholders: [
      '{{PATIENT_NAME}}',
      '{{PATIENT_ID}}',
      '{{AGE}}',
      '{{SEX}}',
      '{{REPORT_DATE}}',
      '{{LAB_RESULTS_TABLE}}',
      '{{OBSERVATIONS}}',
      '{{DOCTOR_NAME}}',
      '{{DIRECTOR_SIGNATURE}}'
    ]
  },
  {
    id: 'tmpl-metro-modern',
    name: 'Metro Health Ambulatory Diagnostic Panel',
    description: 'Clean modern laboratory slip design with color-coded metric reference intervals.',
    category: 'DIAGNOSTIC_LAB',
    placeholders: [
      '{{PATIENT_NAME}}',
      '{{PATIENT_ID}}',
      '{{AGE}}',
      '{{SEX}}',
      '{{REPORT_DATE}}',
      '{{LAB_RESULTS_TABLE}}',
      '{{DOCTOR_NAME}}',
      '{{DIRECTOR_SIGNATURE}}'
    ]
  }
];
