// AI Protector - Phase 1 URL Scan Endpoint (POST /api/v1/scans)
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService } from '@/lib/auth/auth-service';
import { RateLimiter } from '@/lib/security/rate-limiter';
import { UrlNormalizer } from '@/lib/security/url-normalizer';
import { UrlHeuristics } from '@/lib/security/url-heuristics';
import { WebRiskProvider } from '@/lib/security/providers/webrisk-provider';
import { UrlScanCache } from '@/lib/security/url-scan-cache';
import { UrlDecisionEngine } from '@/lib/security/url-decision-engine';
import { Database } from '@/lib/db/database';
import { UrlSafeLogger } from '@/lib/observability/url-safe-logger';

const CreateScanSchema = z.object({
  url: z.string().min(1, 'URL cannot be empty').max(2048, 'URL exceeds maximum 2048 characters'),
});

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || `req_${Date.now()}`;
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

  // 1. Authentication Check
  const user = AuthService.authenticateRequest(req);
  if (!user) {
    UrlSafeLogger.warn('auth_unauthorized', 'Request rejected: missing or invalid credentials', undefined, requestId);
    return NextResponse.json(
      {
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required. Provide a valid Bearer token in the Authorization header.',
        },
      },
      { status: 401 }
    );
  }

  // 2. Rate Limiting Check
  const rateLimitKey = `rl_scan_${user.id}_${clientIp}`;
  const rateLimit = RateLimiter.check(rateLimitKey, 60, 60000);
  if (!rateLimit.allowed) {
    UrlSafeLogger.warn('rate_limit_exceeded', 'User exceeded request quota', { user_id: user.id }, requestId);
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded. Maximum 60 scans per minute allowed.',
          reset_in_ms: rateLimit.resetMs,
        },
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimit.resetMs / 1000)),
        },
      }
    );
  }

  // 3. Schema & Input Validation
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_JSON',
          message: 'Request body must be valid JSON.',
        },
      },
      { status: 400 }
    );
  }

  const parsed = CreateScanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'URL input failed validation.',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  const rawUrl = parsed.data.url;

  // 4. URL Normalization & Sanitization
  const normalized = UrlNormalizer.normalize(rawUrl);
  if (!normalized.valid) {
    UrlSafeLogger.warn('url_normalization_failed', 'URL rejected by normalizer', { reason: normalized.error }, requestId);
    return NextResponse.json(
      {
        error: {
          code: 'MALFORMED_URL',
          message: normalized.error || 'Invalid URL supplied',
        },
      },
      { status: 400 }
    );
  }

  // 5. Short-Lived Cache Lookup (Key: urlHash)
  const cached = UrlScanCache.get(normalized.urlHash);
  if (cached) {
    UrlSafeLogger.info('cache_hit', 'Returning cached scan result', {
      host: normalized.host,
      url_hash: normalized.urlHash,
      status: cached.status,
    }, requestId);

    // Save scan query to user history if newly scanned by this user
    await Database.saveScan({
      scan_id: cached.scan_id,
      user_id: user.id,
      target_type: cached.target_type,
      host: normalized.host,
      url_hash: normalized.urlHash,
      status: cached.status,
      category: cached.category,
      evidence: cached.evidence,
      provider_status: cached.provider_status,
      explanation: cached.explanation,
      recommended_action: cached.recommended_action,
      limitations: cached.limitations,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(cached, { status: 200 });
  }

  // 6. Heuristic Engine
  const heuristics = UrlHeuristics.evaluate(normalized);

  // 7. Threat Intelligence Provider (Google Web Risk)
  const providerResult = await WebRiskProvider.check(normalized.normalizedUrl);

  // 8. Decision Engine Synthesis
  const scanResult = UrlDecisionEngine.evaluate(normalized, heuristics, providerResult);

  // 9. Cache Store (Invariant: Never cache "unavailable")
  if (scanResult.status !== 'unavailable') {
    UrlScanCache.set(normalized.urlHash, scanResult);
  }

  // 10. Persist Scan Metadata to Database
  await Database.saveScan({
    scan_id: scanResult.scan_id,
    user_id: user.id,
    target_type: scanResult.target_type,
    host: normalized.host,
    url_hash: normalized.urlHash,
    status: scanResult.status,
    category: scanResult.category,
    evidence: scanResult.evidence,
    provider_status: scanResult.provider_status,
    explanation: scanResult.explanation,
    recommended_action: scanResult.recommended_action,
    limitations: scanResult.limitations,
    created_at: scanResult.scanned_at,
  });

  // 11. Redacted Structured Logging (host + url_hash only)
  UrlSafeLogger.info('scan_completed', 'URL scan finished', {
    user_id: user.id,
    host: normalized.host,
    url_hash: normalized.urlHash,
    status: scanResult.status,
    category: scanResult.category,
    provider: providerResult.provider,
    provider_state: providerResult.state,
    latency_ms: providerResult.latency_ms,
  }, requestId);

  return NextResponse.json(scanResult, { status: 201 });
}
