import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import {
  Calendar,
  Thermometer,
  Flame,
  Droplets,
  Sun,
  ShieldAlert,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sunrise,
  Sunset,
  Sparkles,
  Info
} from 'lucide-react';
import { AlertItem } from '../types';

export const ForecastSection: React.FC = () => {
  const { weatherData, selectedLocation } = useLocation();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/alerts')
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data.alerts || []);
      })
      .catch((err) => console.error('Error fetching alerts:', err))
      .finally(() => setLoadingAlerts(false));
  }, [selectedLocation]);

  if (!weatherData) return null;

  const { forecast, dataStatus, dataSource } = weatherData;

  const getRiskBadge = (category: string) => {
    switch (category) {
      case 'Extreme':
        return 'bg-rose-950 text-rose-200 border-rose-800';
      case 'Very High':
        return 'bg-rose-600 text-white border-rose-700';
      case 'High':
        return 'bg-orange-500 text-white border-orange-600';
      case 'Moderate':
        return 'bg-amber-500 text-white border-amber-600';
      default:
        return 'bg-emerald-600 text-white border-emerald-700';
    }
  };

  const getForecastPrecautions = (riskCategory: string) => {
    switch (riskCategory) {
      case 'Extreme':
      case 'Very High':
        return 'Enforce mandatory 30-min shaded rest breaks per hour for outdoor labor; keep emergency hydration supplies active; avoid unshaded noon transit.';
      case 'High':
        return 'Avoid direct sun between 11:30 AM and 03:30 PM; maintain continuous water intake; reschedule strenuous sports/outdoor labor.';
      case 'Moderate':
        return 'Wear light cotton attire; carry water bottle; ensure shaded rest periods for elderly and youth.';
      default:
        return 'Standard daily precautions and normal hydration.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Forecast Section Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-extrabold text-slate-900">
                5-Day Hyperlocal Heatwave & Weather Forecast
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Location: <strong>{selectedLocation.name}</strong> ({selectedLocation.district}, {selectedLocation.state}) — Real-time predictive thermal risk modeling
            </p>
          </div>
          <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start md:self-auto">
            {dataSource}
          </div>
        </div>
      </div>

      {/* 5-Day Forecast Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {forecast.map((day, idx) => {
          const dateObj = new Date(day.date);
          const dayName = idx === 0 ? 'Tomorrow' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const riskCat = day.forecastRisk.category;

          return (
            <div
              key={day.date}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between hover:border-orange-300 transition"
            >
              <div>
                {/* Date Header */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{dayName}</span>
                    <span className="text-[10px] text-slate-400">{formattedDate}</span>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getRiskBadge(
                      riskCat
                    )}`}
                  >
                    {riskCat}
                  </span>
                </div>

                {/* Condition */}
                <div className="my-3 text-center py-2 bg-slate-50 rounded-lg border border-slate-100">
                  <Sun className="w-7 h-7 text-amber-500 mx-auto mb-1" />
                  <span className="text-xs font-bold text-slate-800 block truncate">{day.condition}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{day.description}</span>
                </div>

                {/* Temperature Readings */}
                <div className="flex items-center justify-between text-xs px-1 mb-2">
                  <span className="flex items-center text-rose-600 font-extrabold text-sm">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    {day.tempMax}°C
                  </span>
                  <span className="flex items-center text-blue-600 font-semibold text-xs">
                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
                    {day.tempMin}°C
                  </span>
                </div>

                {/* Humidity & UV */}
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 border-t border-slate-100 pt-2 mb-2">
                  <div className="flex items-center space-x-1">
                    <Droplets className="w-3 h-3 text-cyan-500" />
                    <span>RH: ~{day.humidityEstimate}%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Sun className="w-3 h-3 text-amber-500" />
                    <span>UV: {day.uvIndexMax || 'High'}</span>
                  </div>
                </div>
              </div>

              {/* Recommended Precautions for Day */}
              <div className="mt-2 pt-2 border-t border-slate-100 bg-orange-50/50 p-2 rounded text-[10px] text-slate-700 leading-tight">
                <strong>Advisory:</strong> {getForecastPrecautions(riskCat)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Early Warning Alerts Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="text-base font-extrabold text-slate-900">
              Active Heat-Health Early Warning Bulletins
            </h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            {alerts.length} Active Bulletins
          </span>
        </div>

        {loadingAlerts ? (
          <div className="text-xs text-slate-400 py-4">Checking meteorological bulletin repository...</div>
        ) : alerts.length === 0 ? (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium border border-emerald-200">
            No severe regional heatwave bulletins currently active for your selected area.
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-2 hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 mr-2">
                      {alert.district}, {alert.state}
                    </span>
                    <strong className="text-sm font-bold text-slate-900">{alert.alertType}</strong>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${getRiskBadge(
                      alert.riskLevel
                    )}`}
                  >
                    Risk Level: {alert.riskLevel}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                  <div>
                    <span className="font-semibold text-slate-800 block">Expected Time Period:</span>
                    <span>{alert.expectedPeriod}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block">Supporting Weather Indicators:</span>
                    <span>{alert.supportingIndicators}</span>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 p-2.5 rounded-lg text-xs text-orange-950 font-medium leading-relaxed">
                  <strong>Recommended Preventive Action:</strong> {alert.recommendedActions}
                </div>

                <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                  <span>Official Source: {alert.dataSource}</span>
                  <span>Issued: {new Date(alert.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
          <strong>Scientific Notice:</strong> Early warnings are generated through rule-based biometeorological thresholds and official IMD meteorological advisories. The platform does not claim to predict actual individual clinical hospital admissions or mortality.
        </div>
      </div>
    </div>
  );
};
