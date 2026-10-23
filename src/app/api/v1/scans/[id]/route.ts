// AI Protector - Phase 1 Scan Retrieval Endpoint (GET /api/v1/scans/:id)
// Invariant: Returns 404 Not Found if scan is non-existent OR unowned (anti-probing defense).

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { Database } from '@/lib/db/database';
import { UrlSafeLogger } from '@/lib/observability/url-safe-logger';

export async function GET(
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
          message: 'Authentication required to view scan details.',
        },
      },
      { status: 401 }
    );
  }

  // 2. Fetch with Anti-Probing Defense
  const scan = await Database.getScanById(scanId, user.id);
  if (!scan) {
    UrlSafeLogger.warn('scan_not_found', 'Scan ID not found or unowned by user', {
      user_id: user.id,
      scan_id: scanId,
    }, requestId);
    // Return 404 (never 403) to prevent ID enumeration
    return NextResponse.json(
      {
        error: {
          code: 'NOT_FOUND',
          message: `Scan record with ID "${scanId}" was not found.`,
        },
      },
      { status: 404 }
    );
  }

  UrlSafeLogger.info('scan_retrieved', 'Scan details retrieved by owner', {
    user_id: user.id,
    scan_id: scanId,
    host: scan.host,
    url_hash: scan.url_hash,
  }, requestId);

  return NextResponse.json(scan, { status: 200 });
}
