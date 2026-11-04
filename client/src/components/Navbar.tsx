import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import {
  ShieldAlert,
  MapPin,
  User as UserIcon,
  LogOut,
  LogIn,
  BookOpen,
  Settings,
  Flame,
  Droplets,
  AlertTriangle
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openMethodology: () => void;
  openSafetyGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openMethodology,
  openSafetyGuide
}) => {
  const { user, logout } = useAuth();
  const { selectedLocation } = useLocation();

  const isStaff = user && ['Administrator', 'Health Authority', 'Disaster Management Authority'].includes(user.role);

  return (
    <header className="bg-navy-950 text-white shadow-lg sticky top-0 z-40 border-b border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-rose-600 flex items-center justify-center shadow-md shadow-orange-900/30">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">HeatShield</span>
                <span className="font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  India
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block font-medium">
                AI-Powered Hyperlocal Heat-Health Early Warning System
              </p>
            </div>
          </div>

          {/* Current Location Pill */}
          <div className="hidden md:flex items-center space-x-2 bg-navy-900/90 border border-navy-800 px-3 py-1.5 rounded-lg text-xs">
            <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
            <div className="text-left">
              <div className="font-semibold text-slate-200 truncate max-w-[180px]">
                {selectedLocation.name}
              </div>
              <div className="text-[10px] text-slate-400">
                {selectedLocation.district}, {selectedLocation.state}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'map'
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              South India Map
            </button>
            <button
              onClick={() => setActiveTab('forecast')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'forecast'
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              5-Day Forecast
            </button>
            <button
              onClick={() => setActiveTab('cooling')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'cooling'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              Cooling Centres
            </button>
            <button
              onClick={() => setActiveTab('gethelp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'gethelp'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              Get Help
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'profile'
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              Personal Profile
            </button>

            {isStaff && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1 ${
                  activeTab === 'admin'
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'text-purple-300 hover:text-white hover:bg-navy-800'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Action Buttons & User Menu */}
          <div className="flex items-center space-x-2">
            {/* Scientific Methodology Modal Trigger */}
            <button
              onClick={openMethodology}
              className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-navy-800 transition"
              title="Scientific Methodology & Formulas"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Medical Safety Guide Trigger */}
            <button
              onClick={openSafetyGuide}
              className="text-amber-400 hover:text-amber-300 p-2 rounded-lg hover:bg-navy-800 transition"
              title="Heat Illness Emergency Guide"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>

            {user ? (
              <div className="flex items-center space-x-2 border-l border-navy-800 pl-2">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-medium text-slate-200 truncate max-w-[120px]">
                    {user.fullName}
                  </div>
                  <div className="text-[10px] text-orange-400 font-semibold uppercase">
                    {user.role}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-slate-300 hover:text-rose-400 p-2 rounded-lg hover:bg-navy-800 transition text-xs"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="flex items-center space-x-1.5 bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-navy-800 text-[11px] font-medium overflow-x-auto space-x-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-orange-600 text-white font-semibold' : 'text-slate-300'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'map' ? 'bg-orange-600 text-white font-semibold' : 'text-slate-300'}`}
          >
            Map
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'forecast' ? 'bg-orange-600 text-white font-semibold' : 'text-slate-300'}`}
          >
            Forecast
          </button>
          <button
            onClick={() => setActiveTab('cooling')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'cooling' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300'}`}
          >
            Cooling Centres
          </button>
          <button
            onClick={() => setActiveTab('gethelp')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'gethelp' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-300'}`}
          >
            Get Help
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'profile' ? 'bg-orange-600 text-white font-semibold' : 'text-slate-300'}`}
          >
            Profile
          </button>
          {isStaff && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'admin' ? 'bg-purple-600 text-white font-semibold' : 'text-purple-300'}`}
            >
              Admin
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
