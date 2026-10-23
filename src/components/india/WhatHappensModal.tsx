'use client';

import React from 'react';
import { SupportedLanguage } from '@/lib/i18n/translations';

interface WhatHappensModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: SupportedLanguage;
}

export default function WhatHappensModal({ isOpen, onClose, lang }: WhatHappensModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#14171D] border border-[#232833] rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#232833] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
              🛡️
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-white">
                {lang === 'hi' ? 'आपके इनपुट का क्या होता है?' : 'What Happens to Your Input?'}
              </h3>
              <p className="text-xs text-neutral-400">
                {lang === 'hi' ? 'गोपनीयता और डेटा सुरक्षा वादे' : 'Zero-knowledge, privacy-first data handling guarantee'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-2xl font-bold p-1 rounded-lg transition"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 text-sm text-neutral-300">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
            <span className="text-lg">🔒</span>
            <div>
              <strong className="text-white block font-semibold">
                {lang === 'hi' ? '1. कोई खाता या साइन-अप नहीं' : '1. Zero Accounts & Anonymous Access'}
              </strong>
              <p className="text-xs text-neutral-400 mt-0.5">
                {lang === 'hi'
                  ? 'हम कभी भी आपका ईमेल, नाम या मोबाइल नंबर खाता बनाने के लिए नहीं मांगते। सभी टूल्स खुले और निजी हैं।'
                  : 'You do not need to log in or create an account. No identifiers or user profiles are ever tracked.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
            <span className="text-lg">⚡</span>
            <div>
              <strong className="text-white block font-semibold">
                {lang === 'hi' ? '2. केवल रैम में प्रोसेस (शून्य डेटाबेस स्टोरेज)' : '2. Transient In-Memory Analysis Only'}
              </strong>
              <p className="text-xs text-neutral-400 mt-0.5">
                {lang === 'hi'
                  ? 'आपके द्वारा पेस्ट किया गया लिंक, मैसेज या नंबर सर्वर पर कभी सेव नहीं किया जाता। विश्लेषण के तुरंत बाद इसे रैम से हटा दिया जाता है।'
                  : 'Your links, messages, and phone numbers are evaluated transiently in memory. Nothing is written to permanent database storage or query logs.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
            <span className="text-lg">🔐</span>
            <div>
              <strong className="text-white block font-semibold">
                {lang === 'hi' ? '3. पासवर्ड जांच में K-Anonymity (गणितीय गोपनीयता)' : '3. K-Anonymity for Password Checks'}
              </strong>
              <p className="text-xs text-neutral-400 mt-0.5">
                {lang === 'hi'
                  ? 'आपका पासवर्ड आपके डिवाइस से कभी बाहर नहीं जाता। आपका ब्राउज़र केवल 5-अक्षर का हैश प्रीफिक्स भेजता है जिससे आपके पासवर्ड का अनुमान लगाना गणितीय रूप से असंभव है।'
                  : 'Your actual password is never transmitted. Your browser calculates the SHA-1 hash locally and sends only the first 5 characters. The full hash remains private.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
            <span className="text-lg">📱</span>
            <div>
              <strong className="text-white block font-semibold">
                {lang === 'hi' ? '4. लोकल-ओनली हिस्ट्री और 1-क्लिक न्यूक्लियर पर्ज' : '4. 100% Local Browser Storage'}
              </strong>
              <p className="text-xs text-neutral-400 mt-0.5">
                {lang === 'hi'
                  ? 'आपकी पिछली जांचें केवल आपके फोन/कंप्यूटर के ब्राउज़र में रहती हैं। आप "डेटा हमेशा के लिए मिटाएं" बटन दबाकर इसे तुरंत खत्म कर सकते हैं।'
                  : 'Your scan history lives strictly in your browser’s localStorage. You can export it as JSON or wipe it entirely in one click.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-3">
            <span className="text-lg">⚖️</span>
            <div>
              <strong className="text-emerald-200 block font-semibold">
                {lang === 'hi' ? '5. डीपीडीपी अधिनियम 2023 के तहत प्रतिबद्धता' : '5. DPDP Act 2023 Lawful Compliance'}
              </strong>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                {lang === 'hi'
                  ? 'डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम 2023 की धारा 6 (उद्देश्य सीमा) और धारा 12 (डेटा मिटाने का अधिकार) का कड़ाई से पालन किया जाता है।'
                  : 'Built on privacy-by-design under Section 6 (purpose limitation) and Section 12 (erasure rights) of India’s Digital Personal Data Protection Act 2023.'}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-white text-black font-bold px-6 py-2.5 rounded-xl hover:bg-neutral-200 transition text-sm"
          >
            {lang === 'hi' ? 'समझ गया / बंद करें' : 'Understood, Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
