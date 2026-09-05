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
      <div className="flex items-start justify-end gap-2 text-xs select-none">
        <div className="max-w-[85%] bg-[#218DAE] text-white p-3 rounded-2xl rounded-tr-xs shadow-2xs">
          <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
          <span className="text-[10px] text-white/60 block text-right mt-1 font-mono">
            {message.timestamp.split('T')[1]?.slice(0, 5) || 'Just now'}
          </span>
        </div>
        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-1">
          <User className="w-3.5 h-3.5 text-slate-600" />
        </div>
      </div>
    );
  }

  const structured = message.structuredResponse;
  const summary = message.structuredSummary;

  return (
    <div className="flex items-start gap-2.5 text-xs select-none">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2BBBD7] to-[#218DAE] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-[#2BBBD7]/20">
        <Sparkles className="w-4 h-4" />
      </div>

      <div className="flex-1 space-y-2.5 max-w-[95%]">
        {/* Structured Clinical Summary Layout (Section 24) */}
        {summary && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-[#218DAE] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2BBBD7]" />
                Structured Clinical Summary
              </span>
              <span className="text-[10px] font-mono text-slate-400">Section 24 Protocol</span>
            </div>

            {/* Overview */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Report Overview
              </span>
              <p className="text-slate-800 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                {summary.reportOverview}
              </p>
            </div>

            {/* Outside Range */}
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                Results Outside Provided Reference Intervals
              </span>
              <div className="space-y-1 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60 font-mono text-[11px] text-amber-950">
                {summary.resultsOutsideProvidedRanges.map((res, idx) => (
                  <p key={idx}>{res}</p>
                ))}
              </div>
            </div>

            {/* Changes from Previous */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3 text-[#218DAE]" />
                Documented Changes from Prior Records
              </span>
              <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-slate-700 font-mono text-[11px]">
                {summary.changesFromPreviousRecords.map((ch, idx) => (
                  <p key={idx}>{ch}</p>
                ))}
              </div>
            </div>

            {/* Uncertain or Missing Information */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                Uncertain / Missing Information
              </span>
              <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-slate-600 text-[11px]">
                {summary.uncertainOrMissingInformation.map((item, idx) => (
                  <p key={idx}>{item}</p>
                ))}
              </div>
            </div>

            {/* Source Notes */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Source Notes & Verification
              </span>
              <ul className="list-disc pl-4 space-y-0.5 text-[10px] font-mono text-slate-500">
                {summary.sourceNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>

            {/* Safety Note */}
            <div className="p-2.5 rounded-lg bg-[#e8f4f8] border-l-2 border-[#218DAE] text-[11px] text-slate-700">
              <span className="font-bold text-[#186d88] uppercase tracking-wider text-[10px] block mb-0.5">
                Clinical Safety Reminder
              </span>
              <p className="leading-relaxed">{summary.safetyNote}</p>
            </div>
          </div>
        )}

        {/* Standard 4-Tier Structured Response (Section 19) */}
        {structured && !summary && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3">
            {/* 1. RECORD FACT */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <FileText className="w-3 h-3 text-[#218DAE]" />
                <span>Documented Findings</span>
              </div>
              <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-wrap bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                {structured.record}
              </p>
            </div>

            {/* 2. SOURCE PROVENANCE */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3 text-[#2BBBD7]" />
                <span>Source Citation</span>
              </div>
              <p className="text-[11px] font-mono text-slate-600 bg-[#eaf9fc]/60 p-2 rounded-lg border border-[#2BBBD7]/30">
                {structured.source}
              </p>
            </div>

            {/* 3. GENERAL EXPLANATION */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <Info className="w-3 h-3 text-slate-500" />
                <span>General Educational Explanation</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {structured.explanation}
              </p>
            </div>

            {/* 4. SAFE GUIDANCE */}
            <div className="p-2.5 rounded-lg bg-[#e8f4f8] border-l-2 border-[#218DAE] text-[11px] text-slate-700 flex items-start gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-[#218DAE] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-[#186d88] uppercase tracking-wider text-[10px] block">
                  Physician Guidance Note
                </span>
                <p className="leading-relaxed whitespace-pre-wrap">{structured.note}</p>
              </div>
            </div>
          </div>
        )}

        {/* Fallback Text */}
        {!structured && !summary && message.text && (
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 text-slate-700 leading-relaxed shadow-xs">
            {message.text}
          </div>
        )}

        {/* Suggested Follow-Ups */}
        {message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && onFollowUpClick && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {message.suggestedFollowUps.map((followUp, idx) => (
              <button
                key={idx}
                onClick={() => onFollowUpClick(followUp)}
                className="text-left text-[11px] font-medium text-slate-600 bg-white hover:bg-[#eaf9fc] hover:text-[#186d88] border border-slate-200 hover:border-[#2BBBD7] px-2.5 py-1 rounded-full transition-all cursor-pointer shadow-2xs"
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
