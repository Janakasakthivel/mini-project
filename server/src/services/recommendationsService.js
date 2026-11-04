/**
 * Preventive Heat-Health Recommendations Service
 * 
 * Generates tailored, actionable, preventive precautions based on:
 * - Environmental Heat Risk & Thermal Indices
 * - Personal Heat Vulnerability & Occupation/Age
 * - Combined Risk Level
 * 
 * CRITICAL SAFETY RULES:
 * - Preventive guidance only; never diagnoses or prescribes medication
 * - Directs severe symptoms to immediate 108 / 112 emergency medical services
 */

export function generateRecommendations(combinedRisk, userProfile, weatherData) {
  const recommendations = [];
  const riskCategory = combinedRisk ? combinedRisk.combinedCategory : 'Moderate';
  const occupation = userProfile?.occupation;
  const ageGroup = userProfile?.ageGroup;
  const medicalConditions = userProfile?.medicalConditions || [];

  // 1. Core Hydration & Exposure Precautions based on Risk Level
  if (riskCategory === 'Extreme' || riskCategory === 'Very High') {
    recommendations.push({
      category: 'Immediate Protective Action',
      title: 'Seek Climate-Controlled Shelter',
      description: 'Remain in air-conditioned buildings or designated municipal cooling centres. Avoid direct sun exposure between 11:00 AM and 04:00 PM.',
      priority: 'high',
      icon: 'ShieldAlert'
    });
    recommendations.push({
      category: 'Hydration Protocol',
      title: 'Active Hydration Schedule',
      description: 'Drink 250ml to 300ml of cool water or oral rehydration salts (ORS) solution every 20 minutes, even if not feeling thirsty. Avoid caffeine, alcohol, and heavy sugary drinks.',
      priority: 'high',
      icon: 'Droplets'
    });
  } else if (riskCategory === 'High') {
    recommendations.push({
      category: 'Sun & Heat Avoidance',
      title: 'Limit Midday Outdoor Exposure',
      description: 'Reschedule strenuous outdoor tasks to early morning (before 10:00 AM) or late evening (after 05:00 PM).',
      priority: 'medium',
      icon: 'Sun'
    });
    recommendations.push({
      category: 'Hydration',
      title: 'Regular Fluid Replenishment',
      description: 'Carry a reusable water bottle. Maintain intake of cool water, coconut water, or buttermilk throughout the day.',
      priority: 'medium',
      icon: 'Droplets'
    });
  } else {
    recommendations.push({
      category: 'General Prevention',
      title: 'Standard Thermal Hygiene',
      description: 'Wear loose, lightweight, light-coloured cotton clothing. Carry an umbrella or wide-brim hat when walking outside.',
      priority: 'low',
      icon: 'CheckCircle'
    });
  }

  // 2. Occupational Guidelines
  if (['Outdoor Worker', 'Construction Worker', 'Agricultural Worker', 'Delivery Worker'].includes(occupation)) {
    let breakSchedule = '15-minute rest breaks in deep shade every 45 minutes of labor.';
    if (riskCategory === 'Extreme' || riskCategory === 'Very High') {
      breakSchedule = 'Enforce mandatory 30-minute shaded rest breaks per hour or suspend heavy physical tasks during peak midday hours (12:00 PM – 03:30 PM).';
    }
    recommendations.push({
      category: 'Occupational Safety',
      title: 'Work-Rest & Shade Cycles',
      description: `For ${occupation}s: ${breakSchedule} Use wet towels or evaporative cooling neck wraps to lower surface skin temperature.`,
      priority: 'high',
      icon: 'HardHat'
    });
  } else if (occupation === 'Driver') {
    recommendations.push({
      category: 'Occupational Safety',
      title: 'Cabin Ventilation & Shaded Parking',
      description: 'Ventilate vehicle cabin before entering. Never leave children, elderly, or pets inside parked vehicles even for a minute with windows cracked.',
      priority: 'medium',
      icon: 'Car'
    });
  }

  // 3. Age-Specific Guidance
  if (['60–74', '75 and above'].includes(ageGroup)) {
    recommendations.push({
      category: 'Vulnerable Population Care',
      title: 'Senior Citizen Thermal Protection',
      description: 'Monitor indoor room temperature. Take frequent cool foot baths or sponge baths. Have family members or neighbors check in at least twice daily.',
      priority: 'high',
      icon: 'HeartHandshake'
    });
  } else if (ageGroup === 'Below 18') {
    recommendations.push({
      category: 'Youth & Children Care',
      title: 'Child Sun Protection',
      description: 'Restrict outdoor playground activities between 11:00 AM and 04:00 PM. Ensure regular water breaks every 20 minutes during play.',
      priority: 'medium',
      icon: 'Users'
    });
  }

  // 4. Pre-existing Conditions Cautious Guidance (strictly non-prescriptive)
  if (medicalConditions.length > 0 && !medicalConditions.includes('Prefer not to disclose')) {
    recommendations.push({
      category: 'Health Awareness',
      title: 'Chronic Condition Management',
      description: 'If you have cardiovascular, renal, or hypertensive conditions, consult your treating doctor regarding appropriate daily fluid intake limits and medication timing in hot weather. Never stop or modify prescribed medicines on your own.',
      priority: 'high',
      icon: 'AlertCircle'
    });
  }

  // 5. Emergency Warning Signs & Triage Notice
  const emergencyProtocol = {
    title: 'Emergency Medical Alert — Recognizing Heatstroke',
    warningSigns: [
      'Body temperature above 103°F (39.4°C)',
      'Hot, red, dry skin OR heavy sweating that suddenly stops',
      'Confusion, slurred speech, delirium, or loss of consciousness',
      'Persistent vomiting or seizures',
      'Rapid, strong pulse followed by extreme lethargy'
    ],
    action: 'HEAT STROKE IS A MEDICAL EMERGENCY. Call 108 or 112 immediately. Move the individual to shade, loosen clothing, apply cold water or ice packs to neck, armpits, and groin, and fan vigorously while waiting for the ambulance.'
  };

  const disclaimer = 'HeatShield India provides general preventive guidance based on public health and meteorological risk indicators. This platform does not provide medical diagnosis, treatment, or prescription. Always consult qualified healthcare professionals for medical advice.';

  return {
    recommendations,
    emergencyProtocol,
    disclaimer
  };
}
