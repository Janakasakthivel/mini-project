import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider, useLocation } from './context/LocationContext';
import { Navbar } from './components/Navbar';
import { LocationSearch } from './components/LocationSearch';
import { WeatherCards } from './components/WeatherCards';
import { HeatRiskSummary } from './components/HeatRiskSummary';
import { InteractiveMap } from './components/InteractiveMap';
import { PrecautionsSection } from './components/PrecautionsSection';
import { CoolingCentresSection } from './components/CoolingCentresSection';
import { GetHelpSection } from './components/GetHelpSection';
import { ForecastSection } from './components/ForecastSection';
import { PersonalVulnerabilitySection } from './components/PersonalVulnerabilitySection';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { MethodologyModal } from './components/MethodologyModal';
import { MedicalSafetyModal } from './components/MedicalSafetyModal';
import {
  ShieldAlert,
  Flame,
  Droplets,
  BookOpen,
  AlertTriangle,
  HeartPulse,
  Navigation,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { CoolingCentre, EssentialService, LocationItem } from './types';

const MainContent: React.FC = () => {
  const { user } = useAuth();
  const { selectedLocation, setSelectedLocation } = useLocation();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [methodologyOpen, setMethodologyOpen] = useState<boolean>(false);
  const [safetyGuideOpen, setSafetyGuideOpen] = useState<boolean>(false);
  const [activeRouteGeometry, setActiveRouteGeometry] = useState<any>(null);

  const handleSelectCoolingOnMap = (centre: CoolingCentre) => {
    setSelectedLocation({
      id: typeof centre.id === 'number' ? centre.id : Date.now(),
      name: centre.name,
      type: 'locality',
      district: centre.district,
      state: centre.state,
      latitude: centre.latitude,
      longitude: centre.longitude
    });
    setActiveTab('map');
  };

  const handleFacilityRoute = (geometry: any) => {
    setActiveRouteGeometry(geometry);
    if (geometry) {
      setActiveTab('map');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openMethodology={() => setMethodologyOpen(true)}
        openSafetyGuide={() => setSafetyGuideOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Global Prominent Search Bar (rendered on Dashboard & Map) */}
        {(activeTab === 'dashboard' || activeTab === 'map') && (
          <LocationSearch
            onLocationSelected={(loc) => {
              // Location already updated in context
            }}
          />
        )}

        {/* Tab 1: Main Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Live Weather Cards */}
            <WeatherCards />

            {/* Central 3-Pillar Heat Risk Summary */}
            <HeatRiskSummary
              onNavigateProfile={() => setActiveTab('profile')}
              openMethodology={() => setMethodologyOpen(true)}
            />

            {/* Split Row: Interactive Map & Preventive Precautions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Map Preview */}
              <div className="lg:col-span-7 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-1.5">
                    <Navigation className="w-4 h-4 text-orange-600" />
                    <span>South India Geographic Thermal Surveillance</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('map')}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
                  >
                    <span>Full Map View</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <InteractiveMap />
              </div>

              {/* Preventive Precautions */}
              <div className="lg:col-span-5 space-y-2">
                <PrecautionsSection />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Full Map View */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Interactive South India Heat-Health Map
                </h2>
                <p className="text-xs text-slate-500">
                  Covering Tamil Nadu, Kerala, Karnataka, Andhra Pradesh, Telangana, and Puducherry. Zoom into states, districts, cities, and localities.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-semibold text-slate-600">Selected Location:</span>
                <span className="font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  {selectedLocation.name}
                </span>
              </div>
            </div>
            <InteractiveMap routeGeometry={activeRouteGeometry} />
          </div>
        )}

        {/* Tab 3: 5-Day Forecast */}
        {activeTab === 'forecast' && <ForecastSection />}

        {/* Tab 4: Cooling Centres Information System */}
        {activeTab === 'cooling' && (
          <CoolingCentresSection onSelectOnMap={handleSelectCoolingOnMap} />
        )}

        {/* Tab 5: Get Help (Nearby Facilities & Routing) */}
        {activeTab === 'gethelp' && (
          <GetHelpSection
            onRouteCalculated={handleFacilityRoute}
            onFacilitySelected={(f) => {
              // Facility selected
            }}
          />
        )}

        {/* Tab 6: Personal Vulnerability Profile */}
        {activeTab === 'profile' && <PersonalVulnerabilitySection />}

        {/* Tab 7: Administrative Portal */}
        {activeTab === 'admin' && <AdminDashboard />}

        {/* Tab 8: Login */}
        {activeTab === 'login' && (
          <LoginPage
            onNavigateRegister={() => setActiveTab('register')}
            onLoginSuccess={() => setActiveTab('dashboard')}
          />
        )}

        {/* Tab 9: Register */}
        {activeTab === 'register' && (
          <RegisterPage
            onNavigateLogin={() => setActiveTab('login')}
            onRegisterSuccess={() => setActiveTab('dashboard')}
          />
        )}
      </main>

      {/* Scientific Methodology Modal */}
      <MethodologyModal
        isOpen={methodologyOpen}
        onClose={() => setMethodologyOpen(false)}
      />

      {/* Medical Safety & Emergency Guide Modal */}
      <MedicalSafetyModal
        isOpen={safetyGuideOpen}
        onClose={() => setSafetyGuideOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-navy-950 text-slate-400 border-t border-navy-800 text-xs py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-white text-sm">HeatShield India</span>
                <span className="text-[11px] block text-slate-400">
                  AI-Powered Hyperlocal Heat-Health Early Warning System
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs">
              <button
                onClick={() => setMethodologyOpen(true)}
                className="hover:text-white transition"
              >
                Scientific Formulations
              </button>
              <button
                onClick={() => setSafetyGuideOpen(true)}
                className="hover:text-white transition"
              >
                Medical Safety Protocol
              </button>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Emergency Helpline: 108 / 112</span>
            </div>
          </div>

          <div className="border-t border-navy-800/80 pt-4 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              Academic Evaluation Prototype &bull; Real Meteorological Data (Open-Meteo & IMD) &bull; Transparent Biometeorological Algorithms (HI, WBGT, UTCI)
            </p>
            <p>
              Environmental Heat Risk &ne; Personal Vulnerability &ne; Combined Personalized Risk
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <MainContent />
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
