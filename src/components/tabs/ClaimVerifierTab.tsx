'use client';

import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  Info,
  ExternalLink,
  CheckCircle2,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ProcessingMode, ClaimVerifyResult } from '@/lib/types';
import { ClaimVerifier } from '@/lib/security/claim-verifier';

interface ClaimVerifierTabProps {
  currentMode: ProcessingMode;
  onRecordScan: (riskLevel: string, piiCount: number, type?: 'message' | 'link' | 'claim' | 'file', summary?: string) => void;
}

const SAMPLE_CLAIMS = [
  {
    label: 'Viral Health Miracle (Sensational)',
    text: 'SHOCKING SECRET: Doctors don\'t want you to know this 100% proven miracle cure that was censored by the government. All mainstream media won\'t report this conspiracy!',
  },
  {
    label: 'Unattributed Economic Claim (Unverified)',
    text: 'A recent international study revealed that 85% of small technology firms will be banned from foreign cloud providers under new trade regulations signed yesterday.',
  },
  {
    label: 'Standard Scientific Statement (Attributed)',
    text: 'According to a study published in Nature Astronomy, researchers from the European Southern Observatory detected phosphine gas in the upper atmosphere of Venus.',
  },
];

export const ClaimVerifierTab: React.FC<ClaimVerifierTabProps> = ({
  currentMode,
  onRecordScan,
}) => {
  const [claimInput, setClaimInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<ClaimVerifyResult | null>(null);

  const handleVerify = async () => {
    if (!claimInput.trim()) return;

    setIsVerifying(true);

    try {
      if (currentMode === 'local') {
        await new Promise((r) => setTimeout(r, 200));
        const scan = ClaimVerifier.verify(claimInput, 'local');
        setResult(scan);
        onRecordScan(scan.riskLevel, 0);
      } else {
        const res = await fetch('/api/v1/claims/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ claim: claimInput, mode: currentMode }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const v1Res = await res.json();
        const data: ClaimVerifyResult = {
          id: v1Res.request_id || `claim-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingMode: v1Res.processing?.mode || currentMode,
          riskLevel: v1Res.assessment || v1Res.riskLevel,
          confidenceScore: v1Res.confidence_score ?? v1Res.confidenceScore ?? 0.75,
          summary: v1Res.summary || '',
          claimStatement: v1Res.claim_statement || claimInput,
          verdict: v1Res.verdict || 'unverified',
          factualClaims: v1Res.factual_claims || [],
          subjectiveSentiments: v1Res.subjective_sentiments || [],
          signals: (v1Res.signals || []).map((s: any) => ({
            id: s.code || s.id,
            label: s.label,
            category: s.category,
            severity: s.severity,
            description: s.description,
            matchedText: s.matched_text || s.matchedText,
          })),
          verificationGuidance: v1Res.verification_guidance || [],
          limitations: Array.isArray(v1Res.limitations) ? v1Res.limitations[0] : (v1Res.limitations || ''),
          safeNextSteps: v1Res.safe_next_steps || v1Res.safeNextSteps || [],
          externalSources: v1Res.evidence || v1Res.externalSources || [],
          privacyReceipt: {
            processedLocally: v1Res.privacy_receipt?.processed_locally ?? true,
            piiScrubbedCount: v1Res.privacy_receipt?.pii_scrubbed_count ?? 0,
            networkTransferred: v1Res.privacy_receipt?.network_transferred ?? false,
          },
        };
        setResult(data);
        onRecordScan(data.riskLevel, 0, 'claim', data.summary || data.claimStatement);
      }
    } catch {
      const fallback = ClaimVerifier.verify(claimInput, 'local');
      setResult(fallback);
      onRecordScan(fallback.riskLevel, 0, 'claim', fallback.summary || fallback.claimStatement);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Scale className="w-5 h-5 text-amber-400" />
              <span>Verify a Claim (Misinformation Triage)</span>
            </h2>
            {currentMode !== 'local' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Gemini 3.5 AI</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Separate checkable factual propositions from opinion and sensationalism. Strictly applies evidence over AI certainty.
          </p>
        </div>

        {/* Quick sample chips */}
        <div className="flex flex-wrap gap-2 text-xs">
          {SAMPLE_CLAIMS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setClaimInput(sample.text);
                setResult(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-amber-300 transition cursor-pointer"
            >
              Load: {sample.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="glass-card p-5 space-y-4">
        <textarea
          value={claimInput}
          onChange={(e) => setClaimInput(e.target.value)}
          placeholder="Paste news headline, viral assertion, social media post, or unverified rumor..."
          rows={4}
          className="glass-input w-full p-4 text-sm resize-none"
        />

        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-500">
            Principle: AI Protector never declares claims &quot;debunked&quot; based solely on model opinion. We provide primary source verification pathways.
          </p>

          <button
            onClick={handleVerify}
            disabled={isVerifying || !claimInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2 cursor-pointer"
          >
            {isVerifying ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Evaluating Claims...</span>
              </>
            ) : (
              <>
                <Scale className="w-3.5 h-3.5" />
                <span>Triage Claim</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="glass-card p-6 space-y-6 border-slate-700/60 animate-in fade-in duration-200">
          {/* Verdict Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <span className="text-xs uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300">
                Status: {result.verdict.replace('_', ' ')}
              </span>
            </div>

            <div className="text-xs text-slate-400">
              Confidence: <strong className="text-white">{Math.round(result.confidenceScore * 100)}%</strong>
            </div>
          </div>

          {/* Assessment Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Triage Findings</h4>
            <p className="text-sm font-medium text-slate-200 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              {result.summary}
            </p>
          </div>

          {/* Claim Decomposition: Facts vs Opinion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
              <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Testable Factual Assertions ({result.factualClaims.length})</span>
              </span>
              <ul className="space-y-1.5">
                {result.factualClaims.map((claim, idx) => (
                  <li key={idx} className="text-slate-300 bg-slate-950 p-2 rounded border border-slate-800">
                    &quot;{claim}&quot;
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Subjective / Sentimental Language ({result.subjectiveSentiments.length})</span>
              </span>
              {result.subjectiveSentiments.length > 0 ? (
                <ul className="space-y-1.5">
                  {result.subjectiveSentiments.map((sentiment, idx) => (
                    <li key={idx} className="text-slate-400 bg-slate-950 p-2 rounded border border-slate-800 italic">
                      &quot;{sentiment}&quot;
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 italic">No overt subjective sentiment markers detected.</p>
              )}
            </div>
          </div>

          {/* Step-by-Step Verification Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Evidence Verification Checklist</span>
            </h4>
            <ul className="space-y-1.5">
              {result.verificationGuidance.map((step, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* External Independent Fact Checkers */}
          {result.externalSources && result.externalSources.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Reputable Public Fact-Checking Archives</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.externalSources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-xs flex items-center justify-between transition group"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 group-hover:text-cyan-300 transition">{source.title}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{source.relevance}</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
