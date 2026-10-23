'use client';

import React, { useState } from 'react';
import { SupportedLanguage, TRANSLATIONS } from '@/lib/i18n/translations';
import { SCAM_PLAYBOOKS, SIMULATOR_SCENARIO, ScamPlaybook } from '@/lib/learn/scam-playbooks';

interface ScamPlaybooksTabProps {
  lang: SupportedLanguage;
  elderMode: boolean;
}

export default function ScamPlaybooksTab({ lang, elderMode }: ScamPlaybooksTabProps) {
  const t = TRANSLATIONS[lang];
  const [selectedPlaybook, setSelectedPlaybook] = useState<ScamPlaybook>(SCAM_PLAYBOOKS[0]);
  const [simStepIdx, setSimStepIdx] = useState(0);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);

  const scenario = SIMULATOR_SCENARIO[simStepIdx];

  const handleChoice = (idx: number) => {
    setSelectedChoiceIdx(idx);
  };

  const resetSimulator = () => {
    setSelectedChoiceIdx(null);
  };

  return (
    <div className={`space-y-8 ${elderMode ? 'text-lg' : 'text-sm'}`}>
      {/* 1. Interactive Scam Call Simulator */}
      <div className="bg-[#14171D] border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            Interactive Defensive Sandbox
          </span>
          <span className="text-xs text-neutral-400">Safe Simulation • No Real Call</span>
        </div>

        <h2 className={`font-black text-white flex items-center gap-2 ${elderMode ? 'text-2xl' : 'text-lg'}`}>
          📞 Practise a Fake Scam Call Simulator
        </h2>
        <p className="text-neutral-300 text-xs sm:text-sm">
          Scammers use extreme psychological panic (digital arrest, narcotics threats, power disconnection) to force compliance. Test your real-time response safely here:
        </p>

        {/* Incoming Call Box */}
        <div className="bg-[#090A0D] border border-[#232833] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-lg animate-pulse">
              📲
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 block">Incoming Coercive Call</span>
              <span className="font-bold text-white text-sm">{scenario.callerVoice}</span>
            </div>
          </div>

          <div className="p-4 bg-[#14171D] rounded-xl border border-red-500/30 text-neutral-200 text-xs sm:text-sm italic leading-relaxed">
            "{scenario.callerStatement}"
          </div>

          {/* Dialogue Choices */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-neutral-400 block mb-1">How do you respond?</span>
            {scenario.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleChoice(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition text-xs sm:text-sm leading-relaxed ${
                  selectedChoiceIdx === idx
                    ? choice.isSafe
                      ? 'bg-emerald-500/15 border-emerald-500 text-white font-semibold'
                      : 'bg-red-500/15 border-red-500 text-white font-semibold'
                    : 'bg-[#090A0D] border-[#232833] text-neutral-300 hover:border-neutral-500'
                }`}
              >
                {choice.text}
              </button>
            ))}
          </div>

          {/* Feedback Display */}
          {selectedChoiceIdx !== null && (
            <div
              className={`p-4 rounded-xl border space-y-2 animate-fadeIn text-xs sm:text-sm ${
                scenario.choices[selectedChoiceIdx].isSafe
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              <p className="font-bold">{scenario.choices[selectedChoiceIdx].feedback}</p>
              <button
                onClick={resetSimulator}
                className="text-xs font-bold px-3 py-1.5 rounded bg-white text-black hover:bg-neutral-200 transition mt-2 cursor-pointer"
              >
                Try Again 🔄
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. India Scam Playbooks */}
      <div className="bg-[#14171D] border border-[#232833] rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className={`font-bold text-white mb-1 ${elderMode ? 'text-2xl' : 'text-lg'}`}>
            🛡️ Top 5 Indian Cybercrime Playbooks & Defenses
          </h2>
          <p className="text-neutral-400 text-xs">
            Understand how organized cybercrime syndicates operate and memorize the single Golden Rule for each attack.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {SCAM_PLAYBOOKS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlaybook(p)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedPlaybook.id === p.id
                  ? 'bg-white text-black'
                  : 'bg-[#090A0D] border border-[#232833] text-neutral-400 hover:text-white'
              }`}
            >
              {lang === 'hi' ? p.hindiTitle : p.title}
            </button>
          ))}
        </div>

        {/* Playbook Detail Card */}
        <div className="bg-[#090A0D] border border-[#232833] rounded-2xl p-6 space-y-5 animate-fadeIn">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                {selectedPlaybook.badge}
              </span>
              <h3 className="text-lg font-black text-white mt-2">
                {lang === 'hi' ? selectedPlaybook.hindiTitle : selectedPlaybook.title}
              </h3>
              <span className="text-xs text-neutral-400">Modality: {selectedPlaybook.modality}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">How The Attack Operates</h4>
            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed bg-[#14171D] p-3.5 rounded-xl border border-[#232833]">
              {selectedPlaybook.howItWorks}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Recognizable Red Flags</h4>
            <div className="space-y-2">
              {selectedPlaybook.redFlags.map((flag, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                  <span className="text-red-400 font-bold">•</span>
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-xl space-y-1">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
              ⭐ The Non-Negotiable Golden Rule
            </span>
            <p className="text-xs sm:text-sm font-bold text-white">
              {selectedPlaybook.goldenRule}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
