import { NextRequest, NextResponse } from 'next/server';

export function getOrCreateRequestId(req: NextRequest): string {
  const existing = req.headers.get('x-request-id');
  if (existing && existing.trim().length > 0) {
    return existing.trim();
  }
  return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return '127.0.0.1';
}

export function createErrorResponse(
  code: 'VALIDATION_ERROR' | 'RATE_LIMIT_EXCEEDED' | 'PAYLOAD_TOO_LARGE' | 'INTERNAL_ERROR' | 'BAD_REQUEST',
  message: string,
  status: number,
  requestId: string
): NextResponse {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        request_id: requestId,
      },
    },
    {
      status,
      headers: {
        'x-request-id': requestId,
        'Cache-Control': 'no-store',
      },
    }
  );
}

export function createSuccessResponse<T extends Record<string, unknown>>(
  data: T,
  requestId: string,
  status = 200
): NextResponse {
  return NextResponse.json(
    {
      ...data,
      request_id: requestId,
    },
    {
      status,
      headers: {
        'x-request-id': requestId,
        'Cache-Control': 'no-store',
      },
    }
  );
}
