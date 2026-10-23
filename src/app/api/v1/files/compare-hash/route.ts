import { NextRequest } from 'next/server';
import { z } from 'zod';
import { SafeLogger } from '@/lib/observability/logger';
import { VirusTotalService } from '@/lib/security/virustotal-service';
import { AuthService } from '@/lib/auth/auth-service';
import {
  getOrCreateRequestId,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/gateway/middleware-helpers';

const CompareHashSchema = z.object({
  calculated_hash: z.string().min(32, 'Hash must be at least 32 characters').max(128, 'Hash exceeds 128 characters'),
  reference_hash: z.string().min(32, 'Reference hash must be at least 32 characters').max(128, 'Reference hash exceeds 128 characters'),
});

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);

  try {
    const body = await req.json();
    const parsed = CompareHashSchema.safeParse(body);

    if (!parsed.success) {
      SafeLogger.warn('api/v1/files/compare-hash', 'validation_failed', 'Invalid compare hash payload', { errors: parsed.error.format() }, requestId);
      return createErrorResponse('VALIDATION_ERROR', 'Hash comparison input failed schema validation.', 400, requestId);
    }

    const calc = parsed.data.calculated_hash.trim().toLowerCase();
    const ref = parsed.data.reference_hash.trim().toLowerCase();

    // Constant-time timing-safe comparison to prevent side-channel timing attacks
    const isMatch = AuthService.constantTimeEqual(calc, ref);

    let algorithm = 'UNKNOWN';
    if (calc.length === 64) algorithm = 'SHA-256';
    else if (calc.length === 128) algorithm = 'SHA-512';
    else if (calc.length === 40) algorithm = 'SHA-1';
    else if (calc.length === 32) algorithm = 'MD5';

    let vtReport = null;
    if (algorithm === 'SHA-256' && VirusTotalService.isConfigured()) {
      try {
        vtReport = await VirusTotalService.checkFileHash(calc);
      } catch {
        // Safe fallback
      }
    }

    const result = {
      status: 'completed' as const,
      is_match: isMatch,
      algorithm_detected: algorithm,
      calculated_hash: calc,
      reference_hash: ref,
      virus_total: vtReport,
      explanation: isMatch
        ? `Checksum Match (${algorithm}): The calculated hash exactly matches the reference hash. Byte-level integrity confirmed.`
        : `Checksum Mismatch: The calculated hash does NOT match the supplied reference. File may be modified or different release version.`,
      limitations: [
        'Hash equality confirms identical byte sequences to the reference. Multi-engine AV lookups query existing threat registries without transferring file data.',
      ],
      privacy_receipt: {
        processed_locally: vtReport ? false : true,
        network_transferred: vtReport ? true : false,
      },
    };

    return createSuccessResponse(result, requestId);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal hash comparison fault';
    SafeLogger.error('api/v1/files/compare-hash', 'unhandled_error', errorMsg, undefined, requestId);
    return createErrorResponse('INTERNAL_ERROR', 'A secure error occurred during hash comparison.', 500, requestId);
  }
}
