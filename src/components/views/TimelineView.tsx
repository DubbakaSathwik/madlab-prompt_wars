import React from 'react';
import { TimelineEvent } from '../../types/medical';
import { History, FileText, Pill, Stethoscope, ArrowRight, Calendar, CheckCircle2 } from 'lucide-react';

interface TimelineViewProps {
  events: TimelineEvent[];
  patientName: string;
  onOpenReport: (reportId: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  events,
  patientName,
  onOpenReport
}) => {
  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-8 bg-[#F8FAFB] select-none">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e8f4f8] text-[#186d88] text-[11px] font-semibold mb-2">
            <History className="w-3.5 h-3.5 text-[#218DAE]" />
            <span>Chronological Patient Journey</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Clinical Timeline: {patientName}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Chronological log of all uploaded laboratory documents, prescriptions, and clinical encounters. Click any record to inspect.
          </p>
        </div>

        {/* Timeline Stream */}
        {events.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 text-center shadow-xs">
            <p className="text-slate-500 font-medium text-xs">
              No clinical events recorded for this patient yet.
            </p>
            <p className="text-slate-400 text-[11px] mt-1">
              Upload laboratory reports or enter encounters to populate the longitudinal timeline.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-slate-200 space-y-8 my-6">
            {events.map((evt, idx) => {
            const isReport = evt.type === 'REPORT';
            const isPrescription = evt.type === 'PRESCRIPTION';

            return (
              <div key={evt.id} className="relative group">
                {/* Timeline Node Dot */}
                <div
                  className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-white transition-all ${
                    isReport
                      ? 'border-[#218DAE] group-hover:scale-125'
                      : 'border-emerald-500 group-hover:scale-125'
                  }`}
                />

                {/* Event Card */}
                <div
                  onClick={() => evt.reportId && onOpenReport(evt.reportId)}
                  className={`p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs transition-all ${
                    evt.reportId ? 'hover:border-[#218DAE] hover:shadow-xs cursor-pointer' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#218DAE] bg-[#e8f4f8] px-2.5 py-0.5 rounded-md">
                        {evt.date}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 uppercase">
                        {evt.type}
                      </span>
                    </div>

                    {evt.statusText && (
                      <span className="text-[11px] font-semibold text-slate-600">
                        {evt.statusText}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {evt.summary}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
                    <span>{evt.facility || 'Clinical Facility'}</span>

                    {evt.reportId && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#218DAE] group-hover:underline">
                        <span>Open Document</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
};
