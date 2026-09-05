import React, { useState } from 'react';
import { 
  FileText, 
  Table, 
  FileCheck, 
  ZoomIn, 
  ZoomOut, 
  LayoutTemplate
} from 'lucide-react';
import { ClinicalReport, Patient, LabResult, InconsistencyConflict } from '../../types/medical';
import { DocumentViewer } from './DocumentViewer';
import { StructuredView } from './StructuredView';
import { ReportView } from './ReportView';
import { GeneratedReportView } from './GeneratedReportView';

export type ReportMode = 'SOURCE' | 'STRUCTURED' | 'REPORT' | 'GENERATED';

interface ReportWorkspaceProps {
  report: ClinicalReport;
  patient: Patient;
  selectedTestId?: string;
  onSelectTest: (testId: string) => void;
  onVerifyTest: (
    testId: string, 
    action: 'CONFIRM' | 'EDIT' | 'REJECT', 
    editData?: { value: string | number; unit?: string; notes?: string }
  ) => void;
  onAskAIAboutTest: (test: LabResult) => void;
  conflicts?: InconsistencyConflict[];
  onOpenConflictsModal?: () => void;
}

export const ReportWorkspace: React.FC<ReportWorkspaceProps> = ({
  report,
  patient,
  selectedTestId,
  onSelectTest,
  onVerifyTest,
  onAskAIAboutTest,
  conflicts = [],
  onOpenConflictsModal
}) => {
  const [mode, setMode] = useState<ReportMode>('STRUCTURED');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const page = 1;
  const totalPages = 1;

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.15, 1.75));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.15, 0.65));
  const handleZoomReset = () => setZoomLevel(1.0);

  return (
    <main className="flex-1 h-full flex flex-col bg-white overflow-hidden relative select-none">
      {/* Workspace Toolbar */}
      <div className="h-12 border-b border-slate-200/90 px-4 flex items-center justify-between bg-white shrink-0 z-10">
        {/* Left: Mode Switchers */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setMode('SOURCE')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'SOURCE'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#218DAE]" />
            <span>Source</span>
          </button>

          <button
            onClick={() => setMode('STRUCTURED')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'STRUCTURED'
                ? 'bg-white text-[#186d88] shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-[#218DAE]" />
            <span>Structured</span>
          </button>

          <button
            onClick={() => setMode('REPORT')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'REPORT'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-[#218DAE]" />
            <span>Report</span>
          </button>

          <button
            onClick={() => setMode('GENERATED')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'GENERATED'
                ? 'bg-white text-[#186d88] shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-[#218DAE]" />
            <span>Generated</span>
          </button>
        </div>

        {/* Center: Active Document Label */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-800">{report.reportName}</span>
          <span className="text-slate-400 font-mono text-[11px] font-normal">({report.sourceDocument})</span>
        </div>

        {/* Right: Workspace Controls (Zoom & Navigation) */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls (Active in Source Mode) */}
          {mode === 'SOURCE' && (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-xs text-slate-600">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-slate-200 rounded cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomReset}
                className="px-1.5 font-mono text-[11px] hover:text-slate-900 cursor-pointer"
                title="Reset Zoom"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-slate-200 rounded cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Page Navigation */}
          <div className="flex items-center gap-1 text-xs text-slate-500 font-mono bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
            <span>Page {page} of {totalPages}</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 h-[calc(100%-48px)] overflow-hidden">
        {mode === 'SOURCE' && (
          <DocumentViewer
            report={report}
            patient={patient}
            selectedTestId={selectedTestId}
            onSelectTest={onSelectTest}
            zoomLevel={zoomLevel}
          />
        )}

        {mode === 'STRUCTURED' && (
          <StructuredView
            report={report}
            selectedTestId={selectedTestId}
            onSelectTest={onSelectTest}
            onNavigateToSource={() => setMode('SOURCE')}
            onVerifyTest={onVerifyTest}
            onAskAIAboutTest={onAskAIAboutTest}
            conflicts={conflicts}
            onOpenConflictsModal={onOpenConflictsModal}
          />
        )}

        {mode === 'REPORT' && (
          <ReportView
            report={report}
            patient={patient}
          />
        )}

        {mode === 'GENERATED' && (
          <GeneratedReportView
            report={report}
            patient={patient}
          />
        )}
      </div>
    </main>
  );
};
