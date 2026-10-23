'use client';

import React, { useState } from 'react';
import { RedactionResult } from '@/lib/types';
import { Eye, EyeOff, ShieldCheck, Lock, AlertCircle } from 'lucide-react';

interface PiiDiffViewerProps {
  rawText: string;
  redaction: RedactionResult;
  className?: string;
}

export const PiiDiffViewer: React.FC<PiiDiffViewerProps> = ({
  rawText,
  redaction,
  className = '',
}) => {
  const [activeView, setActiveView] = useState<'redacted' | 'raw'>('redacted');

  if (!rawText.trim()) return null;

  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-sm ${className}`}>
      {/* Header Bar */}
      <div className="px-3.5 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-slate-300 font-semibold">Live PII Redactor</span>
          {redaction.hasSensitiveData ? (
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold flex items-center space-x-1">
              <span>{redaction.entitiesFound.length} item{redaction.entitiesFound.length > 1 ? 's' : ''} masked</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
              Zero PII detected
            </span>
          )}
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 font-mono text-[10px]">
          <button
            type="button"
            onClick={() => setActiveView('redacted')}
            className={`px-2 py-1 rounded transition flex items-center space-x-1 ${
              activeView === 'redacted'
                ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <EyeOff className="w-3 h-3 mr-0.5" />
            <span>Model Payload</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('raw')}
            className={`px-2 py-1 rounded transition flex items-center space-x-1 ${
              activeView === 'raw'
                ? 'bg-slate-800 text-slate-200 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3 mr-0.5" />
            <span>Local Device Raw</span>
          </button>
        </div>
      </div>

      {/* Entity Chips */}
      {redaction.hasSensitiveData && (
        <div className="px-3.5 py-2 bg-cyan-950/20 border-b border-cyan-500/10 flex flex-wrap gap-1.5 text-[10px] font-mono">
          <span className="text-slate-400 font-sans mr-1">Masked entities:</span>
          {redaction.entitiesFound.map((entity, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-semibold"
              title={`Original: ${entity.original} -> Masked: ${entity.masked}`}
            >
              {entity.type.toUpperCase()}: {entity.masked}
            </span>
          ))}
        </div>
      )}

      {/* Content Preview */}
      <div className="p-3 text-xs font-mono text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
        {activeView === 'redacted' ? (
          <div>
            <span className="text-[10px] text-cyan-500 font-bold block mb-1 font-sans">
              🔒 Redacted Output (Payload transmitted to server/AI):
            </span>
            {redaction.redactedText}
          </div>
        ) : (
          <div>
            <span className="text-[10px] text-amber-500 font-bold block mb-1 font-sans flex items-center space-x-1">
              <Lock className="w-3 h-3 mr-0.5" />
              <span>Raw Unscrubbed Text (Stays strictly inside your local browser memory):</span>
            </span>
            {rawText}
          </div>
        )}
      </div>
    </div>
  );
};
