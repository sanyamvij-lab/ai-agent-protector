'use client';

import React, { useState } from 'react';
import { X, Cpu, Cloud, SlidersHorizontal, ShieldCheck, AlertCircle } from 'lucide-react';
import { ProcessingMode } from '@/lib/types';

interface ProcessingModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: ProcessingMode;
  onSelectMode: (mode: ProcessingMode) => void;
}

export const ProcessingModeModal: React.FC<ProcessingModeModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
}) => {
  const [cloudConsentGiven, setCloudConsentGiven] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-xl bg-slate-900 border-sky-500/20 text-slate-100 p-6 rounded-2xl shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Processing Mode & Privacy Controls</h3>
            <p className="text-xs text-slate-400">Choose where message and link risk evaluation takes place.</p>
          </div>
        </div>

        {/* Mode options */}
        <div className="space-y-3 my-4">
          {/* Local Mode */}
          <div
            onClick={() => onSelectMode('local')}
            className={`p-4 rounded-xl border transition cursor-pointer flex items-start space-x-3 ${
              currentMode === 'local'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 text-slate-300'
            }`}
          >
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 mt-0.5">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-white">Local Privacy Mode (Recommended)</span>
                {currentMode === 'local' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Zero data leaves your browser. All pattern matching, URL decomposition, PII masking, and file hashing occur strictly on-device using Web Crypto and local rules.
              </p>
            </div>
          </div>

          {/* Hybrid Mode */}
          <div
            onClick={() => onSelectMode('hybrid')}
            className={`p-4 rounded-xl border transition cursor-pointer flex items-start space-x-3 ${
              currentMode === 'hybrid'
                ? 'bg-amber-950/40 border-amber-500/50 text-white'
                : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 text-slate-300'
            }`}
          >
            <div className="p-2 rounded-lg bg-amber-950 border border-amber-500/40 text-amber-400 mt-0.5">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-white">Hybrid Mode</span>
                {currentMode === 'hybrid' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Executes local heuristics first. Falls back to server-side threat validation only for complex or ambiguous patterns, strictly applying PII redaction first.
              </p>
            </div>
          </div>

          {/* Cloud Assisted */}
          <div
            onClick={() => {
              if (!cloudConsentGiven && currentMode !== 'cloud') {
                return;
              }
              onSelectMode('cloud');
            }}
            className={`p-4 rounded-xl border transition cursor-pointer flex items-start space-x-3 ${
              currentMode === 'cloud'
                ? 'bg-cyan-950/40 border-cyan-500/50 text-white'
                : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 text-slate-300'
            }`}
          >
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 mt-0.5">
              <Cloud className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-white">Cloud-Assisted AI (Gemini Gateway)</span>
                {currentMode === 'cloud' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Routes pre-redacted text to server-side AI model for deep semantic evaluation. Required secrets remain server-side; raw credentials and PII are redacted prior to network transmission.
              </p>

              {currentMode !== 'cloud' && (
                <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="cloud-consent"
                    checked={cloudConsentGiven}
                    onChange={(e) => {
                      setCloudConsentGiven(e.target.checked);
                      if (e.target.checked) onSelectMode('cloud');
                    }}
                    className="rounded bg-slate-800 border-slate-600 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="cloud-consent" className="text-slate-300 text-[11px] cursor-pointer">
                    I consent to transmitting PII-redacted text to the secure backend AI gateway.
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Files are always hashed locally, regardless of mode.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
