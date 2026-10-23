'use client';

import React, { useState } from 'react';
import { SupportedLanguage, TRANSLATIONS } from '@/lib/i18n/translations';
import { EmergencyFlowEngine, BankDisputeParams, EmergencyGuideResult } from '@/lib/india/emergency-flow';

interface Emergency1930TabProps {
  lang: SupportedLanguage;
  elderMode: boolean;
}

export default function Emergency1930Tab({ lang, elderMode }: Emergency1930TabProps) {
  const t = TRANSLATIONS[lang];

  const [victimName, setVictimName] = useState('');
  const [victimPhone, setVictimPhone] = useState('');
  const [victimEmail, setVictimEmail] = useState('');
  const [bankName, setBankName] = useState('State Bank of India (SBI)');
  const [accountNumber, setAccountNumber] = useState('');
  const [fraudType, setFraudType] = useState<BankDisputeParams['fraudType']>('unauthorized_upi');
  const [transactionId, setTransactionId] = useState('');
  const [amountLost, setAmountLost] = useState<string>('25000');
  const [fraudDateTime, setFraudDateTime] = useState('');
  const [ackNo, setAckNo] = useState('');

  const [guide, setGuide] = useState<EmergencyGuideResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!victimName || !bankName || !accountNumber || !transactionId) return;

    const res = EmergencyFlowEngine.generateDispute({
      victimName,
      victimPhone,
      victimEmail,
      bankName,
      accountNumber,
      fraudType,
      transactionIdOrUtr: transactionId,
      amountLost: parseFloat(amountLost) || 0,
      fraudDateTime: fraudDateTime || 'Within the last 24 hours',
      cybercrimeComplaintAckNumber: ackNo || undefined,
    });
    setGuide(res);
  };

  const copyLetter = () => {
    if (!guide) return;
    navigator.clipboard.writeText(guide.disputeLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-6 ${elderMode ? 'text-lg' : 'text-sm'}`}>
      {/* Golden Hour Emergency Header */}
      <div className="bg-red-500/10 border-2 border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-pulse">🚨</span>
          <div>
            <h2 className={`font-black text-white ${elderMode ? 'text-3xl' : 'text-xl'}`}>
              {t.emergencyBannerTitle}
            </h2>
            <p className="text-red-300 font-semibold text-xs sm:text-sm">
              If fraudulent money transfer occurred in the last 1–2 hours, quick action can freeze the funds before the fraudster withdraws cash.
            </p>
          </div>
        </div>

        {/* 1930 Call Banner */}
        <div className="bg-[#090A0D] border border-red-500/50 p-4 rounded-xl flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-xs text-neutral-400 block">National Cyber Crime Helpline</span>
            <span className="text-3xl font-black text-red-400">DIAL 1930</span>
            <p className="text-xs text-neutral-300 mt-1">Available 24x7 across all Indian states and Union Territories.</p>
          </div>
          <a
            href="tel:1930"
            className="bg-red-600 hover:bg-red-500 text-white font-black px-6 py-3 rounded-xl transition text-sm flex items-center gap-2 shadow-lg"
          >
            📞 Call 1930 Now
          </a>
        </div>
      </div>

      {/* Step-by-Step Emergency Protocol */}
      <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base">Four Essential Steps (Act Within 72 Hours)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#090A0D] border border-[#232833] rounded-xl space-y-2">
            <span className="text-xs font-bold text-red-400 block">STEP 1 • FIRST 2 HOURS</span>
            <h4 className="font-bold text-white text-sm">Call 1930 (Golden Hour)</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Have your bank account number and transaction UTR ready. 1930 operators immediately send an electronic hold request to the destination bank.
            </p>
          </div>

          <div className="p-4 bg-[#090A0D] border border-[#232833] rounded-xl space-y-2">
            <span className="text-xs font-bold text-amber-400 block">STEP 2 • FIRST 4 HOURS</span>
            <h4 className="font-bold text-white text-sm">Block Net Banking & UPI</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Call your bank\'s customer care or use mobile app security settings to block your debit card and UPI to stop further debits.
            </p>
          </div>

          <div className="p-4 bg-[#090A0D] border border-[#232833] rounded-xl space-y-2">
            <span className="text-xs font-bold text-blue-400 block">STEP 3 • FIRST 24 HOURS</span>
            <h4 className="font-bold text-white text-sm">File on Cybercrime.gov.in</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Submit full incident details and transaction screenshots to obtain an official FIR/Complaint Acknowledgement Number.
            </p>
          </div>

          <div className="p-4 bg-[#090A0D] border border-[#232833] rounded-xl space-y-2">
            <span className="text-xs font-bold text-emerald-400 block">STEP 4 • FIRST 3 DAYS</span>
            <h4 className="font-bold text-white text-sm">Submit RBI Zero-Liability Letter</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Under RBI circular, notifying the bank within 3 working days protects you with Zero Customer Liability. Generate the letter below.
            </p>
          </div>
        </div>
      </div>

      {/* Generator Form */}
      <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base">Generate RBI Zero-Liability Bank Dispute Letter</h3>
        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1">Account Holder Full Name</label>
            <input
              type="text"
              required
              value={victimName}
              onChange={(e) => setVictimName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full bg-[#090A0D] border border-[#232833] rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1">Bank Name</label>
            <input
              type="text"
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. State Bank of India / HDFC Bank"
              className="w-full bg-[#090A0D] border border-[#232833] rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1">Bank Account Number</label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. 109283746501"
              className="w-full bg-[#090A0D] border border-[#232833] rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1">Transaction ID / UTR / UPI Ref</label>
            <input
              type="text"
              required
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. 429182746192 or UPI Ref"
              className="w-full bg-[#090A0D] border border-[#232833] rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1">Amount Lost (INR ₹)</label>
            <input
              type="number"
              required
              value={amountLost}
              onChange={(e) => setAmountLost(e.target.value)}
              placeholder="e.g. 25000"
              className="w-full bg-[#090A0D] border border-[#232833] rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1">1930 / Cybercrime Ack No (Optional)</label>
            <input
              type="text"
              value={ackNo}
              onChange={(e) => setAckNo(e.target.value)}
              placeholder="e.g. 20261023-91823"
              className="w-full bg-[#090A0D] border border-[#232833] rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-white"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="bg-white text-black font-bold px-6 py-2.5 rounded-xl hover:bg-neutral-200 transition text-xs"
            >
              {t.downloadDisputeLetterBtn}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Dispute Letter & Evidence Checklist */}
      {guide && (
        <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-6 shadow-2xl space-y-6 animate-fadeIn">
          {/* Evidence Checklist */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">📁 Required Evidence Checklist to Attach</h4>
            <div className="space-y-2">
              {guide.evidenceChecklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-[#090A0D] border border-[#232833] rounded-xl text-xs text-neutral-300">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Letter Output */}
          <div className="space-y-2 pt-4 border-t border-[#232833]">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                RBI Zero-Liability Dispute Letter Preview
              </span>
              <button
                onClick={copyLetter}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition"
              >
                {copied ? 'Copied to Clipboard! ✓' : 'Copy Dispute Letter 📋'}
              </button>
            </div>

            <pre className="p-4 bg-[#090A0D] border border-[#232833] rounded-xl text-xs text-neutral-200 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto max-h-96">
              {guide.disputeLetter}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
