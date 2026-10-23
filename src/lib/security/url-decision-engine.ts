// AI Protector - URL Scan Decision Engine (Section 5 Contract v3)
import { randomUUID } from 'crypto';
import { NormalizedUrlResult } from './url-normalizer';
import { EvidenceItem } from './url-heuristics';
import { ProviderResult } from './providers/webrisk-provider';

export type { EvidenceItem } from './url-heuristics';

export type TargetType = 'url' | 'message' | 'file' | 'github_repo' | 'agent_component';
export type ScanStatus = 'known_malicious' | 'suspicious' | 'no_known_threat' | 'inconclusive' | 'unavailable';
export type ScanCategory =
  | 'malware'
  | 'phishing'
  | 'unwanted_software'
  | 'impersonation'
  | 'scam'
  | 'prompt_injection'
  | 'supply_chain'
  | 'none'
  | 'unknown';

export interface ScorecardPosture {
  source: 'scorecard';
  score: number;
  checks: Array<{
    name: string;
    score: number;
    reason: string;
    details?: string[];
  }>;
}

export interface ScanResultContract {
  scan_id: string;
  target_type: TargetType;
  status: ScanStatus;
  category: ScanCategory;
  evidence: EvidenceItem[];
  posture?: ScorecardPosture | null;
  provider_status: Array<{
    provider: string;
    state: 'ok' | 'timeout' | 'quota' | 'error' | 'not_configured';
    latency_ms: number;
  }>;
  explanation: string;
  recommended_action: string;
  limitations: string[];
  scanned_at: string;
  // Non-contract helper metadata for presentation (host only, never raw credentials/query)
  host?: string;
  url_hash?: string;
}

export class UrlDecisionEngine {
  /**
   * Evaluates normalized URL, heuristics, and provider lookups into strict Section 5 Contract.
   */
  public static evaluate(
    normalized: NormalizedUrlResult,
    heuristics: EvidenceItem[],
    providerResult: ProviderResult
  ): ScanResultContract {
    const scanId = randomUUID();
    const now = new Date().toISOString();
    const evidenceList: EvidenceItem[] = [...heuristics];

    const providerStatusEntry = {
      provider: providerResult.provider,
      state: providerResult.state,
      latency_ms: providerResult.latency_ms,
    };

    const limitations: string[] = [];

    // 1. Check for Provider Match -> known_malicious
    if (providerResult.state === 'ok' && providerResult.threatMatch) {
      const tt = providerResult.threatMatch.threatType;
      let category: ScanCategory = 'malware';
      if (tt === 'SOCIAL_ENGINEERING') category = 'phishing';
      else if (tt === 'UNWANTED_SOFTWARE') category = 'unwanted_software';

      evidenceList.unshift({
        source: 'web_risk',
        engine_version: '1.0.0',
        ruleset_id: 'google-webrisk-v1',
        type: `google_web_risk_${tt.toLowerCase()}`,
        detail: `Google Web Risk identified this URL as a confirmed ${category} distribution target.`,
        observed_at: now,
      });

      limitations.push('Threat intelligence is compiled from global telemetry and may reflect recently active hazards.');

      return {
        scan_id: scanId,
        target_type: 'url',
        status: 'known_malicious',
        category,
        evidence: evidenceList,
        posture: null,
        provider_status: [providerStatusEntry],
        explanation: `Confirmed security hazard: This link is matched in licensed threat intelligence databases as actively distributing ${category}.`,
        recommended_action: 'Do not click or navigate to this link. Close the browser tab or message immediately.',
        limitations,
        scanned_at: now,
        host: normalized.host,
        url_hash: normalized.urlHash,
      };
    }

    // 2. Provider Unavailable / Unconfigured / Timeout / Quota / Error
    if (providerResult.state !== 'ok') {
      const state = providerResult.state;
      let reason = 'Threat intelligence provider was unavailable';
      if (state === 'not_configured') {
        reason = 'Licensed threat intelligence provider (Google Web Risk) is not configured in this environment.';
      } else if (state === 'timeout') {
        reason = 'Threat intelligence provider timed out after 3,000ms.';
      } else if (state === 'quota') {
        reason = 'Threat intelligence provider quota limit exceeded.';
      } else {
        reason = `Threat intelligence provider encountered an error: ${providerResult.errorMessage || 'unknown error'}.`;
      }

      limitations.push('Could not verify against live global threat databases.');
      limitations.push('Heuristic analysis was performed locally but cannot replace authoritative intelligence.');

      return {
        scan_id: scanId,
        target_type: 'url',
        status: 'unavailable',
        category: 'unknown',
        evidence: evidenceList,
        posture: null,
        provider_status: [providerStatusEntry],
        explanation: `Threat verification could not be completed: ${reason}`,
        recommended_action: 'Treat this link with extreme caution. Re-scan once network access or API credentials are restored.',
        limitations,
        scanned_at: now,
        host: normalized.host,
        url_hash: normalized.urlHash,
      };
    }

    // 3. Provider OK, No Provider Match -> Check Heuristics
    if (heuristics.length > 0) {
      // Determine dominant category from heuristics
      let category: ScanCategory = 'scam';
      const types = heuristics.map((h) => h.type);
      if (types.includes('brand_in_subdomain') || types.includes('credentials_in_url')) {
        category = 'phishing';
      } else if (types.includes('punycode_lookalike')) {
        category = 'impersonation';
      } else if (types.includes('ip_literal_host')) {
        category = 'unwanted_software';
      }

      limitations.push('No licensed threat-database match was returned for this host.');
      limitations.push('Detection is based on structural heuristics, which indicate elevated risk.');

      return {
        scan_id: scanId,
        target_type: 'url',
        status: 'suspicious',
        category,
        evidence: evidenceList,
        posture: null,
        provider_status: [providerStatusEntry],
        explanation: `Specific, explainable risk signals detected (${heuristics.map((h) => h.type).join(', ')}). While no global threat record is published, structural patterns match known attack techniques.`,
        recommended_action: 'Do not enter passwords, OTPs, or payment information on this destination.',
        limitations,
        scanned_at: now,
        host: normalized.host,
        url_hash: normalized.urlHash,
      };
    }

    // 4. Provider OK (No Match) AND Zero Heuristics -> no_known_threat
    limitations.push('No known threat detected is not a guarantee of safety.');
    limitations.push('Zero-day attacks, newly registered domains, or customized spear-phishing may not appear on threat lists immediately.');

    return {
      scan_id: scanId,
      target_type: 'url',
      status: 'no_known_threat',
      category: 'none',
      evidence: [],
      posture: null,
      provider_status: [providerStatusEntry],
      explanation: 'All configured threat intelligence providers and local structural heuristics verified this link with no known hazard matches.',
      recommended_action: 'Proceed with normal caution. Always verify sender identity before downloading attachments or entering credentials.',
      limitations,
      scanned_at: now,
      host: normalized.host,
      url_hash: normalized.urlHash,
    };
  }
}
