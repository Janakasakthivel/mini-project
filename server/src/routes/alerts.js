import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// Get active early warning alerts
router.get('/', (req, res) => {
  try {
    const { district, state, riskLevel } = req.query;

    let query = 'SELECT * FROM alerts WHERE is_active = 1';
    const params = [];

    if (district) {
      query += ' AND district = ?';
      params.push(district);
    }
    if (state) {
      query += ' AND state = ?';
      params.push(state);
    }
    if (riskLevel) {
      query += ' AND risk_level = ?';
      params.push(riskLevel);
    }

    query += ' ORDER BY created_at DESC';

    const alerts = db.prepare(query).all(...params);

    const formatted = alerts.map(a => ({
      id: a.id,
      locationName: a.location_name,
      district: a.district,
      state: a.state,
      alertType: a.alert_type,
      riskLevel: a.risk_level,
      expectedPeriod: a.expected_period,
      supportingIndicators: a.supporting_indicators,
      recommendedActions: a.recommended_actions,
      dataSource: a.data_source,
      createdAt: a.created_at
    }));

    res.json({
      alerts: formatted,
      disclaimer: 'Alerts are generated through rule-based biometeorological forecasting models (HI, WBGT, and UTCI thresholds) and official meteorological warnings. They do not predict individual clinical admissions or mortality.'
    });
  } catch (err) {
    console.error('Alerts error:', err);
    res.status(500).json({ error: 'Failed to retrieve early warning alerts.' });
  }
});

export default router;
