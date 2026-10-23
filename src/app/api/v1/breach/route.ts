// AI Protector India — API Route: Email Breach Inspector (/api/v1/breach)
// Checks if an email address has been compromised in public data breaches.

import { NextRequest, NextResponse } from 'next/server';
import { PrivacyBreachEngine } from '@/lib/privacy/k-anonymity-pwned';
import { RateLimiter } from '@/lib/security/rate-limiter';
import { UrlSafeLogger } from '@/lib/observability/url-safe-logger';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const rateLimitResult = RateLimiter.check(ip, 30, 60000);
  if (!rateLimitResult.allowed) {
    const retryAfter = Math.ceil(rateLimitResult.resetMs / 1000);
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a moment before re-checking.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim() : '';

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: 'A valid email address is required (e.g. name@gmail.com).' },
        { status: 400 }
      );
    }

    const result = await PrivacyBreachEngine.checkEmail(email);

    UrlSafeLogger.info('breach_check', 'Breach check executed', {
      isBreached: result.isBreached,
      breachCount: result.breachCount,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'An unexpected error occurred while checking data breaches.' },
      { status: 500 }
    );
  }
}
