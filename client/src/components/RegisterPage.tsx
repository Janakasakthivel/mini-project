import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserPlus, Lock, Mail, User, MapPin, AlertCircle, Check } from 'lucide-react';

interface RegisterPageProps {
  onNavigateLogin: () => void;
  onRegisterSuccess: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateLogin, onRegisterSuccess }) => {
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password criteria checks
  const criteria = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    match: password.length > 0 && password === confirmPassword
  };

  const allValid =
    criteria.length &&
    criteria.upper &&
    criteria.lower &&
    criteria.number &&
    criteria.special &&
    criteria.match;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!allValid) {
      setError('Please fulfill all required password security criteria before registering.');
      return;
    }

    setLoading(true);
    const result = await register({
      fullName,
      email,
      password,
      confirmPassword,
      city,
      state
    });
    setLoading(false);

    if (result.success) {
      onRegisterSuccess();
    } else {
      setError(result.error || 'Failed to register account.');
    }
  };

  const southIndianStates = ['Tamil Nadu', 'Karnataka', 'Telangana', 'Andhra Pradesh', 'Kerala', 'Puducherry'];

  return (
    <div className="max-w-lg mx-auto my-8 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-navy-950 p-6 text-white text-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-600 to-rose-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-black tracking-tight">Create HeatShield Account</h2>
        <p className="text-xs text-slate-300 mt-1">Register for hyperlocal heat-health risk warnings</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ramesh@example.com"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Chennai"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              State
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
            >
              {southIndianStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create strong password"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              required
            />
          </div>
        </div>

        {/* Clear Password Criteria Checklist Display (Strict Prompt Requirement) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs">
          <div className="font-bold text-slate-800 mb-1">Required Password Creation Criteria:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
            <div className={`flex items-center space-x-1.5 ${criteria.length ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${criteria.length ? 'bg-emerald-600 text-white' : 'border border-slate-300'}`}>
                {criteria.length ? '✓' : ''}
              </span>
              <span>Min. 8 characters</span>
            </div>

            <div className={`flex items-center space-x-1.5 ${criteria.upper ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${criteria.upper ? 'bg-emerald-600 text-white' : 'border border-slate-300'}`}>
                {criteria.upper ? '✓' : ''}
              </span>
              <span>At least 1 uppercase (A-Z)</span>
            </div>

            <div className={`flex items-center space-x-1.5 ${criteria.lower ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${criteria.lower ? 'bg-emerald-600 text-white' : 'border border-slate-300'}`}>
                {criteria.lower ? '✓' : ''}
              </span>
              <span>At least 1 lowercase (a-z)</span>
            </div>

            <div className={`flex items-center space-x-1.5 ${criteria.number ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${criteria.number ? 'bg-emerald-600 text-white' : 'border border-slate-300'}`}>
                {criteria.number ? '✓' : ''}
              </span>
              <span>At least 1 number (0-9)</span>
            </div>

            <div className={`flex items-center space-x-1.5 ${criteria.special ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${criteria.special ? 'bg-emerald-600 text-white' : 'border border-slate-300'}`}>
                {criteria.special ? '✓' : ''}
              </span>
              <span>1 special character (!@#$%...)</span>
            </div>

            <div className={`flex items-center space-x-1.5 ${criteria.match ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${criteria.match ? 'bg-emerald-600 text-white' : 'border border-slate-300'}`}>
                {criteria.match ? '✓' : ''}
              </span>
              <span>Passwords match</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !allValid}
          className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-sm shadow transition flex items-center justify-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onNavigateLogin}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
          >
            Already have an account? Sign In
          </button>
        </div>
      </form>
    </div>
  );
};
