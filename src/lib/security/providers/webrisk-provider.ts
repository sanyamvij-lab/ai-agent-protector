// AI Protector - Google Web Risk Lookup API Provider Adapter
import { getEnv } from '@/lib/config/env';

export interface ProviderResult {
  provider: string;
  state: 'ok' | 'timeout' | 'quota' | 'error' | 'not_configured';
  latency_ms: number;
  threatMatch?: {
    threatType: 'MALWARE' | 'SOCIAL_ENGINEERING' | 'UNWANTED_SOFTWARE';
    expireTime?: string;
  };
  errorMessage?: string;
}

export class WebRiskProvider {
  private static readonly ENDPOINT = 'https://webrisk.googleapis.com/v1/uris:lookup';
  private static readonly TIMEOUT_MS = 3000;
  private static readonly THREAT_TYPES = ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'];

  /**
   * Checks target URL against Google Web Risk Lookup API.
   * Strictly enforces 3s timeout and maximum 1 retry on timeout/5xx.
   */
  public static async check(normalizedUrl: string, customApiKey?: string): Promise<ProviderResult> {
    const apiKey = customApiKey || getEnv().WEBRISK_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      return {
        provider: 'google_web_risk',
        state: 'not_configured',
        latency_ms: 0,
        errorMessage: 'WEBRISK_API_KEY is not configured in environment.',
      };
    }

    const start = Date.now();
    const queryUrl = new URL(this.ENDPOINT);
    queryUrl.searchParams.set('key', apiKey);
    queryUrl.searchParams.set('uri', normalizedUrl);
    for (const tt of this.THREAT_TYPES) {
      queryUrl.searchParams.append('threatTypes', tt);
    }

    // Execute with 1 retry on 5xx or timeout
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < 2) {
      attempt++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

      try {
        const response = await fetch(queryUrl.toString(), {
          method: 'GET',
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });
        clearTimeout(timeoutId);

        const latency = Date.now() - start;

        // Quota exhaustion (HTTP 429) - No retry
        if (response.status === 429) {
          return {
            provider: 'google_web_risk',
            state: 'quota',
            latency_ms: latency,
            errorMessage: 'Google Web Risk API quota limit reached.',
          };
        }

        // Client errors (HTTP 4xx) - No retry
        if (response.status >= 400 && response.status < 500) {
          const errorBody = await response.text().catch(() => '');
          return {
            provider: 'google_web_risk',
            state: 'error',
            latency_ms: latency,
            errorMessage: `Google Web Risk API returned client error (${response.status}): ${errorBody.slice(0, 200)}`,
          };
        }

        // Server errors (HTTP 5xx) - Retry once if on first attempt
        if (response.status >= 500) {
          if (attempt === 1) {
            continue; // Retry once
          }
          return {
            provider: 'google_web_risk',
            state: 'error',
            latency_ms: latency,
            errorMessage: `Google Web Risk API returned server error (${response.status}).`,
          };
        }

        const data = await response.json();

        // 200 OK - Check threat match
        if (data.threat && data.threat.threatTypes && data.threat.threatTypes.length > 0) {
          const detectedThreat = data.threat.threatTypes[0];
          return {
            provider: 'google_web_risk',
            state: 'ok',
            latency_ms: latency,
            threatMatch: {
              threatType: detectedThreat,
              expireTime: data.threat.expireTime,
            },
          };
        }

        // 200 OK - No threat match found
        return {
          provider: 'google_web_risk',
          state: 'ok',
          latency_ms: latency,
        };
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        lastError = err instanceof Error ? err : new Error(String(err));

        const isTimeout =
          lastError.name === 'AbortError' ||
          lastError.message.toLowerCase().includes('timeout') ||
          lastError.message.toLowerCase().includes('aborted');

        if (attempt === 1) {
          continue; // Retry once on timeout or network glitch
        }

        return {
          provider: 'google_web_risk',
          state: isTimeout ? 'timeout' : 'error',
          latency_ms: Date.now() - start,
          errorMessage: lastError.message,
        };
      }
    }

    return {
      provider: 'google_web_risk',
      state: 'error',
      latency_ms: Date.now() - start,
      errorMessage: lastError ? lastError.message : 'Unknown provider failure',
    };
  }
}
