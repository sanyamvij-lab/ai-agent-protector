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

const ClaimVerifySchema = z.object({
  claim: z.string().min(1, 'Claim text cannot be empty').max(8000, 'Claim exceeds 8000 characters limit'),
  mode: z.enum(['local', 'hybrid', 'cloud']).default('local'),
});

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const clientIp = getClientIp(req);

  try {
    const body = await req.json();
    const parsed = ClaimVerifySchema.safeParse(body);

    if (!parsed.success) {
      SafeLogger.warn('api/v1/claims/verify', 'validation_failed', 'Invalid claim input payload', { errors: parsed.error.format() }, requestId);
      return createErrorResponse('VALIDATION_ERROR', 'Claim input failed schema validation.', 400, requestId);
    }

    const { claim, mode } = parsed.data;
    const result = await AiGateway.processClaim(claim, mode, clientIp);

    SafeLogger.info('api/v1/claims/verify', 'claim_verified', 'Claim verification completed', {
      verdict: result.verdict,
      risk_level: result.riskLevel,
      factual_claims_count: result.factualClaims.length,
      mode: result.processingMode,
    }, requestId);

    const normalized = {
      status: 'completed' as const,
      assessment: result.riskLevel,
      verdict: result.verdict,
      confidence_score: result.confidenceScore,
      summary: result.summary,
      claim_statement: result.claimStatement,
      factual_claims: result.factualClaims,
      subjective_sentiments: result.subjectiveSentiments,
      signals: result.signals.map(s => ({
        code: s.id,
        label: s.label,
        category: s.category,
        severity: s.severity,
        description: s.description,
        matched_text: s.matchedText,
      })),
      evidence: result.externalSources || [],
      verification_guidance: result.verificationGuidance,
      uncertainty: {
        level: result.confidenceScore < 0.8 ? 'moderate' : 'low',
        explanation: result.limitations,
      },
      processing: {
        mode: result.processingMode,
        provider: 'claim_triage_heuristics',
      },
      safe_next_steps: result.safeNextSteps,
      limitations: [result.limitations],
      privacy_receipt: result.privacyReceipt,
    };

    return createSuccessResponse(normalized, requestId);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal claim triage fault';
    if (errorMsg.includes('Rate limit')) {
      return createErrorResponse('RATE_LIMIT_EXCEEDED', 'Rate limit exceeded. Please wait.', 429, requestId);
    }
    SafeLogger.error('api/v1/claims/verify', 'unhandled_error', errorMsg, undefined, requestId);
    return createErrorResponse('INTERNAL_ERROR', 'A secure error occurred during claim triage.', 500, requestId);
  }
}
