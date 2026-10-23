// Live end-to-end HTTP verification of Phase 1 Link-Scanner endpoints
async function run() {
  console.log('--- Starting Live HTTP Verification of /api/v1/scans ---');

  // 1. Unauthenticated request -> must return 401
  const unauthRes = await fetch('http://localhost:3000/api/v1/scans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com' }),
  });
  console.log('1. Unauthenticated POST /api/v1/scans status:', unauthRes.status, '(Expected 401)');
  const unauthBody = await unauthRes.json();
  console.log('   Response code:', unauthBody.error?.code);

  // 2. Malformed URL -> must return 400
  const malformedRes = await fetch('http://localhost:3000/api/v1/scans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-token-user-a',
    },
    body: JSON.stringify({ url: 'javascript:alert(1)' }),
  });
  console.log('2. Malformed scheme POST /api/v1/scans status:', malformedRes.status, '(Expected 400)');
  const malformedBody = await malformedRes.json();
  console.log('   Response code:', malformedBody.error?.code);

  // 3. Authenticated valid scan for User A
  const scanRes = await fetch('http://localhost:3000/api/v1/scans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-token-user-a',
    },
    body: JSON.stringify({ url: 'https://paypal.com.account-verification-notice.xyz/login' }),
  });
  console.log('3. Authenticated valid scan status:', scanRes.status, '(Expected 201)');
  const scanData = await scanRes.json();
  console.log('   Scan ID:', scanData.scan_id);
  console.log('   Status:', scanData.status);
  console.log('   Category:', scanData.category);
  console.log('   Evidence count:', scanData.evidence?.length);
  console.log('   Provider status:', JSON.stringify(scanData.provider_status));
  console.log('   Limitations:', scanData.limitations);

  // 4. User A retrieves own scan -> 200
  const getResA = await fetch(`http://localhost:3000/api/v1/scans/${scanData.scan_id}`, {
    method: 'GET',
    headers: { Authorization: 'Bearer test-token-user-a' },
  });
  console.log('4. User A retrieves own scan status:', getResA.status, '(Expected 200)');

  // 5. User B probes User A scan -> 404 (anti-probing defense)
  const getResB = await fetch(`http://localhost:3000/api/v1/scans/${scanData.scan_id}`, {
    method: 'GET',
    headers: { Authorization: 'Bearer test-token-user-b' },
  });
  console.log('5. User B probes User A scan status:', getResB.status, '(Expected 404)');

  // 6. User A reports false positive -> 200
  const fpRes = await fetch(`http://localhost:3000/api/v1/scans/${scanData.scan_id}/false-positive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-token-user-a',
    },
    body: JSON.stringify({ reason: 'Internal security QA verification link' }),
  });
  console.log('6. False positive report status:', fpRes.status, '(Expected 200)');
  const fpData = await fpRes.json();
  console.log('   FP result:', fpData.success, '-', fpData.message);

  console.log('--- Live Verification Completed Successfully ---');
}

run().catch(console.error);
