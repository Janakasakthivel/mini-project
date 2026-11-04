import { Router } from 'express';
import { db } from '../db.js';
import { getLiveAndForecastWeather } from '../services/weatherService.js';
import { calculatePersonalVulnerability } from '../services/vulnerabilityService.js';
import { calculateCombinedRisk } from '../services/combinedRiskService.js';
import { generateRecommendations } from '../services/recommendationsService.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './auth.js';

const router = Router();

// Helper to extract optional user from Authorization header
function getOptionalUser(req) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Get Weather and Complete Risk Assessment for coordinates
router.get('/current', async (req, res) => {
  try {
    let lat = parseFloat(req.query.lat);
    let lon = parseFloat(req.query.lon);
    let locationName = req.query.name || 'Chennai Central';

    // Default to Chennai Central if not provided
    if (isNaN(lat) || isNaN(lon)) {
      lat = 13.0827;
      lon = 80.2707;
      locationName = 'Chennai Central';
    }

    const weatherData = await getLiveAndForecastWeather(lat, lon, locationName);

    // Check if user has personal profile
    const user = getOptionalUser(req);
    let personalVulnerability = {
      isComplete: false,
      score: null,
      category: 'Unassessed',
      explanation: 'Personal profile not set. Voluntary profile configuration provides customized risk insights.'
    };
    let userProfile = null;

    if (user) {
      const profileRecord = db.prepare('SELECT * FROM personal_profiles WHERE user_id = ?').get(user.id);
      if (profileRecord) {
        userProfile = {
          ageGroup: profileRecord.age_group,
          ageManual: profileRecord.age_manual,
          occupation: profileRecord.occupation,
          occupationManual: profileRecord.occupation_manual,
          medicalConditions: JSON.parse(profileRecord.medical_conditions || '[]'),
          medicalOther: profileRecord.medical_other,
          consentGiven: Boolean(profileRecord.consent_given)
        };
        personalVulnerability = calculatePersonalVulnerability(userProfile);
      }
    }

    // Calculate Combined Personalized Heat Risk
    const combinedRisk = calculateCombinedRisk(weatherData.environmentalRisk, personalVulnerability);

    // Generate Tailored Preventive Precautions
    const precautions = generateRecommendations(combinedRisk, userProfile, weatherData);

    res.json({
      ...weatherData,
      personalVulnerability,
      combinedRisk,
      precautions
    });
  } catch (err) {
    console.error('Weather error:', err);
    res.status(500).json({ error: 'Failed to retrieve meteorological data.' });
  }
});

// Search locations
router.get('/search', (req, res) => {
  try {
    const q = req.query.q ? String(req.query.q).trim() : '';

    if (!q) {
      return res.json({ results: [] });
    }

    // Input Validation rule: If search contains numbers or unsupported special characters, display "No results found."
    // Support alphabetic place names, spaces, standard dots (e.g. T. Nagar), apostrophes, hyphens
    const invalidCharRegex = /[0-9!@#$%^&*()_+=\[\]{};:"\\|<>?/~`]/;
    if (invalidCharRegex.test(q)) {
      return res.json({
        results: [],
        message: 'No results found.'
      });
    }

    const pattern = `%${q}%`;
    const results = db.prepare(`
      SELECT id, name, type, district, state, latitude, longitude
      FROM locations
      WHERE name LIKE ? OR district LIKE ? OR state LIKE ?
      LIMIT 12
    `).all(pattern, pattern, pattern);

    if (results.length === 0) {
      return res.json({
        results: [],
        message: 'No results found.'
      });
    }

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: 'Location search encountered an error.' });
  }
});

// List all locations
router.get('/locations', (req, res) => {
  try {
    const locations = db.prepare('SELECT * FROM locations WHERE is_active = 1 ORDER BY state, district, name').all();
    res.json({ locations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch geographical locations.' });
  }
});

// South India Overview for Interactive Map
router.get('/map-overview', async (req, res) => {
  try {
    const locations = db.prepare('SELECT * FROM locations WHERE is_active = 1').all();
    
    // Return locations with cached or estimated risk levels for rapid map rendering
    const mapNodes = locations.map(loc => {
      // Approximate risk based on latitude/season
      const approxTemp = Math.round((33 + Math.sin(loc.latitude * 0.4) * 4) * 10) / 10;
      const approxRh = Math.round(62 + Math.cos(loc.longitude * 0.3) * 12);
      const approxHI = Math.round(approxTemp + (approxRh > 60 ? 5.5 : 2.5));
      
      let riskLevel = 'Moderate';
      let markerColor = '#eab308'; // yellow
      if (approxHI >= 43) {
        riskLevel = 'Very High';
        markerColor = '#ef4444'; // red
      } else if (approxHI >= 39) {
        riskLevel = 'High';
        markerColor = '#f97316'; // orange
      } else if (approxHI <= 31) {
        riskLevel = 'Low';
        markerColor = '#10b981'; // green
      }

      return {
        id: loc.id,
        name: loc.name,
        type: loc.type,
        district: loc.district,
        state: loc.state,
        latitude: loc.latitude,
        longitude: loc.longitude,
        currentTemp: approxTemp,
        humidity: approxRh,
        riskLevel,
        markerColor
      };
    });

    res.json({ locations: mapNodes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate map overview.' });
  }
});

export default router;
