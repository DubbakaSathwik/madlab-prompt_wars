import React, { useState } from 'react';
import { MedicalJSONRoot } from '../../types/medical';
import { FHIRService } from '../../services/fhirService';
import { X, Copy, Check, Download, ShieldCheck, FileCode, Layers } from 'lucide-react';

interface MedicalJSONModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MedicalJSONRoot | null;
}

export const MedicalJSONModal: React.FC<MedicalJSONModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const [format, setFormat] = useState<'MEDLENS' | 'FHIR_R4'>('MEDLENS');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const fhirData = format === 'FHIR_R4' ? FHIRService.exportRootToFHIR(data) : null;
  const activeData = format === 'FHIR_R4' ? fhirData : data;
  const jsonString = JSON.stringify(activeData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const isFhir = format === 'FHIR_R4';
    const blob = new Blob([jsonString], { type: isFhir ? 'application/fhir+json' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isFhir 
      ? `FHIR_R4_${data.patient.patient_id}_records.json` 
      : `medlens_${data.patient.patient_id}_records.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4 select-none">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 text-xs flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#e8f4f8] text-[#218DAE]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Clinical Data Interoperability Export
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-mono text-[10px] font-bold">
                  {format === 'FHIR_R4' ? 'HL7 FHIR R4 Bundle' : 'MedLens Schema v1.0'}
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {format === 'FHIR_R4'
                  ? 'Standardized HL7 FHIR R4 resources ready for EHR ingestion (Epic, Cerner)'
                  : 'Normalized patient metrics, bounds, and provenance for AI reasoning'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setFormat('MEDLENS')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  format === 'MEDLENS'
                    ? 'bg-white text-[#186d88] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>MedLens JSON</span>
              </button>
              <button
                onClick={() => setFormat('FHIR_R4')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  format === 'FHIR_R4'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>HL7 FHIR R4</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#218DAE] hover:bg-[#186d88] text-white font-semibold cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {format === 'FHIR_R4' ? 'FHIR' : 'JSON'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto my-4 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs border border-slate-800">
          <pre className="text-emerald-400 whitespace-pre-wrap">{jsonString}</pre>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span>Decoupled clinical schema ready for downstream LLM reasoning and FHIR bridges</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg hover:bg-slate-100 text-slate-600 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
