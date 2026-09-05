import React from 'react';
import { Patient, SourceCategory } from '../../types/medical';
import { ArrowLeft, User, Activity, AlertCircle, Pill, Calendar, FileText, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

interface PatientProfileViewProps {
  patient?: Patient;
  onBack: () => void;
  onOpenWorkspace: () => void;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patient,
  onBack,
  onOpenWorkspace
}) => {
  if (!patient) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#F8FAFB]">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4 shadow-sm">
          <User className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Patient Profile Found</h3>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 rounded-xl bg-[#218DAE] text-white text-xs font-semibold hover:bg-[#186d88] transition-colors"
        >
          Back to Directory
        </button>
      </div>
    );
  }
  const renderSourceBadge = (source: SourceCategory) => {
    switch (source) {
      case 'PATIENT_PROVIDED':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            PATIENT PROVIDED
          </span>
        );
      case 'DOCUMENT_EXTRACTED':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#e8f4f8] text-[#186d88] border border-[#218DAE]/30">
            DOCUMENT EXTRACTED
          </span>
        );
      case 'AI_GENERATED':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#eaf9fc] text-[#1fa2bb] border border-[#2BBBD7]/30 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            AI GENERATED
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            VERIFIED
          </span>
        );
      case 'NEEDS_REVIEW':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#FCE59A]/50 text-amber-900 border border-[#FFD758]/60 flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" />
            NEEDS REVIEW
          </span>
        );
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-8 bg-[#F8FAFB] select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to directory</span>
          </button>

          <button
            onClick={onOpenWorkspace}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#218DAE] hover:bg-[#186d88] text-white text-xs font-semibold shadow-sm shadow-[#218DAE]/20 transition-all cursor-pointer"
          >
            <span>Open in Clinical Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Patient Identity Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#218DAE] text-white flex items-center justify-center font-bold text-xl shadow-sm">
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{patient.name}</h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {patient.sex} · {patient.age} Years
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                MRN: {patient.patientId} · DOB: {patient.dateOfBirth} · Blood Group: {patient.bloodGroup || 'Unknown'}
              </p>
            </div>
          </div>

          <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact</span>
            <p className="text-slate-700">{patient.phone}</p>
            <p className="text-slate-500 text-[11px]">{patient.emergencyContact}</p>
          </div>
        </div>

        {/* Section 1: Documented Allergies */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>Documented Allergies ({patient.allergies.length})</span>
            </h2>
            <span className="text-[11px] text-slate-400">Strict Source Provenance</span>
          </div>

          {patient.allergies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {patient.allergies.map(alg => (
                <div key={alg.id} className="p-3.5 rounded-xl bg-rose-50/40 border border-rose-100 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{alg.substance}</span>
                      <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                        {alg.severity}
                      </span>
                    </div>
                    {alg.reaction && (
                      <p className="text-slate-600 mt-1 text-xs">{alg.reaction}</p>
                    )}
                  </div>
                  <div className="pt-2 border-t border-rose-100/80 flex items-center justify-between">
                    {renderSourceBadge(alg.source)}
                    <span className="text-[10px] text-slate-400 font-mono">Noted: {alg.dateNoted}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No drug allergies recorded.</p>
          )}
        </div>

        {/* Section 2: Active Conditions */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#218DAE]" />
            <span>Active & Monitored Conditions ({patient.conditions.length})</span>
          </h2>

          <div className="space-y-3 text-xs">
            {patient.conditions.map(cnd => (
              <div key={cnd.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{cnd.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-200 text-slate-700">
                      {cnd.status.replace('_', ' ')}
                    </span>
                  </div>
                  {cnd.notes && (
                    <p className="text-slate-500 text-xs">{cnd.notes}</p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {renderSourceBadge(cnd.source)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Documented Medications */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Pill className="w-4 h-4 text-[#218DAE]" />
            <span>Current Medications ({patient.medications.length})</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {patient.medications.map(med => (
              <div key={med.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{med.name}</span>
                  <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                    {med.dosage}
                  </span>
                </div>
                <p className="text-slate-600 text-xs">{med.frequency} · {med.route}</p>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  {renderSourceBadge(med.source)}
                  {med.prescribingDoctor && (
                    <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                      {med.prescribingDoctor}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
