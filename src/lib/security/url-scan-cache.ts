// AI Protector - Short-Lived URL Scan Memory Cache (≈5 minutes)
// Keyed strictly by SHA-256 hash of normalized URL.
// Invariant: NEVER cache "unavailable" results.

import { ScanResultContract } from './url-decision-engine';

interface CacheEntry {
  result: ScanResultContract;
  expiresAt: number;
}

export class UrlScanCache {
  private static readonly TTL_MS = 5 * 60 * 1000; // 5 minutes
  private static store = new Map<string, CacheEntry>();

  public static get(urlHash: string): ScanResultContract | null {
    const entry = this.store.get(urlHash);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(urlHash);
      return null;
    }

    return { ...entry.result };
  }

  public static set(urlHash: string, result: ScanResultContract): void {
    // Invariant: Never cache unavailable responses
    if (result.status === 'unavailable') {
      return;
    }

    this.store.set(urlHash, {
      result,
      expiresAt: Date.now() + this.TTL_MS,
    });
  }

  public static clear(): void {
    this.store.clear();
  }
}
