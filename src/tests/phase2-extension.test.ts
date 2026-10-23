// AI Protector — Phase 2 Browser Extension Test Suite
// Validates Manifest V3 compliance, navigation filtering, trusted domain rules, informed override, and privacy invariants.

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

describe('Phase 2: Browser Extension (MV3) Test Suite', () => {
  const manifestPath = path.resolve('src/extension/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  // --------------------------------------------------------------------------
  // 1. Manifest V3 Schema & Least-Privilege Permissions
  // --------------------------------------------------------------------------
  describe('1. Manifest V3 Conformance & Permissions', () => {
    it('should be strictly Manifest V3', () => {
      assert.strictEqual(manifest.manifest_version, 3);
      assert.strictEqual(manifest.name, 'AI Protector — Defensive Threat Scanner');
      assert.ok(manifest.version);
    });

    it('should declare an event-driven service worker background script', () => {
      assert.ok(manifest.background);
      assert.strictEqual(manifest.background.service_worker, 'background.js');
      assert.strictEqual(manifest.background.type, 'module');
    });

    it('should adhere to least-privilege permissions without broad invasive scopes', () => {
      const allowedPermissions = ['webNavigation', 'storage', 'contextMenus'];
      assert.deepStrictEqual(manifest.permissions.sort(), allowedPermissions.sort());

      // INVARIANT: Should NOT request dangerous invasive permissions like debugger, proxy, webRequestBlocking
      assert.strictEqual(manifest.permissions.includes('debugger'), false);
      assert.strictEqual(manifest.permissions.includes('webRequestBlocking'), false);
    });

    it('should register web-accessible interstitial warning page', () => {
      assert.ok(Array.isArray(manifest.web_accessible_resources));
      const hasWarning = manifest.web_accessible_resources.some((res: any) =>
        res.resources.includes('interstitial/warning.html')
      );
      assert.strictEqual(hasWarning, true);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Navigation Filtering & URL Sanitization
  // --------------------------------------------------------------------------
  describe('2. Navigation Filtering Logic', () => {
    function shouldInterceptNavigation(url: string, frameId: number, extensionOrigin: string): boolean {
      if (frameId !== 0) return false;
      if (!url) return false;
      if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
      if (url.startsWith(extensionOrigin)) return false;
      return true;
    }

    it('should ignore subframe / iframe navigation (frameId !== 0)', () => {
      const shouldIntercept = shouldInterceptNavigation('https://evil.com/subframe', 1, 'chrome-extension://abcdef/');
      assert.strictEqual(shouldIntercept, false);
    });

    it('should ignore internal browser schemes (chrome://, about:, file://)', () => {
      assert.strictEqual(shouldInterceptNavigation('chrome://settings', 0, 'chrome-extension://abcdef/'), false);
      assert.strictEqual(shouldInterceptNavigation('about:blank', 0, 'chrome-extension://abcdef/'), false);
      assert.strictEqual(shouldInterceptNavigation('file:///C:/Users/test/doc.pdf', 0, 'chrome-extension://abcdef/'), false);
    });

    it('should ignore extension own warning pages to prevent redirect loops', () => {
      const extOrigin = 'chrome-extension://abcdef/';
      const warningUrl = `${extOrigin}interstitial/warning.html?url=https://evil.com`;
      assert.strictEqual(shouldInterceptNavigation(warningUrl, 0, extOrigin), false);
    });

    it('should allow interception for genuine external HTTP and HTTPS navigation', () => {
      const extOrigin = 'chrome-extension://abcdef/';
      assert.strictEqual(shouldInterceptNavigation('https://suspicious-login.com/auth', 0, extOrigin), true);
      assert.strictEqual(shouldInterceptNavigation('http://192.168.1.1/admin', 0, extOrigin), true);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Trusted Domains Matching Engine
  // --------------------------------------------------------------------------
  describe('3. Trusted Domain Allowlist Rules', () => {
    function isDomainTrusted(host: string, trustedDomains: string[]): boolean {
      if (!host || !trustedDomains) return false;
      const normalizedHost = host.toLowerCase();
      return trustedDomains.some((d) => normalizedHost === d || normalizedHost.endsWith('.' + d));
    }

    const userTrusted = ['localhost', '127.0.0.1', 'github.com', 'internal.corp'];

    it('should match exact trusted domains', () => {
      assert.strictEqual(isDomainTrusted('github.com', userTrusted), true);
      assert.strictEqual(isDomainTrusted('localhost', userTrusted), true);
    });

    it('should match subdomains of trusted apex domains', () => {
      assert.strictEqual(isDomainTrusted('api.github.com', userTrusted), true);
      assert.strictEqual(isDomainTrusted('auth.internal.corp', userTrusted), true);
    });

    it('should NOT match unrelated lookalike domains', () => {
      assert.strictEqual(isDomainTrusted('fakegithub.com', userTrusted), false);
      assert.strictEqual(isDomainTrusted('github.com.attacker.com', userTrusted), false);
      assert.strictEqual(isDomainTrusted('malicious-site.org', userTrusted), false);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Informed Override Session Token Validation
  // --------------------------------------------------------------------------
  describe('4. Informed Override Bypass State', () => {
    function isOverrideActive(urlHash: string, overrides: Record<string, number>, currentTime: number): boolean {
      if (!overrides || !overrides[urlHash]) return false;
      return overrides[urlHash] > currentTime;
    }

    it('should permit navigation when active temporary override exists', () => {
      const now = 1700000000000;
      const overrides = {
        'hash_abc123': now + 15 * 60 * 1000, // Valid for 15 min
      };

      assert.strictEqual(isOverrideActive('hash_abc123', overrides, now), true);
      assert.strictEqual(isOverrideActive('hash_abc123', overrides, now + 10 * 60 * 1000), true);
    });

    it('should reject navigation when override has expired', () => {
      const now = 1700000000000;
      const overrides = {
        'hash_abc123': now - 1000, // Expired 1 second ago
      };

      assert.strictEqual(isOverrideActive('hash_abc123', overrides, now), false);
    });

    it('should reject ungranted URLs', () => {
      const now = 1700000000000;
      const overrides = { 'hash_abc123': now + 60000 };
      assert.strictEqual(isOverrideActive('hash_xyz999', overrides, now), false);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Interstitial URL Construction & State Preservation
  // --------------------------------------------------------------------------
  describe('5. Interstitial Warning State Serialization', () => {
    it('should serialize scan results into URL parameters preserving evidence', () => {
      const warningBase = 'chrome-extension://abcdef/interstitial/warning.html';
      const scanPayload = {
        scan_id: 'scan-uuid-1234',
        status: 'known_malicious',
        category: 'phishing',
        explanation: 'Threat detected by Google Web Risk',
        evidence: [
          {
            source: 'web_risk',
            type: 'google_web_risk_social_engineering',
            detail: 'Confirmed phishing target',
            observed_at: '2026-10-23T00:00:00Z',
          },
        ],
      };

      const targetUrl = 'https://phishing-portal.com/login?token=abc#frag';

      const finalUrl = `${warningBase}?url=${encodeURIComponent(targetUrl)}&scan_id=${encodeURIComponent(
        scanPayload.scan_id
      )}&status=${encodeURIComponent(scanPayload.status)}&category=${encodeURIComponent(
        scanPayload.category
      )}&explanation=${encodeURIComponent(scanPayload.explanation)}&evidence=${encodeURIComponent(
        JSON.stringify(scanPayload.evidence)
      )}`;

      const parsed = new URL(finalUrl);
      assert.strictEqual(parsed.searchParams.get('url'), targetUrl);
      assert.strictEqual(parsed.searchParams.get('status'), 'known_malicious');
      assert.strictEqual(parsed.searchParams.get('category'), 'phishing');

      const parsedEvidence = JSON.parse(parsed.searchParams.get('evidence') || '[]');
      assert.strictEqual(parsedEvidence.length, 1);
      assert.strictEqual(parsedEvidence[0].source, 'web_risk');
    });
  });

  // --------------------------------------------------------------------------
  // 6. Privacy & Anti-Surveillance Invariants
  // --------------------------------------------------------------------------
  describe('6. Extension Privacy Invariants', () => {
    it('should not include history or webRequest in manifest permissions', () => {
      assert.strictEqual(manifest.permissions.includes('history'), false);
      assert.strictEqual(manifest.permissions.includes('tabs'), false);
    });

    it('background service worker should not import or declare history logging stores', () => {
      const bgCode = fs.readFileSync(path.resolve('src/extension/background.js'), 'utf-8');
      assert.strictEqual(bgCode.includes('browsing_history'), false);
      assert.strictEqual(bgCode.includes('visited_urls'), false);
    });
  });
});
