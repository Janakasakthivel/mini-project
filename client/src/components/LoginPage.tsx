import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn, Lock, Mail, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onNavigateRegister: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateRegister, onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setError(result.error || 'Incorrect password. Please try again.');
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPwd: string) => {
    setEmail(demoEmail);
    setPassword(demoPwd);
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-navy-950 p-6 text-white text-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-600 to-rose-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
          <ShieldAlert className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-black tracking-tight">HeatShield India</h2>
        <p className="text-xs text-slate-300 mt-1">Sign in to your heat-health risk account</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
              placeholder="name@example.com"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              required
            />
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
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-lg text-sm shadow transition flex items-center justify-center space-x-2 mt-2"
        >
          <LogIn className="w-4 h-4" />
          <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onNavigateRegister}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
          >
            Don't have an account? Create Account
          </button>
        </div>

        {/* Academic Evaluation Quick-Login Helpers */}
        <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-5 text-xs text-slate-600 space-y-2">
          <div className="font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-500 mr-1" />
              Demo Academic Accounts:
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickLogin('citizen@example.com', 'Citizen@12345')}
              className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-orange-300 transition"
            >
              <strong className="block text-slate-800">Citizen</strong>
              <span className="text-slate-400 text-[10px]">citizen@example.com</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@heatshield.gov.in', 'Admin@12345')}
              className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-purple-300 transition"
            >
              <strong className="block text-purple-900">Administrator</strong>
              <span className="text-slate-400 text-[10px]">admin@heatshield.gov.in</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('health@heatshield.gov.in', 'Health@12345')}
              className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-blue-300 transition"
            >
              <strong className="block text-blue-900">Health Authority</strong>
              <span className="text-slate-400 text-[10px]">health@heatshield.gov.in</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('disaster@heatshield.gov.in', 'Disaster@12345')}
              className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-amber-300 transition"
            >
              <strong className="block text-amber-900">Disaster Mgmt</strong>
              <span className="text-slate-400 text-[10px]">disaster@heatshield.gov.in</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
