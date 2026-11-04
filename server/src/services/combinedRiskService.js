/**
 * Combined Personalized Heat Risk Assessment Engine
 * 
 * Synthesizes two independent pillars:
 * 1. Environmental Heat Risk (Ambient danger at selected location)
 * 2. Personal Heat Vulnerability (Individual physiological susceptibility)
 * 
 * Generates the third distinct assessment: Combined Personalized Heat Risk.
 * Transparent, documented, non-clinical scoring algorithm.
 */

export function calculateCombinedRisk(environmentalRisk, personalVulnerability) {
  const envScore = environmentalRisk ? environmentalRisk.score : 0;
  const isProfileComplete = personalVulnerability && personalVulnerability.isComplete;

  if (!isProfileComplete) {
    return {
      isPersonalized: false,
      environmentalScore: envScore,
      environmentalCategory: environmentalRisk ? environmentalRisk.category : 'Low',
      personalScore: null,
      personalCategory: 'Profile Not Completed',
      combinedScore: envScore,
      combinedCategory: environmentalRisk ? environmentalRisk.category : 'Low',
      badgeColor: environmentalRisk ? environmentalRisk.badgeColor : 'green',
      narrative: 'Showing environmental heat risk only. Complete your voluntary personal profile to receive a tailored heat-health risk score and customized workplace/activity precautions.',
      interactionSummary: 'Ambient atmospheric conditions evaluated independently without personal physiological modifiers.'
    };
  }

  const vulnScore = personalVulnerability.score;

  // Weighted synthesis: 55% Environmental Hazard + 45% Personal Susceptibility
  let baseScore = 0.55 * envScore + 0.45 * vulnScore;

  // Synergistic Amplification Factor:
  // When both environmental stress AND personal vulnerability are concurrently elevated (>= 50),
  // biological thermoregulatory failure risk increases non-linearly.
  let synergyBoost = 0;
  if (envScore >= 50 && vulnScore >= 50) {
    synergyBoost = Math.min(12, ((envScore - 50) * 0.15) + ((vulnScore - 50) * 0.15));
  }

  const combinedScore = Math.min(Math.round(baseScore + synergyBoost), 100);

  let category = 'Low';
  let badgeColor = 'green';
  let narrative = '';

  if (combinedScore >= 85) {
    category = 'Extreme';
    badgeColor = 'darkred';
    narrative = `Critical Combined Heat Danger (Score: ${combinedScore}/100). The severe ambient thermal load (${envScore}/100) coincides with your high personal vulnerability profile (${vulnScore}/100). Immediate shelter in air-conditioned or shaded cooling spaces and suspension of strenuous tasks is strongly advised.`;
  } else if (combinedScore >= 70) {
    category = 'Very High';
    badgeColor = 'red';
    narrative = `Very High Combined Heat Risk (Score: ${combinedScore}/100). Hazardous ambient conditions (${envScore}/100) pose significant danger given your susceptibility factors (${vulnScore}/100). Strict work-rest cycles and constant electrolyte replenishment are required.`;
  } else if (combinedScore >= 50) {
    category = 'High';
    badgeColor = 'orange';
    narrative = `High Combined Heat Risk (Score: ${combinedScore}/100). While environmental risk is at ${envScore}/100, your personal sensitivity profile (${vulnScore}/100) elevates your overall susceptibility. Proactive cooling and avoidance of peak noon hours is recommended.`;
  } else if (combinedScore >= 30) {
    category = 'Moderate';
    badgeColor = 'yellow';
    narrative = `Moderate Combined Risk (Score: ${combinedScore}/100). Ambient heat (${envScore}/100) and personal vulnerability (${vulnScore}/100) indicate caution during prolonged daytime exposure. Regular fluid intake is recommended.`;
  } else {
    category = 'Low';
    badgeColor = 'green';
    narrative = `Low Combined Risk (Score: ${combinedScore}/100). Ambient conditions (${envScore}/100) and personal health tolerance (${vulnScore}/100) indicate comfortable thermal tolerance with standard hydration habits.`;
  }

  return {
    isPersonalized: true,
    environmentalScore: envScore,
    environmentalCategory: environmentalRisk.category,
    personalScore: vulnScore,
    personalCategory: personalVulnerability.category,
    combinedScore,
    combinedCategory: category,
    badgeColor,
    narrative,
    synergyBoostApplied: Math.round(synergyBoost * 10) / 10,
    methodology: 'Transparent synthesis: 55% Environmental Risk + 45% Personal Vulnerability + Non-linear Biological Synergy Boost (when both pillars >= 50).'
  };
}
