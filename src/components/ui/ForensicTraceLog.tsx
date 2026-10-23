'use client';

import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

export interface TraceStep {
  timeMs: number;
  label: string;
  status: 'passed' | 'flagged' | 'scrubbed' | 'completed';
  detail: string;
}

interface ForensicTraceLogProps {
  steps: TraceStep[];
  className?: string;
  defaultExpanded?: boolean;
}

export const ForensicTraceLog: React.FC<ForensicTraceLogProps> = ({
  steps,
  className = '',
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!steps || steps.length === 0) return null;

  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-left hover:bg-slate-850 transition"
      >
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-300">Forensic Execution Trace</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
            {steps.length} checks executed
          </span>
        </div>
        <div className="flex items-center space-x-1 text-slate-500 hover:text-slate-300">
          <span className="text-[11px]">{isExpanded ? 'Hide Trace' : 'View Trace'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-3 space-y-1.5 bg-slate-950/95 max-h-56 overflow-y-auto">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start space-x-2.5 text-[11px] leading-relaxed">
              <span className="text-slate-500 select-none">
                +{String(step.timeMs).padStart(3, '0')}ms
              </span>
              <span className="text-emerald-400 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5" />
              </span>
              <div className="flex-1">
                <span className="font-semibold text-slate-200">{step.label}</span>
                <span className="text-slate-400 ml-1.5">— {step.detail}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
