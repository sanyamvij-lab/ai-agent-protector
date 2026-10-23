import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PrivacyRedactor } from '../lib/privacy/redactor';
import { UrlInspector } from '../lib/security/url-inspector';
import { MessageAnalyzer } from '../lib/security/message-analyzer';
import { ClaimVerifier } from '../lib/security/claim-verifier';
import { VirusTotalService } from '../lib/security/virustotal-service';
import { MitreMapper } from '../lib/security/mitre-mapper';

describe('AI Protector Security & Privacy Test Suite', () => {
  describe('1. PrivacyRedactor (PII & Secret Scrubbing)', () => {
    it('should scrub email addresses and replace with masked token', () => {
      const input = 'Contact john.doe@bankofamerica.com for account updates';
      const result = PrivacyRedactor.redact(input);
      assert.strictEqual(result.hasSensitiveData, true);
      assert.ok(!result.redactedText.includes('john.doe@bankofamerica.com'));
      assert.ok(result.redactedText.includes('[REDACTED_EMAIL_1]'));
      assert.strictEqual(result.entitiesFound[0].type, 'email');
    });

    it('should scrub social security numbers', () => {
      const input = 'Confirm your SSN 123-45-6789 immediately';
      const result = PrivacyRedactor.redact(input);
      assert.strictEqual(result.hasSensitiveData, true);
      assert.ok(!result.redactedText.includes('123-45-6789'));
      assert.ok(result.redactedText.includes('[REDACTED_SSN_1]'));
    });

    it('should scrub API keys and auth tokens', () => {
      const input = 'Leaked secret key sk-abcdef12345678901234567890 in log';
      const result = PrivacyRedactor.redact(input);
      assert.strictEqual(result.hasSensitiveData, true);
      assert.ok(!result.redactedText.includes('sk-abcdef12345678901234567890'));
      assert.ok(result.redactedText.includes('[REDACTED_API_KEY_1]'));
    });
  });

  describe('2. UrlInspector (Anti-SSRF & Lookalike Detection)', () => {
    it('should flag private IP ranges as High-Risk SSRF hazards', () => {
      const privateIps = [
        'http://127.0.0.1/admin',
        'http://10.0.0.5:8080/metrics',
        'http://192.168.1.1/router-login',
        'http://169.254.169.254/latest/meta-data/',
        'http://localhost:3000/api',
      ];

      for (const url of privateIps) {
        const result = UrlInspector.inspect(url, 'local');
        assert.strictEqual(result.isPrivateOrLoopback, true);
        assert.strictEqual(result.riskLevel, 'high_risk');
        assert.ok(result.signals.some((s) => s.id === 'ssrf_private_network'));
      }
    });

    it('should detect brand typosquatting targeting major institutions', () => {
      const typosquats = [
        'http://paypa1-update.com/login',
        'http://app1e-support-icloud.net',
        'http://chase-security-verify.org',
      ];

      for (const url of typosquats) {
        const result = UrlInspector.inspect(url, 'local');
        assert.strictEqual(result.isTyposquatting, true);
        assert.ok(result.targetBrandMatched);
        assert.strictEqual(result.riskLevel, 'high_risk');
      }
    });

    it('should mark legitimate secure sites as low risk', () => {
      const result = UrlInspector.inspect('https://www.apple.com/shop', 'local');
      assert.strictEqual(result.riskLevel, 'low');
      assert.strictEqual(result.isHttps, true);
      assert.strictEqual(result.isPrivateOrLoopback, false);
      assert.strictEqual(result.isTyposquatting, false);
    });
  });

  describe('3. MessageAnalyzer (Scam & Phishing Heuristics)', () => {
    it('should detect urgency pressure and credential harvesting in phishing SMS', () => {
      const scamMsg = 'URGENT: Your account has been suspended! Verify your password and SSN 123-45-6789 immediately within 24 hours at http://192.168.1.1';
      const result = MessageAnalyzer.analyze(scamMsg, 'local');
      assert.strictEqual(result.riskLevel, 'high_risk');
      assert.strictEqual(result.category, 'phishing');
      assert.ok(result.signals.some((s) => s.id === 'urgency_pressure'));
      assert.ok(result.signals.some((s) => s.id === 'credential_harvesting'));
      assert.ok(result.privacyReceipt.piiScrubbedCount > 0);
    });

    it('should classify benign business communications as low risk', () => {
      const benign = 'Hi team, the sprint retro is scheduled for tomorrow at 2 PM. Please update your tickets before the meeting.';
      const result = MessageAnalyzer.analyze(benign, 'local');
      assert.strictEqual(result.riskLevel, 'low');
      assert.strictEqual(result.category, 'benign');
      assert.strictEqual(result.signals.length, 0);
    });
  });

  describe('4. ClaimVerifier (Misinformation Triage)', () => {
    it('should flag sensational conspiracy language and identify factual claims', () => {
      const sensational = 'SHOCKING SECRET: Doctors don\'t want you to know this 100% proven miracle cure that was censored by the government.';
      const result = ClaimVerifier.verify(sensational, 'local');
      assert.ok(result.signals.some((s) => s.id === 'sensational_framing'));
      assert.strictEqual(result.verdict, 'lacks_context');
      assert.ok(result.verificationGuidance.length > 0);
    });
  });

  describe('5. VirusTotalService (Global AV & Threat Intel)', () => {
    it('should safely refuse private or loopback domains', async () => {
      const res = await VirusTotalService.checkDomain('127.0.0.1');
      assert.strictEqual(res, null);
      const resLocal = await VirusTotalService.checkDomain('localhost');
      assert.strictEqual(resLocal, null);
    });

    it('should validate SHA-256 formatting before querying', async () => {
      const invalidHash = await VirusTotalService.checkFileHash('not_a_hex_hash');
      assert.strictEqual(invalidHash, null);
      const shortHash = await VirusTotalService.checkFileHash('1234abcd');
      assert.strictEqual(shortHash, null);
    });
  });

  describe('6. AI Security Copilot Strictness & Threat Forensic Feed', () => {
    it('should accurately flag brand typosquatting links in chat messages', () => {
      const chatWithTyposquat = 'Hey, can you check if this login portal is safe? http://paypa1-security-update.com/login';
      const urlResult = UrlInspector.inspect('http://paypa1-security-update.com/login', 'cloud');
      assert.strictEqual(urlResult.isTyposquatting, true);
      assert.strictEqual(urlResult.riskLevel, 'high_risk');
      assert.strictEqual(urlResult.targetBrandMatched, 'PayPal');
    });

    it('should block SSRF and cloud metadata endpoints in chat inquiries', () => {
      const ssrfUrl = 'http://169.254.169.254/latest/meta-data/';
      const urlResult = UrlInspector.inspect(ssrfUrl, 'cloud');
      assert.strictEqual(urlResult.isPrivateOrLoopback, true);
      assert.strictEqual(urlResult.riskLevel, 'high_risk');
    });

    it('should detect urgency pressure and credential theft in smishing/phishing chat queries', () => {
      const smishingQuery = 'I received: "URGENT: Your Wells Fargo account is suspended. Confirm your password and SSN 123-45-6789 within 24 hours"';
      const scrubbed = PrivacyRedactor.redact(smishingQuery);
      assert.ok(scrubbed.hasSensitiveData);
      assert.ok(scrubbed.redactedText.includes('[REDACTED_SSN_1]'));

      const msgResult = MessageAnalyzer.analyze(scrubbed.redactedText, 'cloud');
      assert.strictEqual(msgResult.riskLevel, 'high_risk');
      assert.ok(msgResult.signals.some((s) => s.id === 'urgency_pressure'));
      assert.ok(msgResult.signals.some((s) => s.id === 'credential_harvesting'));
    });
  });

  describe('7. MitreMapper & Threat Score Engine', () => {
    it('should map signals to official MITRE ATT&CK techniques', () => {
      const signals = [
        { id: 'urgency_pressure', label: 'Urgency', category: 'urgency' as const, severity: 'high' as const, description: 'Test' },
        { id: 'credential_harvesting', label: 'Harvesting', category: 'credential_harvesting' as const, severity: 'critical' as const, description: 'Test' },
      ];
      const techniques = MitreMapper.mapSignals(signals as any, { isTyposquatting: true });
      assert.ok(techniques.some((t) => t.id === 'T1566.002'));
      assert.ok(techniques.some((t) => t.id === 'T1598.003'));
      assert.ok(techniques.some((t) => t.id === 'T1583.001'));
    });

    it('should calculate composite threat score >= 80 for critical phishing attack', () => {
      const signals = [
        { id: 'urgency_pressure', label: 'Urgency', category: 'urgency' as const, severity: 'high' as const, description: 'Test' },
        { id: 'credential_harvesting', label: 'Harvesting', category: 'credential_harvesting' as const, severity: 'critical' as const, description: 'Test' },
      ];
      const score = MitreMapper.calculateThreatScore('high_risk', signals as any, { isTyposquatting: true });
      assert.ok(score.compositeScore >= 80);
      assert.strictEqual(score.severityTier, 'critical');
      assert.ok(score.deceptionIndex >= 50);
      assert.ok(score.infrastructureHazard >= 50);
    });

    it('should generate valid HTML Incident Dossier with cryptographic seal', () => {
      const dossierHtml = MitreMapper.generateDossierHtml({
        incidentId: 'INC-2026-TEST-001',
        timestamp: '2026-10-23T00:00:00Z',
        type: 'message',
        inputSummary: 'Phishing attack detected',
        threatScore: {
          compositeScore: 92,
          severityTier: 'critical',
          deceptionIndex: 90,
          infrastructureHazard: 85,
          exploitationRisk: 95,
        },
        mitreTechniques: [
          {
            id: 'T1566.002',
            name: 'Spearphishing Link',
            tactic: 'Initial Access',
            tacticId: 'TA0001',
            description: 'Test',
            url: 'https://attack.mitre.org',
            severity: 'high',
          },
        ],
        signals: [],
        piiScrubbedCount: 2,
        safeNextSteps: ['Do not click link', 'Rotate credentials'],
        sha256AuditProof: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      });

      assert.ok(dossierHtml.includes('INC-2026-TEST-001'));
      assert.ok(dossierHtml.includes('T1566.002'));
      assert.ok(dossierHtml.includes('CRITICAL RISK'));
      assert.ok(dossierHtml.includes('abcdef1234567890'));
    });
  });
});
