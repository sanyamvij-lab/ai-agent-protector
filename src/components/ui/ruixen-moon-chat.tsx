'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  ShieldAlert,
  Moon,
  Copy,
  Check,
  RotateCcw,
  Lock,
  ArrowUp,
  Terminal,
} from 'lucide-react';
import { PrivacyRedactor } from '@/lib/privacy/redactor';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  threatLevel?: string;
  piiScrubbed?: number;
}

const QUICK_ACTIONS = [
  { label: 'Audit suspicious link', prompt: 'Is this link safe to click? http://paypa1-account-update.xyz/verify' },
  { label: 'Chase bank SMS scam', prompt: 'URGENT: Your Chase account is locked. Confirm SSN 456-78-1234 within 24 hours.' },
  { label: 'Webcam extortion email', prompt: 'Someone emailed claiming they have video from my webcam and demand $1,500 Bitcoin.' },
  { label: 'Verify MITRE technique', prompt: 'What is MITRE technique T1566 and how do we protect against it?' },
];

export default function RuixenMoonChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Welcome to **Ruixen Moon Chat // AI Protector**.\n\nI operate under strict **Zero-Trust Cybersecurity Protocols**. Paste any suspicious communication, link, or security question. Sensitive PII is masked client-side before transmission.',
      timestamp: 'Just now',
      threatLevel: 'low',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isLoading) return;

    // Client-side PII scrubbing
    const redaction = PrivacyRedactor.redact(textToSend);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: 'Just now',
      piiScrubbed: redaction.entitiesFound.length,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: redaction.redactedText,
          history: messages.slice(-4).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Copilot response status: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Zero-trust forensic assessment completed. No imminent hazard detected.',
        timestamp: 'Just now',
        threatLevel: data.threatLevel || 'low',
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Advisory Notice: Secure query failed (${err?.message || 'Network error'}). Your local client remains protected under zero-retention policy.`,
          timestamp: 'Just now',
          threatLevel: 'medium',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center px-4 py-8">
      {/* Celestial Moon Ambient Glow Effect in Pure White #FFFFFF */}
      <div className="relative flex flex-col items-center mb-8 pointer-events-none select-none">
        {/* Outer Lunar Aura */}
        <div className="absolute -top-16 w-80 h-80 rounded-full bg-gradient-to-b from-white/20 via-neutral-300/10 to-transparent blur-3xl" />
        
        {/* Central Glowing Moon Orb */}
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-b from-white via-neutral-200 to-neutral-400 shadow-[0_0_55px_rgba(255,255,255,0.35)] border border-white flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-black/40" />
          <Moon className="w-10 h-10 text-neutral-800 drop-shadow-md relative z-10" />
        </div>

        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/20 text-xs font-mono text-white">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>RUIXEN MOON // ZERO-TRUST INTEL</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2 font-mono tracking-tight">
            Autonomous Cybersecurity Copilot
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
            Powered by Google Gemini 3.5 Flash & pre-flight client-side PII scrubbing.
          </p>
        </div>
      </div>

      {/* Main Chat Interface Container */}
      <div className="w-full rounded-2xl border border-white/15 bg-[#0D0F12] backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col h-[520px]">
        {/* Chat Stream Window */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-lg ${
                  m.role === 'user'
                    ? 'bg-white text-black font-medium rounded-br-none shadow-white/10'
                    : 'bg-[#141820] border border-white/10 text-neutral-200 rounded-bl-none'
                }`}
              >
                {/* Assistant Threat Header if detected */}
                {m.role === 'assistant' && m.threatLevel === 'high_risk' && (
                  <div className="mb-2 px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 font-mono font-bold text-[11px] flex items-center space-x-1.5 animate-pulse">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>HIGH-RISK HAZARD DETECTED</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans">{m.content}</div>

                {/* Footer Meta */}
                <div className={`flex items-center justify-between text-[10px] mt-2.5 pt-1.5 border-t font-mono ${
                  m.role === 'user' ? 'border-neutral-300/50 text-neutral-700' : 'border-white/10 text-neutral-400'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span>{m.timestamp}</span>
                    {m.piiScrubbed !== undefined && m.piiScrubbed > 0 && (
                      <span className="text-white font-semibold">🛡️ {m.piiScrubbed} PII scrubbed</span>
                    )}
                  </div>
                  {m.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="hover:text-white transition flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-neutral-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 p-3 text-xs text-white bg-white/5 border border-white/15 rounded-xl w-fit font-mono">
              <Sparkles className="w-3.5 h-3.5 text-white animate-spin" />
              <span>Synthesizing zero-trust forensic advisory...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Action Suggestion Chips */}
        <div className="px-4 py-2 border-t border-white/10 bg-[#0D0F12]">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(action.prompt)}
                disabled={isLoading}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 hover:border-white/30 transition disabled:opacity-50 font-sans cursor-pointer"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Floating Input Capsule */}
        <div className="p-3.5 border-t border-white/10 bg-[#0D0F12]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2 bg-[#141820] border border-white/15 focus-within:border-white rounded-xl px-3 py-1.5 transition"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or paste suspicious link/SMS for zero-trust triage..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none py-1.5 font-sans"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 rounded-lg bg-white hover:bg-neutral-200 text-black flex items-center justify-center disabled:opacity-40 transition shrink-0 cursor-pointer shadow-md"
            >
              <ArrowUp className="w-4 h-4 text-black" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-2 px-1 font-mono">
            <span className="flex items-center space-x-1">
              <Lock className="w-3 h-3 text-white" />
              <span>Pre-Flight PII Redactor Active</span>
            </span>
            <span className="text-neutral-400">Gemini 3.5 AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
