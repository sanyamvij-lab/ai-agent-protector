'use client';

import React, { useState } from 'react';
import { SupportedLanguage, TRANSLATIONS } from '@/lib/i18n/translations';
import { PolicySummaryResult, ClauseQuote } from '@/lib/privacy/policy-analyzer';

interface PolicySummarizerTabProps {
  lang: SupportedLanguage;
  elderMode: boolean;
}

const SAMPLE_POLICY_TEXT = `We collect personal information you provide when creating an account, including your full name, email address, phone number, and physical billing address. We automatically collect precise GPS location data and device identifiers from your mobile device. We share this information with our marketing partners, third-party advertising networks, and data analytics affiliates to deliver tailored promotions. We retain your personal data for as long as necessary to fulfill the purposes outlined herein or to resolve contractual disputes. You may request deletion or erasure of your personal data at any time by contacting our designated Grievance Officer at grievance@service.in under applicable Indian data protection laws.`;

export default function PolicySummarizerTab({ lang, elderMode }: PolicySummarizerTabProps) {
  const t = TRANSLATIONS[lang];
  const [policyText, setPolicyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<PolicySummaryResult | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/policy/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: policyText.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to analyze policy.');
      }

      const data: PolicySummaryResult = await res.json();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Error parsing policy text.');
    } finally {
      setLoading(false);
    }
  };

  const renderClauseCard = (item: ClauseQuote, idx: number) => (
    <div key={idx} className="bg-[#090A0D] border border-[#232833] rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-bold text-white text-xs">{item.summary}</span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            item.riskSeverity === 'high'
              ? 'bg-red-500/20 text-red-400'
              : item.riskSeverity === 'medium'
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-emerald-500/20 text-emerald-400'
          }`}
        >
          {item.riskSeverity.toUpperCase()} IMPACT
        </span>
      </div>
      <div className="text-xs text-neutral-400 italic bg-[#14171D] p-3 rounded-lg border-l-2 border-white">
        "{item.exactQuote}"
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${elderMode ? 'text-lg' : 'text-sm'}`}>
      <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-6 shadow-xl">
        <h2 className={`font-bold text-white mb-2 flex items-center gap-2 ${elderMode ? 'text-2xl' : 'text-lg'}`}>
          📜 {t.tabPolicy}
        </h2>
        <p className="text-neutral-400 mb-4">
          {lang === 'hi'
            ? 'किसी भी ऐप या वेबसाइट की प्राइवेसी पॉलिसी यहां पेस्ट करें। हम डेटा संग्रह, शेयरिंग, रिटेंशन और डिलीट करने की शर्तों को उनके मूल वाक्यों के साथ सारगर्भित करेंगे।'
            : 'Paste privacy policy text or terms. We extract data collected, third-party sharing, retention schedules, and deletion rights quoting the exact clauses.'}
        </p>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <textarea
            value={policyText}
            onChange={(e) => setPolicyText(e.target.value)}
            rows={5}
            placeholder="Paste privacy policy text here..."
            className="w-full bg-[#090A0D] border border-[#232833] rounded-xl p-4 text-white placeholder-neutral-500 focus:outline-none focus:border-white transition text-xs"
          />

          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setPolicyText(SAMPLE_POLICY_TEXT)}
              className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
            >
              Paste Sample E-Commerce Policy 📋
            </button>
            <button
              type="submit"
              disabled={loading || !policyText.trim()}
              className="bg-white text-black font-bold px-6 py-2.5 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50 text-xs"
            >
              {loading ? 'Extracting Clauses...' : 'Analyze Policy'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs">
            {error}
          </div>
        )}
      </div>

      {summary && (
        <div className="space-y-6 animate-fadeIn">
          {/* Disclaimer */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
            {summary.disclaimer}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Collected */}
            <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                📥 1. Personal Data Collected
              </h3>
              <div className="space-y-3">
                {summary.collected.map(renderClauseCard)}
              </div>
            </div>

            {/* 2. Shared With */}
            <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                🤝 2. Third Parties Shared With
              </h3>
              <div className="space-y-3">
                {summary.shared_with.map(renderClauseCard)}
              </div>
            </div>

            {/* 3. Retention */}
            <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                ⏳ 3. Retention & Storage Timeline
              </h3>
              <div className="space-y-3">
                {summary.retention.map(renderClauseCard)}
              </div>
            </div>

            {/* 4. How to Delete */}
            <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                🗑️ 4. How to Request Deletion
              </h3>
              <div className="space-y-3">
                {summary.how_to_delete.map(renderClauseCard)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
