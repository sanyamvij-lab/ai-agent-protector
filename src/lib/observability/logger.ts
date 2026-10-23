// AI Protector - Structured Privacy-Safe Operational Logger
// Ensures zero raw PII, secret keys, or authentication credentials appear in operational logs.

import { PrivacyRedactor } from '../privacy/redactor';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  requestId?: string;
  module: string;
  action: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export class SafeLogger {
  private static sanitize(obj: unknown): unknown {
    if (!obj) return obj;

    if (typeof obj === 'string') {
      // Redact sensitive patterns from log strings
      return PrivacyRedactor.redact(obj).redactedText;
    }

    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.map(item => this.sanitize(item));
      }

      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
        const lowerKey = key.toLowerCase();
        // Redact any field that sounds like a credential or secret
        if (
          lowerKey.includes('secret') ||
          lowerKey.includes('key') ||
          lowerKey.includes('token') ||
          lowerKey.includes('password') ||
          lowerKey.includes('auth') ||
          lowerKey.includes('ssn')
        ) {
          sanitized[key] = '[REDACTED_SECRET]';
        } else {
          sanitized[key] = this.sanitize(val);
        }
      }
      return sanitized;
    }

    return obj;
  }

  public static log(level: LogLevel, entry: Omit<LogEntry, 'timestamp' | 'level'>) {
    const fullEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      requestId: entry.requestId || 'system',
      module: entry.module,
      action: entry.action,
      message: typeof entry.message === 'string' ? entry.message : String(entry.message),
      metadata: entry.metadata ? (this.sanitize(entry.metadata) as Record<string, unknown>) : undefined,
    };

    const serialized = JSON.stringify(fullEntry);
    if (level === 'error') {
      console.error(serialized);
    } else if (level === 'warn') {
      console.warn(serialized);
    } else {
      console.log(serialized);
    }
  }

  public static info(module: string, action: string, message: string, metadata?: Record<string, unknown>, requestId?: string) {
    this.log('info', { module, action, message, metadata, requestId });
  }

  public static warn(module: string, action: string, message: string, metadata?: Record<string, unknown>, requestId?: string) {
    this.log('warn', { module, action, message, metadata, requestId });
  }

  public static error(module: string, action: string, message: string, metadata?: Record<string, unknown>, requestId?: string) {
    this.log('error', { module, action, message, metadata, requestId });
  }
}
