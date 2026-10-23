// AI Protector - Safe Link Inspector & Anti-SSRF URL Guard
// Safely deconstructs and audits suspicious links without dangerous dereferencing or execution.

import { LinkScanResult, RiskSignal, RiskLevel } from '../types';

export class UrlInspector {
  private static readonly SUSPICIOUS_TLDS = new Set([
    'top', 'xyz', 'click', 'work', 'gq', 'cf', 'ml', 'tk', 'loan', 
    'buzz', 'fit', 'country', 'surf', 'rest', 'gdn', 'date', 'stream', 'zip', 'mov'
  ]);

  private static readonly HIGH_TARGET_BRANDS = [
    { name: 'PayPal', canonical: 'paypal.com', pattern: /paypa[l1i]|pay[-_]?pal/i },
    { name: 'Apple', canonical: 'apple.com', pattern: /app[l1i]e|icloud/i },
    { name: 'Google', canonical: 'google.com', pattern: /goog[l1i]e|gmail/i },
    { name: 'Microsoft', canonical: 'microsoft.com', pattern: /micros[o0]ft|office365/i },
    { name: 'Amazon', canonical: 'amazon.com', pattern: /amaz[o0]n|prime-billing/i },
    { name: 'Chase Bank', canonical: 'chase.com', pattern: /chase/i },
    { name: 'Bank of America', canonical: 'bankofamerica.com', pattern: /bofa|bankofamerica/i },
    { name: 'Wells Fargo', canonical: 'wellsfargo.com', pattern: /wells[-_]?fargo/i },
    { name: 'Netflix', canonical: 'netflix.com', pattern: /netf[l1i]x/i },
    { name: 'USPS', canonical: 'usps.com', pattern: /usps/i },
    { name: 'DHL', canonical: 'dhl.com', pattern: /dhl/i },
    { name: 'FedEx', canonical: 'fedex.com', pattern: /fedex/i },
    { name: 'Coinbase', canonical: 'coinbase.com', pattern: /c[o0]inbase/i },
    { name: 'Binance', canonical: 'binance.com', pattern: /binance/i },
  ];

  /**
   * Helper to parse an IP host (decimal, hex, octal dotted, or IPv4-mapped IPv6)
   * into a 32-bit unsigned integer, or null if not an IPv4 representation.
   */
  private static parseIpv4ToNumber(host: string): number | null {
    // 1. Direct decimal integer (e.g. "2130706433" -> 127.0.0.1)
    if (/^\d+$/.test(host)) {
      const val = Number(host);
      if (!isNaN(val) && val >= 0 && val <= 0xffffffff) {
        return val >>> 0;
      }
    }

    // 2. Direct hex integer (e.g. "0x7f000001")
    if (/^0x[0-9a-f]+$/i.test(host)) {
      const val = parseInt(host, 16);
      if (!isNaN(val) && val >= 0 && val <= 0xffffffff) {
        return val >>> 0;
      }
    }

    // 3. IPv4-mapped IPv6 prefix (::ffff:127.0.0.1 or ::ffff:7f00:1)
    const ipv4MappedMatch = host.match(/^(?:0*:)*ffff:(.+)$/i);
    if (ipv4MappedMatch) {
      const remainder = ipv4MappedMatch[1];
      if (remainder.includes('.')) {
        return this.parseIpv4ToNumber(remainder);
      }
      // Hex word representation e.g. 7f00:1
      const hexParts = remainder.split(':');
      if (hexParts.length === 2) {
        const h1 = parseInt(hexParts[0], 16);
        const h2 = parseInt(hexParts[1], 16);
        if (!isNaN(h1) && !isNaN(h2) && h1 >= 0 && h1 <= 0xffff && h2 >= 0 && h2 <= 0xffff) {
          return (((h1 << 16) | h2) >>> 0);
        }
      }
    }

    // 4. Dot-separated octets (decimal, octal, or hex per octet)
    const parts = host.split('.');
    if (parts.length === 4) {
      const octets: number[] = [];
      for (const part of parts) {
        let num: number;
        if (/^0x[0-9a-f]+$/i.test(part)) {
          num = parseInt(part, 16);
        } else if (/^0[0-7]+$/.test(part)) {
          num = parseInt(part, 8);
        } else if (/^\d+$/.test(part)) {
          num = parseInt(part, 10);
        } else {
          return null;
        }
        if (isNaN(num) || num < 0 || num > 255) return null;
        octets.push(num);
      }
      return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
    }

    return null;
  }

