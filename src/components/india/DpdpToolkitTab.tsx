'use client';

import React, { useState } from 'react';
import { SupportedLanguage, TRANSLATIONS } from '@/lib/i18n/translations';
import { DpdpToolkit, DpdpLetterResult } from '@/lib/india/dpdp-toolkit';

interface DpdpToolkitTabProps {
  lang: SupportedLanguage;
  elderMode: boolean;
}

export default function DpdpToolkitTab({ lang, elderMode }: DpdpToolkitTabProps) {
  const t = TRANSLATIONS[lang];
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [companyName, setCompanyName] = useState('Online Shopping App');
  const [grievanceEmail, setGrievanceEmail] = useState('grievance@company.in');
  const [requestType, setRequestType] = useState<'deletion' | 'correction'>('deletion');
  const [result, setResult] = useState<DpdpLetterResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim() || !companyName.trim()) return;

    const res = DpdpToolkit.generateLetter({
      userName: userName.trim(),
      userEmail: userEmail.trim(),
      userPhone: userPhone.trim() || undefined,
      companyName: companyName.trim(),
      grievanceOfficerEmail: grievanceEmail.trim(),
      requestType,
    });
    setResult(res);
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.formattedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-6 ${elderMode ? 'text-lg' : 'text-sm'}`}>
      {/* Overview & Statutory Phase-In Warning */}
      <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className={`font-bold text-white flex items-center gap-2 ${elderMode ? 'text-2xl' : 'text-lg'}`}>
          ⚖️ {t.dpdpTitle}
        </h2>
        <p className="text-neutral-400">
          {lang === 'hi'
            ? 'भारत के डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम 2023 की धारा 12 के तहत किसी भी कंपनी से अपना निजी डेटा डिलीट कराने का कानूनी नोटिस तैयार करें।'
            : 'Generate a legally binding Data Erasure Notice under Section 12 of India\'s DPDP Act 2023. Track the statutory 90-day grievance window before escalating to the Data Protection Board.'}
        </p>

        {/* 13 May 2027 Phase-In Notice */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300 text-xs leading-relaxed">
          {t.dpdpNotice2027}
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base">Generate Your Data Deletion Request</h3>
        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1">Your Full Name</label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full bg-[#090A0D] border border-[#232833] rounded-xl px-4 py-2.5 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1">Your Registered Email</label>
            <input
              type="email"
              required
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="e.g. ramesh@gmail.com"
              className="w-full bg-[#090A0D] border border-[#232833] rounded-xl px-4 py-2.5 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1">Company / App Name</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Swiggy, Paytm, Zepto"
              className="w-full bg-[#090A0D] border border-[#232833] rounded-xl px-4 py-2.5 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1">Grievance Officer Email</label>
            <input
              type="email"
              required
              value={grievanceEmail}
              onChange={(e) => setGrievanceEmail(e.target.value)}
              placeholder="e.g. grievance@company.com"
              className="w-full bg-[#090A0D] border border-[#232833] rounded-xl px-4 py-2.5 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-white"
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between flex-wrap gap-4 pt-2">
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                <input
                  type="radio"
                  name="reqType"
                  checked={requestType === 'deletion'}
                  onChange={() => setRequestType('deletion')}
                />
                Complete Data Deletion (Section 12(3))
              </label>
              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                <input
                  type="radio"
                  name="reqType"
                  checked={requestType === 'correction'}
                  onChange={() => setRequestType('correction')}
                />
                Data Correction / Updating (Section 12(1))
              </label>
            </div>

            <button
              type="submit"
              className="bg-white text-black font-bold px-6 py-2.5 rounded-xl hover:bg-neutral-200 transition text-xs"
            >
              {t.generateLetterBtn}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Result */}
      {result && (
        <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-6 shadow-2xl space-y-6 animate-fadeIn">
          {/* Statutory Countdown Box */}
          <div className="p-4 bg-[#090A0D] border border-[#232833] rounded-xl flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-xs text-neutral-400 block">{t.daysRemainingLabel}</span>
              <span className="text-2xl font-black text-emerald-400">{result.statutoryClockDays} Days</span>
            </div>
            <div className="text-xs text-neutral-400 max-w-md">
              Companies must resolve Data Principal grievances within 90 days. If unaddressed, you are empowered to approach the Data Protection Board of India.
            </div>
          </div>

          {/* Formatted Letter View */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Formal Statutory Notice Preview
              </span>
              <button
                onClick={copyToClipboard}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition"
              >
                {copied ? 'Copied to Clipboard! ✓' : 'Copy Notice Text 📋'}
              </button>
            </div>

            <pre className="p-4 bg-[#090A0D] border border-[#232833] rounded-xl text-xs text-neutral-200 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto max-h-96">
              {result.formattedLetter}
            </pre>
          </div>

          {/* Escalation Steps */}
          <div className="pt-4 border-t border-[#232833] space-y-3">
            <h4 className="font-bold text-white text-sm">🪜 Next Steps & Escalation Ladder</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.escalationSteps.map((esc) => (
                <div key={esc.step} className="p-3 bg-[#090A0D] border border-[#232833] rounded-xl text-xs space-y-1">
                  <span className="text-emerald-400 font-bold block">Step {esc.step}: {esc.title}</span>
                  <p className="text-neutral-400">{esc.instruction}</p>
                  {esc.officialLink && (
                    <a
                      href={esc.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white underline block pt-1 font-semibold"
                    >
                      Official Board Link →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
