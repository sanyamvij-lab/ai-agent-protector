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

const UrlScanSchema = z.object({
  url: z.string().min(1, 'Target URL cannot be empty').max(2048, 'URL exceeds 2048 characters'),
  mode: z.enum(['local', 'hybrid', 'cloud']).default('local'),
});

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const clientIp = getClientIp(req);

  try {
    const body = await req.json();
    const parsed = UrlScanSchema.safeParse(body);

    if (!parsed.success) {
      SafeLogger.warn('api/v1/scans/urls', 'validation_failed', 'Invalid URL input', { errors: parsed.error.format() }, requestId);
      return createErrorResponse('VALIDATION_ERROR', 'URL input failed validation.', 400, requestId);
    }

    const { url, mode } = parsed.data;
    const result = await AiGateway.processLink(url, mode, clientIp);

    SafeLogger.info('api/v1/scans/urls', 'url_inspected', 'Link inspected with anti-SSRF', {
      domain: result.domain,
      risk_level: result.riskLevel,
      is_ssrf_hazard: result.isPrivateOrLoopback,
      is_typosquatting: result.isTyposquatting,
    }, requestId);

    const normalized = {
      status: 'completed' as const,
      assessment: result.riskLevel,
      submitted_url: result.submittedUrl,
      canonical_url: result.canonicalUrl,
      domain: result.domain,
      is_https: result.isHttps,
      is_private_or_loopback: result.isPrivateOrLoopback,
      has_punycode: result.hasPunycode,
      decoded_punycode: result.decodedPunycode,
      is_typosquatting: result.isTyposquatting,
      target_brand_matched: result.targetBrandMatched,
      suspicious_tld: result.suspiciousTld,
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
      uncertainty: {
        level: result.riskLevel === 'high_risk' ? 'low' : 'moderate',
        explanation: result.limitations,
      },
      processing: {
        mode: result.processingMode,
        provider: 'anti_ssrf_url_guard',
      },
      safe_next_steps: result.safeNextSteps,
      limitations: [result.limitations],
      privacy_receipt: result.privacyReceipt,
      virus_total: result.virusTotal || null,
    };

    return createSuccessResponse(normalized, requestId);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal link inspection fault';
    if (errorMsg.includes('Rate limit')) {
      return createErrorResponse('RATE_LIMIT_EXCEEDED', 'Rate limit exceeded. Please wait.', 429, requestId);
    }
    SafeLogger.error('api/v1/scans/urls', 'unhandled_error', errorMsg, undefined, requestId);
    return createErrorResponse('INTERNAL_ERROR', 'A secure error occurred during URL audit.', 500, requestId);
  }
}
