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
  AlertTriangle,
  Trash2,
  Plus
} from 'lucide-react';
import { Patient, ClinicalReport, SourceCategory } from '../../types/medical';

interface PatientPanelProps {
  patient: Patient;
  activeReportId?: string;
  onSelectReport: (reportId: string) => void;
  onDeleteReport?: (reportId: string) => void;
  onOpenAddClinicalModal?: (type?: 'TEST' | 'ALLERGY' | 'CONDITION' | 'MEDICATION') => void;
}

export const PatientPanel: React.FC<PatientPanelProps> = ({
  patient,
  activeReportId,
  onSelectReport,
  onDeleteReport,
  onOpenAddClinicalModal
}) => {
  const renderSourceBadge = (source: SourceCategory) => {
    switch (source) {
      case 'PATIENT_PROVIDED':
        return (
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            PATIENT PROVIDED
          </span>
        );
      case 'DOCUMENT_EXTRACTED':
        return (
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#e8f4f8] text-[#186d88] border border-[#218DAE]/30">
            DOC EXTRACTED
          </span>
        );
      case 'AI_GENERATED':
        return (
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#eaf9fc] text-[#1fa2bb] border border-[#2BBBD7]/30 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            AI GENERATED
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            VERIFIED
          </span>
        );
      case 'NEEDS_REVIEW':
        return (
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#FCE59A]/50 text-amber-950 border border-[#FFD758]/70 flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            NEEDS REVIEW
          </span>
        );
    }
  };

  return (
    <aside className="w-full h-full bg-white border-r border-slate-200/90 flex flex-col select-none overflow-hidden">
      {/* Patient Header Card */}
      <div className="p-4 md:p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#218DAE] text-white flex items-center justify-center font-black text-base shadow-sm shadow-[#218DAE]/25 shrink-0">
              {patient.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black text-slate-900 leading-tight">
                {patient.name}
              </h2>
              <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">
                ID: {patient.patientId}
              </p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-200/80 text-slate-800 font-bold shrink-0">
            {patient.sex} · {patient.age}y
          </span>
        </div>

        {/* Quick Demographic Metrics */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-slate-200/70 text-sm">
          <div>
            <span className="text-xs font-black text-slate-400 block uppercase tracking-wider">Blood Group</span>
            <span className="font-extrabold text-slate-900 text-sm md:text-base mt-0.5 block">{patient.bloodGroup || 'Not Recorded'}</span>
          </div>
          <div>
            <span className="text-xs font-black text-slate-400 block uppercase tracking-wider">Date of Birth</span>
            <span className="font-bold text-slate-800 text-sm md:text-base mt-0.5 block">{patient.dateOfBirth}</span>
          </div>
        </div>
      </div>

      {/* Scrollable Clinical Context Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6 text-sm">
        {/* Recent Reports List */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs md:text-sm font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#218DAE]" />
              <span>Patient Reports ({patient.reports.length})</span>
            </h3>
            {onOpenAddClinicalModal && (
              <button
                type="button"
                onClick={() => onOpenAddClinicalModal('TEST')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#186d88] hover:text-[#218DAE] hover:underline cursor-pointer"
                title="Add custom biomarker test to this report"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Test</span>
              </button>
            )}
          </div>
          <div className="space-y-2">
            {patient.reports.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
                <p className="text-slate-400 italic text-xs md:text-sm">No clinical documents uploaded yet.</p>
              </div>
            ) : (
              patient.reports.map((report: ClinicalReport) => {
                const isSelected = report.id === activeReportId;
                const hasReview = report.verificationSummary.needsReview > 0;
                return (
                  <div
                    key={report.id}
                    onClick={() => onSelectReport(report.id)}
                    className={`group w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-[#218DAE] bg-[#e8f4f8]/90 text-[#186d88] shadow-xs ring-1 ring-[#218DAE]/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-slate-900 truncate pr-2">
                        {report.reportName}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-slate-400 font-mono font-semibold">
                          {report.date}
                        </span>
                        {onDeleteReport && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to delete report "${report.reportName}"? This will remove all associated test extractions.`)) {
                                onDeleteReport(report.id);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete this report"
                            aria-label={`Delete ${report.reportName}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-slate-500 font-medium">
                      <span>{report.tests.length} biomarkers</span>
                      {hasReview ? (
                        <span className="text-amber-900 bg-[#FCE59A]/60 px-2 py-0.5 rounded-lg text-xs font-bold border border-[#FFD758]/60">
                          {report.verificationSummary.needsReview} to review
                        </span>
                      ) : (
                        <span className="text-emerald-700 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Known Allergies */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs md:text-sm font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>Documented Allergies ({patient.allergies.length})</span>
            </h3>
            {onOpenAddClinicalModal && (
              <button
                type="button"
                onClick={() => onOpenAddClinicalModal('ALLERGY')}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-800 hover:underline cursor-pointer"
                title="Add documented allergy"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
          {patient.allergies.length > 0 ? (
            <div className="space-y-2">
              {patient.allergies.map(alg => (
                <div key={alg.id} className="p-3 rounded-xl bg-rose-50/60 border border-rose-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{alg.substance}</span>
                    <span className="text-xs font-black text-rose-700 uppercase">
                      {alg.severity}
                    </span>
                  </div>
                  {alg.reaction && (
                    <p className="text-xs text-slate-600 mt-1">{alg.reaction}</p>
                  )}
                  <div className="mt-2">
                    {renderSourceBadge(alg.source)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic text-xs">No known drug allergies documented.</p>
          )}
        </section>

        {/* Existing Conditions */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs md:text-sm font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#218DAE]" />
              <span>Active Conditions ({patient.conditions.length})</span>
            </h3>
            {onOpenAddClinicalModal && (
              <button
                type="button"
                onClick={() => onOpenAddClinicalModal('CONDITION')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#186d88] hover:text-[#218DAE] hover:underline cursor-pointer"
                title="Add documented condition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
          <div className="space-y-2">
            {patient.conditions.map(cnd => (
              <div key={cnd.id} className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">{cnd.name}</span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-md uppercase ${
                    cnd.status === 'ACTIVE' 
                      ? 'bg-slate-200 text-slate-800' 
                      : 'bg-[#FCE59A]/60 text-amber-950'
                  }`}>
                    {cnd.status.replace('_', ' ')}
                  </span>
                </div>
                {cnd.notes && (
                  <p className="text-xs text-slate-600 mt-1">{cnd.notes}</p>
                )}
                <div className="mt-2">
                  {renderSourceBadge(cnd.source)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Current Medications */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs md:text-sm font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Pill className="w-4 h-4 text-[#218DAE]" />
              <span>Current Medications ({patient.medications.length})</span>
            </h3>
            {onOpenAddClinicalModal && (
              <button
                type="button"
                onClick={() => onOpenAddClinicalModal('MEDICATION')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#186d88] hover:text-[#218DAE] hover:underline cursor-pointer"
                title="Add documented medication"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
          <div className="space-y-2">
            {patient.medications.map(med => (
              <div key={med.id} className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{med.name}</span>
                  <span className="font-mono text-slate-700 text-xs md:text-sm font-bold bg-slate-100 px-2 py-0.5 rounded-md">{med.dosage}</span>
                </div>
                <p className="text-xs md:text-sm text-slate-600 mt-1">{med.frequency}</p>
                <div className="mt-2 flex items-center justify-between">
                  {renderSourceBadge(med.source)}
                  {med.prescribingDoctor && (
                    <span className="text-xs font-medium text-slate-500 truncate max-w-[140px]">
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
            <h3 className="text-xs md:text-sm font-black text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Reported Symptoms</span>
            </h3>
            <div className="space-y-2">
              {patient.symptoms.map(sym => (
                <div key={sym.id} className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/50">
                  <p className="text-sm font-bold text-slate-900">{sym.description}</p>
                  <p className="text-xs text-slate-600 mt-1">Onset: {sym.onset} ({sym.severity})</p>
                  <div className="mt-2">
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
