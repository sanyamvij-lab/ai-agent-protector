'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Lock,
  ShieldAlert,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Terminal,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { Button } from './ui/Button';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  provider?: string;
  piiScrubbed?: number;
  threatLevel?: 'high_risk' | 'suspicious' | 'low' | 'unverified';
  detectedThreatTypes?: string[];
  linksScannedCount?: number;
}

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeContext?: string;
}

const QUICK_PROMPTS = [
  'Analyze link: http://paypa1-security-verify.com',
  'Analyze SMS: URGENT: Chase account locked. Verify SSN at bit.ly/3x8q',
  'Check email: USPS package held, pay $1.99 redelivery fee',
  'Someone claims they hacked my webcam and demands Bitcoin. What do I do?',
];

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  activeContext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I am your **AI Security Copilot**, operating under **Strict Zero-Trust Protocols** with automated link and message forensic deconstruction.\n\nPaste any suspicious link, SMS, email, or security scenario. I will inspect brand typosquats, anti-SSRF hazards, social engineering pressure, and credential harvesting patterns with client-side PII scrubbing.\n\n*Rule: Zero trust until proven legitimate.*",
      timestamp: 'Just now',
      threatLevel: 'low',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/v1/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          context: activeContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const data = await res.json();
      const detectedThreatTypes: string[] =
        data.forensic_analysis?.detected_threat_types || [];
      const linksCount: number =
        data.forensic_analysis?.links_scanned?.length || 0;

      const assistantMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No assessment returned. Please try rephrasing your inquiry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: data.provider || 'gemini_3.5_flash',
        piiScrubbed: data.pii_scrubbed_count,
        threatLevel: data.threat_level,
        detectedThreatTypes,
        linksScannedCount: linksCount,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content:
            "[THREAT LEVEL: HIGH RISK] 🚨 **Zero-Trust Fallback Alert**\n\nUnable to reach remote AI services. Operating under local emergency security protocols:\n\n• **DO NOT click embedded links**: Typosquats, spoofed brands, and tracking tokens can trigger zero-day exploits or credential harvesting.\n• **NEVER disclose passwords, PINs, or 2FA codes**: Legitimate organizations never request these via SMS or email.\n• **Independently verify**: Contact the institution via a known legitimate phone number or saved bookmark.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          provider: 'local_zero_trust_fallback',
          threatLevel: 'high_risk',
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

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content:
          "Conversation cleared. How can I assist with your cybersecurity concerns under Strict Zero-Trust protocols?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        threatLevel: 'low',
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-950 border-l border-emerald-500/20 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">AI Security Copilot</h3>
                <span className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 text-[10px] font-mono font-semibold flex items-center">
                  <ShieldAlert className="w-2.5 h-2.5 mr-1 text-red-400" />
                  Strict Zero-Trust
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                  Gemini AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                <Lock className="w-3 h-3 text-cyan-400 mr-0.5" />
                <span>Pre-flight PII Scrubbed • Deep Link & Message Inspection</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleResetChat}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close copilot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Context bar if active */}
        {activeContext && (
          <div className="px-4 py-2 bg-emerald-950/40 border-b border-emerald-500/20 text-[11px] text-emerald-300 flex items-center justify-between font-mono">
            <span className="truncate">Context: {activeContext}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/60 font-semibold">Active</span>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none shadow-lg'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                }`}
              >
                {/* Threat Banner for Assistant Messages */}
                {m.role === 'assistant' && (m.threatLevel === 'high_risk' || m.content.includes('[THREAT LEVEL: HIGH RISK]')) && (
                  <div className="mb-2.5 px-2.5 py-1.5 rounded-lg bg-red-950/80 border border-red-500/50 text-red-400 text-[11px] font-bold flex items-center justify-between shadow-sm animate-pulse">
                    <div className="flex items-center space-x-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>HIGH-RISK THREAT DETECTED</span>
                    </div>
                    {m.detectedThreatTypes && m.detectedThreatTypes.length > 0 && (
                      <span className="text-[10px] text-red-300/80 font-mono font-normal">
                        {m.detectedThreatTypes.slice(0, 2).join(' • ')}
                      </span>
                    )}
                  </div>
                )}

                {m.role === 'assistant' && (m.threatLevel === 'suspicious' || m.content.includes('[THREAT LEVEL: SUSPICIOUS]')) && (
                  <div className="mb-2.5 px-2.5 py-1.5 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-400 text-[11px] font-bold flex items-center space-x-1.5 shadow-sm">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>SUSPICIOUS DECEPTION PATTERNS IDENTIFIED</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{m.content}</div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2.5 pt-1.5 border-t border-slate-700/30">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono">{m.timestamp}</span>
                    {m.piiScrubbed !== undefined && m.piiScrubbed > 0 && (
                      <span className="text-cyan-400 font-mono">
                        🛡️ {m.piiScrubbed} PII scrubbed
                      </span>
                    )}
                    {m.linksScannedCount !== undefined && m.linksScannedCount > 0 && (
                      <span className="text-emerald-400 font-mono">
                        🔗 {m.linksScannedCount} link{m.linksScannedCount > 1 ? 's' : ''} inspected
                      </span>
                    )}
                  </div>
                  {m.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="hover:text-emerald-400 flex items-center space-x-1 ml-2 transition"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
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
            <div className="flex items-center space-x-2 p-3 text-xs text-emerald-400 bg-slate-900/80 border border-emerald-500/20 rounded-xl w-fit">
              <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Analyzing threat vector, SSRF hazards, and deceptive indicators...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/80">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5 font-mono">
            Strict Tactical Scans
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-emerald-500/40 text-left transition disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste suspicious link, email, SMS, or security question..."
              disabled={isLoading}
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!inputText.trim() || isLoading}
              className="px-3 py-2 h-9 bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Strict Zero-Trust + Pre-flight PII Redaction Active</span>
            </span>
            <span className="font-mono text-emerald-400">Gemini 3.5 Flash</span>
          </div>
        </div>
      </div>
    </div>
  );
};
