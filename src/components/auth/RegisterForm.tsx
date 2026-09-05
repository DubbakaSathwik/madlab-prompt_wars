import React, { useState } from 'react';
import { ArrowLeft, UserPlus, Mail, Key, User as UserIcon, Building2, Stethoscope, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types/auth';

interface RegisterFormProps {
  onSuccess: (name: string, email: string, pass: string, role: UserRole) => void;
  onBack: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onBack,
  onSwitchToLogin
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('HEALTHCARE_PROFESSIONAL');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required registration fields.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please provide a valid clinical or personal email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    onSuccess(fullName, email, password, role);
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
            Create Account
          </h1>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Set up your profile to review and organize clinical records.
        </p>

        {error && (
          <div className="p-3 mb-5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Account Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('HEALTHCARE_PROFESSIONAL')}
                className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  role === 'HEALTHCARE_PROFESSIONAL'
                    ? 'border-[#218DAE] bg-[#e8f4f8] text-[#186d88] font-medium'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Stethoscope className="w-4 h-4 mb-1" />
                <span className="text-xs">Clinician</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('PATIENT')}
                className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  role === 'PATIENT'
                    ? 'border-[#218DAE] bg-[#e8f4f8] text-[#186d88] font-medium'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <UserIcon className="w-4 h-4 mb-1" />
                <span className="text-xs">Patient</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('ORGANIZATION_LAB')}
                className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  role === 'ORGANIZATION_LAB'
                    ? 'border-[#218DAE] bg-[#e8f4f8] text-[#186d88] font-medium'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Building2 className="w-4 h-4 mb-1" />
                <span className="text-xs">Lab / Clinic</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Dr. Sarah Jenkins or Eleanor Vance"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#218DAE] focus:border-transparent transition-all"
              />
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@healthcare.org"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#218DAE] focus:border-transparent transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
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
            <UserPlus className="w-4 h-4" />
            <span>Complete Registration</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already registered?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-[#218DAE] font-semibold hover:underline cursor-pointer"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
