import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '../context/LocationContext';
import { LocationItem, CoolingCentre } from '../types';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  ShieldAlert,
  Flame,
  Droplets,
  Wind
} from 'lucide-react';

interface InteractiveMapProps {
  onLocationSelect?: (loc: LocationItem) => void;
  showCoolingCentres?: boolean;
  routeGeometry?: any;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  onLocationSelect,
  showCoolingCentres = true,
  routeGeometry
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const coolingLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  const { selectedLocation, setSelectedLocation } = useLocation();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [coolingCentres, setCoolingCentres] = useState<CoolingCentre[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'Tamil Nadu' | 'Karnataka' | 'Telangana' | 'Andhra Pradesh' | 'Kerala' | 'Puducherry'>('all');

  // Fetch overview locations and cooling centres
  useEffect(() => {
    fetch('/api/weather/map-overview')
      .then((res) => res.json())
      .then((data) => {
        if (data.locations) setLocations(data.locations);
      })
      .catch((err) => console.error('Map overview error:', err));

    fetch('/api/cooling-centres')
      .then((res) => res.json())
      .then((data) => {
        if (data.coolingCentres) setCoolingCentres(data.coolingCentres);
      })
      .catch((err) => console.error('Cooling centres error:', err));
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on South India
    const southIndiaCenter: [number, number] = [12.5, 78.5];
    const map = L.map(mapContainerRef.current, {
      center: southIndiaCenter,
      zoom: 6,
      minZoom: 5,
      maxZoom: 16,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    coolingLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current || !coolingLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    coolingLayerRef.current.clearLayers();

    // Filter locations by state if selected
    const filteredLocs = activeFilter === 'all' ? locations : locations.filter((l) => l.state === activeFilter);

    // 1. Add Heat Risk Markers
    filteredLocs.forEach((loc) => {
      let bg = '#10b981'; // green
      if (loc.riskLevel === 'Extreme') bg = '#881337'; // dark red
      else if (loc.riskLevel === 'Very High') bg = '#ef4444'; // red
      else if (loc.riskLevel === 'High') bg = '#f97316'; // orange
      else if (loc.riskLevel === 'Moderate') bg = '#eab308'; // yellow

      const iconHtml = `
        <div style="background-color: ${bg}; width: 26px; height: 26px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: white;">
          ${Math.round(loc.currentTemp || 34)}°
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'heat-risk-marker',
        html: iconHtml,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon });

      const popupContent = `
        <div style="font-family: sans-serif; min-width: 200px; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="font-size: 14px; color: #0f172a;">${loc.name}</strong>
            <span style="font-size: 9px; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: #f1f5f9; color: #475569; font-weight: 700;">${loc.type}</span>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">${loc.district}, ${loc.state}</div>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
              <span>Air Temperature:</span>
              <strong style="color: #0f172a;">${loc.currentTemp}°C</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
              <span>Relative Humidity:</span>
              <strong style="color: #0f172a;">${loc.humidity}%</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span>Heat Risk Level:</span>
              <strong style="color: ${bg};">${loc.riskLevel}</strong>
            </div>
          </div>
          
          <button id="select-loc-${loc.id}" style="width: 100%; background: #ea580c; color: white; border: none; border-radius: 6px; padding: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
            View Detailed Risk & Precautions
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`select-loc-${loc.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedLocation(loc);
            if (onLocationSelect) onLocationSelect(loc);
          };
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });

    // 2. Add Cooling Centres Markers (BLUE markers)
    if (showCoolingCentres) {
      coolingCentres.forEach((centre) => {
        const blueIconHtml = `
          <div style="background-color: #2563eb; width: 24px; height: 24px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 11px; color: white;">
            ❄️
          </div>
        `;

        const blueIcon = L.divIcon({
          className: 'cooling-marker',
          html: blueIconHtml,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const cMarker = L.marker([centre.latitude, centre.longitude], { icon: blueIcon });

        const isVerified = centre.verificationStatus === 'Verified';
        const cPopup = `
          <div style="font-family: sans-serif; min-width: 230px; padding: 2px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
              <strong style="font-size: 13px; color: #1e3a8a;">${centre.name}</strong>
            </div>
            <span style="display: inline-block; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-bottom: 6px; background: ${isVerified ? '#dcfce7' : '#fef9c3'}; color: ${isVerified ? '#15803d' : '#854d0e'};">
              ${centre.verificationStatus}
            </span>
            <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">${centre.address}</div>
            <div style="font-size: 11px; color: #0284c7; margin-bottom: 4px;"><strong>Facilities:</strong> ${centre.facilities}</div>
            <div style="font-size: 11px; color: #334155; margin-bottom: 4px;"><strong>Hours:</strong> ${centre.operatingHours}</div>
            <div style="font-size: 10px; color: #94a3b8;"><strong>Source:</strong> ${centre.source}</div>
          </div>
        `;

        cMarker.bindPopup(cPopup);
        coolingLayerRef.current?.addLayer(cMarker);
      });
    }
  }, [locations, coolingCentres, activeFilter, showCoolingCentres]);

  // Handle Route Geometry if provided (Get Help routing)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (routeGeometry && routeGeometry.coordinates) {
      // In GeoJSON, coordinates are [lon, lat]. Leaflet expects [lat, lon].
      const latLngs = routeGeometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
      const polyline = L.polyline(latLngs, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.85,
        dashArray: routeGeometry.type === 'LineString' && latLngs.length === 2 ? '8, 8' : undefined
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      routeLayerRef.current = polyline;
    }
  }, [routeGeometry]);

  // Pan to selected location
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && selectedLocation) {
      map.setView([selectedLocation.latitude, selectedLocation.longitude], 11, {
        animate: true
      });
    }
  }, [selectedLocation]);

  const zoomToState = (stateName: string, coords: [number, number], zoomLevel: number) => {
    setActiveFilter(stateName as any);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(coords, zoomLevel, { animate: true });
    }
  };

  const resetSouthIndia = () => {
    setActiveFilter('all');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([12.5, 78.5], 6, { animate: true });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px] relative">
      {/* Map Control Toolbar */}
      <div className="bg-navy-950 text-white p-3 flex flex-wrap items-center justify-between gap-2 z-20 border-b border-navy-800 text-xs">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-orange-400" />
          <span className="font-bold text-slate-200">South India Geographical Thermal Map</span>
        </div>

        {/* State Zoom Buttons */}
        <div className="flex items-center flex-wrap gap-1">
          <button
            onClick={resetSouthIndia}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
              activeFilter === 'all' ? 'bg-orange-600 text-white' : 'bg-navy-800 text-slate-300 hover:text-white'
            }`}
          >
            All South India
          </button>
          <button
            onClick={() => zoomToState('Tamil Nadu', [11.1271, 78.6569], 7)}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
              activeFilter === 'Tamil Nadu' ? 'bg-orange-600 text-white' : 'bg-navy-800 text-slate-300 hover:text-white'
            }`}
          >
            Tamil Nadu
          </button>
          <button
            onClick={() => zoomToState('Karnataka', [15.3173, 75.7139], 7)}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
              activeFilter === 'Karnataka' ? 'bg-orange-600 text-white' : 'bg-navy-800 text-slate-300 hover:text-white'
            }`}
          >
            Karnataka
          </button>
          <button
            onClick={() => zoomToState('Telangana', [17.8495, 79.1151], 7)}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
              activeFilter === 'Telangana' ? 'bg-orange-600 text-white' : 'bg-navy-800 text-slate-300 hover:text-white'
            }`}
          >
            Telangana
          </button>
          <button
            onClick={() => zoomToState('Andhra Pradesh', [15.9129, 79.74], 7)}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
              activeFilter === 'Andhra Pradesh' ? 'bg-orange-600 text-white' : 'bg-navy-800 text-slate-300 hover:text-white'
            }`}
          >
            Andhra Pradesh
          </button>
          <button
            onClick={() => zoomToState('Kerala', [10.8505, 76.2711], 7)}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
              activeFilter === 'Kerala' ? 'bg-orange-600 text-white' : 'bg-navy-800 text-slate-300 hover:text-white'
            }`}
          >
            Kerala
          </button>
          <button
            onClick={() => zoomToState('Puducherry', [11.9416, 79.8083], 10)}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
              activeFilter === 'Puducherry' ? 'bg-orange-600 text-white' : 'bg-navy-800 text-slate-300 hover:text-white'
            }`}
          >
            Puducherry
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="flex-1 w-full h-full relative" ref={mapContainerRef}></div>

      {/* Floating Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-lg text-[11px] max-w-[280px]">
        <div className="font-extrabold text-slate-800 mb-1.5 flex items-center justify-between">
          <span>Map Visual Legend</span>
          <span className="text-[10px] text-slate-400 font-normal">Click marker to inspect</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-slate-600">Low Environmental Heat Risk (&lt; 30)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="text-slate-600">Moderate Risk (30–49)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
            <span className="text-slate-600">High Risk (50–69)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
            <span className="text-slate-600">Very High Risk (70–84)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-950 inline-block"></span>
            <span className="text-slate-600">Extreme Heat Risk (&ge; 85)</span>
          </div>
          <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 inline-flex items-center justify-center text-white text-[8px]">
              ❄️
            </span>
            <span className="text-blue-700 font-bold">Verified Public Cooling Centre</span>
          </div>
        </div>
      </div>
    </div>
  );
};
