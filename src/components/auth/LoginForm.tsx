import React, { useState } from 'react';
import { ArrowLeft, LogIn, Key, Mail, AlertCircle, PlayCircle } from 'lucide-react';

interface LoginFormProps {
  onSuccess: (email: string, pass: string) => void;
  onDemoLogin: () => void;
  onBack: () => void;
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onDemoLogin,
  onBack,
  onSwitchToRegister
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email address and password.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    onSuccess(email, password);
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      setError('Enter your email address above to receive a reset link.');
      return;
    }
    setError(null);
    setForgotSent(true);
    setTimeout(() => setForgotSent(false), 5000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFB] px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-8">
        {/* Header */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to overview</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#218DAE] flex items-center justify-center text-white font-bold text-sm">
            ML
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign In to MedLens
          </h1>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Access your clinical patient workspaces and records.
        </p>

        {error && (
          <div className="p-3 mb-5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {forgotSent && (
          <div className="p-3 mb-5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <Mail className="w-4 h-4 shrink-0" />
            <span>Password reset instructions sent to {email}.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="clinician@hospital.org"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#218DAE] focus:border-transparent transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-[#218DAE] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#218DAE] focus:border-transparent transition-all"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#218DAE] text-white font-semibold text-sm hover:bg-[#186d88] transition-all shadow-md shadow-[#218DAE]/20 mt-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative px-3 bg-white text-xs text-slate-400 uppercase tracking-wider">
            or quick demo
          </span>
        </div>

        <button
          type="button"
          onClick={onDemoLogin}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#e8f4f8] text-[#186d88] border border-[#218DAE]/20 hover:border-[#218DAE] text-xs font-semibold transition-all cursor-pointer"
        >
          <PlayCircle className="w-4 h-4 text-[#218DAE]" />
          <span>Instant Demo Login (Dr. Kenneth Reed, MD)</span>
        </button>

        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-[#218DAE] font-semibold hover:underline cursor-pointer"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
};
