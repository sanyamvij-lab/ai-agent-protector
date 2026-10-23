import { NextRequest } from 'next/server';
import { z } from 'zod';
import { AiGateway } from '@/lib/gateway/ai-gateway';
import { SafeLogger } from '@/lib/observability/logger';
import {
  getOrCreateRequestId,
  getClientIp,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/gateway/middleware-helpers';

const MessageScanSchema = z.object({
  text: z.string().min(1, 'Message text cannot be empty').max(16000, 'Payload exceeds 16KB limit'),
  mode: z.enum(['local', 'hybrid', 'cloud']).default('local'),
});

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const clientIp = getClientIp(req);

  try {
    const body = await req.json();
    const parsed = MessageScanSchema.safeParse(body);

    if (!parsed.success) {
      SafeLogger.warn('api/v1/scans/messages', 'validation_failed', 'Invalid input payload', { errors: parsed.error.format() }, requestId);
      return createErrorResponse('VALIDATION_ERROR', 'Message input failed schema validation.', 400, requestId);
    }

    const { text, mode } = parsed.data;
    const result = await AiGateway.processMessage(text, mode, clientIp);

    SafeLogger.info('api/v1/scans/messages', 'scan_completed', 'Threat analysis completed', {
      risk_level: result.riskLevel,
      signals_count: result.signals.length,
      pii_scrubbed_count: result.privacyReceipt.piiScrubbedCount,
      mode: result.processingMode,
    }, requestId);

    // Normalize to v1 API envelope
    const normalized = {
      status: 'completed' as const,
      assessment: result.riskLevel,
      category: result.category,
      confidence_score: result.confidenceScore,
      summary: result.summary,
      signals: result.signals.map(s => ({
        code: s.id,
        label: s.label,
        category: s.category,
        severity: s.severity,
        description: s.description,
        matched_text: s.matchedText,
      })),
      evidence: result.externalSources || [],
      uncertainty: {
        level: result.confidenceScore < 0.8 ? 'moderate' : 'low',
        explanation: result.limitations,
      },
      processing: {
        mode: result.processingMode,
        provider: result.processingMode === 'cloud' ? 'gemini_flash_gateway' : 'local_rule_heuristics',
      },
      safe_next_steps: result.safeNextSteps,
      limitations: [result.limitations],
      privacy_receipt: {
        processed_locally: result.privacyReceipt.processedLocally,
        pii_scrubbed_count: result.privacyReceipt.piiScrubbedCount,
        network_transferred: result.privacyReceipt.networkTransferred,
      },
    };

    return createSuccessResponse(normalized, requestId);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal analysis fault';
    if (errorMsg.includes('Rate limit')) {
      SafeLogger.warn('api/v1/scans/messages', 'rate_limit', 'Rate limit exceeded for IP', { clientIp }, requestId);
      return createErrorResponse('RATE_LIMIT_EXCEEDED', 'Rate limit of 30 requests/minute exceeded. Please wait.', 429, requestId);
    }
    SafeLogger.error('api/v1/scans/messages', 'unhandled_error', errorMsg, undefined, requestId);
    return createErrorResponse('INTERNAL_ERROR', 'A secure error occurred during risk analysis.', 500, requestId);
  }
}
