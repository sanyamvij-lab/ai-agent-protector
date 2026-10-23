'use client';

import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Terminal,
  Lock,
  Globe,
  ExternalLink,
  Cpu,
  Activity,
  Sparkles,
} from 'lucide-react';

export default function BeamWordmarkFooter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  return (
    <footer
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full overflow-hidden bg-[#0D0F12] text-neutral-300 pt-16 border-t border-white/10"
    >
      {/* Sweeping Diagonal Pure White Light Beam */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-[650px] w-[650px] rounded-full bg-gradient-to-br from-white/15 via-white/5 to-transparent blur-3xl transform -rotate-12 animate-pulse"
        style={{ animationDuration: '6s' }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-20 h-[500px] w-[500px] rounded-full bg-gradient-to-tl from-white/10 via-neutral-500/5 to-transparent blur-3xl"
      />

      {/* Interactive Cursor Pointer Glow (Pure White) */}
      {mousePos && (
        <div
          className="pointer-events-none absolute h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial from-white/15 via-white/5 to-transparent blur-2xl transition-all duration-75"
          style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
        />
      )}

      {/* Top Accent Line with Pure White Beam Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-16">
          {/* Brand Info & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-mono font-bold text-lg text-white tracking-wider">
                AI PROTECTOR
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              Zero-Trust digital safety platform. Pre-flight PII redaction, Anti-SSRF URL deconstruction, and MITRE ATT&CK® threat classification with ephemeral in-memory execution.
            </p>
            <div className="flex items-center space-x-2 pt-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
                <span>All Systems Operational</span>
              </span>
            </div>
          </div>

          {/* Navigation Column 1 */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>Defense Engines</span>
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400 font-sans">
              <li>
                <a href="/#message" className="hover:text-white transition">
                  Check a Message
                </a>
              </li>
              <li>
                <a href="/#link" className="hover:text-white transition">
                  Anti-SSRF Safe Link Audit
                </a>
              </li>
              <li>
                <a href="/#file" className="hover:text-white transition">
                  Web Crypto SHA-256 Hasher
                </a>
              </li>
              <li>
                <a href="/#claim" className="hover:text-white transition">
                  Misinformation Claim Triage
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>Taxonomies</span>
            </h4>
            <ul className="space-y-2 text-neutral-400 text-xs font-sans">
              <li>
                <a
                  href="https://attack.mitre.org"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition flex items-center space-x-1"
                >
                  <span>MITRE ATT&CK® Matrix</span>
                  <ExternalLink className="w-3 h-3 text-neutral-500" />
                </a>
              </li>
              <li>
                <span className="hover:text-white transition cursor-default">
                  RFC 1918 Private Subnets
                </span>
              </li>
              <li>
                <span className="hover:text-white transition cursor-default">
                  RFC 3927 Loopback Filters
                </span>
              </li>
              <li>
                <span className="hover:text-white transition cursor-default">
                  W3C Web Cryptography API
                </span>
              </li>
            </ul>
          </div>

          {/* Navigation Column 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>Governance</span>
            </h4>
            <ul className="space-y-2 text-neutral-400 text-xs font-sans">
              <li>
                <a href="/#privacy" className="hover:text-white transition">
                  Privacy Transparency Matrix
                </a>
              </li>
              <li>
                <span className="hover:text-white transition cursor-default">
                  Zero Geolocation Policy
                </span>
              </li>
              <li>
                <span className="hover:text-white transition cursor-default">
                  Nuclear Session Purge
                </span>
              </li>
              <li>
                <span className="hover:text-white transition cursor-default">
                  Audit Proof Verification
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Sub-bar with Glassy Social / Meta Badges */}
        <div className="pt-8 pb-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex items-center space-x-4">
            <span className="font-mono text-white">© 2026 AI Protector Platform</span>
            <span>•</span>
            <span className="font-mono text-neutral-400">Security-by-Design</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-300 text-[11px] font-mono">
              v1.0.0 Stable
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-emerald-400 text-[11px] font-mono">
              SOC Mode Active
            </span>
          </div>
        </div>
      </div>

      {/* GIANT WORDMARK CROPPED AT BOTTOM EDGE */}
      <div className="relative w-full overflow-hidden select-none pointer-events-none">
        <div
          className="text-[13vw] sm:text-[15vw] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/20 via-white/5 to-transparent leading-none -mb-4 sm:-mb-8 text-center font-mono uppercase"
          style={{ letterSpacing: '-0.05em' }}
        >
          AI PROTECTOR
        </div>
      </div>
    </footer>
  );
}
