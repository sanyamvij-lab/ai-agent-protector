'use client';

import React, { useState } from 'react';
import {
  Link2,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowLeft,
  Flag,
  Sparkles,
  Lock,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { ProcessingMode } from '@/lib/types';
import { ShinyButton } from '@/components/ui/shiny-button';

export interface ScanResultContract {
  scan_id: string;
  target_type: 'url' | 'message';
  status: 'known_malicious' | 'suspicious' | 'no_known_threat' | 'inconclusive' | 'unavailable';
  category: 'malware' | 'phishing' | 'unwanted_software' | 'impersonation' | 'scam' | 'none' | 'unknown';
  evidence: Array<{
    source: 'web_risk' | 'heuristic' | 'ai_explanation' | string;
    type: string;
    detail: string;
    observed_at: string;
  }>;
  provider_status: Array<{
    provider: string;
    state: 'ok' | 'timeout' | 'quota' | 'error' | 'not_configured';
    latency_ms: number;
  }>;
  explanation: string;
  recommended_action: string;
  limitations: string[];
  scanned_at: string;
  host?: string;
  url_hash?: string;
}

interface LinkScannerTabProps {
  currentMode: ProcessingMode;
  onRecordScan?: (riskLevel: string, piiCount: number, type?: 'message' | 'link' | 'claim' | 'file', summary?: string) => void;
}

const DEMO_LINKS = [
  {
    icon: '🚨',
    label: 'Brand Typosquatting (PayPal)',
    url: 'http://paypa1-account-update.xyz/verify-login',
  },
  {
    icon: '🛡️',
    label: 'Numeric IP Literal Host',
    url: 'http://192.168.1.1/admin-config',
  },
  {
    icon: '⚠️',
    label: 'Embedded Credentials in URL',
    url: 'https://admin:secret123@login.bank-portal.xyz/auth',
  },
  {
    icon: '🌐',
    label: 'Excessive Subdomain Evasion',
    url: 'https://verify.security.alert.account.login.service-update.xyz',
  },
];

export const LinkScannerTab: React.FC<LinkScannerTabProps> = ({ currentMode, onRecordScan }) => {
  const [inputUrl, setInputUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResultContract | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // False positive reporting modal state
  const [isFpModalOpen, setIsFpModalOpen] = useState(false);
  const [fpReason, setFpReason] = useState('');
  const [fpSubmitting, setFpSubmitting] = useState(false);
  const [fpSuccess, setFpSuccess] = useState(false);

  const handleScan = async (urlToScan?: string) => {
    const target = (urlToScan || inputUrl).trim();
    if (!target || isScanning) return;

    setIsScanning(true);
    setErrorMessage(null);
    setFpSuccess(false);

    try {
      const response = await fetch('/api/v1/scans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token-user-a', // Authenticated user session
        },
        body: JSON.stringify({ url: target }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `Scan failed with status code ${response.status}`);
      }

      setResult(data);

      if (onRecordScan) {
        onRecordScan(data.status, 0, 'link', data.explanation);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'A network fault prevented the link scan.';
      setErrorMessage(msg);
      setResult(null);
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setInputUrl('');
    setResult(null);
    setErrorMessage(null);
    setFpSuccess(false);
  };

  const handleSubmitFalsePositive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result || !fpReason.trim() || fpSubmitting) return;

    setFpSubmitting(true);
    try {
      const res = await fetch(`/api/v1/scans/${result.scan_id}/false-positive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token-user-a',
        },
        body: JSON.stringify({ reason: fpReason.trim() }),
      });

      if (res.ok) {
        setFpSuccess(true);
        setTimeout(() => {
          setIsFpModalOpen(false);
          setFpReason('');
        }, 1500);
      } else {
        const err = await res.json();
        alert(err.error?.message || 'Failed to submit false positive report.');
      }
    } catch {
      alert('Network error while filing report.');
    } finally {
      setFpSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-white mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PHASE 1 // LINK-SCANNER VERTICAL SLICE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Evidence-Based Safe Link Scanner
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Static lexical, cryptographic, and licensed threat intelligence analysis. We never fetch or crawl target destinations on the server.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-mono">
            Provider: Google Web Risk API
          </span>
        </div>
      </div>

      {/* Input Box Section */}
      <div className="rounded-2xl border border-white/10 bg-[#141820] p-6 shadow-xl space-y-4">
        <label htmlFor="url-input" className="block text-xs font-mono font-semibold text-white uppercase tracking-wider">
          Target URL to Inspect
        </label>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <input
              id="url-input"
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://example.com/login"
              maxLength={2048}
              disabled={isScanning}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0D0F12] border border-white/15 text-white placeholder-neutral-500 text-sm font-mono focus:outline-none focus:border-white transition"
            />
            {inputUrl && (
              <div className="absolute right-3 top-3.5 text-[10px] text-neutral-500 font-mono">
                {inputUrl.length}/2048
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <ShinyButton
              type="submit"
              disabled={!inputUrl.trim() || isScanning}
              variant="white"
              className="py-3 px-6 text-sm font-semibold shrink-0"
            >
              {isScanning ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin text-white" />
                  <span>Auditing Link...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>Inspect Link</span>
                </>
              )}
            </ShinyButton>

            {result && (
              <button
                type="button"
                onClick={handleReset}
                className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition"
                title="Reset Scanner"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Quick Demo Test Vectors */}
        <div className="pt-2 border-t border-white/5">
          <span className="text-[11px] text-neutral-400 font-mono block mb-2">
            Instant Test Fixtures (Pre-Populated):
          </span>
          <div className="flex flex-wrap gap-2">
            {DEMO_LINKS.map((demo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputUrl(demo.url);
                  handleScan(demo.url);
                }}
                disabled={isScanning}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-neutral-300 hover:text-white transition flex items-center space-x-1.5 font-mono cursor-pointer disabled:opacity-50"
              >
                <span>{demo.icon}</span>
                <span>{demo.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ERROR STATE */}
      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-5 space-y-2 animate-in fade-in">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Inspection Error</span>
          </div>
          <p className="text-xs text-rose-200/90 leading-relaxed font-sans">{errorMessage}</p>
          <div className="pt-2">
            <button
              onClick={() => handleScan()}
              className="text-xs font-mono text-rose-300 hover:text-rose-100 underline cursor-pointer"
            >
              Retry inspection
            </button>
          </div>
        </div>
      )}

      {/* RESULT CARD */}
      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          {/* Status Header Banner */}
          <div
            className={`rounded-2xl border p-6 shadow-2xl relative overflow-hidden ${
              result.status === 'known_malicious'
                ? 'border-rose-500/60 bg-gradient-to-r from-rose-950/80 via-black to-rose-950/80 shadow-rose-950/50'
                : result.status === 'suspicious'
                ? 'border-amber-500/60 bg-gradient-to-r from-amber-950/60 via-black to-amber-950/60 shadow-amber-950/50'
                : result.status === 'unavailable'
                ? 'border-white/20 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900'
                : 'border-emerald-500/50 bg-gradient-to-r from-emerald-950/60 via-black to-emerald-950/60 shadow-emerald-950/50'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                    result.status === 'known_malicious'
                      ? 'bg-rose-950 border-rose-500 text-rose-400'
                      : result.status === 'suspicious'
                      ? 'bg-amber-950 border-amber-500 text-amber-400'
                      : result.status === 'unavailable'
                      ? 'bg-neutral-800 border-neutral-600 text-neutral-300'
                      : 'bg-emerald-950 border-emerald-500 text-emerald-400'
                  }`}
                >
                  {result.status === 'known_malicious' ? (
                    <ShieldAlert className="w-6 h-6 animate-pulse" />
                  ) : result.status === 'suspicious' ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : result.status === 'unavailable' ? (
                    <HelpCircle className="w-6 h-6" />
                  ) : (
                    <ShieldCheck className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
                        result.status === 'known_malicious'
                          ? 'bg-rose-900/80 border-rose-400 text-rose-200'
                          : result.status === 'suspicious'
                          ? 'bg-amber-900/80 border-amber-400 text-amber-200'
                          : result.status === 'unavailable'
                          ? 'bg-neutral-800 border-neutral-500 text-neutral-300'
                          : 'bg-emerald-900/80 border-emerald-400 text-emerald-200'
                      }`}
                    >
                      {result.status.replace(/_/g, ' ')}
                    </span>

                    <span className="text-xs font-mono text-neutral-400">
                      Category: <span className="text-white font-semibold">{result.category}</span>
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-white mt-1.5 font-mono">
                    Host: {result.host || 'unknown'}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed max-w-3xl">
                    {result.explanation}
                  </p>
                </div>
              </div>

              {/* Malicious Warning Return to Safety Action */}
              {result.status === 'known_malicious' && (
                <div className="shrink-0 flex flex-col gap-2">
                  <button
                    onClick={handleReset}
                    className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-rose-950 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Return to Safety</span>
                  </button>
                  <span className="text-[10px] text-rose-300 font-mono text-center">
                    Link navigation is blocked
                  </span>
                </div>
              )}
            </div>

            {/* Recommended Action Capsule */}
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2 text-white font-medium">
                <span className="font-mono text-neutral-400 uppercase tracking-wider text-[11px]">Recommended:</span>
                <span>{result.recommended_action}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsFpModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-[11px] text-neutral-300 hover:text-white transition flex items-center space-x-1.5 font-mono cursor-pointer"
                >
                  <Flag className="w-3 h-3 text-white" />
                  <span>Report False Positive</span>
                </button>
              </div>
            </div>
          </div>

          {/* Evidence & Forensic Detail Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1 & 2: Evidence List */}
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#141820] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Correlated Evidence Items ({result.evidence.length})</span>
                </h3>
                <span className="text-[11px] text-neutral-400 font-mono">
                  Scanned: {new Date(result.scanned_at).toLocaleTimeString()}
                </span>
              </div>

              {result.evidence.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400 font-mono space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <p>Zero threat heuristics or intelligence flags were triggered.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.evidence.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-white/10 bg-[#0D0F12] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-white font-bold">{item.type}</span>
                        <span className="text-[10px] text-neutral-400 uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10">
                          Source: {item.source}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed font-sans">{item.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 3: Providers & Limitations */}
            <div className="rounded-2xl border border-white/10 bg-[#141820] p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-white" />
                  <span>Provider Diagnostics</span>
                </h3>

                <div className="space-y-2">
                  {result.provider_status.map((prov, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D0F12] border border-white/10 text-xs font-mono"
                    >
                      <span className="text-white capitalize">{prov.provider.replace(/_/g, ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            prov.state === 'ok'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                              : 'bg-neutral-800 text-neutral-300 border border-neutral-600'
                          }`}
                        >
                          {prov.state}
                        </span>
                        <span className="text-neutral-500 text-[10px]">{prov.latency_ms}ms</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  <span className="text-[11px] font-mono font-bold text-neutral-400 block uppercase">
                    Mandatory Limitations
                  </span>
                  <ul className="space-y-1 text-xs text-neutral-400 list-disc list-inside font-sans leading-relaxed">
                    {result.limitations.map((lim, idx) => (
                      <li key={idx}>{lim}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* SHA-256 Audit Seal */}
              <div className="pt-4 border-t border-white/10 text-[10px] font-mono text-neutral-500">
                <span>Scan ID: </span>
                <span className="text-neutral-300 truncate block">{result.scan_id}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HONEST EMPTY STATE (When no scan has been performed yet) */}
      {!result && !errorMessage && !isScanning && (
        <div className="rounded-2xl border border-white/10 bg-[#141820]/40 p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-bold text-white text-base">Ready for Zero-Trust URL Audit</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Enter any link above to evaluate punycode homographs, IP literals, deceptive subdomains, and live Google Web Risk threat intelligence.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-4 text-xs font-mono text-neutral-400">
            <span>• No Server-Side Crawling</span>
            <span>• Host & Hash Logging Only</span>
            <span>• Fail-Safe Contract</span>
          </div>
        </div>
      )}

      {/* False Positive Modal */}
      {isFpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/20 bg-[#0D0F12] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Flag className="w-4 h-4 text-white" />
                <h3 className="font-bold text-white text-sm">Report False Positive</h3>
              </div>
              <button
                onClick={() => setIsFpModalOpen(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {fpSuccess ? (
              <div className="py-6 text-center space-y-2 text-xs font-mono text-emerald-400">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <p>Report recorded for security analyst review.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFalsePositive} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">
                    Explain why this URL is benign / legitimate:
                  </label>
                  <textarea
                    rows={4}
                    value={fpReason}
                    onChange={(e) => setFpReason(e.target.value)}
                    required
                    minLength={3}
                    maxLength={1000}
                    placeholder="e.g. This is our internal developer staging environment..."
                    className="w-full p-3 rounded-xl bg-[#141820] border border-white/15 text-white text-xs font-sans focus:outline-none focus:border-white"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFpModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <ShinyButton
                    type="submit"
                    disabled={!fpReason.trim() || fpSubmitting}
                    variant="white"
                    className="py-2 px-4 text-xs font-semibold"
                  >
                    {fpSubmitting ? 'Submitting...' : 'Submit Report'}
                  </ShinyButton>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkScannerTab;
