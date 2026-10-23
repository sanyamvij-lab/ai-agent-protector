'use client';

import React, { useState } from 'react';
import { SupportedLanguage, TRANSLATIONS } from '@/lib/i18n/translations';
import {
  AppPrivacyScorer,
  PERMISSION_DATABASE,
  TRACKER_DATABASE,
  SAMPLE_APP_PRESETS,
  AppScoreResult,
} from '@/lib/privacy/app-privacy-scorer';

interface AppPrivacyScoreTabProps {
  lang: SupportedLanguage;
  elderMode: boolean;
}

export default function AppPrivacyScoreTab({ lang, elderMode }: AppPrivacyScoreTabProps) {
  const t = TRANSLATIONS[lang];
  const [appName, setAppName] = useState('My Custom Mobile App');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'READ_SMS',
    'READ_CONTACTS',
    'ACCESS_FINE_LOCATION',
  ]);
  const [selectedTrackers, setSelectedTrackers] = useState<string[]>(['facebook_ads', 'inmobi']);

  const scoreResult: AppScoreResult = AppPrivacyScorer.calculate(
    appName,
    selectedPermissions,
    selectedTrackers
  );

  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleTracker = (id: string) => {
    setSelectedTrackers((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const loadPreset = (presetIdx: number) => {
    const preset = SAMPLE_APP_PRESETS[presetIdx];
    if (preset) {
      setAppName(preset.appName);
      setSelectedPermissions(preset.permissions);
      setSelectedTrackers(preset.trackers);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-red-400 border-red-500/40 bg-red-500/10';
  };

  return (
    <div className={`space-y-6 ${elderMode ? 'text-lg' : 'text-sm'}`}>
      {/* Preset Selector */}
      <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className={`font-bold text-white flex items-center gap-2 ${elderMode ? 'text-2xl' : 'text-lg'}`}>
          📱 {t.tabAppScore} (0–100 Transparent Index)
        </h2>
        <p className="text-neutral-400">
          {lang === 'hi'
            ? 'मोबाइल ऐप्स द्वारा मांगी जाने वाली खतरनाक अनुमतियों (Permissions) और विज्ञापनों के ट्रैकर्स का पारदर्शी स्कोर देखें।'
            : 'Inspect how runtime Android/iOS permissions and ad trackers impact an app\'s privacy safety score.'}
        </p>

        {/* Quick Presets */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-neutral-400 self-center">Try Presets:</span>
          {SAMPLE_APP_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(idx)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#090A0D] border border-[#232833] text-neutral-300 hover:text-white hover:border-neutral-500 transition"
            >
              {p.appName.split(' ')[0]} {p.appName.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Score HUD Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
            Calculated Privacy Score
          </span>
          <div
            className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center my-2 ${getScoreColor(
              scoreResult.score
            )}`}
          >
            <span className="text-4xl font-black">{scoreResult.score}</span>
            <span className="text-xs font-bold uppercase">{scoreResult.grade} GRADE</span>
          </div>
          <span className="font-bold text-white text-base mt-2">{scoreResult.riskRating}</span>
          <span className="text-xs text-neutral-500 mt-1">Deductions: -{scoreResult.totalDeductions} pts</span>
        </div>

        {/* Scoring Methodology Panel */}
        <div className="md:col-span-2 bg-[#14171D] border border-[#232833] rounded-2xl p-6 shadow-xl space-y-3">
          <h3 className="font-bold text-white text-sm">📐 Visible Scoring Methodology</h3>
          <p className="text-xs text-neutral-300 leading-relaxed bg-[#090A0D] p-3 rounded-xl border border-[#232833]">
            {scoreResult.scoringFormula}
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs pt-2">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-neutral-300">
              <strong className="text-red-400 block mb-1">Critical Permissions</strong>
              Reading SMS (-18 pts) or Contacts (-15 pts) severely degrades score because they allow financial OTP interception and harassment.
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-neutral-300">
              <strong className="text-amber-400 block mb-1">Embedded Ad Trackers</strong>
              Commercial profiling SDKs deduct -6 to -7 pts each because they silently upload device identifiers to external brokers.
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Permission Toggles */}
      <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base">Toggle Android / iOS Runtime Permissions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.values(PERMISSION_DATABASE).map((perm) => {
            const isChecked = selectedPermissions.includes(perm.id);
            return (
              <label
                key={perm.id}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  isChecked
                    ? 'bg-red-500/5 border-red-500/40 text-white'
                    : 'bg-[#090A0D] border-[#232833] text-neutral-400 hover:border-neutral-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => togglePermission(perm.id)}
                  className="mt-1 w-4 h-4 rounded"
                />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{perm.name}</span>
                    <span className="text-[10px] text-red-400 font-bold">-{perm.deduction} pts</span>
                  </div>
                  <p className="text-xs text-neutral-400">{perm.plainDescription}</p>
                  <p className="text-[11px] text-red-300/80 italic">{perm.whyDangerous}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Embedded Trackers Toggles */}
      <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base">Toggle Embedded Commercial Trackers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.values(TRACKER_DATABASE).map((tracker) => {
            const isChecked = selectedTrackers.includes(tracker.name.toLowerCase().includes('meta') ? 'facebook_ads' : tracker.name.toLowerCase().includes('appsflyer') ? 'appsflyer' : tracker.name.toLowerCase().includes('inmobi') ? 'inmobi' : 'google_analytics_firebase');
            const trackerKey = Object.keys(TRACKER_DATABASE).find((k) => TRACKER_DATABASE[k].name === tracker.name) || '';

            return (
              <label
                key={tracker.name}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedTrackers.includes(trackerKey)
                    ? 'bg-amber-500/5 border-amber-500/40 text-white'
                    : 'bg-[#090A0D] border-[#232833] text-neutral-400 hover:border-neutral-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTrackers.includes(trackerKey)}
                  onChange={() => toggleTracker(trackerKey)}
                  className="mt-1 w-4 h-4 rounded"
                />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{tracker.name}</span>
                    <span className="text-[10px] text-amber-400 font-bold">-{tracker.deduction} pts</span>
                  </div>
                  <p className="text-xs text-neutral-400">{tracker.description}</p>
                  <span className="text-[10px] text-neutral-500 font-medium">Owner: {tracker.owner}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
