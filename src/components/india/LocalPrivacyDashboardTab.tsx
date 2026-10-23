'use client';

import React, { useState, useEffect } from 'react';
import { SupportedLanguage, TRANSLATIONS } from '@/lib/i18n/translations';

export interface LocalHistoryItem {
  id: string;
  type: string;
  query: string;
  verdict: string;
  timestamp: string;
}

interface LocalPrivacyDashboardTabProps {
  lang: SupportedLanguage;
  elderMode: boolean;
}

export default function LocalPrivacyDashboardTab({ lang, elderMode }: LocalPrivacyDashboardTabProps) {
  const t = TRANSLATIONS[lang];
  const [history, setHistory] = useState<LocalHistoryItem[]>([]);
  const [purgedMessage, setPurgedMessage] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ai_protector_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleNuclearPurge = () => {
    const confirmPurge = confirm(
      'Nuclear Wipe: This will instantly purge all locally stored scans, query history, and temporary override tokens from your browser.\n\nAre you sure?'
    );
    if (!confirmPurge) return;

    try {
      localStorage.removeItem('ai_protector_history');
      localStorage.removeItem('ai_protector_trusted_sites');
      setHistory([]);
      setPurgedMessage(true);
      setTimeout(() => setPurgedMessage(false), 3000);
    } catch {}
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-protector-local-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scamCount = history.filter((h) => h.verdict === 'likely_scam').length;
  const suspiciousCount = history.filter((h) => h.verdict === 'possibly_suspicious').length;
  const safeCount = history.filter((h) => h.verdict === 'likely_safe').length;

  return (
    <div className={`space-y-6 ${elderMode ? 'text-lg' : 'text-sm'}`}>
      {/* Overview Card */}
      <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className={`font-bold text-white flex items-center gap-2 ${elderMode ? 'text-2xl' : 'text-lg'}`}>
              📊 {t.tabDashboard}
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm">
              {lang === 'hi'
                ? 'आपकी सभी जांचें और जोखिम रिपोर्ट 100% केवल आपके इस ब्राउज़र में सुरक्षित हैं। हमारे सर्वर पर शून्य डेटा जाता है।'
                : 'All your inspections, detected hazards, and pending fixes are stored 100% locally in your browser. Zero server-side retention.'}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleExportJson}
              disabled={history.length === 0}
              className="px-4 py-2 rounded-xl bg-[#090A0D] border border-[#232833] text-white hover:border-neutral-500 transition text-xs font-semibold disabled:opacity-40"
            >
              Export JSON 📥
            </button>
            <button
              onClick={handleNuclearPurge}
              disabled={history.length === 0}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition text-xs disabled:opacity-40"
            >
              ☢️ Nuclear Data Wipe
            </button>
          </div>
        </div>

        {purgedMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold animate-fadeIn">
            ✓ Complete local memory wiped! All browser history entries and cached tokens have been deleted.
          </div>
        )}
      </div>

      {/* Metric Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#14171D] border border-[#232833] rounded-xl p-4">
          <span className="text-xs text-neutral-400 block mb-1">Total Checks</span>
          <span className="text-2xl font-black text-white">{history.length}</span>
        </div>
        <div className="bg-[#14171D] border border-[#232833] rounded-xl p-4">
          <span className="text-xs text-red-400 block mb-1">Scams Blocked</span>
          <span className="text-2xl font-black text-red-400">{scamCount}</span>
        </div>
        <div className="bg-[#14171D] border border-[#232833] rounded-xl p-4">
          <span className="text-xs text-amber-400 block mb-1">Suspicious Flags</span>
          <span className="text-2xl font-black text-amber-400">{suspiciousCount}</span>
        </div>
        <div className="bg-[#14171D] border border-[#232833] rounded-xl p-4">
          <span className="text-xs text-emerald-400 block mb-1">Likely Safe</span>
          <span className="text-2xl font-black text-emerald-400">{safeCount}</span>
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base">Local Threat Audit Trail</h3>

        {history.length === 0 ? (
          <div className="text-center py-10 text-neutral-500 text-xs">
            No local checks recorded yet. Perform a check in "Check Anything" to begin logging your private threat history.
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-[#090A0D] border border-[#232833] rounded-xl text-xs gap-3 flex-wrap sm:flex-nowrap"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                    {item.type}
                  </span>
                  <span className="font-mono text-neutral-300 truncate max-w-xs sm:max-w-md">
                    {item.query}
                  </span>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded text-[11px] ${
                      item.verdict === 'likely_scam'
                        ? 'bg-red-500/20 text-red-400'
                        : item.verdict === 'possibly_suspicious'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {item.verdict.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-neutral-500 text-[11px]">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
