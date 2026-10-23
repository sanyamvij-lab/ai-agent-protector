'use client';

import React, { useState } from 'react';
import { SupportedLanguage, TRANSLATIONS } from '@/lib/i18n/translations';
import { BreachCheckResult } from '@/lib/privacy/k-anonymity-pwned';

interface BreachAndPasswordTabProps {
  lang: SupportedLanguage;
  elderMode: boolean;
}

export default function BreachAndPasswordTab({ lang, elderMode }: BreachAndPasswordTabProps) {
  const t = TRANSLATIONS[lang];

  // Email Breach State
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [breachResult, setBreachResult] = useState<BreachCheckResult | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Client-Side Password State
  const [password, setPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwnedCount, setPwnedCount] = useState<number | null>(null);
  const [pwdChecked, setPwdChecked] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  // 1. Email Breach Checker
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setEmailLoading(true);
    setEmailError(null);
    setBreachResult(null);

    try {
      const res = await fetch('/api/v1/breach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to inspect email.');
      }

      const data: BreachCheckResult = await res.json();
      setBreachResult(data);
    } catch (err: any) {
      setEmailError(err.message || 'Error executing breach lookup.');
    } finally {
      setEmailLoading(false);
    }
  };

  // 2. Client-Side Password Checker (100% Client-Side k-Anonymity)
  const handleCheckPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setPwdLoading(true);
    setPwdError(null);
    setPwnedCount(null);
    setPwdChecked(false);

    try {
      // Step A: Calculate SHA-1 hash strictly client-side using Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const sha1Hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();

      // Step B: Extract first 5 characters for k-anonymity
      const prefix5 = sha1Hash.substring(0, 5);
      const suffix = sha1Hash.substring(5);

      // Step C: Send ONLY the 5-character prefix to range endpoint
      const res = await fetch(`/api/v1/pwned-range/${prefix5}`);
      if (!res.ok) {
        throw new Error('Failed to query k-anonymity hash ranges.');
      }

      const rangeText = await res.text();
      const lines = rangeText.split('\n');

      let matchCount = 0;
      for (const line of lines) {
        const [hashSuffix, countStr] = line.trim().split(':');
        if (hashSuffix && hashSuffix.toUpperCase() === suffix) {
          matchCount = parseInt(countStr || '0', 10);
          break;
        }
      }

      setPwnedCount(matchCount);
      setPwdChecked(true);
    } catch (err: any) {
      setPwdError(err.message || 'Could not verify password hash.');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className={`space-y-8 ${elderMode ? 'text-lg' : 'text-sm'}`}>
      {/* 1. Email Breach Checker */}
      <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-6 shadow-xl">
        <h2 className={`font-bold text-white mb-2 flex items-center gap-2 ${elderMode ? 'text-2xl' : 'text-lg'}`}>
          📧 {t.breachTitle}
        </h2>
        <p className="text-neutral-400 mb-4">
          {lang === 'hi'
            ? 'जांचें कि क्या आपका ईमेल डोमिनोज इंडिया, एयर इंडिया या बिगबास्केट जैसे सार्वजनिक डेटा उल्लंघनों में लीक हुआ है।'
            : 'Check if your email address was compromised in major Indian or global breaches (e.g. BigBasket, Air India, Domino\'s).'}
        </p>

        <form onSubmit={handleCheckEmail} className="flex gap-3 flex-wrap sm:flex-nowrap mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.breachPlaceholder}
            className="flex-1 bg-[#090A0D] border border-[#232833] rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-white transition"
          />
          <button
            type="submit"
            disabled={emailLoading || !email.trim()}
            className="bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50 whitespace-nowrap"
          >
            {emailLoading ? 'Checking...' : t.checkBreachBtn}
          </button>
        </form>

        {emailError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs">
            {emailError}
          </div>
        )}

        {breachResult && (
          <div className="mt-4 p-5 rounded-xl bg-[#090A0D] border border-[#232833] space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Target: {breachResult.email}</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  breachResult.isBreached
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {breachResult.isBreached
                  ? `Compromised in ${breachResult.breachCount} Incident(s)`
                  : 'No Known Breaches'}
              </span>
            </div>

            {breachResult.isBreached ? (
              <>
                <p className="text-red-300 text-xs">{t.breachFoundNotice}</p>
                <div className="space-y-3">
                  {breachResult.breaches.map((b, idx) => (
                    <div key={idx} className="bg-[#14171D] p-3 rounded-lg border border-[#232833] text-xs space-y-1">
                      <div className="flex justify-between font-bold text-white">
                        <span>{b.title}</span>
                        <span className="text-neutral-400">Date: {b.breachDate}</span>
                      </div>
                      <p className="text-neutral-400">{b.description}</p>
                      <div className="text-[11px] text-amber-400 pt-1">
                        <strong>Exposed Data Classes:</strong> {b.dataClasses.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Post-Leak Checklist */}
                <div className="pt-3 border-t border-[#232833]">
                  <h4 className="font-bold text-white text-xs mb-2">📋 Immediate Post-Leak Remediation Checklist</h4>
                  <ul className="space-y-1.5 text-xs text-neutral-300">
                    {breachResult.postLeakChecklist.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-emerald-400 text-xs">{t.breachSafeNotice}</p>
            )}
          </div>
        )}
      </div>

      {/* 2. Client-Side Password Checker */}
      <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-6 shadow-xl">
        <h2 className={`font-bold text-white mb-2 flex items-center gap-2 ${elderMode ? 'text-2xl' : 'text-lg'}`}>
          🔑 {t.passwordTitle}
        </h2>
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs mb-4">
          {t.passwordKAnonymityNotice}
        </div>

        <form onSubmit={handleCheckPassword} className="flex gap-3 flex-wrap sm:flex-nowrap mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.passwordPlaceholder}
            className="flex-1 bg-[#090A0D] border border-[#232833] rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-white transition"
          />
          <button
            type="submit"
            disabled={pwdLoading || !password}
            className="bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50 whitespace-nowrap"
          >
            {pwdLoading ? 'Verifying...' : 'Check Password'}
          </button>
        </form>

        {pwdError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs">
            {pwdError}
          </div>
        )}

        {pwdChecked && (
          <div className="mt-4 p-5 rounded-xl bg-[#090A0D] border border-[#232833] space-y-2">
            {pwnedCount && pwnedCount > 0 ? (
              <div className="text-red-400 space-y-1">
                <div className="text-base font-bold flex items-center gap-2">
                  🚨 Compromised Password!
                </div>
                <p className="text-xs text-neutral-300">
                  This exact password has appeared in public database leaks{' '}
                  <strong className="text-red-400 font-bold">{pwnedCount.toLocaleString()} times</strong>. Automated attack tools try these passwords first. Change it immediately.
                </p>
              </div>
            ) : (
              <div className="text-emerald-400 space-y-1">
                <div className="text-base font-bold flex items-center gap-2">
                  🛡️ Not Found in Public Leaks
                </div>
                <p className="text-xs text-neutral-300">
                  This password does not match any known exposed hash in public breach repositories. Still ensure it uses upper, lower, numbers, and symbols.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
