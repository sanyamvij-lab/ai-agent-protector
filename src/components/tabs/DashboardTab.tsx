'use client';

import React from 'react';
import {
  MessageSquareWarning,
  Link2,
  FileCheck2,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Lock,
  EyeOff,
  Cpu,
  ArrowRight,
  Sparkles,
  Activity,
  Bot,
  Terminal,
  Zap,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { ProcessingMode } from '@/lib/types';
import { Button } from '../ui/Button';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Testimonials } from '@/components/ui/testimonials-columns-1';
import { CyberDashboard } from '@/components/dashboard/CyberDashboard';

interface DashboardTabProps {
  onNavigateTab: (tabId: string) => void;
  currentMode: ProcessingMode;
  sessionStats: {
    scansCount: number;
    piiScrubbedCount: number;
    threatsFlagged: number;
  };
  onOpenCopilot?: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  onNavigateTab,
  currentMode,
  sessionStats,
  onOpenCopilot,
}) => {
  const [viewMode, setViewMode] = React.useState<'cyber' | 'overview'>('cyber');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* View Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0D0F14]/80 p-2 sm:p-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('cyber')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              viewMode === 'cyber'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Cyber Intelligence Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              viewMode === 'overview'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SOC Incident Operations</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-Time Engine Stream</span>
        </div>
      </div>

      {/* Cyber Intelligence Dashboard (Requested UI / UX design) */}
      {viewMode === 'cyber' && (
        <CyberDashboard
          onNavigateTab={onNavigateTab}
          sessionStats={sessionStats}
          onOpenCopilot={onOpenCopilot}
        />
      )}

      {/* Enterprise Security Operations Hero & Modules */}
      {viewMode === 'overview' && (
        <>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#0D0F12] via-[#141820] to-[#0D0F12] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-white text-xs font-mono font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ZERO-TRUST SOC INTELLIGENCE • OPERATIONAL</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Private by design. <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400">Trust by intelligence.</span>
          </h1>
          <p className="mt-3 text-neutral-400 text-sm sm:text-base leading-relaxed">
            AI Protector operates as an enterprise-grade digital defense platform — auditing suspicious SMS smishing, phishing URLs, extortion threats, and file integrity with strict client-side PII scrubbing and zero server-side storage.
          </p>

          {/* Primary Action Buttons using ShinyButton */}
          <div className="mt-6 flex flex-wrap gap-3 items-center">
            <ShinyButton
              onClick={() => onNavigateTab('message')}
              variant="white"
              className="py-2 px-4 text-xs font-semibold"
            >
              <MessageSquareWarning className="w-4 h-4 text-white" />
              <span>Scan Suspicious Message</span>
            </ShinyButton>

            <ShinyButton
              onClick={() => onNavigateTab('link')}
              variant="emerald"
              className="py-2 px-4 text-xs font-semibold"
            >
              <Link2 className="w-4 h-4 text-emerald-400" />
              <span>Inspect Malicious Link</span>
            </ShinyButton>

            <a href="/demo">
              <ShinyButton
                variant="white"
                className="py-2 px-4 text-xs font-semibold"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Ruixen Moon Chat Showcase</span>
              </ShinyButton>
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5 items-center text-xs">
            <div className="flex items-center space-x-2 text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg font-mono">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Zero-Retention Architecture</span>
            </div>
            <div className="flex items-center space-x-2 text-emerald-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg font-mono">
              <EyeOff className="w-4 h-4 text-emerald-400" />
              <span>Pre-Flight PII Redaction</span>
            </div>
            <div className="flex items-center space-x-2 text-neutral-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg font-mono">
              <Sparkles className="w-4 h-4 text-white" />
              <span>MITRE ATT&CK® Correlated</span>
            </div>
            <div className="flex items-center space-x-2 text-neutral-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg font-mono">
              <Cpu className="w-4 h-4 text-white" />
              <span>Engine: {currentMode.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1-Click Interactive Demo Scenarios Banner */}
      <div className="rounded-2xl border border-white/10 bg-[#141820]/60 p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-white" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
              Interactive Attack Vector Demos
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">1-Click Live Scans</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateTab('message')}
            className="p-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 text-left transition group cursor-pointer"
          >
            <div className="flex items-center space-x-2 text-white font-semibold text-xs group-hover:text-cyan-400">
              <span>🏦</span>
              <span>Chase Bank Phishing</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Fake SSN demand & urgency pressure
            </p>
          </button>

          <button
            onClick={() => onNavigateTab('link')}
            className="p-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 text-left transition group cursor-pointer"
          >
            <div className="flex items-center space-x-2 text-white font-semibold text-xs group-hover:text-emerald-400">
              <span>🚨</span>
              <span>PayPal Typosquatting</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              paypa1-account-update.xyz lookalike
            </p>
          </button>

          <button
            onClick={() => onNavigateTab('link')}
            className="p-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/50 text-left transition group cursor-pointer"
          >
            <div className="flex items-center space-x-2 text-white font-semibold text-xs group-hover:text-rose-400">
              <span>🛡️</span>
              <span>Cloud SSRF Probe</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              169.254.169.254 AWS metadata block
            </p>
          </button>

          <button
            onClick={onOpenCopilot}
            className="p-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/50 text-left transition group cursor-pointer"
          >
            <div className="flex items-center space-x-2 text-white font-semibold text-xs group-hover:text-purple-400">
              <span>🤖</span>
              <span>AI Security Copilot</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Strict Zero-Trust chat advisor
            </p>
          </button>
        </div>
      </div>

      {/* Session Telemetry Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl p-5 border border-slate-800 bg-slate-900/60 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-cyan-400">Inspections Completed</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{sessionStats.scansCount}</div>
          <p className="text-xs text-slate-500 mt-1">Total items analyzed this session</p>
        </div>

        <div className="rounded-xl p-5 border border-slate-800 bg-slate-900/60 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-emerald-400">PII Entities Scrubbed</span>
            <EyeOff className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">{sessionStats.piiScrubbedCount}</div>
          <p className="text-xs text-slate-500 mt-1">Credentials, emails & SSNs masked</p>
        </div>

        <div className="rounded-xl p-5 border border-slate-800 bg-slate-900/60 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-amber-400">Threats Flagged</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">{sessionStats.threatsFlagged}</div>
          <p className="text-xs text-slate-500 mt-1">Phishing cues, lookalike links, SSRF attempts</p>
        </div>
      </div>

      {/* Primary Action Modules Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Core Forensic Engines</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">Private By Design</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Check a Message */}
          <div
            onClick={() => onNavigateTab('message')}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between hover:border-cyan-500/50 cursor-pointer group transition duration-200"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 transition">
                <MessageSquareWarning className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white group-hover:text-cyan-300 transition">Check a Message</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Detect smishing urgency pressure, credential harvesting traps, delivery fee schemes, and extortion threats with live PII diff inspection.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-mono text-cyan-400 font-semibold group-hover:translate-x-1 transition">
              <span>Launch Engine</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </div>

          {/* Check a Link */}
          <div
            onClick={() => onNavigateTab('link')}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between hover:border-emerald-500/50 cursor-pointer group transition duration-200"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition">
                <Link2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition">Check a Link</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Deconstruct URLs with Anti-SSRF private IP blocking, brand typosquatting correlation (PayPal, Apple, Banks), and VirusTotal v3 intelligence.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-mono text-emerald-400 font-semibold group-hover:translate-x-1 transition">
              <span>Launch Engine</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </div>

          {/* File Integrity */}
          <div
            onClick={() => onNavigateTab('file')}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between hover:border-purple-500/50 cursor-pointer group transition duration-200"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition">File Cryptographic Integrity</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Compute SHA-256 and SHA-512 checksums 100% on-device using Web Crypto API. Compare against authorized publisher checksums without uploading files.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-mono text-purple-400 font-semibold group-hover:translate-x-1 transition">
              <span>Launch Engine</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </div>

          {/* Verify a Claim */}
          <div
            onClick={() => onNavigateTab('claim')}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between hover:border-amber-500/50 cursor-pointer group transition duration-200"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition">Verify a Claim</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Objective misinformation triage that isolates factual propositions from sensationalism and cites reputable international archives.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-mono text-amber-400 font-semibold group-hover:translate-x-1 transition">
              <span>Launch Engine</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </div>

          {/* Privacy Center */}
          <div
            onClick={() => onNavigateTab('privacy')}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between hover:border-teal-500/50 cursor-pointer group transition duration-200"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-105 transition">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white group-hover:text-teal-300 transition">Privacy Transparency Matrix</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Audit browser permissions (Zero Geolocation, Zero Sensor Access) and execute a Nuclear Data Wipe to purge all local memory.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-mono text-teal-400 font-semibold group-hover:translate-x-1 transition">
              <span>Inspect Matrix</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </div>

          {/* Security Center */}
          <div
            onClick={() => onNavigateTab('security')}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between hover:border-rose-500/50 cursor-pointer group transition duration-200"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-105 transition">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white group-hover:text-rose-300 transition">Security Guidance Center</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Defense protocols for credential leaks (Have I Been Pwned checks), institutional impersonation recovery, and 2FA hardening guides.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-mono text-rose-400 font-semibold group-hover:translate-x-1 transition">
              <span>Explore Guides</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </div>
        </div>
      </div>
    </>
  )}

  {/* Horizontal Moving Testimonials with Indian Faces */}
  <Testimonials />
</div>
  );
};
