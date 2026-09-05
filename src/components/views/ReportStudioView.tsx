import React, { useState } from 'react';
import { 
  Patient, 
  ClinicalReport, 
  StudioReportTemplate, 
  TemplateField, 
  TemplateElementType,
  LabResult 
} from '../../types/medical';
import { 
  DEFAULT_TEMPLATES, 
  TemplateService, 
  ProposedFieldDetection 
} from '../../services/templateService';
import { 
  LayoutTemplate, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Download, 
  Sliders, 
  Type, 
  Move, 
  Trash2, 
  FileText, 
  ShieldCheck, 
  Plus, 
  Info,
  ShieldAlert,
  HelpCircle,
  Check
} from 'lucide-react';

interface ReportStudioViewProps {
  patient?: Patient;
}

export const ReportStudioView: React.FC<ReportStudioViewProps> = ({ patient }) => {
  if (!patient) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#F8FAFB]">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4 shadow-sm">
          <LayoutTemplate className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Patient Profile Active</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5">
          Register a patient profile and upload a clinical document to design and export standardized reports in Report Studio.
        </p>
      </div>
    );
  }

  const activeReport = patient.reports[0];

  // Studio Templates & Active State
  const [templates, setTemplates] = useState<StudioReportTemplate[]>(DEFAULT_TEMPLATES);
  const [activeTemplate, setActiveTemplate] = useState<StudioReportTemplate>(templates[0]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>('fld-results-table');
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  // Modals
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [proposedDetections, setProposedDetections] = useState<ProposedFieldDetection[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [sourcePopoverTest, setSourcePopoverTest] = useState<LabResult | null>(null);

  const selectedField = activeTemplate.fields.find(f => f.id === selectedFieldId);
  const reportReadiness = TemplateService.getReportStatus(activeReport);

  // Handle Uploading a Custom Organization Template Image (Section 3 & 4)
  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newTemplate: StudioReportTemplate = {
        id: `tmpl-custom-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        organization: 'Custom Uploaded Clinic',
        description: 'Uploaded visual background template layout.',
        category: 'DIAGNOSTIC_LAB',
        backgroundTheme: 'UPLOADED_IMAGE',
        watermarkText: 'ORGANIZATION CERTIFIED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fields: [
          ...activeTemplate.fields.map(f => ({ ...f, id: `fld-${Date.now()}-${f.name}` }))
        ]
      };

      setTemplates(prev => [newTemplate, ...prev]);
      setActiveTemplate(newTemplate);

      // Trigger automatic template analysis prompt (Section 8)
      const detections = TemplateService.analyzeTemplate(file.name);
      setProposedDetections(detections);
      setIsAnalysisModalOpen(true);
    }
  };

  // Run automatic template analysis manually
  const handleRunAnalysis = () => {
    const detections = TemplateService.analyzeTemplate(activeTemplate.name);
    setProposedDetections(detections);
    setIsAnalysisModalOpen(true);
  };

  // Add a new template element
  const handleAddField = (type: TemplateElementType, name: string, placeholder: string, key: string) => {
    const newField: TemplateField = {
      id: `fld-${Date.now()}`,
      name,
      placeholder,
      type,
      dataSourceKey: key,
      x: 10,
      y: 15 + activeTemplate.fields.length * 5,
      fontSize: 12,
      fontWeight: 'medium',
      color: '#0f172a',
      isConfirmed: true
    };

    const updated = {
      ...activeTemplate,
      fields: [...activeTemplate.fields, newField]
    };
    setActiveTemplate(updated);
    setSelectedFieldId(newField.id);
  };

  // Update selected field property
  const handleUpdateField = (updates: Partial<TemplateField>) => {
    if (!selectedFieldId) return;
    const updatedFields = activeTemplate.fields.map(f => {
      if (f.id === selectedFieldId) {
        return { ...f, ...updates };
      }
      return f;
    });
    setActiveTemplate({
      ...activeTemplate,
      fields: updatedFields
    });
  };

  // Delete selected field
  const handleDeleteField = (id: string) => {
    const updatedFields = activeTemplate.fields.filter(f => f.id !== id);
    setActiveTemplate({
      ...activeTemplate,
      fields: updatedFields
    });
    setSelectedFieldId(null);
  };

  // Print PDF
  const handleExecutePrint = () => {
    setIsExportModalOpen(false);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#F8FAFB] select-none overflow-hidden">
      {/* Studio Top Control Bar */}
      <div className="h-14 bg-white border-b border-slate-200/90 px-5 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#218DAE] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              RS
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>MedLens Report Studio</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.2 rounded-full bg-[#e8f4f8] text-[#186d88]">
                  Template Engine v3.0
                </span>
              </h1>
            </div>
          </div>

          {/* Template Selector Dropdown */}
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Template:</span>
            <select
              value={activeTemplate.id}
              onChange={e => {
                const tmpl = templates.find(t => t.id === e.target.value);
                if (tmpl) setActiveTemplate(tmpl);
              }}
              className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#218DAE] cursor-pointer"
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Studio Actions */}
        <div className="flex items-center gap-2.5">
          {/* Upload Template File */}
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs transition-colors">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Upload Template</span>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={handleTemplateUpload}
              className="hidden"
            />
          </label>

          {/* Auto-Analyze Regions (Section 8) */}
          <button
            onClick={handleRunAnalysis}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eaf9fc] hover:bg-[#e0f7fb] border border-[#2BBBD7]/50 text-[#186d88] text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
            title="Automatically detect candidate template regions"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2BBBD7]" />
            <span className="hidden sm:inline">Auto-Analyze Regions</span>
          </button>

          {/* Export Report Action */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#218DAE] hover:bg-[#186d88] text-white text-xs font-semibold cursor-pointer shadow-sm shadow-[#218DAE]/20 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 3-Panel Report Studio Workspace (Section 2) */}
      <div className="flex-1 flex w-full h-[calc(100%-56px)] overflow-hidden">
        {/* =========================================================================
            PANEL 1: TEMPLATE ELEMENTS & FIELD LIBRARY (LEFT ~20%)
        ========================================================================== */}
        <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 select-none overflow-hidden">
          <div className="p-4 overflow-y-auto space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Field Elements Library
              </h3>
              <p className="text-[11px] text-slate-500">
                Add verified medical fields to the template background.
              </p>
            </div>

            {/* Field Elements Categories */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Patient Demographics
                </span>
                <button
                  onClick={() => handleAddField('PATIENT_NAME', 'Patient Name', '{{PATIENT_NAME}}', 'patient.name')}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-[#e8f4f8] text-slate-700 hover:text-[#186d88] border border-slate-200 text-xs flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>Patient Name</span>
                  <span className="text-[10px] font-mono text-slate-400">{'{{NAME}}'}</span>
                </button>
                <button
                  onClick={() => handleAddField('PATIENT_ID', 'Patient MRN', '{{PATIENT_ID}}', 'patient.patient_id')}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-[#e8f4f8] text-slate-700 hover:text-[#186d88] border border-slate-200 text-xs flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>Patient ID / MRN</span>
                  <span className="text-[10px] font-mono text-slate-400">{'{{MRN}}'}</span>
                </button>
                <button
                  onClick={() => handleAddField('AGE', 'Age & Sex', '{{AGE}} / {{SEX}}', 'patient.age_sex')}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-[#e8f4f8] text-slate-700 hover:text-[#186d88] border border-slate-200 text-xs flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>Age / Sex</span>
                  <span className="text-[10px] font-mono text-slate-400">{'{{AGE}}'}</span>
                </button>
                <button
                  onClick={() => handleAddField('BLOOD_GROUP', 'Blood Group', '{{BLOOD_GROUP}}', 'patient.bloodGroup')}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-[#e8f4f8] text-slate-700 hover:text-[#186d88] border border-slate-200 text-xs flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>Blood Group</span>
                  <span className="text-[10px] font-mono text-slate-400">{'{{ABO}}'}</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Clinical Results
                </span>
                <button
                  onClick={() => handleAddField('LAB_RESULTS_TABLE', 'Results Table', '{{LAB_RESULTS_TABLE}}', 'report.tests')}
                  className="w-full text-left p-2 rounded-lg bg-[#e8f4f8] hover:bg-[#e0f3f8] text-[#186d88] font-bold border border-[#218DAE]/30 text-xs flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
                >
                  <span>Results Grid Table</span>
                  <span className="text-[10px] font-mono text-[#218DAE]">{'{{TABLE}}'}</span>
                </button>
                <button
                  onClick={() => handleAddField('OBSERVATIONS', 'Observations Block', '{{OBSERVATIONS}}', 'report.observations')}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-[#e8f4f8] text-slate-700 hover:text-[#186d88] border border-slate-200 text-xs flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>Pathology Notes</span>
                  <span className="text-[10px] font-mono text-slate-400">{'{{NOTES}}'}</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Facility & Signatures
                </span>
                <button
                  onClick={() => handleAddField('DOCTOR_NAME', 'Physician Name', '{{DOCTOR_NAME}}', 'report.doctorName')}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-[#e8f4f8] text-slate-700 hover:text-[#186d88] border border-slate-200 text-xs flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>Physician Name</span>
                  <span className="text-[10px] font-mono text-slate-400">{'{{DOC}}'}</span>
                </button>
                <button
                  onClick={() => handleAddField('SIGNATURE', 'Director Signature', '{{SIGNATURE}}', 'facility.director')}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-[#e8f4f8] text-slate-700 hover:text-[#186d88] border border-slate-200 text-xs flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>Signature Block</span>
                  <span className="text-[10px] font-mono text-slate-400">{'{{SIG}}'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono text-center">
            {activeTemplate.fields.length} Active Dynamic Overlays
          </div>
        </aside>

        {/* =========================================================================
            PANEL 2: REPORT CANVAS (VISUAL CENTER ~55%)
        ========================================================================== */}
        <main className="flex-1 h-full overflow-auto p-8 flex flex-col items-center bg-slate-200/60 select-none relative">
          {/* Status Badge (Section 13) */}
          <div className="w-[780px] flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono tracking-wide ${
                reportReadiness.status === 'FINAL_PREVIEW' || reportReadiness.status === 'VERIFIED'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                STATUS: {reportReadiness.status}
              </span>
              <span className="text-xs text-slate-600">
                {reportReadiness.message}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <button
                onClick={() => setZoomScale(s => Math.max(0.7, s - 0.1))}
                className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50"
              >
                -
              </button>
              <span>{Math.round(zoomScale * 100)}%</span>
              <button
                onClick={() => setZoomScale(s => Math.min(1.4, s + 0.1))}
                className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Canvas Sheet (The Template is the visual background, Section 4) */}
          <div
            style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center' }}
            className="w-[780px] min-h-[1050px] bg-white text-slate-900 shadow-2xl rounded-sm p-10 font-sans relative border border-slate-300 transition-transform duration-150"
          >
            {/* Watermark Base Layer */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-4 overflow-hidden">
              <span className="text-7xl font-black text-slate-900 -rotate-45 tracking-widest uppercase">
                {activeTemplate.watermarkText || 'MEDLENS REPORT'}
              </span>
            </div>

            {/* Template Header Branding Base */}
            <header className="border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#218DAE] text-white flex items-center justify-center font-bold text-lg rounded-sm shadow-xs">
                    ML
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                      {activeReport?.facility.name || activeTemplate.organization}
                    </h2>
                    <p className="text-xs text-slate-600">
                      {activeReport?.facility.address || 'Certified Pathology & Diagnostic Medicine Services'}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                      <span>{activeReport?.facility.license || 'CLIA #05D9823412'}</span>
                      <span>•</span>
                      <span>Director: {activeReport?.facility.director || 'Robert Sterling, MD'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-sm uppercase">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified Laboratory Record</span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">
                    TEMPLATE: {activeTemplate.name}
                  </p>
                </div>
              </div>
            </header>

            {/* Patient Demographics Base Box */}
            <div className="bg-slate-50 border border-slate-300 rounded-sm p-3.5 mb-6 text-xs grid grid-cols-2 gap-y-2 gap-x-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Name</span>
                <span 
                  onClick={() => setSelectedFieldId('fld-pat-name')}
                  className="font-bold text-slate-900 text-sm hover:underline cursor-pointer"
                >
                  {patient.name}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">MRN / Record ID</span>
                <span 
                  onClick={() => setSelectedFieldId('fld-pat-id')}
                  className="font-mono font-semibold text-slate-800 hover:underline cursor-pointer"
                >
                  {patient.patientId}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Age / Sex</span>
                <span 
                  onClick={() => setSelectedFieldId('fld-age-sex')}
                  className="text-slate-800 font-medium hover:underline cursor-pointer"
                >
                  {patient.age} Yrs / {patient.sex}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Blood Group</span>
                <span 
                  onClick={() => setSelectedFieldId('fld-blood-grp')}
                  className="text-slate-800 font-semibold hover:underline cursor-pointer"
                >
                  {patient.bloodGroup || 'Not Documented'}
                </span>
              </div>
            </div>

            {/* Dynamic Results Table (Section 10: TEST | RESULT | UNIT | REFERENCE RANGE | STATUS) */}
            <div 
              onClick={() => setSelectedFieldId('fld-results-table')}
              className="mb-8 cursor-pointer rounded-xs p-1 hover:ring-1 hover:ring-[#218DAE]/50"
            >
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-[11px] font-bold text-slate-700 uppercase bg-slate-100/50">
                    <th className="py-2.5 px-3">Test Description</th>
                    <th className="py-2.5 px-3">Result</th>
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3">Laboratory Reference Range</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-2 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(!activeReport || activeReport.tests.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        No laboratory results loaded for this document. Upload a medical document to populate results.
                      </td>
                    </tr>
                  ) : (
                    activeReport.tests.map(test => {
                    const isLow = test.status === 'LOW';
                    const isHigh = test.status === 'HIGH';

                    return (
                      <tr
                        key={test.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSourcePopoverTest(test); // Section 12: Source-to-report connection
                        }}
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                        title="Click to inspect source provenance & extraction chain"
                      >
                        <td className="py-2 px-3 font-semibold text-slate-800 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#218DAE] opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span>{test.testName}</span>
                        </td>
                        <td className={`py-2 px-3 font-mono font-bold ${
                          isLow || isHigh ? 'text-slate-900 font-black' : 'text-slate-700'
                        }`}>
                          {test.value}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">
                          {test.unit}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">
                          {test.referenceRange.rawText}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {isLow && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                              LOW
                            </span>
                          )}
                          {isHigh && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-900 border border-rose-300">
                              HIGH
                            </span>
                          )}
                          {!isLow && !isHigh && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900">
                              NORMAL
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-[10px]">
                          {test.verification.status === 'VERIFIED' ? (
                            <span className="text-emerald-700 font-semibold">✓ Verified</span>
                          ) : (
                            <span className="text-amber-800 font-bold bg-[#FCE59A]/50 px-1 py-0.2 rounded">Needs Review</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
                </tbody>
              </table>
            </div>

            {/* Observations Block */}
            {activeReport?.observations && (
              <div 
                onClick={() => setSelectedFieldId('fld-observations')}
                className="mb-8 p-3 bg-slate-50 border border-slate-200 rounded text-xs cursor-pointer hover:ring-1 hover:ring-[#218DAE]/50"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Pathologist Observations & Interpretive Notes
                </span>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-700 text-[11px]">
                  {activeReport.observations.map((obs, i) => (
                    <li key={i}>{obs}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pathologist Digital Signature Block */}
            <footer 
              onClick={() => setSelectedFieldId('fld-signature')}
              className="mt-12 pt-6 border-t-2 border-slate-900 flex items-end justify-between text-xs text-slate-600 cursor-pointer hover:ring-1 hover:ring-[#218DAE]/50"
            >
              <div>
                <p className="font-bold text-slate-900">{activeReport?.facility.director || 'Robert Sterling, MD, FCAP'}</p>
                <p className="text-[11px]">Director of Clinical Pathology & Laboratory Medicine</p>
                <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] mt-1 font-mono">
                  <span>Certified Digital Signature · Key #SHA256-88192a</span>
                </div>
              </div>

              <div className="text-right font-mono text-[10px] text-slate-400">
                <p>Page 1 of 1</p>
                <p className="text-slate-300 mt-1">PROVENANCE CERTIFIED</p>
              </div>
            </footer>
          </div>

          {/* Source-to-Report Floating Popover (Section 12) */}
          {sourcePopoverTest && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4"
              onClick={() => setSourcePopoverTest(null)}
            >
              <div 
                onClick={e => e.stopPropagation()} 
                className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 max-w-sm w-full text-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-[#218DAE]" />
                    <span>Source-to-Report Provenance</span>
                  </div>
                  <button onClick={() => setSourcePopoverTest(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <div className="space-y-1.5">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Generated Value</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {sourcePopoverTest.testName}: {sourcePopoverTest.value} {sourcePopoverTest.unit}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Source Document</span>
                    <span className="font-mono text-slate-800 font-semibold">
                      {sourcePopoverTest.provenance.sourceDocument} · Page {sourcePopoverTest.provenance.page}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px]">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Original Extracted Text</span>
                    <span>"{sourcePopoverTest.provenance.originalText}"</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] p-2 bg-emerald-50 rounded-lg text-emerald-900">
                    <span>Status: <strong>{sourcePopoverTest.verification.status}</strong></span>
                    <span className="font-mono">Confidence: {sourcePopoverTest.provenance.confidence}%</span>
                  </div>
                </div>

                <button
                  onClick={() => setSourcePopoverTest(null)}
                  className="w-full py-1.5 rounded-lg bg-[#218DAE] text-white font-semibold text-xs"
                >
                  Close Provenance Inspector
                </button>
              </div>
            </div>
          )}
        </main>

        {/* =========================================================================
            PANEL 3: PROPERTIES & FIELD MAPPING (RIGHT ~25%)
        ========================================================================== */}
        <aside className="w-80 bg-white border-l border-slate-200/90 flex flex-col justify-between shrink-0 select-none overflow-hidden">
          <div className="p-4 overflow-y-auto space-y-5">
            {selectedField ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Field Properties
                    </h3>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {selectedField.name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteField(selectedField.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Remove field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Field Placeholder & Type */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Template Placeholder Tag
                    </label>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-[#218DAE]">
                      {selectedField.placeholder}
                    </div>
                  </div>

                  {/* Medical JSON Binding Source (Section 7) */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Data Source Binding (Medical JSON)
                    </label>
                    <select
                      value={selectedField.dataSourceKey}
                      onChange={e => handleUpdateField({ dataSourceKey: e.target.value })}
                      className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#218DAE]"
                    >
                      <option value="patient.name">patient.name</option>
                      <option value="patient.patient_id">patient.patient_id</option>
                      <option value="patient.age_sex">patient.age / patient.sex</option>
                      <option value="patient.bloodGroup">patient.bloodGroup</option>
                      <option value="report.date">report.date</option>
                      <option value="report.doctorName">report.doctorName</option>
                      <option value="facility.name">facility.name</option>
                      <option value="report.tests">report.tests (Dynamic Lab Table)</option>
                      <option value="report.observations">report.observations</option>
                    </select>
                  </div>

                  {/* Live Value Preview */}
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Resolved Live Value
                    </span>
                    <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-900 font-medium text-xs truncate">
                      {TemplateService.resolveValue(selectedField.placeholder, patient, activeReport)}
                    </div>
                  </div>

                  {/* Font Size & Weight */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Font Size ({selectedField.fontSize || 12}px)
                      </label>
                      <input
                        type="range"
                        min="9"
                        max="24"
                        value={selectedField.fontSize || 12}
                        onChange={e => handleUpdateField({ fontSize: Number(e.target.value) })}
                        className="w-full accent-[#218DAE]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Font Weight
                      </label>
                      <select
                        value={selectedField.fontWeight || 'medium'}
                        onChange={e => handleUpdateField({ fontWeight: e.target.value })}
                        className="w-full p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                      >
                        <option value="normal">Normal</option>
                        <option value="medium">Medium</option>
                        <option value="bold">Bold</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* No field selected — Template Overview */
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Template Configuration
                  </h3>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {activeTemplate.name}
                  </p>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Organization</span>
                    <p className="font-semibold text-slate-800">{activeTemplate.organization}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Watermark Base</span>
                    <p className="font-mono text-slate-600">{activeTemplate.watermarkText || 'None'}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Configured Overlays</span>
                    <p className="font-semibold text-slate-800">{activeTemplate.fields.length} Dynamic Fields</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                  Click any element on the canvas to inspect its source binding and properties.
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400">
              Live Medical JSON Binding Connected
            </span>
          </div>
        </aside>
      </div>

      {/* =========================================================================
          MODAL 1: AUTOMATIC TEMPLATE ANALYSIS (Section 8)
      ========================================================================== */}
      {isAnalysisModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#eaf9fc] text-[#2BBBD7]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Automatic Template Region Analysis
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Detected candidate regions for {activeTemplate.name}. Review before confirming.
                  </p>
                </div>
              </div>
              <button onClick={() => setIsAnalysisModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {proposedDetections.map((det, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{det.name}</span>
                      <span className="font-mono text-[10px] text-[#218DAE] bg-[#e8f4f8] px-1.5 py-0.2 rounded">
                        {det.placeholder}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{det.description}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {det.confidence}% Match
                  </span>
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>MedLens requires explicit human confirmation before saving detected region mappings.</span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsAnalysisModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Dismiss
              </button>
              <button
                onClick={() => setIsAnalysisModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#218DAE] text-white font-semibold hover:bg-[#186d88] shadow-sm"
              >
                Confirm & Apply Mappings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: PRE-EXPORT SAFETY CHECKLIST (Sections 20 & 21)
      ========================================================================== */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#e8f4f8] text-[#218DAE]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Pre-Export Clinical Safety Checklist
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Verify compliance before generating printable PDF or certified report
                  </p>
                </div>
              </div>
              <button onClick={() => setIsExportModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {/* Checklist items */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">1. Verification Status Check</span>
                  <span className="text-[11px] text-slate-500">
                    {activeReport?.verificationSummary.verified} of {activeReport?.tests.length} tests verified by clinician
                  </span>
                </div>
                {activeReport?.verificationSummary.needsReview === 0 ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Passed
                  </span>
                ) : (
                  <span className="text-amber-800 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Needs Review
                  </span>
                )}
              </div>

              {/* Unverified Warning (Section 21) */}
              {activeReport && activeReport.verificationSummary.needsReview > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 font-medium">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <span>Some information in this report requires verification before use.</span>
                  </div>
                  <p className="text-[11px] text-amber-900">
                    This document contains unverified extractions (e.g. OCR ambiguity on Hematocrit). Unverified values will be watermarked as "UNVERIFIED EXTRACT".
                  </p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">2. Source Audit Availability</span>
                  <span className="text-[11px] text-slate-500">
                    Full provenance and source PDF on file ({activeReport?.sourceDocument})
                  </span>
                </div>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Certified
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#e8f4f8] border-l-2 border-[#218DAE] text-slate-700 leading-relaxed text-[11px]">
                <span className="font-bold text-[#186d88] uppercase tracking-wider block mb-0.5">3. Non-Diagnostic Safety Notice</span>
                MedLens outputs organize and trace existing laboratory records without formulating disease diagnoses or prescribing therapies.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExecutePrint}
                className="px-4 py-1.5 rounded-lg bg-[#218DAE] text-white font-semibold hover:bg-[#186d88] shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Confirm & Print PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
