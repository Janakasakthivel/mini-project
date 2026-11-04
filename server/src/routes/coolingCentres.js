import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// Helper to check if a centre is currently open based on operating hours string
function isCurrentlyOpen(hoursStr) {
  if (!hoursStr) return null;
  if (hoursStr.trim().toUpperCase() === '24/7') return true;

  // Pattern like "08:00 AM - 07:00 PM"
  const match = hoursStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;

  try {
    const now = new Date();
    // Get current IST time
    const istHours = (now.getUTCHours() + 5) % 24;
    const istMinutes = (now.getUTCMinutes() + 30);
    let currentTotalMinutes = (istHours * 60) + istMinutes;

    let startH = parseInt(match[1], 10);
    const startM = parseInt(match[2], 10);
    const startP = match[3].toUpperCase();
    if (startP === 'PM' && startH !== 12) startH += 12;
    if (startP === 'AM' && startH === 12) startH = 0;
    const startTotal = startH * 60 + startM;

    let endH = parseInt(match[4], 10);
    const endM = parseInt(match[5], 10);
    const endP = match[6].toUpperCase();
    if (endP === 'PM' && endH !== 12) endH += 12;
    if (endP === 'AM' && endH === 12) endH = 0;
    const endTotal = endH * 60 + endM;

    return currentTotalMinutes >= startTotal && currentTotalMinutes <= endTotal;
  } catch (e) {
    return null;
  }
}

// Get all cooling centres with filters
router.get('/', (req, res) => {
  try {
    const { state, district, verifiedOnly } = req.query;

    let query = 'SELECT * FROM cooling_centres WHERE is_active = 1';
    const params = [];

    if (state) {
      query += ' AND state = ?';
      params.push(state);
    }

    if (district) {
      query += ' AND district = ?';
      params.push(district);
    }

    if (verifiedOnly === 'true') {
      query += " AND verification_status = 'Verified'";
    }

    query += ' ORDER BY verification_status DESC, state, district, name';

    const centres = db.prepare(query).all(...params);

    const formatted = centres.map(c => ({
      id: c.id,
      name: c.name,
      address: c.address,
      district: c.district,
      state: c.state,
      latitude: c.latitude,
      longitude: c.longitude,
      facilities: c.facilities,
      operatingHours: c.operating_hours,
      contactPhone: c.contact_phone,
      verificationStatus: c.verification_status,
      source: c.source,
      isOpenNow: isCurrentlyOpen(c.operating_hours),
      markerColor: '#2563eb' // Distinct BLUE marker for cooling centres
    }));

    res.json({ coolingCentres: formatted });
  } catch (err) {
    console.error('Cooling centres error:', err);
    res.status(500).json({ error: 'Failed to retrieve cooling centres.' });
  }
});

// Cooling Centres Dashboard Statistics (strictly calculated from actual stored records)
router.get('/stats', (req, res) => {
  try {
    // Total verified centres
    const totalVerified = db.prepare(`
      SELECT COUNT(*) as count FROM cooling_centres 
      WHERE is_active = 1 AND verification_status = 'Verified'
    `).get().count;

    // Total unverified / demo centres
    const totalDemo = db.prepare(`
      SELECT COUNT(*) as count FROM cooling_centres 
      WHERE is_active = 1 AND verification_status != 'Verified'
    `).get().count;

    // State-wise count from verified records
    const stateStats = db.prepare(`
      SELECT state, 
             COUNT(CASE WHEN verification_status = 'Verified' THEN 1 END) as verifiedCount,
             COUNT(CASE WHEN verification_status != 'Verified' THEN 1 END) as demoCount,
             COUNT(*) as totalCount
      FROM cooling_centres
      WHERE is_active = 1
      GROUP BY state
      ORDER BY verifiedCount DESC
    `).all();

    // District-wise count from verified records
    const districtStats = db.prepare(`
      SELECT district, state,
             COUNT(CASE WHEN verification_status = 'Verified' THEN 1 END) as verifiedCount,
             COUNT(CASE WHEN verification_status != 'Verified' THEN 1 END) as demoCount,
             COUNT(*) as totalCount
      FROM cooling_centres
      WHERE is_active = 1
      GROUP BY district, state
      ORDER BY verifiedCount DESC, district ASC
    `).all();

    // Currently open evaluation
    const allActive = db.prepare('SELECT operating_hours, verification_status FROM cooling_centres WHERE is_active = 1').all();
    let verifiedOpenNow = 0;
    let statusUnknown = 0;

    for (const c of allActive) {
      const openStatus = isCurrentlyOpen(c.operating_hours);
      if (openStatus === true && c.verification_status === 'Verified') {
        verifiedOpenNow++;
      } else if (openStatus === null) {
        statusUnknown++;
      }
    }

    res.json({
      totalVerified,
      totalDemo,
      verifiedOpenNow,
      statusUnknown,
      stateStats,
      districtStats,
      dataNotice: 'Statistics are computed dynamically and strictly from active database records. Demo records are never counted as verified cooling centres.'
    });
  } catch (err) {
    console.error('Cooling stats error:', err);
    res.status(500).json({ error: 'Failed to compute cooling centre statistics.' });
  }
});

export default router;
