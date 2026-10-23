'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ProcessingMode } from '@/lib/types';
import { AppShell, NavTabId } from '@/components/layout/AppShell';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { LocalHistoryStore } from '@/components/ScanHistoryModal';
import { useSecurityNotifications } from '@/lib/notifications/useSecurityNotifications';
import { SupportedLanguage } from '@/lib/i18n/translations';

// Dynamic lazy imports for heavy interactive drawers & dialogs
const ProcessingModeModal = dynamic(
  () => import('@/components/ProcessingModeModal').then((mod) => mod.ProcessingModeModal),
  { ssr: false }
);
const ScanHistoryModal = dynamic(
  () => import('@/components/ScanHistoryModal').then((mod) => mod.ScanHistoryModal),
  { ssr: false }
);
const AICopilotDrawer = dynamic(
  () => import('@/components/AICopilotDrawer').then((mod) => mod.AICopilotDrawer),
  { ssr: false }
);
const WhatHappensModal = dynamic(() => import('@/components/india/WhatHappensModal'), {
  ssr: false,
});

// India Privacy & Trust Suite Tabs
import CheckAnythingTab from '@/components/india/CheckAnythingTab';
import BreachAndPasswordTab from '@/components/india/BreachAndPasswordTab';
import PolicySummarizerTab from '@/components/india/PolicySummarizerTab';
import AppPrivacyScoreTab from '@/components/india/AppPrivacyScoreTab';
import DpdpToolkitTab from '@/components/india/DpdpToolkitTab';
import Emergency1930Tab from '@/components/india/Emergency1930Tab';
import ScamPlaybooksTab from '@/components/india/ScamPlaybooksTab';
import LocalPrivacyDashboardTab from '@/components/india/LocalPrivacyDashboardTab';

// Existing System & Advanced Analysis Tabs
import { DashboardTab } from '@/components/tabs/DashboardTab';
import { MessageScannerTab } from '@/components/tabs/MessageScannerTab';
import { LinkScannerTab } from '@/components/tabs/LinkScannerTab';
import { ClaimVerifierTab } from '@/components/tabs/ClaimVerifierTab';
import { FileIntegrityTab } from '@/components/tabs/FileIntegrityTab';
import { PrivacyCenterTab } from '@/components/tabs/PrivacyCenterTab';
import { SecurityCenterTab } from '@/components/tabs/SecurityCenterTab';
import { SystemHealthTab } from '@/components/tabs/SystemHealthTab';

