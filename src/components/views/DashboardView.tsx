import React from 'react';
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Upload, 
  ArrowLeftRight, 
  Clock,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { Patient, ClinicalReport, AuditEvent } from '../../types/medical';

interface DashboardViewProps {
  patients: Patient[];
  activePatient?: Patient;
  onOpenWorkspace: (patientId?: string, reportId?: string) => void;
  onOpenUpload: () => void;
  onOpenCompare: () => void;
  auditTrail: AuditEvent[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patients,
  activePatient,
  onOpenWorkspace,
  onOpenUpload,
  onOpenCompare,
  auditTrail
}) => {
  // Aggregate stats across patients
  const totalPatients = patients.length;
  const totalReports = patients.reduce((acc, p) => acc + p.reports.length, 0);
  const totalTests = patients.reduce(
    (acc, p) => acc + p.reports.reduce((rAcc, r) => rAcc + r.tests.length, 0), 
    0
  );
  const totalNeedsReview = patients.reduce(
    (acc, p) => acc + p.reports.reduce((rAcc, r) => rAcc + r.verificationSummary.needsReview, 0), 
    0
  );

  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-8 bg-[#F8FAFB] select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e8f4f8] text-[#186d88] text-[11px] font-semibold mb-2">
              <Sparkles className="w-3 h-3 text-[#2BBBD7]" />
              <span>MedLens Clinical Intelligence Hub</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Clinical Records Overview
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              {activePatient ? (
                <>
                  Active Patient Focus: <strong className="text-slate-800">{activePatient.name}</strong> ({activePatient.patientId}) · {activePatient.reports.length} Reports Documented
                </>
              ) : (
                'No active patient profile. Register a patient to start managing clinical records.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Upload Document</span>
            </button>

            {activePatient && (
              <button
                onClick={() => onOpenWorkspace(activePatient.id, activePatient.reports[0]?.id)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#218DAE] hover:bg-[#186d88] text-white text-xs font-semibold transition-all shadow-sm shadow-[#218DAE]/20 cursor-pointer"
              >
                <span>Open Clinical Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Clean Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Patients</span>
              <div className="p-2 rounded-xl bg-[#e8f4f8] text-[#218DAE]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-mono">{totalPatients}</span>
              <span className="text-[11px] text-slate-400">profiles active</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Clinical Reports</span>
              <div className="p-2 rounded-xl bg-[#e8f4f8] text-[#218DAE]">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-mono">{totalReports}</span>
              <span className="text-[11px] text-slate-400">ingested documents</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Results Extracted</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-mono">{totalTests}</span>
              <span className="text-[11px] text-slate-400">structured metrics</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Requires Review</span>
              <div className="p-2 rounded-xl bg-[#FCE59A]/50 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black font-mono ${totalNeedsReview > 0 ? 'text-amber-800' : 'text-slate-900'}`}>
                {totalNeedsReview}
              </span>
              <span className="text-[11px] text-slate-400">pending verification</span>
            </div>
          </div>
        </div>

        {/* 2-Column Section: Recent Reports & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Reports Table (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Recent Ingested Reports
                </h2>
                <p className="text-[11px] text-slate-500">
                  Documents parsed into structured clinical Medical JSON
                </p>
              </div>

              <button
                onClick={onOpenCompare}
                className="inline-flex items-center gap-1.5 text-xs text-[#218DAE] hover:underline font-semibold cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Compare Records</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-2.5">Report Name</th>
                    <th className="pb-2.5">Patient</th>
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5">Tests</th>
                    <th className="pb-2.5">Verification</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {totalReports === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        No clinical documents uploaded yet. Upload your first medical report to begin.
                      </td>
                    </tr>
                  ) : (
                    patients.flatMap(p => p.reports.map(r => ({ ...r, patientObj: p }))).map(report => (
                      <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 font-semibold text-slate-800">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-[#218DAE] shrink-0" />
                            <span className="truncate max-w-[200px]">{report.reportName}</span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-600">
                          {report.patientObj.name}
                        </td>
                        <td className="py-3 font-mono text-slate-500 text-[11px]">
                          {report.date}
                        </td>
                        <td className="py-3 font-mono text-slate-700">
                          {report.tests.length} tests
                        </td>
                        <td className="py-3">
                          {report.verificationSummary.needsReview > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FCE59A]/50 text-amber-900 text-[10px] font-bold">
                              {report.verificationSummary.needsReview} to review
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                              ✓ Verified
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => onOpenWorkspace(report.patientObj.id, report.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#e8f4f8] text-[#186d88] text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Audit Activity (1 col) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Audit & Activity Log
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Traceability stream
                  </p>
                </div>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-3 text-xs">
                {auditTrail.length === 0 ? (
                  <p className="text-slate-400 italic text-[11px] py-6 text-center">
                    No system actions recorded yet. Actions will log here as you upload and verify data.
                  </p>
                ) : (
                  auditTrail.slice(0, 4).map(event => (
                    <div key={event.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px]">
                          {event.action}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {event.timestamp.split(' ')[1] || event.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {event.details}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Actor: {event.actor}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-400">
                Strict HIPAA Audit Protocol Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
