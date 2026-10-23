import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/gateway/middleware-helpers';

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  return NextResponse.json(
    {
      status: 'alive',
      timestamp: new Date().toISOString(),
      request_id: requestId,
    },
    {
      status: 200,
      headers: {
        'x-request-id': requestId,
        'Cache-Control': 'no-store',
      },
    }
  );
}
