/**
 * MEDLENS CLINICAL INFORMATION INTELLIGENCE
 * Core Medical Data Models & JSON Schema Definitions (Phase 3 Extended)
 */

export type SourceCategory = 
  | 'PATIENT_PROVIDED'
  | 'DOCUMENT_EXTRACTED'
  | 'AI_GENERATED'
  | 'VERIFIED'
  | 'NEEDS_REVIEW';

export type ResultStatus = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL_LOW' | 'CRITICAL_HIGH' | 'UNKNOWN';

export type VerificationState = 'NEEDS_REVIEW' | 'VERIFIED' | 'REJECTED' | 'LOW_CONFIDENCE';

export type ReportStatus = 'DRAFT' | 'AI_EXTRACTED' | 'NEEDS_REVIEW' | 'VERIFIED' | 'FINAL_PREVIEW';

export type ProcessingStage = 
  | 'IDLE' 
  | 'UPLOADED' 
  | 'PROCESSING' 
  | 'OCR_COMPLETE' 
  | 'EXTRACTING' 
  | 'VALIDATING' 
  | 'READY_FOR_REVIEW' 
  | 'FAILED';

export interface Provenance {
  sourceDocument: string;
  page: number | string;
  section: string;
  originalText: string;
  extractionMethod: string; // e.g. "OCR + AI Structuring"
  confidence: number; // 0 to 100 percentage
  timestamp: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Verification {
  status: VerificationState;
  verifiedBy?: string;
  verifiedAt?: string;
  editedFrom?: {
    originalValue: string | number;
    originalUnit?: string;
    originalRange?: string;
  };
  notes?: string;
}

export interface ReferenceRange {
  low?: number;
  high?: number;
  unit: string;
  rawText: string; // Verbatim range as printed on the source report
  sourceSpecific: boolean; // True if printed in report, never hallucinated
  isAvailable: boolean;
  isAmbiguous?: boolean;
}

export interface LabResult {
  id: string;
  testName: string;
  canonicalCode?: string; // e.g., LOINC code if mapped
  category: 'HEMATOLOGY' | 'BIOCHEMISTRY' | 'METABOLIC' | 'LIPID' | 'ENDOCRINE' | 'URINALYSIS' | 'OTHER';
  value: number | string;
  numericValue?: number;
  unit: string;
  referenceRange: ReferenceRange;
  status: ResultStatus; // LOW, NORMAL, HIGH, UNKNOWN
  date: string;
  provenance: Provenance;
  verification: Verification;
  ambiguityDetected?: boolean;
  ambiguityReason?: string;
}

export interface MedicalDocument {
  id: string;
  patientId: string;
  fileName: string;
  fileType: 'PDF' | 'PNG' | 'JPG';
  fileSize: number;
  uploadedAt: string;
  ocrCompletedAt?: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  pageCount: number;
  thumbnailUrl?: string;
  rawOcrText?: string;
}

export interface InconsistencyConflict {
  id: string;
  patientId: string;
  conflictType: 'BLOOD_GROUP' | 'AGE' | 'TEST_VALUE' | 'MEDICATION' | 'ALLERGY';
  title: string;
  description: string;
  valueA: string;
  sourceA: string;
  dateA?: string;
  valueB: string;
  sourceB: string;
  dateB?: string;
  isResolved: boolean;
  resolvedValue?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface ClinicalReport {
  id: string;
  patientId: string;
  reportName: string;
  reportType: 'CBC' | 'LFT' | 'LIPID_PROFILE' | 'METABOLIC_PANEL' | 'PRESCRIPTION' | 'DISCHARGE_SUMMARY' | 'OTHER';
  date: string;
  facility: {
    name: string;
    address?: string;
    phone?: string;
    license?: string;
    director?: string;
  };
  doctorName?: string;
  documentId: string;
  sourceDocument: string;
  rawOcrText?: string;
  tests: LabResult[];
  observations?: string[];
  inconsistencies?: string[];
  verificationSummary: {
    total: number;
    verified: number;
    needsReview: number;
    rejected: number;
  };
  fileUrl?: string; // Blob or Data URL for previewing original PDF or image
  fileType?: string; // MIME type e.g. application/pdf, image/png, image/jpeg
}

export interface Allergy {
  id: string;
  substance: string;
  reaction?: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  source: SourceCategory;
  verified: boolean;
  dateNoted?: string;
}

export interface Condition {
  id: string;
  name: string;
  status: 'ACTIVE' | 'RESOLVED' | 'UNDER_EVALUATION';
  diagnosedDate?: string;
  source: SourceCategory;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate?: string;
  endDate?: string;
  prescribingDoctor?: string;
  source: SourceCategory;
  active: boolean;
}

export interface Symptom {
  id: string;
  description: string;
  onset?: string;
  duration?: string;
  severity?: 'MILD' | 'MODERATE' | 'SEVERE';
  source: SourceCategory;
}

export interface MedicalHistoryItem {
  id: string;
  category: 'SURGICAL' | 'FAMILY' | 'SOCIAL' | 'PAST_ILLNESS';
  description: string;
  date?: string;
  source: SourceCategory;
}

export interface Patient {
  id: string;
  patientId: string; // Formatted ID e.g. "ML-94021"
  name: string;
  age: number;
  dateOfBirth: string;
  sex: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  phone?: string;
  email?: string;
  emergencyContact?: string;
  allergies: Allergy[];
  conditions: Condition[];
  medications: Medication[];
  symptoms: Symptom[];
  history: MedicalHistoryItem[];
  reports: ClinicalReport[];
  ownerId?: string; // Links patient to authenticated user for user isolation
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  patientId: string;
  date: string;
  systemDate?: string; // Distinguish medical event date from system event date
  title: string;
  type: 'REPORT' | 'PRESCRIPTION' | 'CONSULTATION' | 'PROCEDURE' | 'VERIFICATION' | 'CORRECTION' | 'TEMPLATE_POPULATED' | 'EXPORT';
  reportId?: string;
  facility?: string;
  summary: string;
  statusText?: string;
  itemCount?: number;
}

export interface StructuredAIResponse {
  record: string;      // Verbatim findings from records
  source: string;      // Specific document and page citations
  explanation: string; // Educational physiological concepts
  note: string;        // Safe non-diagnostic reminder to consult doctor
  isMedicationWarning?: boolean; // If question touches medications / treatments (renders red alert)
  isGreeting?: boolean;          // If conversational greeting without clinical record lookup
}

export interface StructuredClinicalSummary {
  reportOverview: string;
  documentedResults: string[];
  resultsOutsideProvidedRanges: string[];
  changesFromPreviousRecords: string[];
  uncertainOrMissingInformation: string[];
  sourceNotes: string[];
  safetyNote: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: string;
  text?: string;
  structuredResponse?: StructuredAIResponse;
  structuredSummary?: StructuredClinicalSummary;
  suggestedFollowUps?: string[];
  referencedResultIds?: string[];
}

export interface Conversation {
  id: string;
  patientId: string;
  messages: AIMessage[];
}

export type TemplateElementType = 
  | 'PATIENT_NAME'
  | 'PATIENT_ID'
  | 'AGE'
  | 'SEX'
  | 'BLOOD_GROUP'
  | 'REPORT_DATE'
  | 'REPORT_NUMBER'
  | 'DOCTOR_NAME'
  | 'LAB_NAME'
  | 'OBSERVATIONS'
  | 'LAB_RESULTS_TABLE'
  | 'CUSTOM_TEXT'
  | 'LOGO'
  | 'WATERMARK'
  | 'SIGNATURE';

export interface TemplateField {
  id: string;
  name: string;
  placeholder: string; // e.g. {{PATIENT_NAME}}
  type: TemplateElementType;
  dataSourceKey: string; // e.g. "patient.name" or "reports[0].tests"
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width?: number; // px or %
  fontSize?: number; // px
  fontWeight?: string;
  color?: string;
  alignment?: 'left' | 'center' | 'right';
  isConfirmed?: boolean;
}

export interface StudioReportTemplate {
  id: string;
  name: string;
  organization: string;
  description: string;
  category: 'HOSPITAL' | 'PRIVATE_CLINIC' | 'DIAGNOSTIC_LAB';
  backgroundTheme: 'MEDLAB_CLEAN' | 'ST_JUDE_CLASSIC' | 'METRO_MODERN' | 'UPLOADED_IMAGE';
  backgroundImageUrl?: string;
  watermarkText?: string;
  fields: TemplateField[];
  createdAt: string;
  updatedAt: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'DIAGNOSTIC_LAB' | 'HOSPITAL_DISCHARGE' | 'ONCOLOGY_SUMMARY' | 'OUTPATIENT_VISIT' | 'CUSTOM' | string;
  placeholders: string[];
}

export interface VerificationQueueItem {
  id: string;
  patientId: string;
  patientName: string;
  reportId: string;
  reportName: string;
  testId: string;
  testName: string;
  value: string | number;
  unit: string;
  referenceRange: string;
  reason: string;
  confidence: number;
  category: 'OCR_AMBIGUITY' | 'LOW_CONFIDENCE' | 'RANGE_UNCLEAR' | 'CONFLICT';
  originalSnippet: string;
  sourceDoc: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  patientId?: string;
  reportId?: string;
  eventType?: 'SYSTEM_EVENT' | 'USER_ACTION';
  previousValue?: string | number;
  newValue?: string | number;
}

/**
 * Standard Normalized Medical JSON representation (Section 5 & 26)
 */
export interface MedicalJSONRoot {
  patient: {
    name: string;
    patient_id: string;
    age: number | null;
    sex: string;
    allergies: string[];
    conditions: string[];
    medications: string[];
    symptoms: string[];
  };
  reports: Array<{
    report_id: string;
    report_name: string;
    report_type: string;
    date: string;
    source_document: string;
    tests: Array<{
      test_id: string;
      name: string;
      value: string | number;
      numeric_value: number | null;
      unit: string;
      reference_range: string;
      status: ResultStatus;
      page: number | null;
      section: string;
      source_text: string;
      confidence: number;
      verified: boolean;
    }>;
  }>;
}
