import React from 'react';
import { X, BookOpen, Layers, CheckCircle, AlertCircle } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-4">
          <div className="p-2 bg-orange-100 rounded-xl">
            <BookOpen className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Scientific Methodology & Thermal Formulations
            </h3>
            <p className="text-xs text-slate-500">
              Biometeorological standards, formula documentation, and transparent scoring algorithms
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Principle Rule */}
          <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-4 text-orange-950">
            <h4 className="font-extrabold text-sm mb-1 text-orange-900">
              Core Architectural Separation
            </h4>
            <p>
              HeatShield India strictly avoids combining environmental weather hazard and personal biological sensitivity into a naive single value. They represent distinct scientific phenomena:
            </p>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-semibold text-slate-800">
              <div className="bg-white p-2 rounded-lg border border-orange-200">
                1. <strong>Environmental Heat Risk</strong>: How dangerous ambient atmospheric conditions are at a location.
              </div>
              <div className="bg-white p-2 rounded-lg border border-orange-200">
                2. <strong>Personal Heat Vulnerability</strong>: How susceptible an individual is based on biology & occupation.
              </div>
              <div className="bg-white p-2 rounded-lg border border-orange-200">
                3. <strong>Combined Personalized Risk</strong>: The synthesis of ambient hazard and individual tolerance.
              </div>
            </div>
          </div>

          {/* HI */}
          <div className="border border-slate-200 rounded-xl p-4">
            <h4 className="font-bold text-sm text-slate-900 mb-1">
              1. Heat Index (HI) — NOAA / Rothfusz Equation (1990)
            </h4>
            <p className="text-slate-600 mb-2">
              Based on Steadman's human biometeorological model, HI assesses perceived apparent temperature in shaded areas as a function of dry-bulb air temperature ($T$) in Fahrenheit and relative humidity ($RH$ in %):
            </p>
            <div className="bg-slate-50 p-2.5 rounded font-mono text-[11px] text-slate-800 overflow-x-auto border border-slate-200">
              HI = -42.379 + 2.04901523·T + 10.14333127·RH - 0.22475541·T·RH - 0.00683783·T² - 0.05481717·RH² + 0.00122874·T²·RH + 0.00085282·T·RH² - 0.00000199·T²·RH²
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Includes NOAA low-humidity and high-humidity adjustments. Labeled limitation: valid for T &ge; 20°C and RH &ge; 40%. Does not account for direct radiant solar load.
            </p>
          </div>

          {/* WBGT */}
          <div className="border border-slate-200 rounded-xl p-4">
            <h4 className="font-bold text-sm text-slate-900 mb-1">
              2. Wet Bulb Globe Temperature (WBGT) — ISO 7243 Standard
            </h4>
            <p className="text-slate-600 mb-2">
              The primary global industrial standard for occupational heat stress. Outdoor formulation:
            </p>
            <div className="bg-slate-50 p-2.5 rounded font-mono text-[11px] text-slate-800 border border-slate-200">
              WBGT_outdoor = 0.7·T_w + 0.2·T_g + 0.1·T_a
            </div>
            <p className="mt-2 text-slate-600">
              Natural wet-bulb temperature ($T_w$) is derived psychrometrically via <strong>Stull's formula (2011)</strong>. Black globe temperature ($T_g$) is computed via <strong>Liljegren's outdoor approximation</strong> when solar radiation ($S$ in $W/m^2$) and 10m wind velocity ($v$) are available from meteorological models. When solar radiation is unavailable, the Australian Bureau of Meteorology (BOM) in-shade equation is employed with explicit disclaimer labels.
            </p>
          </div>

          {/* UTCI */}
          <div className="border border-slate-200 rounded-xl p-4">
            <h4 className="font-bold text-sm text-slate-900 mb-1">
              3. Universal Thermal Climate Index (UTCI) — COST Action 730
            </h4>
            <p className="text-slate-600 mb-2">
              Derived from the Fiala multi-node dynamic human thermoregulation model by the International Society of Biometeorology (ISB). It equates the physiological strain of the actual outdoor environment to an equivalent reference environment.
            </p>
            <p className="text-[11px] text-slate-500">
              Approximated using the recognized 6th-order polynomial regression based on ambient air temperature, mean radiant temperature (Tmrt), relative humidity, and 10m wind velocity.
            </p>
          </div>

          {/* Environmental Risk Score */}
          <div className="border border-slate-200 rounded-xl p-4">
            <h4 className="font-bold text-sm text-slate-900 mb-1">
              4. Environmental Heat Risk Score (0 - 100)
            </h4>
            <p className="text-slate-600">
              Normalized composite scale synthesizing the 3 thermal stress indices:
            </p>
            <div className="bg-slate-50 p-2 rounded font-mono text-[11px] text-slate-800 my-1.5 border border-slate-200">
              Score_env = round(0.40·HI_norm + 0.35·WBGT_norm + 0.25·UTCI_norm)
            </div>
            <p className="text-[11px] text-slate-500">
              Levels: Low (&lt;30), Moderate (30–49), High (50–69), Very High (70–84), Extreme (&ge;85).
            </p>
          </div>

          {/* Personal Vulnerability Score */}
          <div className="border border-slate-200 rounded-xl p-4">
            <h4 className="font-bold text-sm text-slate-900 mb-1">
              5. Personal Heat Vulnerability Score (0 - 100)
            </h4>
            <p className="text-slate-600">
              Rule-based epidemiological baseline evaluated across three pillars:
            </p>
            <ul className="list-disc pl-4 mt-1 text-[11px] text-slate-600 space-y-0.5">
              <li><strong>Age Vulnerability (max 30 pts):</strong> Pediatric thermoregulation (&lt;18: 15 pts), Young/Mid adult baseline (5 pts), Senior 60–74 (25 pts), Geriatric 75+ (30 pts).</li>
              <li><strong>Occupational Solar Exposure (max 35 pts):</strong> Construction/Agricultural laborers (35 pts), Outdoor/Delivery workers (30 pts), Drivers (20 pts), Homemakers/Students (10 pts), Office workers (5 pts).</li>
              <li><strong>Pre-existing Health Sensitivity (max 35 pts):</strong> Cardiovascular conditions (15 pts), Chronic kidney disease (15 pts), Hypertension (10 pts), Diabetes (10 pts), Respiratory disease (10 pts).</li>
            </ul>
          </div>

          {/* Combined Risk */}
          <div className="border border-slate-200 rounded-xl p-4">
            <h4 className="font-bold text-sm text-slate-900 mb-1">
              6. Combined Personalized Heat Risk Formula
            </h4>
            <div className="bg-slate-50 p-2 rounded font-mono text-[11px] text-slate-800 my-1.5 border border-slate-200">
              Base = 0.55·Score_env + 0.45·Score_vuln<br />
              If (Score_env &ge; 50 and Score_vuln &ge; 50): Synergy = min(12, 0.15·(Score_env - 50) + 0.15·(Score_vuln - 50))<br />
              Combined = min(100, round(Base + Synergy))
            </div>
            <p className="text-[11px] text-slate-500">
              The non-linear synergistic amplification accounts for the biological reality that when ambient environmental heat load and personal frailty coincide, thermoregulatory collapse occurs exponentially faster.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs px-5 py-2 rounded-lg transition"
          >
            Close Scientific Guide
          </button>
        </div>
      </div>
    </div>
  );
};
