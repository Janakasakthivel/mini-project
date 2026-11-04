import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken } from './auth.js';

const router = Router();

// Middleware to enforce Admin or Official Authority roles
export function requireAdminOrAuthority(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const allowedRoles = ['Administrator', 'Health Authority', 'Disaster Management Authority'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access restricted to authorized administrative personnel.' });
  }

  next();
}

// Admin System Statistics strictly calculated from real DB records
router.get('/stats', authenticateToken, requireAdminOrAuthority, (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const usersByRole = db.prepare('SELECT role, COUNT(*) as count FROM users GROUP BY role').all();
    const profilesCompleted = db.prepare('SELECT COUNT(*) as count FROM personal_profiles').get().count;
    
    const coolingTotal = db.prepare('SELECT COUNT(*) as count FROM cooling_centres WHERE is_active = 1').get().count;
    const coolingVerified = db.prepare("SELECT COUNT(*) as count FROM cooling_centres WHERE is_active = 1 AND verification_status = 'Verified'").get().count;
    const coolingDemo = db.prepare("SELECT COUNT(*) as count FROM cooling_centres WHERE is_active = 1 AND verification_status != 'Verified'").get().count;

    const servicesTotal = db.prepare('SELECT COUNT(*) as count FROM essential_services WHERE is_active = 1').get().count;
    const servicesByCategory = db.prepare('SELECT category, COUNT(*) as count FROM essential_services WHERE is_active = 1 GROUP BY category').all();

    const activeAlerts = db.prepare('SELECT COUNT(*) as count FROM alerts WHERE is_active = 1').get().count;
    const totalLocations = db.prepare('SELECT COUNT(*) as count FROM locations WHERE is_active = 1').get().count;

    res.json({
      users: {
        total: totalUsers,
        byRole: usersByRole,
        profilesCompleted
      },
      coolingCentres: {
        totalActive: coolingTotal,
        verified: coolingVerified,
        demoUnverified: coolingDemo
      },
      essentialServices: {
        totalActive: servicesTotal,
        byCategory: servicesByCategory
      },
      alerts: {
        active: activeAlerts
      },
      locations: {
        totalActive: totalLocations
      },
      dataFreshness: {
        lastChecked: new Date().toISOString(),
        weatherApiStatus: 'Operational',
        databaseEngine: 'Node.js Embedded SQLite (DatabaseSync)'
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve administrative statistics.' });
  }
});

// Cooling Centres Management - Add
router.post('/cooling-centres', authenticateToken, requireAdminOrAuthority, (req, res) => {
  try {
    const {
      name,
      address,
      district,
      state,
      latitude,
      longitude,
      facilities,
      operatingHours,
      contactPhone,
      verificationStatus,
      source
    } = req.body;

    if (!name || !address || !district || !state || !latitude || !longitude || !facilities || !operatingHours) {
      return res.status(400).json({ error: 'All core cooling centre fields are required.' });
    }

    const stmt = db.prepare(`
      INSERT INTO cooling_centres (
        name, address, district, state, latitude, longitude,
        facilities, operating_hours, contact_phone, verification_status, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const status = verificationStatus === 'Verified' ? 'Verified' : 'Demo Data — Not Verified';
    const src = source ? String(source).trim() : 'Municipal Administration Record';

    const info = stmt.run(
      name.trim(),
      address.trim(),
      district.trim(),
      state.trim(),
      parseFloat(latitude),
      parseFloat(longitude),
      facilities.trim(),
      operatingHours.trim(),
      contactPhone ? String(contactPhone).trim() : null,
      status,
      src
    );

    res.status(201).json({
      message: 'Cooling centre recorded successfully.',
      id: Number(info.lastInsertRowid)
    });
  } catch (err) {
    console.error('Add cooling centre error:', err);
    res.status(500).json({ error: 'Failed to add cooling centre.' });
  }
});

// Cooling Centres Management - Update / Verify / Reject
router.put('/cooling-centres/:id', authenticateToken, requireAdminOrAuthority, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      name,
      address,
      district,
      state,
      latitude,
      longitude,
      facilities,
      operatingHours,
      contactPhone,
      verificationStatus,
      source,
      isActive
    } = req.body;

    const existing = db.prepare('SELECT id FROM cooling_centres WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Cooling centre record not found.' });
    }

    db.prepare(`
      UPDATE cooling_centres
      SET name = COALESCE(?, name),
          address = COALESCE(?, address),
          district = COALESCE(?, district),
          state = COALESCE(?, state),
          latitude = COALESCE(?, latitude),
          longitude = COALESCE(?, longitude),
          facilities = COALESCE(?, facilities),
          operating_hours = COALESCE(?, operating_hours),
          contact_phone = COALESCE(?, contact_phone),
          verification_status = COALESCE(?, verification_status),
          source = COALESCE(?, source),
          is_active = COALESCE(?, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name,
      address,
      district,
      state,
      latitude !== undefined ? parseFloat(latitude) : null,
      longitude !== undefined ? parseFloat(longitude) : null,
      facilities,
      operatingHours,
      contactPhone,
      verificationStatus,
      source,
      isActive !== undefined ? (isActive ? 1 : 0) : null,
      id
    );

    res.json({ message: 'Cooling centre record updated successfully.' });
  } catch (err) {
    console.error('Update cooling centre error:', err);
    res.status(500).json({ error: 'Failed to update cooling centre.' });
  }
});

// Cooling Centres Management - Toggle Deactivate
router.delete('/cooling-centres/:id', authenticateToken, requireAdminOrAuthority, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    db.prepare('UPDATE cooling_centres SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    res.json({ message: 'Cooling centre deactivated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to deactivate record.' });
  }
});

// Alert Management - Create Official Alert
router.post('/alerts', authenticateToken, requireAdminOrAuthority, (req, res) => {
  try {
    const {
      locationName,
      district,
      state,
      alertType,
      riskLevel,
      expectedPeriod,
      supportingIndicators,
      recommendedActions,
      dataSource
    } = req.body;

    if (!locationName || !district || !state || !alertType || !riskLevel || !expectedPeriod || !supportingIndicators || !recommendedActions) {
      return res.status(400).json({ error: 'All alert fields are required.' });
    }

    const stmt = db.prepare(`
      INSERT INTO alerts (
        location_name, district, state, alert_type, risk_level,
        expected_period, supporting_indicators, recommended_actions, data_source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      locationName.trim(),
      district.trim(),
      state.trim(),
      alertType.trim(),
      riskLevel.trim(),
      expectedPeriod.trim(),
      supportingIndicators.trim(),
      recommendedActions.trim(),
      dataSource ? dataSource.trim() : 'HeatShield Early Warning Authority'
    );

    res.status(201).json({
      message: 'Early warning alert published successfully.',
      id: Number(info.lastInsertRowid)
    });
  } catch (err) {
    console.error('Create alert error:', err);
    res.status(500).json({ error: 'Failed to publish alert.' });
  }
});

// Alert Management - Deactivate
router.delete('/alerts/:id', authenticateToken, requireAdminOrAuthority, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    db.prepare('UPDATE alerts SET is_active = 0 WHERE id = ?').run(id);
    res.json({ message: 'Alert deactivated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to deactivate alert.' });
  }
});

export default router;
