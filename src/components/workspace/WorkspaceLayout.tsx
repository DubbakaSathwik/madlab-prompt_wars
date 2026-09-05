import React, { useState } from 'react';
import { Patient, ClinicalReport, LabResult, InconsistencyConflict } from '../../types/medical';
import { PatientPanel } from './PatientPanel';
import { ReportWorkspace } from './ReportWorkspace';
import { AIAssistant } from './AIAssistant';
import { User, FileText, Sparkles, Upload } from 'lucide-react';

interface WorkspaceLayoutProps {
  patient?: Patient;
  activeReport?: ClinicalReport;
  onSelectReport: (reportId: string) => void;
  onVerifyTest: (
    testId: string, 
    action: 'CONFIRM' | 'EDIT' | 'REJECT', 
    editData?: { value: string | number; unit?: string; notes?: string }
  ) => void;
  conflicts?: InconsistencyConflict[];
  onOpenConflictsModal?: () => void;
  onOpenUpload?: () => void;
  onOpenNewPatient?: () => void;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  patient,
  activeReport,
  onSelectReport,
  onVerifyTest,
  conflicts = [],
  onOpenConflictsModal,
  onOpenUpload,
  onOpenNewPatient
}) => {
  const [selectedTestId, setSelectedTestId] = useState<string | undefined>(
    activeReport?.tests[0]?.id
  );

  // Mobile Tab View State ('patient' | 'workspace' | 'assistant')
  const [mobileTab, setMobileTab] = useState<'patient' | 'workspace' | 'assistant'>('workspace');

  if (!patient) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#F8FAFB] select-none space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[#e8f4f8] text-[#218DAE] flex items-center justify-center shadow-xs">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h2 className="text-lg font-bold text-slate-900">
            No Patient Profile Active
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Please register a patient profile or upload your own clinical document to start reviewing structured reports, test ranges, and provenance.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          {onOpenNewPatient && (
            <button
              onClick={onOpenNewPatient}
              className="px-4 py-2 rounded-xl bg-[#218DAE] hover:bg-[#186d88] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              Register First Patient
            </button>
          )}
          {onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              Upload Medical Document
            </button>
          )}
        </div>
      </div>
    );
  }

  const selectedTest = activeReport?.tests.find(t => t.id === selectedTestId);

  const handleAskAIAboutTest = (test: LabResult) => {
    setSelectedTestId(test.id);
    setMobileTab('assistant');
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50">
      {/* Mobile Top View Switcher */}
      <div className="lg:hidden flex items-center justify-around bg-white border-b border-slate-200 py-1.5 px-2 text-xs font-semibold shrink-0">
        <button
          onClick={() => setMobileTab('patient')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${
            mobileTab === 'patient' ? 'bg-[#e8f4f8] text-[#186d88]' : 'text-slate-500'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Patient Context</span>
        </button>

        <button
          onClick={() => setMobileTab('workspace')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${
            mobileTab === 'workspace' ? 'bg-[#e8f4f8] text-[#186d88]' : 'text-slate-500'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Report Workspace</span>
        </button>

        <button
          onClick={() => setMobileTab('assistant')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${
            mobileTab === 'assistant' ? 'bg-[#eaf9fc] text-[#1fa2bb]' : 'text-slate-500'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#2BBBD7]" />
          <span>MedLens AI</span>
        </button>
      </div>

      {/* Main Desktop Three-Panel Grid */}
      <div className="flex-1 flex w-full h-[calc(100%-0px)] overflow-hidden">
        {/* LEFT PANEL: PATIENT CONTEXT (~22%) */}
        <div
          className={`w-full lg:w-[22%] shrink-0 h-full ${
            mobileTab === 'patient' ? 'block' : 'hidden lg:block'
          }`}
        >
          <PatientPanel
            patient={patient}
            activeReportId={activeReport?.id}
            onSelectReport={id => {
              onSelectReport(id);
              setSelectedTestId(undefined);
              setMobileTab('workspace');
            }}
          />
        </div>

        {/* CENTER PANEL: REPORT WORKSPACE (~53% - Visually Dominant) */}
        <div
          className={`w-full lg:w-[53%] flex-1 h-full ${
            mobileTab === 'workspace' ? 'block' : 'hidden lg:block'
          }`}
        >
          {activeReport ? (
            <ReportWorkspace
              report={activeReport}
              patient={patient}
              selectedTestId={selectedTestId}
              onSelectTest={id => setSelectedTestId(id)}
              onVerifyTest={onVerifyTest}
              onAskAIAboutTest={handleAskAIAboutTest}
              conflicts={conflicts}
              onOpenConflictsModal={onOpenConflictsModal}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-white">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4 shadow-sm">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Documents for {patient.name}</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5">
                Upload a medical report, lab scan, or clinical summary to extract structured biomarkers and run AI analysis.
              </p>
              {onOpenUpload && (
                <button
                  onClick={onOpenUpload}
                  className="px-4 py-2 rounded-xl bg-[#218DAE] hover:bg-[#186d88] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Document
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: MEDLENS AI ASSISTANT (~25%) */}
        <div
          className={`w-full lg:w-[25%] shrink-0 h-full ${
            mobileTab === 'assistant' ? 'block' : 'hidden lg:block'
          }`}
        >
          <AIAssistant
            patient={patient}
            activeReport={activeReport}
            selectedTest={selectedTest}
            onClearSelectedTest={() => setSelectedTestId(undefined)}
          />
        </div>
      </div>
    </div>
  );
};
