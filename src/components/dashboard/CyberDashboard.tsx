'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutGrid,
  TrendingUp,
  Users,
  FileText,
  SlidersHorizontal,
  Settings,
  HelpCircle,
  Search,
  Mail,
  Bell,
  MoreHorizontal,
  ChevronDown,
  Shield,
  Zap,
  Globe,
  Radio,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowUpRight,
  RefreshCw,
  X,
  UserCheck,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  Menu,
} from 'lucide-react';

interface CyberDashboardProps {
  onNavigateTab?: (tabId: string) => void;
  sessionStats?: {
    scansCount: number;
    piiScrubbedCount: number;
    threatsFlagged: number;
  };
  onOpenCopilot?: () => void;
}

export const CyberDashboard: React.FC<CyberDashboardProps> = ({
  onNavigateTab,
  sessionStats,
  onOpenCopilot,
}) => {
  // Navigation & View state
  const [activeNav, setActiveNav] = useState<'grid' | 'trends' | 'users' | 'reports' | 'config'>('grid');
  const [activeCard, setActiveCard] = useState<'total' | 'revenue' | 'subscriptions' | 'retention'>('revenue');
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [trendRange, setTrendRange] = useState<'Trends' | 'Monthly' | 'Weekly' | 'Daily'>('Trends');
  const [isTrendOpen, setIsTrendOpen] = useState(false);
  const [radarActive, setRadarActive] = useState(true);
  const [activeMonthIndex, setActiveMonthIndex] = useState(5); // 'Jun' in reference
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [hoveredSource, setHoveredSource] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Series visibility toggles for Main Analytics Overview
  const [showSeriesA, setShowSeriesA] = useState(true);
  const [showSeriesB, setShowSeriesB] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const [projectCategoryFilter, setProjectCategoryFilter] = useState<string>('All');
  const [projectSortField, setProjectSortField] = useState<'name' | 'progress' | 'status'>('progress');
  const [projectSortAsc, setProjectSortAsc] = useState<boolean>(false);

  // Header Dropdowns
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [quickScanModalOpen, setQuickScanModalOpen] = useState(false);
  const [quickScanInput, setQuickScanInput] = useState('');

  // Tooltip tracking
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Data fetching state
  const [metricsData, setMetricsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Notifications List
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'High-Risk Typosquatting Blocked',
      desc: 'paypa1-security-verify.xyz intercepted via DNS sandbox',
      time: '4 mins ago',
      unread: true,
      severity: 'high',
    },
    {
      id: 'notif-2',
      title: 'Aadhaar Redaction Verified',
      desc: 'DPDP 2023 zero-retention scrub applied to 12-digit token',
      time: '18 mins ago',
      unread: true,
      severity: 'info',
    },
    {
      id: 'notif-3',
      title: 'VirusTotal Multi-AV Synchronized',
      desc: '72 antivirus engines updated with latest heuristic signatures',
      time: '1 hour ago',
      unread: true,
      severity: 'success',
    },
  ]);

  // Fetch metrics from /api/v1/dashboard/metrics
  const fetchMetrics = async (period: string) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/v1/dashboard/metrics?period=${period}`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error(`Failed to load metrics (HTTP ${res.status})`);
      }
      const data = await res.json();
      setMetricsData(data);
    } catch (err: any) {
      setLoadError(err.message || 'Error fetching telemetry metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(selectedPeriod);
  }, [selectedPeriod]);

  // Months scale for chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Fallback / default data
  const fallbackPoints = [
    { month: 'Jan', lineA: 50, lineB: 80, threats: 120, blocked: 35 },
    { month: 'Feb', lineA: 180, lineB: 140, threats: 210, blocked: 62 },
    { month: 'Mar', lineA: 260, lineB: 310, threats: 320, blocked: 88 },
    { month: 'Apr', lineA: 210, lineB: 230, threats: 245, blocked: 71 },
    { month: 'May', lineA: 220, lineB: 200, threats: 230, blocked: 65 },
    { month: 'Jun', lineA: 340, lineB: 340, threats: 410, blocked: 118 },
    { month: 'Aug', lineA: 410, lineB: 320, threats: 460, blocked: 142 },
    { month: 'Sep', lineA: 380, lineB: 280, threats: 395, blocked: 104 },
    { month: 'Oct', lineA: 220, lineB: 210, threats: 250, blocked: 78 },
    { month: 'Nov', lineA: 290, lineB: 270, threats: 315, blocked: 94 },
    { month: 'Dec', lineA: 390, lineB: 360, threats: 430, blocked: 130 },
  ];

  const overviewPoints = metricsData?.analytics_overview?.points || fallbackPoints;
  const currentMonth = overviewPoints[activeMonthIndex] || overviewPoints[5];

  // Active Projects List
  const baseProjects = useMemo(() => {
    return (
      metricsData?.active_projects || [
        {
          id: 'proj-1',
          name: 'Auth & SSO Gateway',
          category: 'API Security',
          progress: 75,
          status: 'Operational',
          indicators: ['verified', 'online', 'active'],
          targetTab: 'link',
          lastUpdated: '2 mins ago',
        },
        {
          id: 'proj-2',
          name: 'SMS Smishing Defense',
          category: 'Message Pipeline',
          progress: 60,
          status: 'Investigating',
          indicators: ['alert', 'online', 'active'],
          targetTab: 'message',
          lastUpdated: '14 mins ago',
        },
        {
          id: 'proj-3',
          name: 'Firmware & Hash Vault',
          category: 'File Integrity',
          progress: 90,
          status: 'Protected',
          indicators: ['verified', 'online', 'active'],
          targetTab: 'file',
          lastUpdated: '1 hour ago',
        },
        {
          id: 'proj-4',
          name: 'Neural Copilot Stream',
          category: 'Gemini Threat AI',
          progress: 45,
          status: 'Protected',
          indicators: ['verified', 'verified', 'online'],
          targetTab: 'claim',
          lastUpdated: '3 hours ago',
        },
      ]
    );
  }, [metricsData]);

  // Filtered and Sorted Projects
  const filteredProjects = useMemo(() => {
    let list = [...baseProjects];
    if (projectCategoryFilter !== 'All') {
      list = list.filter((p) => p.category === projectCategoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.status.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let valA = a[projectSortField];
      let valB = b[projectSortField];
      if (typeof valA === 'string') {
        return projectSortAsc
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return projectSortAsc ? valA - valB : valB - valA;
    });
    return list;
  }, [baseProjects, projectCategoryFilter, searchQuery, projectSortField, projectSortAsc]);

  // Search Results for Global Search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const appTools = [
      { id: 'tool-msg', title: 'Check Suspicious Message', type: 'Forensic Engine', target: 'message' },
      { id: 'tool-url', title: 'Inspect Malicious URL (Anti-SSRF)', type: 'Forensic Engine', target: 'link' },
      { id: 'tool-file', title: 'Cryptographic Hash Integrity', type: 'Forensic Engine', target: 'file' },
      { id: 'tool-claim', title: 'Misinformation Claim Verifier', type: 'Forensic Engine', target: 'claim' },
      { id: 'tool-priv', title: 'Privacy Matrix & Nuclear Wipe', type: 'Compliance', target: 'privacy' },
      { id: 'tool-soc', title: 'Zero-Trust SOC Guidance', type: 'Defense Operations', target: 'security' },
    ];
    const matchedTools = appTools.filter(
      (t) => t.title.toLowerCase().includes(q) || t.type.toLowerCase().includes(q)
    );
    const matchedProjects = baseProjects
      .filter((p: any) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .map((p: any) => ({
        id: p.id,
        title: p.name,
        type: `Project: ${p.category}`,
        target: p.targetTab,
      }));
    return [...matchedTools, ...matchedProjects];
  }, [searchQuery, baseProjects]);

  // Team Activity Data
  const teamActivity = metricsData?.team_activity || [
    { label: 'Jn', base: 45, top: 25, total: 70 },
    { label: 'Fe', base: 55, top: 30, total: 85 },
    { label: 'Ar', base: 60, top: 35, total: 95 },
    { label: 'Ar', base: 40, top: 28, total: 68 },
    { label: 'Hi', base: 65, top: 40, total: 105 },
    { label: 'Lo', base: 50, top: 35, total: 85 },
  ];

  // Top Sources Donut data
  const sourcesData = metricsData?.source_distribution || [
    { label: 'Top Sources', percentage: 35, color: '#8B5CF6', detail: 'Web Exploit & Phishing URLs' },
    { label: 'Legend', percentage: 17, color: '#A78BFA', detail: 'SMS Smishing & OTP Scams' },
    { label: 'Legend', percentage: 5, color: '#6366F1', detail: 'Payloads & Malware Signatures' },
    { label: 'Other Vectors', percentage: 43, color: '#312E81', detail: 'Deterministic Heuristics & SSRF' },
  ];

  // Regional Nodes
  const radarLocations = metricsData?.regional_nodes || [
    { id: 'us-west', name: 'San Francisco, US', x: 19, y: 38, throughput: '14.2k/s', ping: '18ms' },
    { id: 'us-east', name: 'New York, US', x: 26, y: 35, throughput: '19.8k/s', ping: '24ms' },
    { id: 'eu', name: 'Frankfurt / London', x: 50, y: 30, throughput: '26.4k/s', ping: '12ms' },
    { id: 'india', name: 'Bengaluru / Mumbai', x: 68, y: 52, throughput: '42.1k/s', ping: '8ms' },
    { id: 'ea', name: 'Tokyo / Singapore', x: 82, y: 44, throughput: '31.5k/s', ping: '21ms' },
    { id: 'sa', name: 'São Paulo, BR', x: 33, y: 72, throughput: '8.4k/s', ping: '65ms' },
    { id: 'aus', name: 'Sydney, AU', x: 88, y: 76, throughput: '6.7k/s', ping: '54ms' },
  ];

  // Mark all notifications read
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadNotifications(0);
  };

  // Keyboard navigation for search
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSearchIndex((prev) => (prev + 1) % (searchResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSearchIndex((prev) => (prev - 1 + searchResults.length) % (searchResults.length || 1));
    } else if (e.key === 'Enter') {
      if (searchResults[activeSearchIndex]) {
        onNavigateTab?.(searchResults[activeSearchIndex].target);
        setSearchQuery('');
        setSearchOpen(false);
      }
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
    }
  };

  return (
    <div className="w-full bg-[#07080D] text-[#F5F5FA] p-3 sm:p-5 md:p-6 rounded-2xl border border-[rgba(167,139,250,0.18)] shadow-2xl relative overflow-hidden font-sans select-none">
      {/* Background Ambient Violet Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8B5CF6]/[0.06] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#6366F1]/[0.04] rounded-full blur-[140px] pointer-events-none" />

      {/* Main Grid Wrapper with Left Sidebar & Right Content */}
      <div className="flex gap-4 sm:gap-6 relative z-10">
        {/* ========================================================= */}
        {/* A. NAVIGATION SIDEBAR                                     */}
        {/* ========================================================= */}
        <aside className="hidden md:flex flex-col items-center justify-between py-5 px-2.5 w-16 lg:w-[70px] bg-[#0B0D15] border border-[rgba(167,139,250,0.18)] rounded-2xl backdrop-blur-xl shrink-0">
          {/* Logo Glyph */}
          <div className="flex flex-col items-center gap-7">
            <div
              className="relative group cursor-pointer"
              onClick={() => onNavigateTab?.('dashboard')}
              title="AI Protector Dashboard"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] via-[#8B5CF6] to-[#A78BFA] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.45)] group-hover:scale-105 transition-all">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Navigation Icons Stack */}
            <nav className="flex flex-col items-center gap-3.5" aria-label="Sidebar Navigation">
              {/* 1. Dashboard (Active) */}
              <button
                type="button"
                onClick={() => setActiveNav('grid')}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  activeNav === 'grid'
                    ? 'bg-[#8B5CF6]/30 text-[#A78BFA] ring-1 ring-[#8B5CF6]/60 shadow-[0_0_20px_rgba(139,92,246,0.45)]'
                    : 'text-[#9295AA] hover:text-[#F5F5FA] hover:bg-white/5'
                }`}
                title="Dashboard Overview"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>

              {/* 2. Analytics */}
              <button
                type="button"
                onClick={() => setActiveNav('trends')}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  activeNav === 'trends'
                    ? 'bg-[#8B5CF6]/30 text-[#A78BFA] ring-1 ring-[#8B5CF6]/60 shadow-[0_0_20px_rgba(139,92,246,0.45)]'
                    : 'text-[#9295AA] hover:text-[#F5F5FA] hover:bg-white/5'
                }`}
                title="Analytics & Telemetry"
              >
                <TrendingUp className="w-5 h-5" />
              </button>

              {/* 3. Users / Protection Registry */}
              <button
                type="button"
                onClick={() => setActiveNav('users')}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  activeNav === 'users'
                    ? 'bg-[#8B5CF6]/30 text-[#A78BFA] ring-1 ring-[#8B5CF6]/60 shadow-[0_0_20px_rgba(139,92,246,0.45)]'
                    : 'text-[#9295AA] hover:text-[#F5F5FA] hover:bg-white/5'
                }`}
                title="Users & Identity Protection"
              >
                <Users className="w-5 h-5" />
              </button>

              {/* 4. Projects / Monitored Targets */}
              <button
                type="button"
                onClick={() => setActiveNav('reports')}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  activeNav === 'reports'
                    ? 'bg-[#8B5CF6]/30 text-[#A78BFA] ring-1 ring-[#8B5CF6]/60 shadow-[0_0_20px_rgba(139,92,246,0.45)]'
                    : 'text-[#9295AA] hover:text-[#F5F5FA] hover:bg-white/5'
                }`}
                title="Active Projects & Audit Reports"
              >
                <FileText className="w-5 h-5" />
              </button>

              {/* 5. Settings & Config */}
              <button
                type="button"
                onClick={() => setActiveNav('config')}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  activeNav === 'config'
                    ? 'bg-[#8B5CF6]/30 text-[#A78BFA] ring-1 ring-[#8B5CF6]/60 shadow-[0_0_20px_rgba(139,92,246,0.45)]'
                    : 'text-[#9295AA] hover:text-[#F5F5FA] hover:bg-white/5'
                }`}
                title="System Configuration & Sliders"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </nav>
          </div>

          {/* Bottom Controls */}
          <div className="flex flex-col items-center gap-3.5 mt-8">
            {/* Active Radar Capsule Switch */}
            <button
              type="button"
              onClick={() => setRadarActive(!radarActive)}
              className={`w-8 h-14 rounded-full p-1 flex flex-col justify-between items-center transition-all cursor-pointer ${
                radarActive
                  ? 'bg-[#15182A] border border-[#8B5CF6]/70 shadow-[0_0_18px_rgba(139,92,246,0.45)]'
                  : 'bg-neutral-900 border border-white/10'
              }`}
              title={radarActive ? 'Active Radar: Online' : 'Active Radar: Standby'}
              aria-label="Toggle Radar Telemetry"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                  radarActive
                    ? 'bg-gradient-to-tr from-[#8B5CF6] to-[#6366F1] shadow-[0_0_10px_#8B5CF6]'
                    : 'bg-neutral-600'
                }`}
              >
                <div className="w-2 h-0.5 bg-white rounded-full" />
              </div>
              <div className="text-[9px] font-mono font-bold text-[#A78BFA]">
                {radarActive ? 'ON' : 'OFF'}
              </div>
            </button>

            {/* Settings Gear */}
            <button
              type="button"
              onClick={() => onNavigateTab?.('privacy')}
              className="text-[#9295AA] hover:text-[#F5F5FA] p-2 rounded-lg hover:bg-white/5 transition-all"
              title="Security & Privacy Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Help & Support */}
            <button
              type="button"
              onClick={() => onNavigateTab?.('scam_learn')}
              className="text-[#9295AA] hover:text-[#F5F5FA] p-2 rounded-lg hover:bg-white/5 transition-all"
              title="Help & Fraud Defense Playbooks"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* MAIN BODY CONTENT                                         */}
        {/* ========================================================= */}
        <main className="flex-1 flex flex-col gap-5 min-w-0">
          {/* ------------------------------------------------------- */}
          {/* B. HEADER                                               */}
          {/* ------------------------------------------------------- */}
          <header className="flex flex-wrap items-center justify-between gap-3.5 relative">
            {/* Title & Breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-[#10121E] border border-[rgba(167,139,250,0.18)] text-[#9295AA] hover:text-white"
                aria-label="Toggle mobile menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F5FA]">
                    Dashboard
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A78BFA] text-xs font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
                    <span>Live Telemetry</span>
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#9295AA] hidden sm:block">
                  AI Protector • Zero-Trust Operations
                </div>
              </div>
            </div>

            {/* Center & Right: Search, Date Filter, Notification, Profile */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 ml-auto">
              {/* Date-Range Selector */}
              <div className="hidden sm:flex items-center bg-[#10121E] border border-[rgba(167,139,250,0.18)] rounded-xl p-1 text-xs font-mono">
                {(['7d', '30d', '90d', '1y'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPeriod(p)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      selectedPeriod === p
                        ? 'bg-[#8B5CF6] text-white font-bold shadow-sm'
                        : 'text-[#9295AA] hover:text-white'
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Working Global Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#9295AA] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search targets or tools..."
                  className="w-36 sm:w-56 md:w-64 bg-[#10121E] border border-[rgba(167,139,250,0.18)] text-[#F5F5FA] placeholder-[#9295AA] text-xs sm:text-sm rounded-full pl-9 pr-7 py-2 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                  aria-label="Global search query"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchOpen(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9295AA] hover:text-white text-xs"
                  >
                    ×
                  </button>
                )}

                {/* Global Search Results Dropdown */}
                {searchOpen && searchResults.length > 0 && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#10121E] border border-[rgba(167,139,250,0.3)] rounded-xl shadow-2xl p-2 z-40">
                    <div className="text-[10px] font-mono text-[#9295AA] px-2 py-1 uppercase tracking-wider">
                      Matching Applications & Targets
                    </div>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {searchResults.map((res, i) => (
                        <div
                          key={res.id}
                          onClick={() => {
                            onNavigateTab?.(res.target);
                            setSearchQuery('');
                            setSearchOpen(false);
                          }}
                          className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors ${
                            activeSearchIndex === i
                              ? 'bg-[#8B5CF6]/20 text-white'
                              : 'text-[#9295AA] hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-white">{res.title}</div>
                            <div className="text-[10px] text-[#A78BFA] font-mono">{res.type}</div>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#8B5CF6]" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Working Quick-Action Button */}
              <button
                type="button"
                onClick={() => setQuickScanModalOpen(true)}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8B5CF6] text-white text-xs font-mono font-bold hover:bg-[#7C3AED] transition-all shadow-[0_0_12px_rgba(139,92,246,0.35)]"
                title="Run Fast Threat Scan"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Quick Scan</span>
              </button>

              {/* Mail / Copilot Drawer trigger */}
              <button
                type="button"
                onClick={onOpenCopilot}
                className="w-9 h-9 rounded-full bg-[#10121E] border border-[rgba(167,139,250,0.18)] flex items-center justify-center text-[#9295AA] hover:text-white hover:border-[#8B5CF6]/50 transition-all"
                title="AI Threat Copilot"
                aria-label="Open AI Security Copilot"
              >
                <Mail className="w-4 h-4" />
              </button>

              {/* Notification Bell with unread counter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative w-9 h-9 rounded-full bg-[#10121E] border border-[rgba(167,139,250,0.18)] flex items-center justify-center text-[#9295AA] hover:text-white hover:border-[#8B5CF6]/50 transition-all cursor-pointer"
                  title="Security Alerts"
                  aria-label="Open Security Alerts"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#07080D]" />
                  )}
                </button>

                {/* Notifications Flyout Panel */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#10121E] border border-[rgba(167,139,250,0.3)] rounded-2xl shadow-2xl p-4 z-40 font-sans">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">Security Alerts</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#A78BFA] text-[10px] font-mono font-bold">
                          {unreadNotifications} new
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-mono text-[#A78BFA] hover:text-white"
                      >
                        Mark all read
                      </button>
                    </div>

                    <div className="space-y-2.5 mt-3 max-h-72 overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl border text-xs transition-all ${
                            n.unread
                              ? 'bg-[#15182A] border-[#8B5CF6]/40'
                              : 'bg-white/[0.02] border-white/5 opacity-75'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-white">{n.title}</span>
                            <span className="text-[10px] text-[#9295AA] font-mono">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-[#9295AA] mt-1">{n.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar with Account Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="w-9 h-9 rounded-full ring-2 ring-[#8B5CF6]/40 overflow-hidden cursor-pointer bg-neutral-800 flex items-center justify-center shrink-0"
                  aria-label="User Account Menu"
                >
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                    alt="Analyst Operator"
                    className="w-full h-full object-cover"
                  />
                </button>

                {/* Account Dropdown */}
                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#10121E] border border-[rgba(167,139,250,0.3)] rounded-2xl shadow-2xl p-4 z-40 text-xs">
                    <div className="pb-3 border-b border-white/[0.08]">
                      <div className="font-bold text-white">Security Analyst</div>
                      <div className="text-[11px] text-[#9295AA] font-mono">analyst@aiprotector.org</div>
                      <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Role: Analyst (RBAC)</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          onNavigateTab?.('privacy');
                          setAccountMenuOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-white/5 flex items-center gap-2 text-[#9295AA] hover:text-white"
                      >
                        <Lock className="w-3.5 h-3.5 text-[#8B5CF6]" />
                        <span>Privacy & Retention Matrix</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onNavigateTab?.('health');
                          setAccountMenuOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-white/5 flex items-center gap-2 text-[#9295AA] hover:text-white"
                      >
                        <Key className="w-3.5 h-3.5 text-[#A78BFA]" />
                        <span>Provider API Credentials</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Quick Scan Modal */}
          {quickScanModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#10121E] border border-[rgba(167,139,250,0.3)] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#8B5CF6]" />
                    <span>Run Fast Threat Scan</span>
                  </h3>
                  <button
                    onClick={() => setQuickScanModalOpen(false)}
                    className="text-[#9295AA] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-[#9295AA]">
                  Submit any URL, SMS snippet, or phone number to execute an immediate zero-retention analysis.
                </p>
                <input
                  type="text"
                  value={quickScanInput}
                  onChange={(e) => setQuickScanInput(e.target.value)}
                  placeholder="https://... or SMS text..."
                  className="w-full p-3 rounded-xl bg-[#07080D] border border-[rgba(167,139,250,0.2)] text-white text-xs focus:outline-none focus:border-[#8B5CF6]"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setQuickScanModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-[#9295AA] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setQuickScanModalOpen(false);
                      onNavigateTab?.('check_anything');
                    }}
                    className="px-4 py-2 rounded-xl text-xs bg-[#8B5CF6] text-white font-bold hover:bg-[#7C3AED]"
                  >
                    Inspect Target
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* C. FOUR KPI SUMMARY CARDS                               */}
          {/* ------------------------------------------------------- */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="KPI Metrics">
            {/* CARD 1: Total Users */}
            <div
              onClick={() => setActiveCard('total')}
              className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all ${
                activeCard === 'total'
                  ? 'bg-[#15182A] border border-[#8B5CF6] shadow-[0_0_25px_rgba(139,92,246,0.35)]'
                  : 'bg-[#10121E] border border-[rgba(167,139,250,0.18)] hover:border-[#8B5CF6]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-[#F5F5FA]">
                  Total Users
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTooltip(activeTooltip === 'total' ? null : 'total');
                  }}
                  className="text-[#9295AA] hover:text-white"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {activeTooltip === 'total' && (
                <div className="mt-2 p-2 bg-[#07080D] border border-white/10 rounded-lg text-[10px] text-[#9295AA] font-mono">
                  Total authenticated and verified identity endpoints monitored.
                </div>
              )}

              {/* Sparkline wave */}
              <div className="mt-3 h-14 w-full">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="userWaveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818CF8" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,45 C30,40 50,55 80,30 C110,10 130,28 160,20 C180,15 190,25 200,18 L200,60 L0,60 Z"
                    fill="url(#userWaveGrad)"
                  />
                  <path
                    d="M0,45 C30,40 50,55 80,30 C110,10 130,28 160,20 C180,15 190,25 200,18"
                    fill="none"
                    stroke="#818CF8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="80" cy="30" r="3" fill="#FFFFFF" />
                  <circle cx="160" cy="20" r="3" fill="#FFFFFF" />
                </svg>
              </div>

              {/* Footer: Mini equalizer & count */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-end gap-1 h-5">
                  <div className="w-1 h-2 bg-indigo-500/70 rounded-full" />
                  <div className="w-1 h-3.5 bg-indigo-400 rounded-full" />
                  <div className="w-1 h-5 bg-[#8B5CF6] rounded-full" />
                  <div className="w-1 h-2.5 bg-indigo-400 rounded-full" />
                  <div className="w-1 h-4 bg-[#8B5CF6] rounded-full" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-white tracking-wider">
                    {metricsData?.kpis?.total_users?.formatted_value || '13,384'}
                  </span>
                  <div className="w-10 h-1 bg-indigo-500/40 rounded-full mt-1 ml-auto">
                    <div className="w-3/4 h-full bg-indigo-400 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Revenue Growth (The active glowing card from reference) */}
            <div
              onClick={() => setActiveCard('revenue')}
              className={`p-4 sm:p-5 rounded-2xl cursor-pointer relative overflow-hidden transition-all ${
                activeCard === 'revenue'
                  ? 'bg-[#15182A] border border-[#8B5CF6] shadow-[0_0_25px_rgba(139,92,246,0.35)]'
                  : 'bg-[#10121E] border border-[rgba(167,139,250,0.18)] hover:border-[#8B5CF6]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-white flex items-center gap-1.5">
                  Revenue Growth
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTooltip(activeTooltip === 'revenue' ? null : 'revenue');
                  }}
                  className="text-[#9295AA] hover:text-white"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {activeTooltip === 'revenue' && (
                <div className="mt-2 p-2 bg-[#07080D] border border-white/10 rounded-lg text-[10px] text-[#9295AA] font-mono">
                  Threat mitigation efficiency & SOC operational index.
                </div>
              )}

              {/* High peak wave curve with luminous apex node */}
              <div className="mt-2 h-16 w-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 65" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="purplePeakGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C084FC" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,50 C40,48 60,35 90,15 C110,2 130,12 150,28 C170,42 185,30 200,20 L200,65 L0,65 Z"
                    fill="url(#purplePeakGrad)"
                  />
                  <path
                    d="M0,50 C40,48 60,35 90,15 C110,2 130,12 150,28 C170,42 185,30 200,20"
                    fill="none"
                    stroke="#D8B4FE"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="11" r="5" fill="#FFFFFF" />
                  <circle cx="100" cy="11" r="9" fill="#8B5CF6" fillOpacity="0.4" />
                </svg>
              </div>

              {/* Progress Ring with 25% and 53% */}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-neutral-800"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#8B5CF6]"
                        strokeDasharray="25, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white">
                      25
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#9295AA]">%</span>
                </div>

                <span className="text-xs font-mono font-bold text-[#A78BFA] bg-[#8B5CF6]/20 px-2.5 py-0.5 rounded-full border border-[#8B5CF6]/30">
                  53%
                </span>
              </div>
            </div>

            {/* CARD 3: New Subscriptions */}
            <div
              onClick={() => setActiveCard('subscriptions')}
              className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all ${
                activeCard === 'subscriptions'
                  ? 'bg-[#15182A] border border-[#8B5CF6] shadow-[0_0_25px_rgba(139,92,246,0.35)]'
                  : 'bg-[#10121E] border border-[rgba(167,139,250,0.18)] hover:border-[#8B5CF6]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-[#F5F5FA]">
                  New Subscriptions
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTooltip(activeTooltip === 'subscriptions' ? null : 'subscriptions');
                  }}
                  className="text-[#9295AA] hover:text-white"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {activeTooltip === 'subscriptions' && (
                <div className="mt-2 p-2 bg-[#07080D] border border-white/10 rounded-lg text-[10px] text-[#9295AA] font-mono">
                  New subscriber nodes & verified client protections provisioned.
                </div>
              )}

              {/* Grouped vertical bars */}
              <div className="mt-3 h-16 flex items-end justify-between gap-1 px-1">
                {[
                  { m: 'Jan', h1: 30, h2: 45 },
                  { m: 'Feb', h1: 50, h2: 70 },
                  { m: 'Mar', h1: 25, h2: 40 },
                  { m: 'Apr', h1: 45, h2: 60 },
                  { m: 'May', h1: 65, h2: 85 },
                  { m: 'Dec', h1: 55, h2: 75 },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1 flex-1 group">
                    <div className="w-full flex items-end justify-center gap-0.5 h-12">
                      <div
                        style={{ height: `${item.h1}%` }}
                        className="w-1.5 sm:w-2 bg-[#6366F1]/80 rounded-t-sm group-hover:brightness-125 transition-all"
                      />
                      <div
                        style={{ height: `${item.h2}%` }}
                        className="w-1.5 sm:w-2 bg-[#8B5CF6] rounded-t-sm group-hover:brightness-125 transition-all"
                      />
                    </div>
                    <span className="text-[9px] font-mono text-[#9295AA] group-hover:text-white">
                      {item.m}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 4: Retention Rate */}
            <div
              onClick={() => setActiveCard('retention')}
              className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all ${
                activeCard === 'retention'
                  ? 'bg-[#15182A] border border-[#8B5CF6] shadow-[0_0_25px_rgba(139,92,246,0.35)]'
                  : 'bg-[#10121E] border border-[rgba(167,139,250,0.18)] hover:border-[#8B5CF6]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-[#F5F5FA]">
                  Retention Rate
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTooltip(activeTooltip === 'retention' ? null : 'retention');
                  }}
                  className="text-[#9295AA] hover:text-white"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {activeTooltip === 'retention' && (
                <div className="mt-2 p-2 bg-[#07080D] border border-white/10 rounded-lg text-[10px] text-[#9295AA] font-mono">
                  Defense posture continuity score (98.6% zero-false-negative rate).
                </div>
              )}

              {/* Radial Arc Gauge with 430 value */}
              <div className="mt-2 h-16 flex items-center justify-center relative">
                <svg className="w-28 h-20 overflow-visible" viewBox="0 0 100 65">
                  <defs>
                    <linearGradient id="arcGradExact" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="50%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#C084FC" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 15 55 A 40 40 0 1 1 85 55"
                    fill="none"
                    stroke="#1E2330"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 15 55 A 40 40 0 1 1 85 55"
                    fill="none"
                    stroke="url(#arcGradExact)"
                    strokeWidth="7"
                    strokeDasharray="180"
                    strokeDashoffset="45"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute top-7 flex flex-col items-center">
                  <span className="text-base font-mono font-extrabold text-white leading-none">
                    430
                  </span>
                  <span className="text-[10px] text-[#9295AA] uppercase tracking-wider font-mono mt-0.5">
                    value
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------- */}
          {/* D. MAIN ANALYTICS OVERVIEW & E. SOURCE DISTRIBUTION     */}
          {/* ------------------------------------------------------- */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* LEFT: Main Analytics Overview (8 of 12 cols) */}
            <div className="lg:col-span-8 bg-[#10121E] border border-[rgba(167,139,250,0.18)] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
              {/* Header with Series Toggles & Trends dropdown */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-white">
                    Main Analytics Overview
                  </h2>
                  <div className="text-[11px] text-[#9295AA] font-mono">
                    Time series telemetry analysis • 2026 Season
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Series Visibility Toggles */}
                  <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setShowSeriesA(!showSeriesA)}
                      className={`flex items-center gap-1.5 transition-opacity ${
                        showSeriesA ? 'opacity-100 text-[#F5F5FA]' : 'opacity-40 text-[#9295AA]'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-[#818CF8]" />
                      <span>Inquiries</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSeriesB(!showSeriesB)}
                      className={`flex items-center gap-1.5 transition-opacity ${
                        showSeriesB ? 'opacity-100 text-[#F5F5FA]' : 'opacity-40 text-[#9295AA]'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                      <span>Neutralized</span>
                    </button>
                  </div>

                  {/* Trends Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsTrendOpen(!isTrendOpen)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#15182A] border border-[rgba(167,139,250,0.2)] text-xs text-[#F5F5FA] hover:border-[#8B5CF6]/50 transition-all font-mono"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      <span>{trendRange}</span>
                      <ChevronDown className="w-3 h-3 text-[#9295AA]" />
                    </button>

                    {isTrendOpen && (
                      <div className="absolute right-0 mt-1 w-32 bg-[#10121E] border border-[rgba(167,139,250,0.3)] rounded-xl shadow-2xl py-1 z-30 font-mono text-xs">
                        {(['Trends', 'Monthly', 'Weekly', 'Daily'] as const).map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              setTrendRange(r);
                              setIsTrendOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 hover:bg-[#8B5CF6]/20 hover:text-[#A78BFA] transition-colors ${
                              trendRange === r ? 'text-[#8B5CF6] font-bold bg-white/5' : 'text-[#F5F5FA]'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chart Canvas with Crosshair Guideline */}
              <div className="relative w-full h-56 sm:h-64 mt-2">
                {/* Horizontal grid lines & Y labels */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-[#9295AA]">
                  {[500, 400, 300, 200, 100, 0].map((val) => (
                    <div key={val} className="flex items-center gap-3 w-full">
                      <span className="w-6 text-right shrink-0">{val}</span>
                      <div className="flex-1 h-px border-b border-dashed border-white/[0.06]" />
                    </div>
                  ))}
                </div>

                {/* SVG Curve Canvas */}
                <div className="absolute inset-0 pl-9 pr-2 pt-1 pb-6">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 240" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="mainCurveGradPurple" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="blueCurveGradIndigo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Curve B (Purple Line & Fill) */}
                    {showSeriesB && (
                      <>
                        <path
                          d="M 20 200 C 100 180, 150 140, 220 90 C 290 40, 350 140, 420 130 C 490 120, 520 80, 580 80 C 650 80, 720 140, 800 150 C 880 160, 930 110, 980 90 L 980 230 L 20 230 Z"
                          fill="url(#mainCurveGradPurple)"
                        />
                        <path
                          d="M 20 200 C 100 180, 150 140, 220 90 C 290 40, 350 140, 420 130 C 490 120, 520 80, 580 80 C 650 80, 720 140, 800 150 C 880 160, 930 110, 980 90"
                          fill="none"
                          stroke="#A78BFA"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </>
                    )}

                    {/* Curve A (Periwinkle Curve) */}
                    {showSeriesA && (
                      <path
                        d="M 20 220 C 100 160, 150 120, 220 110 C 290 100, 350 160, 420 140 C 490 110, 520 50, 580 65 C 650 80, 720 120, 800 160 C 880 180, 930 120, 980 100"
                        fill="none"
                        stroke="#818CF8"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Plotted Node Dots */}
                    <circle cx="220" cy="90" r="5" fill="#FFFFFF" />
                    <circle cx="350" cy="140" r="4.5" fill="#818CF8" />
                    <circle cx="580" cy="80" r="6" fill="#FFFFFF" />
                    <circle cx="580" cy="80" r="11" fill="#8B5CF6" fillOpacity="0.4" />
                    <circle cx="800" cy="150" r="5" fill="#FFFFFF" />

                    {/* Vertical Interactive Crosshair Guideline */}
                    <line
                      x1="520"
                      y1="0"
                      x2="520"
                      y2="230"
                      stroke="#8B5CF6"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    <circle cx="520" cy="95" r="5" fill="#FFFFFF" />
                    <circle cx="520" cy="95" r="10" fill="#8B5CF6" fillOpacity="0.5" />
                  </svg>

                  {/* Tooltip Hover Badge */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#15182A] border border-[#8B5CF6]/50 rounded-xl px-3 py-1.5 shadow-[0_0_20px_rgba(139,92,246,0.35)] text-center pointer-events-none">
                    <div className="text-[10px] font-mono text-[#A78BFA] font-bold uppercase tracking-wider">
                      {currentMonth.month} Telemetry Point
                    </div>
                    <div className="text-xs font-mono font-bold text-white">
                      {currentMonth.threats} Inquiries • {currentMonth.blocked} Neutralized
                    </div>
                  </div>
                </div>

                {/* X-Axis Month Selectors */}
                <div className="absolute bottom-0 left-9 right-2 flex justify-between text-[10px] font-mono text-[#9295AA]">
                  {months.map((m, idx) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setActiveMonthIndex(idx)}
                      className={`hover:text-[#A78BFA] transition-colors cursor-pointer ${
                        activeMonthIndex === idx ? 'text-[#A78BFA] font-bold underline underline-offset-4' : ''
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: E. Traffic or Source Distribution (Donut Chart) */}
            <div className="lg:col-span-4 bg-[#10121E] border border-[rgba(167,139,250,0.18)] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-white">
                    Top Sources
                  </h2>
                  <div className="text-[11px] text-[#9295AA] font-mono">
                    Distribution of incoming threat vectors
                  </div>
                </div>
                <button type="button" className="text-[#9295AA] hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Donut Chart Canvas */}
              <div className="my-auto py-2 flex items-center justify-center relative">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Ring 1: Top Sources 35% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="14"
                      strokeDasharray="83.5 238.7"
                      strokeDashoffset="0"
                      className="cursor-pointer hover:stroke-[#A78BFA] transition-all"
                      onMouseEnter={() => setHoveredSource(0)}
                      onMouseLeave={() => setHoveredSource(null)}
                    />
                    {/* Ring 2: Legend 17% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#818CF8"
                      strokeWidth="14"
                      strokeDasharray="40.5 238.7"
                      strokeDashoffset="-86"
                      className="cursor-pointer hover:stroke-indigo-300 transition-all"
                      onMouseEnter={() => setHoveredSource(1)}
                      onMouseLeave={() => setHoveredSource(null)}
                    />
                    {/* Ring 3: Legend 5% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#C084FC"
                      strokeWidth="14"
                      strokeDasharray="12 238.7"
                      strokeDashoffset="-129"
                      className="cursor-pointer hover:stroke-pink-300 transition-all"
                      onMouseEnter={() => setHoveredSource(2)}
                      onMouseLeave={() => setHoveredSource(null)}
                    />
                    {/* Ring 4: Other Vectors */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#312E81"
                      strokeWidth="14"
                      strokeDasharray="95 238.7"
                      strokeDashoffset="-143"
                      className="cursor-pointer hover:stroke-purple-900 transition-all"
                      onMouseEnter={() => setHoveredSource(3)}
                      onMouseLeave={() => setHoveredSource(null)}
                    />
                  </svg>

                  {/* Donut Center */}
                  <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#07080D] border border-white/10 flex flex-col items-center justify-center shadow-inner pointer-events-none">
                    <span className="text-xs font-mono font-bold text-white">
                      {hoveredSource !== null ? `${sourcesData[hoveredSource].percentage}%` : '100%'}
                    </span>
                    <span className="text-[8px] font-mono text-[#A78BFA] uppercase">
                      {hoveredSource !== null ? 'VECTOR' : 'TOTAL'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-2 text-xs font-mono pt-3 border-t border-white/[0.06]">
                {sourcesData.map((s: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between group cursor-pointer hover:text-white text-[#9295AA]"
                    onMouseEnter={() => setHoveredSource(idx)}
                    onMouseLeave={() => setHoveredSource(null)}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: s.color }}
                      />
                      <span>{s.label}</span>
                    </div>
                    <span className="font-bold text-white">{s.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------- */}
          {/* F. ACTIVE PROJECTS, G. ACTIVITY, H. LOCATIONS           */}
          {/* ------------------------------------------------------- */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* PANEL F: Active Projects Table */}
            <div className="bg-[#10121E] border border-[rgba(167,139,250,0.18)] rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Active Projects
                    </h3>
                    <div className="text-[10px] text-[#9295AA] font-mono">
                      Monitored security endpoints
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Category Filter */}
                    <select
                      value={projectCategoryFilter}
                      onChange={(e) => setProjectCategoryFilter(e.target.value)}
                      className="bg-[#15182A] border border-white/10 rounded-lg text-[10px] font-mono text-[#A78BFA] px-2 py-1 focus:outline-none"
                    >
                      <option value="All">All Categories</option>
                      <option value="API Security">API Security</option>
                      <option value="Message Pipeline">Message Pipeline</option>
                      <option value="File Integrity">File Integrity</option>
                      <option value="Gemini Threat AI">Gemini Threat AI</option>
                    </select>
                  </div>
                </div>

                {/* Subheaders */}
                <div className="flex items-center justify-between text-[10px] font-mono text-[#9295AA] uppercase tracking-wider pb-2 border-b border-white/[0.06]">
                  <span
                    className="w-2/5 cursor-pointer hover:text-white"
                    onClick={() => {
                      setProjectSortField('name');
                      setProjectSortAsc(!projectSortAsc);
                    }}
                  >
                    Projects {projectSortField === 'name' && (projectSortAsc ? '▲' : '▼')}
                  </span>
                  <span
                    className="w-2/5 text-center cursor-pointer hover:text-white"
                    onClick={() => {
                      setProjectSortField('progress');
                      setProjectSortAsc(!projectSortAsc);
                    }}
                  >
                    Data {projectSortField === 'progress' && (projectSortAsc ? '▲' : '▼')}
                  </span>
                  <span className="w-1/5 text-right">Status</span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-white/[0.04] mt-1">
                  {filteredProjects.map((proj: any) => (
                    <div
                      key={proj.id}
                      onClick={() => onNavigateTab?.(proj.targetTab)}
                      className="py-2.5 flex items-center justify-between gap-2 hover:bg-white/[0.02] rounded-lg px-1 transition-colors cursor-pointer group"
                      title={`Open ${proj.name} forensic scanner`}
                    >
                      {/* Project info */}
                      <div className="w-2/5 flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#8B5CF6]/50 transition-all">
                          <Shield className="w-3.5 h-3.5 text-[#8B5CF6]" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-white truncate group-hover:text-[#A78BFA]">
                            {proj.name}
                          </div>
                          <div className="text-[10px] text-[#9295AA] truncate font-mono">
                            {proj.category}
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-2/5 flex items-center justify-center px-2">
                        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${proj.progress}%` }}
                            className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full"
                          />
                        </div>
                      </div>

                      {/* 3 Status Dots */}
                      <div className="w-1/5 flex items-center justify-end gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-[10px] font-mono text-[#9295AA] text-center border-t border-white/[0.04]">
                Showing {filteredProjects.length} monitored target pipelines
              </div>
            </div>

            {/* PANEL G: Team Activity Chart */}
            <div className="bg-[#10121E] border border-[rgba(167,139,250,0.18)] rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Team Activity
                    </h3>
                    <div className="text-[10px] text-[#9295AA] font-mono">
                      Automated runs vs operator audits
                    </div>
                  </div>
                  <button type="button" className="text-[#9295AA] hover:text-white">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Y-Axis & Stacked Bar Chart */}
                <div className="relative h-44 mt-3">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] font-mono text-[#9295AA]">
                    {[100, 80, 60, 40, 20, 0].map((val) => (
                      <div key={val} className="flex items-center gap-2">
                        <span className="w-4 text-right">{val}</span>
                        <div className="flex-1 h-px border-b border-dashed border-white/[0.04]" />
                      </div>
                    ))}
                  </div>

                  <div className="absolute inset-0 pl-6 pr-2 pt-2 pb-5 flex items-end justify-between gap-2">
                    {teamActivity.map((d: any, i: number) => (
                      <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                        <div className="w-3 sm:w-4 flex flex-col rounded-t overflow-hidden">
                          <div
                            style={{ height: `${(d.top / 120) * 120}px` }}
                            className="w-full bg-[#A78BFA] group-hover:brightness-125 transition-all"
                          />
                          <div
                            style={{ height: `${(d.base / 120) * 120}px` }}
                            className="w-full bg-[#7C3AED] group-hover:brightness-125 transition-all"
                          />
                        </div>
                        <span className="text-[9px] font-mono text-[#9295AA] mt-1">
                          {d.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-[#9295AA] pt-2 border-t border-white/[0.04]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-[#7C3AED]" />
                  <span>Engine Runs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-[#A78BFA]" />
                  <span>Operator Audits</span>
                </div>
              </div>
            </div>

            {/* PANEL H: User Locations & Regional Telemetry */}
            <div className="bg-[#10121E] border border-[rgba(167,139,250,0.18)] rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      User Locations
                    </h3>
                    <div className="text-[10px] text-[#9295AA] font-mono">
                      Privacy-preserving aggregated regional nodes
                    </div>
                  </div>
                  <button type="button" className="text-[#9295AA] hover:text-white">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Dark World Map with radar beacons */}
                <div className="relative w-full h-44 rounded-xl overflow-hidden bg-[#07080D] border border-white/[0.04] flex items-center justify-center">
                  <svg
                    viewBox="0 0 1000 500"
                    className="w-full h-full opacity-35 object-contain"
                    fill="#334155"
                  >
                    <path d="M150,120 Q180,90 240,110 T300,160 Q280,220 220,240 T140,210 Q120,160 150,120 Z" />
                    <path d="M350,70 Q380,60 410,75 T390,110 Q360,110 350,70 Z" />
                    <path d="M260,270 Q320,280 340,340 T310,430 Q270,440 250,380 T260,270 Z" />
                    <path d="M470,120 Q520,110 560,140 T540,200 Q480,210 460,160 T470,120 Z" />
                    <path d="M470,220 Q540,210 570,270 T550,380 Q480,390 460,300 T470,220 Z" />
                    <path d="M570,120 Q700,90 820,130 T850,230 Q750,260 670,230 T570,190 Z" />
                    <path d="M660,220 Q700,230 710,280 T670,330 Q640,290 660,220 Z" />
                    <path d="M780,330 Q860,320 890,370 T840,430 Q780,420 780,330 Z" />
                  </svg>

                  {/* Beacons with pulse animation */}
                  {radarLocations.map((loc: any) => (
                    <div
                      key={loc.id}
                      style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                      onMouseEnter={() => setHoveredLocation(loc.name)}
                      onMouseLeave={() => setHoveredLocation(null)}
                    >
                      <span className="absolute -inset-2 rounded-full bg-[#8B5CF6]/40 animate-radar-ping pointer-events-none" />
                      <span className="relative block w-2.5 h-2.5 rounded-full bg-[#A78BFA] ring-2 ring-[#8B5CF6] shadow-[0_0_12px_#A78BFA]" />
                    </div>
                  ))}

                  {/* Active Tooltip */}
                  {hoveredLocation && (
                    <div className="absolute bottom-2 left-2 right-2 bg-[#15182A]/95 border border-[#8B5CF6]/50 rounded-lg p-2 text-center text-xs font-mono shadow-xl pointer-events-none">
                      <span className="text-[#A78BFA] font-bold">{hoveredLocation}</span>
                      <span className="text-[#9295AA] text-[10px] block">Aggregated regional privacy node</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#9295AA] pt-2 border-t border-white/[0.04]">
                <span>Active Nodes: 7 Regional Hubs</span>
                <span className="text-[#A78BFA]">Global Latency: 14ms</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default CyberDashboard;
