import React from 'react';
import { useLocation } from '../context/LocationContext';
import {
  Thermometer,
  Flame,
  Droplets,
  Wind,
  Sun,
  Sunrise,
  Sunset,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MapPin,
  RefreshCw,
  SunMedium
} from 'lucide-react';

export const WeatherCards: React.FC = () => {
  const { weatherData, selectedLocation, loading, refreshWeather } = useLocation();

  if (loading && !weatherData) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center text-amber-800">
        <p className="font-semibold text-base">Weather data temporarily unavailable.</p>
        <p className="text-xs text-amber-700 mt-1">Please verify network connectivity or select another location.</p>
      </div>
    );
  }

  const { currentWeather, dataStatus, dataSource } = weatherData;

  return (
    <div className="space-y-3">
      {/* Location Metadata Bar */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2 shadow-sm">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
          <span className="font-semibold text-slate-800">
            {selectedLocation.name} ({selectedLocation.district}, {selectedLocation.state})
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500">Lat: {selectedLocation.latitude.toFixed(4)}, Lon: {selectedLocation.longitude.toFixed(4)}</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated: <strong className="text-slate-700">{currentWeather.lastUpdated}</strong></span>
          </div>
          <span className="text-slate-400">|</span>
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {dataStatus}
          </span>
          <button
            onClick={refreshWeather}
            disabled={loading}
            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
            title="Refresh weather"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of Weather Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Air Temperature */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-orange-200 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Air Temp</span>
            <Thermometer className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {currentWeather.tempC}°<span className="text-lg font-semibold text-slate-500">C</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center text-rose-600 font-medium">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> Max: {currentWeather.tempMaxToday}°C
            </span>
            <span className="flex items-center text-blue-600 font-medium">
              <ArrowDownRight className="w-3 h-3 mr-0.5" /> Min: {currentWeather.tempMinToday}°C
            </span>
          </div>
        </div>

        {/* 2. Feels-Like Temp */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-orange-200 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Feels Like</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-orange-600">
            {currentWeather.feelsLikeC}°<span className="text-lg font-semibold text-orange-500">C</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium truncate">
            {currentWeather.feelsLikeC > currentWeather.tempC ? 'Heightened by humidity' : 'Near ambient temp'}
          </div>
        </div>

        {/* 3. Relative Humidity */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-orange-200 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Humidity</span>
            <Droplets className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {currentWeather.humidity}<span className="text-lg font-semibold text-slate-500">%</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {currentWeather.humidity >= 65 ? 'High (impedes sweating)' : currentWeather.humidity >= 40 ? 'Moderate' : 'Low / Dry'}
          </div>
        </div>

        {/* 4. Wind Speed */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-orange-200 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Wind Speed</span>
            <Wind className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {currentWeather.windSpeedKmh}<span className="text-sm font-semibold text-slate-500"> km/h</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {currentWeather.windSpeedMs} m/s at 10m height
          </div>
        </div>

        {/* 5. Solar Radiation */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-orange-200 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Solar Radiation</span>
            <SunMedium className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {currentWeather.solarRadiationWm2}<span className="text-xs font-semibold text-slate-500"> W/m²</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {currentWeather.solarRadiationWm2 > 600 ? 'High radiant heat' : currentWeather.solarRadiationWm2 > 200 ? 'Moderate irradiance' : 'Low / Shaded'}
          </div>
        </div>

        {/* 6. Condition & Sun Schedule */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-orange-200 transition">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Condition</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 truncate">
            {currentWeather.condition}
          </div>
          <div className="mt-2 text-[10px] text-slate-500 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center text-amber-700"><Sunrise className="w-3 h-3 mr-1" /> Sunrise</span>
              <span>{currentWeather.sunriseToday}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center text-orange-700"><Sunset className="w-3 h-3 mr-1" /> Sunset</span>
              <span>{currentWeather.sunsetToday}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
