import { Router } from 'express';
import { db } from '../db.js';
import { calculateHaversineDistanceKm, getRoute } from '../services/routingService.js';

const router = Router();

// Search nearby essential services
router.get('/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    const category = req.query.category; // optional category filter
    const maxRadiusKm = parseFloat(req.query.radiusKm) || 35;

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Valid latitude and longitude coordinates are required.' });
    }

    let query = 'SELECT * FROM essential_services WHERE is_active = 1';
    const params = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    const services = db.prepare(query).all(...params);

    // Also include verified cooling centres if user requested 'Cooling Centre' or 'All'
    let coolingCentres = [];
    if (!category || category === 'All' || category === 'Cooling Centre' || category === 'Cooling Centres') {
      const ccRecords = db.prepare('SELECT * FROM cooling_centres WHERE is_active = 1').all();
      coolingCentres = ccRecords.map(c => ({
        id: `cc_${c.id}`,
        name: c.name,
        category: 'Cooling Centre',
        address: c.address,
        district: c.district,
        state: c.state,
        latitude: c.latitude,
        longitude: c.longitude,
        contact_phone: c.contact_phone,
        opening_hours: c.operating_hours,
        verification_status: c.verification_status,
        source: c.source
      }));
    }

    const allFacilities = [...services, ...coolingCentres];

    // Calculate real geodesic distances
    const withDistance = allFacilities.map(f => {
      const distanceKm = calculateHaversineDistanceKm(lat, lon, f.latitude, f.longitude);
      return {
        id: f.id,
        name: f.name,
        category: f.category,
        address: f.address,
        district: f.district,
        state: f.state,
        latitude: f.latitude,
        longitude: f.longitude,
        contactPhone: f.contact_phone || 'Emergency Helpline 108 / 112',
        openingHours: f.opening_hours || '24/7',
        verificationStatus: f.verification_status,
        source: f.source,
        distanceKm
      };
    });

    // Sort by distance ascending
    withDistance.sort((a, b) => a.distanceKm - b.distanceKm);

    // Filter within reasonable radius (or return closest 10 if none within radius)
    let nearby = withDistance.filter(f => f.distanceKm <= maxRadiusKm);
    if (nearby.length === 0) {
      // If outside max radius, take closest 5 so user isn't left empty-handed
      nearby = withDistance.slice(0, 5);
    }

    res.json({
      facilities: nearby,
      searchOrigin: { latitude: lat, longitude: lon },
      totalFound: nearby.length
    });
  } catch (err) {
    console.error('Essential services nearby error:', err);
    res.status(500).json({ error: 'Failed to find nearby essential facilities.' });
  }
});

// Calculate route between starting point and facility
router.get('/route', async (req, res) => {
  try {
    const startLat = parseFloat(req.query.startLat);
    const startLon = parseFloat(req.query.startLon);
    const endLat = parseFloat(req.query.endLat);
    const endLon = parseFloat(req.query.endLon);

    if (isNaN(startLat) || isNaN(startLon) || isNaN(endLat) || isNaN(endLon)) {
      return res.status(400).json({ error: 'Valid starting and destination coordinates are required.' });
    }

    const routeData = await getRoute(startLat, startLon, endLat, endLon);
    res.json(routeData);
  } catch (err) {
    console.error('Route calculation error:', err);
    res.status(500).json({ error: 'Failed to generate routing information.' });
  }
});

export default router;
