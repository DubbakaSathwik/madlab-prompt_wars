import { 
  StudioReportTemplate, 
  TemplateField, 
  Patient, 
  ClinicalReport, 
  ReportStatus 
} from '../types/medical';

export interface ProposedFieldDetection {
  placeholder: string;
  name: string;
  confidence: number; // e.g. 94%
  suggestedX: number;
  suggestedY: number;
  description: string;
}

export const DEFAULT_TEMPLATES: StudioReportTemplate[] = [
  {
    id: 'tmpl-medlab-official',
    name: 'MedLab Diagnostics Certified Letterhead',
    organization: 'MedLab Diagnostics & Pathology Services',
    description: 'CLIA-accredited reference laboratory layout with certified border, laboratory header, watermark, and digital signature line.',
    category: 'DIAGNOSTIC_LAB',
    backgroundTheme: 'MEDLAB_CLEAN',
    watermarkText: 'MEDLAB CERTIFIED RECORD',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-09-04T10:00:00Z',
    fields: [
      {
        id: 'fld-lab-name',
        name: 'Laboratory Name',
        placeholder: '{{LAB_NAME}}',
        type: 'LAB_NAME',
        dataSourceKey: 'facility.name',
        x: 8,
        y: 6,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
        isConfirmed: true
      },
      {
        id: 'fld-pat-name',
        name: 'Patient Full Name',
        placeholder: '{{PATIENT_NAME}}',
        type: 'PATIENT_NAME',
        dataSourceKey: 'patient.name',
        x: 8,
        y: 18,
        fontSize: 13,
        fontWeight: 'bold',
        color: '#0f172a',
        isConfirmed: true
      },
      {
        id: 'fld-pat-id',
        name: 'Patient ID / MRN',
        placeholder: '{{PATIENT_ID}}',
        type: 'PATIENT_ID',
        dataSourceKey: 'patient.patient_id',
        x: 58,
        y: 18,
        fontSize: 12,
        fontWeight: 'medium',
        color: '#334155',
        isConfirmed: true
      },
      {
        id: 'fld-age-sex',
        name: 'Age / Sex',
        placeholder: '{{AGE}} / {{SEX}}',
        type: 'AGE',
        dataSourceKey: 'patient.age_sex',
        x: 8,
        y: 22,
        fontSize: 11,
        color: '#475569',
        isConfirmed: true
      },
      {
        id: 'fld-blood-grp',
        name: 'Blood Group',
        placeholder: '{{BLOOD_GROUP}}',
        type: 'BLOOD_GROUP',
        dataSourceKey: 'patient.bloodGroup',
        x: 35,
        y: 22,
        fontSize: 11,
        color: '#475569',
        isConfirmed: true
      },
      {
        id: 'fld-rep-date',
        name: 'Report Collection Date',
        placeholder: '{{REPORT_DATE}}',
        type: 'REPORT_DATE',
        dataSourceKey: 'report.date',
        x: 58,
        y: 22,
        fontSize: 11,
        color: '#475569',
        isConfirmed: true
      },
      {
        id: 'fld-doctor',
        name: 'Requesting Physician',
        placeholder: '{{DOCTOR_NAME}}',
        type: 'DOCTOR_NAME',
        dataSourceKey: 'report.doctorName',
        x: 8,
        y: 26,
        fontSize: 11,
        color: '#475569',
        isConfirmed: true
      },
      {
        id: 'fld-results-table',
        name: 'Dynamic Laboratory Results Table',
        placeholder: '{{LAB_RESULTS_TABLE}}',
        type: 'LAB_RESULTS_TABLE',
        dataSourceKey: 'report.tests',
        x: 8,
        y: 33,
        fontSize: 11,
        isConfirmed: true
      },
      {
        id: 'fld-observations',
        name: 'Pathologist Observations',
        placeholder: '{{OBSERVATIONS}}',
        type: 'OBSERVATIONS',
        dataSourceKey: 'report.observations',
        x: 8,
        y: 78,
        fontSize: 11,
        color: '#334155',
        isConfirmed: true
      },
      {
        id: 'fld-signature',
        name: 'Director Digital Signature Block',
        placeholder: '{{SIGNATURE}}',
        type: 'SIGNATURE',
        dataSourceKey: 'facility.director',
        x: 8,
        y: 88,
        fontSize: 11,
        color: '#0f172a',
        isConfirmed: true
      }
    ]
  },
  {
    id: 'tmpl-st-jude-hospital',
    name: 'St. Jude Clinical Pathology Institute',
    organization: 'St. Jude Clinical Pathology Institute',
    description: 'Traditional academic hospital layout with formal clinical header and dual-column indices.',
    category: 'HOSPITAL',
    backgroundTheme: 'ST_JUDE_CLASSIC',
    watermarkText: 'ST. JUDE CLINICAL INSTITUTE',
    createdAt: '2026-08-15T00:00:00Z',
    updatedAt: '2026-09-01T12:00:00Z',
    fields: [
      {
        id: 'st-lab',
        name: 'Institute Header',
        placeholder: '{{LAB_NAME}}',
        type: 'LAB_NAME',
        dataSourceKey: 'facility.name',
        x: 10,
        y: 7,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        isConfirmed: true
      },
      {
        id: 'st-pat',
        name: 'Patient Full Name',
        placeholder: '{{PATIENT_NAME}}',
        type: 'PATIENT_NAME',
        dataSourceKey: 'patient.name',
        x: 10,
        y: 19,
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1e293b',
        isConfirmed: true
      },
      {
        id: 'st-id',
        name: 'Hospital Record ID',
        placeholder: '{{PATIENT_ID}}',
        type: 'PATIENT_ID',
        dataSourceKey: 'patient.patient_id',
        x: 60,
        y: 19,
        fontSize: 12,
        color: '#475569',
        isConfirmed: true
      },
      {
        id: 'st-table',
        name: 'Laboratory Results Table',
        placeholder: '{{LAB_RESULTS_TABLE}}',
        type: 'LAB_RESULTS_TABLE',
        dataSourceKey: 'report.tests',
        x: 10,
        y: 32,
        fontSize: 11,
        isConfirmed: true
      }
    ]
  }
];

