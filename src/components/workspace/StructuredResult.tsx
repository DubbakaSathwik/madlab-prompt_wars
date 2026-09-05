import React, { useState } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { LabResult, ResultStatus } from '../../types/medical';
import { VerificationControl } from './VerificationControl';
import { ProvenanceCard } from './ProvenanceCard';

interface StructuredResultProps {
  test: LabResult;
  isSelected?: boolean;
  onSelect?: () => void;
  onNavigateToSource?: () => void;
  onVerify: (action: 'CONFIRM' | 'EDIT' | 'REJECT', editData?: { value: string | number; unit?: string; notes?: string }) => void;
  onAskAIAboutTest?: () => void;
}

export const StructuredResult: React.FC<StructuredResultProps> = ({
  test,
  isSelected = false,
  onSelect,
  onNavigateToSource,
  onVerify,
  onAskAIAboutTest
}) => {
  const [showProvenanceModal, setShowProvenanceModal] = useState(false);

  const getStatusBadge = (status: ResultStatus) => {
    switch (status) {
      case 'LOW':
      case 'CRITICAL_LOW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide badge-status-low">
            LOW
          </span>
        );
      case 'HIGH':
      case 'CRITICAL_HIGH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide badge-status-high">
            HIGH
          </span>
        );
      case 'NORMAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide badge-status-normal">
            NORMAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide badge-status-unknown">
            UNKNOWN
          </span>
        );
    }
  };

  const isNeedsReview = test.verification.status === 'NEEDS_REVIEW' || test.verification.status === 'LOW_CONFIDENCE' || test.ambiguityDetected;

  return (
    <div
      onClick={onSelect}
      className={`relative p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
        isSelected
          ? 'border-[#218DAE] bg-[#e8f4f8]/50 shadow-sm ring-1 ring-[#218DAE]'
          : isNeedsReview
          ? 'border-[#FFD758] bg-[#FCE59A]/15 hover:bg-[#FCE59A]/25'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left: Test Identification & Value */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {test.testName}
            </h4>
            {getStatusBadge(test.status)}

            {test.ambiguityDetected && (
              <span 
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300"
                title={test.ambiguityReason || 'Non-digit characters or smudge detected. Preserved verbatim.'}
              >
                <AlertTriangle className="w-2.5 h-2.5 text-amber-700" />
                <span>OCR Ambiguity Detected</span>
              </span>
            )}

            {!test.ambiguityDetected && isNeedsReview && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                <AlertTriangle className="w-2.5 h-2.5 text-amber-700" />
                Needs Review
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold font-mono text-slate-900">
              {test.value}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {test.unit}
            </span>
            <span className="text-xs text-slate-400 pl-2 border-l border-slate-200">
              Source Ref Range: <strong className="text-slate-700 font-mono font-medium">{test.referenceRange.rawText}</strong>
            </span>
          </div>

          {/* Ambiguity explanation note */}
          {test.ambiguityReason && (
            <p className="text-[11px] text-amber-800 font-medium mt-1 bg-amber-50 p-1.5 rounded border border-amber-200/80">
              {test.ambiguityReason}
            </p>
          )}

          {/* Provenance & Citation line */}
          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowProvenanceModal(true);
              }}
              className="inline-flex items-center gap-1 text-[#218DAE] hover:underline cursor-pointer font-medium"
            >
              <FileText className="w-3 h-3" />
              <span>{test.provenance.sourceDocument} · p. {test.provenance.page}</span>
            </button>

            <span 
              className="font-mono text-slate-500 inline-flex items-center gap-1 cursor-help"
              title="Confidence refers to extraction reliability from the source, not medical certainty."
            >
              <span>Conf: {test.provenance.confidence}%</span>
              <HelpCircle className="w-3 h-3 text-slate-400" />
            </span>

            {test.canonicalCode && (
              <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                LOINC: {test.canonicalCode}
              </span>
            )}
          </div>
        </div>

        {/* Right: Verification Controls & AI Context Query */}
        <div 
          onClick={e => e.stopPropagation()} 
          className="flex items-center gap-2 shrink-0 self-end sm:self-center"
        >
          {onAskAIAboutTest && (
            <button
              onClick={onAskAIAboutTest}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#2BBBD7] hover:bg-[#eaf9fc] transition-colors cursor-pointer"
              title={`Ask MedLens AI about ${test.testName}`}
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}

          <VerificationControl
            test={test}
            onVerify={onVerify}
          />
        </div>
      </div>

      {/* Modal / Popover for Detailed Provenance */}
      {showProvenanceModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShowProvenanceModal(false);
          }}
        >
          <div onClick={e => e.stopPropagation()}>
            <ProvenanceCard
              testName={test.testName}
              provenance={test.provenance}
              verification={test.verification}
              onNavigateToSource={() => {
                setShowProvenanceModal(false);
                onNavigateToSource?.();
              }}
              onClose={() => setShowProvenanceModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
