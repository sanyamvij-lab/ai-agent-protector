'use client';

import React, { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  MessageSquareWarning,
  Link2,
  Scale,
  FileCheck2,
  EyeOff,
  Lock,
  Activity,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Cloud,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  History,
  Bot,
  Sparkles,
  Presentation,
} from 'lucide-react';
import { ProcessingMode } from '@/lib/types';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import BeamWordmarkFooter from '@/components/ui/beam-wordmark-footer';
import { ShinyButton } from '@/components/ui/shiny-button';
import { SupportedLanguage, TRANSLATIONS } from '@/lib/i18n/translations';
import { TopSecurityNotificationBar } from '@/components/notifications/TopSecurityNotificationBar';

export type NavTabId =
  | 'check_anything'
  | 'breach_password'
  | 'policy_summarizer'
  | 'app_score'
  | 'dpdp_toolkit'
  | 'emergency_1930'
  | 'scam_learn'
  | 'privacy_dashboard'
  | 'dashboard'
  | 'presentation'
  | 'message'
  | 'link'
  | 'claim'
  | 'file'
  | 'privacy'
  | 'security'
  | 'health';

interface AppShellProps {
  activeTab: NavTabId;
  onSelectTab: (tabId: NavTabId) => void;
  currentMode: ProcessingMode;
  onOpenModeModal: () => void;
  onOpenHistoryModal?: () => void;
  onOpenCopilot?: () => void;
  lang: SupportedLanguage;
  onToggleLang: () => void;
  elderMode: boolean;
  onToggleElderMode: () => void;
  onOpenWhatHappens: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onSelectTab,
  currentMode,
  onOpenModeModal,
  onOpenHistoryModal,
  onOpenCopilot,
  lang,
  onToggleLang,
  elderMode,
  onToggleElderMode,
  onOpenWhatHappens,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: healthData } = useHealthCheck(15000);
  const t = TRANSLATIONS[lang];

  const navGroups = [
    {
      group: lang === 'hi' ? 'भारत साइबर सुरक्षा सुइट' : 'India Trust Suite',
      items: [
        { id: 'check_anything' as NavTabId, label: t.tabCheckAnything, icon: <Shield className="w-4 h-4 text-emerald-400" /> },
        { id: 'breach_password' as NavTabId, label: t.tabBreach, icon: <Lock className="w-4 h-4 text-amber-400" /> },
        { id: 'policy_summarizer' as NavTabId, label: t.tabPolicy, icon: <Scale className="w-4 h-4 text-cyan-400" /> },
        { id: 'app_score' as NavTabId, label: t.tabAppScore, icon: <Activity className="w-4 h-4 text-purple-400" /> },
        { id: 'dpdp_toolkit' as NavTabId, label: t.tabDpdp, icon: <FileCheck2 className="w-4 h-4 text-indigo-400" /> },
        { id: 'emergency_1930' as NavTabId, label: t.tabEmergency, icon: <AlertCircle className="w-4 h-4 text-rose-400" /> },
        { id: 'scam_learn' as NavTabId, label: t.tabLearn, icon: <Bot className="w-4 h-4 text-sky-400" /> },
        { id: 'privacy_dashboard' as NavTabId, label: t.tabDashboard, icon: <EyeOff className="w-4 h-4 text-teal-400" /> },
      ],
    },
    {
      group: lang === 'hi' ? 'उन्नत फोरेंसिक टूल्स' : 'Advanced Forensics',
      items: [
        { id: 'dashboard' as NavTabId, label: 'Cyber Dashboard', icon: <LayoutDashboard className="w-4 h-4 text-purple-400" /> },
        { id: 'presentation' as NavTabId, label: 'Interactive PPT Deck', icon: <Presentation className="w-4 h-4 text-indigo-400" /> },
        { id: 'message' as NavTabId, label: 'Message Inspector', icon: <MessageSquareWarning className="w-4 h-4" /> },
        { id: 'link' as NavTabId, label: 'URL Deep Inspector', icon: <Link2 className="w-4 h-4" /> },
        { id: 'claim' as NavTabId, label: 'Claim Verifier', icon: <Sparkles className="w-4 h-4" /> },
        { id: 'file' as NavTabId, label: 'File Integrity', icon: <FileCheck2 className="w-4 h-4" /> },
        { id: 'health' as NavTabId, label: 'System Telemetry', icon: <Activity className="w-4 h-4" /> },
      ],
    },
  ];

  const getActiveTitle = () => {
    for (const g of navGroups) {
      const match = g.items.find((item) => item.id === activeTab);
      if (match) return match.label;
    }
    return 'Dashboard';
  };

  const getModeBadge = () => {
    switch (currentMode) {
      case 'local':
        return {
          icon: <Cpu className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Local Privacy Mode',
          className: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/60',
        };
      case 'hybrid':
        return {
          icon: <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Hybrid Mode',
          className: 'bg-amber-950/60 border-amber-500/30 text-amber-300 hover:bg-amber-900/60',
        };
      case 'cloud':
        return {
          icon: <Cloud className="w-3.5 h-3.5 text-cyan-400" />,
          label: 'Cloud AI Gateway',
          className: 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/60',
        };
    }
  };

  const modeBadge = getModeBadge();

  return (
    <div className="min-h-screen flex bg-[#0E1013] text-[#FBF9F5]">
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-white/[0.08] bg-[#111419]/95 backdrop-blur-xl transition-all duration-300 z-30 select-none ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-[#D4AF37]" />
            </div>
            {!sidebarCollapsed && (
              <div className="leading-tight">
                <span className="font-extrabold text-sm text-[#FBF9F5] tracking-tight">AI Protector</span>
                <span className="block text-[10px] text-[#D4AF37] font-semibold tracking-wider uppercase">
                  Security Guard
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!sidebarCollapsed && (
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#687687] block">
                  {group.group}
                </span>
              )}
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'presentation') {
                        window.open('/presentation', '_blank');
                      } else {
                        onSelectTab(item.id);
                      }
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-[#181C24] border border-[#D4AF37]/35 text-[#FBF9F5] shadow-sm shadow-[#D4AF37]/5'
                        : 'text-[#8E9AA8] hover:text-[#FBF9F5] hover:bg-white/[0.04] border border-transparent'
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer Status */}
        <div className="p-3 border-t border-white/[0.08] bg-[#0E1013]/80">
          <div
            onClick={onOpenModeModal}
            className={`flex items-center space-x-2.5 p-2 rounded-xl border cursor-pointer transition ${modeBadge.className}`}
          >
            {modeBadge.icon}
            {!sidebarCollapsed && (
              <div className="overflow-hidden leading-tight">
                <span className="font-bold text-[11px] block text-white">{modeBadge.label}</span>
                <span className="text-[10px] text-slate-400">Tap to configure</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-xs bg-slate-950 border-r border-slate-800 p-5 flex flex-col space-y-6 z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-base">AI Protector</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-4 overflow-y-auto">
              {navGroups.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block px-2">
                    {group.group}
                  </span>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === 'presentation') {
                          window.open('/presentation', '_blank');
                        } else {
                          onSelectTab(item.id);
                        }
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        activeTab === item.id
                          ? 'bg-cyan-950 border border-cyan-500/40 text-cyan-300'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0E1013]">
        {/* Reusable Top Security Notification System */}
        <TopSecurityNotificationBar />

        {/* Sticky Anti-Scam Security Notice Banner */}
        <div className="bg-[#141210] border-b border-amber-500/25 px-4 py-2 text-center text-xs sm:text-sm font-semibold text-[#F4EFE6] flex items-center justify-center gap-2">
          <span className="text-amber-400">🔒</span>
          <span>
            {lang === 'hi'
              ? 'सावधानी: AI Protector कभी भी आपसे OTP, UPI पिन, बैंक पासवर्ड, आधार या पैन कार्ड नंबर नहीं मांगेगा।'
              : 'Security Invariant: AI Protector will NEVER ask for your OTP, UPI PIN, Bank Password, Aadhaar or PAN card number.'}
          </span>
        </div>

        {/* Top Header Bar */}
        <header className="h-16 border-b border-white/[0.08] bg-[#0E1013]/90 backdrop-blur-md sticky top-0 z-20 px-3 sm:px-6 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5"
              aria-label="Open mobile navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Path */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-neutral-500 hidden sm:inline">AI Protector</span>
              <span className="text-neutral-600 hidden sm:inline">/</span>
              <span className="font-bold text-white text-sm">{getActiveTitle()}</span>
            </div>
          </div>

          {/* Right Header Status Controls */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Language Toggle */}
            <button
              onClick={onToggleLang}
              className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 text-xs font-bold text-white transition flex items-center gap-1.5"
              title="Toggle English / हिंदी"
            >
              <span>🌐</span>
              <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
            </button>

            {/* Elder Mode Toggle */}
            <button
              onClick={onToggleElderMode}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${
                elderMode
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-white/5 border-white/10 hover:border-white/30 text-neutral-300'
              }`}
              title={elderMode ? 'Turn off large text mode' : 'Turn on large text mode for seniors'}
            >
              <span>👓</span>
              <span className="hidden sm:inline">{elderMode ? 'Elder Mode: ON' : 'Elder Mode'}</span>
            </button>

            {/* Interactive Pitch Deck Trigger */}
            <a
              href="/presentation"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600/25 to-indigo-600/25 border border-purple-500/40 hover:border-purple-400 text-xs font-bold text-purple-200 transition flex items-center gap-1.5 shadow-sm"
              title="Open Interactive Tech Deck & Pitch Presentation"
            >
              <span className="text-purple-400">📽️</span>
              <span className="hidden sm:inline">Interactive Tech Deck</span>
            </a>

            {/* What Happens To Your Input Modal Trigger */}
            <button
              onClick={onOpenWhatHappens}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/60 text-xs font-bold text-emerald-300 transition flex items-center gap-1.5"
              title="View our zero-data persistence & privacy promises"
            >
              <span>🛡️</span>
              <span className="hidden md:inline">{t.whatHappensToInput}</span>
            </button>

            {/* Live Service Health Status */}
            <div
              onClick={() => onSelectTab('health')}
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-neutral-300 cursor-pointer hover:border-white/30 transition"
              title="Click to view real-time system health and memory diagnostics"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-neutral-400">Health:</span>
              <span className="text-emerald-400 font-semibold">
                {healthData?.status === 'healthy' ? 'Operational' : 'Online'}
              </span>
            </div>

            {/* Local History Audit Button */}
            {onOpenHistoryModal && (
              <button
                onClick={onOpenHistoryModal}
                className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 text-xs text-white transition"
                title="View private local scan history"
              >
                <History className="w-3.5 h-3.5 text-white" />
                <span className="font-medium">Audit Log</span>
              </button>
            )}

            {/* AI Security Copilot Button */}
            {onOpenCopilot && (
              <ShinyButton
                onClick={onOpenCopilot}
                variant="emerald"
                className="py-1 px-3 text-xs"
                title="Open AI Security Copilot"
              >
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">AI Copilot</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              </ShinyButton>
            )}

            {/* Top mode indicator */}
            <button
              onClick={onOpenModeModal}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${modeBadge.className}`}
              title="Click to change privacy processing mode"
            >
              {modeBadge.icon}
              <span className="font-semibold hidden sm:inline">{modeBadge.label}</span>
            </button>
          </div>
        </header>

        {/* Active Tab Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative">{children}</main>

        {/* Light Beam Footer with Giant Wordmark */}
        <div className="w-full bg-[#0D0F12]">
          <BeamWordmarkFooter />
        </div>

        {/* Floating Copilot Trigger */}
        {onOpenCopilot && (
          <div className="fixed bottom-6 right-6 z-40">
            <ShinyButton
              onClick={onOpenCopilot}
              variant="emerald"
              className="px-4 py-2.5 rounded-2xl shadow-2xl border-emerald-500/40"
              title="Chat with AI Security Copilot"
            >
              <Sparkles className="w-4 h-4 text-emerald-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>AI Copilot</span>
            </ShinyButton>
          </div>
        )}
      </div>
    </div>
  );
};
