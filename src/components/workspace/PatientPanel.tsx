import React from 'react';
import { 
  User, 
  Activity, 
  Pill, 
  AlertCircle, 
  FileText, 
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Patient, ClinicalReport, SourceCategory } from '../../types/medical';

interface PatientPanelProps {
  patient: Patient;
  activeReportId?: string;
  onSelectReport: (reportId: string) => void;
}

export const PatientPanel: React.FC<PatientPanelProps> = ({
  patient,
  activeReportId,
  onSelectReport
}) => {
  const renderSourceBadge = (source: SourceCategory) => {
    switch (source) {
      case 'PATIENT_PROVIDED':
        return (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            PATIENT PROVIDED
          </span>
        );
      case 'DOCUMENT_EXTRACTED':
        return (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#e8f4f8] text-[#186d88] border border-[#218DAE]/30">
            DOC EXTRACTED
          </span>
        );
      case 'AI_GENERATED':
        return (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#eaf9fc] text-[#1fa2bb] border border-[#2BBBD7]/30 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            AI GENERATED
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            VERIFIED
          </span>
        );
      case 'NEEDS_REVIEW':
        return (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#FCE59A]/40 text-amber-900 border border-[#FFD758]/60 flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" />
            NEEDS REVIEW
          </span>
        );
    }
  };

  return (
    <aside className="w-full h-full bg-white border-r border-slate-200/90 flex flex-col select-none overflow-hidden">
      {/* Patient Header Card */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#218DAE] text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-[#218DAE]/20">
              {patient.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                {patient.name}
              </h2>
              <p className="text-[11px] font-mono text-slate-500">
                ID: {patient.patientId}
              </p>
            </div>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
            {patient.sex} · {patient.age}y
          </span>
        </div>

        {/* Quick Demographic Metrics */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/70 text-xs">
          <div>
            <span className="text-[10px] font-medium text-slate-400 block uppercase">Blood Group</span>
            <span className="font-semibold text-slate-700">{patient.bloodGroup || 'Not Recorded'}</span>
          </div>
          <div>
            <span className="text-[10px] font-medium text-slate-400 block uppercase">Date of Birth</span>
            <span className="font-medium text-slate-700">{patient.dateOfBirth}</span>
          </div>
        </div>
      </div>

      {/* Scrollable Clinical Context Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* Recent Reports List */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#218DAE]" />
              <span>Patient Reports ({patient.reports.length})</span>
            </h3>
          </div>
          <div className="space-y-1.5">
            {patient.reports.length === 0 ? (
              <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
                <p className="text-slate-400 italic text-[11px]">No clinical documents uploaded yet.</p>
              </div>
            ) : (
              patient.reports.map((report: ClinicalReport) => {
                const isSelected = report.id === activeReportId;
                const hasReview = report.verificationSummary.needsReview > 0;
                return (
                  <button
                    key={report.id}
                    onClick={() => onSelectReport(report.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#218DAE] bg-[#e8f4f8]/80 text-[#186d88] shadow-sm'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs truncate max-w-[170px]">
                        {report.reportName}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {report.date}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                      <span>{report.tests.length} tests</span>
                      {hasReview ? (
                        <span className="text-amber-800 bg-[#FCE59A]/50 px-1.5 py-0.2 rounded text-[10px] font-medium">
                          {report.verificationSummary.needsReview} to review
                        </span>
                      ) : (
                        <span className="text-emerald-700 text-[10px] font-medium">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Known Allergies */}
        <section>
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Documented Allergies ({patient.allergies.length})</span>
          </h3>
          {patient.allergies.length > 0 ? (
            <div className="space-y-1.5">
              {patient.allergies.map(alg => (
                <div key={alg.id} className="p-2 rounded-lg bg-rose-50/50 border border-rose-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">{alg.substance}</span>
                    <span className="text-[10px] font-bold text-rose-700 uppercase">
                      {alg.severity}
                    </span>
                  </div>
                  {alg.reaction && (
                    <p className="text-[11px] text-slate-500 mt-0.5">{alg.reaction}</p>
                  )}
                  <div className="mt-1.5">
                    {renderSourceBadge(alg.source)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic text-[11px]">No known drug allergies documented.</p>
          )}
        </section>

        {/* Existing Conditions */}
        <section>
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Activity className="w-3.5 h-3.5 text-[#218DAE]" />
            <span>Active Conditions ({patient.conditions.length})</span>
          </h3>
          <div className="space-y-1.5">
            {patient.conditions.map(cnd => (
              <div key={cnd.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800 text-xs">{cnd.name}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    cnd.status === 'ACTIVE' 
                      ? 'bg-slate-200 text-slate-700' 
                      : 'bg-[#FCE59A]/50 text-amber-900'
                  }`}>
                    {cnd.status.replace('_', ' ')}
                  </span>
                </div>
                {cnd.notes && (
                  <p className="text-[11px] text-slate-500 mt-0.5">{cnd.notes}</p>
                )}
                <div className="mt-1.5">
                  {renderSourceBadge(cnd.source)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Current Medications */}
        <section>
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Pill className="w-3.5 h-3.5 text-[#218DAE]" />
            <span>Current Medications ({patient.medications.length})</span>
          </h3>
          <div className="space-y-1.5">
            {patient.medications.map(med => (
              <div key={med.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-xs">{med.name}</span>
                  <span className="font-mono text-slate-600 text-[10px]">{med.dosage}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{med.frequency}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  {renderSourceBadge(med.source)}
                  {med.prescribingDoctor && (
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {med.prescribingDoctor}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Symptoms */}
        {patient.symptoms.length > 0 && (
          <section>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Reported Symptoms</span>
            </h3>
            <div className="space-y-1.5">
              {patient.symptoms.map(sym => (
                <div key={sym.id} className="p-2 rounded-lg bg-amber-50/40 border border-amber-200/40">
                  <p className="text-xs font-medium text-slate-800">{sym.description}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Onset: {sym.onset} ({sym.severity})</p>
                  <div className="mt-1.5">
                    {renderSourceBadge(sym.source)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
};
