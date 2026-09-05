import React from 'react';
import { AIMessage } from '../../types/medical';
import { FileText, ShieldAlert, Sparkles, User, Info, CheckCircle2, AlertTriangle, ArrowRightLeft } from 'lucide-react';

interface AIMessageItemProps {
  message: AIMessage;
  onFollowUpClick?: (prompt: string) => void;
}

export const AIMessageItem: React.FC<AIMessageItemProps> = ({
  message,
  onFollowUpClick
}) => {
  if (message.sender === 'user') {
    return (
      <div className="flex items-start justify-end gap-2.5 text-sm select-none">
        <div className="max-w-[85%] bg-[#218DAE] text-white p-3.5 rounded-2xl rounded-tr-xs shadow-xs">
          <p className="leading-relaxed whitespace-pre-wrap font-semibold text-sm md:text-base">{message.text}</p>
          <span className="text-xs text-white/70 block text-right mt-1.5 font-mono font-medium">
            {message.timestamp.split('T')[1]?.slice(0, 5) || 'Just now'}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-2xs">
          <User className="w-4 h-4 text-slate-600" />
        </div>
      </div>
    );
  }

  const structured = message.structuredResponse;
  const summary = message.structuredSummary;

  return (
    <div className="flex items-start gap-3 text-sm select-none">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2BBBD7] to-[#218DAE] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-[#2BBBD7]/25">
        <Sparkles className="w-4.5 h-4.5" />
      </div>

      <div className="flex-1 space-y-3 max-w-[95%]">
        {/* Structured Clinical Summary Layout */}
        {summary && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 md:p-5 space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="font-extrabold text-[#218DAE] uppercase tracking-wider text-xs md:text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2BBBD7]" />
                Structured Clinical Summary
              </span>
              <span className="text-xs font-mono text-slate-400 font-semibold">Standard Protocol</span>
            </div>

            {/* Overview */}
            <div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">
                Report Overview
              </span>
              <p className="text-slate-800 font-medium bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed text-sm md:text-base">
                {summary.reportOverview}
              </p>
            </div>

            {/* Outside Range */}
            <div>
              <span className="text-xs font-black text-amber-800 uppercase tracking-wider block mb-1">
                Results Outside Provided Reference Intervals
              </span>
              <div className="space-y-1.5 bg-amber-50/60 p-3 rounded-xl border border-amber-200/80 font-mono text-xs md:text-sm font-semibold text-amber-950">
                {summary.resultsOutsideProvidedRanges.map((res, idx) => (
                  <p key={idx}>{res}</p>
                ))}
              </div>
            </div>

            {/* Changes from Previous */}
            <div>
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#218DAE]" />
                Documented Changes from Prior Records
              </span>
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-slate-700 font-mono text-xs md:text-sm font-medium">
                {summary.changesFromPreviousRecords.map((ch, idx) => (
                  <p key={idx}>{ch}</p>
                ))}
              </div>
            </div>

            {/* Uncertain or Missing Information */}
            <div>
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Uncertain / Missing Information
              </span>
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-slate-700 text-xs md:text-sm font-medium">
                {summary.uncertainOrMissingInformation.map((item, idx) => (
                  <p key={idx}>{item}</p>
                ))}
              </div>
            </div>

            {/* Source Notes */}
            <div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">
                Source Notes & Verification
              </span>
              <ul className="list-disc pl-4 space-y-1 text-xs font-mono text-slate-600">
                {summary.sourceNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>

            {/* Safety Note */}
            <div className="p-3.5 rounded-xl bg-[#e8f4f8] border-l-4 border-[#218DAE] text-xs md:text-sm text-slate-700">
              <span className="font-extrabold text-[#186d88] uppercase tracking-wider text-xs block mb-1">
                Clinical Safety Reminder
              </span>
              <p className="leading-relaxed font-medium">{summary.safetyNote}</p>
            </div>
          </div>
        )}

        {/* Standard 4-Tier Structured Response */}
        {structured && !summary && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 md:p-5 space-y-3.5">
            {/* 1. RECORD FACT */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-[#218DAE]" />
                <span>Documented Findings</span>
              </div>
              <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-wrap bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 text-sm md:text-base">
                {structured.record}
              </p>
            </div>

            {/* 2. SOURCE PROVENANCE */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-[#2BBBD7]" />
                <span>Source Citation</span>
              </div>
              <p className="text-xs md:text-sm font-mono font-medium text-slate-700 bg-[#eaf9fc] p-3 rounded-xl border border-[#2BBBD7]/40 leading-relaxed">
                {structured.source}
              </p>
            </div>

            {/* 3. GENERAL EXPLANATION */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider">
                <Info className="w-4 h-4 text-slate-500" />
                <span>General Educational Explanation</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-sm md:text-base">
                {structured.explanation}
              </p>
            </div>

            {/* 4. SAFE GUIDANCE */}
            <div className="p-3.5 rounded-xl bg-[#e8f4f8] border-l-4 border-[#218DAE] text-xs md:text-sm text-slate-700 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#218DAE] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-extrabold text-[#186d88] uppercase tracking-wider text-xs block">
                  Physician Guidance Note
                </span>
                <p className="leading-relaxed whitespace-pre-wrap text-sm md:text-base font-medium">{structured.note}</p>
              </div>
            </div>
          </div>
        )}

        {/* Fallback Text */}
        {!structured && !summary && message.text && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-slate-800 text-sm md:text-base leading-relaxed shadow-xs">
            {message.text}
          </div>
        )}

        {/* Suggested Follow-Ups */}
        {message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && onFollowUpClick && (
          <div className="flex flex-wrap gap-2 pt-1">
            {message.suggestedFollowUps.map((followUp, idx) => (
              <button
                key={idx}
                onClick={() => onFollowUpClick(followUp)}
                className="text-left text-xs md:text-sm font-bold text-slate-700 bg-white hover:bg-[#eaf9fc] hover:text-[#186d88] border border-slate-200 hover:border-[#2BBBD7] px-3.5 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs"
              >
                {followUp}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
