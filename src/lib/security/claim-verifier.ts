// AI Protector - Misinformation & Factual Claim Triage
// Decomposes statements into testable claims, assesses verifiability, and enforces evidence-over-certainty.

import { ClaimVerifyResult, RiskSignal, RiskLevel } from '../types';

export class ClaimVerifier {
  private static readonly SENSATIONAL_WORDS = [
    'shocking secret', 'they don\'t want you to know', 'mainstream media won\'t report',
    'miracle cure', 'hidden truth', '100% proven', 'guaranteed cover-up',
    'conspiracy', 'wake up people', 'censored by government'
  ];

  private static readonly OPINION_MARKERS = [
    'i feel', 'in my opinion', 'should', 'ought to', 'best ever',
    'worst decision', 'everyone agrees that', 'obviously bad', 'terrible policy'
  ];

  /**
   * Evaluates a claim or news excerpt for verifiable factual components vs subjective sentiment.
   */
  public static verify(claimText: string, processingMode: 'local' | 'hybrid' | 'cloud' = 'local'): ClaimVerifyResult {
    const trimmed = (claimText || '').trim();
    const signals: RiskSignal[] = [];

    // Split into sentences for claim decomposition
    const sentences = trimmed.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 0);
    const factualClaims: string[] = [];
    const subjectiveSentiments: string[] = [];

    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      const hasOpinion = this.OPINION_MARKERS.some(marker => lower.includes(marker));
      const hasNumbersOrEvents = /\b\d{4}\b|\b\d+%\b|\b(announced|signed|passed|reported|discovered|banned|approved)\b/i.test(sentence);

      if (hasOpinion && !hasNumbersOrEvents) {
        subjectiveSentiments.push(sentence);
      } else {
        factualClaims.push(sentence);
      }
    }

    // Check sensational / clickbait triggers
    const sensationalFound = this.SENSATIONAL_WORDS.filter(w => trimmed.toLowerCase().includes(w));
    if (sensationalFound.length > 0) {
      signals.push({
        id: 'sensational_framing',
        label: 'Sensationalized / Emotional Framing',
        category: 'misinformation',
        severity: 'medium',
        description: `Uses emotionally charged phrases (${sensationalFound.join(', ')}), commonly employed to inhibit critical verification.`,
      });
    }

    // Check for absence of cited sources
    const hasSourceAttribution = /\b(according to|study published in|reuters|associated press|peer-reviewed|official report|university of)\b/i.test(trimmed);
    if (!hasSourceAttribution && factualClaims.length > 0) {
      signals.push({
        id: 'unattributed_claims',
        label: 'Unattributed Factual Assertions',
        category: 'misinformation',
        severity: 'low',
        description: 'Makes specific factual or scientific claims without citing a primary study, institutional data, or primary source.',
      });
    }

    let verdict: ClaimVerifyResult['verdict'] = 'unverified';
    let riskLevel: RiskLevel = 'unverified';
    let summary = 'Claim requires independent verification against primary sources.';

    if (sensationalFound.length > 0 && !hasSourceAttribution) {
      verdict = 'lacks_context';
      riskLevel = 'suspicious';
      summary = 'Contains emotionally charged language with unverified factual assertions. Exercise high skepticism.';
    } else if (hasSourceAttribution) {
      verdict = 'unverified';
      riskLevel = 'info';
      summary = 'References external entities or reporting. Check primary documentation directly.';
    }

    const verificationGuidance = [
      'Locate the primary document: If a study or executive order is claimed, search the official government or journal archive directly.',
      'Check established non-partisan fact-checking archives (e.g. Reuters Fact Check, AP Fact Check, Snopes).',
      'Look for consensus: Determine whether other reputable international news agencies report the same findings independently.',
      'Reverse image/quote search: Check if quotes or images were taken out of chronological context.'
    ];

    const externalSources = [
      { title: 'Reuters Fact Check Archive', url: 'https://www.reuters.com/fact-check/', relevance: 'Global news and claims verification' },
      { title: 'Associated Press Fact Check', url: 'https://apnews.com/hub/ap-fact-check', relevance: 'Independent investigative reporting' },
      { title: 'Snopes Fact Checking', url: 'https://www.snopes.com/', relevance: 'Rumor, folklore and viral claim debunking' },
      { title: 'Full Fact UK', url: 'https://fullfact.org/', relevance: 'Statistical and public policy claims' },
    ];

    return {
      id: `claim-verify-${Date.now()}`,
      timestamp: new Date().toISOString(),
      processingMode,
      riskLevel,
      confidenceScore: 0.75,
      summary,
      claimStatement: trimmed,
      verdict,
      factualClaims: factualClaims.length > 0 ? factualClaims : [trimmed],
      subjectiveSentiments,
      signals,
      verificationGuidance,
      limitations: 'Automated claim triage identifies structural credibility markers and checkable assertions. It does not replace journalistic investigative research or domain expertise.',
      safeNextSteps: [
        'Do not share or republish unverified claims on social media.',
        'Consult the verified sources linked below before drawing conclusions.',
      ],
      externalSources,
      privacyReceipt: {
        processedLocally: true,
        piiScrubbedCount: 0,
        networkTransferred: false,
      },
    };
  }
}
