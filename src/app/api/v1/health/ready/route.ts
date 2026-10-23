import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/gateway/middleware-helpers';

const startTime = Date.now();

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const memory = process.memoryUsage();
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  const readyPayload = {
    status: 'ready',
    version: '1.0.0',
    request_id: requestId,
    timestamp: new Date().toISOString(),
    uptime_seconds: uptimeSeconds,
    memory_mb: {
      rss: Math.round(memory.rss / (1024 * 1024)),
      heap_total: Math.round(memory.heapTotal / (1024 * 1024)),
      heap_used: Math.round(memory.heapUsed / (1024 * 1024)),
    },
    dependencies: {
      local_heuristics: 'healthy',
      anti_ssrf_guard: 'healthy',
      pii_redactor: 'healthy',
      cloud_ai_gateway: process.env.GEMINI_API_KEY ? 'healthy' : 'fallback_mode',
    },
  };

  return NextResponse.json(readyPayload, {
    status: 200,
    headers: {
      'x-request-id': requestId,
      'Cache-Control': 'no-store',
    },
  });
}
