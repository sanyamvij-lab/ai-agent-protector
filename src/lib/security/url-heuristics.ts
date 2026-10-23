// AI Protector - Deterministic URL Heuristic Engine
// Flags explainable threat signals: lookalike/punycode, credentials-in-URL, IP literals, deceptive subdomains.

import { NormalizedUrlResult } from './url-normalizer';

export interface EvidenceItem {
  source: 'web_risk' | 'heuristic' | 'yara' | 'skillspector' | 'scorecard' | 'ai_explanation';
  engine_version?: string;
  ruleset_id?: string | null;
  type: string;
  detail: string;
  observed_at: string;
}

const HIGH_TARGET_BRANDS = [
  { name: 'PayPal', pattern: /paypa[l1i]|pay[-_]?pal/i, canonical: 'paypal.com' },
  { name: 'Apple', pattern: /app[l1i]e|icloud/i, canonical: 'apple.com' },
  { name: 'Google', pattern: /goog[l1i]e|gmail/i, canonical: 'google.com' },
  { name: 'Microsoft', pattern: /micros[o0]ft|office365/i, canonical: 'microsoft.com' },
  { name: 'Amazon', pattern: /amaz[o0]n|prime-billing/i, canonical: 'amazon.com' },
  { name: 'Chase Bank', pattern: /chase/i, canonical: 'chase.com' },
  { name: 'Bank of America', pattern: /bofa|bankofamerica/i, canonical: 'bankofamerica.com' },
  { name: 'Netflix', pattern: /netf[l1i]x/i, canonical: 'netflix.com' },
  { name: 'Coinbase', pattern: /c[o0]inbase/i, canonical: 'coinbase.com' },
  { name: 'Binance', pattern: /binance/i, canonical: 'binance.com' },
];

export class UrlHeuristics {
  /**
   * Evaluates heuristics against a normalized URL and returns structured evidence.
   */
  public static evaluate(normalized: NormalizedUrlResult): EvidenceItem[] {
    const evidence: EvidenceItem[] = [];
    const now = new Date().toISOString();
    const host = normalized.host;

    // 1. Embedded Credentials in URL
    if (normalized.hasCredentials) {
      evidence.push({
        source: 'heuristic',
        type: 'credentials_in_url',
        detail: 'The URL contained embedded username or password credentials in the authority segment, a technique commonly used to trick users or automate credential stuffing.',
        observed_at: now,
      });
    }

    // 2. IP-Literal Host (IPv4 or IPv6)
    const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
    const isIpv6 = host.startsWith('[') || host.includes(':');
    if (isIpv4 || isIpv6) {
      evidence.push({
        source: 'heuristic',
        type: 'ip_literal_host',
        detail: `The host "${host}" is a numeric IP address rather than a registered domain name. Malicious actors frequently bypass domain reputation by serving exploits directly from raw IP addresses.`,
        observed_at: now,
      });
    }

    // 3. Punycode / Homograph Lookalike Domain
    if (host.includes('xn--') || /[^\u0000-\u007F]/.test(host)) {
      evidence.push({
        source: 'heuristic',
        type: 'punycode_lookalike',
        detail: `The host "${host}" utilizes Punycode or non-ASCII characters, which is frequently exploited in Internationalized Domain Name (IDN) homograph attacks to impersonate legitimate brands.`,
        observed_at: now,
      });
    }

    // 4. Excessive Subdomains (> 3 dots in hostname before TLD)
    const hostParts = host.split('.');
    if (hostParts.length > 4) {
      evidence.push({
        source: 'heuristic',
        type: 'excessive_subdomains',
        detail: `The domain "${host}" has an unusually deep subdomain hierarchy (${hostParts.length - 2} levels). Attackers use deep nesting to obscure destination domains from users on mobile displays.`,
        observed_at: now,
      });
    }

    // 5. Deceptive Brand-in-Subdomain
    // Check if a known brand appears in the prefix of the host when the host does not end with the canonical domain
    for (const brand of HIGH_TARGET_BRANDS) {
      const isCanonical = host === brand.canonical || host.endsWith('.' + brand.canonical);
      if (!isCanonical && brand.pattern.test(host)) {
        evidence.push({
          source: 'heuristic',
          type: 'brand_in_subdomain',
          detail: `The host "${host}" contains references to "${brand.name}", but does not belong to the authentic domain (${brand.canonical}). This indicates brand impersonation or typosquatting.`,
          observed_at: now,
        });
        break; // Only flag primary brand match once
      }
    }

    return evidence;
  }
}
