/**
 * Routing and Geospatial Distance Service
 * 
 * Computes geodesic distances and fetches authentic road routing via OSRM.
 * Never invents fake routes or arbitrary travel times.
 */

// Geodesic distance calculation via Haversine formula
export function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Fetches authentic driving route from OSRM (Open Source Routing Machine)
 */
export async function getRoute(startLat, startLon, endLat, endLon) {
  const straightLineKm = calculateHaversineDistanceKm(startLat, startLon, endLat, endLon);
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLon}&destination=${endLat},${endLon}&travelmode=driving`;

  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
        const durationMinutes = Math.round(route.duration / 60);

        return {
          status: 'success',
          routingProvider: 'OSRM (Open Source Routing Machine)',
          distanceKm,
          durationMinutes,
          geometry: route.geometry, // GeoJSON LineString
          straightLineDistanceKm: straightLineKm,
          googleMapsUrl
        };
      }
    }
  } catch (err) {
    // Graceful fallback when network or OSRM is unreachable
  }

  // Fallback when routing server is unavailable
  return {
    status: 'fallback',
    routingProvider: 'Geodesic Direct Distance (OSRM road service unavailable)',
    distanceKm: straightLineKm,
    durationMinutes: Math.round(straightLineKm * 2.5), // estimated urban transit time (~24 km/h)
    geometry: {
      type: 'LineString',
      coordinates: [
        [startLon, startLat],
        [endLon, endLat]
      ]
    },
    straightLineDistanceKm: straightLineKm,
    googleMapsUrl,
    note: 'Turn-by-turn road path temporarily unavailable from external routing service. Straight-line reference displayed. Click Google Maps link for live GPS navigation.'
  };
}
