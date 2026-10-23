'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  AlertCircle,
  Info,
  CheckCircle2,
  HelpCircle,
  X,
  ChevronDown,
  ChevronUp,
  History,
  ShieldCheck,
  Lock,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { SecurityNotification, NotificationSeverity } from '@/lib/notifications/types';
import { useSecurityNotifications } from '@/lib/notifications/useSecurityNotifications';

interface TopSecurityNotificationBarProps {
  onActionClick?: (notification: SecurityNotification) => void;
}

export const TopSecurityNotificationBar: React.FC<TopSecurityNotificationBarProps> = ({
  onActionClick,
}) => {
  const { topNotification, activeNotifications, history, dismiss, resolve, clearHistory } =
    useSecurityNotifications();

  const [isEvidenceExpanded, setIsEvidenceExpanded] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBlockingModalOpen, setIsBlockingModalOpen] = useState(false);
  const [overrideCountdown, setOverrideCountdown] = useState<number | null>(null);

  // Close evidence on alert change
  useEffect(() => {
    setIsEvidenceExpanded(false);
  }, [topNotification?.id]);

  // Handle Escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isBlockingModalOpen) setIsBlockingModalOpen(false);
        if (isHistoryOpen) setIsHistoryOpen(false);
        if (isEvidenceExpanded) setIsEvidenceExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBlockingModalOpen, isHistoryOpen, isEvidenceExpanded]);

  if (!topNotification && history.length === 0) {
    return null;
  }

  const getSeverityConfig = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />,
          label: 'CRITICAL THREAT BLOCKED',
          pillClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          barClass: 'bg-[#181114] border-rose-500/35 text-rose-100',
          ariaLive: 'assertive' as const,
        };
      case 'high_risk':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />,
          label: 'HIGH RISK HAZARD',
          pillClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          barClass: 'bg-[#181215] border-rose-500/30 text-rose-100',
          ariaLive: 'assertive' as const,
        };
      case 'medium_risk':
        return {
          icon: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />,
          label: 'CAUTION ADVISED',
          pillClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          barClass: 'bg-[#171410] border-amber-500/25 text-amber-100',
          ariaLive: 'polite' as const,
        };
      case 'inconclusive':
        return {
          icon: <HelpCircle className="w-4 h-4 text-slate-300 shrink-0" />,
          label: 'ANALYSIS INCONCLUSIVE',
          pillClass: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
          barClass: 'bg-[#12151A] border-slate-600/30 text-slate-200',
          ariaLive: 'polite' as const,
        };
      case 'resolved':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
          label: 'RESOLVED',
          pillClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          barClass: 'bg-[#101714] border-emerald-500/25 text-emerald-100',
          ariaLive: 'polite' as const,
        };
      case 'informational':
      default:
        return {
          icon: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
          label: 'DEFENSE TELEMETRY',
          pillClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
          barClass: 'bg-[#11161D] border-sky-500/20 text-sky-100',
          ariaLive: 'polite' as const,
        };
    }
  };

  const handleStartOverride = () => {
    setOverrideCountdown(3);
    const interval = setInterval(() => {
      setOverrideCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const currentConfig = topNotification ? getSeverityConfig(topNotification.severity) : null;

  return (
    <>
      {/* Top Sticky Notification Region */}
      {topNotification && currentConfig && (
        <section
          role="region"
          aria-label="Security Notification Alert"
          aria-live={currentConfig.ariaLive}
          className={`border-b transition-all duration-200 z-40 relative px-3 py-2.5 sm:px-6 select-none ${currentConfig.barClass}`}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            {/* Left: Icon, Severity Badge, Title, and Concise Explanation */}
            <div className="flex items-start sm:items-center space-x-2.5 min-w-0">
              <div className="mt-0.5 sm:mt-0">{currentConfig.icon}</div>
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider uppercase border shrink-0 ${currentConfig.pillClass}`}
                >
                  {currentConfig.label}
                </span>

                <span className="font-semibold text-xs sm:text-sm truncate text-[#FBF9F5]">
                  {topNotification.title}
                </span>

                <span className="hidden lg:inline text-xs opacity-75 truncate max-w-md">
                  — {topNotification.explanation}
                </span>
              </div>
            </div>

            {/* Right: Actions, Evidence Toggle, History & Dismiss */}
            <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
              {/* Evidence Inspector Toggle */}
              {topNotification.evidence && topNotification.evidence.length > 0 && (
                <button
                  onClick={() => setIsEvidenceExpanded(!isEvidenceExpanded)}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] font-medium text-neutral-200 transition flex items-center gap-1 border border-white/10 focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
                  aria-expanded={isEvidenceExpanded}
                  aria-controls="notification-evidence-drawer"
                >
                  <span>Evidence ({topNotification.evidence.length})</span>
                  {isEvidenceExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              )}

              {/* Protective Blocking Review */}
              {topNotification.isBlocked && (
                <button
                  onClick={() => setIsBlockingModalOpen(true)}
                  className="px-2.5 py-1 rounded bg-rose-500/25 hover:bg-rose-500/40 text-rose-200 text-[11px] font-bold border border-rose-500/40 transition flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  <span>Review Protection</span>
                </button>
              )}

              {/* Action Button (e.g. Do This Next) */}
              {topNotification.recommendedAction && (
                <button
                  onClick={() => onActionClick?.(topNotification)}
                  className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#E8D5A3] text-[11px] font-semibold border border-[#D4AF37]/30 transition"
                  title={topNotification.recommendedAction}
                >
                  <span>{topNotification.recommendedAction}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}

              {/* Notification History Trigger */}
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/5 transition relative"
                title="View notification audit history"
                aria-label="View notification audit history"
              >
                <History className="w-3.5 h-3.5" />
                {activeNotifications.length > 1 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#D4AF37] text-black text-[9px] font-bold flex items-center justify-center">
                    {activeNotifications.length}
                  </span>
                )}
              </button>

              {/* Dismiss Control (with policy check) */}
              {topNotification.dismissible ? (
                <button
                  onClick={() => dismiss(topNotification.id)}
                  className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/5 transition"
                  title="Dismiss notification"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => resolve(topNotification.id)}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 border border-white/10 transition"
                  title="Acknowledge and resolve this threat indicator"
                >
                  Acknowledge
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Evidence & Uncertainty Drawer */}
          {isEvidenceExpanded && (
            <div
              id="notification-evidence-drawer"
              className="mt-3 pt-3 border-t border-white/10 text-xs space-y-2 animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-neutral-400">Source:</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/10 font-mono text-[11px]">
                  {topNotification.source}
                </span>

                {topNotification.target && (
                  <>
                    <span className="font-semibold text-neutral-400 ml-2">Target:</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/10 font-mono text-[11px] truncate max-w-xs">
                      {topNotification.target}
                    </span>
                  </>
                )}

                <span className="font-semibold text-neutral-400 ml-2">Timestamp:</span>
                <span className="text-neutral-400 font-mono text-[11px]">
                  {new Date(topNotification.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>

              <div>
                <span className="font-semibold text-neutral-300 block mb-1">
                  Corroborating Evidence Signals:
                </span>
                <ul className="list-disc list-inside space-y-1 text-neutral-300 pl-1">
                  {topNotification.evidence.map((ev, i) => (
                    <li key={i} className="text-[11px] leading-relaxed">
                      {ev}
                    </li>
                  ))}
                </ul>
              </div>

              {topNotification.severity === 'inconclusive' && (
                <div className="p-2 rounded bg-slate-900/60 border border-slate-700/50 text-slate-300 text-[11px]">
                  ⚠️ <strong>Uncertainty Disclosure:</strong> Third-party security telemetry timed out or
                  reported conflicting indicators. AI Protector fails closed and will never report a silent
                  &quot;safe&quot; on inconclusive data.
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Protective Block Barrier Interstitial Modal */}
      {isBlockingModalOpen && topNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="block-dialog-title"
            className="w-full max-w-lg bg-[#14171D] border border-rose-500/40 rounded-2xl p-6 shadow-2xl text-[#FBF9F5] space-y-5"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 id="block-dialog-title" className="text-lg font-bold text-rose-300">
                  Defensive Barrier Engaged
                </h3>
                <p className="text-xs text-neutral-400">High-confidence malicious indicator intercepted</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 leading-relaxed space-y-2">
              <p className="font-semibold text-rose-100">{topNotification.title}</p>
              <p>{topNotification.explanation}</p>
              {topNotification.target && (
                <div className="pt-1 font-mono text-[11px] text-rose-300 break-all">
                  Target: {topNotification.target}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Recommended Action:
              </h4>
              <p className="text-xs text-neutral-300">
                {topNotification.recommendedAction || 'Do not access this resource or enter personal information.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
              <button
                onClick={() => {
                  resolve(topNotification.id);
                  setIsBlockingModalOpen(false);
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#DFBF68] text-black font-bold text-xs transition cursor-pointer"
              >
                Accept Protection & Close
              </button>

              {/* Informed Override Bypass Mechanism */}
              {overrideCountdown === null ? (
                <button
                  onClick={handleStartOverride}
                  className="text-xs text-neutral-400 hover:text-neutral-200 underline decoration-neutral-600 transition"
                >
                  I understand the risk and wish to override
                </button>
              ) : overrideCountdown > 0 ? (
                <span className="text-xs text-amber-400 font-mono">
                  Override unlocking in {overrideCountdown}s...
                </span>
              ) : (
                <button
                  onClick={() => {
                    dismiss(topNotification.id, true);
                    setIsBlockingModalOpen(false);
                    setOverrideCountdown(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-950 border border-rose-500/40 text-rose-300 hover:bg-rose-900 text-xs font-bold transition"
                >
                  Confirm Force Override
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Security Notification Audit History Flyout */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-dialog-title"
            className="w-full max-w-2xl bg-[#14171D] border border-white/10 rounded-2xl p-6 shadow-2xl text-[#FBF9F5] flex flex-col max-h-[85vh]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <History className="w-5 h-5 text-[#D4AF37]" />
                <h3 id="history-dialog-title" className="text-base font-bold text-white">
                  Security Notification Audit Trail
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="p-1.5 rounded text-neutral-400 hover:text-rose-400 hover:bg-white/5 transition"
                    title="Clear notification audit log"
                    aria-label="Clear notification audit log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-white/5 transition"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {history.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 space-y-2">
                  <ShieldCheck className="w-10 h-10 mx-auto text-neutral-600" />
                  <p className="text-sm">No recorded threat alerts in this session.</p>
                </div>
              ) : (
                history.map((item) => {
                  const cfg = getSeverityConfig(item.severity);
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-[#101318] border border-white/5 hover:border-white/10 transition text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold border uppercase ${cfg.pillClass}`}
                          >
                            {cfg.label}
                          </span>
                          <span className="font-bold text-neutral-200">{item.title}</span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {new Date(item.timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-neutral-400 text-[11px] leading-relaxed">
                        {item.explanation}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-500">
                        <span>Source: {item.source}</span>
                        <span className="capitalize">Status: {item.status}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
              <span>Audit retention: in-memory / local encrypted store only.</span>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