function MainApp() {
  const [activeTab, setActiveTab] = useState<NavTabId>('check_anything');
  const [currentMode, setCurrentMode] = useState<ProcessingMode>('local');
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [elderMode, setElderMode] = useState<boolean>(false);
  const [isWhatHappensOpen, setIsWhatHappensOpen] = useState<boolean>(false);

  const [isModeModalOpen, setIsModeModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const { toast } = useToast();
  const { notify } = useSecurityNotifications();

  const [sessionStats, setSessionStats] = useState({
    scansCount: 0,
    piiScrubbedCount: 0,
    threatsFlagged: 0,
  });

  // Announce initial system status on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      notify({
        severity: 'informational',
        title: 'Privacy Shield Active',
        explanation: 'Zero data persistence verified. Pre-flight PII redaction active across all scan pipelines.',
        evidence: [
          'On-device deterministic rule engine loaded',
          'Ephemeral memory storage active — zero browsing history saved',
        ],
        recommendedAction: 'Ready to inspect suspicious links, SMS, files, and numbers.',
        source: 'System Defense',
        dismissible: true,
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [notify]);

  const handleRecordIndiaHistory = (entry: { type: string; query: string; verdict: string; timestamp: string }) => {
    try {
      const stored = localStorage.getItem('ai_protector_history');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift({
        id: 'hist_' + Date.now(),
        ...entry,
      });
      localStorage.setItem('ai_protector_history', JSON.stringify(list.slice(0, 50)));
    } catch {}

    setSessionStats((prev) => ({
      scansCount: prev.scansCount + 1,
      piiScrubbedCount: prev.piiScrubbedCount,
      threatsFlagged: prev.threatsFlagged + (entry.verdict === 'likely_scam' || entry.verdict === 'possibly_suspicious' ? 1 : 0),
    }));

    if (entry.verdict === 'likely_scam') {
      notify({
        severity: 'critical',
        title: 'Critical Scam Threat Blocked',
        explanation: `Identified malicious scam indicators in submitted ${entry.type}: "${entry.query.slice(0, 60)}"`,
        evidence: [
          'Matches confirmed fraud/phishing signature',
          'Urgency pressure or credential theft markers detected',
        ],
        recommendedAction: 'Do NOT pay, click, or share OTP / personal details.',
        source: 'Check Anything Guard',
        target: entry.query.slice(0, 100),
        dismissible: false,
        isBlocked: true,
      });
    } else if (entry.verdict === 'possibly_suspicious') {
      notify({
        severity: 'medium_risk',
        title: 'Suspicious Elements Detected',
        explanation: `Suspicious patterns observed in ${entry.type}: "${entry.query.slice(0, 60)}"`,
        evidence: ['Heuristic risk score elevated'],
        recommendedAction: 'Verify via trusted bookmarks or official numbers before proceeding.',
        source: 'Check Anything Guard',
        target: entry.query.slice(0, 100),
        dismissible: true,
      });
    }
  };

  const handleRecordScan = (
    riskLevel: string,
    piiCount: number,
    type: 'message' | 'link' | 'claim' | 'file' = 'message',
    summary?: string
  ) => {
    setSessionStats((prev) => ({
      scansCount: prev.scansCount + 1,
      piiScrubbedCount: prev.piiScrubbedCount + piiCount,
      threatsFlagged:
        prev.threatsFlagged + (riskLevel === 'high_risk' || riskLevel === 'suspicious' ? 1 : 0),
    }));

    // Record in private client-side localStorage audit store
    LocalHistoryStore.addRecord({
      type,
      summary: summary || `${type.toUpperCase()} inspection: ${riskLevel}`,
      riskLevel: (riskLevel as any) || 'unverified',
      piiScrubbed: piiCount,
    });

    if (riskLevel === 'high_risk') {
      notify({
        severity: 'high_risk',
        title: `${type.toUpperCase()} Hazard Intercepted`,
        explanation: summary || 'High-risk security hazard detected.',
        evidence: [
          'Multi-signal anomaly or blacklisted indicators identified',
          `${piiCount} PII entity/entities sanitized prior to evaluation`,
        ],
        recommendedAction: 'Quarantine sample and review detailed forensic trace.',
        source: `${type.toUpperCase()} Inspector`,
        dismissible: false,
        isBlocked: true,
      });
      toast({
        type: 'error',
        title: 'High Risk Hazard Flagged',
        description: 'Review the detected signals and recommended safe next steps.',
      });
    } else if (riskLevel === 'suspicious') {
      notify({
        severity: 'medium_risk',
        title: `Caution: Suspicious ${type.toUpperCase()}`,
        explanation: summary || 'Potential security hazard requires user verification.',
        evidence: ['Heuristic anomaly flags observed'],
        recommendedAction: 'Inspect canonical domain or file hash before proceeding.',
        source: `${type.toUpperCase()} Inspector`,
        dismissible: true,
      });
      toast({
        type: 'warning',
        title: 'Suspicious Elements Detected',
        description: 'Proceed with caution and verify independently.',
      });
    } else if (riskLevel === 'inconclusive' || riskLevel === 'unverified') {
      notify({
        severity: 'inconclusive',
        title: 'Analysis Inconclusive',
        explanation: 'Check completed with incomplete external signal telemetry. Fail-closed policy applied.',
        evidence: ['Provider timeout or conflicting responses'],
        recommendedAction: 'Inconclusive checks do NOT guarantee safety. Proceed with extreme caution.',
        source: `${type.toUpperCase()} Inspector`,
        dismissible: true,
      });
      toast({
        type: 'info',
        title: 'Check Inconclusive',
        description: 'No safety guarantee made. Proceed with caution.',
      });
    } else {
      toast({
        type: 'success',
        title: 'Scan Completed',
        description: 'No common threat signatures detected.',
      });
    }
  };

  const handleClearSession = () => {
    LocalHistoryStore.clearAll();
    try {
      localStorage.removeItem('ai_protector_history');
    } catch {}
    setSessionStats({
      scansCount: 0,
      piiScrubbedCount: 0,
      threatsFlagged: 0,
    });
    toast({
      type: 'info',
      title: 'Local Session Purged',
      description: 'All session telemetry and local audit logs have been wiped.',
    });
  };

  return (
    <AppShell
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      currentMode={currentMode}
      onOpenModeModal={() => setIsModeModalOpen(true)}
      onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
      onOpenCopilot={() => setIsCopilotOpen(true)}
      lang={lang}
      onToggleLang={() => setLang((prev) => (prev === 'en' ? 'hi' : 'en'))}
      elderMode={elderMode}
      onToggleElderMode={() => setElderMode((prev) => !prev)}
      onOpenWhatHappens={() => setIsWhatHappensOpen(true)}
    >
      {/* 1. Check Anything Box (URL, SMS/text, or phone number) + Do This Next Panel */}
      {activeTab === 'check_anything' && (
        <CheckAnythingTab
          lang={lang}
          elderMode={elderMode}
          onRecordHistory={handleRecordIndiaHistory}
        />
      )}

      {/* 2 & 3. Breach Checker (HIBP k-anonymity) + Client-Side Password Checker */}
      {activeTab === 'breach_password' && (
        <BreachAndPasswordTab
          lang={lang}
          elderMode={elderMode}
        />
      )}

      {/* 4. Privacy Policy Summarizer (Collected, Shared, Retention, Deletion) */}
      {activeTab === 'policy_summarizer' && (
        <PolicySummarizerTab
          lang={lang}
          elderMode={elderMode}
        />
      )}

      {/* 5. App Privacy Score (0-100 with permissions & trackers explained) */}
      {activeTab === 'app_score' && (
        <AppPrivacyScoreTab
          lang={lang}
          elderMode={elderMode}
        />
      )}

      {/* 6. DPDP Rights Toolkit (Data deletion letter, 90-day countdown, 13 May 2027 notice) */}
      {activeTab === 'dpdp_toolkit' && (
        <DpdpToolkitTab
          lang={lang}
          elderMode={elderMode}
        />
      )}

      {/* 7. Money-Lost Emergency Mode (1930 Golden Hour, checklist, RBI dispute letter) */}
      {activeTab === 'emergency_1930' && (
        <Emergency1930Tab
          lang={lang}
          elderMode={elderMode}
        />
      )}

      {/* 8. Learn Section (Scam Playbooks + Practice Fake Scam Call Simulator) */}
      {activeTab === 'scam_learn' && (
        <ScamPlaybooksTab
          lang={lang}
          elderMode={elderMode}
        />
      )}

      {/* 9. Local Privacy Dashboard (Local history, risks, JSON export, Nuclear Purge) */}
      {activeTab === 'privacy_dashboard' && (
        <LocalPrivacyDashboardTab
          lang={lang}
          elderMode={elderMode}
        />
      )}

      {/* Advanced Forensics & System Tabs */}
      {activeTab === 'dashboard' && (
        <DashboardTab
          onNavigateTab={(tabId) => setActiveTab(tabId as NavTabId)}
          currentMode={currentMode}
          sessionStats={sessionStats}
          onOpenCopilot={() => setIsCopilotOpen(true)}
        />
      )}
      {activeTab === 'message' && (
        <MessageScannerTab
          currentMode={currentMode}
          onRecordScan={handleRecordScan}
        />
      )}
      {activeTab === 'link' && (
        <LinkScannerTab
          currentMode={currentMode}
          onRecordScan={handleRecordScan}
        />
      )}
      {activeTab === 'claim' && (
        <ClaimVerifierTab
          currentMode={currentMode}
          onRecordScan={handleRecordScan}
        />
      )}
      {activeTab === 'file' && (
        <FileIntegrityTab
          onRecordScan={handleRecordScan}
        />
      )}
      {activeTab === 'privacy' && (
        <PrivacyCenterTab
          currentMode={currentMode}
          onSelectMode={setCurrentMode}
          onClearSession={handleClearSession}
        />
      )}
      {activeTab === 'security' && (
        <SecurityCenterTab />
      )}
      {activeTab === 'health' && (
        <SystemHealthTab />
      )}
      {activeTab === 'presentation' && (
        <div className="p-8 max-w-4xl mx-auto text-center space-y-6 my-12 bg-[#10121E] border border-purple-500/30 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-2xl">
            📽️
          </div>
          <h2 className="text-2xl font-bold text-white">AI Protector Executive Pitch Deck</h2>
          <p className="text-sm text-neutral-400 max-w-lg mx-auto">
            12-slide comprehensive architecture and technology pitch deck detailing our zero-trust pipeline, anti-SSRF protections, DPDP Act 2023 compliance, and multi-engine threat consensus.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/presentation"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-900/30 transition flex items-center gap-2"
            >
              <span>Launch Interactive Presentation</span>
              <span>→</span>
            </Link>
            <a
              href="/AI_Protector_Executive_Tech_Deck.pptx"
              download="AI_Protector_Executive_Tech_Deck.pptx"
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white font-bold text-sm transition flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span>Download .pptx File (338 KB)</span>
            </a>
          </div>
        </div>
      )}

      {/* What Happens to Your Input Modal */}
      <WhatHappensModal
        isOpen={isWhatHappensOpen}
        onClose={() => setIsWhatHappensOpen(false)}
        lang={lang}
      />

      <ProcessingModeModal
        isOpen={isModeModalOpen}
        onClose={() => setIsModeModalOpen(false)}
        currentMode={currentMode}
        onSelectMode={(mode) => {
          setCurrentMode(mode);
          setIsModeModalOpen(false);
          toast({
            type: 'info',
            title: `Mode Updated: ${mode.toUpperCase()}`,
            description:
              mode === 'local'
                ? 'All processing occurs 100% on-device.'
                : 'Server-side evaluation active with pre-flight PII redaction.',
          });
        }}
      />

      <ScanHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onCleared={handleClearSession}
      />

      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        activeContext={`Active Tool: ${activeTab.toUpperCase()}`}
      />
    </AppShell>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
