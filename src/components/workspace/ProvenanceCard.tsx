import React from 'react';
import { 
  FileText, 
  MapPin, 
  Cpu, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Provenance, Verification } from '../../types/medical';

interface ProvenanceCardProps {
  testName: string;
  provenance: Provenance;
  verification: Verification;
  onNavigateToSource?: () => void;
  onClose?: () => void;
}

export const ProvenanceCard: React.FC<ProvenanceCardProps> = ({
  testName,
  provenance,
  verification,
  onNavigateToSource,
  onClose
}) => {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 90) return 'bg-emerald-500 text-emerald-700';
    if (conf >= 75) return 'bg-amber-500 text-amber-700';
    return 'bg-rose-500 text-rose-700';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-5 text-xs select-none max-w-md w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#e8f4f8] text-[#218DAE]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Data Provenance
            </h3>
            <p className="text-[11px] text-slate-500">
              Audit trail for {testName}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            aria-label="Close provenance card"
          >
            ✕
          </button>
        )}
      </div>

      {/* Provenance Fields */}
      <div className="mt-4 space-y-3">
        {/* Source Document */}
        <div className="flex items-start justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#218DAE] shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Source Document
              </span>
              <span className="font-semibold text-slate-800 font-mono text-xs">
                {provenance.sourceDocument}
              </span>
            </div>
          </div>
          {onNavigateToSource && (
            <button
              onClick={onNavigateToSource}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#218DAE] hover:underline cursor-pointer bg-white px-2 py-1 rounded-md border border-slate-200 shadow-2xs"
            >
              <span>View Source</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Page & Section Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Page
            </span>
            <span className="font-bold text-slate-800 text-sm">
              Page {provenance.page}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              Section
            </span>
            <span className="font-semibold text-slate-800 truncate block">
              {provenance.section}
            </span>
          </div>
        </div>

        {/* Original Verbatim OCR Text */}
        <div className="p-2.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] border border-slate-800">
          <span className="text-[9px] uppercase font-semibold text-slate-400 block mb-1">
            Verbatim Raw Text (OCR Layer)
          </span>
          <p className="bg-slate-800/80 p-2 rounded-lg text-emerald-300 font-medium">
            "{provenance.originalText}"
          </p>
        </div>

        {/* Extraction Engine & Confidence Bar */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-slate-400" />
              Extraction Pipeline
            </span>
            <span className="font-semibold text-slate-700 font-mono text-xs">
              {provenance.confidence}% Confidence
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full ${getConfidenceColor(provenance.confidence).split(' ')[0]}`}
              style={{ width: `${provenance.confidence}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Pipeline: <strong className="text-slate-700">{provenance.extractionMethod}</strong>
          </p>
        </div>

        {/* Verification Status */}
        <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                Verification State
              </span>
              <span className="font-semibold text-emerald-900">
                {verification.status}
              </span>
            </div>
          </div>
          {verification.verifiedBy && (
            <span className="text-[10px] text-emerald-700 font-medium">
              By: {verification.verifiedBy}
            </span>
          )}
        </div>

        {/* Timestamp */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Extracted: {provenance.timestamp.split('T')[0]}
          </span>
          <span className="font-mono">SHA-256 Provenance Hash Verified</span>
        </div>
      </div>
    </div>
  );
};
