import React, { useState } from 'react';
import { Check, Edit2, X, AlertTriangle, CheckCircle2, History, RotateCcw } from 'lucide-react';
import { LabResult, VerificationState } from '../../types/medical';

interface VerificationControlProps {
  test: LabResult;
  onVerify: (action: 'CONFIRM' | 'EDIT' | 'REJECT', editData?: { value: string | number; unit?: string; notes?: string }) => void;
}

export const VerificationControl: React.FC<VerificationControlProps> = ({
  test,
  onVerify
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(test.value.toString());
  const [editUnit, setEditUnit] = useState(test.unit);
  const [editNotes, setEditNotes] = useState('');

  const status = test.verification.status;

  const handleConfirm = () => {
    onVerify('CONFIRM');
  };

  const handleReject = () => {
    onVerify('REJECT', { value: test.value, notes: 'Rejected by clinician during verification' });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editValue.trim()) return;
    onVerify('EDIT', {
      value: isNaN(Number(editValue)) ? editValue : Number(editValue),
      unit: editUnit,
      notes: editNotes || 'Corrected via verification modal'
    });
    setIsEditing(false);
  };

  return (
    <div className="text-xs">
      {isEditing ? (
        /* Inline Edit Form */
        <form onSubmit={handleSaveEdit} className="p-3 bg-white rounded-xl border border-[#218DAE] shadow-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              Edit Extracted Value
            </span>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-1">Value</label>
              <input
                type="text"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-[#218DAE]"
                placeholder="e.g. 11.2"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-1">Unit</label>
              <input
                type="text"
                value={editUnit}
                onChange={e => setEditUnit(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#218DAE]"
                placeholder="e.g. g/dL"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 font-semibold mb-1">Clinical Note / Reason</label>
            <input
              type="text"
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              placeholder="e.g. Corrected OCR decimal misread"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#218DAE]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-[11px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded-lg bg-[#218DAE] text-white font-semibold hover:bg-[#186d88] text-[11px] shadow-sm"
            >
              Save Correction
            </button>
          </div>
        </form>
      ) : (
        /* Action Buttons & State Display */
        <div className="flex items-center gap-1.5">
          {status === 'VERIFIED' ? (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified</span>
              <button
                onClick={() => setIsEditing(true)}
                className="ml-1 p-0.5 text-emerald-700 hover:text-emerald-900 rounded hover:bg-emerald-100 cursor-pointer"
                title="Edit verified value"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          ) : status === 'REJECTED' ? (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold">
              <X className="w-3.5 h-3.5 text-rose-600" />
              <span>Rejected</span>
              <button
                onClick={() => setIsEditing(true)}
                className="ml-1 p-0.5 text-rose-700 hover:text-rose-900 rounded hover:bg-rose-100 cursor-pointer"
                title="Restore / Edit"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          ) : (
            /* Needs Review / Pending Verification */
            <div className="flex items-center gap-1">
              <button
                onClick={handleConfirm}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer text-[11px]"
                title="Confirm extracted value as accurate"
              >
                <Check className="w-3 h-3" />
                <span>Confirm</span>
              </button>

              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer text-[11px]"
                title="Edit extracted value"
              >
                <Edit2 className="w-3 h-3 text-slate-500" />
                <span>Edit</span>
              </button>

              <button
                onClick={handleReject}
                className="inline-flex items-center p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Reject extraction"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* If the item was edited, show indicator */}
          {test.verification.editedFrom && (
            <span
              className="inline-flex items-center p-1 text-slate-400 hover:text-slate-600"
              title={`Originally extracted as: ${test.verification.editedFrom.originalValue} ${test.verification.editedFrom.originalUnit || ''}`}
            >
              <History className="w-3 h-3" />
            </span>
          )}
        </div>
      )}
    </div>
  );
};
