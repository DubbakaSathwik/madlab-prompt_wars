import React, { useState } from 'react';
import { Patient, ClinicalReport } from '../../types/medical';
import { ComparisonItem, MedicalService } from '../../services/medicalService';
import { ArrowLeftRight, TrendingUp, TrendingDown, Minus, ShieldAlert, FileText } from 'lucide-react';

interface ComparisonViewProps {
  patient?: Patient;
  onOpenReport: (reportId: string) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  patient,
  onOpenReport
}) => {
  const reports = patient?.reports || [];

  // Default to comparing first two available reports
  const [curReportId, setCurReportId] = useState<string>(reports[0]?.id || '');
  const [prevReportId, setPrevReportId] = useState<string>(reports[1]?.id || '');

  if (!patient || reports.length < 2) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#F8FAFB]">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4 shadow-sm">
          <ArrowLeftRight className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          {!patient ? 'No Active Patient Profile' : 'Comparison Requires At Least 2 Reports'}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          {!patient
            ? 'Please register a patient and upload laboratory records to start longitudinal comparison.'
            : `Patient ${patient.name} currently has ${reports.length} report(s). Upload a second report to compare biomarker deltas, trends, and range shifts over time.`}
        </p>
      </div>
    );
  }

  const comparisonData: ComparisonItem[] = (curReportId && prevReportId)
    ? MedicalService.compareReports(patient.id, curReportId, prevReportId)
    : [];

  const curReport = reports.find(r => r.id === curReportId);
  const prevReport = reports.find(r => r.id === prevReportId);

  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-8 bg-[#F8FAFB] select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e8f4f8] text-[#186d88] text-[11px] font-semibold mb-2">
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#218DAE]" />
              <span>Longitudinal Laboratory Delta Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Report Comparison: {patient.name}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Compare laboratory metrics between historical and current test reports. Reference intervals are preserved verbatim.
            </p>
          </div>
        </div>

        {/* Report Selector Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Historical Reference Document (Previous)
            </label>
            <select
              value={prevReportId}
              onChange={e => setPrevReportId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#218DAE]"
            >
              {reports.map(r => (
                <option key={r.id} value={r.id} disabled={r.id === curReportId}>
                  {r.reportName} ({r.date})
                </option>
              ))}
            </select>
            {prevReport && (
              <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                {prevReport.facility.name} · {prevReport.tests.length} tests
              </span>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Target Document (Current)
            </label>
            <select
              value={curReportId}
              onChange={e => setCurReportId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#218DAE]"
            >
              {reports.map(r => (
                <option key={r.id} value={r.id} disabled={r.id === prevReportId}>
                  {r.reportName} ({r.date})
                </option>
              ))}
            </select>
            {curReport && (
              <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                {curReport.facility.name} · {curReport.tests.length} tests
              </span>
            )}
          </div>
        </div>

        {/* Responsible AI Non-Diagnostic Banner */}
        <div className="p-4 bg-[#e8f4f8]/60 rounded-2xl border-l-3 border-[#218DAE] text-xs text-slate-700 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#218DAE] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[#186d88] uppercase tracking-wider text-[11px] mb-0.5">
              Clinical Notice on Numerical Variations
            </p>
            <p className="leading-relaxed">
              Longitudinal differences (deltas) reflect numerical variances across laboratory collection dates. Laboratories may employ different analyzers, assays, and reference intervals. MedLens does not infer clinical improvement, deterioration, or medical diagnosis from these changes. Discuss all changes with your physician.
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Test Name</th>
                  <th className="py-3 px-4">Previous ({prevReport?.date || 'N/A'})</th>
                  <th className="py-3 px-4">Current ({curReport?.date || 'N/A'})</th>
                  <th className="py-3 px-4">Delta / Change</th>
                  <th className="py-3 px-4">Laboratory Reference Range</th>
                  <th className="py-3 px-4 text-right">Sources</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonData.map((item, idx) => {
                  const isUp = item.difference?.startsWith('+');
                  const isDown = item.difference?.startsWith('-');

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{item.testName}</span>
                          {item.rangeChanged && (
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900"
                              title="Laboratory reference range differs between reports"
                            >
                              Range Shift
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Previous Value */}
                      <td className="py-3 px-4 font-mono">
                        {item.previousValue !== undefined ? (
                          <span className="font-semibold text-slate-700">
                            {item.previousValue} {item.unit}
                          </span>
                        ) : (
                          <span className="text-slate-300 italic">Not tested</span>
                        )}
                      </td>

                      {/* Current Value */}
                      <td className="py-3 px-4 font-mono">
                        {item.currentValue !== undefined ? (
                          <span className="font-bold text-slate-900">
                            {item.currentValue} {item.unit}
                          </span>
                        ) : (
                          <span className="text-slate-300 italic">Not tested</span>
                        )}
                      </td>

                      {/* Delta Change */}
                      <td className="py-3 px-4 font-mono">
                        {item.difference && item.difference !== '—' ? (
                          <span className={`inline-flex items-center gap-1 font-semibold ${
                            isUp ? 'text-blue-700' : isDown ? 'text-amber-800' : 'text-slate-700'
                          }`}>
                            {isUp && <TrendingUp className="w-3.5 h-3.5" />}
                            {isDown && <TrendingDown className="w-3.5 h-3.5" />}
                            <span>{item.difference}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Reference Range */}
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        {item.currentRange || item.previousRange || 'Not Available'}
                      </td>

                      {/* Sources */}
                      <td className="py-3 px-4 text-right">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.sourceDocCurrent || item.sourceDocPrevious}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
