import React, { useState } from 'react';
import { Patient } from '../../types/medical';
import { Search, UserPlus, User, FileText, ArrowRight, ShieldCheck, Filter, Plus } from 'lucide-react';

interface PatientsViewProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onViewProfile: (patientId: string) => void;
  onOpenNewPatient?: () => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  onSelectPatient,
  onViewProfile,
  onOpenNewPatient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSex, setFilterSex] = useState<'ALL' | 'Female' | 'Male'>('ALL');

  const filtered = patients.filter(patient => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = patient.name.toLowerCase().includes(q);
      const matchId = patient.patientId.toLowerCase().includes(q);
      if (!matchName && !matchId) return false;
    }

    if (filterSex !== 'ALL' && patient.sex !== filterSex) {
      return false;
    }

    return true;
  });

  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-8 bg-[#F8FAFB] select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Patient Records Directory
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Select a patient profile to review laboratory documents, medications, and clinical context.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
              {patients.length} Active Records
            </span>

            {onOpenNewPatient && (
              <button
                onClick={onOpenNewPatient}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#218DAE] hover:bg-[#186d88] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Patient</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by patient name or MRN..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#218DAE]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-medium">Filter Sex:</span>
            <select
              value={filterSex}
              onChange={e => setFilterSex(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 cursor-pointer focus:outline-none"
            >
              <option value="ALL">All Demographics</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
        </div>

        {/* Patient Cards Grid */}
        {patients.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#e8f4f8] text-[#218DAE] flex items-center justify-center mx-auto">
              <UserPlus className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">
                No Patients Registered Yet
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add your first patient profile to begin organizing clinical records, laboratory reports, and Medical JSON structures.
              </p>
            </div>
            {onOpenNewPatient && (
              <button
                onClick={onOpenNewPatient}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#218DAE] hover:bg-[#186d88] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Register First Patient</span>
              </button>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            No patients found matching your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(patient => {
              const latestReport = patient.reports[0];
              const hasReview = patient.reports.some(r => r.verificationSummary.needsReview > 0);

              return (
                <div
                  key={patient.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-[#218DAE]/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-[#218DAE] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-sm font-bold text-slate-900 leading-tight">
                            {patient.name}
                          </h2>
                          <p className="text-[11px] font-mono text-slate-400">
                            ID: {patient.patientId}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {patient.age}y · {patient.sex}
                      </span>
                    </div>

                    <div className="space-y-2 py-3 border-t border-b border-slate-100 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Blood Group:</span>
                        <span className="font-semibold">{patient.bloodGroup || 'Not Recorded'}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Total Reports:</span>
                        <span className="font-semibold font-mono">{patient.reports.length}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Latest Document:</span>
                        <span className="font-medium truncate max-w-[140px]" title={latestReport?.reportName || 'None'}>
                          {latestReport?.reportName || 'No reports yet'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Review Status:</span>
                        {hasReview ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FCE59A]/60 text-amber-900">
                            Requires Review
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                            All Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-4 pt-2">
                    <button
                      onClick={() => onViewProfile(patient.id)}
                      className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      View Context
                    </button>

                    <button
                      onClick={() => onSelectPatient(patient.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#218DAE] hover:bg-[#186d88] text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
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
