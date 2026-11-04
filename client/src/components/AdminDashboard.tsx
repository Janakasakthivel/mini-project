import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Building,
  AlertTriangle,
  PlusCircle,
  CheckCircle,
  XCircle,
  Database,
  Users,
  Activity,
  Layers,
  Save,
  Trash2,
  RefreshCw
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionTab, setActionTab] = useState<'overview' | 'addCooling' | 'addAlert' | 'manage'>('overview');

  // Form states for adding cooling centre
  const [newCentre, setNewCentre] = useState({
    name: '',
    address: '',
    district: 'Chennai',
    state: 'Tamil Nadu',
    latitude: '13.0827',
    longitude: '80.2707',
    facilities: 'Air Conditioned, Clean Drinking Water, First Aid',
    operatingHours: '08:00 AM - 07:00 PM',
    contactPhone: '',
    verificationStatus: 'Verified',
    source: 'Municipal Health & Disaster Management'
  });

  // Form state for publishing alert
  const [newAlert, setNewAlert] = useState({
    locationName: '',
    district: 'Chennai',
    state: 'Tamil Nadu',
    alertType: 'High Environmental Thermal Stress Advisory',
    riskLevel: 'High',
    expectedPeriod: 'Next 48 Hours (11:00 AM - 03:30 PM)',
    supportingIndicators: 'Forecast Heat Index exceeding 43°C, WBGT > 31°C',
    recommendedActions: 'Mandatory 15-minute shaded rest breaks for outdoor laborers; active hydration.',
    dataSource: 'HeatShield Early Warning Authority / State Disaster Management Cell'
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchStats = () => {
    if (!token) return;
    setLoading(true);
    fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error('Admin stats fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  const handleAddCoolingCentre = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/cooling-centres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newCentre)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add cooling centre.');

      setFeedback({ type: 'success', message: 'Cooling centre successfully added to database!' });
      setNewCentre({
        name: '',
        address: '',
        district: 'Chennai',
        state: 'Tamil Nadu',
        latitude: '13.0827',
        longitude: '80.2707',
        facilities: 'Air Conditioned, Clean Drinking Water, First Aid',
        operatingHours: '08:00 AM - 07:00 PM',
        contactPhone: '',
        verificationStatus: 'Verified',
        source: 'Municipal Health & Disaster Management'
      });
      fetchStats();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handlePublishAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newAlert)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish early warning alert.');

      setFeedback({ type: 'success', message: 'Official early warning bulletin published successfully!' });
      setNewAlert({
        locationName: '',
        district: 'Chennai',
        state: 'Tamil Nadu',
        alertType: 'High Environmental Thermal Stress Advisory',
        riskLevel: 'High',
        expectedPeriod: 'Next 48 Hours (11:00 AM - 03:30 PM)',
        supportingIndicators: 'Forecast Heat Index exceeding 43°C, WBGT > 31°C',
        recommendedActions: 'Mandatory 15-minute shaded rest breaks for outdoor laborers; active hydration.',
        dataSource: 'HeatShield Early Warning Authority / State Disaster Management Cell'
      });
      fetchStats();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  if (!user || !['Administrator', 'Health Authority', 'Disaster Management Authority'].includes(user.role)) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center text-rose-900 max-w-lg mx-auto">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold">Restricted Authority Area</h3>
        <p className="text-xs text-rose-700 mt-1">
          Access is strictly restricted to authenticated Administrators, Health Authorities, and Disaster Management Authorities.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Admin Header */}
      <div className="bg-navy-950 text-white rounded-xl p-6 shadow-md border border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center font-bold text-white shadow">
              ⚙️
            </span>
            <h2 className="text-xl font-extrabold text-white">Authority & Administrative Portal</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Signed in as <strong>{user.fullName}</strong> — Role:{' '}
            <span className="text-orange-400 font-bold uppercase">{user.role}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchStats}
            className="flex items-center space-x-1.5 bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-navy-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh System Stats</span>
          </button>
        </div>
      </div>

      {/* Admin Subtabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => {
            setActionTab('overview');
            setFeedback(null);
          }}
          className={`px-4 py-2 rounded-lg transition ${
            actionTab === 'overview'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          System Statistics
        </button>
        <button
          onClick={() => {
            setActionTab('addCooling');
            setFeedback(null);
          }}
          className={`px-4 py-2 rounded-lg transition ${
            actionTab === 'addCooling'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Add Cooling Centre
        </button>
        <button
          onClick={() => {
            setActionTab('addAlert');
            setFeedback(null);
          }}
          className={`px-4 py-2 rounded-lg transition ${
            actionTab === 'addAlert'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Publish Heat Alert
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tab 1: Real Stored Database Statistics */}
      {actionTab === 'overview' && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Querying real system records...</div>
          ) : stats ? (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-semibold uppercase">Total Users</span>
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.users.total}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {stats.users.profilesCompleted} completed health profiles
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-semibold uppercase">Verified Cooling</span>
                    <Building className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-emerald-600">
                    {stats.coolingCentres.verified}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    +{stats.coolingCentres.demoUnverified} demo records
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-semibold uppercase">Essential Services</span>
                    <Activity className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-black text-purple-600">
                    {stats.essentialServices.totalActive}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Hospitals, Clinics, Water ATMs</div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-semibold uppercase">Active Alerts</span>
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-2xl font-black text-rose-600">{stats.alerts.active}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Forecast-based warnings</div>
                </div>
              </div>

              {/* Data Freshness & Transparency Notice */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                  <Database className="w-4 h-4 text-slate-500 mr-1.5" />
                  Data Integrity & Database Audit Trail
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Database Engine:</span>
                    <span className="font-semibold text-slate-800">{stats.dataFreshness.databaseEngine}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Weather Service Status:</span>
                    <span className="font-semibold text-emerald-700">{stats.dataFreshness.weatherApiStatus}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Geographical Database:</span>
                    <span className="font-semibold text-slate-800">{stats.locations.totalActive} Registered South India Locations</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  <strong>Strict Non-Fabrication Rule:</strong> All statistics presented in this dashboard are queried directly and dynamically from active SQLite relational records. No arbitrary mock numbers are ever rendered as system metrics.
                </p>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Tab 2: Add Cooling Centre Form */}
      {actionTab === 'addCooling' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 mb-1 flex items-center">
            <PlusCircle className="w-4 h-4 text-purple-600 mr-2" />
            Add New Public Cooling Relief Centre
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Register an authentic government shelter, AC library hall, transit hub, or medical cooling unit.
          </p>

          <form onSubmit={handleAddCoolingCentre} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Centre / Hub Name</label>
                <input
                  type="text"
                  value={newCentre.name}
                  onChange={(e) => setNewCentre({ ...newCentre, name: e.target.value })}
                  placeholder="e.g. Ripon Building Public Climate Rest Lounge"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Physical Address</label>
                <input
                  type="text"
                  value={newCentre.address}
                  onChange={(e) => setNewCentre({ ...newCentre, address: e.target.value })}
                  placeholder="Street, area, postal code..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <select
                  value={newCentre.state}
                  onChange={(e) => setNewCentre({ ...newCentre, state: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                >
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Puducherry">Puducherry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  value={newCentre.district}
                  onChange={(e) => setNewCentre({ ...newCentre, district: e.target.value })}
                  placeholder="District name"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newCentre.latitude}
                  onChange={(e) => setNewCentre({ ...newCentre, latitude: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newCentre.longitude}
                  onChange={(e) => setNewCentre({ ...newCentre, longitude: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Available Facilities</label>
                <input
                  type="text"
                  value={newCentre.facilities}
                  onChange={(e) => setNewCentre({ ...newCentre, facilities: e.target.value })}
                  placeholder="e.g. Air Conditioned, Cold RO Water, First Aid, Nurse on Duty"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={newCentre.operatingHours}
                  onChange={(e) => setNewCentre({ ...newCentre, operatingHours: e.target.value })}
                  placeholder="e.g. 08:00 AM - 07:00 PM or 24/7"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Verification Status</label>
                <select
                  value={newCentre.verificationStatus}
                  onChange={(e) => setNewCentre({ ...newCentre, verificationStatus: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-semibold"
                >
                  <option value="Verified">Verified (Officially validated facility)</option>
                  <option value="Demo Data — Not Verified">Demo Data — Not Verified (Demonstration only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Source</label>
                <input
                  type="text"
                  value={newCentre.source}
                  onChange={(e) => setNewCentre({ ...newCentre, source: e.target.value })}
                  placeholder="e.g. Greater Chennai Corporation Disaster Relief Cell"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                  required
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm transition"
              >
                <Save className="w-4 h-4" />
                <span>Save Cooling Centre</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Publish Early Warning Alert Form */}
      {actionTab === 'addAlert' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 mb-1 flex items-center">
            <AlertTriangle className="w-4 h-4 text-rose-600 mr-2" />
            Publish Heat-Health Early Warning Bulletin
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Broadcast an official early warning advisory to dashboard and forecast views.
          </p>

          <form onSubmit={handlePublishAlert} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Area / Location Name</label>
                <input
                  type="text"
                  value={newAlert.locationName}
                  onChange={(e) => setNewAlert({ ...newAlert, locationName: e.target.value })}
                  placeholder="e.g. Coastal Chennai Urban Belt"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Risk Level</label>
                <select
                  value={newAlert.riskLevel}
                  onChange={(e) => setNewAlert({ ...newAlert, riskLevel: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-bold"
                >
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                  <option value="Very High">Very High</option>
                  <option value="Extreme">Extreme</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  value={newAlert.district}
                  onChange={(e) => setNewAlert({ ...newAlert, district: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <select
                  value={newAlert.state}
                  onChange={(e) => setNewAlert({ ...newAlert, state: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                >
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Puducherry">Puducherry</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Supporting Weather Indicators</label>
                <input
                  type="text"
                  value={newAlert.supportingIndicators}
                  onChange={(e) => setNewAlert({ ...newAlert, supportingIndicators: e.target.value })}
                  placeholder="e.g. Ambient 39.5°C, RH 74%, Heat Index 52°C, WBGT 33.1°C"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Recommended Actions</label>
                <textarea
                  value={newAlert.recommendedActions}
                  onChange={(e) => setNewAlert({ ...newAlert, recommendedActions: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                  required
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm transition"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Publish Early Warning Bulletin</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
