// AI Protector - Structured Privacy-Safe URL Logger
// Strictly logs `host` and `sha256(normalized_url)` - Never logs raw URLs or query parameters.

import { createHash } from 'crypto';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface ScanLogMetadata {
  host: string;
  url_hash: string;
  status?: string;
  category?: string;
  latency_ms?: number;
  user_id?: string;
  provider_status?: string;
  [key: string]: unknown;
}

export class UrlSafeLogger {
  public static hashUrl(url: string): string {
    return createHash('sha256').update(url.trim()).digest('hex');
  }

  public static sanitizeUrlForLogging(rawUrl: string): { host: string; url_hash: string } {
    try {
      const parsed = new URL(rawUrl);
      return {
        host: parsed.hostname,
        url_hash: this.hashUrl(parsed.href),
      };
    } catch {
      return {
        host: 'invalid_host',
        url_hash: this.hashUrl(rawUrl),
      };
    }
  }

  public static log(level: LogLevel, action: string, message: string, meta?: Record<string, unknown>, requestId?: string) {
    const sanitizedMeta: Record<string, unknown> = {};

    if (meta) {
      for (const [key, val] of Object.entries(meta)) {
        // Intercept any raw URL field and hash it
        if (key.toLowerCase().includes('url') && typeof val === 'string') {
          const { host, url_hash } = this.sanitizeUrlForLogging(val);
          sanitizedMeta['host'] = host;
          sanitizedMeta['url_hash'] = url_hash;
        } else if (
          key.toLowerCase().includes('secret') ||
          key.toLowerCase().includes('key') ||
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('auth') ||
          key.toLowerCase().includes('password')
        ) {
          sanitizedMeta[key] = '[REDACTED_SECRET]';
        } else {
          sanitizedMeta[key] = val;
        }
      }
    }

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      requestId: requestId || 'system',
      module: 'url_pipeline',
      action,
      message,
      metadata: sanitizedMeta,
    };

    const serialized = JSON.stringify(entry);
    if (level === 'error') {
      console.error(serialized);
    } else if (level === 'warn') {
      console.warn(serialized);
    } else {
      console.log(serialized);
    }
  }

  public static info(action: string, message: string, meta?: Record<string, unknown>, requestId?: string) {
    this.log('info', action, message, meta, requestId);
  }

  public static warn(action: string, message: string, meta?: Record<string, unknown>, requestId?: string) {
    this.log('warn', action, message, meta, requestId);
  }

  public static error(action: string, message: string, meta?: Record<string, unknown>, requestId?: string) {
    this.log('error', action, message, meta, requestId);
  }
}
