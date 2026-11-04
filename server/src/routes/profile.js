import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken } from './auth.js';
import { calculatePersonalVulnerability } from '../services/vulnerabilityService.js';

const router = Router();

// Get current user's profile
router.get('/', authenticateToken, (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM personal_profiles WHERE user_id = ?').get(req.user.id);
    if (!profile) {
      return res.json({ profile: null, isComplete: false });
    }

    const conditions = JSON.parse(profile.medical_conditions || '[]');
    const contributingFactors = JSON.parse(profile.contributing_factors || '[]');

    const formatted = {
      id: profile.id,
      ageGroup: profile.age_group,
      ageManual: profile.age_manual,
      occupation: profile.occupation,
      occupationManual: profile.occupation_manual,
      medicalConditions: conditions,
      medicalOther: profile.medical_other,
      consentGiven: Boolean(profile.consent_given),
      vulnerabilityScore: profile.vulnerability_score,
      vulnerabilityCategory: profile.vulnerability_category,
      contributingFactors,
      updatedAt: profile.updated_at
    };

    const assessment = calculatePersonalVulnerability(formatted);

    res.json({
      profile: formatted,
      isComplete: true,
      assessment
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve personal profile.' });
  }
});

// Save or Update Profile
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      ageGroup,
      ageManual,
      occupation,
      occupationManual,
      medicalConditions,
      medicalOther,
      consentGiven
    } = req.body;

    if (!consentGiven) {
      return res.status(400).json({ error: 'Consent is required to save your health and vulnerability profile.' });
    }

    if (!ageGroup || !occupation) {
      return res.status(400).json({ error: 'Age group and occupation are required.' });
    }

    const conditionsArray = Array.isArray(medicalConditions) ? medicalConditions : [];

    const profileData = {
      ageGroup,
      ageManual: ageManual ? String(ageManual).trim() : null,
      occupation,
      occupationManual: occupationManual ? String(occupationManual).trim() : null,
      medicalConditions: conditionsArray,
      medicalOther: medicalOther ? String(medicalOther).trim() : null,
      consentGiven: true
    };

    const assessment = calculatePersonalVulnerability(profileData);

    const existing = db.prepare('SELECT id FROM personal_profiles WHERE user_id = ?').get(req.user.id);

    if (existing) {
      db.prepare(`
        UPDATE personal_profiles
        SET age_group = ?, age_manual = ?, occupation = ?, occupation_manual = ?,
            medical_conditions = ?, medical_other = ?, consent_given = 1,
            vulnerability_score = ?, vulnerability_category = ?, contributing_factors = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(
        profileData.ageGroup,
        profileData.ageManual,
        profileData.occupation,
        profileData.occupationManual,
        JSON.stringify(conditionsArray),
        profileData.medicalOther,
        assessment.score,
        assessment.category,
        JSON.stringify(assessment.contributingFactors),
        req.user.id
      );
    } else {
      db.prepare(`
        INSERT INTO personal_profiles (
          user_id, age_group, age_manual, occupation, occupation_manual,
          medical_conditions, medical_other, consent_given,
          vulnerability_score, vulnerability_category, contributing_factors
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
      `).run(
        req.user.id,
        profileData.ageGroup,
        profileData.ageManual,
        profileData.occupation,
        profileData.occupationManual,
        JSON.stringify(conditionsArray),
        profileData.medicalOther,
        assessment.score,
        assessment.category,
        JSON.stringify(assessment.contributingFactors)
      );
    }

    res.json({
      message: 'Personal heat vulnerability profile updated successfully.',
      assessment
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update personal profile.' });
  }
});

// Delete Profile (Privacy Right)
router.delete('/', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM personal_profiles WHERE user_id = ?').run(req.user.id);
    res.json({ message: 'Personal profile and health data permanently removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete profile data.' });
  }
});

export default router;
