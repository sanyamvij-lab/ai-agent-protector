// AI Protector - VirusTotal v3 Threat Intelligence Engine
// Integrates 70+ global antivirus engines & domain threat telemetry without uploading user files.

import { VirusTotalReport, VirusTotalStats } from '../types';
import { SafeLogger } from '../observability/logger';

interface CacheEntry {
  report: VirusTotalReport;
  expiresAt: number;
}

export class VirusTotalService {
  private static readonly API_BASE = 'https://www.virustotal.com/api/v3';
  private static readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache
  private static readonly cache = new Map<string, CacheEntry>();

  /**
   * Returns whether a valid VirusTotal API key is present in server environment.
   */
  public static isConfigured(): boolean {
    const key = process.env.VIRUSTOTAL_API_KEY;
    return Boolean(key && key.trim().length >= 32);
  }

  private static getApiKey(): string | undefined {
    return process.env.VIRUSTOTAL_API_KEY?.trim();
  }

  /**
   * Looks up a domain's global threat reputation across 90+ security vendors.
   */
  public static async checkDomain(domain: string): Promise<VirusTotalReport | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    const cleanDomain = domain.toLowerCase().trim();
    if (!cleanDomain || cleanDomain.includes('localhost') || cleanDomain === '127.0.0.1') {
      return null;
    }

    const cacheKey = `domain:${cleanDomain}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${this.API_BASE}/domains/${encodeURIComponent(cleanDomain)}`, {
        headers: { 'x-apikey': apiKey },
        signal: AbortSignal.timeout(6000),
      });

      if (res.status === 404) {
        const notFoundReport = this.buildReport('not_found', { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 });
        this.setCached(cacheKey, notFoundReport);
        return notFoundReport;
      }

      if (res.status === 429) {
        SafeLogger.warn('virustotal', 'quota_exceeded', 'VirusTotal public rate limit reached');
        return this.buildReport('quota_exceeded', { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 });
      }

      if (!res.ok) {
        SafeLogger.warn('virustotal', 'domain_check_failed', `VT domain error: HTTP ${res.status}`);
        return null;
      }

      const json = await res.json();
      const attrs = json.data?.attributes;
      const stats = attrs?.last_analysis_stats || { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 };
      const reputation = typeof attrs?.reputation === 'number' ? attrs.reputation : 0;
      const categories = attrs?.categories || {};
      const tags = attrs?.tags || [];

      let status: VirusTotalReport['status'] = 'clean';
      if (stats.malicious > 0) {
        status = 'malicious';
      } else if (stats.suspicious > 0) {
        status = 'suspicious';
      }

      const report = this.buildReport(status, stats, reputation, categories, tags);
      this.setCached(cacheKey, report);
      return report;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      SafeLogger.warn('virustotal', 'network_timeout_or_error', `VT domain check skipped: ${msg}`);
      return null;
    }
  }

  /**
   * Looks up a URL's scan results in VirusTotal via base64url-encoded URL identifier.
   */
  public static async checkUrl(url: string): Promise<VirusTotalReport | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    const trimmedUrl = url.trim();
    if (!trimmedUrl) return null;

    // VirusTotal URL identifier is base64url encoded without padding '='
    const urlId = Buffer.from(trimmedUrl)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const cacheKey = `url:${urlId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${this.API_BASE}/urls/${urlId}`, {
        headers: { 'x-apikey': apiKey },
        signal: AbortSignal.timeout(6000),
      });

      if (res.status === 404) {
        const notFoundReport = this.buildReport('not_found', { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 });
        this.setCached(cacheKey, notFoundReport);
        return notFoundReport;
      }

      if (res.status === 429) {
        return this.buildReport('quota_exceeded', { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 });
      }

      if (!res.ok) return null;

      const json = await res.json();
      const attrs = json.data?.attributes;
      const stats = attrs?.last_analysis_stats || { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 };
      const reputation = typeof attrs?.reputation === 'number' ? attrs.reputation : 0;
      const tags = attrs?.tags || [];

      let status: VirusTotalReport['status'] = 'clean';
      if (stats.malicious > 0) {
        status = 'malicious';
      } else if (stats.suspicious > 0) {
        status = 'suspicious';
      }

      const report = this.buildReport(status, stats, reputation, undefined, tags);
      this.setCached(cacheKey, report);
      return report;
    } catch {
      return null;
    }
  }

  /**
   * Looks up a SHA-256 cryptographic hash across 70+ antivirus engines.
   * NEVER transmits user file contents; only queries the 32-byte mathematical digest.
   */
  public static async checkFileHash(sha256Hex: string): Promise<VirusTotalReport | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    const cleanHash = sha256Hex.toLowerCase().trim();
    if (!/^[a-f0-9]{64}$/.test(cleanHash)) {
      return null;
    }

    const cacheKey = `file:${cleanHash}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${this.API_BASE}/files/${cleanHash}`, {
        headers: { 'x-apikey': apiKey },
        signal: AbortSignal.timeout(6000),
      });

      if (res.status === 404) {
        // 404 in VT means hash is unseen/not present in global malware dataset
        const notFoundReport = this.buildReport('not_found', { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 });
        this.setCached(cacheKey, notFoundReport);
        return notFoundReport;
      }

      if (res.status === 429) {
        return this.buildReport('quota_exceeded', { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 });
      }

      if (!res.ok) return null;

      const json = await res.json();
      const attrs = json.data?.attributes;
      const stats = attrs?.last_analysis_stats || { malicious: 0, suspicious: 0, harmless: 0, undetected: 0 };
      const reputation = typeof attrs?.reputation === 'number' ? attrs.reputation : 0;
      const tags = attrs?.tags || [];

      let status: VirusTotalReport['status'] = 'clean';
      if (stats.malicious > 0) {
        status = 'malicious';
      } else if (stats.suspicious > 0) {
        status = 'suspicious';
      }

      const report = this.buildReport(status, stats, reputation, undefined, tags);
      this.setCached(cacheKey, report);
      return report;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      SafeLogger.warn('virustotal', 'file_hash_query_error', `File hash VT lookup skipped: ${msg}`);
      return null;
    }
  }

  private static buildReport(
    status: VirusTotalReport['status'],
    stats: VirusTotalStats,
    reputation?: number,
    categories?: Record<string, string>,
    tags?: string[]
  ): VirusTotalReport {
    const totalEngines = (stats.malicious || 0) + (stats.suspicious || 0) + (stats.harmless || 0) + (stats.undetected || 0);

    return {
      status,
      totalEngines: totalEngines > 0 ? totalEngines : 72,
      stats: {
        malicious: stats.malicious || 0,
        suspicious: stats.suspicious || 0,
        harmless: stats.harmless || 0,
        undetected: stats.undetected || 0,
      },
      reputation,
      categories,
      tags,
      lastAnalysisDate: new Date().toISOString(),
      source: 'virustotal_v3',
    };
  }

  private static getCached(key: string): VirusTotalReport | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.report;
  }

  private static setCached(key: string, report: VirusTotalReport): void {
    // Keep cache bounded to 500 entries
    if (this.cache.size > 500) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, {
      report,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });
  }
}
