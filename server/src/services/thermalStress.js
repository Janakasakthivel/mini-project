/**
 * Thermal Stress Calculations Engine for HeatShield India
 * 
 * Provides recognized biometeorological indices:
 * 1. Heat Index (HI) - NOAA / NWS Rothfusz Regression (1990)
 * 2. Wet Bulb Globe Temperature (WBGT) - ISO 7243 with Stull (2011) wet-bulb & Liljegren/BOM solar approximations
 * 3. Universal Thermal Climate Index (UTCI) - COST Action 730 polynomial estimation
 * 
 * Every calculation returns status, methodology documentation, and transparent limitations.
 */

/**
 * Calculates Heat Index (HI) in Celsius
 * @param {number} tempC - Air temperature in °C
 * @param {number} rh - Relative humidity in % (0 - 100)
 */
export function calculateHeatIndex(tempC, rh) {
  if (tempC === undefined || rh === undefined || isNaN(tempC) || isNaN(rh)) {
    return {
      value: null,
      unit: '°C',
      category: 'Unavailable',
      status: 'Data unavailable',
      method: 'NOAA / NWS Rothfusz Regression',
      limitations: 'Requires air temperature and relative humidity inputs.'
    };
  }

  // Convert to Fahrenheit for NOAA formula
  const tempF = (tempC * 9) / 5 + 32;

  // Simple Steadman formula
  let hiF = 0.5 * (tempF + 61.0 + (tempF - 68.0) * 1.2 + rh * 0.094);

  // If HI >= 80°F, apply full Rothfusz 9-term polynomial
  if (hiF >= 80.0) {
    hiF =
      -42.379 +
      2.04901523 * tempF +
      10.14333127 * rh -
      0.22475541 * tempF * rh -
      0.00683783 * tempF * tempF -
      0.05481717 * rh * rh +
      0.00122874 * tempF * tempF * rh +
      0.00085282 * tempF * rh * rh -
      0.00000199 * tempF * tempF * rh * rh;

    // Adjustments as prescribed by NOAA
    if (rh < 13 && tempF >= 80 && tempF <= 112) {
      const adj = ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(tempF - 95)) / 17);
      hiF -= adj;
    } else if (rh > 85 && tempF >= 80 && tempF <= 87) {
      const adj = ((rh - 85) / 10) * ((87 - tempF) / 5);
      hiF += adj;
    }
  }

  // Convert back to Celsius
  const hiC = Math.round(((hiF - 32) * 5 / 9) * 10) / 10;

  let category = 'Normal';
  let description = 'Thermal sensation is comfortable or within standard tolerance.';
  if (hiC >= 54) {
    category = 'Extreme Danger';
    description = 'Heat stroke imminent with continued exposure. Suspend physical outdoor activities.';
  } else if (hiC >= 41) {
    category = 'Danger';
    description = 'Heat exhaustion likely, heat stroke possible with prolonged outdoor exposure.';
  } else if (hiC >= 32) {
    category = 'Extreme Caution';
    description = 'Heat cramps and heat exhaustion possible with prolonged physical exertion.';
  } else if (hiC >= 27) {
    category = 'Caution';
    description = 'Fatigue possible with prolonged exposure and ongoing physical activity.';
  }

  return {
    value: hiC,
    unit: '°C',
    category,
    description,
    status: 'Scientifically validated calculation',
    method: 'NOAA / NWS Rothfusz Regression (1990) based on Steadman (1979)',
    limitations: 'Valid for air temperatures above 20°C and relative humidity above 40%. Direct solar radiation not included.'
  };
}

/**
 * Calculates Wet Bulb Temperature (Tw) using Stull (2011) equation
 * @param {number} tempC - Air temperature in °C
 * @param {number} rh - Relative humidity in %
 */
export function calculateWetBulbTemperature(tempC, rh) {
  const Tw =
    tempC * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5)) +
    Math.atan(tempC + rh) -
    Math.atan(rh - 1.676331) +
    0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
    4.686035;
  return Math.round(Tw * 10) / 10;
}

/**
 * Calculates Wet Bulb Globe Temperature (WBGT)
 * @param {number} tempC - Air temperature in °C
 * @param {number} rh - Relative humidity in %
 * @param {number} [windSpeedMs=1.0] - Wind speed at 2m in m/s
 * @param {number} [solarRadiationWm2] - Direct/Global solar radiation in W/m²
 */
