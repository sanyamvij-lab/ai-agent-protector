import { describe, it } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';
import { NextRequest } from 'next/server';
import { AuthService, AuthUser } from '../lib/auth/auth-service';
import { UrlInspector } from '../lib/security/url-inspector';
import { PrivacyRedactor } from '../lib/privacy/redactor';
import { AiGateway } from '../lib/gateway/ai-gateway';

describe('AI Monitor Security Audit & Remediation Regression Suite (v2)', () => {
  // AIM-001: JWT Verification & Broken Authentication Defense
  describe('AIM-001: Cryptographic JWT Signature Verification & Anti-Tamper', () => {
    const testSecret = 'ai-protector-dev-secret-replace-in-production-min-32-chars';

    function createSignedJwt(payload: Record<string, unknown>, secret: string): string {
      const header = { alg: 'HS256', typ: 'JWT' };
      const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const data = `${encodedHeader}.${encodedPayload}`;
      const signature = crypto.createHmac('sha256', secret).update(data).digest('base64url');
      return `${data}.${signature}`;
    }

    it('should REJECT an unsigned forged JWT (alg: none)', () => {
      // Attacker craft: unsigned header + payload with admin role
      const forgedHeader = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const forgedPayload = Buffer.from(JSON.stringify({ sub: 'attacker', email: 'attacker@evil.com', role: 'admin' })).toString('base64url');
      const forgedJwt = `${forgedHeader}.${forgedPayload}.`;

      const req = new NextRequest('http://localhost:3000/api/v1/scans', {
        headers: { authorization: `Bearer ${forgedJwt}` },
      });

      const user = AuthService.authenticateRequest(req);
      assert.strictEqual(user, null, 'Unsigned alg:none JWT must be rejected');
    });

    it('should REJECT a JWT with a forged or invalid signature', () => {
      const payload = { sub: 'attacker', email: 'attacker@evil.com', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 };
      const invalidSecretJwt = createSignedJwt(payload, 'wrong-secret-key-123456789012345');

      const req = new NextRequest('http://localhost:3000/api/v1/scans', {
        headers: { authorization: `Bearer ${invalidSecretJwt}` },
      });

      const user = AuthService.authenticateRequest(req);
      assert.strictEqual(user, null, 'JWT with invalid signature must be rejected');
    });

    it('should REJECT an expired JWT token (exp in past)', () => {
      const expiredPayload = {
        sub: 'user_expired',
        email: 'expired@example.com',
        role: 'user',
        exp: Math.floor(Date.now() / 1000) - 100, // Expired 100 seconds ago
      };
      const expiredJwt = createSignedJwt(expiredPayload, testSecret);

      const req = new NextRequest('http://localhost:3000/api/v1/scans', {
        headers: { authorization: `Bearer ${expiredJwt}` },
      });

      const user = AuthService.authenticateRequest(req);
      assert.strictEqual(user, null, 'Expired JWT must be rejected');
    });

    it('should ACCEPT a valid, signed JWT with valid expiration and claims', () => {
      const validPayload = {
        sub: 'user_valid_001',
        email: 'alice@example.com',
        role: 'analyst',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iss: 'ai-protector',
      };
      const validJwt = createSignedJwt(validPayload, testSecret);

      const req = new NextRequest('http://localhost:3000/api/v1/scans', {
        headers: { authorization: `Bearer ${validJwt}` },
      });

      const user = AuthService.authenticateRequest(req);
      assert.ok(user !== null, 'Valid signed JWT must be accepted');
      assert.strictEqual(user?.id, 'user_valid_001');
      assert.strictEqual(user?.role, 'analyst');
    });
  });

  // AIM-002: Advanced SSRF & IP Encoding Bypasses
  describe('AIM-002: Advanced SSRF IP Encoding & Range Validation', () => {
    it('should detect decimal integer IP encoding for loopback (http://2130706433)', () => {
      // 2130706433 = 127.0.0.1
      const isBlocked = UrlInspector.isPrivateOrLoopbackHost('2130706433');
      assert.strictEqual(isBlocked, true, 'Decimal representation of 127.0.0.1 must be blocked');
    });

    it('should detect hex IP encoding for loopback (0x7f000001)', () => {
      const isBlocked = UrlInspector.isPrivateOrLoopbackHost('0x7f000001');
      assert.strictEqual(isBlocked, true, 'Hex representation of 127.0.0.1 must be blocked');
    });

    it('should detect octal IP encoding for loopback (0177.0.0.1)', () => {
      const isBlocked = UrlInspector.isPrivateOrLoopbackHost('0177.0.0.1');
      assert.strictEqual(isBlocked, true, 'Octal representation of 127.0.0.1 must be blocked');
    });

    it('should detect IPv4-mapped IPv6 loopback addresses (::ffff:127.0.0.1 / ::ffff:7f00:1)', () => {
      assert.strictEqual(UrlInspector.isPrivateOrLoopbackHost('::ffff:127.0.0.1'), true);
      assert.strictEqual(UrlInspector.isPrivateOrLoopbackHost('::ffff:7f00:1'), true);
    });

    it('should detect Carrier-Grade NAT (CGNAT) 100.64.0.0/10 address space', () => {
      assert.strictEqual(UrlInspector.isPrivateOrLoopbackHost('100.64.0.1'), true);
      assert.strictEqual(UrlInspector.isPrivateOrLoopbackHost('100.127.255.254'), true);
    });

    it('should detect cloud metadata endpoint 169.254.169.254 in decimal/standard forms', () => {
      assert.strictEqual(UrlInspector.isPrivateOrLoopbackHost('169.254.169.254'), true);
      // Decimal for 169.254.169.254 = 2852039166
      assert.strictEqual(UrlInspector.isPrivateOrLoopbackHost('2852039166'), true);
    });

    it('should allow legitimate public hosts and domains', () => {
      assert.strictEqual(UrlInspector.isPrivateOrLoopbackHost('8.8.8.8'), false);
      assert.strictEqual(UrlInspector.isPrivateOrLoopbackHost('1.1.1.1'), false);
      assert.strictEqual(UrlInspector.isPrivateOrLoopbackHost('google.com'), false);
      assert.strictEqual(UrlInspector.isPrivateOrLoopbackHost('github.com'), false);
    });
  });

  // AIM-004: Indian Aadhaar, PAN, and UPI Redaction
  describe('AIM-004: India DPDP Sensitive Identifiers Redaction (Aadhaar, PAN, UPI)', () => {
    it('should scrub 12-digit Indian Aadhaar numbers formatted with spaces or hyphens', () => {
      const text = 'Citizen Aadhaar number is 2345 6789 0123 for verification';
      const res = PrivacyRedactor.redact(text);
      assert.strictEqual(res.hasSensitiveData, true);
      assert.ok(!res.redactedText.includes('2345 6789 0123'));
      assert.ok(res.redactedText.includes('[REDACTED_AADHAAR_1]'));
    });

    it('should scrub Indian Permanent Account Number (PAN) cards (5 letters + 4 digits + 1 letter)', () => {
      const text = 'Taxpayer PAN card number: ABCDE1234F is registered';
      const res = PrivacyRedactor.redact(text);
      assert.strictEqual(res.hasSensitiveData, true);
      assert.ok(!res.redactedText.includes('ABCDE1234F'));
      assert.ok(res.redactedText.includes('[REDACTED_PAN_1]'));
    });

    it('should scrub UPI Virtual Payment Addresses (VPAs)', () => {
      const text = 'Please send refund to merchant@okhdfcbank or user@upi immediately';
      const res = PrivacyRedactor.redact(text);
      assert.strictEqual(res.hasSensitiveData, true);
      assert.ok(!res.redactedText.includes('merchant@okhdfcbank'));
      assert.ok(res.redactedText.includes('[REDACTED_UPI_ID_1]'));
    });
  });

  // AIM-005: Model Risk Level Override Invariant
  describe('AIM-005: Model Output Authority Restriction (Cannot Lower Deterministic Risk)', () => {
    it('should ensure model output can NEVER lower a high_risk deterministic finding', () => {
      // Test the helper calculation directly:
      // If base heuristic is high_risk, and model suggests 'low', final risk must remain 'high_risk'
      const baseRisk = 'high_risk';
      const modelSuggestion = 'low';

      const combinedRisk = AiGateway.reconcileRiskLevel(baseRisk, modelSuggestion);
      assert.strictEqual(combinedRisk, 'high_risk', 'Model must not downgrade high_risk to low');
    });

    it('should ensure model output can raise a low risk finding to suspicious or high_risk when new signals found', () => {
      const baseRisk = 'low';
      const modelSuggestion = 'high_risk';

      const combinedRisk = AiGateway.reconcileRiskLevel(baseRisk, modelSuggestion);
      assert.strictEqual(combinedRisk, 'high_risk', 'Model may raise risk when substantiated');
    });
  });

  // AIM-006: Constant-Time Hash Comparison
  describe('AIM-006: Constant-Time Cryptographic Comparison', () => {
    it('should safely compare equal hashes using timing-safe buffer comparison', () => {
      const hashA = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8';
      const hashB = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8';
      const isMatch = AuthService.constantTimeEqual(hashA, hashB);
      assert.strictEqual(isMatch, true);
    });

    it('should safely compare unequal hashes of same and different lengths', () => {
      const hashA = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8';
      const hashB = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d9';
      const isMatch = AuthService.constantTimeEqual(hashA, hashB);
      assert.strictEqual(isMatch, false);

      const isMatchDifferentLength = AuthService.constantTimeEqual('abc', 'abcdef');
      assert.strictEqual(isMatchDifferentLength, false);
    });
  });

  // AIM-003: Defensive Security Headers & Middleware Enforcement
  describe('AIM-003: Defensive HTTP Security Headers Enforcement', () => {
    it('should attach strict CSP, HSTS, frame-ancestors, and nosniff headers on requests', async () => {
      const { middleware } = await import('../middleware');
      const req = new NextRequest('http://localhost:3000/api/v1/health');
      const res = middleware(req);

      assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
      assert.strictEqual(res.headers.get('x-frame-options'), 'DENY');
      assert.ok(res.headers.get('strict-transport-security')?.includes('max-age=63072000'));
      assert.ok(res.headers.get('content-security-policy')?.includes("frame-ancestors 'none'"));
      assert.ok(res.headers.get('permissions-policy')?.includes('camera=()'));
    });
  });
});

