import { NextRequest } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { SafeLogger } from '@/lib/observability/logger';
import { VirusTotalService } from '@/lib/security/virustotal-service';
import {
  getOrCreateRequestId,
  getClientIp,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/gateway/middleware-helpers';

// Bound maximum payload to 10MB base64 to avoid memory saturation
const FileHashSchema = z.object({
  content_base64: z.string().min(1, 'File content cannot be empty').max(14 * 1024 * 1024, 'File content exceeds 10MB limit'),
  file_name: z.string().max(255).default('unknown_file'),
  comparison_hash: z.string().max(128).optional(),
});

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const clientIp = getClientIp(req);

  try {
    const body = await req.json();
    const parsed = FileHashSchema.safeParse(body);

    if (!parsed.success) {
      SafeLogger.warn('api/v1/files/hash', 'validation_failed', 'Invalid hash input payload', { errors: parsed.error.format() }, requestId);
      return createErrorResponse('VALIDATION_ERROR', 'File hash input failed schema validation.', 400, requestId);
    }

    const { content_base64, file_name, comparison_hash } = parsed.data;

    // Sanitize filename to prevent path traversal in reports
    const safeFileName = file_name.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Decode base64 in ephemeral memory
    let buffer: Buffer;
    try {
      buffer = Buffer.from(content_base64, 'base64');
    } catch {
      return createErrorResponse('VALIDATION_ERROR', 'Invalid base64 encoding provided.', 400, requestId);
    }

    const sha256Hex = crypto.createHash('sha256').update(buffer).digest('hex');
    const sha512Hex = crypto.createHash('sha512').update(buffer).digest('hex');

    let isMatch: boolean | undefined = undefined;
    if (comparison_hash && comparison_hash.trim().length > 0) {
      const cleanExpected = comparison_hash.trim().toLowerCase();
      isMatch = sha256Hex.toLowerCase() === cleanExpected || sha512Hex.toLowerCase() === cleanExpected;
    }

    // Query VirusTotal for multi-engine antivirus intelligence (zero raw file transfer)
    let vtReport = null;
    if (VirusTotalService.isConfigured()) {
      try {
        vtReport = await VirusTotalService.checkFileHash(sha256Hex);
      } catch {
        // Safe fallback
      }
    }

    SafeLogger.info('api/v1/files/hash', 'hash_calculated', 'Cryptographic hash calculated', {
      file_name: safeFileName,
      size_bytes: buffer.length,
      has_comparison: !!comparison_hash,
      is_match: isMatch,
      has_vt_report: !!vtReport,
    }, requestId);

    let explanation = isMatch === true
      ? 'Verification Match: The calculated SHA-256 hash matches the supplied reference. Byte-level integrity confirmed.'
      : isMatch === false
      ? 'Mismatch Warning: The calculated hash does NOT match the reference hash. The file may be altered or corrupted.'
      : 'Integrity Hash Calculated: Compare this checksum against the trusted author\'s published checksum.';

    if (vtReport) {
      if (vtReport.stats.malicious > 0) {
        explanation += ` [VIRUSTOTAL CRITICAL ALERT]: ${vtReport.stats.malicious} antivirus engine(s) flagged this file hash as malicious!`;
      } else if (vtReport.stats.suspicious > 0) {
        explanation += ` [VIRUSTOTAL NOTICE]: ${vtReport.stats.suspicious} security engine(s) flagged suspicious characteristics for this hash.`;
      } else if (vtReport.status === 'clean') {
        explanation += ` [VIRUSTOTAL VERIFIED]: Analyzed across ${vtReport.totalEngines} global antivirus engines with zero malicious detections.`;
      } else if (vtReport.status === 'not_found') {
        explanation += ` [VIRUSTOTAL INDEX]: This cryptographic hash has not been previously observed in global malware datasets.`;
      }
    }

    const result = {
      status: 'completed' as const,
      file_name: safeFileName,
      size_bytes: buffer.length,
      sha256: sha256Hex,
      sha512: sha512Hex,
      comparison_hash: comparison_hash || null,
      is_match: isMatch,
      explanation,
      virus_total: vtReport,
      limitations: [
        'Cryptographic hash equality verifies byte-level identity with a reference. Multi-engine AV lookups query existing public threat registries without transferring file data.',
      ],
      privacy_receipt: {
        processed_locally: false,
        ephemeral_in_memory: true,
        persisted_to_disk: false,
        retained: false,
      },
    };

    return createSuccessResponse(result, requestId);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal hash calculation fault';
    SafeLogger.error('api/v1/files/hash', 'unhandled_error', errorMsg, undefined, requestId);
    return createErrorResponse('INTERNAL_ERROR', 'A secure error occurred during hash calculation.', 500, requestId);
  }
}
