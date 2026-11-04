import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import { EssentialService } from '../types';
import {
  LifeBuoy,
  Hospital,
  HeartPulse,
  Droplets,
  Pill,
  PhoneCall,
  MapPin,
  Navigation,
  Clock,
  ExternalLink,
  Route,
  Compass,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface GetHelpSectionProps {
  onRouteCalculated?: (geometry: any) => void;
  onFacilitySelected?: (facility: EssentialService) => void;
}

export const GetHelpSection: React.FC<GetHelpSectionProps> = ({
  onRouteCalculated,
  onFacilitySelected
}) => {
  const { selectedLocation, requestBrowserLocation } = useLocation();

  const [category, setCategory] = useState<string>('All');
  const [facilities, setFacilities] = useState<EssentialService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFacility, setSelectedFacility] = useState<EssentialService | null>(null);
  const [routingData, setRoutingData] = useState<any>(null);
  const [routeLoading, setRouteLoading] = useState<boolean>(false);
  const [radiusKm, setRadiusKm] = useState<number>(30);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  const categories = [
    { label: 'All Services', value: 'All', icon: LifeBuoy },
    { label: 'Hospitals', value: 'Hospital', icon: Hospital },
    { label: 'Clinics', value: 'Clinic', icon: HeartPulse },
    { label: 'Cooling Centres', value: 'Cooling Centre', icon: Compass },
    { label: 'Water Kiosks', value: 'Drinking Water Facility', icon: Droplets },
    { label: 'Pharmacies', value: 'Pharmacy', icon: Pill },
    { label: 'EMS / Ambulance', value: 'Emergency Medical Services', icon: PhoneCall },
  ];

  const fetchNearby = () => {
    setLoading(true);
    let url = `/api/services/nearby?lat=${selectedLocation.latitude}&lon=${selectedLocation.longitude}&radiusKm=${radiusKm}`;
    if (category !== 'All') {
      url += `&category=${encodeURIComponent(category)}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setFacilities(data.facilities || []);
      })
      .catch((err) => console.error('Fetch essential services error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNearby();
    setSelectedFacility(null);
    setRoutingData(null);
    if (onRouteCalculated) onRouteCalculated(null);
  }, [selectedLocation, category, radiusKm]);

  const handleSelectFacility = async (fac: EssentialService) => {
    setSelectedFacility(fac);
    if (onFacilitySelected) onFacilitySelected(fac);

    setRouteLoading(true);
    setRoutingData(null);

    try {
      const url = `/api/services/route?startLat=${selectedLocation.latitude}&startLon=${selectedLocation.longitude}&endLat=${fac.latitude}&endLon=${fac.longitude}`;
      const res = await fetch(url);
      const data = await res.json();
      setRoutingData(data);

      if (data.geometry && onRouteCalculated) {
        onRouteCalculated(data.geometry);
      }
    } catch (err) {
      console.error('Route error:', err);
    } finally {
      setRouteLoading(false);
    }
  };

  const handleUseGPS = async () => {
    setGeoNotice('Requesting GPS location access...');
    const result = await requestBrowserLocation();
    if (result.success) {
      setGeoNotice('Location updated from device GPS.');
      setTimeout(() => setGeoNotice(null), 4000);
    } else {
      setGeoNotice(result.message || 'Unable to access device location.');
      setTimeout(() => setGeoNotice(null), 5000);
    }
  };

  const renderCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Hospital':
        return <Hospital className="w-4 h-4 text-rose-600" />;
      case 'Clinic':
        return <HeartPulse className="w-4 h-4 text-amber-600" />;
      case 'Drinking Water Facility':
        return <Droplets className="w-4 h-4 text-cyan-600" />;
      case 'Pharmacy':
        return <Pill className="w-4 h-4 text-emerald-600" />;
      case 'Emergency Medical Services':
        return <PhoneCall className="w-4 h-4 text-red-600" />;
      default:
        return <Compass className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Location Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <LifeBuoy className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-extrabold text-slate-900">Get Help — Nearby Essential Services</h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Rapidly find verified hospitals, clinics, drinking water kiosks, cooling centres, pharmacies, and emergency services closest to your current location.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleUseGPS}
              className="flex items-center space-x-1.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition"
            >
              <Navigation className="w-4 h-4 text-orange-400" />
              <span>Use Current Device GPS</span>
            </button>
          </div>
        </div>

        {geoNotice && (
          <div className="mt-3 text-xs px-3 py-1.5 rounded-lg bg-orange-50 text-orange-800 border border-orange-200 flex items-center space-x-2">
            <Navigation className="w-3.5 h-3.5 text-orange-600" />
            <span>{geoNotice}</span>
          </div>
        )}

        {/* Current Origin Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-orange-600" />
            <span>Search Origin: <strong>{selectedLocation.name}</strong> ({selectedLocation.district}, {selectedLocation.state})</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Search Radius:</span>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800 font-semibold"
            >
              <option value={15}>15 km</option>
              <option value={30}>30 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {categories.map((c) => {
          const Icon = c.icon;
          const isSelected = category === c.value;
          return (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Routing Card when facility selected */}
      {selectedFacility && (
        <div className="bg-gradient-to-r from-blue-900 via-navy-950 to-slate-900 text-white rounded-xl p-5 shadow-md border border-blue-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <Route className="w-5 h-5 text-blue-400" />
                <h4 className="text-base font-bold text-white">Route to: {selectedFacility.name}</h4>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{selectedFacility.address}</p>
            </div>
            {routingData?.googleMapsUrl && (
              <a
                href={routingData.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow transition self-start sm:self-auto"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {routeLoading ? (
            <div className="text-xs text-blue-300 flex items-center space-x-2 py-2">
              <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Calculating driving route geometry via OSRM...</span>
            </div>
          ) : routingData ? (
            <div className="bg-white/10 rounded-lg p-3 text-xs border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-300 block">Total Driving Distance</span>
                <span className="text-lg font-black text-blue-300">{routingData.distanceKm} km</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-300 block">Estimated Travel Time</span>
                <span className="text-lg font-black text-amber-300">~{routingData.durationMinutes} mins</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-300 block">Routing Engine</span>
                <span className="text-xs text-slate-200 font-semibold">{routingData.routingProvider}</span>
              </div>
              {routingData.note && (
                <div className="w-full text-[10px] text-amber-200 pt-1 border-t border-white/10">
                  {routingData.note}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Facilities List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      ) : facilities.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No Nearby Essential Facilities Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try expanding the search radius or selecting a different location.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {facilities.map((fac) => (
            <div
              key={fac.id}
              onClick={() => handleSelectFacility(fac)}
              className={`bg-white rounded-xl border p-5 shadow-sm cursor-pointer transition flex flex-col justify-between hover:shadow-md ${
                selectedFacility?.id === fac.id
                  ? 'border-blue-500 ring-2 ring-blue-400 bg-blue-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2.5">
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg shrink-0 mt-0.5">
                      {renderCategoryIcon(fac.category)}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{fac.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{fac.address}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-blue-600 block">{fac.distanceKm} km</span>
                    <span className="text-[10px] text-slate-400">away</span>
                  </div>
                </div>

                <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{fac.openingHours}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{fac.contactPhone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">
                  Source: {fac.source} ({fac.verificationStatus})
                </span>
                <span className="text-xs font-bold text-blue-600 flex items-center space-x-1 hover:underline">
                  <span>Show Route & Navigation</span>
                  <Route className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
