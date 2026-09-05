import React, { useState } from 'react';
import { Patient, InconsistencyConflict } from '../../types/medical';
import { ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Check } from 'lucide-react';

interface ConflictCenterViewProps {
  patient?: Patient;
  conflicts: InconsistencyConflict[];
  onResolveConflict: (conflictId: string, resolvedValue: string) => void;
}

export const ConflictCenterView: React.FC<ConflictCenterViewProps> = ({
  patient,
  conflicts,
  onResolveConflict
}) => {
  if (!patient) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#F8FAFB]">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4 shadow-sm">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Patient Profile Active</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5">
          Register a patient profile and upload documents to track cross-document contradictions.
        </p>
      </div>
    );
  }

  const [selectedResolutions, setSelectedResolutions] = useState<{ [id: string]: string }>({});

  const unresolved = conflicts.filter(c => !c.isResolved);
  const resolved = conflicts.filter(c => c.isResolved);

  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-8 bg-[#F8FAFB] select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 text-[11px] font-bold mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>Cross-Document Inconsistency Resolution (Section 15)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Clinical Conflict Center
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Active Patient: <strong className="text-slate-800">{patient.name}</strong> ({patient.patientId}). MedLens identifies conflicting facts across multiple documents without guessing or auto-resolving.
            </p>
          </div>

          <span className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold ${
            unresolved.length > 0 
              ? 'bg-amber-100 text-amber-950 border border-amber-300' 
              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
          }`}>
            {unresolved.length} Unresolved Conflicts
          </span>
        </div>

        {/* Unresolved Conflicts */}
        {unresolved.length > 0 ? (
          <div className="space-y-4">
            {unresolved.map(cnf => {
              const currentChoice = selectedResolutions[cnf.id] || cnf.valueA;

              return (
                <div
                  key={cnf.id}
                  className="p-5 rounded-2xl bg-white border-2 border-amber-300 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-700" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {cnf.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-950">
                      {cnf.conflictType}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {cnf.description}
                  </p>

                  {/* Side-by-Side Values */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Value A */}
                    <div
                      onClick={() => setSelectedResolutions(prev => ({ ...prev, [cnf.id]: cnf.valueA }))}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        currentChoice === cnf.valueA
                          ? 'bg-[#e8f4f8]/50 border-[#218DAE] ring-2 ring-[#218DAE]/30 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Record A</span>
                        {currentChoice === cnf.valueA && (
                          <span className="text-[10px] text-[#218DAE] font-bold">Selected Choice</span>
                        )}
                      </div>
                      <p className="font-bold text-slate-900 text-xs mb-1.5">
                        {cnf.valueA}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Source: {cnf.sourceA}
                      </p>
                    </div>

                    {/* Value B */}
                    <div
                      onClick={() => setSelectedResolutions(prev => ({ ...prev, [cnf.id]: cnf.valueB }))}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        currentChoice === cnf.valueB
                          ? 'bg-[#e8f4f8]/50 border-[#218DAE] ring-2 ring-[#218DAE]/30 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Record B</span>
                        {currentChoice === cnf.valueB && (
                          <span className="text-[10px] text-[#218DAE] font-bold">Selected Choice</span>
                        )}
                      </div>
                      <p className="font-bold text-slate-900 text-xs mb-1.5">
                        {cnf.valueB}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Source: {cnf.sourceB}
                      </p>
                    </div>
                  </div>

                  {/* Action Confirmation */}
                  <div className="pt-2 flex items-center justify-end">
                    <button
                      onClick={() => onResolveConflict(cnf.id, currentChoice)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#218DAE] hover:bg-[#186d88] text-white text-xs font-semibold shadow-sm cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Resolution: "{currentChoice}"</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-800">No Unresolved Document Conflicts</p>
            <p className="text-xs text-slate-400">All cross-document facts are consistent or verified.</p>
          </div>
        )}

        {/* Resolved Conflicts Archive */}
        {resolved.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Resolved Discrepancies Archive ({resolved.length})
            </h3>
            {resolved.map(cnf => (
              <div key={cnf.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">{cnf.title}</span>
                  <p className="text-slate-500 mt-0.5">
                    Confirmed: <strong className="text-emerald-700">{cnf.resolvedValue}</strong>
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Resolved by Clinician
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
