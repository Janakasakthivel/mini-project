import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  CurrentWeather,
  EnvironmentalRisk,
  PersonalVulnerability,
  CombinedRisk,
  ForecastDay,
  PrecautionsData,
  LocationItem
} from '../types';

interface WeatherApiResponse {
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  currentWeather: CurrentWeather;
  environmentalRisk: EnvironmentalRisk;
  forecast: ForecastDay[];
  dataSource: string;
  dataStatus: string;
  timestamp: string;
  personalVulnerability: PersonalVulnerability;
  combinedRisk: CombinedRisk;
  precautions: PrecautionsData;
  isCached?: boolean;
}

interface LocationContextType {
  selectedLocation: LocationItem;
  setSelectedLocation: (loc: LocationItem) => void;
  weatherData: WeatherApiResponse | null;
  loading: boolean;
  error: string | null;
  refreshWeather: () => Promise<void>;
  requestBrowserLocation: () => Promise<{ success: boolean; message?: string }>;
}

const defaultLocation: LocationItem = {
  id: 1,
  name: 'Chennai Central',
  type: 'city',
  district: 'Chennai',
  state: 'Tamil Nadu',
  latitude: 13.0827,
  longitude: 80.2707
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<LocationItem>(defaultLocation);
  const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (loc: LocationItem) => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(
        `/api/weather/current?lat=${loc.latitude}&lon=${loc.longitude}&name=${encodeURIComponent(loc.name)}`,
        { headers }
      );

      if (!res.ok) {
        throw new Error(`Weather server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setWeatherData(data);
    } catch (err: any) {
      console.error('Fetch weather error:', err);
      setError('Weather data temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedLocation);
  }, [selectedLocation, token, user]);

  const refreshWeather = async () => {
    await fetchWeather(selectedLocation);
  };

  // Browser Geolocation with explicit permission
  const requestBrowserLocation = async (): Promise<{ success: boolean; message?: string }> => {
    if (!navigator.geolocation) {
      return { success: false, message: 'Geolocation is not supported by your browser.' };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc: LocationItem = {
            id: Date.now(),
            name: 'My Current Location (GPS)',
            type: 'locality',
            district: 'Local Area',
            state: 'South India',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setSelectedLocation(newLoc);
          resolve({ success: true, message: 'Location updated successfully from GPS coordinates.' });
        },
        (geoErr) => {
          let msg = 'Location permission denied by user.';
          if (geoErr.code === geoErr.POSITION_UNAVAILABLE) msg = 'Location information is unavailable.';
          if (geoErr.code === geoErr.TIMEOUT) msg = 'Location request timed out.';
          resolve({ success: false, message: msg });
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        weatherData,
        loading,
        error,
        refreshWeather,
        requestBrowserLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
