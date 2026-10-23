// AI Protector - Scam, Phishing, & Social Engineering Message Analyzer
// Evaluates suspicious text patterns with PII redaction and deterministic threat heuristics.

import { MessageScanResult, RiskSignal, RiskLevel } from '../types';
import { PrivacyRedactor } from '../privacy/redactor';

export class MessageAnalyzer {
  private static readonly PATTERNS = [
    {
      id: 'urgency_pressure',
      label: 'Artificial Urgency & Coercive Pressure',
      category: 'urgency' as const,
      severity: 'high' as const,
      regex: /\b(urgent(?:ly)?|within (?:24|48|12) hours|suspended? immediately|final notice|immediate action required|act now|account will be terminated|warrant issued|law enforcement)\b/i,
      description: 'Scammers induce panic with artificial deadlines to bypass critical thinking.',
    },
    {
      id: 'credential_harvesting',
      label: 'Credential or Identity Verification Demand',
      category: 'credential_harvesting' as const,
      severity: 'high' as const,
      regex: /\b((?:verify|confirm|validate|enter|provide) (?:the|your)? (?:password|ssn|social security|identity|account|credentials|pin|passcode)|provide (?:the|your)? (?:otp|one-time code|pin)|update (?:your)? (?:billing|payment method|banking info))\b/i,
      description: 'Legitimate financial and tech organizations never request sensitive credentials via unsolicited messages.',
    },
    {
      id: 'unusual_payment',
      label: 'Unusual or Irreversible Payment Request',
      category: 'payment_fraud' as const,
      severity: 'high' as const,
      regex: /\b(wire transfer|cryptocurrency|bitcoin|btc|usdt|gift card|apple card|target card|western union|moneygram|zelle|cashapp)\b/i,
      description: 'Demands for payment via gift cards, wire transfer, or cryptocurrency are hallmark indicators of fraud.',
    },
    {
      id: 'courier_delivery_scam',
      label: 'Courier / Delivery Fee Trap',
      category: 'impersonation' as const,
      severity: 'medium' as const,
      regex: /\b(package (?:pending|held|on hold)|unclaimed (?:parcel|package)|customs (?:fee|duty|charge)|reschedule delivery|delivery fee of \$?\d+)\b/i,
      description: 'Fake postal alerts trick victims into paying nominal fees on fraudulent cloned portals to capture credit cards.',
    },
    {
      id: 'lottery_inheritance',
      label: 'Unsolicited Prize / Inheritance / Grant Claim',
      category: 'payment_fraud' as const,
      severity: 'high' as const,
      regex: /\b(you(?: have)? won|lottery beneficiary|unclaimed inheritance|grant award|selected as the winner|claim your \$?[\d,]+)\b/i,
      description: 'Promises of unexpected lottery winnings or government grants often require an upfront "clearance fee".',
    },
    {
      id: 'remote_access',
      label: 'Remote Desktop / Fake Tech Support Cue',
      category: 'credential_harvesting' as const,
      severity: 'high' as const,
      regex: /\b(anydesk|teamviewer|ultraviewer|quick assist|infected with virus|call (?:microsoft|apple) support|security compromised)\b/i,
      description: 'Attempts to persuade victims to install remote desktop utilities to seize control of their computer.',
    },
  ];

  /**
   * Analyzes an untrusted text message, applying PII redaction and heuristic risk evaluation.
   */
  public static analyze(rawText: string, processingMode: 'local' | 'hybrid' | 'cloud' = 'local'): MessageScanResult {
    // Step 1: Pre-flight PII Redaction
    const redaction = PrivacyRedactor.redact(rawText);
    const textToScan = redaction.redactedText;

    const signals: RiskSignal[] = [];

    // Step 2: Match threat heuristics against redacted text
    for (const pattern of this.PATTERNS) {
      const match = textToScan.match(pattern.regex);
      if (match) {
        signals.push({
          id: pattern.id,
          label: pattern.label,
          category: pattern.category,
          severity: pattern.severity,
          description: pattern.description,
          matchedText: match[0],
        });
      }
    }

    // Step 3: Check for embedded suspicious URLs or shortened links
    const urlMatches = textToScan.match(/https?:\/\/[^\s]+/gi) || [];
    const hasShortener = /\b(bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly|ow\.ly|rb\.gy)\b/i.test(textToScan);
    if (hasShortener) {
      signals.push({
        id: 'shortened_link',
        label: 'Obfuscated URL Shortener Detected',
        category: 'url_hazard',
        severity: 'medium',
        description: 'URL shorteners conceal the true destination domain, commonly used in SMS phishing (smishing).',
      });
    }

    // Determine category
    let category: MessageScanResult['category'] = 'benign';
    if (signals.some(s => s.category === 'credential_harvesting')) {
      category = 'phishing';
    } else if (signals.some(s => s.category === 'payment_fraud')) {
      category = 'financial_scam';
    } else if (signals.some(s => s.category === 'impersonation')) {
      category = 'impersonation';
    } else if (signals.length > 0) {
      category = 'spam';
    }

    // Determine risk level
    let riskLevel: RiskLevel = 'low';
    let summary = 'No common phishing or social engineering patterns detected.';
    let confidenceScore = 0.82;

    const highCount = signals.filter(s => s.severity === 'high').length;
    const medCount = signals.filter(s => s.severity === 'medium').length;

    if (highCount >= 2 || (highCount >= 1 && urlMatches.length > 0)) {
      riskLevel = 'high_risk';
      summary = `High probability of malicious intent. Detected ${highCount} high-severity risk indicator(s) including ${signals[0].label}.`;
      confidenceScore = 0.91;
    } else if (highCount === 1 || medCount > 0) {
      riskLevel = 'suspicious';
      summary = `Suspicious elements flagged. Contains indicators frequently associated with fraudulent or misleading messages.`;
      confidenceScore = 0.78;
    }

    // Determine safe actionable steps
    const safeNextSteps: string[] = [];
    if (riskLevel === 'high_risk') {
      safeNextSteps.push('Do NOT reply, click any embedded links, or call the phone number provided in the message.');
      safeNextSteps.push('If this claims to be from a bank, government agency, or utility, contact them using the official number on their verified website or physical card.');
      safeNextSteps.push('Report this message as spam/phishing to your messaging app or mobile carrier.');
    } else if (riskLevel === 'suspicious') {
      safeNextSteps.push('Verify the identity of the sender independently through a trusted second channel.');
      safeNextSteps.push('Never share one-time passcodes (OTPs), PINs, or account passwords with anyone.');
    } else {
      safeNextSteps.push('Remain vigilant. Even if no automated flags were triggered, exercise caution before sharing sensitive information.');
    }

    return {
      id: `msg-scan-${Date.now()}`,
      timestamp: new Date().toISOString(),
      processingMode,
      riskLevel,
      confidenceScore,
      summary,
      signals,
      category,
      originalLength: rawText.length,
      redactedSnippet: textToScan.slice(0, 200) + (textToScan.length > 200 ? '...' : ''),
      limitations: 'Heuristic text classification identifies structural risk patterns, not sender identity verification. Adversaries continually evolve evasion techniques.',
      safeNextSteps,
      privacyReceipt: {
        processedLocally: processingMode === 'local',
        piiScrubbedCount: redaction.entitiesFound.length,
        networkTransferred: processingMode !== 'local',
      },
    };
  }
}
