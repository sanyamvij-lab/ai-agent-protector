// AI Protector - Security Agent Core (Inspired by Claude-Code & Agentic Skills Architecture)
// Coordinates tools, runs verifiable security workflows, and enforces privacy boundaries.

import { PrivacyRedactor } from '../privacy/redactor';
import { MessageAnalyzer } from '../security/message-analyzer';
import { UrlInspector } from '../security/url-inspector';
import { ClaimVerifier } from '../security/claim-verifier';
import { CryptoHasher } from '../security/crypto-hasher';
import { GeminiService } from '../ai/gemini-service';
import { VirusTotalService } from '../security/virustotal-service';
import { SafeLogger } from '../observability/logger';
import { ProcessingMode } from '../types';

export interface AgentTool {
  name: string;
  description: string;
  category: 'threat_detection' | 'anti_ssrf' | 'integrity' | 'fact_check' | 'copilot';
  execute: (input: any, mode: ProcessingMode) => Promise<any>;
}

export interface AgentExecutionStep {
  toolName: string;
  status: 'started' | 'completed' | 'failed';
  durationMs: number;
  outputSummary: string;
  piiScrubbed: number;
}

export interface AgentRunResult {
  runId: string;
  timestamp: string;
  intent: string;
  mode: ProcessingMode;
  steps: AgentExecutionStep[];
  finalAssessment: 'high_risk' | 'suspicious' | 'low' | 'unverified';
  executiveSummary: string;
  tacticalAdvice: string[];
  privacyReceipt: {
    processedLocally: boolean;
    piiScrubbedCount: number;
    networkTransferred: boolean;
  };
}

export class SecurityAgentCore {
  private static readonly tools = new Map<string, AgentTool>([
    [
      'analyze_message',
      {
        name: 'analyze_message',
        description: 'Analyzes suspicious SMS, emails, or chat messages for phishing and social engineering.',
        category: 'threat_detection',
        execute: async (input: { text: string }, mode: ProcessingMode) => {
          const redacted = PrivacyRedactor.redact(input.text);
          if (mode === 'cloud' && process.env.GEMINI_API_KEY) {
            try {
              const geminiRes = await GeminiService.analyzeMessage(redacted.redactedText);
              return { result: geminiRes, piiCount: redacted.entitiesFound.length };
            } catch {
              const local = MessageAnalyzer.analyze(redacted.redactedText, mode);
              return { result: local, piiCount: redacted.entitiesFound.length };
            }
          }
          const local = MessageAnalyzer.analyze(redacted.redactedText, mode);
          return { result: local, piiCount: redacted.entitiesFound.length };
        },
      },
    ],
    [
      'inspect_url',
      {
        name: 'inspect_url',
        description: 'Inspects URLs with Anti-SSRF guards, punycode decoding, and typosquat checks.',
        category: 'anti_ssrf',
        execute: async (input: { url: string }, mode: ProcessingMode) => {
          const inspectRes = UrlInspector.inspect(input.url, mode);
          return { result: inspectRes, piiCount: 0 };
        },
      },
    ],
    [
      'verify_claim',
      {
        name: 'verify_claim',
        description: 'Triages factual claims against sensationalism, opinion, and citation guidelines.',
        category: 'fact_check',
        execute: async (input: { claim: string }, mode: ProcessingMode) => {
          const res = ClaimVerifier.verify(input.claim, mode);
          return { result: res, piiCount: 0 };
        },
      },
    ],
    [
      'virustotal_lookup',
      {
        name: 'virustotal_lookup',
        description: 'Queries 70+ antivirus engines for domain reputation or SHA-256 file hash detections.',
        category: 'threat_detection',
        execute: async (input: { domain?: string; hash?: string }, mode: ProcessingMode) => {
          if (mode === 'local' || !VirusTotalService.isConfigured()) {
            return { result: null, piiCount: 0, reason: 'Requires hybrid/cloud mode & VirusTotal key' };
          }
          if (input.hash) {
            const res = await VirusTotalService.checkFileHash(input.hash);
            return { result: res, piiCount: 0 };
          }
          if (input.domain) {
            const res = await VirusTotalService.checkDomain(input.domain);
            return { result: res, piiCount: 0 };
          }
          return { result: null, piiCount: 0 };
        },
      },
    ],
  ]);

  /**
   * Dispatches and coordinates security tools in a unified trace pipeline.
   */
  public static async executeWorkflow(
    intent: 'analyze_text' | 'audit_link' | 'triage_claim',
    payload: { content: string },
    mode: ProcessingMode = 'local'
  ): Promise<AgentRunResult> {
    const runId = `agent-run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startTime = Date.now();
    const steps: AgentExecutionStep[] = [];
    let totalPiiScrubbed = 0;

    let finalAssessment: AgentRunResult['finalAssessment'] = 'unverified';
    let executiveSummary = '';
    let tacticalAdvice: string[] = [];

    SafeLogger.info('agent_core', 'workflow_started', `Dispatching agent workflow: ${intent}`, { runId, mode });

    try {
      if (intent === 'analyze_text') {
        const stepStart = Date.now();
        const tool = this.tools.get('analyze_message')!;
        const { result, piiCount } = await tool.execute({ text: payload.content }, mode);
        totalPiiScrubbed += piiCount;

        steps.push({
          toolName: 'analyze_message',
          status: 'completed',
          durationMs: Date.now() - stepStart,
          outputSummary: `Detected risk: ${result.riskLevel}. Category: ${result.category}.`,
          piiScrubbed: piiCount,
        });

        finalAssessment = result.riskLevel;
        executiveSummary = result.summary;
        tacticalAdvice = result.safeNextSteps || [];
      } else if (intent === 'audit_link') {
        const stepStart = Date.now();
        const tool = this.tools.get('inspect_url')!;
        const { result } = await tool.execute({ url: payload.content }, mode);

        steps.push({
          toolName: 'inspect_url',
          status: 'completed',
          durationMs: Date.now() - stepStart,
          outputSummary: `Domain: ${result.domain}. SSRF risk: ${result.isPrivateOrLoopback}. Assessment: ${result.riskLevel}.`,
          piiScrubbed: 0,
        });

        finalAssessment = result.riskLevel;
        executiveSummary = result.summary;
        tacticalAdvice = result.safeNextSteps || [];
      } else if (intent === 'triage_claim') {
        const stepStart = Date.now();
        const tool = this.tools.get('verify_claim')!;
        const { result } = await tool.execute({ claim: payload.content }, mode);

        steps.push({
          toolName: 'verify_claim',
          status: 'completed',
          durationMs: Date.now() - stepStart,
          outputSummary: `Verdict: ${result.verdict}. Factual propositions: ${result.factualClaims.length}.`,
          piiScrubbed: 0,
        });

        finalAssessment = result.riskLevel;
        executiveSummary = result.summary;
        tacticalAdvice = result.safeNextSteps || [];
      }
    } catch (err: unknown) {
      SafeLogger.error('agent_core', 'step_failed', String(err), undefined, runId);
      steps.push({
        toolName: intent,
        status: 'failed',
        durationMs: Date.now() - startTime,
        outputSummary: 'Execution fault during tool dispatch',
        piiScrubbed: 0,
      });
      executiveSummary = 'Agent workflow encountered an internal boundary failure.';
    }

    return {
      runId,
      timestamp: new Date().toISOString(),
      intent,
      mode,
      steps,
      finalAssessment,
      executiveSummary,
      tacticalAdvice,
      privacyReceipt: {
        processedLocally: mode === 'local',
        piiScrubbedCount: totalPiiScrubbed,
        networkTransferred: mode !== 'local',
      },
    };
  }
}
