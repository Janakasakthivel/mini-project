import React from 'react';
import { X, AlertTriangle, PhoneCall, HeartPulse, CheckCircle2, AlertCircle } from 'lucide-react';

interface MedicalSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MedicalSafetyModal: React.FC<MedicalSafetyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-4">
          <div className="p-2 bg-rose-100 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Heat-Health Medical Safety & Emergency Protocol
            </h3>
            <p className="text-xs text-slate-500">
              Emergency Recognition: Heat Exhaustion vs. Life-Threatening Heat Stroke
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          {/* Emergency Alert Callout */}
          <div className="bg-rose-600 text-white p-4 rounded-xl shadow flex items-center justify-between">
            <div>
              <span className="font-extrabold uppercase text-xs tracking-wider block text-rose-200">
                Medical Emergency Numbers
              </span>
              <span className="text-xl font-black">Ambulance: 108 &nbsp;|&nbsp; National Emergency: 112</span>
            </div>
            <PhoneCall className="w-8 h-8 text-rose-200 shrink-0" />
          </div>

          {/* Exhaustion vs Stroke Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Heat Exhaustion */}
            <div className="border border-amber-300 bg-amber-50/60 rounded-xl p-3.5">
              <span className="font-bold text-amber-900 text-sm block mb-1">
                ⚠️ Heat Exhaustion
              </span>
              <span className="text-[10px] text-amber-700 font-semibold block mb-2 uppercase">
                Early Warning Phase
              </span>
              <ul className="space-y-1 text-slate-700 text-[11px]">
                <li>• Heavy, profuse sweating</li>
                <li>• Pale, cool, or clammy skin</li>
                <li>• Fast, weak pulse</li>
                <li>• Muscle cramps or spasms</li>
                <li>• Dizziness, headache, nausea</li>
              </ul>
              <div className="mt-3 pt-2 border-t border-amber-200 text-[11px] font-semibold text-amber-900">
                Action: Move to shade, loosen clothing, sip cool water, apply damp cloth.
              </div>
            </div>

            {/* Heat Stroke */}
            <div className="border border-rose-300 bg-rose-50/70 rounded-xl p-3.5">
              <span className="font-bold text-rose-950 text-sm block mb-1">
                🚨 Heat Stroke
              </span>
              <span className="text-[10px] text-rose-700 font-semibold block mb-2 uppercase">
                CRITICAL LIFE EMERGENCY
              </span>
              <ul className="space-y-1 text-rose-900 text-[11px]">
                <li>• High body temperature (&gt; 103°F / 39.4°C)</li>
                <li>• Hot, red, dry skin (sweating stopped)</li>
                <li>• Confusion, slurred speech, delirium</li>
                <li>• Rapid, strong bounding pulse</li>
                <li>• Seizures or loss of consciousness</li>
              </ul>
              <div className="mt-3 pt-2 border-t border-rose-200 text-[11px] font-bold text-rose-950">
                Action: CALL 108 IMMEDIATELY. Rapidly cool body with ice packs or cold water immersion. DO NOT give fluids if unconscious.
              </div>
            </div>
          </div>

          {/* Platform Medical Boundaries */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px] text-slate-600 space-y-1.5">
            <h4 className="font-bold text-slate-800">What HeatShield India Is and Is NOT:</h4>
            <div className="flex items-start space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>IS an early warning awareness tool providing biometeorological hazard scores and preventive hydration guidance.</span>
            </div>
            <div className="flex items-start space-x-1.5 text-rose-800 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <span>IS NOT a diagnostic medical service. Never prescribes medications or alters treatment regimes.</span>
            </div>
            <div className="flex items-start space-x-1.5 text-rose-800 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <span>NEVER discontinue or modify your prescribed medications without direct clinical guidance from your physician.</span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs px-5 py-2 rounded-lg transition"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
