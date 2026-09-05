import React, { useState, useEffect, useRef } from 'react';
import { ClinicalReport, Patient } from '../../types/medical';
import { FileStorageService } from '../../services/fileStorageService';
import { 
  ShieldCheck, 
  Award, 
  Sparkles, 
  MapPin, 
  FileText, 
  Upload, 
  ExternalLink, 
  Download, 
  Layers, 
  RefreshCw,
  Eye,
  FileCheck
} from 'lucide-react';

interface DocumentViewerProps {
  report: ClinicalReport;
  patient?: Patient;
  selectedTestId?: string;
  onSelectTest?: (testId: string) => void;
  zoomLevel: number;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  report,
  patient,
  selectedTestId,
  onSelectTest,
  zoomLevel
}) => {
  const [fileUrl, setFileUrl] = useState<string | null>(() => {
    return report.fileUrl || FileStorageService.getCachedUrl(report.id) || null;
  });
  const [activeViewMode, setActiveViewMode] = useState<'ORIGINAL' | 'SYNTHETIC'>('ORIGINAL');
  const [isAttaching, setIsAttaching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Retrieve file URL from memory or IndexedDB on report change
  useEffect(() => {
    let isMounted = true;
    if (report.fileUrl) {
      setFileUrl(report.fileUrl);
    } else {
      const cached = FileStorageService.getCachedUrl(report.id);
      if (cached) {
        setFileUrl(cached);
      } else {
        FileStorageService.getFileUrl(report.id).then(url => {
          if (isMounted && url) {
            setFileUrl(url);
          }
        });
      }
    }
    return () => {
      isMounted = false;
    };
  }, [report.id, report.fileUrl]);

  const [dragActive, setDragActive] = useState(false);

  const processAttachedFile = async (file: File) => {
    setIsAttaching(true);
    try {
      const url = await FileStorageService.saveFile(report.id, file);
      setFileUrl(url);
      report.fileUrl = url;
      report.fileType = file.type;
      setActiveViewMode('ORIGINAL');
    } catch (err) {
      console.error('Failed to attach file:', err);
    } finally {
      setIsAttaching(false);
    }
  };

  const handleAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processAttachedFile(e.target.files[0]);
    }
  };

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
      processAttachedFile(e.dataTransfer.files[0]);
    }
  };

  const selectedTest = report.tests.find(t => t.id === selectedTestId);
  const isPdf = 
    report.fileType === 'application/pdf' || 
    report.sourceDocument.toLowerCase().endsWith('.pdf') || 
    (fileUrl?.startsWith('data:application/pdf') ?? false);
  const isImage = 
    report.fileType?.startsWith('image/') || 
    /\.(png|jpe?g|webp|gif|bmp)$/i.test(report.sourceDocument) || 
    (fileUrl?.startsWith('data:image/') ?? false);

  return (
    <div className="w-full h-full flex flex-col bg-slate-100 select-none overflow-hidden">
      {/* Document Sub-Header Toolbar */}
      <div className="h-10 border-b border-slate-200/90 px-4 flex items-center justify-between bg-white shrink-0 text-xs z-10 shadow-2xs">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveViewMode('ORIGINAL')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                activeViewMode === 'ORIGINAL'
                  ? 'bg-white text-[#186d88] shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#218DAE]" />
              <span>Original File Preview</span>
              {fileUrl && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="File Loaded" />
              )}
            </button>

            <button
              onClick={() => setActiveViewMode('SYNTHETIC')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                activeViewMode === 'SYNTHETIC'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#218DAE]" />
              <span>Extracted Layout Template</span>
            </button>
          </div>

          <span className="text-slate-300">|</span>

          <span className="font-mono text-slate-600 text-[11px] truncate max-w-[220px]">
            {report.sourceDocument}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {fileUrl ? (
            <>
              <button
                onClick={() => window.open(fileUrl, '_blank')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                title="Open document in new browser tab"
              >
                <ExternalLink className="w-3 h-3 text-slate-500" />
                <span className="hidden sm:inline">Open in New Tab</span>
              </button>

              <a
                href={fileUrl}
                download={report.sourceDocument}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                title="Download original file"
              >
                <Download className="w-3 h-3 text-slate-500" />
                <span className="hidden sm:inline">Download</span>
              </a>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                title="Replace / Re-attach file"
              >
                <RefreshCw className="w-3 h-3 text-slate-500" />
                <span className="hidden md:inline">Replace File</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#218DAE] hover:bg-[#186d88] text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Upload className="w-3 h-3" />
              <span>Attach {report.sourceDocument}</span>
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleAttachFile}
            className="hidden"
          />
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 w-full overflow-hidden relative">
        {activeViewMode === 'ORIGINAL' ? (
          fileUrl ? (
            <div className="w-full h-full flex flex-col bg-slate-200/50 p-3 overflow-hidden">
              {/* Active Provenance Highlight Callout Indicator (Section 11) */}
              {selectedTest && (
                <div className="mb-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#eaf9fc] to-[#e8f4f8] border border-[#2BBBD7] shadow-xs flex items-center justify-between text-xs animate-fade-in shrink-0">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Sparkles className="w-4 h-4 text-[#2BBBD7]" />
                    <span className="font-semibold">Source Provenance Focus:</span>
                    <span className="font-bold text-[#186d88]">
                      {selectedTest.testName} ({selectedTest.value} {selectedTest.unit})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
                      Confidence: {selectedTest.provenance.confidence}%
                    </span>
                    <span className="font-bold text-[#218DAE]">Page {selectedTest.provenance.page}</span>
                  </div>
                </div>
              )}

              {/* Document Rendering */}
              {isPdf ? (
                <div className="w-full flex-1 rounded-xl overflow-hidden shadow-xl border border-slate-300 bg-white">
                  <object
                    data={`${fileUrl}#toolbar=1&navpanes=0`}
                    type="application/pdf"
                    className="w-full h-full min-h-[500px]"
                  >
                    <iframe
                      src={`${fileUrl}#toolbar=1&navpanes=0`}
                      className="w-full h-full border-0"
                      title={report.sourceDocument}
                    >
                      <div className="p-8 text-center">
                        <p className="text-slate-700 font-semibold mb-2">Unable to display PDF inline.</p>
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#218DAE] text-white rounded-lg text-xs font-bold"
                        >
                          Open {report.sourceDocument} in New Tab
                        </a>
                      </div>
                    </iframe>
                  </object>
                </div>
              ) : isImage ? (
                <div className="w-full h-full overflow-auto p-4 flex items-center justify-center">
                  <div
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                    className="transition-transform duration-150 flex justify-center"
                  >
                    <img
                      src={fileUrl}
                      alt={report.sourceDocument}
                      className="max-w-4xl w-auto h-auto rounded-lg shadow-2xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center p-8 text-center">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-sm">
                    <FileText className="w-8 h-8 text-[#218DAE] mx-auto mb-2" />
                    <h4 className="font-bold text-slate-800 text-sm">File Ready for Preview</h4>
                    <p className="text-xs text-slate-500 mt-1 mb-4">{report.sourceDocument}</p>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#218DAE] text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-[#186d88]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Document</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* File Not Loaded Yet (e.g. from prior session) */
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-50"
            >
              <div className={`max-w-md w-full bg-white rounded-2xl border-2 p-8 shadow-sm text-center space-y-4 transition-all ${
                dragActive ? 'border-[#218DAE] bg-[#e8f4f8]' : 'border-slate-200'
              }`}>
                <div className="w-14 h-14 rounded-2xl bg-[#e8f4f8] text-[#218DAE] flex items-center justify-center mx-auto shadow-xs">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Preview Original Document
                  </h3>
                  <div className="mt-1">
                    <span className="text-xs font-mono font-bold text-[#186d88] bg-[#e8f4f8] px-3 py-1 rounded-lg border border-[#218DAE]/30 inline-block">
                      {report.sourceDocument}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                    Attach or drop <strong className="text-slate-700">{report.sourceDocument}</strong> to preview the authentic source PDF / image directly inside MedLens with complete zoom and navigation controls.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAttaching}
                    className="px-4 py-2.5 rounded-xl bg-[#218DAE] hover:bg-[#186d88] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isAttaching ? 'Attaching...' : `Attach ${report.sourceDocument}`}</span>
                  </button>

                  <button
                    onClick={() => setActiveViewMode('SYNTHETIC')}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Extracted Template</span>
                  </button>
                </div>
              </div>
            </div>
          )
        ) : (
          /* SYNTHETIC VIEW: Formatted Document Canvas */
          <div className="w-full h-full overflow-auto p-6 flex justify-center bg-slate-200/60 select-none relative">
            <div
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
              className="w-[780px] min-h-[1050px] bg-white text-slate-900 shadow-2xl rounded-sm p-10 font-sans relative transition-transform duration-150 border border-slate-300"
            >
              {/* Subtle Diagonal Watermark */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-4 overflow-hidden">
                <span className="text-7xl font-black text-slate-900 -rotate-45 tracking-widest uppercase">
                  {report.facility.name}
                </span>
              </div>

              {/* Active Provenance Highlight Callout Indicator (Section 11) */}
              {selectedTest && (
                <div className="mb-4 p-2.5 rounded-lg bg-gradient-to-r from-[#eaf9fc] to-[#e8f4f8] border border-[#2BBBD7] shadow-xs flex items-center justify-between text-xs animate-fade-in">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Sparkles className="w-4 h-4 text-[#2BBBD7]" />
                    <span className="font-semibold">Source Provenance Focus:</span>
                    <span className="font-bold text-[#186d88]">
                      {selectedTest.testName} ({selectedTest.value} {selectedTest.unit})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
                      Confidence: {selectedTest.provenance.confidence}%
                    </span>
                    <span className="text-slate-400">Page {selectedTest.provenance.page}</span>
                  </div>
                </div>
              )}

              {/* Document Header / Laboratory Letterhead */}
              <header className="border-b-2 border-slate-900 pb-4 mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#218DAE] text-white flex items-center justify-center font-bold text-lg rounded-sm shadow-xs">
                      ML
                    </div>
                    <div>
                      <h1 className="text-xl font-bold tracking-tight text-slate-900">
                        {report.facility.name}
                      </h1>
                      <p className="text-xs text-slate-600">
                        {report.facility.address || 'Clinical Diagnostic & Pathology Center'}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                        <span>Tel: {report.facility.phone || '+1 (800) 555-LABS'}</span>
                        <span>•</span>
                        <span>{report.facility.license || 'CLIA #05D9823412'}</span>
                        <span>•</span>
                        <span>Director: {report.facility.director || 'Robert Sterling, MD'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-sm uppercase">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Certified Clinical Record</span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 mt-1">
                      DOC ID: {report.documentId}
                    </p>
                  </div>
                </div>
              </header>

              {/* Patient & Specimen Demographics Box */}
              <section className="bg-slate-50 border border-slate-300 rounded-sm p-3.5 mb-6 text-xs grid grid-cols-2 gap-y-2 gap-x-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Name</span>
                  <span className="font-bold text-slate-900 text-sm">{patient?.name || 'Patient Record'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient ID / MRN</span>
                  <span className="font-mono font-semibold text-slate-800">{patient?.patientId || report.patientId}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Age / Sex / DOB</span>
                  <span className="text-slate-800 font-medium">
                    {patient ? `${patient.age} Yrs / ${patient.sex} / ${patient.dateOfBirth}` : 'Documented in Chart'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Requesting Physician</span>
                  <span className="text-slate-800 font-medium">{report.doctorName || 'Attending Physician'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Specimen Collection Date</span>
                  <span className="text-slate-800 font-medium font-mono">{report.date} 08:30 AM</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Report Verified Date</span>
                  <span className="text-slate-800 font-medium font-mono">{report.date} 10:14 AM</span>
                </div>
              </section>

              {/* Document Title Banner */}
              <div className="bg-slate-800 text-white px-3 py-1.5 rounded-xs mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                <span>{report.reportName}</span>
                <span className="text-[10px] font-normal text-slate-300">Method: Automated Flow Cytometry & Photometry</span>
              </div>

              {/* Laboratory Test Table with Interactive Bounding Boxes & Highlighting */}
              <table className="w-full text-left text-xs mb-8 border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-[11px] font-bold text-slate-700 uppercase">
                    <th className="py-2 px-3">Test Description</th>
                    <th className="py-2 px-3">Result</th>
                    <th className="py-2 px-2 text-center">Flag</th>
                    <th className="py-2 px-3">Units</th>
                    <th className="py-2 px-3">Reference Interval</th>
                    <th className="py-2 px-2 text-right">Provenance</th>
                  </tr>
                </thead>
                <tbody>
                  {report.tests.map(test => {
                    const isSelected = test.id === selectedTestId;
                    const isLow = test.status === 'LOW';
                    const isHigh = test.status === 'HIGH';

                    return (
                      <tr
                        key={test.id}
                        onClick={() => onSelectTest?.(test.id)}
                        className={`border-b border-slate-200 transition-all cursor-pointer group relative ${
                          isSelected
                            ? 'bg-[#2BBBD7]/20 ring-2 ring-[#218DAE] shadow-sm font-semibold'
                            : 'hover:bg-slate-100/70'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full transition-all ${
                              isSelected ? 'bg-[#218DAE] scale-125' : 'bg-slate-300 group-hover:bg-[#218DAE]'
                            }`} />
                            <span className={isSelected ? 'text-[#186d88] font-bold' : ''}>
                              {test.testName}
                            </span>
                          </div>
                        </td>
                        <td className={`py-2.5 px-3 font-mono text-sm ${
                          isSelected 
                            ? 'text-[#186d88] font-black' 
                            : isLow || isHigh 
                            ? 'text-slate-900 font-bold' 
                            : 'text-slate-800'
                        }`}>
                          {test.value}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {isLow && (
                            <span className="text-[10px] font-black text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                              L
                            </span>
                          )}
                          {isHigh && (
                            <span className="text-[10px] font-black text-rose-900 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-300">
                              H
                            </span>
                          )}
                          {!isLow && !isHigh && (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                          {test.unit}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                          {test.referenceRange.rawText}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-[10px]">
                          {isSelected ? (
                            <span className="inline-flex items-center gap-1 text-[#218DAE] font-bold">
                              <MapPin className="w-3 h-3" />
                              P.{test.provenance.page}
                            </span>
                          ) : (
                            <span className="text-slate-400">P.{test.provenance.page}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Clinical Observations & Pathologist Notes */}
              {report.observations && report.observations.length > 0 && (
                <section className="border-t border-slate-300 pt-4 mb-8 text-xs">
                  <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Pathology Observations & Interpretive Comments
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    {report.observations.map((obs, i) => (
                      <li key={i}>{obs}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Footer & Signature Authentication */}
              <footer className="mt-12 pt-6 border-t-2 border-slate-900 flex items-end justify-between text-xs text-slate-600">
                <div>
                  <p className="font-bold text-slate-900">{report.facility.director || 'Robert Sterling, MD, FCAP'}</p>
                  <p className="text-[11px]">Director of Clinical Pathology & Laboratory Medicine</p>
                  <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] mt-1 font-mono">
                    <Award className="w-3.5 h-3.5" />
                    <span>Electronically Signed & Certified at {report.date} 10:14:22 UTC</span>
                  </div>
                </div>

                <div className="text-right font-mono text-[10px] text-slate-400">
                  <p>Page 1 of 1</p>
                  <p className="text-slate-300 mt-1">PROVENANCE ID: SHA256-88192a</p>
                </div>
              </footer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

