// AI Protector - False Positive Reporting Endpoint (POST /api/v1/scans/:id/false-positive)

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService } from '@/lib/auth/auth-service';
import { Database } from '@/lib/db/database';
import { UrlSafeLogger } from '@/lib/observability/url-safe-logger';

const FalsePositiveSchema = z.object({
  reason: z.string().min(3, 'Please describe why this detection appears to be in error').max(1000, 'Reason cannot exceed 1000 characters'),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const requestId = req.headers.get('x-request-id') || `req_${Date.now()}`;
  const { id: scanId } = await context.params;

  // 1. Authentication
  const user = AuthService.authenticateRequest(req);
  if (!user) {
    return NextResponse.json(
      {
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required to report a false positive.',
        },
      },
      { status: 401 }
    );
  }

  // 2. Validate input
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

  const parsed = FalsePositiveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid report details.',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  // 3. Record false positive in database
  const success = await Database.reportFalsePositive(scanId, user.id, parsed.data.reason);
  if (!success) {
    return NextResponse.json(
      {
        error: {
          code: 'NOT_FOUND',
          message: `Scan record with ID "${scanId}" was not found or is not accessible.`,
        },
      },
      { status: 404 }
    );
  }

  UrlSafeLogger.info('false_positive_reported', 'User filed false positive report for scan', {
    user_id: user.id,
    scan_id: scanId,
  }, requestId);

  return NextResponse.json(
    {
      success: true,
      message: 'False positive report recorded for security analyst review.',
      scan_id: scanId,
    },
    { status: 200 }
  );
}
