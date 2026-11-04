export type UserRole = 'Citizen' | 'Administrator' | 'Health Authority' | 'Disaster Management Authority';

export interface User {
  id: number;
  fullName: string;
  email: string;
  city: string;
  state: string;
  role: UserRole;
  hasProfile?: boolean;
}

export interface ThermalIndex {
  value: number | null;
  unit: string;
  category: string;
  description: string;
  status: string;
  method: string;
  limitations: string;
  wetBulbTemp?: number;
}

export interface EnvironmentalRisk {
  score: number;
  category: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  badgeColor: string;
  explanation: string;
  contributingFactors: string[];
  indices: {
    heatIndex: ThermalIndex;
    wbgt: ThermalIndex;
    utci: ThermalIndex;
  };
  methodology: string;
}

export interface PersonalProfile {
  id?: number;
  ageGroup: string;
  ageManual?: string | null;
  occupation: string;
  occupationManual?: string | null;
  medicalConditions: string[];
  medicalOther?: string | null;
  consentGiven: boolean;
  vulnerabilityScore?: number;
  vulnerabilityCategory?: string;
  contributingFactors?: string[];
  updatedAt?: string;
}

export interface PersonalVulnerability {
  isComplete: boolean;
  score: number | null;
  category: string;
  badgeColor?: string;
  breakdown?: {
    ageScore: number;
    occupationScore: number;
    healthScore: number;
    maxAge: number;
    maxOccupation: number;
    maxHealth: number;
  };
  contributingFactors: string[];
  explanation: string;
  methodology?: string;
  disclaimer: string;
}

export interface CombinedRisk {
  isPersonalized: boolean;
  environmentalScore: number;
  environmentalCategory: string;
  personalScore: number | null;
  personalCategory: string;
  combinedScore: number;
  combinedCategory: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  badgeColor: string;
  narrative: string;
  synergyBoostApplied?: number;
  methodology: string;
  interactionSummary?: string;
}

export interface CurrentWeather {
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  windSpeedMs: number;
  windSpeedKmh: number;
  solarRadiationWm2: number;
  condition: string;
  description: string;
  tempMaxToday: number;
  tempMinToday: number;
  sunriseToday: string;
  sunsetToday: string;
  lastUpdated: string;
}

export interface ForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  humidityEstimate: number;
  condition: string;
  description: string;
  uvIndexMax: number | null;
  sunrise: string | null;
  sunset: string | null;
  forecastRisk: {
    score: number;
    category: string;
    badgeColor: string;
  };
}

export interface LocationItem {
  id: number;
  name: string;
  type: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  currentTemp?: number;
  humidity?: number;
  riskLevel?: string;
  markerColor?: string;
}

export interface CoolingCentre {
  id: number | string;
  name: string;
  address: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  facilities: string;
  operatingHours: string;
  contactPhone: string | null;
  verificationStatus: 'Verified' | 'Demo Data — Not Verified';
  source: string;
  isOpenNow: boolean | null;
  markerColor?: string;
}

export interface EssentialService {
  id: number | string;
  name: string;
  category: 'Hospital' | 'Clinic' | 'Cooling Centre' | 'Drinking Water Facility' | 'Pharmacy' | 'Emergency Medical Services';
  address: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  contactPhone: string;
  openingHours: string;
  verificationStatus: string;
  source: string;
  distanceKm: number;
}

export interface AlertItem {
  id: number;
  locationName: string;
  district: string;
  state: string;
  alertType: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  expectedPeriod: string;
  supportingIndicators: string;
  recommendedActions: string;
  dataSource: string;
  createdAt: string;
}

export interface Precaution {
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  icon: string;
}

export interface PrecautionsData {
  recommendations: Precaution[];
  emergencyProtocol: {
    title: string;
    warningSigns: string[];
    action: string;
  };
  disclaimer: string;
}
