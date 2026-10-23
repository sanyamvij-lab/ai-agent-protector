import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/gateway/middleware-helpers';

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);

  const auditReport = {
    request_id: requestId,
    timestamp: new Date().toISOString(),
    privacy_baseline: {
      geolocation_status: 'disabled_by_default',
      geolocation_policy: 'Geolocation APIs are never invoked for basic scam, spam, link, or hash analysis.',
      hardware_sensors: {
        camera: 'not_requested',
        microphone: 'not_requested',
        device_motion: 'not_requested',
      },
      server_storage_retention: 'ephemeral_zero_storage',
      raw_messages_persisted: false,
      uploaded_files_persisted: false,
      history_policy: 'Stored strictly in browser localStorage under user ownership; purgable via one-click wipe.',
    },
    redaction_engine: {
      status: 'active',
      scrubbed_entity_types: [
        'email_addresses',
        'social_security_numbers',
        'credit_card_numbers',
        'api_keys_and_bearer_tokens',
        'plaintext_passwords',
        'international_phone_numbers',
      ],
    },
  };

  return NextResponse.json(auditReport, {
    status: 200,
    headers: {
      'x-request-id': requestId,
      'Cache-Control': 'no-store',
    },
  });
}
