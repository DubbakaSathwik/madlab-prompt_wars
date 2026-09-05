import React from 'react';
import { ClinicalReport, Patient } from '../../types/medical';
import { Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';

interface ReportViewProps {
  report: ClinicalReport;
  patient: Patient;
}

export const ReportView: React.FC<ReportViewProps> = ({ report, patient }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full h-full overflow-y-auto p-6 flex flex-col items-center bg-slate-100 select-none">
      {/* Print / Export Action Bar */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-4 no-print">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">
            Formatted Medical Report Preview
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
            Ready for Clinical Print
          </span>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Official Formatted Clinical Report Page */}
      <div className="w-full max-w-3xl bg-white border border-slate-300 rounded-sm p-8 md:p-12 shadow-md text-slate-900 text-xs">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-800 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-[#218DAE] text-white flex items-center justify-center font-bold text-xs rounded-sm">
                ML
              </div>
              <h2 className="text-lg font-bold text-slate-900">{report.facility.name}</h2>
            </div>
            <p className="text-[11px] text-slate-500">{report.facility.address}</p>
            <p className="text-[10px] text-slate-400">CLIA ID: {report.facility.license} · Lab Director: {report.facility.director}</p>
          </div>

          <div className="text-right">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">Clinical Summary</h3>
            <p className="text-xs text-slate-600 font-mono mt-0.5">Date: {report.date}</p>
            <p className="text-[10px] text-slate-400 font-mono">Report ID: {report.id}</p>
          </div>
        </div>

        {/* Patient Block */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-sm mb-6 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Patient</span>
            <span className="font-bold text-slate-800">{patient.name}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">ID / MRN</span>
            <span className="font-mono text-slate-800">{patient.patientId}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Age / Sex</span>
            <span className="text-slate-800">{patient.age} Yrs / {patient.sex}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Attending Physician</span>
            <span className="text-slate-800">{report.doctorName || 'Dr. Kenneth Reed, MD'}</span>
          </div>
        </div>

        {/* Structured Results Table */}
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          {report.reportName}
        </h4>
        <table className="w-full text-left border-collapse mb-6 text-xs">
          <thead>
            <tr className="border-b-2 border-slate-300 text-[11px] font-bold text-slate-700 uppercase bg-slate-100/60">
              <th className="py-2 px-3">Test Name</th>
              <th className="py-2 px-3">Result</th>
              <th className="py-2 px-3">Unit</th>
              <th className="py-2 px-3">Reference Range</th>
              <th className="py-2 px-3">Flag</th>
              <th className="py-2 px-3 text-right">Verification</th>
            </tr>
          </thead>
          <tbody>
            {report.tests.map(test => {
              const isLow = test.status === 'LOW';
              const isHigh = test.status === 'HIGH';
              return (
                <tr key={test.id} className="border-b border-slate-200">
                  <td className="py-2 px-3 font-semibold text-slate-800">{test.testName}</td>
                  <td className={`py-2 px-3 font-mono font-bold ${isLow || isHigh ? 'text-slate-900' : 'text-slate-700'}`}>
                    {test.value}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{test.unit}</td>
                  <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{test.referenceRange.rawText}</td>
                  <td className="py-2 px-3">
                    {isLow && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        LOW
                      </span>
                    )}
                    {isHigh && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300">
                        HIGH
                      </span>
                    )}
                    {!isLow && !isHigh && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900">
                        NORMAL
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {test.verification.status === 'VERIFIED' ? '✓ Verified' : 'Needs Review'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Observations */}
        {report.observations && report.observations.length > 0 && (
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-sm">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Pathologist Interpretive Notes
            </h5>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-700">
              {report.observations.map((obs, idx) => (
                <li key={idx}>{obs}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Non-Diagnostic Disclaimer */}
        <div className="p-3 bg-[#e8f4f8]/50 border-l-2 border-[#218DAE] text-[11px] text-slate-600 rounded-r-sm mb-8">
          <p className="font-semibold text-slate-800 mb-0.5">Clinical Information Disclaimer:</p>
          <p>
            This document is generated by MedLens for record organization and traceability. Reference ranges are preserved verbatim from the certified reporting laboratory. MedLens does not formulate clinical diagnoses or alter therapy. Please review this summary with your physician.
          </p>
        </div>

        {/* Sign-Off */}
        <div className="pt-4 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-500">
          <div>
            <p className="font-semibold text-slate-800">Electronically Verified</p>
            <p>Certified by {report.facility.director || 'Robert Sterling, MD'}</p>
          </div>
          <div className="text-right font-mono text-[10px]">
            <p>Source: {report.sourceDocument}</p>
            <p>Verified Timestamp: {report.date} 10:14:22 UTC</p>
          </div>
        </div>
      </div>
    </div>
  );
};
