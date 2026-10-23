// AI Protector - WHATWG URL Normalizer & Credential Stripper
import { createHash } from 'crypto';

export interface NormalizedUrlResult {
  valid: boolean;
  error?: string;
  normalizedUrl: string;
  urlHash: string;
  host: string;
  domain: string;
  hasCredentials: boolean;
  originalCredentials?: string;
}

export class UrlNormalizer {
  public static readonly MAX_LENGTH = 2048;

  public static normalize(rawInput: string): NormalizedUrlResult {
    if (!rawInput || typeof rawInput !== 'string') {
      return {
        valid: false,
        error: 'URL cannot be empty',
        normalizedUrl: '',
        urlHash: '',
        host: '',
        domain: '',
        hasCredentials: false,
      };
    }

    const trimmed = rawInput.trim();
    if (trimmed.length > this.MAX_LENGTH) {
      return {
        valid: false,
        error: `URL exceeds maximum supported length of ${this.MAX_LENGTH} characters`,
        normalizedUrl: '',
        urlHash: '',
        host: '',
        domain: '',
        hasCredentials: false,
      };
    }

    let parsed: URL;
    try {
      // If no scheme provided, reject per strict §7.3 "Allow only http/https; reject malformed input"
      parsed = new URL(trimmed);
    } catch {
      return {
        valid: false,
        error: 'Malformed URL: Must be a valid WHATWG URL starting with http:// or https://',
        normalizedUrl: '',
        urlHash: '',
        host: '',
        domain: '',
        hasCredentials: false,
      };
    }

    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        valid: false,
        error: `Unsupported URL protocol: "${parsed.protocol}". Only http:// and https:// schemes are supported.`,
        normalizedUrl: '',
        urlHash: '',
        host: '',
        domain: '',
        hasCredentials: false,
      };
    }

    // Check and strip embedded credentials
    const hasCredentials = Boolean(parsed.username || parsed.password);
    let originalCredentials: string | undefined;
    if (hasCredentials) {
      originalCredentials = `${parsed.username}${parsed.password ? ':' + parsed.password : ''}`;
      parsed.username = '';
      parsed.password = '';
    }

    // Strip hash fragment before storage / external transmission
    parsed.hash = '';

    const host = parsed.hostname.toLowerCase();
    const normalizedUrl = parsed.href;
    const urlHash = createHash('sha256').update(normalizedUrl).digest('hex');

    return {
      valid: true,
      normalizedUrl,
      urlHash,
      host,
      domain: host,
      hasCredentials,
      originalCredentials,
    };
  }
}
