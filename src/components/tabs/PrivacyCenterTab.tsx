'use client';

import React, { useState } from 'react';
import {
  EyeOff,
  ShieldCheck,
  Lock,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Cloud,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { ProcessingMode } from '@/lib/types';

interface PrivacyCenterTabProps {
  currentMode: ProcessingMode;
  onSelectMode: (mode: ProcessingMode) => void;
  onClearSession: () => void;
}

export const PrivacyCenterTab: React.FC<PrivacyCenterTabProps> = ({
  currentMode,
  onSelectMode,
  onClearSession,
}) => {
  const [wipeConfirmed, setWipeConfirmed] = useState(false);

  const handleWipe = () => {
    onClearSession();
    setWipeConfirmed(true);
    setTimeout(() => setWipeConfirmed(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <EyeOff className="w-5 h-5 text-cyan-400" />
          <span>Privacy Center & Permission Minimization</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Review active permission controls, audit data retention policies, and manage local data destruction.
        </p>
      </div>

      {/* Permission Minimization Audit Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Geolocation */}
        <div className="glass-card p-5 space-y-2 border-emerald-500/20">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Geolocation Status</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-bold text-[10px]">
              DISABLED
            </span>
          </div>
          <div className="text-lg font-bold text-emerald-400 flex items-center space-x-1.5">
            <Lock className="w-4 h-4" />
            <span>Zero Geolocation</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            GPS and precise location permissions are never requested. Basic risk evaluation functions completely without location data.
          </p>
        </div>

        {/* Camera & Microphone */}
        <div className="glass-card p-5 space-y-2 border-emerald-500/20">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Hardware Sensors</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-bold text-[10px]">
              UNTOUCHED
            </span>
          </div>
          <div className="text-lg font-bold text-emerald-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>0 Sensor Requests</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Microphone, camera, and device motion APIs are neither requested nor utilized across any workflow.
          </p>
        </div>

        {/* Server Retention */}
        <div className="glass-card p-5 space-y-2 border-cyan-500/20">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Backend Retention</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 font-bold text-[10px]">
              EPHEMERAL
            </span>
          </div>
          <div className="text-lg font-bold text-cyan-400 flex items-center space-x-1.5">
            <RefreshCw className="w-4 h-4" />
            <span>Zero Storage</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Scan requests execute in-memory. Submitted messages, files, and URLs are never saved to databases or persistent disk logs.
          </p>
        </div>
      </div>

      {/* Private Browsing Reality Check */}
      <div className="glass-card p-6 space-y-3 bg-slate-900/90 border-slate-700/80">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Understanding Private Browsing Boundaries</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          AI Protector adheres to strict truth-in-advertising principles: <strong>No tool can guarantee total anonymity.</strong> Private browsing modes and safe-link auditing prevent local tracking artifacts, but cannot hide your activity from internet service providers (ISPs), organizational network gateways, or websites after logging in.
        </p>
      </div>

      {/* Data Destruction / Nuclear Wipe */}
      <div className="glass-card p-6 space-y-4 border-rose-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Nuclear Data Wipe (One-Click Purge)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Immediately erase all session telemetry, calculated hashes, cached inputs, and local browser state.
            </p>
          </div>

          <button
            onClick={handleWipe}
            className="px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-semibold transition cursor-pointer flex items-center space-x-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{wipeConfirmed ? 'Purged Successfully!' : 'Purge All Local Data'}</span>
          </button>
        </div>

        {wipeConfirmed && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>All session memory, scan counts, and local state have been permanently purged.</span>
          </div>
        )}
      </div>

      {/* Data Flow Specification */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>Data-Processing Transparency Matrix</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Data Flow</th>
                <th className="py-2.5 px-3">Processing Location</th>
                <th className="py-2.5 px-3">PII Masked?</th>
                <th className="py-2.5 px-3">Persistence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">File Checksums</td>
                <td className="py-2.5 px-3 text-emerald-400">100% Local (Web Crypto)</td>
                <td className="py-2.5 px-3">N/A (Never leaves device)</td>
                <td className="py-2.5 px-3">Zero (In-memory)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">URL Risk Audit</td>
                <td className="py-2.5 px-3">Local or Backend Gateway</td>
                <td className="py-2.5 px-3">Yes (Anti-SSRF stripped)</td>
                <td className="py-2.5 px-3">Zero</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Message Risk Scan</td>
                <td className="py-2.5 px-3">Local or Backend AI Gateway</td>
                <td className="py-2.5 px-3 text-emerald-400">Yes (Pre-flight scrubbed)</td>
                <td className="py-2.5 px-3">Zero</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Geolocation & Hardware</td>
                <td className="py-2.5 px-3 text-rose-400">Disabled by Default</td>
                <td className="py-2.5 px-3">Never Requested</td>
                <td className="py-2.5 px-3">Zero</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