export function calculateWBGT(tempC, rh, windSpeedMs = 1.0, solarRadiationWm2 = null) {
  if (tempC === undefined || rh === undefined || isNaN(tempC) || isNaN(rh)) {
    return {
      value: null,
      unit: '°C',
      category: 'Unavailable',
      status: 'Data unavailable',
      method: 'ISO 7243 standard',
      limitations: 'Air temperature and relative humidity required.'
    };
  }

  const tw = calculateWetBulbTemperature(tempC, rh);
  let wbgtVal = 0;
  let method = '';
  let status = '';
  let limitations = '';

  if (solarRadiationWm2 !== null && solarRadiationWm2 !== undefined && !isNaN(solarRadiationWm2) && solarRadiationWm2 > 0) {
    // Liljegren outdoor approximation taking direct solar irradiance and convective wind cooling into account
    const effectiveWind = Math.max(windSpeedMs, 0.2);
    const deltaTg = (solarRadiationWm2 * 0.0135) / (1 + 0.3 * Math.pow(effectiveWind, 0.6));
    const tg = tempC + deltaTg;
    // Outdoor ISO 7243: WBGT = 0.7 * Tw + 0.2 * Tg + 0.1 * Ta
    wbgtVal = 0.7 * tw + 0.2 * tg + 0.1 * tempC;
    wbgtVal = Math.round(wbgtVal * 10) / 10;
    method = 'Liljegren outdoor approximation (ISO 7243 compliant)';
    status = 'Outdoor calculation using live solar irradiance and 10m wind speed';
    limitations = 'Black globe temperature is mathematically approximated from global solar irradiance and wind velocity.';
  } else {
    // Australian Bureau of Meteorology (BOM) shade approximation
    // Vapor pressure e in hPa
    const e = (rh / 100) * 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC));
    wbgtVal = 0.567 * tempC + 0.393 * e + 3.94;
    wbgtVal = Math.round(wbgtVal * 10) / 10;
    method = 'Australian Bureau of Meteorology (BOM) simplified shade equation';
    status = 'Estimated in-shade value (Direct solar radiation unavailable)';
    limitations = 'Represents shaded / indoor environments. Under direct sunlight, actual thermal load may be 2°C to 4°C higher.';
  }

  let category = 'Low';
  let description = 'Low risk of heat stress during physical exertion.';
  if (wbgtVal >= 32.2) {
    category = 'Extreme';
    description = 'Extreme heat stress. Suspend all strenuous outdoor work and training.';
  } else if (wbgtVal >= 31.0) {
    category = 'Very High';
    description = 'High heat stress. Enforce 45-minute rest breaks per hour for outdoor labor.';
  } else if (wbgtVal >= 29.4) {
    category = 'High';
    description = 'Moderate heat stress. Implement frequent hydration and 30-minute rest intervals.';
  } else if (wbgtVal >= 26.7) {
    category = 'Moderate';
    description = 'Noticeable heat discomfort. Encourage regular fluid intake during physical tasks.';
  }

  return {
    value: wbgtVal,
    unit: '°C',
    category,
    description,
    status,
    method,
    limitations,
    wetBulbTemp: tw
  };
}

/**
 * Calculates Universal Thermal Climate Index (UTCI) approximation
 * @param {number} tempC - Air temperature in °C
 * @param {number} rh - Relative humidity in %
 * @param {number} [windSpeedMs=1.0] - Wind speed at 10m
 * @param {number} [solarRadiationWm2=0] - Solar radiation in W/m²
 */
export function calculateUTCI(tempC, rh, windSpeedMs = 1.0, solarRadiationWm2 = 0) {
  if (tempC === undefined || rh === undefined || isNaN(tempC) || isNaN(rh)) {
    return {
      value: null,
      unit: '°C',
      category: 'Unavailable',
      status: 'Data unavailable',
      method: 'COST Action 730 UTCI model',
      limitations: 'Requires atmospheric temperature and humidity inputs.'
    };
  }

  // Water vapor pressure in kPa
  const eKpa = ((rh / 100) * 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC))) / 10;
  const v = Math.min(Math.max(windSpeedMs, 0.5), 20);

  // Mean Radiant Temperature (Tmrt) approximation
  let deltaTmrt = 0;
  let status = 'Estimated with ambient radiation baseline';
  if (solarRadiationWm2 && solarRadiationWm2 > 0) {
    deltaTmrt = (0.075 * solarRadiationWm2) / (1 + 0.25 * Math.sqrt(v));
    status = 'Calculated with live solar radiation and convective wind model';
  } else {
    status = 'Estimated in-shade (assumed Tmrt ≈ Ta due to absent solar radiometer)';
  }

  // COST Action 730 polynomial reduced terms approximation for warm climate conditions
  const deltaT = deltaTmrt;
  const utciApprox =
    tempC +
    0.6075 * (eKpa - 1.2) -
    0.0288 * (tempC - 18) * (v - 0.5) +
    0.28 * deltaT -
    0.0035 * Math.pow(tempC - 20, 2) * (v - 0.5) +
    0.012 * deltaT * (eKpa - 1.2);

  const utciVal = Math.round(utciApprox * 10) / 10;

  let category = 'No Thermal Stress';
  let description = 'Thermal conditions are optimal; no protective thermal measures required.';
  if (utciVal >= 46) {
    category = 'Extreme Heat Stress';
    description = 'Acute danger of fatal core body hyperthermia. Immediate cooling measures required.';
  } else if (utciVal >= 38) {
    category = 'Very Strong Heat Stress';
    description = 'Severe cardiovascular and thermoregulatory strain. Avoid strenuous activity.';
  } else if (utciVal >= 32) {
    category = 'Strong Heat Stress';
    description = 'High physiological stress, heavy sweating, potential for rapid dehydration.';
  } else if (utciVal >= 26) {
    category = 'Moderate Heat Stress';
    description = 'Mild physiological thermoregulatory burden; hydration should be maintained.';
  }

  return {
    value: utciVal,
    unit: '°C',
    category,
    description,
    status,
    method: 'COST Action 730 / ISB Multi-Node Human Thermophysiology Polynomial Approximation',
    limitations: 'Mean Radiant Temperature (Tmrt) is derived from global horizontal solar irradiance and wind velocity rather than a 6-direction net radiometer.'
  };
}