  /**
   * Checks if an IP or hostname is private, loopback, or link-local (SSRF Guard).
   */
  public static isPrivateOrLoopbackHost(hostname: string): boolean {
    const host = hostname.toLowerCase().trim().replace(/^\[|\]$/g, '');

    // Loopback / localhost names
    if (
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host.endsWith('.lan') ||
      host.endsWith('.test') ||
      host === '0.0.0.0'
    ) {
      return true;
    }

    // Attempt IPv4 parsing across all encodings
    const ipNum = this.parseIpv4ToNumber(host);
    if (ipNum !== null) {
      const o1 = (ipNum >>> 24) & 255;
      const o2 = (ipNum >>> 16) & 255;

      // 127.0.0.0/8 (Loopback)
      if (o1 === 127) return true;
      // 0.0.0.0/8 (Current network)
      if (o1 === 0) return true;
      // 10.0.0.0/8 (Private)
      if (o1 === 10) return true;
      // 100.64.0.0/10 (Carrier-Grade NAT / CGNAT: 100.64.0.0 - 100.127.255.255)
      if (o1 === 100 && o2 >= 64 && o2 <= 127) return true;
      // 172.16.0.0/12 (Private: 172.16.0.0 - 172.31.255.255)
      if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
      // 192.168.0.0/16 (Private)
      if (o1 === 192 && o2 === 168) return true;
      // 169.254.0.0/16 (Link-local / Cloud Metadata: 169.254.169.254)
      if (o1 === 169 && o2 === 254) return true;
      // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved / Future use)
      if (o1 >= 224) return true;
    }

    // IPv6 checks
    if (
      host === '::1' ||
      host === '::' ||
      host === '0:0:0:0:0:0:0:1' ||
      host.startsWith('fc00:') ||
      host.startsWith('fd') ||
      host.startsWith('fe80:')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Inspects a submitted URL and produces an anti-SSRF, evidence-based risk assessment.
   */
  public static inspect(rawUrl: string, processingMode: 'local' | 'hybrid' | 'cloud' = 'local'): LinkScanResult {
    let trimmed = (rawUrl || '').trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      trimmed = 'http://' + trimmed;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmed);
    } catch {
      return {
        id: `url-err-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingMode,
        riskLevel: 'high_risk',
        confidenceScore: 0.95,
        summary: 'Malformed or unparseable URL. May be attempting an obfuscated injection.',
        submittedUrl: rawUrl,
        canonicalUrl: rawUrl,
        domain: 'invalid',
        isHttps: false,
        isPrivateOrLoopback: false,
        hasPunycode: false,
        isTyposquatting: false,
        suspiciousTld: false,
        signals: [
          {
            id: 'malformed_url',
            label: 'Malformed URL Structure',
            category: 'url_hazard',
            severity: 'high',
            description: 'The URL fails standard RFC 3986 parsing.',
          },
        ],
        limitations: 'Cannot verify DNS records or page contents without valid URL formatting.',
        safeNextSteps: ['Do not attempt to paste or open this string in your web browser.'],
        privacyReceipt: {
          processedLocally: true,
          piiScrubbedCount: 0,
          networkTransferred: false,
        },
      };
    }

    const signals: RiskSignal[] = [];
    const hostname = parsedUrl.hostname.toLowerCase();
    const isHttps = parsedUrl.protocol === 'https:';
    const isPrivate = this.isPrivateOrLoopbackHost(hostname);
    const hasPunycode = hostname.includes('xn--');
    let decodedPunycode: string | undefined;

    // Check SSRF / Internal Network probe
    if (isPrivate) {
      signals.push({
        id: 'ssrf_private_network',
        label: 'Internal Network or Private IP Target (SSRF)',
        category: 'url_hazard',
        severity: 'high',
        description: `This URL targets a private/loopback/cloud metadata address (${hostname}). Threat actors use these to access internal routers, cloud secrets, or local microservices.`,
        matchedText: hostname,
      });
    }

    // Check Plaintext HTTP
    if (!isHttps) {
      signals.push({
        id: 'insecure_http',
        label: 'Unencrypted HTTP Protocol',
        category: 'url_hazard',
        severity: 'medium',
        description: 'Connection is not encrypted with TLS/SSL. Sensitive data like passwords and session cookies can be intercepted in transit on public Wi-Fi.',
        matchedText: parsedUrl.protocol,
      });
    }

    // Check Raw IP in URL
    const isRawIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    if (isRawIp && !isPrivate) {
      signals.push({
        id: 'raw_ip_host',
        label: 'Raw IP Address Hostname',
        category: 'url_hazard',
        severity: 'high',
        description: 'Legitimate consumer services virtually always use branded domain names. Direct IP addresses are commonly used to bypass domain blacklists.',
        matchedText: hostname,
      });
    }

    // Check Punycode / IDN Homograph
    if (hasPunycode) {
      try {
        decodedPunycode = decodeURIComponent(hostname);
      } catch {
        decodedPunycode = hostname;
      }
      signals.push({
        id: 'punycode_homograph',
        label: 'Punycode / IDN Homograph Detected',
        category: 'url_hazard',
        severity: 'high',
        description: `The domain uses internationalized encoding (${hostname}). Attackers frequently use visually identical characters from other alphabets (e.g. Cyrillic 'а' instead of Latin 'a') to spoof real sites.`,
        matchedText: hostname,
      });
    }

    // Check Suspicious TLD
    const domainParts = hostname.split('.');
    const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1] : '';
    const isSuspiciousTld = this.SUSPICIOUS_TLDS.has(tld);
    if (isSuspiciousTld) {
      signals.push({
        id: 'suspicious_tld',
        label: `High-Risk TLD (.${tld})`,
        category: 'url_hazard',
        severity: 'medium',
        description: `The top-level domain '.${tld}' has statistically elevated rates of abuse, spam, and short-lived phishing campaigns.`,
        matchedText: `.${tld}`,
      });
    }

    // Typosquatting / Brand Impersonation Check
    let isTyposquatting = false;
    let targetBrandMatched: string | undefined;

    for (const brand of this.HIGH_TARGET_BRANDS) {
      if (brand.pattern.test(hostname)) {
        if (!hostname.endsWith(brand.canonical) && hostname !== brand.canonical) {
          isTyposquatting = true;
          targetBrandMatched = brand.name;
          signals.push({
            id: `typosquat_${brand.name.toLowerCase().replace(/\s+/g, '_')}`,
            label: `Brand Impersonation / Typosquatting (${brand.name})`,
            category: 'impersonation',
            severity: 'high',
            description: `The URL contains keywords matching ${brand.name}, but its canonical host is '${hostname}' rather than '${brand.canonical}'. This is a prime phishing hallmark.`,
            matchedText: hostname,
          });
          break;
        }
      }
    }

    // Non-standard port check
    if (parsedUrl.port && parsedUrl.port !== '80' && parsedUrl.port !== '443') {
      signals.push({
        id: 'non_standard_port',
        label: `Non-Standard Web Port (:${parsedUrl.port})`,
        category: 'url_hazard',
        severity: 'low',
        description: `The link routes to port ${parsedUrl.port} rather than standard HTTPS (443) or HTTP (80).`,
        matchedText: parsedUrl.port,
      });
    }

    // Determine Overall Risk Level
    let riskLevel: RiskLevel = 'low';
    let summary = 'No clear warning indicators identified. Domain appears formatted normally.';
    let confidenceScore = 0.85;

    const highSeverityCount = signals.filter(s => s.severity === 'high').length;
    const medSeverityCount = signals.filter(s => s.severity === 'medium').length;

    if (highSeverityCount > 0) {
      riskLevel = 'high_risk';
      summary = `High risk detected. Identified ${highSeverityCount} critical security indicator(s) including ${signals[0].label}.`;
      confidenceScore = 0.92;
    } else if (medSeverityCount > 0) {
      riskLevel = 'suspicious';
      summary = `Proceed with caution. Found ${medSeverityCount} suspicious characteristic(s) that require verification.`;
      confidenceScore = 0.8;
    }

    const safeNextSteps: string[] = [];
    if (riskLevel === 'high_risk') {
      safeNextSteps.push('Do NOT open this link or input credentials, passwords, or personal data.');
      if (targetBrandMatched) {
        safeNextSteps.push(`If this message claimed to be from ${targetBrandMatched}, go to their official website directly via your browser bookmarks.`);
      }
      safeNextSteps.push('Delete or report the message containing this link to your platform provider.');
    } else if (riskLevel === 'suspicious') {
      safeNextSteps.push('Verify the identity of the sender before clicking.');
      safeNextSteps.push('Check the domain carefully. Do not download executable files or enter credentials.');
    } else {
      safeNextSteps.push('Always ensure the browser address bar displays the expected domain before logging in.');
    }

    return {
      id: `url-scan-${Date.now()}`,
      timestamp: new Date().toISOString(),
      processingMode,
      riskLevel,
      confidenceScore,
      summary,
      signals,
      submittedUrl: rawUrl,
      canonicalUrl: parsedUrl.toString(),
      domain: hostname,
      isHttps,
      isPrivateOrLoopback: isPrivate,
      hasPunycode,
      decodedPunycode,
      isTyposquatting,
      targetBrandMatched,
      suspiciousTld: isSuspiciousTld,
      limitations: 'Static URL structure analysis cannot inspect dynamic JavaScript execution or server-side redirects without active web fetching. Safe link checking does not substitute for end-to-end endpoint antivirus.',
      safeNextSteps,
      privacyReceipt: {
        processedLocally: true,
        piiScrubbedCount: 0,
        networkTransferred: false,
      },
    };
  }
}
