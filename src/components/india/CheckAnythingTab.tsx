'use client';

import React, { useState } from 'react';
import { CheckAnythingResult, DoThisNextAction } from '@/lib/check/check-anything-engine';
import { SupportedLanguage, TRANSLATIONS } from '@/lib/i18n/translations';

interface CheckAnythingTabProps {
  lang: SupportedLanguage;
  elderMode: boolean;
  onRecordHistory: (entry: { type: string; query: string; verdict: string; timestamp: string }) => void;
}

export default function CheckAnythingTab({ lang, elderMode, onRecordHistory }: CheckAnythingTabProps) {
  const t = TRANSLATIONS[lang];
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckAnythingResult | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/v1/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to inspect query. Please try again.');
      }

      const data: CheckAnythingResult = await res.json();
      setResult(data);

      // Record to user's local dashboard history
      onRecordHistory({
        type: data.input_type,
        query: query.trim().slice(0, 80),
        verdict: data.verdict,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while evaluating the threat.');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'likely_scam':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'possibly_suspicious':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className={`space-y-6 ${elderMode ? 'text-lg' : 'text-sm'}`}>
      {/* Search Input Box */}
      <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-6 shadow-xl">
        <h2 className={`font-bold text-white mb-2 ${elderMode ? 'text-2xl' : 'text-lg'}`}>
          {t.tabCheckAnything}
        </h2>
        <p className="text-neutral-400 mb-4">
          {lang === 'hi'
            ? 'किसी भी लिंक, एसएमएस, व्हाट्सएप मैसेज या संदिग्ध फोन नंबर को यहां पेस्ट करें और तुरंत जांचें।'
            : 'Paste any suspicious link, message, or phone number. We check against Indian cyber fraud signatures and national telemetry.'}
        </p>

        <form onSubmit={handleCheck} className="space-y-4">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.checkInputPlaceholder}
            rows={3}
            className={`w-full bg-[#090A0D] border border-[#232833] rounded-xl p-4 text-white placeholder-neutral-500 focus:outline-none focus:border-white transition ${
              elderMode ? 'text-lg' : 'text-sm'
            }`}
          />

          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-xs text-neutral-500">
              {lang === 'hi'
                ? 'उदाहरण: बिजली बिल काटने का मैसेज, SBI KYC ब्लॉक लिंक, या +92 से अनजान कॉल'
                : 'Examples: Electricity cutoff SMS, SBI KYC block link, or +92 foreign number'}
            </span>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className={`bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50 flex items-center gap-2 ${
                elderMode ? 'text-lg px-8 py-4' : 'text-sm'
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                  {t.checkingStatus}
                </>
              ) : (
                <>🔍 {t.checkButton}</>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-6 shadow-2xl space-y-6 animate-fadeIn">
          {/* Header & Verdict */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232833]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                Detected Type: {result.input_type.replace('_', ' ').toUpperCase()}
              </span>
              <div
                className={`inline-block px-4 py-1.5 rounded-lg border font-bold ${getVerdictColor(
                  result.verdict
                )} ${elderMode ? 'text-xl' : 'text-base'}`}
              >
                {result.verdict === 'likely_scam'
                  ? t.verdictScam
                  : result.verdict === 'possibly_suspicious'
                  ? t.verdictSuspicious
                  : t.verdictSafe}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-neutral-400 block">{t.confidenceLabel}</span>
              <span className="text-2xl font-black text-white">{result.confidence_score}%</span>
            </div>
          </div>

          {/* Plain Language Explanation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              {t.explanationLabel}
            </h3>
            <p className="text-neutral-200 leading-relaxed bg-[#090A0D] p-4 rounded-xl border border-[#1E222B]">
              {result.explanation}
            </p>
          </div>

          {/* Red Flags List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2">
              {t.redFlagsLabel}
            </h3>
            <div className="space-y-2">
              {result.red_flags.map((flag, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-red-500/5 border border-red-500/20 p-3 rounded-lg text-neutral-300"
                >
                  <span className="text-red-400 font-bold">⚠️</span>
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* "Do This Next" India Action Panel (Feature 2) */}
          <div className="pt-4 border-t border-[#232833]">
            <h3 className={`font-black text-white mb-4 flex items-center gap-2 ${elderMode ? 'text-xl' : 'text-base'}`}>
              🚨 {t.doThisNextTitle}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.do_this_next.map((action, idx) => (
                <div
                  key={idx}
                  className="bg-[#090A0D] border border-[#232833] rounded-xl p-4 flex flex-col justify-between hover:border-neutral-500 transition"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-neutral-300 inline-block mb-2">
                      {action.badge}
                    </span>
                    <h4 className="font-bold text-white mb-1">{action.title}</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                      {action.description}
                    </p>
                  </div>
                  {action.actionUrl ? (
                    <a
                      href={action.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline inline-block"
                    >
                      Open Official Portal →
                    </a>
                  ) : action.phone ? (
                    <a
                      href={`tel:${action.phone}`}
                      className="text-xs font-bold text-red-400 hover:text-red-300 underline inline-block"
                    >
                      Dial {action.phone} Directly 📞
                    </a>
                  ) : (
                    <span className="text-xs text-neutral-500 font-medium">Protective Action</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Imperfect Protection Notice */}
          <div className="text-xs text-neutral-500 border-t border-[#1E222B] pt-4">
            {t.neverHundredPercent}
          </div>
        </div>
      )}
    </div>
  );
}
