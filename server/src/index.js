import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { initDatabase } from './db.js';

import authRouter from './routes/auth.js';
import weatherRouter from './routes/weather.js';
import profileRouter from './routes/profile.js';
import coolingCentresRouter from './routes/coolingCentres.js';
import servicesRouter from './routes/services.js';
import alertsRouter from './routes/alerts.js';
import adminRouter from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Initialize SQLite Database and seed tables
initDatabase();

// Mount API Routes
app.use('/api/auth', authRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/profile', profileRouter);
app.use('/api/cooling-centres', coolingCentresRouter);
app.use('/api/services', servicesRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/admin', adminRouter);

// System Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'HeatShield India — AI-Powered Hyperlocal Heat-Health Early Warning System',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Scientific Methodology summary endpoint
app.get('/api/methodology', (req, res) => {
  res.json({
    title: 'HeatShield India Biometeorological & Vulnerability Methodology',
    pillars: [
      {
        name: 'Environmental Heat Risk',
        purpose: 'Measures ambient atmospheric hazard independently from human factors.',
        indices: [
          {
            name: 'Heat Index (HI)',
            formula: 'NOAA Rothfusz 9-term polynomial regression (1990) based on Steadman (1979)',
            inputs: 'Air temperature (°C) and Relative Humidity (%)',
            interpretation: 'Perceived apparent temperature in shade.'
          },
          {
            name: 'Wet Bulb Globe Temperature (WBGT)',
            formula: 'ISO 7243: 0.7 Tw + 0.2 Tg + 0.1 Ta. Stull (2011) psychrometric wet-bulb + Liljegren solar radiation & wind model.',
            inputs: 'Air temperature, Relative Humidity, Wind Speed, Solar Irradiance',
            interpretation: 'Workplace and occupational physical strain threshold.'
          },
          {
            name: 'Universal Thermal Climate Index (UTCI)',
            formula: 'COST Action 730 polynomial multi-node human thermophysiological model',
            inputs: 'Ta, RH, Wind Speed (v10), Mean Radiant Temperature (Tmrt)',
            interpretation: 'Dynamic human heat-exchange budget.'
          }
        ]
      },
      {
        name: 'Personal Heat Vulnerability',
        purpose: 'Assesses individual susceptibility to thermal stress based on age, occupational exposure, and pre-existing medical conditions.',
        scoringRange: '0 - 100 points',
        breakdown: 'Age factor (max 30 pts) + Occupational solar exposure (max 35 pts) + Medical sensitivity (max 35 pts).',
        disclaimer: 'Non-clinical screening baseline; not a medical diagnosis.'
      },
      {
        name: 'Combined Personalized Heat Risk',
        purpose: 'Synthesizes ambient meteorological hazard with personal physiological tolerance.',
        formula: '55% Environmental Risk + 45% Personal Vulnerability + Synergistic Non-linear Amplification (when both >= 50).',
        distinctionNotice: 'Environmental Risk ≠ Personal Vulnerability ≠ Combined Personalized Heat Risk.'
      }
    ]
  });
});

// Serve frontend build if available (production mode)
const clientBuildPath = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`HeatShield India API Server running on port ${PORT}`);
});
