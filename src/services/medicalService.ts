import { 
  Patient, 
  ClinicalReport, 
  LabResult, 
  TimelineEvent, 
  MedicalJSONRoot,
  InconsistencyConflict,
  AuditEvent,
  Allergy,
  Condition,
  Medication 
} from '../types/medical';
import { DEMO_PATIENTS, MOCK_AUDIT_TRAIL } from '../data/mockData';
import { ConflictService } from './conflictService';
import { ReferenceRangeEngine } from './referenceRangeEngine';

const STORAGE_PATIENTS_KEY = 'medlens_patients_db';
const STORAGE_AUDIT_KEY = 'medlens_audit_trail_db';

export interface ComparisonItem {
  testName: string;
  category: string;
  unit: string;
  previousValue?: string | number;
  previousDate?: string;
  previousRange?: string;
  previousStatus?: string;
  currentValue?: string | number;
  currentDate?: string;
  currentRange?: string;
  currentStatus?: string;
  difference?: string;
  isNewTest?: boolean;
  isMissingTest?: boolean;
  rangeChanged?: boolean;
  sourceDocPrevious?: string;
  sourceDocCurrent?: string;
}

export class MedicalService {
  private static patients: Patient[] = [];
  private static auditTrail: AuditEvent[] = [];
  private static isInitialized = false;

  static init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    const saved = localStorage.getItem(STORAGE_PATIENTS_KEY);
    if (saved) {
      try {
        this.patients = JSON.parse(saved);
      } catch {
        this.patients = [];
      }
    } else {
      this.patients = [];
    }

    const savedAudit = localStorage.getItem(STORAGE_AUDIT_KEY);
    if (savedAudit) {
      try {
        this.auditTrail = JSON.parse(savedAudit);
      } catch {
        this.auditTrail = [];
      }
    } else {
      this.auditTrail = [];
    }

