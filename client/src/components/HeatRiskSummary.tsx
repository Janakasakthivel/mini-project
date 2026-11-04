import React from 'react';
import { useLocation } from '../context/LocationContext';
import {
  ShieldAlert,
  Thermometer,
  UserCheck,
  AlertCircle,
  HelpCircle,
  Info,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';

interface HeatRiskSummaryProps {
  onNavigateProfile?: () => void;
  openMethodology?: () => void;
}

export const HeatRiskSummary: React.FC<HeatRiskSummaryProps> = ({
  onNavigateProfile,
  openMethodology
}) => {
  const { weatherData } = useLocation();

  if (!weatherData) return null;

  const { environmentalRisk, personalVulnerability, combinedRisk } = weatherData;
  const { indices } = environmentalRisk;

  const getBadgeStyle = (category: string) => {
    switch (category) {
      case 'Extreme':
      case 'Extreme Danger':
      case 'Extreme Heat Stress':
        return 'bg-rose-950 text-rose-200 border-rose-800';
      case 'Very High':
      case 'Very Strong Heat Stress':
      case 'Danger':
        return 'bg-rose-600 text-white border-rose-700';
      case 'High':
      case 'Strong Heat Stress':
      case 'Extreme Caution':
        return 'bg-orange-500 text-white border-orange-600';
      case 'Moderate':
      case 'Moderate Heat Stress':
      case 'Caution':
        return 'bg-amber-500 text-white border-amber-600';
      default:
        return 'bg-emerald-600 text-white border-emerald-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Principle Banner: Environmental ≠ Personal ≠ Combined */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-950 to-slate-900 text-white rounded-xl p-3.5 border border-navy-800 flex flex-col md:flex-row md:items-center justify-between text-xs gap-2">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-orange-400 shrink-0" />
          <span className="font-semibold text-slate-200">Scientific Heat-Health Architecture:</span>
          <span className="text-slate-300">
            <strong className="text-orange-400">Environmental Heat Risk</strong> ≠ <strong className="text-amber-400">Personal Heat Vulnerability</strong> ≠ <strong className="text-rose-400">Combined Personalized Heat Risk</strong>
          </span>
        </div>
        {openMethodology && (
          <button
            onClick={openMethodology}
            className="text-[11px] font-medium text-orange-400 hover:text-orange-300 flex items-center space-x-1 shrink-0"
          >
            <span>Read Mathematical Formulations</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Main 3-Pillar Assessment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Environmental Heat Risk */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-500 flex items-center space-x-1">
                <Thermometer className="w-3.5 h-3.5 text-orange-500 mr-1" />
                Pillar 1: Environmental Risk
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${getBadgeStyle(
                  environmentalRisk.category
                )}`}
              >
                {environmentalRisk.category}
              </span>
            </div>

            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-slate-900">{environmentalRisk.score}</span>
              <span className="text-sm font-semibold text-slate-400">/ 100</span>
              <span className="text-xs text-slate-500 font-medium">Ambient Atmospheric Load</span>
            </div>

            <p className="mt-2 text-xs text-slate-600 leading-relaxed">{environmentalRisk.explanation}</p>

            {/* Contributing factors */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-700 mb-1">Contributing Weather Factors:</div>
              <ul className="text-[11px] text-slate-600 space-y-1">
                {environmentalRisk.contributingFactors.map((f, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-orange-500 mr-1.5">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Thermal Stress Indicators Breakdown */}
          <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 p-4 rounded-b-xl space-y-2">
            <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
              <span>Scientific Thermal Stress Indices:</span>
              <button
                onClick={openMethodology}
                className="text-[10px] text-orange-600 hover:underline flex items-center"
              >
                <HelpCircle className="w-3 h-3 mr-0.5" /> Formulas
              </button>
            </div>

            {/* Heat Index */}
            <div className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200">
              <div>
                <span className="font-bold text-slate-800">Heat Index (HI):</span>
                <span className="text-[10px] text-slate-400 block">NOAA Rothfusz Regression</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-slate-900">
                  {indices.heatIndex.value !== null ? `${indices.heatIndex.value}°C` : 'N/A'}
                </span>
                <span className="text-[10px] text-orange-600 font-medium block">
                  {indices.heatIndex.category}
                </span>
              </div>
            </div>

            {/* WBGT */}
            <div className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200">
              <div>
                <span className="font-bold text-slate-800">WBGT:</span>
                <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">
                  {indices.wbgt.status}
                </span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-slate-900">
                  {indices.wbgt.value !== null ? `${indices.wbgt.value}°C` : 'N/A'}
                </span>
                <span className="text-[10px] text-amber-600 font-medium block">
                  {indices.wbgt.category}
                </span>
              </div>
            </div>

            {/* UTCI */}
            <div className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200">
              <div>
                <span className="font-bold text-slate-800">UTCI:</span>
                <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">
                  {indices.utci.status}
                </span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-slate-900">
                  {indices.utci.value !== null ? `${indices.utci.value}°C` : 'N/A'}
                </span>
                <span className="text-[10px] text-rose-600 font-medium block">
                  {indices.utci.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar 2: Personal Heat Vulnerability */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-500 flex items-center space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-500 mr-1" />
                Pillar 2: Personal Vulnerability
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${
                  personalVulnerability.isComplete
                    ? getBadgeStyle(personalVulnerability.category)
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {personalVulnerability.category}
              </span>
            </div>

            {personalVulnerability.isComplete ? (
              <>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {personalVulnerability.score}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">/ 100</span>
                  <span className="text-xs text-slate-500 font-medium">Physiological Susceptibility</span>
                </div>

                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {personalVulnerability.explanation}
                </p>

                {/* Breakdown Bars */}
                {personalVulnerability.breakdown && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <div className="text-[11px] font-bold text-slate-700">Vulnerability Components:</div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                        <span>Age Sensitivity</span>
                        <span className="font-semibold">
                          {personalVulnerability.breakdown.ageScore} / {personalVulnerability.breakdown.maxAge} pts
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${(personalVulnerability.breakdown.ageScore / personalVulnerability.breakdown.maxAge) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                        <span>Occupational Solar Exposure</span>
                        <span className="font-semibold">
                          {personalVulnerability.breakdown.occupationScore} / {personalVulnerability.breakdown.maxOccupation} pts
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{
                            width: `${(personalVulnerability.breakdown.occupationScore / personalVulnerability.breakdown.maxOccupation) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                        <span>Medical Health Sensitivity</span>
                        <span className="font-semibold">
                          {personalVulnerability.breakdown.healthScore} / {personalVulnerability.breakdown.maxHealth} pts
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{
                            width: `${(personalVulnerability.breakdown.healthScore / personalVulnerability.breakdown.maxHealth) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-4 bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 text-center">
                <AlertCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-blue-900">Profile Not Configured</h4>
                <p className="text-xs text-blue-800 mt-1">
                  You are viewing environmental heat risk only. Add your voluntary age, occupation, and health profile to unlock tailored heat warnings.
                </p>
                {onNavigateProfile && (
                  <button
                    onClick={onNavigateProfile}
                    className="mt-3 inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow transition"
                  >
                    <span>Complete Voluntary Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
            {personalVulnerability.disclaimer}
          </div>
        </div>

        {/* Pillar 3: Combined Personalized Heat Risk */}
        <div className="bg-gradient-to-br from-slate-900 to-navy-950 text-white rounded-xl p-5 shadow-md border border-navy-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-orange-400 flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-orange-400 mr-1" />
                Combined Personalized Risk
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${getBadgeStyle(
                  combinedRisk.combinedCategory
                )}`}
              >
                {combinedRisk.combinedCategory}
              </span>
            </div>

            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-4xl sm:text-5xl font-black text-white">
                {combinedRisk.combinedScore}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ 100</span>
              <span className="text-xs text-orange-300 font-medium">Final Actionable Risk</span>
            </div>

            {/* Score Comparison Pill */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs bg-white/10 p-2 rounded-lg border border-white/10">
              <div className="border-r border-white/10 pr-2">
                <span className="text-[10px] text-slate-300 block">Environmental Risk</span>
                <span className="font-extrabold text-orange-400 text-sm">
                  {combinedRisk.environmentalScore} / 100
                </span>
              </div>
              <div className="pl-2">
                <span className="text-[10px] text-slate-300 block">Personal Vulnerability</span>
                <span className="font-extrabold text-blue-400 text-sm">
                  {combinedRisk.personalScore !== null ? `${combinedRisk.personalScore} / 100` : 'Unassessed'}
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-300 leading-relaxed">
              {combinedRisk.narrative}
            </p>

            {combinedRisk.synergyBoostApplied ? (
              <div className="mt-2 text-[11px] text-rose-300 bg-rose-950/60 p-2 rounded border border-rose-800/80">
                ⚡ <strong>Synergistic Risk Amplification:</strong> +{combinedRisk.synergyBoostApplied} points added because both ambient heat and personal sensitivity are concurrently severe.
              </div>
            ) : null}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-slate-400">
            {combinedRisk.methodology}
          </div>
        </div>
      </div>
    </div>
  );
};