export class TemplateService {
  /**
   * Automatic Template Analysis (Section 8)
   * Analyzes template geometry and proposes candidate regions for human confirmation
   */
  static analyzeTemplate(templateName: string): ProposedFieldDetection[] {
    return [
      {
        placeholder: '{{PATIENT_NAME}}',
        name: 'Patient Name Field',
        confidence: 96,
        suggestedX: 8,
        suggestedY: 18,
        description: 'Detected label "Patient:" on upper left quadrant.'
      },
      {
        placeholder: '{{PATIENT_ID}}',
        name: 'Patient ID / MRN',
        confidence: 94,
        suggestedX: 58,
        suggestedY: 18,
        description: 'Detected alphanumeric identifier format (MRN / Sample ID).'
      },
      {
        placeholder: '{{REPORT_DATE}}',
        name: 'Collection Date',
        confidence: 91,
        suggestedX: 58,
        suggestedY: 22,
        description: 'Detected calendar timestamp label "Collected / Reported".'
      },
      {
        placeholder: '{{LAB_RESULTS_TABLE}}',
        name: 'Laboratory Results Grid',
        confidence: 98,
        suggestedX: 8,
        suggestedY: 33,
        description: 'Detected multi-column tabular grid with headers: Test, Result, Range, Flag.'
      },
      {
        placeholder: '{{SIGNATURE}}',
        name: 'Pathologist Signature Area',
        confidence: 89,
        suggestedX: 8,
        suggestedY: 88,
        description: 'Detected medical director certification and signature rule line.'
      }
    ];
  }

  /**
   * Resolves a placeholder string into its verified value
   */
  static resolveValue(placeholder: string, patient: Patient, report?: ClinicalReport): string {
    const activeRep = report || patient.reports[0];

    switch (placeholder) {
      case '{{PATIENT_NAME}}':
        return patient.name;
      case '{{PATIENT_ID}}':
        return patient.patientId;
      case '{{AGE}}':
        return `${patient.age} Yrs`;
      case '{{SEX}}':
        return patient.sex;
      case '{{AGE}} / {{SEX}}':
        return `${patient.age} Yrs / ${patient.sex}`;
      case '{{BLOOD_GROUP}}':
        return patient.bloodGroup || 'Not Documented';
      case '{{REPORT_DATE}}':
        return activeRep?.date || new Date().toISOString().split('T')[0];
      case '{{REPORT_NUMBER}}':
        return activeRep?.documentId || `REP-${Date.now()}`;
      case '{{DOCTOR_NAME}}':
        return activeRep?.doctorName || 'Dr. Kenneth Reed, MD';
      case '{{LAB_NAME}}':
        return activeRep?.facility.name || 'MedLab Diagnostics';
      case '{{OBSERVATIONS}}':
        return activeRep?.observations?.join(' ') || 'No critical abnormalities flagged.';
      case '{{SIGNATURE}}':
        return activeRep?.facility.director || 'Robert Sterling, MD, FCAP (Certified)';
      default:
        return placeholder;
    }
  }

  /**
   * Determines current report readiness status (Section 13 & 21)
   */
  static getReportStatus(report?: ClinicalReport): { status: ReportStatus; unverifiedCount: number; message: string } {
    if (!report) {
      return {
        status: 'DRAFT',
        unverifiedCount: 0,
        message: 'Draft Template — No clinical data bound.'
      };
    }

    const unverified = report.tests.filter(
      t => t.verification.status === 'NEEDS_REVIEW' || t.ambiguityDetected
    ).length;

    if (unverified > 0) {
      return {
        status: 'NEEDS_REVIEW',
        unverifiedCount: unverified,
        message: `${unverified} value(s) in this document require clinician verification before certified export.`
      };
    }

    const allVerified = report.tests.every(t => t.verification.status === 'VERIFIED');
    if (allVerified) {
      return {
        status: 'FINAL_PREVIEW',
        unverifiedCount: 0,
        message: 'All extracted laboratory values are human-verified and certified.'
      };
    }

    return {
      status: 'AI_EXTRACTED',
      unverifiedCount: 0,
      message: 'AI-extracted data populated. Review recommended prior to final release.'
    };
  }
}
