import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from '../context/LocationContext';
import { Search, X, MapPin, Navigation, AlertCircle, Compass } from 'lucide-react';
import { LocationItem } from '../types';

interface LocationSearchProps {
  onLocationSelected?: (loc: LocationItem) => void;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationSelected }) => {
  const { selectedLocation, setSelectedLocation, requestBrowserLocation } = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setMessage(null);

    if (!val.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // Input Validation rule: If search contains numbers or unsupported special characters, display "No results found."
    const invalidCharRegex = /[0-9!@#$%^&*()_+=\[\]{};:"\\|<>?/~`]/;
    if (invalidCharRegex.test(val)) {
      setResults([]);
      setMessage('No results found.');
      setIsOpen(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/weather/search?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setResults(data.results);
        setMessage(null);
      } else {
        setResults([]);
        setMessage(data.message || 'No results found.');
      }
      setIsOpen(true);
    } catch (err) {
      setResults([]);
      setMessage('No results found.');
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (loc: LocationItem) => {
    setSelectedLocation(loc);
    setQuery('');
    setIsOpen(false);
    if (onLocationSelected) {
      onLocationSelected(loc);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setMessage(null);
    setIsOpen(false);
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

  const quickCities: { name: string; district: string; state: string; lat: number; lng: number }[] = [
    { name: 'Chennai Central', district: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
    { name: 'Bengaluru Majestic', district: 'Bengaluru Urban', state: 'Karnataka', lat: 12.9767, lng: 77.5713 },
    { name: 'Hyderabad Charminar', district: 'Hyderabad', state: 'Telangana', lat: 17.3616, lng: 78.4747 },
    { name: 'Visakhapatnam Beach Road', district: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.7126, lng: 83.3175 },
    { name: 'Kochi Marine Drive', district: 'Ernakulam', state: 'Kerala', lat: 9.9816, lng: 76.2768 },
    { name: 'Madurai City', district: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198 },
    { name: 'Puducherry Promenade', district: 'Puducherry', state: 'Puducherry', lat: 11.9338, lng: 79.8358 },
    { name: 'Coimbatore Gandhipuram', district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558 },
  ];

  return (
    <div className="w-full relative" ref={wrapperRef}>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Prominent Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={handleSearchChange}
              onFocus={() => {
                if (query.trim() || results.length > 0 || message) setIsOpen(true);
              }}
              placeholder="Search state, district, city, town, neighbourhood, or locality..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                title="Clear Search"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Autocomplete Dropdown */}
            {isOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto">
                {loading && (
                  <div className="p-3 text-xs text-slate-500 flex items-center space-x-2">
                    <div className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Searching locations...</span>
                  </div>
                )}

                {message && !loading && (
                  <div className="p-4 text-center">
                    <p className="text-sm font-semibold text-rose-600">{message}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Search supports alphabetic place names and localities across South India.
                    </p>
                  </div>
                )}

                {results.length > 0 && !loading && (
                  <ul className="divide-y divide-slate-100">
                    {results.map((loc) => (
                      <li
                        key={loc.id}
                        onClick={() => handleSelectLocation(loc)}
                        className="p-3 hover:bg-orange-50/70 cursor-pointer transition flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2.5">
                          <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{loc.name}</div>
                            <div className="text-xs text-slate-500">
                              {loc.district}, {loc.state}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {loc.type}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Use GPS Location Button */}
          <button
            onClick={handleUseGPS}
            className="flex items-center justify-center space-x-2 bg-navy-900 hover:bg-navy-800 text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition shrink-0"
            title="Use current GPS location"
          >
            <Navigation className="w-4 h-4 text-orange-400" />
            <span>Use My Current Location</span>
          </button>
        </div>

        {geoNotice && (
          <div className="mt-2.5 text-xs px-3 py-1.5 rounded-lg bg-orange-50 text-orange-800 border border-orange-200 flex items-center space-x-2">
            <Compass className="w-3.5 h-3.5 shrink-0 text-orange-600" />
            <span>{geoNotice}</span>
          </div>
        )}

        {/* Quick Location Chips */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center flex-wrap gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center">
            Quick Cities:
          </span>
          {quickCities.map((c) => (
            <button
              key={c.name}
              onClick={() =>
                handleSelectLocation({
                  id: Date.now() + Math.random(),
                  name: c.name,
                  type: 'city',
                  district: c.district,
                  state: c.state,
                  latitude: c.lat,
                  longitude: c.lng
                })
              }
              className={`text-xs px-2.5 py-1 rounded-full border transition ${
                selectedLocation.name === c.name
                  ? 'bg-orange-600 text-white border-orange-600 font-semibold shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {c.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
