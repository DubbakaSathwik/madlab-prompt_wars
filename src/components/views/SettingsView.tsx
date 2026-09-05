import React, { useState } from 'react';
import { Settings, Shield, Cpu, Key, Database, RefreshCw, CheckCircle2, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import { GeminiService } from '../../services/geminiService';

interface SettingsViewProps {
  onResetDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetDemoData }) => {
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);
  const [autoVerifyThreshold, setAutoVerifyThreshold] = useState(95);
  const [strictReferenceCheck, setStrictReferenceCheck] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Gemini API Key management
  const [apiKeyInput, setApiKeyInput] = useState<string>(GeminiService.getApiKey());
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({ loading: false });
  const isFromEnv = Boolean((import.meta as any).env?.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY);

  const handleTestKey = async () => {
    setTestStatus({ loading: true });
    const res = await GeminiService.testConnection(apiKeyInput);
    setTestStatus({ loading: false, success: res.success, message: res.message });
  };

  const handleSaveKey = () => {
    GeminiService.setApiKey(apiKeyInput);
    handleTestKey();
  };

  const handleReset = () => {
    onResetDemoData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-8 bg-[#F8FAFB] select-none">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            System & Clinical Settings
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Configure validation thresholds, OCR pipeline preferences, and local cache.
          </p>
        </div>

        {/* Google Gemini AI Engine Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#218DAE]" />
              <h2 className="text-sm font-bold text-slate-900">
                Google Gemini Clinical Intelligence Engine
              </h2>
            </div>
            {isFromEnv ? (
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Loaded from .env
              </span>
            ) : apiKeyInput ? (
              <span className="text-[10px] font-mono font-bold text-[#218DAE] bg-[#e8f4f8] px-2.5 py-1 rounded-md border border-[#218DAE]/30">
                Stored in Browser
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                Not Configured
              </span>
            )}
          </div>

          <p className="text-slate-600 leading-relaxed text-[11.5px]">
            MedLens uses <strong>Gemini 2.5 Flash</strong> to analyze multi-page medical PDF reports, extract all lab parameters and reference intervals, detect clinical flags, and produce verified Medical JSON.
          </p>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Gemini API Key
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                    placeholder="Enter GEMINI_API_KEY (e.g. AQ... or AIzaSy...)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-10 text-xs font-mono text-slate-800 outline-none focus:border-[#218DAE] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="px-4 py-2 bg-[#218DAE] hover:bg-[#1a738e] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Save Key
                </button>
                <button
                  type="button"
                  disabled={testStatus.loading || !apiKeyInput}
                  onClick={handleTestKey}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {testStatus.loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Cpu className="w-3.5 h-3.5 text-[#218DAE]" />
                  )}
                  <span>Test Connection</span>
                </button>
              </div>
            </div>

            {testStatus.message && (
              <div
                className={`p-3 rounded-xl border flex items-center gap-2 text-[11px] ${
                  testStatus.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {testStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{testStatus.message}</span>
              </div>
            )}

            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 space-y-1">
              <div className="font-semibold text-slate-700">How to configure:</div>
              <div>1. Open the project root <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">.env</code> file.</div>
              <div>2. Set <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">GEMINI_API_KEY=your_key_here</code>.</div>
              <div>3. Or paste your key directly above — it will be saved securely in your browser session.</div>
            </div>
          </div>
        </div>

        {/* Clinical Guardrails & Thresholds */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Shield className="w-4 h-4 text-[#218DAE]" />
            <h2 className="text-sm font-bold text-slate-900">
              Extraction & Human-in-the-Loop Thresholds
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-slate-800">
                  Minimum Confidence Review Trigger
                </span>
                <span className="font-mono font-bold text-[#218DAE]">
                  {confidenceThreshold}%
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mb-2">
                Values extracted with confidence below this threshold are automatically flagged as "Needs Review".
              </p>
              <input
                type="range"
                min="50"
                max="95"
                value={confidenceThreshold}
                onChange={e => setConfidenceThreshold(Number(e.target.value))}
                className="w-full accent-[#218DAE] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-slate-800">
                  Strict Reference Range Enforcement
                </span>
                <input
                  type="checkbox"
                  checked={strictReferenceCheck}
                  onChange={e => setStrictReferenceCheck(e.target.checked)}
                  className="accent-[#218DAE] w-4 h-4 rounded cursor-pointer"
                />
              </div>
              <p className="text-slate-500 text-[11px]">
                Prevent external standard ranges from being substituted if the source report omits laboratory reference values.
              </p>
            </div>
          </div>
        </div>

        {/* Local Storage & Cache */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Database className="w-4 h-4 text-[#218DAE]" />
            <h2 className="text-sm font-bold text-slate-900">
              Local Storage & Synthetic Patient Cache
            </h2>
          </div>

          <p className="text-slate-600 leading-relaxed">
            MedLens maintains synthetic demo records locally in your browser storage. You can reset all patient data, verification states, and changes back to baseline demo states at any time.
          </p>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo Patient Records</span>
            </button>

            {resetSuccess && (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Demo records restored successfully!</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
