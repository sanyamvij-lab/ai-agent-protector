"use client";

import React, { useState } from "react";
import RuixenMoonChat from "@/components/ui/ruixen-moon-chat";
import BeamWordmarkFooter from "@/components/ui/beam-wordmark-footer";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Testimonials } from "@/components/ui/testimonials-columns-1";
import { ArrowLeft, Sparkles, Shield, Lock, Zap, CheckCircle2 } from "lucide-react";

export default function DemoPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="min-h-screen w-full bg-[#0D0F12] text-white flex flex-col justify-between selection:bg-white/20 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-white/10 bg-[#0D0F12]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between text-xs font-mono">
          <a
            href="/"
            className="flex items-center space-x-2 text-neutral-400 hover:text-white transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
            <span className="hidden sm:inline">Return to Operations Grid</span>
            <span className="sm:hidden">Back</span>
          </a>

          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white flex items-center space-x-1.5 text-[11px]">
              <Sparkles className="w-3 h-3 text-white" />
              <span>Ruixen Moon Chat • 21st.dev UI</span>
            </span>

            <ShinyButton
              onClick={() => setModalOpen(true)}
              className="py-1.5 px-3 text-xs"
              variant="white"
            >
              Get Unlimited Access
            </ShinyButton>
          </div>
        </div>
      </header>

      {/* Hero Intro Section with Shiny Buttons */}
      <section className="py-12 px-4 max-w-5xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-white text-xs font-mono mb-5 shadow-lg shadow-black/50">
          <Shield className="w-3.5 h-3.5 text-white" />
          <span>Zero-Trust Cybersecurity & AI Scam Defense</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Next-Gen AI Security with{" "}
          <span className="bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
            Ruixen Moon Interface
          </span>
        </h1>

        <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mt-4 leading-relaxed font-sans">
          Audit suspicious banking links, detect high-pressure smishing, and triage digital extortion payloads before they compromise your organization.
        </p>

        {/* Shiny Button Action Showcase */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <ShinyButton
            onClick={() => setModalOpen(true)}
            variant="white"
            className="text-sm px-6 py-3"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Get unlimited access</span>
          </ShinyButton>

          <a href="/">
            <ShinyButton
              variant="emerald"
              className="text-sm px-6 py-3"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Launch Operations Grid</span>
            </ShinyButton>
          </a>
        </div>
      </section>

      {/* Chat Component Section */}
      <section className="flex justify-center items-start w-full px-4 pb-12">
        <RuixenMoonChat />
      </section>

      {/* Testimonials with Indian Faces Moving Horizontally */}
      <Testimonials />

      {/* Beam Wordmark Footer Animation */}
      <div className="w-full bg-[#0D0F12]">
        <BeamWordmarkFooter />
      </div>

      {/* Bottom Legal bar */}
      <footer className="text-center text-neutral-400 py-3 bg-[#0D0F12] border-t border-white/10 text-xs font-mono">
        © 2026 AI Protector // Ruixen Moon Chat & Beam Wordmark Showcase
      </footer>

      {/* Access Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-[#0D0F12] p-6 shadow-2xl text-left space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Unlimited Access Active</h3>
                <p className="text-xs text-neutral-400 font-mono">AI Protector Enterprise Tier</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-neutral-300 font-sans">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero-Trust Client-Side PII Masking Enabled</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Unlimited Link & Message Threat Scans</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Court-Admissible Incident Dossier Export</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Full MITRE ATT&CK Enterprise Matrix Mapping</span>
              </div>
            </div>

            <div className="pt-2">
              <ShinyButton
                onClick={() => setModalOpen(false)}
                className="w-full text-center justify-center"
                variant="white"
              >
                Close & Continue Exploring
              </ShinyButton>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
