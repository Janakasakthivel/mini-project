# HeatShield India — AI-Powered Hyperlocal Heat-Health Early Warning System

[![System Status](https://img.shields.io/badge/System-Operational-emerald)]()
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20SQLite-blue)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript%20%7C%20TailwindCSS-orange)]()
[![Geospatial](https://img.shields.io/badge/Geospatial-Leaflet%20%7C%20OpenStreetMap%20%7C%20OSRM-teal)]()
[![Biometeorology](https://img.shields.io/badge/Indices-HI%20%7C%20WBGT%20%7C%20UTCI-red)]()

> **HeatShield India** transforms general weather reports into actionable, hyperlocal, impact-based heat-health early warnings. It independently evaluates ambient atmospheric hazards, calculates multi-index thermal stress metrics, models personal physiological vulnerability, and synthesizes them into personalized preventive guidance.

---

## 1. Core Scientific Distinction

A central design principle of HeatShield India is the absolute separation of three distinct concepts:

$$\text{Environmental Heat Risk} \ne \text{Personal Heat Vulnerability} \ne \text{Combined Personalized Heat Risk}$$

```
+-----------------------------------+        +-----------------------------------+
|      METEOROLOGICAL DATA          |        |        VOLUNTARY PROFILE          |
|  Temp, Humidity, Wind, Radiation  |        |    Age, Occupation, Health Cond.  |
+-----------------+-----------------+        +-----------------+-----------------+
                  |                                            |
                  v                                            v
+-----------------+-----------------+        +-----------------+-----------------+
|   PILLAR 1: ENVIRONMENTAL RISK    |        |   PILLAR 2: PERSONAL VULNERABILITY|
|  HI (Rothfusz), WBGT (ISO 7243),  |        | Rule-Based Epidemiological Model  |
|      UTCI (COST 730) [0 - 100]    |        |       Non-Clinical [0 - 100]      |
+-----------------+-----------------+        +-----------------+-----------------+
                  \                                            /
                   \                                          /
                    +--------------------+-------------------+
                                         |
                                         v
                    +--------------------+-------------------+
                    |    PILLAR 3: COMBINED PERSONALIZED     |
                    |              HEAT RISK                 |
                    |    55% Env + 45% Vuln + Synergy Boost  |
                    +--------------------+-------------------+
                                         |
                                         v
                    +--------------------+-------------------+
                    | PREVENTIVE ACTIONS & EARLY WARNINGS    |
                    | Work-Rest Schedules, Hydration, Help   |
                    +----------------------------------------+
```

1. **Environmental Heat Risk (0–100):** Measures ambient atmospheric danger at a specific geographic locality. Evaluates air temperature, relative humidity, 10m wind speed, and solar irradiance.
2. **Personal Heat Vulnerability (0–100):** Measures an individual's physiological susceptibility based on age group, occupational solar/radiant exposure, and pre-existing chronic conditions.
3. **Combined Personalized Heat Risk (0–100):** Synthesizes the ambient hazard with individual vulnerability using a transparent weighted model with non-linear synergistic amplification.

---

## 2. Recognized Biometeorological Calculations

### A. Heat Index (HI) — NOAA / Rothfusz Equation (1990)
Apparent temperature in shade based on Lans P. Rothfusz's 9-term polynomial regression derived from Steadman (1979):

$$\begin{aligned}
\text{HI}_F = &-42.379 + 2.04901523 T_F + 10.14333127 RH - 0.22475541 T_F RH \\
&- 0.00683783 T_F^2 - 0.05481717 RH^2 + 0.00122874 T_F^2 RH \\
&+ 0.00085282 T_F RH^2 - 0.00000199 T_F^2 RH^2
\end{aligned}$$

- Includes standard NOAA low-humidity adjustments ($RH < 13\%$, $80 \le T_F \le 112$) and high-humidity adjustments ($RH > 85\%$, $80 \le T_F \le 87$).
- Steadman formula applied for temperatures $< 80^\circ\text{F}$.
- Converted to Celsius for display. Validated for $T \ge 20^\circ\text{C}$ and $RH \ge 40\%$.

### B. Wet Bulb Globe Temperature (WBGT) — ISO 7243 Standard
Global occupational heat stress standard:

$$\text{WBGT}_{\text{outdoor}} = 0.7 T_w + 0.2 T_g + 0.1 T_a$$

- **Natural Wet-Bulb Temperature ($T_w$):** Calculated psychrometrically using **Stull's equation (2011)**:
  $$T_w = T_a \operatorname{atan}\left(0.151977 (RH + 8.313659)^{1/2}\right) + \operatorname{atan}(T_a + RH) - \operatorname{atan}(RH - 1.676331) + 0.00391838 RH^{3/2} \operatorname{atan}(0.023101 RH) - 4.686035$$
- **Black Globe Temperature ($T_g$):** When direct/global solar radiation ($S$ in $\text{W/m}^2$) and wind speed ($v$ in $\text{m/s}$) are available, calculated using **Liljegren's outdoor approximation**:
  $$\Delta T_g = \frac{S \times 0.0135}{1 + 0.3 \times \max(v, 0.2)^{0.6}}, \quad T_g = T_a + \Delta T_g$$
- When solar radiation is unavailable, the Australian Bureau of Meteorology (BOM) in-shade formula is used and clearly labeled as an estimate.

### C. Universal Thermal Climate Index (UTCI) — COST Action 730
Calculated via the COST Action 730 polynomial multi-node human thermophysiological model as a function of air temperature ($T_a$), relative humidity ($RH$), 10m wind velocity ($v_{10}$), and mean radiant temperature ($T_{\text{mrt}}$). Labeled with transparent input assumptions.

---

## 3. Key Modules and Features

### 1. Authentication & Role-Based Access
- **Roles:** Citizen, Administrator, Health Authority, Disaster Management Authority.
- **Login:** Returns exact prompt error message on invalid password: `"Incorrect password. Please try again."`
- **Registration Criteria:** Minimum 8 characters, $\ge 1$ uppercase letter, $\ge 1$ lowercase letter, $\ge 1$ number, $\ge 1$ special character. Interactive checklist display.
- **Security:** Passwords hashed with bcrypt; stateless JWT authentication; protected administrative routes.

### 2. Main Dashboard & Live Weather Cards
- Displays: Current Air Temperature, Feels-Like Temperature, Relative Humidity, Wind Speed (km/h & m/s), Solar Irradiance ($\text{W/m}^2$), Weather Condition, Today's Max/Min Temperature, Sunrise and Sunset.
- Every card includes location name, geographic coordinates, and last-updated time.
- Integrated with genuine meteorological API (Open-Meteo High-Resolution Numerical Meteorological Model) with zero required API keys and reliable regional climatological fallback.

### 3. Interactive South India Map
- Comprehensive coverage across 6 southern territories:
  - **Tamil Nadu** (Chennai, Coimbatore, Madurai, Tiruchirappalli, Salem, Tirunelveli, Vellore, Erode, etc.)
  - **Kerala** (Thiruvananthapuram, Kochi, Kozhikode, Thrissur, Kollam, Palakkad, Alappuzha, Kannur)
  - **Karnataka** (Bengaluru, Mysuru, Hubballi-Dharwad, Mangaluru, Belagavi, Kalaburagi, Ballari)
  - **Andhra Pradesh** (Visakhapatnam, Vijayawada, Guntur, Tirupati, Nellore, Kurnool, Rajamahendravaram)
  - **Telangana** (Hyderabad, Warangal, Nizamabad, Karimnagar, Khammam, Ramagundam)
  - **Puducherry** (Puducherry City, Karaikal, Ozhukarai, Mahe, Yanam)
- Multi-tier zoom: State $\rightarrow$ District $\rightarrow$ City $\rightarrow$ Locality $\rightarrow$ Area.
- Color-coded risk markers: Green (Low), Yellow (Moderate), Orange (High), Red (Very High), Dark Red (Extreme).
- **Dedicated BLUE Markers** for Verified Public Cooling Centres.
- **Zero Use of Term "Ward":** Strictly uses state, district, city, town, neighbourhood, locality, or area.

### 4. Prominent Location Search
- Instant autocomplete across all South Indian states, districts, cities, and localities.
- Input validation: If the query contains numbers or unsupported special characters, displays `"No results found."`
- Allows valid place names with legitimate punctuation (e.g. `T. Nagar`, `Old Town`).
- "Use My Current Location" button with explicit browser geolocation permission handling.

### 5. Verified Cooling Centres Information System
- Features genuine municipal climate relief shelters, air-conditioned public libraries, hospital heat cells, and transit lounges.
- Distinct blue markers on map with full facility details, operating hours, phone, and source.
- Dynamic dashboard statistics strictly calculated from active database records:
  - Total Verified Centres
  - Centres Open Now (evaluated against current IST time)
  - Unverified Demonstration Records (clearly tagged as `"Demo Data — Not Verified"`)
- State and district filters.

### 6. Get Help — Nearby Essential Services & Routing
- Categories: Hospitals, Clinics, Cooling Centres, Drinking Water Facilities, Pharmacies, Emergency Medical Services.
- Geodesic distance calculation via spherical Haversine formula.
- Genuine road driving routes and travel time estimates powered by **OSRM (Open Source Routing Machine)**.
- Direct external "Open in Google Maps" link for turn-by-turn GPS navigation.

### 7. Weather Forecast & Early Warning System
- 5-Day forecast cards displaying daily Max/Min temperatures, estimated humidity, UV index, sunrise/sunset, and forecast heat-risk category.
- Active Early Warning Bulletins detailing alert type, expected time period, supporting atmospheric indicators, and recommended preventive actions.

### 8. Administrator Portal
- Protected for Administrator, Health Authority, and Disaster Management Authority.
- Live database statistics (total users, verified cooling centres, active alerts, locations).
- Add new verified cooling centres or flag demonstration entries.
- Publish and deactivate official heat warning bulletins.

---

## 4. Medical Safety & Privacy Compliance

- **Preventive Only:** HeatShield India is a preventive early warning system. It does **not** diagnose medical conditions, prescribe drugs, recommend dosages, or substitute for professional medical consultation.
- **Emergency Protocols:** Severe symptoms (Heat Stroke: body temp $>103^\circ\text{F}$, dry hot skin, confusion, seizures) trigger red emergency warnings directing the user to dial **108** or **112**.
- **Privacy Rights:** Health profile data is voluntary, collected with explicit consent, encrypted, never displayed on public maps, and can be edited or deleted at any time.

---

## 5. Technology Architecture

```
C:\miniproject
├── client/                      # React 18 + TypeScript + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components (Navbar, Map, Search, Cards, Modals)
│   │   ├── context/             # AuthContext, LocationContext
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx              # Main Single-Page Application
│   │   └── main.tsx             # React entry point
│   ├── vite.config.ts           # Vite proxy & build configuration
│   ├── tailwind.config.js       # Tailwind CSS theme extension
│   └── package.json
│
├── server/                      # Node.js + Express REST API Server
│   ├── src/
│   │   ├── db.js                # Built-in Node SQLite (DatabaseSync) schema & seeding
│   │   ├── index.js             # Express app & static SPA server
│   │   ├── services/
│   │   │   ├── thermalStress.js        # HI (Rothfusz), WBGT (Stull/Liljegren), UTCI
│   │   │   ├── weatherService.js       # Open-Meteo & climatological fallback
│   │   │   ├── vulnerabilityService.js # Personal vulnerability scoring model
│   │   │   ├── combinedRiskService.js  # Combined risk synthesis formula
│   │   │   ├── recommendationsService.js # Preventive guidance & emergency triage
│   │   │   └── routingService.js       # Haversine distance & OSRM routing
│   │   └── routes/              # Modular Express routers (auth, weather, cooling, etc.)
│   ├── heatshield.db            # Embedded SQLite persistent relational database
│   ├── test_e2e.js              # Comprehensive E2E automated test suite
│   └── package.json
│
├── .env.example                 # Environment variables template
├── package.json                 # Monorepo orchestration scripts
└── README.md                    # System documentation
```

---

## 6. Getting Started & Local Installation

### Prerequisites
- **Node.js** v18+ (tested on Node v24.16.0)
- **npm** v10+

### Step 1: Clone or Navigate to the Workspace
```bash
cd c:\miniproject
```

### Step 2: Install Dependencies
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
cd ..
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```
*(Default settings run out-of-the-box without requiring any paid API keys).*

### Step 4: Build Frontend
```bash
npm run build
```
This generates the optimized production bundle in `client/dist`.

### Step 5: Start the Full-Stack Application
```bash
npm start
```
The application will launch on:
```
http://localhost:5000
```
*(The Express server serves both the complete backend REST API and the React single-page frontend from port 5000).*

### Development Mode (Concurrent Vite + Express)
To run frontend hot-reloading:
```bash
# Terminal 1: Run Express Server (Port 5000)
npm run dev

# Terminal 2: Run Vite Dev Server with API Proxy (Port 5173)
npm run dev:client
```
Open `http://localhost:5173` in your browser.

---

## 7. Automated Test Verification

Run the end-to-end automated test suite:
```bash
npm test
```
**Verification Scope:**
- System Healthcheck
- Citizen demo authentication
- Exact error message verification (`"Incorrect password. Please try again."`)
- Meteorological fetch & HI / WBGT / UTCI calculations
- Multi-pillar risk scoring (Environmental, Personal, Combined)
- Search validation (rejecting numbers and special characters)
- Cooling centre database counts and verification tags
- Geospatial geodesic distance & OSRM road routing
- Role-protected administrative endpoints
- Static SPA distribution

---

## 8. Pre-seeded Demo Credentials

For academic evaluation and demonstration, the database includes four pre-seeded accounts:

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Citizen Demo** | `citizen@example.com` | `Citizen@12345` | Citizen dashboard with completed senior/outdoor worker vulnerability profile |
| **Administrator** | `admin@heatshield.gov.in` | `Admin@12345` | Administrative portal: manage facilities, alerts, and audit data |
| **Health Authority** | `health@heatshield.gov.in` | `Health@12345` | State health officer: review clinical heat wards and hospital status |
| **Disaster Management**| `disaster@heatshield.gov.in`| `Disaster@12345` | Early warning dissemination and municipal cooling relief shelter management |

---

## 9. Deployment Instructions (Render / Railway / Cloud)

### Deploying to Render
1. Create a **New Web Service** connected to your repository.
2. Set **Environment**: `Node`.
3. Set **Build Command**:
   ```bash
   cd client && npm install && npm run build && cd ../server && npm install
   ```
4. Set **Start Command**:
   ```bash
   node server/src/index.js
   ```
5. Add Environment Variables:
   - `PORT`: `5000` (or `10000`)
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `[your-random-production-secret-key]`

---

## 10. Acceptance Criteria Verification Checklist

| # | Requirement | Implementation Status | Verification Details |
| :--- | :--- | :---: | :--- |
| 1 | Users can create accounts | ✅ | `POST /api/auth/register` with full validation |
| 2 | Users can log in with valid credentials | ✅ | `POST /api/auth/login` issuing signed JWT tokens |
| 3 | Incorrect password displays exact specified string | ✅ | Displays exactly: `"Incorrect password. Please try again."` |
| 4 | Users can log out securely | ✅ | Clears session token, state, and client cache |
| 5 | Weather data from genuine meteorological source | ✅ | Open-Meteo High-Resolution Model with regional climatological fallback |
| 6 | Forecast cards display 5-day forecast | ✅ | Daily Min/Max, humidity, UV index, sunrise/sunset, risk levels |
| 7 | South India map loads correctly | ✅ | OpenStreetMap tile layers centered at $[12.5^\circ\text{N}, 78.5^\circ\text{E}]$ |
| 8 | Zoom into states, districts, cities, localities | ✅ | Multi-level zoom controls with real South Indian coordinates |
| 9 | Selecting location updates dashboard & map | ✅ | React context synchronization across all components |
| 10 | Search accepts place names & rejects invalid input | ✅ | Alphabetic search with exact `"No results found."` on numbers/special chars |
| 11 | HI calculations with documented inputs | ✅ | NOAA Rothfusz 9-term polynomial regression equation |
| 12 | WBGT & UTCI identify unavailable inputs/status | ✅ | ISO 7243 Stull/Liljegren models with transparent estimation status |
| 13 | Environmental Heat Risk calculated independently | ✅ | Multi-index composite score ($0 - 100$) derived strictly from weather |
| 14 | Personal Heat Vulnerability calculated independently | ✅ | Rule-based baseline ($0 - 100$) derived strictly from user profile |
| 15 | Combined Personalized Heat Risk uses both assessments | ✅ | Weighted blend + synergistic interaction amplification |
| 16 | Users can edit/delete personal profile | ✅ | Full CRUD with voluntary consent checkbox and deletion right |
| 17 | Preventive recommendations respond to risk | ✅ | Hydration, work-rest cycles for outdoor workers, child & senior care |
| 18 | Medical safety restrictions followed | ✅ | No clinical diagnosis or prescription; 108/112 emergency stroke warning |
| 19 | Cooling centres appear with BLUE markers | ✅ | Distinct blue `#2563eb` markers with snowflake glyph |
| 20 | Cooling centre counts use actual records | ✅ | Dynamic SQL `COUNT` queries; zero arbitrary statistics |
| 21 | Unverified facilities clearly labelled | ✅ | Labeled as `"Demo Data — Not Verified"` vs `"Verified"` |
| 22 | Get Help supports nearby facility searches | ✅ | Search by category within customizable radius |
| 23 | Location permission requested appropriately | ✅ | Explicit browser permission prompt with graceful denial fallback |
| 24 | Routes based on actual routing service | ✅ | Authentic road geometry via OSRM + Google Maps directions |
| 25 | Forecast-based alerts display supporting info | ✅ | Includes area, date, risk level, atmospheric indicators, actions |
| 26 | Administrator features protected | ✅ | Middleware checks for Admin/Health/Disaster roles |
| 27 | Mobile and desktop responsiveness | ✅ | Tailwind responsive grid, mobile bottom bar, fluid layouts |
| 28 | No major console errors or broken interactions | ✅ | Verified via end-to-end testing suite & strict TypeScript types |
| 29 | Missing/unavailable data handled honestly | ✅ | Transparent status messages without silent fabrication |
| 30 | Can run locally and deployed via documented steps | ✅ | Documented commands for local execution and cloud deployment |

---

## 11. Known Limitations & Future AI/ML Roadmap

1. **Microclimate Net Radiometers:** Mean radiant temperature ($T_{\text{mrt}}$) and black globe temperature ($T_g$) are currently computed via validated biometeorological approximations (Liljegren / COST Action 730) using ambient solar irradiance and wind velocity. Direct 6-direction net radiometer hardware integration is planned for municipal IoT stations.
2. **AI/ML Predictive Risk Pipeline:** The current architecture uses a transparent, scientifically documented rule-based baseline engine. As historical hyperlocal hospital admission datasets and satellite thermal imagery (e.g. Landsat-8 / Sentinel-3 Surface Temperature) become accessible, the architecture is ready for integration with scikit-learn / XGBoost models to predict micro-urban heat island anomalies.

---

&copy; 2026 HeatShield India Team. Built for academic demonstration, climate resilience, and public health awareness.
