import { NextResponse } from 'next/server';

const startTime = Date.now();

export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memory = process.memoryUsage();

  const healthData = {
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    uptimeFormatted: formatUptime(uptimeSeconds),
    memoryMb: {
      rss: Math.round(memory.rss / (1024 * 1024)),
      heapTotal: Math.round(memory.heapTotal / (1024 * 1024)),
      heapUsed: Math.round(memory.heapUsed / (1024 * 1024)),
    },
    providers: {
      localHeuristics: {
        status: 'operational',
        latencyMs: 1,
        mode: 'zero_cost_offline',
      },
      cloudAiGateway: {
        status: process.env.GEMINI_API_KEY ? 'operational' : 'fallback_ready',
        provider: 'Google Gemini 3.5 Flash',
        requiresConsent: true,
      },
      virusTotal: {
        status: process.env.VIRUSTOTAL_API_KEY ? 'operational' : 'fallback_ready',
        provider: 'VirusTotal Threat Intelligence v3',
        engines: '70+ AV Engines',
        requiresConsent: true,
      },
    },
    securityControls: {
      antiSsrfGuard: 'active',
      piiRedactor: 'active',
      locationTracking: 'disabled_by_default',
      serverRetention: 'ephemeral_zero_storage',
    },
  };

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}
