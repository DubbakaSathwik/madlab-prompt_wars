import React from 'react';
import { LogIn, UserPlus, PlayCircle, ShieldCheck, FileCheck, Layers } from 'lucide-react';

interface AuthLandingProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onDemoClick: () => void;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({
  onLoginClick,
  onRegisterClick,
  onDemoClick
}) => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAFB] text-slate-900 px-6 py-12">
      {/* Top Brand Bar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#218DAE] flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-[#218DAE]/30">
            ML
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">MEDLENS</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          Clinical Intelligence v1.0
        </div>
      </header>

      {/* Main Hero Card */}
      <main className="max-w-xl mx-auto w-full my-auto text-center py-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e8f4f8] text-[#218DAE] text-xs font-semibold tracking-wide uppercase mb-6">
          <Layers className="w-3.5 h-3.5" />
          <span>Structured Clinical Records</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-4">
          MEDLENS
        </h1>

        <p className="text-lg md:text-xl text-slate-600 font-normal mb-8 leading-relaxed">
          Your medical information, organized and understood.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
          <button
            onClick={onLoginClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#218DAE] text-white font-semibold text-sm hover:bg-[#186d88] transition-all shadow-md shadow-[#218DAE]/20 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Log In</span>
          </button>

          <button
            onClick={onRegisterClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Continue with Demo Option */}
        <div className="pt-6 border-t border-slate-200/80">
          <button
            onClick={onDemoClick}
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e8f4f8] to-[#eaf9fc] border border-[#218DAE]/30 text-[#186d88] hover:border-[#218DAE] transition-all cursor-pointer text-sm font-medium"
          >
            <PlayCircle className="w-4 h-4 text-[#218DAE] group-hover:scale-110 transition-transform" />
            <span>Quick Start Workspace</span>
          </button>
          <p className="text-xs text-slate-400 mt-2">
            Open workspace immediately to add your patient records and upload clinical reports.
          </p>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-12 text-left">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#218DAE] mb-2" />
            <h2 className="text-xs font-semibold text-slate-800">Source Provenance</h2>
            <p className="text-xs text-slate-500 mt-0.5">Every extracted lab value links directly to its source PDF.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-sm">
            <FileCheck className="w-4 h-4 text-[#218DAE] mb-2" />
            <h2 className="text-xs font-semibold text-slate-800">Human Verification</h2>
            <p className="text-xs text-slate-500 mt-0.5">Built-in clinician confirmation, edit, and audit trail.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-sm">
            <Layers className="w-4 h-4 text-[#2BBBD7] mb-2" />
            <h2 className="text-xs font-semibold text-slate-800">Responsible AI</h2>
            <p className="text-xs text-slate-500 mt-0.5">Non-diagnostic explanations with physician discussion guides.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center text-xs text-slate-400 pt-6 border-t border-slate-100">
        MedLens Clinical Information Intelligence · Synthetic Demonstration Environment
      </footer>
    </div>
  );
};
