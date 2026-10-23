// AI Protector - PII Redaction & Data Sanitization Engine
// Guarantees sensitive personal and secret information is masked before reaching any analysis pipeline.

import { DetectedEntity, RedactionResult } from '../types';

export class PrivacyRedactor {
  private static readonly EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;
  private static readonly PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  private static readonly CREDIT_CARD_REGEX = /\b(?:\d{4}[- ]?){3}\d{4}\b|\b\d{15,16}\b/g;
  private static readonly SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b/g;
  private static readonly AADHAAR_REGEX = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
  private static readonly PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g;
  private static readonly UPI_REGEX = /\b[a-zA-Z0-9.\-_]{2,}@(?:okhdfcbank|okaxis|oksbi|paytm|upi|ybl|apl|axl|ibl|barodampay|waaxis|idfcbank|federal|kotak|allbank|postbank|sbi|pnb)\b/gi;
  private static readonly API_KEY_REGEX = /\b(?:sk-[a-zA-Z0-9]{20,}|AIza[0-9A-Za-z-_]{35}|ghp_[a-zA-Z0-9]{36}|key-[a-zA-Z0-9]{24,})\b/g;
  private static readonly JWT_REGEX = /\beyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*\b/g;
  private static readonly PASSWORD_REGEX = /\b(?:password|passwd|pwd|secret)\s*[:=]\s*['"]?([^\s'"]+)['"]?/gi;

  /**
   * Scans text for PII and secrets, replacing them with type-safe anonymized tokens.
   */
  public static redact(inputText: string): RedactionResult {
    if (!inputText || typeof inputText !== 'string') {
      return { redactedText: '', entitiesFound: [], hasSensitiveData: false };
    }

    const entitiesFound: DetectedEntity[] = [];
    let redacted = inputText;

    const scanAndMask = (regex: RegExp, type: DetectedEntity['type'], maskPrefix: string) => {
      let count = 0;
      const flags = regex.flags.includes('g') ? regex.flags : regex.flags + 'g';
      const cleanRegex = new RegExp(regex.source, flags);

      redacted = redacted.replace(cleanRegex, (match, ...args) => {
        count++;
        // If the first argument after match is a string (not an offset number), it is a capture group
        const captureGroup = typeof args[0] === 'string' ? args[0] : null;
        const target = captureGroup || match;
        const masked = `[REDACTED_${maskPrefix}_${count}]`;

        entitiesFound.push({
          type,
          original: target,
          masked,
          index: typeof args[args.length - 2] === 'number' ? args[args.length - 2] : 0,
        });

        if (captureGroup) {
          return match.replace(captureGroup, masked);
        }
        return masked;
      });
    };

    // 1. Secrets & Auth Tokens first
    scanAndMask(this.API_KEY_REGEX, 'api_key', 'API_KEY');
    scanAndMask(this.JWT_REGEX, 'jwt', 'AUTH_TOKEN');
    scanAndMask(this.PASSWORD_REGEX, 'password', 'CREDENTIAL');

    // 2. High-risk Financial & Identity Identifiers (Global & India DPDP)
    scanAndMask(this.CREDIT_CARD_REGEX, 'credit_card', 'CARD_NUM');
    scanAndMask(this.SSN_REGEX, 'ssn', 'SSN');
    scanAndMask(this.AADHAAR_REGEX, 'aadhaar', 'AADHAAR');
    scanAndMask(this.PAN_REGEX, 'pan', 'PAN');
    scanAndMask(this.UPI_REGEX, 'upi_id', 'UPI_ID');

    // 3. Communications Identifiers
    scanAndMask(this.EMAIL_REGEX, 'email', 'EMAIL');
    scanAndMask(this.PHONE_REGEX, 'phone', 'PHONE');

    return {
      redactedText: redacted,
      entitiesFound,
      hasSensitiveData: entitiesFound.length > 0,
    };
  }

  /**
   * Returns a sanitized summary of masked entities for audit trail without exposing values.
   */
  public static getRedactionSummary(entities: DetectedEntity[]): Record<string, number> {
    const summary: Record<string, number> = {};
    for (const entity of entities) {
      summary[entity.type] = (summary[entity.type] || 0) + 1;
    }
    return summary;
  }
}
