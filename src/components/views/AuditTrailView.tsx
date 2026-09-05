import React, { useState } from 'react';
import { AuditEvent } from '../../types/medical';
import { Clock, ShieldCheck, Cpu, User, Filter, ArrowRight } from 'lucide-react';

interface AuditTrailViewProps {
  auditEvents: AuditEvent[];
  patientName: string;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  auditEvents,
  patientName
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'SYSTEM' | 'USER'>('ALL');

  const filtered = auditEvents.filter(evt => {
    const isSystem = evt.actor.toLowerCase().includes('pipeline') || evt.actor.toLowerCase().includes('auto') || evt.actor.toLowerCase().includes('medlens');
    if (filterType === 'SYSTEM') return isSystem;
    if (filterType === 'USER') return !isSystem;
    return true;
  });

  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-8 bg-[#F8FAFB] select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e8f4f8] text-[#186d88] text-[11px] font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#218DAE]" />
              <span>Immutable Traceability & HIPAA Audit Log (Section 19)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Clinical Audit History
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Complete chronological audit trail distinguishing automated pipeline events from verified human clinician actions for {patientName}.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filterType === 'ALL' ? 'bg-[#218DAE] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Events ({auditEvents.length})
            </button>
            <button
              onClick={() => setFilterType('USER')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filterType === 'USER' ? 'bg-[#218DAE] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              User / Clinician
            </button>
            <button
              onClick={() => setFilterType('SYSTEM')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filterType === 'SYSTEM' ? 'bg-[#218DAE] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              System Pipeline
            </button>
          </div>
        </div>

        {/* Audit Events Stream */}
        <div className="space-y-3">
          {filtered.map(evt => {
            const isSystem = evt.actor.toLowerCase().includes('pipeline') || evt.actor.toLowerCase().includes('auto') || evt.actor.toLowerCase().includes('medlens');

            return (
              <div
                key={evt.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    isSystem ? 'bg-slate-100 text-slate-700' : 'bg-[#e8f4f8] text-[#218DAE]'
                  }`}>
                    {isSystem ? <Cpu className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-xs">{evt.action}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase font-mono ${
                        isSystem ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {isSystem ? 'SYSTEM EVENT' : 'USER ACTION'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-snug">
                      {evt.details}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono">
                      <span>Actor: <strong className="text-slate-700">{evt.actor}</strong></span>
                      {evt.previousValue !== undefined && evt.newValue !== undefined && (
                        <span>
                          Value Shift: "{evt.previousValue}" → <strong className="text-emerald-700">"{evt.newValue}"</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{evt.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
