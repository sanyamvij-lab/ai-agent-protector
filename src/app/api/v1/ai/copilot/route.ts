import { NextRequest } from 'next/server';
import { z } from 'zod';
import { GeminiService, CopilotForensicDossier } from '@/lib/ai/gemini-service';
import { PrivacyRedactor } from '@/lib/privacy/redactor';
import { UrlInspector } from '@/lib/security/url-inspector';
import { MessageAnalyzer } from '@/lib/security/message-analyzer';
import { VirusTotalService } from '@/lib/security/virustotal-service';
import { AiGateway } from '@/lib/gateway/ai-gateway';
import { SafeLogger } from '@/lib/observability/logger';
import {
  getOrCreateRequestId,
  getClientIp,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/gateway/middleware-helpers';

const CopilotSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(3000, 'Message exceeds 3000 characters limit'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(3000),
      })
    )
    .default([]),
  context: z.string().max(2000).optional(),
});

/**
 * Extracts candidate URLs, domains, and IP addresses from message text.
 */
function extractCandidateUrls(text: string): string[] {
  const urlRegex =
    /(?:https?:\/\/|www\.)[^\s<>"'()]+|(?:\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|net|org|xyz|top|click|info|biz|ru|cn|live|online|security|support|io|dev|app|zip|mov)\b(?:\/[^\s<>"'()]*)?)|(?:\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?(?:\/[^\s<>"'()]*)?\b)|(?:\blocalhost(?::\d+)?(?:\/[^\s<>"'()]*)?\b)/gi;
  const matches = text.match(urlRegex) || [];
  const seen = new Set<string>();
  const results: string[] = [];

  for (const m of matches) {
    const clean = m.trim().replace(/[.,;:!?)]+$/, '');
    if (clean && !seen.has(clean.toLowerCase())) {
      seen.add(clean.toLowerCase());
      results.push(clean);
    }
  }
  return results;
}

/**
 * Builds a strict, forensic fallback response when cloud AI is unreachable.
 */
function buildStrictOfflineReply(
  forensicDossier: CopilotForensicDossier,
  redactedText: string
): string {
  const isHighRisk = forensicDossier.overallThreatLevel === 'high_risk';
  const isSuspicious = forensicDossier.overallThreatLevel === 'suspicious';

  if (isHighRisk || isSuspicious) {
    let text = `[THREAT LEVEL: ${forensicDossier.overallThreatLevel.toUpperCase()}] 🚨 **AI Protector Zero-Trust Defense Alert**\n\n`;
    text += `Our local security engine flagged **high-risk hazards** in your submitted query:\n\n`;

    if (forensicDossier.linksAnalyzed && forensicDossier.linksAnalyzed.length > 0) {
      text += `**Link Forensic Deconstruction:**\n`;
      for (const link of forensicDossier.linksAnalyzed) {
        text += `• **Target URL**: \`${link.url}\`\n`;
        text += `  - **Domain**: \`${link.domain}\`\n`;
        if (link.isTyposquatting) {
          text += `  - ⚠️ **Brand Typosquatting**: Impersonating **${link.targetBrandMatched || 'Major Brand'}**!\n`;
        }
        if (link.isPrivateOrLoopback) {
          text += `  - 🚨 **Anti-SSRF Triggered**: Targets private/internal network infrastructure!\n`;
        }
        if (!link.isHttps) {
          text += `  - ⚠️ **Insecure Protocol**: Plain unencrypted HTTP.\n`;
        }
        if (link.vtEnginesFlagged && link.vtEnginesFlagged > 0) {
          text += `  - 🛑 **VirusTotal Intelligence**: Flagged by ${link.vtEnginesFlagged} antivirus engines.\n`;
        }
        text += `  - **Strict Verdict**: **DO NOT OPEN OR CLICK THIS LINK.**\n\n`;
      }
    }

    if (forensicDossier.messageScan && forensicDossier.messageScan.signals.length > 0) {
      text += `**Message Social Engineering Indicators:**\n`;
      for (const sig of forensicDossier.messageScan.signals) {
        text += `• **${sig.label}** [${sig.severity.toUpperCase()}]: ${sig.description}\n`;
      }
      text += `\n`;
    }

    text += `**Mandatory Tactical Actions:**\n`;
    text += `1. **Do not click** or navigate to any links in the message.\n`;
    text += `2. **Never enter passwords, OTP codes, or SSN** on unverified websites.\n`;
    text += `3. **Block the sender** immediately across your messaging channels.\n`;
    text += `4. If you have already interacted, **change your passwords** immediately from a separate device and notify your bank's fraud desk.\n\n`;
    text += `*(Operating via Local Zero-Trust Heuristic Engine with pre-flight PII scrub)*`;
    return text;
  }

  // General fallback when benign or query
  return `[THREAT LEVEL: BENIGN / GENERAL INQUIRY]\n\nI am currently operating in **Local Zero-Trust Mode**. Here are essential security protocols regarding your inquiry:\n\n• **Zero-Trust for Unsolicited Contacts**: Verify all incoming communications through an independent, pre-established channel.\n• **Never Disclose Credentials**: Legitimate institutions will never solicit passwords, PINs, or 2FA codes.\n• **Audit URLs Before Clicking**: Examine the full domain for subtle spelling modifications or unfamiliar top-level domains.\n• **Preserve Evidence**: Take screenshots and report scam communications to official cybercrime authorities (e.g. FTC or IC3).\n\n*(Your query was pre-redacted locally before evaluation)*`;
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const clientIp = getClientIp(req);

  let piiCount = 0;
  let forensicDossier: CopilotForensicDossier = {
    overallThreatLevel: 'low',
    linksAnalyzed: [],
    messageScan: undefined,
    detectedThreatTypes: [],
  };

  try {
    // 1. Rate Limiting Check
    if (!AiGateway.checkRateLimit(clientIp)) {
      return createErrorResponse('RATE_LIMIT_EXCEEDED', 'Rate limit exceeded. Please wait a moment.', 429, requestId);
    }

    const body = await req.json();
    const parsed = CopilotSchema.safeParse(body);

    if (!parsed.success) {
      SafeLogger.warn('api/v1/ai/copilot', 'validation_failed', 'Invalid copilot payload', { errors: parsed.error.format() }, requestId);
      return createErrorResponse('VALIDATION_ERROR', 'Input failed schema validation.', 400, requestId);
    }

    const { message, history, context } = parsed.data;

    // 2. Pre-flight PII Scrubbing
    const redactedUserQuery = PrivacyRedactor.redact(message);
    piiCount = redactedUserQuery.entitiesFound.length;

    // 3. Deep Link Extraction & Inspection
    const candidateUrls = extractCandidateUrls(redactedUserQuery.redactedText);
    const linksAnalyzed: NonNullable<CopilotForensicDossier['linksAnalyzed']> = [];
    const detectedThreatTypes: string[] = [];

    for (const rawCandidate of candidateUrls) {
      const urlInspection = UrlInspector.inspect(rawCandidate, 'cloud');
      let vtEnginesFlagged: number | undefined = undefined;

      // Check VirusTotal if configured and not a private host
      if (!urlInspection.isPrivateOrLoopback && VirusTotalService.isConfigured() && urlInspection.domain !== 'invalid') {
        try {
          const vtReport = await VirusTotalService.checkDomain(urlInspection.domain);
          if (vtReport && vtReport.stats.malicious > 0) {
            vtEnginesFlagged = vtReport.stats.malicious;
          }
        } catch {
          // VirusTotal check failure is non-blocking
        }
      }

      linksAnalyzed.push({
        url: urlInspection.submittedUrl,
        domain: urlInspection.domain,
        riskLevel: urlInspection.riskLevel,
        isPrivateOrLoopback: urlInspection.isPrivateOrLoopback,
        isTyposquatting: urlInspection.isTyposquatting,
        targetBrandMatched: urlInspection.targetBrandMatched,
        isHttps: urlInspection.isHttps,
        hasPunycode: urlInspection.hasPunycode,
        suspiciousTld: urlInspection.suspiciousTld,
        summary: urlInspection.summary,
        vtEnginesFlagged,
      });

      if (urlInspection.isTyposquatting) detectedThreatTypes.push('brand_typosquatting');
      if (urlInspection.isPrivateOrLoopback) detectedThreatTypes.push('ssrf_private_network');
      if (urlInspection.suspiciousTld) detectedThreatTypes.push('suspicious_tld');
      if (vtEnginesFlagged && vtEnginesFlagged > 0) detectedThreatTypes.push('virustotal_malicious');
    }

    // 4. Message Threat Heuristic Inspection
    const messageScan = MessageAnalyzer.analyze(redactedUserQuery.redactedText, 'cloud');
    if (messageScan.signals.length > 0) {
      for (const sig of messageScan.signals) {
        detectedThreatTypes.push(sig.id);
      }
    }

    // 5. Compute Consolidated Zero-Trust Threat Level
    let overallThreatLevel: CopilotForensicDossier['overallThreatLevel'] = 'low';

    const hasHighRiskLink = linksAnalyzed.some(
      (l) => l.riskLevel === 'high_risk' || l.isPrivateOrLoopback || l.isTyposquatting || (l.vtEnginesFlagged && l.vtEnginesFlagged > 0)
    );
    const hasHighRiskMessage = messageScan.riskLevel === 'high_risk' || messageScan.signals.some((s) => s.severity === 'high');

    if (hasHighRiskLink || hasHighRiskMessage) {
      overallThreatLevel = 'high_risk';
    } else if (
      linksAnalyzed.some((l) => l.riskLevel === 'suspicious' || l.suspiciousTld || !l.isHttps) ||
      messageScan.riskLevel === 'suspicious' ||
      messageScan.signals.length > 0
    ) {
      overallThreatLevel = 'suspicious';
    }

    forensicDossier = {
      overallThreatLevel,
      linksAnalyzed,
      messageScan: {
        category: messageScan.category,
        riskLevel: messageScan.riskLevel,
        signals: messageScan.signals.map((s) => ({
          id: s.id,
          label: s.label,
          category: s.category,
          severity: s.severity,
          description: s.description,
        })),
      },
      detectedThreatTypes: Array.from(new Set(detectedThreatTypes)),
    };

    SafeLogger.info('api/v1/ai/copilot', 'copilot_inquiry', 'Consulting AI Security Copilot with strict forensic feed', {
      history_depth: history.length,
      pii_scrubbed_count: piiCount,
      links_analyzed_count: linksAnalyzed.length,
      message_signals_count: messageScan.signals.length,
      threat_level: overallThreatLevel,
    }, requestId);

    // 6. Invoke Gemini with strict Zero-Trust forensic dossier
    const reply = await GeminiService.copilotChat(
      history,
      redactedUserQuery.redactedText,
      context,
      forensicDossier
    );

    return createSuccessResponse(
      {
        reply,
        pii_scrubbed_count: piiCount,
        provider: 'gemini_3.5_flash',
        model_version: '3.5-flash-2026',
        strict_mode: true,
        threat_level: overallThreatLevel,
        forensic_analysis: {
          threat_level: overallThreatLevel,
          links_scanned: linksAnalyzed,
          message_signals: messageScan.signals,
          detected_threat_types: forensicDossier.detectedThreatTypes,
        },
        privacy_receipt: {
          processed_locally: false,
          pii_scrubbed_count: piiCount,
          network_transferred: true,
        },
      },
      requestId
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal copilot fault';
    SafeLogger.error('api/v1/ai/copilot', 'unhandled_error', errorMsg, undefined, requestId);

    // Dynamic offline forensic security response
    const fallbackReply = buildStrictOfflineReply(forensicDossier, '');

    return createSuccessResponse(
      {
        reply: fallbackReply,
        pii_scrubbed_count: piiCount,
        provider: 'offline_zero_trust_heuristics',
        fallback: true,
        strict_mode: true,
        threat_level: forensicDossier.overallThreatLevel,
        forensic_analysis: {
          threat_level: forensicDossier.overallThreatLevel,
          links_scanned: forensicDossier.linksAnalyzed,
          message_signals: forensicDossier.messageScan?.signals || [],
          detected_threat_types: forensicDossier.detectedThreatTypes,
        },
      },
      requestId
    );
  }
}
