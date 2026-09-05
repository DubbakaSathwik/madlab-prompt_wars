import React, { useEffect, useState } from 'react';
import { ShieldAlert, ArrowRight, SkipForward } from 'lucide-react';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  // phase: 'screen1' (MEDLENS title) | 'screen2' (Safety Notice)
  const [phase, setPhase] = useState<'screen1' | 'screen2'>('screen1');
  const [animationState, setAnimationState] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    // Screen 1: ~3 seconds total
    // 0-0.8s: blur in, 0.8-2.2s: hold, 2.2-3.0s: blur out -> switch to screen 2
    if (phase === 'screen1') {
      const holdTimer = setTimeout(() => setAnimationState('hold'), 800);
      const outTimer = setTimeout(() => setAnimationState('out'), 2200);
      const nextTimer = setTimeout(() => {
        setPhase('screen2');
        setAnimationState('in');
      }, 3000);

      return () => {
        clearTimeout(holdTimer);
        clearTimeout(outTimer);
        clearTimeout(nextTimer);
      };
    }

    // Screen 2: ~7 seconds total
    // 0-0.8s: blur in, 0.8-6.2s: hold, 6.2-7.0s: blur out -> onComplete
    if (phase === 'screen2') {
      const holdTimer = setTimeout(() => setAnimationState('hold'), 800);
      const outTimer = setTimeout(() => setAnimationState('out'), 6200);
      const finishTimer = setTimeout(() => onComplete(), 7000);

      return () => {
        clearTimeout(holdTimer);
        clearTimeout(outTimer);
        clearTimeout(finishTimer);
      };
    }
  }, [phase, onComplete]);

  const getAnimationClasses = () => {
    switch (animationState) {
      case 'in':
        return 'opacity-0 blur-md scale-98 transition-all duration-700 ease-out';
      case 'hold':
        return 'opacity-100 blur-0 scale-100 transition-all duration-700 ease-in-out';
      case 'out':
        return 'opacity-0 blur-lg scale-102 transition-all duration-700 ease-in';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F8FAFB] text-slate-900 select-none overflow-hidden">
      {/* Subtle background ambient pulse */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40" />

      {/* Skip button for hackathon efficiency */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors z-50 cursor-pointer"
        aria-label="Skip introduction"
      >
        <span>Skip intro</span>
        <SkipForward className="w-3.5 h-3.5" />
      </button>

      {phase === 'screen1' ? (
        /* SCREEN 1 — MEDLENS */
        <div className={`flex flex-col items-center justify-center ${getAnimationClasses()}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 rounded-full bg-[#218DAE] shadow-sm shadow-[#218DAE]/30" />
            <h1 className="text-5xl md:text-6xl font-semibold tracking-wider text-slate-900 font-sans">
              MEDLENS
            </h1>
          </div>
          <p className="text-sm md:text-base font-normal tracking-wide text-slate-500 mt-2">
            Clinical Information Intelligence
          </p>
        </div>
      ) : (
        /* SCREEN 2 — SAFETY NOTICE */
        <div className={`max-w-xl mx-6 p-8 md:p-10 rounded-2xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 ${getAnimationClasses()}`}>
          <div className="flex items-center gap-2.5 text-[#218DAE] mb-5">
            <div className="p-2 rounded-lg bg-[#e8f4f8]">
              <ShieldAlert className="w-5 h-5 text-[#218DAE]" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
              Important Information
            </h2>
          </div>

          <div className="space-y-4 text-sm md:text-base leading-relaxed text-slate-600">
            <p>
              MedLens is an AI-powered tool designed to organize, summarize, and explain information from your medical records.
            </p>

            <p className="font-semibold text-slate-800 bg-[#e8f4f8]/50 p-3 rounded-lg border-l-2 border-[#218DAE]">
              MedLens is not a doctor and does not provide medical diagnosis or treatment recommendations.
            </p>

            <p>
              AI-generated information may be incomplete, inaccurate, or misunderstood.{' '}
              <strong className="text-slate-800 font-semibold">Do not rely on MedLens for medical decisions.</strong>
            </p>

            <p className="text-slate-500 text-xs md:text-sm">
              For any medical concern, diagnosis, or treatment decision, please consult a qualified healthcare professional.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Responsible AI Clinical Protocol
            </span>
            <button
              onClick={onComplete}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#218DAE] text-white text-sm font-medium hover:bg-[#186d88] transition-colors shadow-sm"
            >
              <span>I Understand & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Progress Dots */}
      <div className="absolute bottom-10 flex items-center gap-2">
        <div className={`h-1.5 rounded-full transition-all duration-300 ${phase === 'screen1' ? 'w-6 bg-[#218DAE]' : 'w-1.5 bg-slate-300'}`} />
        <div className={`h-1.5 rounded-full transition-all duration-300 ${phase === 'screen2' ? 'w-6 bg-[#218DAE]' : 'w-1.5 bg-slate-300'}`} />
      </div>
    </div>
  );
};
