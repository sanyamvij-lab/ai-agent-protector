// AI Protector India — API Route: Check Anything (/api/v1/check)
// Accepts URL, SMS/text, or phone number and returns structured Indian cyber threat assessment.

import { NextRequest, NextResponse } from 'next/server';
import { CheckAnythingEngine } from '@/lib/check/check-anything-engine';
import { UrlSafeLogger } from '@/lib/observability/url-safe-logger';
import { RateLimiter } from '@/lib/security/rate-limiter';
import { WebRiskProvider } from '@/lib/security/providers/webrisk-provider';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const rateLimitResult = RateLimiter.check(ip, 60, 60000);
  if (!rateLimitResult.allowed) {
    const retryAfter = Math.ceil(rateLimitResult.resetMs / 1000);
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a moment before submitting further queries.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  try {
    const body = await req.json();
    const query = typeof body.query === 'string' ? body.query.trim() : '';

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required. Please provide a URL, SMS/text, or Indian mobile number.' },
        { status: 400 }
      );
    }

    if (query.length > 4096) {
      return NextResponse.json(
        { error: 'Query exceeds maximum supported length (4,096 characters).' },
        { status: 400 }
      );
    }

    // Evaluate via unified engine
    const result = CheckAnythingEngine.evaluate(query);

    // If it's a URL, augment with live Google Web Risk lookup if possible
    if (result.input_type === 'url') {
      try {
        const providerRes = await WebRiskProvider.check(result.normalized_input);
        if (providerRes.state === 'ok' && providerRes.threatMatch) {
          result.verdict = 'likely_scam';
          result.verdict_display = 'Likely Scam / Phishing Hazard';
          result.confidence_score = 99;
          result.red_flags.unshift(`Google Web Risk: Confirmed malicious threat database match (${providerRes.threatMatch.threatType}).`);
        }
      } catch (err) {
        // Silently degrade; local heuristics are already populated
      }
    }

    // Redacted logging: never log raw SMS content or full URLs with tokens
    UrlSafeLogger.info('check_anything', 'CheckAnything query completed', {
      input_type: result.input_type,
      verdict: result.verdict,
      confidence: result.confidence_score,
      red_flags_count: result.red_flags.length,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'An unexpected internal error occurred while inspecting the query.' },
      { status: 500 }
    );
  }
}
