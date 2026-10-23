'use client';

import React from 'react';
import { Shield, Lock, Cpu, Cloud, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { ProcessingMode } from '@/lib/types';

interface HeaderProps {
  currentMode: ProcessingMode;
  onOpenModeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentMode, onOpenModeModal }) => {
  const getModeBadge = () => {
    switch (currentMode) {
      case 'local':
        return {
          icon: <Cpu className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Local Privacy Mode',
          desc: '100% on-device processing',
          className: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/60',
        };
      case 'hybrid':
        return {
          icon: <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Hybrid Mode',
          desc: 'Local-first with fallback',
          className: 'bg-amber-950/60 border-amber-500/30 text-amber-300 hover:bg-amber-900/60',
        };
      case 'cloud':
        return {
          icon: <Cloud className="w-3.5 h-3.5 text-cyan-400" />,
          label: 'Cloud-Assisted AI',
          desc: 'Consented external analysis',
          className: 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/60',
        };
    }
  };

  const badge = getModeBadge();

  return (
    <header className="border-b border-sky-500/15 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">AI Protector</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                MVP v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Private by design. Trust by intelligence.</p>
          </div>
        </div>

        {/* Status badges & mode toggle */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Lock className="w-3 h-3 text-cyan-400" />
            <span>Zero Geolocation</span>
          </div>

          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Client Hashing</span>
          </div>

          <button
            onClick={onOpenModeModal}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${badge.className}`}
            title="Click to configure processing mode and privacy permissions"
          >
            {badge.icon}
            <span className="font-semibold">{badge.label}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
