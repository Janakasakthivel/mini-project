import React from 'react';
import { useLocation } from '../context/LocationContext';
import {
  ShieldAlert,
  Droplets,
  Sun,
  HardHat,
  Users,
  AlertTriangle,
  HeartHandshake,
  Clock,
  PhoneCall,
  CheckCircle,
  Car
} from 'lucide-react';
import { Precaution } from '../types';

export const PrecautionsSection: React.FC = () => {
  const { weatherData } = useLocation();

  if (!weatherData) return null;

  const { precautions, combinedRisk } = weatherData;
  const { recommendations, emergencyProtocol, disclaimer } = precautions;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'Droplets':
        return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'Sun':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'HardHat':
        return <HardHat className="w-5 h-5 text-orange-600" />;
      case 'Car':
        return <Car className="w-5 h-5 text-slate-700" />;
      case 'HeartHandshake':
      case 'Users':
        return <Users className="w-5 h-5 text-purple-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-orange-600" />
              <span>Tailored Preventive Heat-Health Precautions</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Personalized based on current <strong>{combinedRisk.combinedCategory}</strong> risk, atmospheric heat index, your occupation, and vulnerability profile.
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 self-start sm:self-auto">
            Action Level: {combinedRisk.combinedCategory}
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className={`bg-white rounded-xl border p-4 shadow-sm flex items-start space-x-3 transition hover:shadow-md ${
              rec.priority === 'high' ? 'border-orange-300 ring-1 ring-orange-200' : 'border-slate-200'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
              {renderIcon(rec.icon)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {rec.category}
                </span>
                {rec.priority === 'high' && (
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                    High Priority
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">{rec.title}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{rec.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Heatstroke Warning Protocol Box (Critical Medical Safety) */}
      <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-5 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-rose-600 text-white rounded-lg shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h4 className="text-sm font-black uppercase tracking-wide text-rose-950">
                {emergencyProtocol.title}
              </h4>
              <div className="flex items-center space-x-1.5 text-xs font-black text-rose-800 bg-rose-200/80 px-2.5 py-1 rounded-md">
                <PhoneCall className="w-3.5 h-3.5 text-rose-700" />
                <span>Call Emergency: 108 / 112</span>
              </div>
            </div>

            <p className="text-xs font-bold text-rose-900 mt-2">
              If an individual displays any of these severe hyperthermia signs:
            </p>
            <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-rose-800">
              {emergencyProtocol.warningSigns.map((sign, i) => (
                <li key={i} className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
                  <span>{sign}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3.5 pt-3 border-t border-rose-200 text-xs font-semibold text-rose-950 bg-rose-100/70 p-3 rounded-lg leading-relaxed">
              <strong>IMMEDIATE ACTION:</strong> {emergencyProtocol.action}
            </div>
          </div>
        </div>
      </div>

      {/* Medical Safety Disclaimer */}
      <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-4 text-center leading-relaxed">
        <strong>Medical Disclaimer:</strong> {disclaimer}
      </div>
    </div>
  );
};
