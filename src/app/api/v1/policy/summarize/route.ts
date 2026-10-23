// AI Protector India — API Route: Privacy Policy Summarizer (/api/v1/policy/summarize)
// Returns exact clause quotes for Collected, Shared, Retention, and Deletion.

import { NextRequest, NextResponse } from 'next/server';
import { PolicyAnalyzerEngine } from '@/lib/privacy/policy-analyzer';
import { RateLimiter } from '@/lib/security/rate-limiter';
import { UrlSafeLogger } from '@/lib/observability/url-safe-logger';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const rateLimitResult = RateLimiter.check(ip, 20, 60000);
  if (!rateLimitResult.allowed) {
    const retryAfter = Math.ceil(rateLimitResult.resetMs / 1000);
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  try {
    const body = await req.json();
    const text = typeof body.text === 'string' ? body.text.trim() : '';

    if (!text || text.length < 20) {
      return NextResponse.json(
        { error: 'Please provide at least a few sentences of the privacy policy text to analyze.' },
        { status: 400 }
      );
    }

    if (text.length > 50000) {
      return NextResponse.json(
        { error: 'Policy text exceeds maximum supported size (50,000 characters). Please paste relevant sections.' },
        { status: 400 }
      );
    }

    const summary = PolicyAnalyzerEngine.summarize(text);

    UrlSafeLogger.info('policy_summarize', 'Policy summary generated', {
      collectedCount: summary.collected.length,
      sharedCount: summary.shared_with.length,
      retentionCount: summary.retention.length,
      deletionCount: summary.how_to_delete.length,
    });

    return NextResponse.json(summary, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'An unexpected error occurred while analyzing the privacy policy.' },
      { status: 500 }
    );
  }
}
