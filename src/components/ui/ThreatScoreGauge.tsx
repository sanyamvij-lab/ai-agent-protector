'use client';

import React from 'react';
import { ThreatScoreBreakdown } from '@/lib/security/mitre-mapper';
import { ShieldAlert, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

interface ThreatScoreGaugeProps {
  score: ThreatScoreBreakdown;
  className?: string;
}

export const ThreatScoreGauge: React.FC<ThreatScoreGaugeProps> = ({ score, className = '' }) => {
  const getBadgeColor = () => {
    switch (score.severityTier) {
      case 'critical':
        return 'text-red-400 bg-red-950/80 border-red-500/40';
      case 'high':
        return 'text-orange-400 bg-orange-950/80 border-orange-500/40';
      case 'medium':
        return 'text-amber-400 bg-amber-950/80 border-amber-500/40';
      case 'low':
      case 'clean':
      default:
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40';
    }
  };

  const getScoreColor = () => {
    if (score.compositeScore >= 80) return 'text-red-400';
    if (score.compositeScore >= 60) return 'text-orange-400';
    if (score.compositeScore >= 40) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getBarColor = (val: number) => {
    if (val >= 75) return 'bg-red-500';
    if (val >= 50) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className={`p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
            Enterprise Threat Matrix
          </span>
        </div>
        <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded border uppercase flex items-center space-x-1 ${getBadgeColor()}`}>
          {score.severityTier === 'critical' && <ShieldAlert className="w-3 h-3 mr-1" />}
          {score.severityTier === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
          {score.severityTier === 'clean' && <ShieldCheck className="w-3 h-3 mr-1" />}
          <span>{score.severityTier} RISK</span>
        </span>
      </div>

      <div className="flex items-center justify-between gap-6">
        {/* Main Score Dial */}
        <div className="flex flex-col items-center justify-center bg-slate-950/80 border border-slate-800 rounded-xl px-5 py-3 min-w-[110px]">
          <span className="text-[10px] font-mono uppercase text-slate-400">Score</span>
          <div className="flex items-baseline">
            <span className={`text-3xl font-extrabold font-mono ${getScoreColor()}`}>
              {score.compositeScore}
            </span>
            <span className="text-xs text-slate-500 font-mono">/100</span>
          </div>
        </div>

        {/* Sub-Metric Breakdown Bars */}
        <div className="flex-1 space-y-2 text-xs">
          <div>
            <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
              <span>Deception Index</span>
              <span>{score.deceptionIndex}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getBarColor(score.deceptionIndex)}`}
                style={{ width: `${score.deceptionIndex}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
              <span>Infrastructure Hazard</span>
              <span>{score.infrastructureHazard}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getBarColor(score.infrastructureHazard)}`}
                style={{ width: `${score.infrastructureHazard}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
              <span>Exploitation Risk</span>
              <span>{score.exploitationRisk}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getBarColor(score.exploitationRisk)}`}
                style={{ width: `${score.exploitationRisk}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
