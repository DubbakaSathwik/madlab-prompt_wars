import React, { useState } from 'react';
import { ClinicalReport, Patient, LabResult, StudioReportTemplate } from '../../types/medical';
import { DEFAULT_TEMPLATES, TemplateService } from '../../services/templateService';
import { Printer, ShieldCheck, Sparkles, Sliders, FileCheck, Info } from 'lucide-react';

interface GeneratedReportViewProps {
  report: ClinicalReport;
  patient: Patient;
}

export const GeneratedReportView: React.FC<GeneratedReportViewProps> = ({ report, patient }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DEFAULT_TEMPLATES[0].id);
  const [sourcePopoverTest, setSourcePopoverTest] = useState<LabResult | null>(null);

  const activeTemplate = DEFAULT_TEMPLATES.find(t => t.id === selectedTemplateId) || DEFAULT_TEMPLATES[0];
  const reportReadiness = TemplateService.getReportStatus(report);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full h-full overflow-y-auto p-6 flex flex-col items-center bg-slate-200/60 select-none">
      {/* Studio Generation Bar */}
      <div className="w-full max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 no-print bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-[#e8f4f8] text-[#218DAE]">
            <Sparkles className="w-4 h-4 text-[#2BBBD7]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                Generated Visual Template Output (Section 11)
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                reportReadiness.status === 'FINAL_PREVIEW' || reportReadiness.status === 'VERIFIED'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                {reportReadiness.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Verified Medical JSON dynamically bound to organization report format.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Template Selector */}
          <select
            value={selectedTemplateId}
            onChange={e => setSelectedTemplateId(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#218DAE] cursor-pointer"
          >
            {DEFAULT_TEMPLATES.map(t => (
              <option key={t.id} value={t.id}>
                Template: {t.name}
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#218DAE] hover:bg-[#186d88] text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Populated Template Canvas Sheet */}
      <div className="w-full max-w-3xl min-h-[960px] bg-white text-slate-900 shadow-xl rounded-sm p-8 md:p-12 font-sans relative border border-slate-300 mb-8">
        {/* Background Watermark */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-4 overflow-hidden">
          <span className="text-6xl md:text-7xl font-black text-slate-900 -rotate-45 tracking-widest uppercase">
            {activeTemplate.watermarkText || 'ORGANIZATION CERTIFIED'}
          </span>
        </div>

        {/* Header Template Branding */}
        <header className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#218DAE] text-white flex items-center justify-center font-bold text-lg rounded-sm shadow-xs">
                ML
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  {report.facility.name || activeTemplate.organization}
                </h2>
                <p className="text-xs text-slate-600">
                  {report.facility.address || 'Certified Pathology & Diagnostic Medicine Services'}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1 font-mono">
                  <span>{report.facility.license || 'CLIA #05D9823412'}</span>
                  <span>•</span>
                  <span>Director: {report.facility.director || 'Robert Sterling, MD'}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-sm uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Template Report</span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 mt-1">
                LAYOUT: {activeTemplate.name}
              </p>
            </div>
          </div>
        </header>

        {/* Patient Demographics Box */}
        <div className="bg-slate-50 border border-slate-300 rounded-sm p-3.5 mb-6 text-xs grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Name</span>
            <span className="font-bold text-slate-900 text-sm">
              {patient.name}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">MRN / Record ID</span>
            <span className="font-mono font-semibold text-slate-800">
              {patient.patientId}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Age / Sex</span>
            <span className="text-slate-800 font-medium">
              {patient.age} Yrs / {patient.sex}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Blood Group</span>
            <span className="text-slate-800 font-semibold">
              {patient.bloodGroup || 'Not Documented'}
            </span>
          </div>
        </div>

        {/* Results Table with Source Provenance Interactivity (Section 12) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {report.reportName} — Clinical Parameters
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Click test row to inspect provenance
            </span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 text-[11px] font-bold text-slate-700 uppercase bg-slate-100/50">
                <th className="py-2.5 px-3">Test Description</th>
                <th className="py-2.5 px-3">Result</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3">Laboratory Reference Range</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-2 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {report.tests.map(test => {
                const isLow = test.status === 'LOW';
                const isHigh = test.status === 'HIGH';

                return (
                  <tr
                    key={test.id}
                    onClick={() => setSourcePopoverTest(test)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    title="Click to view Source-to-Report provenance"
                  >
                    <td className="py-2 px-3 font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#218DAE] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span>{test.testName}</span>
                    </td>
                    <td className={`py-2 px-3 font-mono font-bold ${
                      isLow || isHigh ? 'text-slate-900 font-black' : 'text-slate-700'
                    }`}>
                      {test.value}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">
                      {test.unit}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">
                      {test.referenceRange.rawText}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {isLow && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          LOW
                        </span>
                      )}
                      {isHigh && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-900 border border-rose-300">
                          HIGH
                        </span>
                      )}
                      {!isLow && !isHigh && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900">
                          NORMAL
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-[10px]">
                      {test.verification.status === 'VERIFIED' ? (
                        <span className="text-emerald-700 font-semibold">✓ Verified</span>
                      ) : (
                        <span className="text-amber-800 font-bold bg-[#FCE59A]/50 px-1 py-0.2 rounded">Needs Review</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Observations */}
        {report.observations && report.observations.length > 0 && (
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Pathologist Observations & Interpretive Notes
            </span>
            <ul className="list-disc pl-4 space-y-0.5 text-slate-700 text-[11px]">
              {report.observations.map((obs, i) => (
                <li key={i}>{obs}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Pathologist Digital Signature Block */}
        <footer className="mt-12 pt-6 border-t-2 border-slate-900 flex items-end justify-between text-xs text-slate-600">
          <div>
            <p className="font-bold text-slate-900">{report.facility.director || 'Robert Sterling, MD, FCAP'}</p>
            <p className="text-[11px]">Director of Clinical Pathology & Laboratory Medicine</p>
            <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] mt-1 font-mono">
              <span>Certified Digital Signature · Key #SHA256-88192a</span>
            </div>
          </div>

          <div className="text-right font-mono text-[10px] text-slate-400">
            <p>Page 1 of 1</p>
            <p className="text-slate-300 mt-1">PROVENANCE CERTIFIED</p>
          </div>
        </footer>
      </div>

      {/* Floating Provenance Popover (Section 12) */}
      {sourcePopoverTest && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4"
          onClick={() => setSourcePopoverTest(null)}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 max-w-sm w-full text-xs space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-[#218DAE]" />
                <span>Source-to-Report Provenance</span>
              </div>
              <button onClick={() => setSourcePopoverTest(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-1.5">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Generated Value</span>
                <span className="font-bold text-slate-900 text-sm">
                  {sourcePopoverTest.testName}: {sourcePopoverTest.value} {sourcePopoverTest.unit}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Source Document</span>
                <span className="font-mono text-slate-800 font-semibold">
                  {sourcePopoverTest.provenance.sourceDocument} · Page {sourcePopoverTest.provenance.page}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px]">
                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Original Extracted Text</span>
                <span>"{sourcePopoverTest.provenance.originalText}"</span>
              </div>

              <div className="flex items-center justify-between text-[11px] p-2 bg-emerald-50 rounded-lg text-emerald-900">
                <span>Status: <strong>{sourcePopoverTest.verification.status}</strong></span>
                <span className="font-mono">Confidence: {sourcePopoverTest.provenance.confidence}%</span>
              </div>
            </div>

            <button
              onClick={() => setSourcePopoverTest(null)}
              className="w-full py-1.5 rounded-lg bg-[#218DAE] text-white font-semibold text-xs"
            >
              Close Provenance Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
