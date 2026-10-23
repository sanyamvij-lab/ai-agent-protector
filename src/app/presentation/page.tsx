'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Shield,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  Download,
  BookOpen,
  LayoutGrid,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Cpu,
  Lock,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Zap,
  Play,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';
import { SLIDES_DATA, SlideData, SlideCard } from '@/lib/presentation/slides-data';

export default function PresentationPage() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notesTab, setNotesTab] = useState<'script' | 'analogy' | 'tech' | 'qa'>('script');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Pipeline simulation state for Slide 5
  const [simStep, setSimStep] = useState(0);
  const [simPlaying, setSimPlaying] = useState(false);

  const slideContainerRef = useRef<HTMLDivElement>(null);
  const currentSlide = SLIDES_DATA[currentSlideIndex];
  const totalSlides = SLIDES_DATA.length;

  // Presentation Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard navigation
  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((idx) => Math.min(idx + 1, totalSlides - 1));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((idx) => Math.max(idx - 1, 0));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          setIsNotesOpen((prev) => !prev);
          break;
        case 'g':
        case 'G':
          e.preventDefault();
          setIsGridOpen((prev) => !prev);
          break;
        case 'Escape':
          setIsGridOpen(false);
          setIsNotesOpen(false);
          break;
        case 'Home':
          setCurrentSlideIndex(0);
          break;
        case 'End':
          setCurrentSlideIndex(totalSlides - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, toggleFullscreen, totalSlides]);

  // Handle pipeline simulation on Slide 5
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (simPlaying && currentSlide.id === 5) {
      timer = setInterval(() => {
        setSimStep((step) => {
          if (step >= 4) {
            setSimPlaying(false);
            return 4;
          }
          return step + 1;
        });
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [simPlaying, currentSlide.id]);

  const copySlideLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/presentation?slide=${currentSlide.id}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080D] text-[#F5F5FA] flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Slide Progress Bar */}
      <div className="h-1 bg-white/10 w-full sticky top-0 z-50">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-300"
          style={{ width: `${((currentSlideIndex + 1) / totalSlides) * 100}%` }}
        />
      </div>

      {/* Presentation Header Bar */}
      <header className="h-14 border-b border-white/[0.08] bg-[#0B0D15]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-40">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs font-semibold text-neutral-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Exit to Platform</span>
          </Link>

          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-bold">
              {String(currentSlideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
            </span>
            <span className="text-neutral-500 hidden md:inline">•</span>
            <span className="text-neutral-300 font-medium truncate max-w-[200px] sm:max-w-[340px]">
              {currentSlide.title}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Timer Display */}
          <div
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-neutral-300 cursor-pointer hover:border-purple-500/40"
            title="Click to pause/resume presentation timer"
          >
            <Clock className={`w-3.5 h-3.5 ${isTimerRunning ? 'text-emerald-400 animate-pulse' : 'text-neutral-500'}`} />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          {/* Grid Overview Toggle */}
          <button
            onClick={() => setIsGridOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/40 text-neutral-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
            title="Grid Overview of all 12 slides (Press G)"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Slide Grid</span>
          </button>

          {/* Speaker Notes Toggle */}
          <button
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 ${
              isNotesOpen
                ? 'bg-purple-500/20 border-purple-500 text-purple-200'
                : 'bg-white/5 border-white/10 hover:border-purple-500/40 text-neutral-300 hover:text-white'
            }`}
            title="Toggle Speaker Notes & Pitch Script (Press S)"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Pitch Script & Notes</span>
          </button>

          {/* Copy Slide Link */}
          <button
            onClick={copySlideLink}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 text-neutral-300 hover:text-white text-xs transition"
            title="Copy direct link to this slide"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 text-neutral-300 hover:text-white text-xs transition"
            title="Toggle Fullscreen (Press F)"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Download Master PPTX */}
          <a
            href="/AI_Protector_Executive_Tech_Deck.pptx"
            download="AI_Protector_Executive_Tech_Deck.pptx"
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-purple-900/30"
            title="Download full 12-slide PowerPoint presentation file (.pptx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download .pptx</span>
          </a>
        </div>
      </header>

      {/* Main Presentation Stage */}
      <main
        ref={slideContainerRef}
        className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 max-w-7xl mx-auto w-full relative"
      >
        {/* Slide Canvas Card */}
        <div className="w-full bg-[#10121E] border border-white/[0.08] rounded-2xl shadow-2xl shadow-purple-950/20 p-6 sm:p-8 md:p-10 flex flex-col justify-between min-h-[560px] sm:min-h-[640px] relative overflow-hidden transition-all duration-300">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Slide Header */}
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#A78BFA] bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
                {currentSlide.category}
              </span>
              <span className="text-xs font-mono text-neutral-500">
                SLIDE {currentSlide.id} OF {totalSlides}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#F5F5FA] tracking-tight">
              {currentSlide.title}
            </h1>

            <p className="text-sm sm:text-base text-[#A78BFA] font-medium max-w-4xl">
              {currentSlide.subtitle}
            </p>

            <p className="text-xs sm:text-sm text-neutral-400 max-w-4xl leading-relaxed">
              {currentSlide.summary}
            </p>
          </div>

          {/* Optional Top Metrics Section (Slide 10, etc.) */}
          {currentSlide.metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4 relative z-10">
              {currentSlide.metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#15182A] border border-purple-500/30 text-center space-y-1 hover:border-purple-500/60 transition"
                >
                  <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono">{m.value}</div>
                  <div className="text-xs font-bold text-white">{m.label}</div>
                  <div className="text-[10px] text-neutral-400">{m.sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* Custom Interactive Simulation for Slide 5 (Pipeline) */}
          {currentSlide.id === 5 && (
            <div className="my-4 p-4 rounded-xl bg-[#15182A] border border-indigo-500/30 space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-300">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Interactive Threat Pipeline Simulator</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSimStep(0);
                      setSimPlaying(true);
                    }}
                    className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 transition"
                  >
                    <Play className="w-3 h-3" />
                    <span>Run Live Test</span>
                  </button>
                  <button
                    onClick={() => {
                      setSimStep(0);
                      setSimPlaying(false);
                    }}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition"
                    title="Reset simulation"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Simulation Visualizer */}
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                {['1. Raw Input', '2. PII Scrubbed', '3. SSRF Shield', '4. Multi-AV Check', '5. Verdict'].map(
                  (label, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border transition-all ${
                        simStep >= idx
                          ? 'bg-purple-950/60 border-purple-500 text-purple-200 font-bold scale-102'
                          : 'bg-white/5 border-white/10 text-neutral-500'
                      }`}
                    >
                      {label}
                      {simStep >= idx && <CheckCircle2 className="w-3 h-3 text-emerald-400 mx-auto mt-1" />}
                    </div>
                  )
                )}
              </div>

              {/* Live Data Inspector */}
              <div className="p-3 rounded-lg bg-[#07080D] font-mono text-[11px] text-neutral-300 space-y-1">
                <div className="text-neutral-500 text-[10px] uppercase font-bold">Pipeline State Inspector:</div>
                {simStep === 0 && (
                  <div className="text-amber-300">
                    Input: &quot;Power cut alert! Pay bill at http://0x7f000001/pay with Aadhaar 9876 5432 1098&quot;
                  </div>
                )}
                {simStep === 1 && (
                  <div className="text-cyan-300">
                    Scrubbed: &quot;Power cut alert! Pay bill at http://0x7f000001/pay with Aadhaar [REDACTED_AADHAAR]&quot;
                  </div>
                )}
                {simStep === 2 && (
                  <div className="text-rose-400">
                    SSRF Guard: Host 0x7f000001 resolved to 127.0.0.1 (Loopback). BLOCKED before external fetch.
                  </div>
                )}
                {simStep === 3 && (
                  <div className="text-purple-300">
                    Multi-AV & Heuristic: Urgency Score 92/100. Fake utility bill extortion pattern verified.
                  </div>
                )}
                {simStep === 4 && (
                  <div className="text-emerald-400 font-bold">
                    Verdict: status: &quot;known_malicious&quot;, category: &quot;scam&quot;, action: &quot;Do NOT click. Call 1930 if money was sent.&quot;
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cards Grid */}
          <div
            className={`grid gap-3 sm:gap-4 my-4 relative z-10 ${
              currentSlide.cards.length === 3
                ? 'grid-cols-1 md:grid-cols-3'
                : currentSlide.cards.length === 5
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-5'
                : currentSlide.cards.length === 6
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2'
            }`}
          >
            {currentSlide.cards.map((card, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-xl bg-[#15182A] border border-white/[0.08] hover:border-purple-500/50 transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">
                      {card.badge || `CARD ${idx + 1}`}
                    </span>
                    <span className="text-lg">{card.icon || '🛡️'}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-purple-200 transition">
                    {card.title}
                  </h3>

                  {card.subtitle && (
                    <div className="text-[11px] font-mono text-purple-400 font-medium">
                      {card.subtitle}
                    </div>
                  )}

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                {card.techDetails && card.techDetails.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1">
                    {card.techDetails.map((td, tIdx) => (
                      <div key={tIdx} className="text-[10px] text-emerald-400 flex items-center gap-1.5 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>{td}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Slide Footer */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-neutral-500 relative z-10">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] text-neutral-400">
                ZERO-TRUST MONOLITH • SUB-300MS EXECUTION
              </span>
            </div>

            <div className="flex items-center space-x-3 text-[11px] text-neutral-400">
              <span className="hidden sm:inline">Use Arrow Keys (← / →) or Spacebar</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-neutral-300">
                Slide {currentSlideIndex + 1} of {totalSlides}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Floating Navigation Bar */}
        <div className="mt-4 flex items-center justify-center space-x-3 z-30">
          <button
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
              currentSlideIndex === 0
                ? 'opacity-40 cursor-not-allowed border-white/10 text-neutral-500'
                : 'bg-white/5 border-white/15 hover:border-purple-500/50 hover:bg-white/10 text-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4 text-purple-400" />
            <span>Previous</span>
          </button>

          {/* Slide Dots */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            {SLIDES_DATA.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlideIndex === idx
                    ? 'w-6 bg-purple-400'
                    : 'bg-white/20 hover:bg-white/40'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlideIndex === totalSlides - 1}
            className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
              currentSlideIndex === totalSlides - 1
                ? 'opacity-40 cursor-not-allowed border-white/10 text-neutral-500'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-purple-400/30 text-white shadow-lg shadow-purple-900/30'
            }`}
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Slide Grid Modal (Triggered by 'G' or button) */}
      {isGridOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="max-w-6xl mx-auto w-full flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold text-white">Slide Navigator</h2>
              <p className="text-xs text-neutral-400">Click any slide card to jump directly to it</p>
            </div>
            <button
              onClick={() => setIsGridOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition"
            >
              Close (Esc)
            </button>
          </div>

          <div className="max-w-6xl mx-auto w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-6 overflow-y-auto flex-1">
            {SLIDES_DATA.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => {
                  setCurrentSlideIndex(idx);
                  setIsGridOpen(false);
                }}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  currentSlideIndex === idx
                    ? 'bg-purple-950/80 border-purple-500 ring-2 ring-purple-500/50 scale-102'
                    : 'bg-[#10121E] border-white/10 hover:border-white/30 hover:bg-[#15182A]'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-purple-400 font-bold">SLIDE {s.id}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-neutral-400">
                      {s.category.split(' ')[0]}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-2">{s.title}</h4>
                  <p className="text-[10px] text-neutral-400 line-clamp-2">{s.subtitle}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[9px] text-neutral-500 flex items-center justify-between">
                  <span>{s.cards.length} cards</span>
                  {currentSlideIndex === idx && <span className="text-purple-300 font-bold">Active</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Speaker Notes & Pitch Script Drawer (Triggered by 'S' or button) */}
      {isNotesOpen && (
        <aside className="fixed bottom-0 right-0 sm:right-6 sm:bottom-6 w-full sm:w-[480px] max-h-[85vh] z-50 bg-[#0B0D15] border border-purple-500/30 rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-purple-950/50 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
          {/* Notes Header */}
          <div className="p-4 border-b border-white/10 bg-[#10121E] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <div>
                <h3 className="text-xs font-extrabold text-white">Speaker Notes & Explanations</h3>
                <span className="text-[10px] text-purple-300 font-mono">Slide {currentSlide.id}: {currentSlide.category}</span>
              </div>
            </div>
            <button
              onClick={() => setIsNotesOpen(false)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 text-xs"
            >
              ✕
            </button>
          </div>

          {/* Notes Tabs */}
          <div className="grid grid-cols-4 p-1.5 bg-[#07080D] border-b border-white/10 text-[11px] font-bold">
            <button
              onClick={() => setNotesTab('script')}
              className={`py-1.5 rounded transition ${
                notesTab === 'script' ? 'bg-purple-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              🗣️ Script
            </button>
            <button
              onClick={() => setNotesTab('analogy')}
              className={`py-1.5 rounded transition ${
                notesTab === 'analogy' ? 'bg-purple-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              💡 Analogy
            </button>
            <button
              onClick={() => setNotesTab('tech')}
              className={`py-1.5 rounded transition ${
                notesTab === 'tech' ? 'bg-purple-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              🔬 Deep Tech
            </button>
            <button
              onClick={() => setNotesTab('qa')}
              className={`py-1.5 rounded transition ${
                notesTab === 'qa' ? 'bg-purple-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              🎯 Q&A
            </button>
          </div>

          {/* Notes Content */}
          <div className="p-4 overflow-y-auto space-y-4 text-xs leading-relaxed flex-1">
            {/* Bottom Line */}
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-200">
              <span className="font-bold text-[10px] uppercase text-purple-400 block mb-1">
                Executive Bottom Line (1 Sentence):
              </span>
              {currentSlide.speakerNotes.bottomLine}
            </div>

            {notesTab === 'script' && (
              <div className="space-y-2">
                <span className="font-bold text-[10px] uppercase text-neutral-400 block">
                  Word-for-Word Speaking Script (30-45s):
                </span>
                <p className="text-neutral-200 font-sans italic bg-white/5 p-3 rounded-lg border border-white/5">
                  &ldquo;{currentSlide.speakerNotes.script}&rdquo;
                </p>
              </div>
            )}

            {notesTab === 'analogy' && (
              <div className="space-y-2">
                <span className="font-bold text-[10px] uppercase text-amber-400 block">
                  Simple Analogy (Easy to Explain to Non-Tech):
                </span>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200">
                  {currentSlide.speakerNotes.analogy}
                </div>
              </div>
            )}

            {notesTab === 'tech' && (
              <div className="space-y-2">
                <span className="font-bold text-[10px] uppercase text-emerald-400 block">
                  Technical Specifications & Invariants:
                </span>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 font-mono text-[11px]">
                  {currentSlide.speakerNotes.deepTech}
                </div>
              </div>
            )}

            {notesTab === 'qa' && (
              <div className="space-y-3">
                <span className="font-bold text-[10px] uppercase text-indigo-400 block">
                  Anticipated Evaluator / Judge Question:
                </span>
                <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                  <div className="font-bold text-white">Q: {currentSlide.speakerNotes.evaluatorQA.q}</div>
                  <div className="text-neutral-300 pt-2 border-t border-indigo-500/20">
                    <strong className="text-emerald-400">Winning Answer: </strong>
                    {currentSlide.speakerNotes.evaluatorQA.a}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Footer for Notes */}
          <div className="p-3 border-t border-white/10 bg-[#10121E] text-[10px] text-neutral-400 flex items-center justify-between">
            <span>Press <kbd className="px-1 py-0.5 bg-white/10 rounded">S</kbd> to toggle notes</span>
            <span className="text-purple-400 font-bold">Slide {currentSlide.id} of {totalSlides}</span>
          </div>
        </aside>
      )}
    </div>
  );
}
