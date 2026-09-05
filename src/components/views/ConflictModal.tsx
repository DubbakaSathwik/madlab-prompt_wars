import React, { useState } from 'react';
import { InconsistencyConflict } from '../../types/medical';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, FileText, ArrowRight } from 'lucide-react';

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: InconsistencyConflict[];
  onResolveConflict: (conflictId: string, resolvedValue: string) => void;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({
  isOpen,
  onClose,
  conflicts,
  onResolveConflict
}) => {
  const [selectedResolution, setSelectedResolution] = useState<{ [conflictId: string]: string }>({});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4 select-none">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 text-xs flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Potential Inconsistencies Detected ({conflicts.length})
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                MedLens never automatically chooses which record is correct. Clinician verification is required.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conflicts List */}
        <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1">
          {conflicts.map(cnf => {
            const currentChoice = selectedResolution[cnf.id] || cnf.valueA;

            return (
              <div
                key={cnf.id}
                className="p-4 rounded-2xl border border-amber-200 bg-amber-50/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {cnf.title}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-950 uppercase">
                    {cnf.conflictType}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {cnf.description}
                </p>

                {/* 2-Card Comparison for Values */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Option A */}
                  <div
                    onClick={() => setSelectedResolution(prev => ({ ...prev, [cnf.id]: cnf.valueA }))}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      currentChoice === cnf.valueA
                        ? 'bg-white border-[#218DAE] ring-2 ring-[#218DAE]/30 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Document A</span>
                      {currentChoice === cnf.valueA && (
                        <span className="text-[10px] text-[#218DAE] font-bold">Selected</span>
                      )}
                    </div>
                    <p className="font-bold text-slate-900 text-xs mb-1">
                      {cnf.valueA}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Source: {cnf.sourceA}
                    </p>
                  </div>

                  {/* Option B */}
                  <div
                    onClick={() => setSelectedResolution(prev => ({ ...prev, [cnf.id]: cnf.valueB }))}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      currentChoice === cnf.valueB
                        ? 'bg-white border-[#218DAE] ring-2 ring-[#218DAE]/30 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Document B</span>
                      {currentChoice === cnf.valueB && (
                        <span className="text-[10px] text-[#218DAE] font-bold">Selected</span>
                      )}
                    </div>
                    <p className="font-bold text-slate-900 text-xs mb-1">
                      {cnf.valueB}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Source: {cnf.sourceB}
                    </p>
                  </div>
                </div>

                {/* Confirm Resolution Action */}
                <div className="pt-2 flex items-center justify-end">
                  <button
                    onClick={() => onResolveConflict(cnf.id, currentChoice)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#218DAE] hover:bg-[#186d88] text-white text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Clinical Resolution: "{currentChoice}"</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span>All conflict resolutions are immutably recorded in the clinical audit history.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
