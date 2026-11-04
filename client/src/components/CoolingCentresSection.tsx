import React, { useState, useEffect } from 'react';
import { CoolingCentre } from '../types';
import {
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  Building,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  ExternalLink,
  Info
} from 'lucide-react';

interface CoolingCentresSectionProps {
  onSelectOnMap?: (centre: CoolingCentre) => void;
}

export const CoolingCentresSection: React.FC<CoolingCentresSectionProps> = ({ onSelectOnMap }) => {
  const [centres, setCentres] = useState<CoolingCentre[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [stateFilter, setStateFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchCentres = () => {
    setLoading(true);
    let url = '/api/cooling-centres?';
    if (stateFilter !== 'all') url += `state=${encodeURIComponent(stateFilter)}&`;
    if (districtFilter !== 'all') url += `district=${encodeURIComponent(districtFilter)}&`;
    if (verifiedOnly) url += 'verifiedOnly=true&';

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCentres(data.coolingCentres || []);
      })
      .catch((err) => console.error('Fetch cooling centres error:', err))
      .finally(() => setLoading(false));
  };

  const fetchStats = () => {
    fetch('/api/cooling-centres/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error('Fetch cooling stats error:', err));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchCentres();
  }, [stateFilter, districtFilter, verifiedOnly]);

  // Extract unique states and districts for filters
  const southIndianStates = ['Tamil Nadu', 'Karnataka', 'Telangana', 'Andhra Pradesh', 'Kerala', 'Puducherry'];

  const filteredCentres = centres.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q) ||
      c.facilities.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title & Critical Integrity Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow">
                ❄️
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">
                Verified Public Cooling Centre Information System
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Designated municipal climate shelters, air-conditioned government libraries, public hospital heat wards, and transit lounges providing immediate thermal relief, chilled drinking water, and first aid during extreme heat events.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Blue Map Markers Dedicated</span>
          </div>
        </div>

        {/* Dynamic Statistics Bar strictly calculated from database */}
        {stats && (
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                Total Verified Centres
              </span>
              <span className="text-2xl font-black text-emerald-600">{stats.totalVerified}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Officially Validated</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                Centres Open Now
              </span>
              <span className="text-2xl font-black text-blue-600">{stats.verifiedOpenNow}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Operating Currently</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                Unverified / Demo
              </span>
              <span className="text-2xl font-black text-amber-600">{stats.totalDemo}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Sample Academic Records</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                Coverage
              </span>
              <span className="text-2xl font-black text-slate-800">
                {stats.stateStats ? stats.stateStats.length : 6} States
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">South India Region</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* State Filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-500 font-semibold">State:</span>
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setDistrictFilter('all');
              }}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All States</option>
              {southIndianStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* District Filter if state selected */}
          {stats && stats.districtStats && (
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-slate-500 font-semibold">District:</span>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Districts</option>
                {stats.districtStats
                  .filter((d: any) => stateFilter === 'all' || d.state === stateFilter)
                  .map((d: any) => (
                    <option key={`${d.district}-${d.state}`} value={d.district}>
                      {d.district} ({d.verifiedCount} verified)
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Verified Only Checkbox */}
          <label className="flex items-center space-x-1.5 text-xs text-slate-700 cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300"
            />
            <span className="font-semibold">Verified Centres Only</span>
          </label>
        </div>

        {/* Text Filter */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facility name, address..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Facilities Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      ) : filteredCentres.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No Verified Cooling Centres Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No centres match the selected state or district filter. We never fabricate arbitrary cooling centre records.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCentres.map((centre) => {
            const isVerified = centre.verificationStatus === 'Verified';
            return (
              <div
                key={centre.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {centre.name}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
                        <span>{centre.address}</span>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 border ${
                        isVerified
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {centre.verificationStatus}
                    </span>
                  </div>

                  {/* Facilities */}
                  <div className="mt-3 bg-blue-50/60 border border-blue-100 rounded-lg p-2.5 text-xs">
                    <span className="font-bold text-blue-950 block mb-0.5">Available Relief Facilities:</span>
                    <span className="text-blue-800">{centre.facilities}</span>
                  </div>

                  {/* Operational Details */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{centre.operatingHours}</span>
                    </div>
                    {centre.contactPhone && (
                      <div className="flex items-center space-x-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{centre.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 truncate max-w-[200px]" title={centre.source}>
                    Source: {centre.source}
                  </span>
                  {onSelectOnMap && (
                    <button
                      onClick={() => onSelectOnMap(centre)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      <span>Locate on Map</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
