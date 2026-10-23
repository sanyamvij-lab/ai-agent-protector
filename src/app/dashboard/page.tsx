import React from 'react';
import { CyberDashboard } from '@/components/dashboard/CyberDashboard';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export const metadata = {
  title: 'Cyber Telemetry Dashboard | AI Protector',
  description: 'Real-time cybersecurity threat telemetry, analytics overview, and monitored attack vectors.',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#07080B] text-white p-4 sm:p-6 md:p-8 flex flex-col gap-6">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-neutral-300 hover:text-white hover:border-purple-500/50 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400" />
          <span>Back to Main Protection Suite</span>
        </Link>
        <div className="inline-flex items-center gap-2 text-xs font-mono text-purple-300">
          <Shield className="w-4 h-4 text-purple-400" />
          <span>AI Protector • Zero-Trust SOC</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full">
        <CyberDashboard />
      </div>
    </div>
  );
}
