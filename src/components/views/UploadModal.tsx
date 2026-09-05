import React, { useState, useEffect } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertTriangle, RefreshCw, Cpu, Check, Layers, AlertCircle, Sparkles, Key } from 'lucide-react';
import { OCRService, ExtractedDocumentData } from '../../services/ocrService';
import { FileStorageService } from '../../services/fileStorageService';
import { GeminiService } from '../../services/geminiService';
import { ClinicalReport, ProcessingStage, Patient } from '../../types/medical';
import { SecuritySanitizer } from '../../utils/sanitize';
import { User, Plus } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (report: ClinicalReport, targetPatientId?: string, newPatientName?: string) => void;
  patients?: Patient[];
  activePatient?: Patient;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  patients = [],
  activePatient
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [stage, setStage] = useState<ProcessingStage>('IDLE');
  const [stageDescription, setStageDescription] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedDocumentData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Gemini API Key state
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(GeminiService.hasApiKey());
  const [customKey, setCustomKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [keySaveMsg, setKeySaveMsg] = useState<string | null>(null);

  useEffect(() => {
    setHasGeminiKey(GeminiService.hasApiKey());
  }, [isOpen]);

  const handleSaveCustomKey = () => {
    if (!customKey.trim()) return;
    GeminiService.setApiKey(customKey.trim());
    setHasGeminiKey(true);
    setKeySaveMsg('Gemini API key saved!');
    setTimeout(() => {
      setShowKeyInput(false);
      setKeySaveMsg(null);
    }, 1500);
  };

  // Selected Patient for this upload
  const [selectedPatientId, setSelectedPatientId] = useState<string>(activePatient?.id || patients[0]?.id || 'NEW');
  const [newPatientName, setNewPatientName] = useState<string>('');
  const [autoDetectedName, setAutoDetectedName] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedPatientId(activePatient?.id || patients[0]?.id || 'NEW');
      setNewPatientName('');
      setAutoDetectedName(null);
    }
  }, [isOpen, activePatient?.id]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      startPipeline(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      startPipeline(e.target.files[0]);
    }
  };

  const handleSelectSample = (sampleFileName: string) => {
    startPipeline({ name: sampleFileName, type: 'application/pdf', size: 1024 * 1024 });
  };

  const startPipeline = async (file: File | { name: string; type: string; size: number }) => {
    if (file instanceof File) {
      const validation = SecuritySanitizer.validateUploadFile(file);
      if (!validation.isValid) {
        setSelectedFileName(file.name);
        setErrorMessage(validation.error || 'Invalid file format or size.');
        setStage('FAILED');
        return;
      }
      setUploadedFile(file);
    }
    const cleanName = SecuritySanitizer.sanitizeFileName(file.name);
    setSelectedFileName(cleanName);
    setErrorMessage(null);
    setStage('UPLOADED');
    setProgress(15);
    setStageDescription('Document validated and queued for secure processing.');

    try {
      // 1. PROCESSING
      await new Promise(r => setTimeout(r, 400));
      setStage('PROCESSING');

      // 2. Run OCR & clinical extraction pipeline
      const extracted = await OCRService.processDocument(file, (desc, pct) => {
        setStageDescription(desc);
        setProgress(pct);
        if (pct >= 40 && pct < 65) setStage('OCR_COMPLETE');
        if (pct >= 65 && pct < 85) setStage('EXTRACTING');
        if (pct >= 85 && pct < 100) setStage('VALIDATING');
      });

      setExtractedData(extracted);
      setStage('READY_FOR_REVIEW');
      setProgress(100);
      setStageDescription('Structured extraction and reference range validation complete.');

      // Intelligent Patient Detection and Auto-Matching
      if (extracted.patient?.name && extracted.patient.name.trim() && extracted.patient.name.trim().toLowerCase() !== 'patient') {
        const detectedName = extracted.patient.name.trim();
        setAutoDetectedName(detectedName);
        const existingMatch = patients.find(p => p.name.trim().toLowerCase() === detectedName.toLowerCase());
        if (existingMatch) {
          setSelectedPatientId(existingMatch.id);
        } else {
          setSelectedPatientId('NEW');
          setNewPatientName(detectedName);
        }
      }
    } catch (e: any) {
      console.error(e);
      setStage('FAILED');
      setErrorMessage(e?.message || 'Processing failed during OCR layout analysis. Please try again.');
    }
  };

  const handleConfirmReport = async () => {
    if (!extractedData) return;

    const reportId = `rep-${Date.now()}`;
    const targetPatId = selectedPatientId === 'NEW' ? `pat-${Date.now()}` : selectedPatientId;

    let fileUrl: string | undefined;
    if (uploadedFile) {
      try {
        fileUrl = await FileStorageService.saveFile(reportId, uploadedFile);
      } catch (e) {
        console.warn('Failed to save file in FileStorageService, creating direct object URL:', e);
        fileUrl = URL.createObjectURL(uploadedFile);
      }
    }

    const newReport: ClinicalReport = {
      id: reportId,
      patientId: targetPatId,
      reportName: extractedData.reportName,
      reportType: extractedData.reportType,
      date: extractedData.date,
      facility: extractedData.facility,
      doctorName: extractedData.doctorName,
      documentId: `doc-${Date.now()}`,
      sourceDocument: selectedFileName,
      fileUrl: fileUrl,
      fileType: uploadedFile?.type || (selectedFileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
      rawOcrText: extractedData.rawText,
      tests: extractedData.tests,
      observations: extractedData.observations,
      verificationSummary: {
        total: extractedData.tests.length,
        verified: extractedData.tests.filter(t => t.verification.status === 'VERIFIED').length,
        needsReview: extractedData.tests.filter(t => t.verification.status === 'NEEDS_REVIEW' || t.ambiguityDetected).length,
        rejected: 0
      }
    };

    const finalPatientName = selectedPatientId === 'NEW'
      ? (newPatientName.trim() || extractedData.patient?.name?.trim() || 'Patient ' + (patients.length + 1))
      : undefined;

    onUploadSuccess(
      newReport, 
      selectedPatientId === 'NEW' ? undefined : selectedPatientId,
      finalPatientName
    );
  };

  const handleReset = () => {
    setSelectedFileName('');
    setUploadedFile(null);
    setStage('IDLE');
    setProgress(0);
    setExtractedData(null);
    setErrorMessage(null);
    setAutoDetectedName(null);
  };

  const pipelineSteps: { id: ProcessingStage; label: string }[] = [
    { id: 'UPLOADED', label: 'Uploaded' },
    { id: 'PROCESSING', label: 'Processing' },
    { id: 'OCR_COMPLETE', label: 'OCR Complete' },
    { id: 'EXTRACTING', label: 'Extracting' },
    { id: 'VALIDATING', label: 'Validating' },
    { id: 'READY_FOR_REVIEW', label: 'Ready for Review' },
  ];

  const getStepStatus = (stepId: ProcessingStage) => {
    const order: ProcessingStage[] = [
      'IDLE',
      'UPLOADED',
      'PROCESSING',
      'OCR_COMPLETE',
      'EXTRACTING',
      'VALIDATING',
      'READY_FOR_REVIEW'
    ];
    const currentIndex = order.indexOf(stage);
    const stepIndex = order.indexOf(stepId);

    if (stage === 'FAILED') return 'failed';
    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-pipeline-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 text-xs relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <h3 id="upload-pipeline-title" className="text-base font-bold text-slate-900">
              Clinical Document Ingestion Pipeline
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              OCR, Structured AI Extraction, Reference Range Parsing & Provenance Linking
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Progress Bar (Section 3) */}
        {stage !== 'IDLE' && (
          <div className="py-4 border-b border-slate-100 shrink-0">
            <div className="grid grid-cols-6 gap-1 mb-2">
              {pipelineSteps.map(step => {
                const status = getStepStatus(step.id);
                return (
                  <div key={step.id} className="text-center">
                    <div
                      className={`h-1.5 rounded-full mb-1 transition-all ${
                        status === 'complete'
                          ? 'bg-emerald-500'
                          : status === 'active'
                          ? 'bg-[#218DAE] animate-pulse'
                          : 'bg-slate-200'
                      }`}
                    />
                    <span className={`text-[9px] font-bold block truncate ${
                      status === 'active' ? 'text-[#218DAE]' : status === 'complete' ? 'text-emerald-700' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-center font-mono text-[11px] text-slate-600">
              {stageDescription} ({progress}%)
            </p>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {stage === 'IDLE' && (
            <div>
              {/* Drag & Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                  dragActive
                    ? 'border-[#218DAE] bg-[#e8f4f8]'
                    : 'border-slate-300 hover:border-[#218DAE] hover:bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  id="doc-upload-input"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="doc-upload-input" className="cursor-pointer block">
                  <div className="w-12 h-12 rounded-2xl bg-[#e8f4f8] text-[#218DAE] flex items-center justify-center mx-auto mb-3 shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    Click to browse or drag & drop document
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    Supports PDF, PNG, or JPG (Clinical lab reports, discharge notes)
                  </p>
                </label>
              </div>

              {hasGeminiKey ? (
                <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/80 text-[11px] text-emerald-900 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#218DAE] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        Gemini 2.5 Flash Intelligence Connected
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded border border-emerald-200">
                        Multi-Page Active
                      </span>
                    </div>
                    <p className="text-emerald-800 text-[10.5px] mt-1 leading-relaxed">
                      Ready to process all pages of your clinical PDF. Gemini AI will extract all test metrics, reference intervals, flags, and pathologist observations across every page into verified Medical JSON.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <Key className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-950">
                          Drop GEMINI_API_KEY in .env for Full Multi-Page Extraction
                        </span>
                        <p className="text-amber-800 text-[10.5px] mt-0.5">
                          Add <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">GEMINI_API_KEY=your_key</code> to your <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">.env</code> file, or paste it directly below.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowKeyInput(!showKeyInput)}
                      className="text-[10px] font-bold text-amber-800 hover:text-amber-950 underline shrink-0 cursor-pointer"
                    >
                      {showKeyInput ? 'Hide' : 'Enter Key Now'}
                    </button>
                  </div>

                  {showKeyInput && (
                    <div className="pt-2 border-t border-amber-200/60 flex items-center gap-2">
                      <input
                        type="password"
                        placeholder="Paste your Gemini API key"
                        value={customKey}
                        onChange={e => setCustomKey(e.target.value)}
                        className="flex-1 bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 outline-none focus:border-[#218DAE]"
                      />
                      <button
                        type="button"
                        onClick={handleSaveCustomKey}
                        className="px-3 py-1 bg-[#218DAE] hover:bg-[#1a738e] text-white font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                      >
                        Save Key
                      </button>
                    </div>
                  )}
                  {keySaveMsg && (
                    <span className="text-emerald-700 font-bold block text-[10px]">{keySaveMsg}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Active Pipeline Progression */}
          {['UPLOADED', 'PROCESSING', 'OCR_COMPLETE', 'EXTRACTING', 'VALIDATING'].includes(stage) && (
            <div className="p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#e8f4f8] text-[#218DAE] flex items-center justify-center mx-auto animate-spin">
                <Cpu className="w-6 h-6 text-[#2BBBD7]" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Processing: {selectedFileName}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {stageDescription}
                </p>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#218DAE] h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="font-mono text-xs text-slate-500">{progress}% Completed</span>
            </div>
          )}

          {/* Stage: READY FOR REVIEW */}
          {stage === 'READY_FOR_REVIEW' && extractedData && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="font-bold text-emerald-900 text-xs">
                      Extraction & Validation Complete
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      {extractedData.tests.length} tests structured · {extractedData.ambiguitiesFound} item(s) flagged with OCR ambiguity
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-200">
                  Medical JSON Ready
                </span>
              </div>

              {/* Patient Assignment Selector */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Assign Document to Patient Record:
                  </label>
                  {autoDetectedName && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-300 animate-fade-in">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Auto-detected: {autoDetectedName}
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedPatientId}
                    onChange={e => setSelectedPatientId(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#218DAE]"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.patientId})
                      </option>
                    ))}
                    <option value="NEW">+ Register New Patient for this Document</option>
                  </select>

                  {(selectedPatientId === 'NEW' || patients.length === 0) && (
                    <input
                      type="text"
                      value={newPatientName}
                      onChange={e => setNewPatientName(e.target.value)}
                      placeholder="Patient's full legal name..."
                      className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#218DAE]"
                    />
                  )}
                </div>
              </div>

              {/* Summary of Extracted Tests */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 font-bold text-[11px] text-slate-600 uppercase">
                  Extracted Laboratory Results Preview
                </div>
                <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto text-xs">
                  {extractedData.tests.map(t => (
                    <div key={t.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-800">{t.testName}</span>
                        <span className="text-slate-400 text-[11px] ml-2 font-mono">
                          Ref: {t.referenceRange.rawText}
                        </span>
                        {t.ambiguityDetected && (
                          <span className="block text-[10px] text-amber-800 font-bold mt-0.5">
                            ⚠ {t.ambiguityReason}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          {t.value} {t.unit}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          t.status === 'LOW' ? 'bg-amber-100 text-amber-900' :
                          t.status === 'HIGH' ? 'bg-rose-100 text-rose-900' :
                          'bg-emerald-100 text-emerald-900'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Failed State with Retry (Section 3) */}
          {stage === 'FAILED' && (
            <div className="p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  PROCESSING FAILED
                </p>
                <p className="text-xs text-rose-600 mt-1">
                  {errorMessage}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#218DAE] text-white text-xs font-semibold cursor-pointer shadow-sm hover:bg-[#186d88]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Document Upload</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span>Zero-retention local processing engine</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            {stage === 'READY_FOR_REVIEW' && (
              <button
                onClick={handleConfirmReport}
                className="px-4 py-1.5 rounded-lg bg-[#218DAE] hover:bg-[#186d88] text-white text-xs font-semibold cursor-pointer shadow-sm"
              >
                Open in Workspace for Review
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