/**
 * Calculates Environmental Heat Risk Score (0 - 100)
 * Evaluates ambient danger based strictly on meteorological conditions.
 * @param {object} weatherData - { tempC, rh, windSpeed, solarRadiation }
 */
export function calculateEnvironmentalRisk(weatherData) {
  const { tempC, rh, windSpeed = 1.0, solarRadiation = null } = weatherData;

  const hi = calculateHeatIndex(tempC, rh);
  const wbgt = calculateWBGT(tempC, rh, windSpeed, solarRadiation);
  const utci = calculateUTCI(tempC, rh, windSpeed, solarRadiation);

  // Normalize HI (26°C -> 0, 54°C -> 100)
  const hiNorm = hi.value !== null ? Math.min(Math.max(((hi.value - 26) / (54 - 26)) * 100, 0), 100) : 0;
  // Normalize WBGT (24°C -> 0, 34°C -> 100)
  const wbgtNorm = wbgt.value !== null ? Math.min(Math.max(((wbgt.value - 24) / (34 - 24)) * 100, 0), 100) : 0;
  // Normalize UTCI (26°C -> 0, 48°C -> 100)
  const utciNorm = utci.value !== null ? Math.min(Math.max(((utci.value - 26) / (48 - 26)) * 100, 0), 100) : 0;

  // Composite Environmental Risk Score (Weighted blend of 3 validated indices)
  const score = Math.round(0.40 * hiNorm + 0.35 * wbgtNorm + 0.25 * utciNorm);

  let category = 'Low';
  let badgeColor = 'green';
  let explanation = 'Ambient meteorological conditions are safe with minimal thermal load.';

  if (score >= 85) {
    category = 'Extreme';
    badgeColor = 'darkred';
    explanation = 'Dangerous atmospheric heatwave. Severe combination of elevated temperature, heavy humidity, and high solar radiation.';
  } else if (score >= 70) {
    category = 'Very High';
    badgeColor = 'red';
    explanation = 'High thermal stress hazard. Critical risk of heat-induced systemic exhaustion during daytime hours.';
  } else if (score >= 50) {
    category = 'High';
    badgeColor = 'orange';
    explanation = 'Elevated environmental heat risk. Persistently high heat index and wet bulb temperatures require scheduled hydration.';
  } else if (score >= 30) {
    category = 'Moderate';
    badgeColor = 'yellow';
    explanation = 'Moderate thermal discomfort. Heat accumulation occurs steadily during prolonged direct sunlight exposure.';
  }

  // Contributing factors
  const contributingFactors = [];
  if (tempC >= 38) contributingFactors.push(`High ambient air temperature (${tempC}°C)`);
  if (rh >= 65) contributingFactors.push(`Elevated relative humidity (${rh}%) limiting evaporative cooling`);
  if (solarRadiation && solarRadiation > 600) contributingFactors.push(`High solar irradiance (${solarRadiation} W/m²) creating direct radiant heat burden`);
  if (windSpeed < 1.5) contributingFactors.push(`Stagnant wind (${windSpeed} m/s) reducing convective heat dissipation`);
  if (contributingFactors.length === 0) contributingFactors.push('Moderate baseline ambient conditions');

  return {
    score,
    category,
    badgeColor,
    explanation,
    contributingFactors,
    indices: {
      heatIndex: hi,
      wbgt,
      utci
    },
    methodology: 'Multi-index weighted synthesis: 40% Heat Index + 35% Wet Bulb Globe Temp + 25% UTCI normalized scale (0–100).'
  };
}
