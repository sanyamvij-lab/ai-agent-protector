// AI Protector — Phase 1 Link-Scanner Test Suite
// Verifies Section 7.6 requirements: Normalization, Heuristics, Status Rules, Providers, Auth, Logging, Secrets.

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { UrlNormalizer } from '../lib/security/url-normalizer';
import { UrlHeuristics } from '../lib/security/url-heuristics';
import { WebRiskProvider, ProviderResult } from '../lib/security/providers/webrisk-provider';
import { UrlScanCache } from '../lib/security/url-scan-cache';
import { UrlDecisionEngine, ScanResultContract } from '../lib/security/url-decision-engine';
import { AuthService, TEST_USERS } from '../lib/auth/auth-service';
import { Database } from '../lib/db/database';
import { UrlSafeLogger } from '../lib/observability/url-safe-logger';
import { RateLimiter } from '../lib/security/rate-limiter';

describe('Phase 1: Link-Scanner Vertical Slice Test Suite', () => {
  beforeEach(() => {
    UrlScanCache.clear();
    Database.reset();
    RateLimiter.reset();
  });

  // --------------------------------------------------------------------------
  // 1. URL Normalization & Scheme/Length Validation
  // --------------------------------------------------------------------------
  describe('1. URL Normalizer & Input Sanitizer', () => {
    it('should normalize valid HTTP and HTTPS URLs', () => {
      const res = UrlNormalizer.normalize('https://Example.COM:443/path/index.html');
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.host, 'example.com');
      assert.strictEqual(res.hasCredentials, false);
      assert.strictEqual(res.urlHash.length, 64); // SHA-256 hex string
    });

    it('should reject malformed or non-http/https protocols', () => {
      const javascriptUrl = UrlNormalizer.normalize('javascript:alert(1)');
      assert.strictEqual(javascriptUrl.valid, false);
      assert.ok(javascriptUrl.error?.includes('Unsupported URL protocol'));

      const dataUrl = UrlNormalizer.normalize('data:text/html,<script>alert(1)</script>');
      assert.strictEqual(dataUrl.valid, false);

      const fileUrl = UrlNormalizer.normalize('file:///etc/passwd');
      assert.strictEqual(fileUrl.valid, false);

      const malformed = UrlNormalizer.normalize('not a url at all %%%');
      assert.strictEqual(malformed.valid, false);
    });

    it('should reject URLs exceeding 2048 characters', () => {
      const longPath = 'a'.repeat(2100);
      const res = UrlNormalizer.normalize(`https://example.com/${longPath}`);
      assert.strictEqual(res.valid, false);
      assert.ok(res.error?.includes('exceeds maximum supported length'));
    });

    it('should strip embedded credentials and fragments before processing', () => {
      const res = UrlNormalizer.normalize('https://admin:superSecretPass123@secure-portal.com/login#access-token');
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.hasCredentials, true);
      assert.strictEqual(res.normalizedUrl, 'https://secure-portal.com/login');
      assert.ok(!res.normalizedUrl.includes('superSecretPass123'));
      assert.ok(!res.normalizedUrl.includes('#access-token'));
    });
  });

  // --------------------------------------------------------------------------
  // 2. Deterministic Heuristics
  // --------------------------------------------------------------------------
  describe('2. Deterministic Heuristic Engine', () => {
    it('should detect embedded credentials as a heuristic flag', () => {
      const normalized = UrlNormalizer.normalize('https://victim:password@phish-domain.com/login');
      const evidence = UrlHeuristics.evaluate(normalized);
      const credFlag = evidence.find((e) => e.type === 'credentials_in_url');
      assert.ok(credFlag, 'Expected credentials_in_url heuristic');
      assert.strictEqual(credFlag.source, 'heuristic');
    });

    it('should detect numeric IP literal hosts (IPv4 & IPv6)', () => {
      const normalizedIpv4 = UrlNormalizer.normalize('http://192.168.1.50/malware.exe');
      const evidenceIpv4 = UrlHeuristics.evaluate(normalizedIpv4);
      assert.ok(evidenceIpv4.some((e) => e.type === 'ip_literal_host'));

      const normalizedLoopback = UrlNormalizer.normalize('http://127.0.0.1:8080/admin');
      const evidenceLoopback = UrlHeuristics.evaluate(normalizedLoopback);
      assert.ok(evidenceLoopback.some((e) => e.type === 'ip_literal_host'));
    });

    it('should detect punycode and homograph lookalike domains', () => {
      const normalized = UrlNormalizer.normalize('https://xn--pple-43d.com/login'); // Apple lookalike
      const evidence = UrlHeuristics.evaluate(normalized);
      assert.ok(evidence.some((e) => e.type === 'punycode_lookalike'));
    });

    it('should detect excessive subdomain nesting (> 3 levels)', () => {
      const normalized = UrlNormalizer.normalize('https://secure.login.account.verify.evil-host.com/update');
      const evidence = UrlHeuristics.evaluate(normalized);
      assert.ok(evidence.some((e) => e.type === 'excessive_subdomains'));
    });

    it('should detect deceptive brand-in-subdomain patterns', () => {
      const normalized = UrlNormalizer.normalize('https://paypal.com.account-verification-notice.xyz/login');
      const evidence = UrlHeuristics.evaluate(normalized);
      const brandFlag = evidence.find((e) => e.type === 'brand_in_subdomain');
      assert.ok(brandFlag, 'Expected brand_in_subdomain heuristic');
      assert.ok(brandFlag.detail.includes('PayPal'));
    });

    it('should produce zero heuristic flags for clean, legitimate domains', () => {
      const normalized = UrlNormalizer.normalize('https://www.paypal.com/signin');
      const evidence = UrlHeuristics.evaluate(normalized);
      assert.strictEqual(evidence.length, 0);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Section 5 Status Rules & Decision Engine
  // --------------------------------------------------------------------------
  describe('3. Decision Engine & Section 5 Contract Compliance', () => {
    const cleanUrl = UrlNormalizer.normalize('https://example.com/clean');

    it('Rule 1: known_malicious when provider reports threat match', () => {
      const mockProvider: ProviderResult = {
        provider: 'google_web_risk',
        state: 'ok',
        latency_ms: 120,
        threatMatch: {
          threatType: 'SOCIAL_ENGINEERING',
        },
      };

      const result = UrlDecisionEngine.evaluate(cleanUrl, [], mockProvider);
      assert.strictEqual(result.target_type, 'url');
      assert.strictEqual(result.status, 'known_malicious');
      assert.strictEqual(result.category, 'phishing');
      assert.strictEqual(result.posture, null);
      assert.ok(result.evidence.some((e) => e.source === 'web_risk'));
      assert.strictEqual(result.evidence[0].engine_version, '1.0.0');
      assert.strictEqual(result.evidence[0].ruleset_id, 'google-webrisk-v1');
      assert.ok(result.explanation.includes('Confirmed security hazard'));
      assert.ok(result.recommended_action.includes('Do not click'));
    });

    it('Rule 2: suspicious when no provider match, but heuristics flag specific evidence', () => {
      const mockProviderOk: ProviderResult = {
        provider: 'google_web_risk',
        state: 'ok',
        latency_ms: 150,
      };

      const heuristics = [
        {
          source: 'heuristic' as const,
          type: 'brand_in_subdomain',
          detail: 'Host contains Chase Bank in subdomain of unverified apex domain.',
          observed_at: new Date().toISOString(),
        },
      ];

      const result = UrlDecisionEngine.evaluate(cleanUrl, heuristics, mockProviderOk);
      assert.strictEqual(result.status, 'suspicious');
      assert.strictEqual(result.category, 'phishing');
      assert.strictEqual(result.evidence.length, 1);
      assert.ok(result.explanation.includes('Specific, explainable risk signals detected'));
    });

    it('Rule 3: no_known_threat when provider OK (no match) AND zero heuristics', () => {
      const mockProviderOk: ProviderResult = {
        provider: 'google_web_risk',
        state: 'ok',
        latency_ms: 95,
      };

      const result = UrlDecisionEngine.evaluate(cleanUrl, [], mockProviderOk);
      assert.strictEqual(result.status, 'no_known_threat');
      assert.strictEqual(result.category, 'none');
      assert.strictEqual(result.evidence.length, 0);
      assert.ok(result.limitations.some((lim) => lim.includes('No known threat detected is not a guarantee of safety')));
    });

    it('Rule 4: unavailable when provider is not configured (NEVER default to safe)', () => {
      const mockNotConfigured: ProviderResult = {
        provider: 'google_web_risk',
        state: 'not_configured',
        latency_ms: 0,
      };

      const result = UrlDecisionEngine.evaluate(cleanUrl, [], mockNotConfigured);
      assert.strictEqual(result.status, 'unavailable');
      assert.strictEqual(result.category, 'unknown');
      assert.notStrictEqual(result.status, 'no_known_threat');
      assert.ok(result.explanation.includes('not configured'));
    });

    it('Rule 5: unavailable when provider times out after 3000ms', () => {
      const mockTimeout: ProviderResult = {
        provider: 'google_web_risk',
        state: 'timeout',
        latency_ms: 3001,
      };

      const result = UrlDecisionEngine.evaluate(cleanUrl, [], mockTimeout);
      assert.strictEqual(result.status, 'unavailable');
      assert.ok(result.explanation.includes('timed out'));
    });

    it('Rule 6: unavailable when provider quota is exhausted', () => {
      const mockQuota: ProviderResult = {
        provider: 'google_web_risk',
        state: 'quota',
        latency_ms: 45,
      };

      const result = UrlDecisionEngine.evaluate(cleanUrl, [], mockQuota);
      assert.strictEqual(result.status, 'unavailable');
      assert.ok(result.explanation.includes('quota limit exceeded'));
    });
  });

  // --------------------------------------------------------------------------
  // 4. Cache Behavior & Invariant Check
  // --------------------------------------------------------------------------
  describe('4. Short-Lived Scan Cache', () => {
    it('should cache and retrieve valid scan results', () => {
      const cleanUrl = UrlNormalizer.normalize('https://test-cache.example.com');
      const mockResult: ScanResultContract = {
        scan_id: 'scan_cache_123',
        target_type: 'url',
        status: 'no_known_threat',
        category: 'none',
        evidence: [],
        provider_status: [{ provider: 'google_web_risk', state: 'ok', latency_ms: 50 }],
        explanation: 'Clean test',
        recommended_action: 'Proceed',
        limitations: ['Not a guarantee'],
        scanned_at: new Date().toISOString(),
      };

      UrlScanCache.set(cleanUrl.urlHash, mockResult);
      const cached = UrlScanCache.get(cleanUrl.urlHash);
      assert.ok(cached);
      assert.strictEqual(cached?.scan_id, 'scan_cache_123');
    });

    it('INVARIANT: should NEVER cache "unavailable" status', () => {
      const unavailResult: ScanResultContract = {
        scan_id: 'scan_unavail_456',
        target_type: 'url',
        status: 'unavailable',
        category: 'unknown',
        evidence: [],
        provider_status: [{ provider: 'google_web_risk', state: 'not_configured', latency_ms: 0 }],
        explanation: 'Provider unconfigured',
        recommended_action: 'Retry',
        limitations: [],
        scanned_at: new Date().toISOString(),
      };

      UrlScanCache.set('hash_unavail_test', unavailResult);
      const cached = UrlScanCache.get('hash_unavail_test');
      assert.strictEqual(cached, null, 'Cache must not store unavailable results');
    });
  });

  // --------------------------------------------------------------------------
  // 5. AuthN & User Isolation (Anti-Probing Defense)
  // --------------------------------------------------------------------------
  describe('5. AuthN, AuthZ, and Anti-Probing Isolation', async () => {
    it('should verify test user authentication tokens', () => {
      const mockReqA = {
        headers: new Headers({
          authorization: 'Bearer test-token-user-a',
        }),
      } as any;

      const userA = AuthService.authenticateRequest(mockReqA);
      assert.ok(userA);
      assert.strictEqual(userA.id, 'user_001_alice');
      assert.strictEqual(userA.role, 'user');

      const mockReqInvalid = {
        headers: new Headers({
          authorization: 'Bearer fake-invalid-token',
        }),
      } as any;

      const invalidUser = AuthService.authenticateRequest(mockReqInvalid);
      assert.strictEqual(invalidUser, null);
    });

    it('should isolate scans: User A cannot read User B scans (Returns 404)', async () => {
      const scanId = 'scan_isolated_alice_01';

      // Alice stores a scan
      await Database.saveScan({
        scan_id: scanId,
        user_id: 'user_001_alice',
        target_type: 'url',
        host: 'alice-scanned.com',
        url_hash: 'hash_alice_123',
        status: 'no_known_threat',
        category: 'none',
        evidence: [],
        provider_status: [{ provider: 'google_web_risk', state: 'ok', latency_ms: 40 }],
        explanation: 'Alice scan',
        recommended_action: 'None',
        limitations: [],
        created_at: new Date().toISOString(),
      });

      // Alice can read her own scan
      const aliceRead = await Database.getScanById(scanId, 'user_001_alice');
      assert.ok(aliceRead);
      assert.strictEqual(aliceRead.scan_id, scanId);

      // Bob attempts to read Alice's scan ID
      const bobRead = await Database.getScanById(scanId, 'user_002_bob');
      assert.strictEqual(bobRead, null, 'Must return null (mapped to 404) for unauthorized caller');
    });

    it('should accept false positive reporting for scan owners', async () => {
      const scanId = 'scan_fp_test_01';
      await Database.saveScan({
        scan_id: scanId,
        user_id: 'user_001_alice',
        target_type: 'url',
        host: 'internal-tool.company.com',
        url_hash: 'hash_fp_123',
        status: 'suspicious',
        category: 'impersonation',
        evidence: [],
        provider_status: [{ provider: 'google_web_risk', state: 'ok', latency_ms: 30 }],
        explanation: 'Suspicious test',
        recommended_action: 'Verify',
        limitations: [],
        created_at: new Date().toISOString(),
      });

      const reported = await Database.reportFalsePositive(
        scanId,
        'user_001_alice',
        'This is our verified internal staging environment.'
      );
      assert.strictEqual(reported, true);

      // Bob cannot report false positive on Alice's scan
      const unauthorizedReport = await Database.reportFalsePositive(
        scanId,
        'user_002_bob',
        'Should be denied'
      );
      assert.strictEqual(unauthorizedReport, false);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Logging Redaction & Secret Safety
  // --------------------------------------------------------------------------
  describe('6. Privacy-Safe Logging Redaction', () => {
    it('should sanitize raw URLs in logs to host + sha256 hash only', () => {
      const rawUrl = 'https://admin:superSecret@mybank.com/transfer?account=987654&token=sec_abc123';
      const sanitized = UrlSafeLogger.sanitizeUrlForLogging(rawUrl);

      assert.strictEqual(sanitized.host, 'mybank.com');
      assert.ok(!sanitized.url_hash.includes('superSecret'));
      assert.ok(!sanitized.url_hash.includes('987654'));
      assert.strictEqual(sanitized.url_hash.length, 64);
    });
  });

  // --------------------------------------------------------------------------
  // 7. Rate Limiter Checks
  // --------------------------------------------------------------------------
  describe('7. Sliding Window Rate Limiter', () => {
    it('should allow requests within quota and throttle when limit is reached', () => {
      const testKey = 'test_user_rl';
      const limit = 5;

      for (let i = 0; i < limit; i++) {
        const check = RateLimiter.check(testKey, limit, 60000);
        assert.strictEqual(check.allowed, true);
      }

      const blockedCheck = RateLimiter.check(testKey, limit, 60000);
      assert.strictEqual(blockedCheck.allowed, false);
      assert.strictEqual(blockedCheck.remaining, 0);
      assert.ok(blockedCheck.resetMs > 0);
    });
  });
});
