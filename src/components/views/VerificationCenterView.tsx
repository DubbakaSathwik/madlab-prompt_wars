import React from 'react';
import { Patient, ClinicalReport, LabResult } from '../../types/medical';
import { CheckCircle2, AlertTriangle, X, Edit2, ShieldCheck, FileText, ArrowRight, Check } from 'lucide-react';
import { VerificationControl } from '../workspace/VerificationControl';

interface VerificationCenterViewProps {
  patient?: Patient;
  onVerifyTest: (
    testId: string, 
    action: 'CONFIRM' | 'EDIT' | 'REJECT', 
    editData?: { value: string | number; unit?: string; notes?: string }
  ) => void;
  onOpenWorkspace: (reportId: string, testId?: string) => void;
}

export const VerificationCenterView: React.FC<VerificationCenterViewProps> = ({
  patient,
  onVerifyTest,
  onOpenWorkspace
}) => {
  if (!patient) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#F8FAFB]">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4 shadow-sm">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Patient Profile Active</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5">
          Register a patient profile and upload a document to begin clinician verification and review.
        </p>
      </div>
    );
  }

  // Collect all items requiring review across patient's reports
  const queueItems: { test: LabResult; report: ClinicalReport }[] = [];

  patient.reports.forEach(report => {
    report.tests.forEach(test => {
      if (test.verification.status === 'NEEDS_REVIEW' || test.verification.status === 'LOW_CONFIDENCE' || test.ambiguityDetected) {
        queueItems.push({ test, report });
      }
    });
  });

  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-8 bg-[#F8FAFB] select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FCE59A]/50 text-amber-950 text-[11px] font-bold mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>Human-in-the-Loop Review Queue (Section 14)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Clinical Verification Center
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Review and certify AI-extracted laboratory metrics, OCR character ambiguities, and low-confidence parameters for {patient.name}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold ${
              queueItems.length > 0 
                ? 'bg-[#FCE59A] text-amber-950 border border-amber-300' 
                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}>
              {queueItems.length} Items Pending Review
            </span>
          </div>
        </div>

        {/* Queue Items */}
        {queueItems.length > 0 ? (
          <div className="space-y-4">
            {queueItems.map(({ test, report }, index) => (
              <div
                key={test.id}
                className="bg-white rounded-2xl border-2 border-amber-200/80 p-5 shadow-xs hover:border-amber-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {test.testName}
                      </h3>
                      <p className="text-[11px] font-mono text-slate-400">
                        Document: {report.sourceDocument} · Page {test.provenance.page}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Confidence: {test.provenance.confidence}%
                    </span>
                    <button
                      onClick={() => onOpenWorkspace(report.id, test.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#218DAE] hover:underline cursor-pointer ml-2"
                    >
                      <span>Inspect in Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Ambiguity Reason Banner */}
                {test.ambiguityReason ? (
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-0.5">OCR Ambiguity Reason:</span>
                      <p>{test.ambiguityReason}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-0.5">Review Trigger:</span>
                      <p>Extraction confidence ({test.provenance.confidence}%) is below system automated-verification threshold.</p>
                    </div>
                  </div>
                )}

                {/* Values & Verification Control */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Raw Extracted Text Snippet
                    </span>
                    <div className="p-2.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs">
                      "{test.provenance.originalText}"
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Parsed Reference Range: {test.referenceRange.rawText}
                    </span>
                  </div>

                  <div className="flex flex-col items-end justify-center space-y-2">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Proposed Structured Value</span>
                      <span className="text-xl font-bold font-mono text-slate-900">
                        {test.value} {test.unit}
                      </span>
                    </div>

                    <VerificationControl
                      test={test}
                      onVerify={(action, editData) => onVerifyTest(test.id, action, editData)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Verification Queue Clear!
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All extracted laboratory parameters for {patient.name} have been reviewed, verified, or confirmed. All values are certified for clinical report generation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
