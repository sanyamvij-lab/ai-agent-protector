import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/gateway/middleware-helpers';

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const hasCloudKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
  const hasVtKey = Boolean(process.env.VIRUSTOTAL_API_KEY && process.env.VIRUSTOTAL_API_KEY.length >= 32);

  const providerStatus = {
    request_id: requestId,
    timestamp: new Date().toISOString(),
    providers: [
      {
        id: 'local_heuristics',
        name: 'Deterministic Heuristic & Pattern Engine',
        type: 'local',
        status: 'available',
        cost: '$0.00',
        privacy_boundary: '100% on-device / in-memory execution',
        requires_consent: false,
      },
      {
        id: 'gemini_flash',
        name: 'Google Gemini 3.5 Flash Neural Engine',
        type: 'cloud',
        status: hasCloudKey ? 'available' : 'unconfigured_fallback_ready',
        cost: 'Free tier / Pay-per-token',
        privacy_boundary: 'Pre-flight PII-redacted transit only',
        requires_consent: true,
      },
      {
        id: 'virustotal_v3',
        name: 'VirusTotal Threat Intelligence v3 (70+ AV Engines)',
        type: 'cloud',
        status: hasVtKey ? 'available' : 'unconfigured_fallback_ready',
        cost: 'Public API / 4 req/min',
        privacy_boundary: 'SHA-256 hash & public domain lookups only; zero user files transmitted',
        requires_consent: true,
      },
      {
        id: 'web_crypto',
        name: 'W3C Web Cryptography Stream Engine',
        type: 'local',
        status: 'available',
        cost: '$0.00',
        privacy_boundary: 'Client-side memory only; zero network transfer',
        requires_consent: false,
      },
    ],
  };

  return NextResponse.json(providerStatus, {
    status: 200,
    headers: {
      'x-request-id': requestId,
      'Cache-Control': 'no-store',
    },
  });
}
