import React, { useState } from 'react';
import { ClinicalReport, LabResult, InconsistencyConflict } from '../../types/medical';
import { StructuredResult } from './StructuredResult';
import { Search, Filter, AlertTriangle, CheckCircle2, SlidersHorizontal, ShieldAlert, ArrowRight, Plus } from 'lucide-react';

interface StructuredViewProps {
  report: ClinicalReport;
  selectedTestId?: string;
  onSelectTest: (testId: string) => void;
  onNavigateToSource: () => void;
  onVerifyTest: (
    testId: string, 
    action: 'CONFIRM' | 'EDIT' | 'REJECT', 
    editData?: { value: string | number; unit?: string; notes?: string }
  ) => void;
  onAskAIAboutTest: (test: LabResult) => void;
  conflicts?: InconsistencyConflict[];
  onOpenConflictsModal?: () => void;
  onOpenAddTest?: () => void;
}

export const StructuredView: React.FC<StructuredViewProps> = ({
  report,
  selectedTestId,
  onSelectTest,
  onNavigateToSource,
  onVerifyTest,
  onAskAIAboutTest,
  conflicts = [],
  onOpenConflictsModal,
  onOpenAddTest
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OUTSIDE_RANGE' | 'NEEDS_REVIEW' | 'NORMAL' | 'LOW' | 'HIGH'>('ALL');
  const [confidenceFilter, setConfidenceFilter] = useState<'ALL' | 'HIGH' | 'MED' | 'LOW'>('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const withinRangeCount = report.tests.filter(t => t.status === 'NORMAL').length;
  const outsideRangeCount = report.tests.filter(t => t.status === 'LOW' || t.status === 'HIGH').length;
  const needsReviewCount = report.tests.filter(
    t => t.verification.status === 'NEEDS_REVIEW' || t.verification.status === 'LOW_CONFIDENCE' || t.ambiguityDetected
  ).length;

  const unresolvedConflicts = conflicts.filter(c => !c.isResolved);

  const filteredTests = report.tests.filter(test => {
    // Search filter across test name, category, unit, and date
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = test.testName.toLowerCase().includes(q);
      const matchCat = test.category.toLowerCase().includes(q);
      const matchUnit = test.unit.toLowerCase().includes(q);
      const matchDate = test.date.includes(q);
      if (!matchName && !matchCat && !matchUnit && !matchDate) return false;
    }

    // Status filter
    if (statusFilter === 'OUTSIDE_RANGE') {
      if (test.status !== 'LOW' && test.status !== 'HIGH') return false;
    } else if (statusFilter === 'NEEDS_REVIEW') {
      if (test.verification.status !== 'NEEDS_REVIEW' && !test.ambiguityDetected) return false;
    } else if (statusFilter === 'NORMAL') {
      if (test.status !== 'NORMAL') return false;
    } else if (statusFilter === 'LOW') {
      if (test.status !== 'LOW') return false;
    } else if (statusFilter === 'HIGH') {
      if (test.status !== 'HIGH') return false;
    }

    // Confidence filter (Section 9 & 26)
    const conf = test.provenance.confidence;
    if (confidenceFilter === 'HIGH' && conf < 85) return false;
    if (confidenceFilter === 'MED' && (conf < 70 || conf >= 85)) return false;
    if (confidenceFilter === 'LOW' && conf >= 70) return false;

    return true;
  });

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-y-auto bg-slate-50/50 select-none">
      {/* Potential Inconsistency Detected Alert Banner (Section 13) */}
      {unresolvedConflicts.length > 0 && onOpenConflictsModal && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900 shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                Potential inconsistency detected ({unresolvedConflicts.length})
              </h4>
              <p className="text-xs text-amber-900 leading-snug mt-0.5">
                {unresolvedConflicts[0].title}. MedLens does not automatically choose which record is correct; human review is required.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenConflictsModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-2xs transition-colors"
          >
            <span>Review Conflict</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1">
            Total Extracted Tests
          </span>
          <span className="text-2xl md:text-3xl font-black font-mono text-slate-900">
            {report.tests.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1">
            Within Range
          </span>
          <span className="text-2xl md:text-3xl font-black font-mono text-emerald-700">
            {withinRangeCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1">
            Outside Range
          </span>
          <span className="text-2xl md:text-3xl font-black font-mono text-amber-800">
            {outsideRangeCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1">
            Requires Review
          </span>
          <span className={`text-2xl md:text-3xl font-black font-mono ${needsReviewCount > 0 ? 'text-amber-800' : 'text-slate-400'}`}>
            {needsReviewCount}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar (Sections 25 & 26) */}
      <div className="space-y-2 mb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-88">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by test name, category, unit, or date..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#218DAE]"
            />
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-[#218DAE] text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Tests ({report.tests.length})
            </button>

            <button
              onClick={() => setStatusFilter('OUTSIDE_RANGE')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === 'OUTSIDE_RANGE'
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Outside Range ({outsideRangeCount})
            </button>

            <button
              onClick={() => setStatusFilter('NEEDS_REVIEW')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === 'NEEDS_REVIEW'
                  ? 'bg-[#FFD758] text-amber-950 shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Needs Review ({needsReviewCount})
            </button>

            <button
              onClick={() => setStatusFilter('NORMAL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === 'NORMAL'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Normal ({withinRangeCount})
            </button>

            <button
              onClick={() => setShowAdvancedFilters(prev => !prev)}
              className={`p-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                showAdvancedFilters || confidenceFilter !== 'ALL'
                  ? 'bg-[#e8f4f8] text-[#186d88] border-[#218DAE]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Confidence & Granular Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {onOpenAddTest && (
              <button
                onClick={onOpenAddTest}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#218DAE] hover:bg-[#186d88] text-white shadow-2xs transition-colors cursor-pointer shrink-0 ml-1"
                title="Add a new biomarker or lab test"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Biomarker</span>
              </button>
            )}
          </div>
        </div>

        {/* Granular Filters Dropdown Bar (Section 26) */}
        {showAdvancedFilters && (
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4 text-xs animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Extraction Reliability (Confidence Filter):
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setConfidenceFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                    confidenceFilter === 'ALL' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setConfidenceFilter('HIGH')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                    confidenceFilter === 'HIGH' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  High (≥85%)
                </button>
                <button
                  onClick={() => setConfidenceFilter('MED')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                    confidenceFilter === 'MED' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Medium (70-84%)
                </button>
                <button
                  onClick={() => setConfidenceFilter('LOW')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                    confidenceFilter === 'LOW' ? 'bg-rose-100 text-rose-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Low (&lt;70%)
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setStatusFilter('ALL');
                setConfidenceFilter('ALL');
                setSearchQuery('');
              }}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Tests Results List */}
      <div className="space-y-2.5">
        {filteredTests.length > 0 ? (
          filteredTests.map(test => (
            <StructuredResult
              key={test.id}
              test={test}
              isSelected={test.id === selectedTestId}
              onSelect={() => onSelectTest(test.id)}
              onNavigateToSource={onNavigateToSource}
              onVerify={(action, editData) => onVerifyTest(test.id, action, editData)}
              onAskAIAboutTest={() => onAskAIAboutTest(test)}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
            <p className="text-sm font-semibold text-slate-600">No laboratory tests matched your active search or filters.</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing filters or changing search keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
};
