'use client';

import React from 'react';
import {
  Lock,
  ShieldCheck,
  KeyRound,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export const SecurityCenterTab: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Lock className="w-5 h-5 text-rose-400" />
          <span>Security & Identity Defense Center</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Identity protection guidelines, account breach protocols, and credential safety standards.
        </p>
      </div>

      {/* Identity Impersonation Red Flags */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-cyan-400" />
          <span>Spotting Impersonation Attacks</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Attackers frequently spoof government agencies (IRS, USPS), financial institutions (Chase, Wells Fargo), or executive leadership (CEO fraud). Use this verification checklist whenever a communication requests urgent action:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="font-semibold text-rose-300">Demand for Out-of-Band Payment</span>
            <p className="text-slate-400 text-[11px]">
              Requests for gift cards, cryptocurrency, or wire transfers to resolve urgent legal or tax issues are 100% fraudulent.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="font-semibold text-rose-300">Sender Address Discrepancy</span>
            <p className="text-slate-400 text-[11px]">
              Display names can be spoofed easily. Inspect the raw sender email domain (e.g., matching @company.com vs @company-support.live).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="font-semibold text-rose-300">Pressure for Secrecy</span>
            <p className="text-slate-400 text-[11px]">
              Fraudsters instruct victims: &quot;Do not tell your family&quot; or &quot;Do not discuss this with the bank teller.&quot;
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="font-semibold text-rose-300">Requests for 2FA / OTP Codes</span>
            <p className="text-slate-400 text-[11px]">
              No legitimate support technician will ever ask for the SMS or authenticator code sent to your phone.
            </p>
          </div>
        </div>
      </div>

      {/* Official Breach Resources */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <KeyRound className="w-4 h-4 text-amber-400" />
          <span>Credential Leak & Breach Verification</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          If you suspect your credentials or email address were compromised in a public corporate breach, verify via privacy-preserving k-anonymity repositories:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="https://haveibeenpwned.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between group"
          >
            <div>
              <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition">Have I Been Pwned (HIBP)</span>
              <p className="text-[11px] text-slate-400 mt-1">Official repository of compromised email addresses</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
          </a>

          <a
            href="https://identitytheft.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between group"
          >
            <div>
              <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition">FTC IdentityTheft.gov</span>
              <p className="text-[11px] text-slate-400 mt-1">US Federal Trade Commission recovery checklists</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
          </a>
        </div>
      </div>

      {/* Recommended Hardening Protocols */}
      <div className="glass-card p-6 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Essential Account Hardening Standards</span>
        </h3>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start space-x-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span><strong>FIDO2 / Passkeys / Hardware Keys:</strong> Prefer hardware security keys (e.g. YubiKey) or biometric passkeys over SMS-based 2FA, which is vulnerable to SIM swapping.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span><strong>Unique Passwords via Password Manager:</strong> Never reuse master credentials across personal and work services.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span><strong>Credit Freeze:</strong> Freeze your credit files at the major credit bureaus (Equifax, Experian, TransUnion) to prevent unauthorized accounts from being opened in your name.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
