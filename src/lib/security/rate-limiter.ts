// AI Protector - In-Memory Sliding Window Rate Limiter

interface RateLimitRecord {
  timestamps: number[];
}

export class RateLimiter {
  private static store = new Map<string, RateLimitRecord>();

  /**
   * Checks if an identifier exceeds rate limit.
   * @param key IP address or User ID
   * @param limit Maximum requests per window (default: 60)
   * @param windowMs Window duration in milliseconds (default: 60,000ms = 1 minute)
   */
  public static check(key: string, limit: number = 60, windowMs: number = 60000): { allowed: boolean; remaining: number; resetMs: number } {
    const now = Date.now();
    const windowStart = now - windowMs;

    const record = this.store.get(key) || { timestamps: [] };
    // Filter timestamps within current window
    const activeTimestamps = record.timestamps.filter(ts => ts > windowStart);

    if (activeTimestamps.length >= limit) {
      const oldest = activeTimestamps[0];
      const resetMs = Math.max(0, oldest + windowMs - now);
      return {
        allowed: false,
        remaining: 0,
        resetMs,
      };
    }

    activeTimestamps.push(now);
    this.store.set(key, { timestamps: activeTimestamps });

    return {
      allowed: true,
      remaining: limit - activeTimestamps.length,
      resetMs: windowMs,
    };
  }

  /**
   * Resets rate limiter store (useful for automated testing).
   */
  public static reset() {
    this.store.clear();
  }
}
