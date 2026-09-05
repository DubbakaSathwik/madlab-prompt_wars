import { Patient, AuditEvent, ReportTemplate } from '../types/medical';

export const DEMO_PATIENTS: Patient[] = [];

export const MOCK_AUDIT_TRAIL: AuditEvent[] = [];

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
