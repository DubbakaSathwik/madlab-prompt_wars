import React from 'react';
import { 
  User, 
  Upload, 
  FileText, 
  ChevronDown, 
  ShieldAlert, 
  Menu,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Patient, ClinicalReport, InconsistencyConflict } from '../../types/medical';

interface TopHeaderProps {
  patients: Patient[];
  activePatient?: Patient;
  onSelectPatient: (patientId: string) => void;
  activeReport?: ClinicalReport;
  onSelectReport?: (reportId: string) => void;
  onOpenUpload: () => void;
  onOpenNewPatient?: () => void;
  onToggleMobileSidebar: () => void;
  onHoverSidebar?: () => void;
  conflicts?: InconsistencyConflict[];
  onOpenConflictsModal?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  patients,
  activePatient,
  onSelectPatient,
  activeReport,
  onSelectReport,
  onOpenUpload,
  onOpenNewPatient,
  onToggleMobileSidebar,
  onHoverSidebar,
  conflicts = [],
  onOpenConflictsModal
}) => {
  const needsReviewCount = activeReport?.verificationSummary.needsReview || 0;
  const unresolvedConflicts = conflicts.filter(c => !c.isResolved);

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 md:px-6 flex items-center justify-between z-20 shrink-0 select-none">
      <div className="flex items-center gap-3 md:gap-4">
        {/* Navigation Menu Trigger (Desktop & Mobile) */}
        <button
          onClick={onToggleMobileSidebar}
          onMouseEnter={onHoverSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-[#186d88] hover:bg-[#e8f4f8] border border-slate-200 hover:border-[#218DAE]/40 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer shadow-2xs"
          title="Open Navigation Menu (or hover near the left edge of the screen)"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5 text-[#218DAE]" />
          <span className="hidden sm:inline">Menu</span>
        </button>

        {/* Patient Selector */}
        {patients.length > 0 && activePatient ? (
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Active Patient:
            </span>
            <div className="relative inline-block">
              <select
                value={activePatient.id}
                onChange={e => onSelectPatient(e.target.value)}
                aria-label="Select active patient"
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-9 py-2 text-sm font-bold text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#218DAE]"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.patientId}, {p.age}y {p.sex.charAt(0)})
                  </option>
                ))}
              </select>
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            {onOpenNewPatient && (
              <button
                onClick={onOpenNewPatient}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-[#e8f4f8] text-slate-700 hover:text-[#186d88] text-sm font-bold transition-colors cursor-pointer"
                title="Add new patient profile"
              >
                <span>+ Add Patient</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-sm text-slate-400 font-medium">No patient profiles</span>
            {onOpenNewPatient && (
              <button
                onClick={onOpenNewPatient}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#e8f4f8] text-[#186d88] text-sm font-bold hover:bg-[#d8eff5] transition-colors cursor-pointer"
              >
                <span>+ Register Patient</span>
              </button>
            )}
          </div>
        )}

        {/* Report Selector (if available) */}
        {activeReport && activePatient && activePatient.reports.length > 0 && onSelectReport && (
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Document:
            </span>
            <div className="relative inline-block">
              <select
                value={activeReport.id}
                onChange={e => onSelectReport(e.target.value)}
                aria-label="Select active document"
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-9 py-2 text-sm font-semibold text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#218DAE] max-w-[280px] truncate"
              >
                {activePatient.reports.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.reportName} ({r.date})
                  </option>
                ))}
              </select>
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Right Toolbar Actions */}
      <div className="flex items-center gap-3">
        {/* Inconsistency Conflict Alert Button */}
        {unresolvedConflicts.length > 0 && onOpenConflictsModal && (
          <button
            onClick={onOpenConflictsModal}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 text-xs font-bold transition-colors cursor-pointer animate-pulse-subtle shadow-2xs"
            title="Cross-document inconsistency detected"
          >
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <span>{unresolvedConflicts.length} Conflict Detected</span>
          </button>
        )}

        {/* Verification Status Pill */}
        {needsReviewCount > 0 ? (
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FCE59A]/40 border border-[#FFD758]/60 text-amber-900 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>{needsReviewCount} {needsReviewCount === 1 ? 'item' : 'items'} need review</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>All records verified</span>
          </div>
        )}

        {/* Safety indicator */}
        <div 
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 bg-slate-100 font-semibold"
          title="MedLens operates strictly within safe non-diagnostic parameters"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-[#218DAE]" />
          <span>Non-Diagnostic</span>
        </div>

        {/* Upload Document Button */}
        <button
          onClick={onOpenUpload}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#218DAE] text-white text-sm font-bold hover:bg-[#186d88] transition-colors shadow-sm cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>
    </header>
  );
};