    this.persist();
  }

  static loadDemoData(): void {
    this.patients = JSON.parse(JSON.stringify(DEMO_PATIENTS));
    this.auditTrail = JSON.parse(JSON.stringify(MOCK_AUDIT_TRAIL));
    this.persist();
  }

  static getPatients(userId?: string): Patient[] {
    if (!this.isInitialized) this.init();
    if (!userId || userId === 'usr-clinician-demo') {
      return this.patients;
    }
    return this.patients.filter(p => p.ownerId === userId || !p.ownerId || p.id.startsWith('pat-eleanor'));
  }

  static getPatientById(id: string): Patient | undefined {
    if (!this.isInitialized) this.init();
    return this.patients.find(p => p.id === id || p.patientId === id);
  }

  static createPatient(data: Partial<Patient>, ownerId?: string): Patient {
    if (!this.isInitialized) this.init();

    const newId = data.id || `pat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const formattedId = data.patientId || `ML-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPatient: Patient = {
      id: newId,
      patientId: formattedId,
      name: data.name?.trim() || 'New Patient',
      age: data.age ?? 35,
      dateOfBirth: data.dateOfBirth || '1990-01-01',
      sex: data.sex || 'Other',
      bloodGroup: data.bloodGroup || 'Not Documented',
      phone: data.phone || '',
      email: data.email || '',
      allergies: data.allergies || [],
      conditions: data.conditions || [],
      medications: data.medications || [],
      symptoms: data.symptoms || [],
      history: data.history || [],
      reports: data.reports || [],
      ownerId: ownerId || data.ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.patients.unshift(newPatient);

    this.addAuditEvent({
      id: `aud-pat-create-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      action: 'Patient Profile Created',
      actor: 'User / Clinician',
      details: `Created patient profile for ${newPatient.name} (${newPatient.patientId})`,
      patientId: newId
    });

    this.persist();
    return newPatient;
  }

  static deletePatient(patientId: string): void {
    if (!this.isInitialized) this.init();
    this.patients = this.patients.filter(p => p.id !== patientId);
    this.persist();
  }

  static deleteReport(patientId: string, reportId: string): void {
    if (!this.isInitialized) this.init();
    const patient = this.getPatientById(patientId);
    if (patient) {
      const targetReport = patient.reports.find(r => r.id === reportId);
      patient.reports = patient.reports.filter(r => r.id !== reportId);
      this.addAuditEvent({
        id: `aud-rep-del-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'Report Deleted',
        actor: 'User / Clinician',
        details: `Deleted report "${targetReport?.reportName || reportId}" from patient ${patient.name}`,
        patientId: patient.id,
        reportId
      });
      this.persist();
    }
  }

  static addOrUpdateTest(patientId: string, reportId: string, test: LabResult): void {
    if (!this.isInitialized) this.init();
    const patient = this.getPatientById(patientId);
    if (patient) {
      const report = patient.reports.find(r => r.id === reportId);
      if (report) {
        const existingIdx = report.tests.findIndex(t => t.id === test.id);
        if (existingIdx >= 0) {
          report.tests[existingIdx] = test;
        } else {
          report.tests.push(test);
        }
        const needsReview = report.tests.filter(
          t => t.verification.status === 'NEEDS_REVIEW' || t.verification.status === 'LOW_CONFIDENCE'
        ).length;
        const verified = report.tests.filter(t => t.verification.status === 'VERIFIED').length;
        const rejected = report.tests.filter(t => t.verification.status === 'REJECTED').length;
        report.verificationSummary = {
          total: report.tests.length,
          verified,
          needsReview,
          rejected
        };
        this.addAuditEvent({
          id: `aud-test-edit-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          action: existingIdx >= 0 ? 'Biomarker Updated' : 'Biomarker Added',
          actor: 'User / Clinician (AI Validated)',
          details: `${existingIdx >= 0 ? 'Updated' : 'Added'} test parameter "${test.testName}" (${test.value} ${test.unit}) in report ${report.reportName}`,
          patientId: patient.id,
          reportId
        });
        this.persist();
      }
    }
  }

  static addAllergy(patientId: string, allergy: Allergy): void {
    if (!this.isInitialized) this.init();
    const patient = this.getPatientById(patientId);
    if (patient) {
      patient.allergies.push(allergy);
      this.persist();
    }
  }

  static addCondition(patientId: string, condition: Condition): void {
    if (!this.isInitialized) this.init();
    const patient = this.getPatientById(patientId);
    if (patient) {
      patient.conditions.push(condition);
      this.persist();
    }
  }

  static addMedication(patientId: string, medication: Medication): void {
    if (!this.isInitialized) this.init();
    const patient = this.getPatientById(patientId);
    if (patient) {
      patient.medications.push(medication);
      this.persist();
    }
  }

  static clearAllData(): void {
    this.patients = [];
    this.auditTrail = [];
    localStorage.removeItem(STORAGE_PATIENTS_KEY);
    localStorage.removeItem(STORAGE_AUDIT_KEY);
  }

  static getReportById(patientId: string, reportId: string): ClinicalReport | undefined {
    const patient = this.getPatientById(patientId);
    return patient?.reports.find(r => r.id === reportId);
  }

  /**
   * Adds newly extracted report to a patient's records
   */
  static addExtractedReport(patientId: string, report: ClinicalReport): void {
    if (!this.isInitialized) this.init();

    let patient = this.getPatientById(patientId);
    if (!patient) {
      // If patient not found or none registered yet, create one using report information
      patient = this.createPatient({
        name: 'Patient ' + (this.patients.length + 1),
        patientId: `ML-${Math.floor(10000 + Math.random() * 90000)}`
      });
      report.patientId = patient.id;
    }

    // Check if report with this ID already exists
    const existingIdx = patient.reports.findIndex(r => r.id === report.id);
    if (existingIdx >= 0) {
      patient.reports[existingIdx] = report;
    } else {
      patient.reports.unshift(report);
    }

    // Add audit trail event
    this.addAuditEvent({
      id: `aud-upload-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      action: 'Document Ingestion & OCR Structuring',
      actor: 'MedLens Ingestion Pipeline',
      details: `Processed ${report.reportName} (${report.sourceDocument}) - ${report.tests.length} tests extracted into Medical JSON.`,
      patientId: patient.id,
      reportId: report.id
    });

    this.persist();
  }

  /**
   * Helper method to create and register a ClinicalReport for a patient
   */
  static addReport(patientId: string, reportData: Partial<ClinicalReport>): ClinicalReport {
    const report: ClinicalReport = {
      id: reportData.id || `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      patientId,
      reportName: reportData.reportName || 'Clinical Report',
      reportType: reportData.reportType || 'OTHER',
      date: reportData.date || new Date().toISOString().split('T')[0],
      facility: reportData.facility || { name: 'Clinical Laboratory' },
      doctorName: reportData.doctorName,
      documentId: reportData.documentId || `DOC-${Date.now()}`,
      sourceDocument: reportData.sourceDocument || 'Document.pdf',
      tests: reportData.tests || [],
      observations: reportData.observations || [],
      inconsistencies: reportData.inconsistencies || [],
      verificationSummary: reportData.verificationSummary || {
        total: (reportData.tests || []).length,
        verified: (reportData.tests || []).filter(t => t.verification?.status === 'VERIFIED').length,
        needsReview: (reportData.tests || []).filter(t => t.verification?.status === 'NEEDS_REVIEW').length,
        rejected: 0
      },
      fileUrl: reportData.fileUrl,
      fileType: reportData.fileType
    };
    this.addExtractedReport(patientId, report);
    return report;
  }

  /**
   * Updates verification state for an extracted lab result (Confirm, Edit, Reject)
   * Strictly preserves original extraction history
   */
  static updateVerification(
    patientId: string, 
    reportId: string, 
    testId: string, 
    action: 'CONFIRM' | 'EDIT' | 'REJECT',
    reviewerName: string = 'Staff Clinician',
    editData?: { value: string | number; unit?: string; notes?: string }
  ): LabResult | null {
    const patient = this.getPatientById(patientId);
    if (!patient) return null;

    const report = patient.reports.find(r => r.id === reportId);
    if (!report) return null;

    const test = report.tests.find(t => t.id === testId);
    if (!test) return null;

    const now = new Date().toISOString();
    const prevValue = test.value;

    if (action === 'CONFIRM') {
      test.verification = {
        status: 'VERIFIED',
        verifiedBy: reviewerName,
        verifiedAt: now,
        notes: test.verification.notes ? `${test.verification.notes} · Verified by ${reviewerName}` : `Verified by ${reviewerName}`
      };
      test.ambiguityDetected = false;

      this.addAuditEvent({
        id: `aud-conf-${Date.now()}`,
        timestamp: now.replace('T', ' ').slice(0, 19),
        action: 'Verification Confirmed',
        actor: reviewerName,
        details: `Confirmed ${test.testName} (${test.value} ${test.unit}) from ${report.sourceDocument}`,
        patientId,
        reportId,
        newValue: test.value
      });
    } else if (action === 'REJECT') {
      test.verification = {
        status: 'REJECTED',
        verifiedBy: reviewerName,
        verifiedAt: now,
        notes: editData?.notes || 'Marked inaccurate / rejected by reviewer'
      };

      this.addAuditEvent({
        id: `aud-rej-${Date.now()}`,
        timestamp: now.replace('T', ' ').slice(0, 19),
        action: 'Extraction Rejected',
        actor: reviewerName,
        details: `Rejected ${test.testName} (${test.value} ${test.unit}) due to extraction inaccuracy`,
        patientId,
        reportId,
        previousValue: prevValue
      });
    } else if (action === 'EDIT' && editData) {
      const originalVal = test.value;
      const originalUnit = test.unit;
      
      test.verification = {
        status: 'VERIFIED',
        verifiedBy: reviewerName,
        verifiedAt: now,
        editedFrom: {
          originalValue: originalVal,
          originalUnit: originalUnit
        },
        notes: editData.notes || 'Corrected manually via verification interface'
      };
      test.value = editData.value;
      test.ambiguityDetected = false;

      if (typeof editData.value === 'number') {
        test.numericValue = editData.value;
      } else {
        const parsed = parseFloat(editData.value);
        if (!isNaN(parsed)) test.numericValue = parsed;
      }
      if (editData.unit) test.unit = editData.unit;

      // Re-evaluate against source reference range
      const evalRes = ReferenceRangeEngine.evaluate(test.numericValue, test.referenceRange);
      test.status = evalRes.status;

      this.addAuditEvent({
        id: `aud-edit-${Date.now()}`,
        timestamp: now.replace('T', ' ').slice(0, 19),
        action: 'Human Correction Applied',
        actor: reviewerName,
        details: `Edited ${test.testName} from "${originalVal} ${originalUnit}" to "${editData.value} ${test.unit}"`,
        patientId,
        reportId,
        previousValue: originalVal,
        newValue: editData.value
      });
    }

    // Recalculate summary stats for report
    const verified = report.tests.filter(t => t.verification.status === 'VERIFIED').length;
    const needsReview = report.tests.filter(t => t.verification.status === 'NEEDS_REVIEW' || t.verification.status === 'LOW_CONFIDENCE').length;
    const rejected = report.tests.filter(t => t.verification.status === 'REJECTED').length;
    report.verificationSummary = {
      total: report.tests.length,
      verified,
      needsReview,
      rejected
    };

    this.persist();
    return test;
  }

  /**
   * Compares two clinical reports longitudinally (Section 14)
   * Only reports numerical difference; never infers clinical improvement/deterioration
   */
  static compareReports(patientId: string, currentReportId: string, previousReportId: string): ComparisonItem[] {
    const patient = this.getPatientById(patientId);
    if (!patient) return [];

    const currentReport = patient.reports.find(r => r.id === currentReportId);
    const previousReport = patient.reports.find(r => r.id === previousReportId);

    if (!currentReport || !previousReport) return [];

    const comparisonList: ComparisonItem[] = [];
    const prevMap = new Map<string, LabResult>();

    previousReport.tests.forEach(test => {
      const key = (test.canonicalCode || test.testName).toLowerCase().trim();
      prevMap.set(key, test);
    });

    const matchedKeys = new Set<string>();

    currentReport.tests.forEach(curTest => {
      const key = (curTest.canonicalCode || curTest.testName).toLowerCase().trim();
      matchedKeys.add(key);
      const prevTest = prevMap.get(key);

      if (prevTest) {
        let diffText = '—';
        if (curTest.numericValue !== undefined && prevTest.numericValue !== undefined) {
          const delta = Number((curTest.numericValue - prevTest.numericValue).toFixed(2));
          diffText = delta > 0 ? `+${delta} ${curTest.unit}` : `${delta} ${curTest.unit}`;
        }

        const rangeChanged = prevTest.referenceRange.rawText !== curTest.referenceRange.rawText;

        comparisonList.push({
          testName: curTest.testName,
          category: curTest.category,
          unit: curTest.unit,
          previousValue: prevTest.value,
          previousDate: prevTest.date,
          previousRange: prevTest.referenceRange.rawText,
          previousStatus: prevTest.status,
          currentValue: curTest.value,
          currentDate: curTest.date,
          currentRange: curTest.referenceRange.rawText,
          currentStatus: curTest.status,
          difference: diffText,
          rangeChanged,
          sourceDocPrevious: previousReport.sourceDocument,
          sourceDocCurrent: currentReport.sourceDocument
        });
      } else {
        comparisonList.push({
          testName: curTest.testName,
          category: curTest.category,
          unit: curTest.unit,
          currentValue: curTest.value,
          currentDate: curTest.date,
          currentRange: curTest.referenceRange.rawText,
          currentStatus: curTest.status,
          isNewTest: true,
          sourceDocCurrent: currentReport.sourceDocument
        });
      }
    });

    // Tests in previous report that are missing in current
    previousReport.tests.forEach(prevTest => {
      const key = (prevTest.canonicalCode || prevTest.testName).toLowerCase().trim();
      if (!matchedKeys.has(key)) {
        comparisonList.push({
          testName: prevTest.testName,
          category: prevTest.category,
          unit: prevTest.unit,
          previousValue: prevTest.value,
          previousDate: prevTest.date,
          previousRange: prevTest.referenceRange.rawText,
          previousStatus: prevTest.status,
          isMissingTest: true,
          sourceDocPrevious: previousReport.sourceDocument
        });
      }
    });

    return comparisonList;
  }

  /**
   * Generates chronological timeline with distinction between medical event date and system event date (Section 15)
   */
  static getPatientTimeline(patientId: string): TimelineEvent[] {
    const patient = this.getPatientById(patientId);
    if (!patient) return [];

    const events: TimelineEvent[] = [];

    patient.reports.forEach(report => {
      const outsideRange = report.tests.filter(t => t.status === 'LOW' || t.status === 'HIGH').length;
      events.push({
        id: `tl-${report.id}`,
        patientId,
        date: report.date, // Medical event date
        systemDate: '2026-09-04 09:14:22', // System ingestion date
        title: report.reportName,
        type: 'REPORT',
        reportId: report.id,
        facility: report.facility.name,
        summary: `${report.tests.length} laboratory tests extracted · ${outsideRange} outside reference range`,
        statusText: report.verificationSummary.needsReview > 0 
          ? `${report.verificationSummary.needsReview} require review` 
          : 'All verified',
        itemCount: report.tests.length
      });
    });

    // Add medication prescription event
    if (patient.medications.length > 0) {
      events.push({
        id: 'tl-prescription-aug30',
        patientId,
        date: '2026-08-30',
        systemDate: '2026-08-30 11:20:00',
        title: 'Prescription & Medication Order',
        type: 'PRESCRIPTION',
        facility: 'St. Jude Clinical Outpatient Pharmacy',
        summary: 'Prescribed Ferrous Sulfate 325mg daily, Lisinopril 10mg, Metformin 500mg',
        statusText: 'Document Extracted',
        itemCount: patient.medications.length
      });
    }

    // Add human verification audit events to timeline
    this.auditTrail
      .filter(a => a.patientId === patientId && (a.action.includes('Verification') || a.action.includes('Correction')))
      .forEach(a => {
        events.push({
          id: `tl-audit-${a.id}`,
          patientId,
          date: a.timestamp.split(' ')[0],
          systemDate: a.timestamp,
          title: a.action,
          type: a.action.includes('Correction') ? 'CORRECTION' : 'VERIFICATION',
          reportId: a.reportId,
          summary: a.details,
          statusText: `Actor: ${a.actor}`
        });
      });

    // Sort descending by date
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Exports normalized Medical JSON conforming to section 5 & 26 specifications
   */
  static exportMedicalJSON(patientId: string): MedicalJSONRoot | null {
    const patient = this.getPatientById(patientId);
    if (!patient) return null;

    return {
      patient: {
        name: patient.name,
        patient_id: patient.patientId,
        age: patient.age,
        sex: patient.sex,
        allergies: patient.allergies.map(a => `${a.substance} (${a.severity})`),
        conditions: patient.conditions.map(c => c.name),
        medications: patient.medications.map(m => `${m.name} ${m.dosage}`),
        symptoms: patient.symptoms.map(s => s.description)
      },
      reports: patient.reports.map(rep => ({
        report_id: rep.id,
        report_name: rep.reportName,
        report_type: rep.reportType,
        date: rep.date,
        source_document: rep.sourceDocument,
        tests: rep.tests.map(t => ({
          test_id: t.id,
          name: t.testName,
          value: t.value,
          numeric_value: t.numericValue ?? null,
          unit: t.unit,
          reference_range: t.referenceRange.rawText,
          status: t.status,
          page: typeof t.provenance.page === 'number' ? t.provenance.page : 1,
          section: t.provenance.section,
          source_text: t.provenance.originalText,
          confidence: t.provenance.confidence,
          verified: t.verification.status === 'VERIFIED'
        }))
      }))
    };
  }

  /**
   * Detects cross-document inconsistencies (Section 13)
   */
  static detectInconsistencies(patientId: string): InconsistencyConflict[] {
    const patient = this.getPatientById(patientId);
    if (!patient) return [];
    return ConflictService.detectConflicts(patient);
  }

  /**
   * Resolves a conflict with clinician review
   */
  static resolveConflict(conflictId: string, resolvedValue: string, clinicianName: string): void {
    this.addAuditEvent({
      id: `aud-conf-res-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      action: 'Inconsistency Resolved by Clinician',
      actor: clinicianName,
      details: `Resolved conflict ${conflictId} with confirmed clinical value: "${resolvedValue}"`
    });
    this.persist();
  }

  static getAuditTrail(): AuditEvent[] {
    if (this.auditTrail.length === 0) this.init();
    return this.auditTrail;
  }

  private static addAuditEvent(event: AuditEvent): void {
    this.auditTrail.unshift(event);
    try {
      localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(this.auditTrail));
    } catch (e) {
      console.warn('Failed saving audit trail', e);
    }
  }

  private static persist(): void {
    try {
      localStorage.setItem(STORAGE_PATIENTS_KEY, JSON.stringify(this.patients));
      localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(this.auditTrail));
    } catch (e: any) {
      console.warn('[MedicalService] LocalStorage save warning:', e);
      if (e?.name === 'QuotaExceededError' || e?.code === 22 || e?.number === -2147024882) {
        try {
          // Keep only recent 50 audit logs to free up storage space
          this.auditTrail = this.auditTrail.slice(0, 50);
          localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(this.auditTrail));
          localStorage.setItem(STORAGE_PATIENTS_KEY, JSON.stringify(this.patients));
        } catch (retryErr) {
          console.error('[MedicalService] Critical: localStorage storage capacity exceeded:', retryErr);
        }
      }
    }
  }
}
