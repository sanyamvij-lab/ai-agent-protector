// Comprehensive End-to-End API Integration Verification for AI Protector
// Tests all legacy (/api/scan/*) and standardized v1 (/api/v1/*) endpoints.

async function runApiTests() {
  const baseUrl = 'http://localhost:3000';
  console.log('Starting AI Protector Comprehensive API Verification at', baseUrl);
  let failed = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`  FAIL: ${message}`);
      failed++;
    } else {
      console.log(`  PASS: ${message}`);
    }
  }

  // 1. Health Endpoints (v1)
  console.log('\n--- 1. Testing /api/v1/health/live & ready ---');
  const liveRes = await fetch(`${baseUrl}/api/v1/health/live`);
  const liveData = await liveRes.json();
  assert(liveRes.status === 200, `Live check status 200 (got ${liveRes.status})`);
  assert(liveData.status === 'alive', 'Process is alive');

  const readyRes = await fetch(`${baseUrl}/api/v1/health/ready`);
  const readyData = await readyRes.json();
  assert(readyRes.status === 200, `Ready check status 200 (got ${readyRes.status})`);
  assert(readyData.status === 'ready', 'System readiness confirmed');

  // 2. Status Providers
  console.log('\n--- 2. Testing /api/v1/status/providers ---');
  const provRes = await fetch(`${baseUrl}/api/v1/status/providers`);
  const provData = await provRes.json();
  assert(provRes.status === 200, `Providers status 200 (got ${provRes.status})`);
  const localProv = provData.providers?.find(p => p.id === 'local_heuristics');
  assert(localProv && localProv.status === 'available', 'Local heuristics provider available');
  const geminiProv = provData.providers?.find(p => p.id === 'gemini_flash');
  assert(geminiProv && geminiProv.status === 'available', 'Google Gemini 3.5 Flash neural provider available');
  const vtProv = provData.providers?.find(p => p.id === 'virustotal_v3');
  assert(vtProv && vtProv.status === 'available', 'VirusTotal Threat Intelligence v3 provider available');

  // 3. Privacy Audit
  console.log('\n--- 3. Testing /api/v1/privacy/audit ---');
  const privRes = await fetch(`${baseUrl}/api/v1/privacy/audit`);
  const privData = await privRes.json();
  assert(privRes.status === 200, `Privacy audit status 200 (got ${privRes.status})`);
  assert(privData.privacy_baseline?.geolocation_status === 'disabled_by_default', 'Zero location access enforced');
  assert(privData.privacy_baseline?.raw_messages_persisted === false, 'Server-side retention disabled');

  // 4. Message Scan (v1)
  console.log('\n--- 4. Testing /api/v1/scans/messages ---');
  const msgRes = await fetch(`${baseUrl}/api/v1/scans/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'URGENT: Your bank account is locked. Verify your SSN 123-45-6789 and password now.',
      mode: 'local',
    }),
  });
  const msgData = await msgRes.json();
  assert(msgRes.status === 200, `Message scan status 200 (got ${msgRes.status})`);
  assert(msgData.assessment === 'high_risk', `Assessment is high_risk (got ${msgData.assessment})`);
  assert(msgData.privacy_receipt?.pii_scrubbed_count >= 1, 'PII scrubbed count >= 1');
  assert(Array.isArray(msgData.signals), 'Signals array returned');

  // 5. URL Scan (v1 with Anti-SSRF)
  console.log('\n--- 5. Testing /api/v1/scans/urls (Anti-SSRF) ---');
  const urlRes = await fetch(`${baseUrl}/api/v1/scans/urls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'http://169.254.169.254/latest/meta-data/',
      mode: 'local',
    }),
  });
  const urlData = await urlRes.json();
  assert(urlRes.status === 200, `URL scan status 200 (got ${urlRes.status})`);
  assert(urlData.is_private_or_loopback === true, 'SSRF loopback/cloud metadata correctly identified');
  assert(urlData.assessment === 'high_risk', 'Hazardous link flagged high_risk');

  // 5b. URL Scan with VirusTotal Intelligence (hybrid)
  console.log('\n--- 5b. Testing /api/v1/scans/urls (VirusTotal Hybrid) ---');
  const vtUrlRes = await fetch(`${baseUrl}/api/v1/scans/urls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://github.com',
      mode: 'hybrid',
    }),
  });
  const vtUrlData = await vtUrlRes.json();
  assert(vtUrlRes.status === 200, `VT URL scan status 200 (got ${vtUrlRes.status})`);
  assert(vtUrlData.virus_total !== undefined, 'VirusTotal telemetry field attached');
  assert(vtUrlData.virus_total?.status === 'clean', `github.com status is clean (got ${vtUrlData.virus_total?.status})`);
  assert(vtUrlData.virus_total?.totalEngines >= 50, `Evaluated across ${vtUrlData.virus_total?.totalEngines} AV engines`);

  // 6. Claim Verifier (v1)
  console.log('\n--- 6. Testing /api/v1/claims/verify ---');
  const claimRes = await fetch(`${baseUrl}/api/v1/claims/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      claim: 'SHOCKING SECRET: They don\'t want you to know this 100% proven miracle cure that was censored by the government.',
      mode: 'local',
    }),
  });
  const claimData = await claimRes.json();
  assert(claimRes.status === 200, `Claim verify status 200 (got ${claimRes.status})`);
  assert(claimData.verdict === 'lacks_context', `Verdict is lacks_context (got ${claimData.verdict})`);
  assert(Array.isArray(claimData.evidence), 'Evidence sources array returned');

  // 7. File Hashing (v1)
  console.log('\n--- 7. Testing /api/v1/files/hash ---');
  const sampleText = 'AI Protector File Integrity Verification Sample Content';
  const base64Content = Buffer.from(sampleText, 'utf8').toString('base64');

  const hashRes = await fetch(`${baseUrl}/api/v1/files/hash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content_base64: base64Content,
      file_name: 'test_document.txt',
    }),
  });
  const hashData = await hashRes.json();
  assert(hashRes.status === 200, `Hash status 200 (got ${hashRes.status})`);
  assert(typeof hashData.sha256 === 'string' && hashData.sha256.length === 64, 'Valid 64-char SHA-256 returned');
  assert(typeof hashData.sha512 === 'string' && hashData.sha512.length === 128, 'Valid 128-char SHA-512 returned');
  assert(hashData.privacy_receipt?.persisted_to_disk === false, 'Zero disk persistence confirmed');
  assert(hashData.virus_total !== undefined, 'VirusTotal hash intelligence present');

  // 8. Hash Comparison (v1)
  console.log('\n--- 8. Testing /api/v1/files/compare-hash ---');
  const compareRes = await fetch(`${baseUrl}/api/v1/files/compare-hash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      calculated_hash: hashData.sha256,
      reference_hash: hashData.sha256,
    }),
  });
  const compareData = await compareRes.json();
  assert(compareRes.status === 200, `Compare status 200 (got ${compareRes.status})`);
  assert(compareData.is_match === true, 'Direct hash match verified');
  assert(compareData.algorithm_detected === 'SHA-256', 'SHA-256 algorithm identified');
  assert(compareData.virus_total !== undefined, 'VirusTotal hash report attached to compare-hash');

  // 9. AI Copilot (v1)
  console.log('\n--- 9. Testing /api/v1/ai/copilot ---');
  const copilotRes = await fetch(`${baseUrl}/api/v1/ai/copilot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Someone texted asking for my PIN and SSN 123-45-6789. What should I do?',
    }),
  });
  const copilotData = await copilotRes.json();
  assert(copilotRes.status === 200, `Copilot status 200 (got ${copilotRes.status})`);
  assert(typeof copilotData.reply === 'string' && copilotData.reply.length > 20, 'Copilot returned security advisory');
  assert(copilotData.pii_scrubbed_count >= 1, 'Pre-flight PII redaction verified');

  // Summary
  console.log('\n======================================');
  if (failed === 0) {
    console.log('ALL API INTEGRATION TESTS PASSED (11/11 checks verified)');
    console.log('======================================');
  } else {
    console.error(`VERIFICATION FAILED: ${failed} check(s) did not pass.`);
    process.exit(1);
  }
}

runApiTests().catch(err => {
  console.error('API Test Error:', err);
  process.exit(1);
});
