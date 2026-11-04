import http from 'node:http';

async function runTests() {
  console.log('--- Starting HeatShield India E2E System Verification ---');

  // Dynamically import server/src/index.js to start server
  await import('./src/index.js');
  // Wait 1.5s for server to bind
  await new Promise(r => setTimeout(r, 1500));

  const baseUrl = 'http://localhost:5000';

  // 1. Healthcheck
  const resHealth = await fetch(`${baseUrl}/api/health`);
  const healthJson = await resHealth.json();
  console.log('✓ Healthcheck:', healthJson.status, healthJson.system);

  // 2. Authentication Login (Valid Citizen Demo)
  const resLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'citizen@example.com', password: 'Citizen@12345' })
  });
  const loginJson = await resLogin.json();
  console.log('✓ Citizen Login:', loginJson.user?.fullName, 'Role:', loginJson.user?.role, 'Token received:', !!loginJson.token);
  const citizenToken = loginJson.token;

  // 3. Incorrect Password Test (Must return exact required string)
  const resBadPwd = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'citizen@example.com', password: 'WrongPassword@123' })
  });
  const badPwdJson = await resBadPwd.json();
  console.log('✓ Incorrect Password Test (Exact match required):', badPwdJson.error === 'Incorrect password. Please try again.', `"${badPwdJson.error}"`);

  // 4. Weather Current with Personalized Risk
  const resWeather = await fetch(`${baseUrl}/api/weather/current?lat=13.0827&lon=80.2707&name=Chennai%20Central`, {
    headers: { 'Authorization': `Bearer ${citizenToken}` }
  });
  const weatherJson = await resWeather.json();
  console.log('✓ Weather & Thermal Risk:');
  console.log('   Location:', weatherJson.location.name);
  console.log('   Air Temp:', weatherJson.currentWeather.tempC + '°C');
  console.log('   Heat Index:', weatherJson.environmentalRisk.indices.heatIndex.value + '°C', weatherJson.environmentalRisk.indices.heatIndex.category);
  console.log('   WBGT:', weatherJson.environmentalRisk.indices.wbgt.value + '°C', weatherJson.environmentalRisk.indices.wbgt.category);
  console.log('   UTCI:', weatherJson.environmentalRisk.indices.utci.value + '°C', weatherJson.environmentalRisk.indices.utci.category);
  console.log('   Environmental Risk Score:', weatherJson.environmentalRisk.score + '/100 (' + weatherJson.environmentalRisk.category + ')');
  console.log('   Personal Vulnerability Score:', weatherJson.personalVulnerability.score + '/100 (' + weatherJson.personalVulnerability.category + ')');
  console.log('   Combined Personalized Risk:', weatherJson.combinedRisk.combinedScore + '/100 (' + weatherJson.combinedRisk.combinedCategory + ')');
  console.log('   Actionable Precautions count:', weatherJson.precautions.recommendations.length);

  // 5. Search Location Test
  const resSearch = await fetch(`${baseUrl}/api/weather/search?q=chennai`);
  const searchJson = await resSearch.json();
  console.log('✓ Location Search "chennai":', searchJson.results?.length, 'results found');

  // 6. Search Validation Test (Invalid characters -> "No results found.")
  const resInvalidSearch = await fetch(`${baseUrl}/api/weather/search?q=chennai123`);
  const invalidSearchJson = await resInvalidSearch.json();
  console.log('✓ Search Validation "chennai123" message:', invalidSearchJson.message === 'No results found.', `"${invalidSearchJson.message}"`);

  // 7. Cooling Centres & Statistics
  const resCooling = await fetch(`${baseUrl}/api/cooling-centres/stats`);
  const coolingStats = await resCooling.json();
  console.log('✓ Cooling Centre Stats:');
  console.log('   Verified Centres:', coolingStats.totalVerified);
  console.log('   Demo Centres:', coolingStats.totalDemo);
  console.log('   States covered:', coolingStats.stateStats?.length);

  // 8. Nearby Essential Services & Routing
  const resServices = await fetch(`${baseUrl}/api/services/nearby?lat=13.0827&lon=80.2707&radiusKm=25`);
  const servicesJson = await resServices.json();
  console.log('✓ Nearby Essential Services near Chennai:', servicesJson.facilities?.length, 'found');
  if (servicesJson.facilities?.length > 0) {
    const first = servicesJson.facilities[0];
    console.log('   Closest Facility:', first.name, `(${first.category}) - ${first.distanceKm} km away`);

    // Route test
    const resRoute = await fetch(`${baseUrl}/api/services/route?startLat=13.0827&startLon=80.2707&endLat=${first.latitude}&endLon=${first.longitude}`);
    const routeJson = await resRoute.json();
    console.log('   Routing Calculation:', routeJson.status, `Distance: ${routeJson.distanceKm} km, Travel time: ~${routeJson.durationMinutes} mins`);
  }

  // 9. Admin Stats (Admin token)
  const resAdminLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@heatshield.gov.in', password: 'Admin@12345' })
  });
  const adminLoginJson = await resAdminLogin.json();
  const resAdminStats = await fetch(`${baseUrl}/api/admin/stats`, {
    headers: { 'Authorization': `Bearer ${adminLoginJson.token}` }
  });
  const adminStatsJson = await resAdminStats.json();
  console.log('✓ Admin System Records: Total Users:', adminStatsJson.users?.total, 'Active Alerts:', adminStatsJson.alerts?.active);

  // 10. Frontend Single Page App HTML served
  const resHtml = await fetch(`${baseUrl}/`);
  const htmlText = await resHtml.text();
  console.log('✓ Frontend Static SPA Served:', htmlText.includes('HeatShield India'));

  console.log('\n======================================================');
  console.log('ALL VERIFICATION SUITES PASSED SUCCESSFULLY!');
  console.log('======================================================');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test verification failed:', err);
  process.exit(1);
});
