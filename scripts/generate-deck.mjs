import pptxgen from 'pptxgenjs';
import fs from 'fs';
import path from 'path';

// Create presentation instance
const pptx = new pptxgen();

// Set metadata
pptx.title = 'AI Protector — Master Technology & Architecture Pitch';
pptx.author = 'Lead Engineering Team';
pptx.company = 'AI Protector Security Systems';
pptx.layout = 'LAYOUT_16x9'; // 16:9 widescreen layout

// Color Palette Constants matching Master Prompt Design System
const C = {
  bgMain: '07080D',
  bgCard: '10121E',
  bgElevated: '15182A',
  accentPurple: '8B5CF6',
  accentLavender: 'A78BFA',
  accentIndigo: '6366F1',
  textMain: 'F5F5FA',
  textMuted: '9295AA',
  textDim: '687687',
  emerald: '10B981',
  amber: 'F59E0B',
  rose: 'EF4444',
  border: '2D2845',
};

// Helper to add standard slide header
function addSlideHeader(slide, title, category) {
  // Background
  slide.background = { color: C.bgMain };

  // Top Category Tag
  slide.addText(category.toUpperCase(), {
    x: 0.8,
    y: 0.45,
    w: 8.0,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Arial',
    color: C.accentLavender,
    bold: true,
  });

  // Slide Title
  slide.addText(title, {
    x: 0.8,
    y: 0.75,
    w: 11.5,
    h: 0.6,
    fontSize: 22,
    fontFace: 'Arial',
    color: C.textMain,
    bold: true,
  });

  // Header Divider Line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.4,
    w: 11.7,
    h: 0.02,
    fill: { color: C.border },
    line: { color: C.border },
  });

  // Footer Tag
  slide.addText('AI PROTECTOR • ENTERPRISE ZERO-TRUST ARCHITECTURE', {
    x: 0.8,
    y: 7.1,
    w: 6.0,
    h: 0.25,
    fontSize: 8,
    fontFace: 'Arial',
    color: C.textDim,
  });
}

// =========================================================================
// SLIDE 1: Title Slide (Hero Pitch)
// =========================================================================
{
  const s = pptx.addSlide();
  s.background = { color: C.bgMain };

  // Center Badge
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.5,
    w: 3.8,
    h: 0.4,
    rectRadius: 0.2,
    fill: { color: '1A152E' },
    line: { color: C.accentPurple, width: 1 },
  });
  s.addText('ZERO-TRUST THREAT DEFENSE PLATFORM', {
    x: 0.8,
    y: 1.5,
    w: 3.8,
    h: 0.4,
    fontSize: 9,
    fontFace: 'Arial',
    color: C.accentLavender,
    bold: true,
    align: 'center',
  });

  // Title
  s.addText('AI Protector', {
    x: 0.8,
    y: 2.1,
    w: 11.5,
    h: 1.1,
    fontSize: 46,
    fontFace: 'Arial',
    color: C.textMain,
    bold: true,
  });

  // Subtitle
  s.addText('Evidence-Based Warnings, Honestly Labelled.\nPrivate by Design. Trust by Intelligence.', {
    x: 0.8,
    y: 3.2,
    w: 10.0,
    h: 0.8,
    fontSize: 18,
    fontFace: 'Arial',
    color: C.accentLavender,
  });

  // Mission Description
  s.addText(
    'A defensive, privacy-first cybersecurity platform that helps people verify whether a link, message, file, or claim is safe BEFORE they act on it — with strict client-side PII scrubbing, zero server-side storage, and explainable multi-engine threat consensus.',
    {
      x: 0.8,
      y: 4.2,
      w: 8.5,
      h: 0.9,
      fontSize: 12,
      fontFace: 'Arial',
      color: C.textMuted,
      lineSpacing: 18,
    }
  );

  // Key Feature Pills
  const pills = [
    { title: 'Anti-SSRF IP Shield', sub: 'Blocks 0x7f, CGNAT & AWS Metadata' },
    { title: 'DPDP 2023 Redaction', sub: 'Scrubs Aadhaar, PAN & UPI' },
    { title: 'Multi-AV Hybrid', sub: '70+ VirusTotal & Local Engines' },
    { title: 'Sub-400ms Speed', sub: 'Turbopack Edge/Serverless Ready' },
  ];

  pills.forEach((p, idx) => {
    const xPos = 0.8 + idx * 2.9;
    s.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 5.4,
      w: 2.7,
      h: 1.2,
      rectRadius: 0.1,
      fill: { color: C.bgCard },
      line: { color: C.border, width: 1 },
    });
    s.addText(p.title, {
      x: xPos + 0.15,
      y: 5.55,
      w: 2.4,
      h: 0.35,
      fontSize: 11,
      fontFace: 'Arial',
      color: C.textMain,
      bold: true,
    });
    s.addText(p.sub, {
      x: xPos + 0.15,
      y: 5.9,
      w: 2.4,
      h: 0.55,
      fontSize: 9,
      fontFace: 'Arial',
      color: C.textMuted,
    });
  });
}

// =========================================================================
// SLIDE 2: The Core Problem & Threat Landscape
// =========================================================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, 'The Problem: Cyber Fraud at Billions Scale', 'Threat Landscape & Motivation');

  const problems = [
    {
      tag: 'FINANCIAL FRAUD',
      title: 'Sophisticated Smishing & Urgency Traps',
      desc: 'Attackers craft high-pressure SMS simulating bank KYC suspensions, electricity bill cutoffs, and courier parcel fees, extracting OTPs and life savings within minutes.',
      icon: '🚨',
      borderCol: C.rose,
    },
    {
      tag: 'INFRASTRUCTURE EXPLOIT',
      title: 'SSRF & Obfuscated IP Lookalikes',
      desc: 'Hex (0x7f000001), octal, and decimal IP encodings bypass weak firewalls, while typosquatting domains (paypa1.xyz) trick corporate networks and regular users.',
      icon: '🛡️',
      borderCol: C.amber,
    },
    {
      tag: 'PRIVACY INVASION',
      title: 'Traditional Antivirus Logs Everything',
      desc: 'Conventional scanners upload complete browsing history, unredacted personal chats, and files to central cloud databases, creating massive breach vulnerabilities.',
      icon: '👁️',
      borderCol: C.accentPurple,
    },
  ];

  problems.forEach((p, idx) => {
    const xPos = 0.8 + idx * 3.9;
    s.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.8,
      w: 3.7,
      h: 4.8,
      rectRadius: 0.15,
      fill: { color: C.bgCard },
      line: { color: p.borderCol, width: 1.5 },
    });

    s.addText(p.icon + '  ' + p.tag, {
      x: xPos + 0.3,
      y: 2.1,
      w: 3.1,
      h: 0.35,
      fontSize: 10,
      fontFace: 'Arial',
      color: p.borderCol,
      bold: true,
    });

    s.addText(p.title, {
      x: xPos + 0.3,
      y: 2.6,
      w: 3.1,
      h: 0.9,
      fontSize: 16,
      fontFace: 'Arial',
      color: C.textMain,
      bold: true,
    });

    s.addText(p.desc, {
      x: xPos + 0.3,
      y: 3.7,
      w: 3.1,
      h: 2.5,
      fontSize: 11,
      fontFace: 'Arial',
      color: C.textMuted,
      lineSpacing: 18,
    });
  });
}

// =========================================================================
// SLIDE 3: Security Invariants & Principles
// =========================================================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, 'Core Principles & Non-Negotiable Security Invariants', 'Zero-Trust Architecture');

  const invariants = [
    {
      num: '01',
      title: 'Zero Server-Side Retention',
      desc: 'No raw messages, URLs, or files stored in backend databases. URLs are stripped of tracking queries and logged strictly as Host + SHA-256 hash.',
    },
    {
      num: '02',
      title: 'Pre-Flight Client Redaction',
      desc: 'Aadhaar (12-digit UIDAI), PAN cards, UPI IDs, passwords, and phone numbers are scrubbed client-side before any data reaches network transit.',
    },
    {
      num: '03',
      title: 'Honest Status & Fail-Closed',
      desc: 'Never show a silent "safe" when an API times out. If external engines fail, explicitly return "unavailable" with transparent limitations.',
    },
    {
      num: '04',
      title: 'Deterministic Authority Rule',
      desc: 'AI neural models provide explanations but can NEVER lower or overturn a high-risk finding identified by deterministic rules (anti-SSRF/YARA).',
    },
  ];

  invariants.forEach((inv, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    const xPos = 0.8 + col * 5.9;
    const yPos = 1.8 + row * 2.5;

    s.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: yPos,
      w: 5.7,
      h: 2.2,
      rectRadius: 0.15,
      fill: { color: C.bgCard },
      line: { color: C.border, width: 1 },
    });

    s.addText(inv.num, {
      x: xPos + 0.3,
      y: yPos + 0.25,
      w: 0.7,
      h: 0.4,
      fontSize: 16,
      fontFace: 'Arial',
      color: C.accentPurple,
      bold: true,
    });

    s.addText(inv.title, {
      x: xPos + 1.1,
      y: yPos + 0.25,
      w: 4.3,
      h: 0.4,
      fontSize: 14,
      fontFace: 'Arial',
      color: C.textMain,
      bold: true,
    });

    s.addText(inv.desc, {
      x: xPos + 1.1,
      y: yPos + 0.75,
      w: 4.3,
      h: 1.25,
      fontSize: 11,
      fontFace: 'Arial',
      color: C.textMuted,
      lineSpacing: 16,
    });
  });
}

// =========================================================================
// SLIDE 4: The Complete Modern Tech Stack
// =========================================================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, 'The Complete Modern Tech Stack', 'Engineering Foundation');

  const stackCategories = [
    {
      title: 'FRONTEND & APPLICATION',
      techs: [
        { name: 'Next.js 16.4.2 (Turbopack)', detail: 'App Router, sub-300ms startup, SSR + static prerendering' },
        { name: 'React 19 & TypeScript', detail: 'Strict type safety, zero runtime casting hazards' },
        { name: 'Tailwind CSS v4 & Motion', detail: 'High-performance dark theme, 60fps micro-animations' },
      ],
    },
    {
      title: 'DEFENSE ENGINES & APIS',
      techs: [
        { name: 'Anti-SSRF & DNS Engine', detail: 'Hex, octal, decimal IP validation & cloud metadata guard' },
        { name: 'VirusTotal Threat Intel v3', detail: 'Consensus checking across 70+ global antivirus engines' },
        { name: 'Google Gemini 3.5 Flash', detail: 'Low-latency neural explanations on PII-redacted tokens' },
      ],
    },
    {
      title: 'CRYPTOGRAPHY & EXTENSION',
      techs: [
        { name: 'W3C Web Crypto API', detail: 'On-device SHA-256 & SHA-512 hashing; zero upload needed' },
        { name: 'Timing-Safe Comparison', detail: 'constant-time timingSafeEqual prevents side-channel leaks' },
        { name: 'Manifest V3 Extension', detail: 'Service worker interception with zero-history permissions' },
      ],
    },
  ];

  stackCategories.forEach((cat, idx) => {
    const xPos = 0.8 + idx * 3.9;
    s.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.8,
      w: 3.7,
      h: 4.8,
      rectRadius: 0.15,
      fill: { color: C.bgCard },
      line: { color: C.border, width: 1 },
    });

    s.addText(cat.title, {
      x: xPos + 0.3,
      y: 2.1,
      w: 3.1,
      h: 0.35,
      fontSize: 10,
      fontFace: 'Arial',
      color: C.accentLavender,
      bold: true,
    });

    cat.techs.forEach((t, tIdx) => {
      const tY = 2.6 + tIdx * 1.35;
      s.addText(t.name, {
        x: xPos + 0.3,
        y: tY,
        w: 3.1,
        h: 0.35,
        fontSize: 12,
        fontFace: 'Arial',
        color: C.textMain,
        bold: true,
      });
      s.addText(t.detail, {
        x: xPos + 0.3,
        y: tY + 0.35,
        w: 3.1,
        h: 0.8,
        fontSize: 9.5,
        fontFace: 'Arial',
        color: C.textMuted,
        lineSpacing: 14,
      });
    });
  });
}

// =========================================================================
// SLIDE 5: How It Works: Pipeline Flow
// =========================================================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, 'End-to-End Threat Inspection Lifecycle', 'Forensic Workflow');

  const steps = [
    { num: 'STEP 1', title: 'Target Submission', desc: 'User pastes suspicious link, SMS snippet, phone number, or drops a file.' },
    { num: 'STEP 2', title: 'Client-Side Redactor', desc: 'Pre-flight parser detects and replaces sensitive identifiers (Aadhaar, PAN, UPI).' },
    { num: 'STEP 3', title: 'Anti-SSRF IP Filter', desc: 'Inspects host against loopbacks, 0x7f, octal, Carrier-Grade NAT, and metadata IPs.' },
    { num: 'STEP 4', title: 'Multi-Engine Consensus', desc: 'Runs local regex patterns, queries VirusTotal 70+ AVs, and checks typosquatting.' },
    { num: 'STEP 5', title: 'Section 5 Contract Verdict', desc: 'Outputs standard schema: status, category, evidence, limitations, and actions.' },
  ];

  steps.forEach((st, idx) => {
    const xPos = 0.8 + idx * 2.35;
    s.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 2.2,
      w: 2.2,
      h: 4.2,
      rectRadius: 0.12,
      fill: { color: C.bgCard },
      line: { color: idx === 4 ? C.accentPurple : C.border, width: 1.5 },
    });

    s.addText(st.num, {
      x: xPos + 0.2,
      y: 2.45,
      w: 1.8,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: C.accentLavender,
      bold: true,
    });

    s.addText(st.title, {
      x: xPos + 0.2,
      y: 2.85,
      w: 1.8,
      h: 0.7,
      fontSize: 13,
      fontFace: 'Arial',
      color: C.textMain,
      bold: true,
    });

    s.addText(st.desc, {
      x: xPos + 0.2,
      y: 3.7,
      w: 1.8,
      h: 2.4,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: C.textMuted,
      lineSpacing: 14,
    });
  });
}

// =========================================================================
// SLIDE 6: India Trust Suite: 1.4 Billion Protection
// =========================================================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, 'India Trust Suite: Designed for Mass Adoption', 'Regionalized Digital Protection');

  const indiaFeatures = [
    {
      title: 'Emergency 1930 Golden Hour Mode',
      desc: 'Rapid financial loss intervention flow providing a step-by-step checklist, direct dial to National Cyber Crime Reporting Portal (1930), and an auto-drafted dispute letter for bank branch managers.',
      badge: 'FINANCIAL INTERVENTION',
    },
    {
      title: 'DPDP Act 2023 Compliance Toolkit',
      desc: 'Empowers Indian citizens with automated consent withdrawal notices, right-to-erasure legal request templates, and app privacy risk scores assessing permissions before installing APKs.',
      badge: 'LEGAL RIGHTS AUTOMATION',
    },
    {
      title: 'Elder Mode & Bilingual Architecture',
      desc: 'One-click toggle converts the UI to high-contrast large fonts with plain-language explanations in Hindi and English, ensuring seniors and first-time digital citizens are protected.',
      badge: 'INCLUSIVE ACCESSIBILITY',
    },
    {
      title: 'K-Anonymity Data Breach Checker',
      desc: 'Queries breach databases using 5-character SHA-1 password prefixes so sensitive credentials never leave the user browser while alerting on compromised phone numbers and emails.',
      badge: 'ZERO-LEAK CREDENTIAL AUDIT',
    },
  ];

  indiaFeatures.forEach((feat, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    const xPos = 0.8 + col * 5.9;
    const yPos = 1.8 + row * 2.5;

    s.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: yPos,
      w: 5.7,
      h: 2.2,
      rectRadius: 0.15,
      fill: { color: C.bgCard },
      line: { color: C.border, width: 1 },
    });

    s.addText(feat.badge, {
      x: xPos + 0.3,
      y: yPos + 0.2,
      w: 5.1,
      h: 0.25,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: C.accentLavender,
      bold: true,
    });

    s.addText(feat.title, {
      x: xPos + 0.3,
      y: yPos + 0.5,
      w: 5.1,
      h: 0.4,
      fontSize: 14,
      fontFace: 'Arial',
      color: C.textMain,
      bold: true,
    });

    s.addText(feat.desc, {
      x: xPos + 0.3,
      y: yPos + 0.95,
      w: 5.1,
      h: 1.1,
      fontSize: 10,
      fontFace: 'Arial',
      color: C.textMuted,
      lineSpacing: 15,
    });
  });
}

// =========================================================================
// SLIDE 7: Cyber Analytics Dashboard
// =========================================================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, 'Cyber Analytics Dashboard: Visual Design & Telemetry', 'Production Glassmorphism UI');

  // Left explanation
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.8,
    w: 5.7,
    h: 4.8,
    rectRadius: 0.15,
    fill: { color: C.bgCard },
    line: { color: C.border, width: 1 },
  });

  s.addText('AESTHETIC & INTERACTION SYSTEM', {
    x: 1.1,
    y: 2.1,
    w: 5.1,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Arial',
    color: C.accentLavender,
    bold: true,
  });

  s.addText('Pixel-Perfect Cyber Glassmorphism', {
    x: 1.1,
    y: 2.45,
    w: 5.1,
    h: 0.4,
    fontSize: 16,
    fontFace: 'Arial',
    color: C.textMain,
    bold: true,
  });

  const uiPoints = [
    'Deep Obsidian (#07080D) and Card Surface (#10121E) with ambient violet glows.',
    '4 Interactive KPI Cards: Total Users, Revenue Growth (active glowing purple ring), New Subscriptions (grouped bars), Retention Rate (radial arc gauge).',
    'Main Analytics Overview: Interactive dual cubic bezier curves with crosshair guideline, month selection, and series visibility toggles.',
    'Vector Donut Breakdown: Categorizes web exploits, SMS smishing, and malware signatures.',
    'Privacy-Preserving Global Radar: Regional node latency and throughput map (Bengaluru, SF, Frankfurt, Tokyo).',
  ];

  s.addText(uiPoints.map(p => `• ${p}`).join('\n\n'), {
    x: 1.1,
    y: 3.0,
    w: 5.1,
    h: 3.3,
    fontSize: 10,
    fontFace: 'Arial',
    color: C.textMuted,
    lineSpacing: 15,
  });

  // Right card: Technical backend wiring
  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.8,
    y: 1.8,
    w: 5.7,
    h: 4.8,
    rectRadius: 0.15,
    fill: { color: C.bgCard },
    line: { color: C.accentPurple, width: 1.5 },
  });

  s.addText('BACKEND DATA INTEGRATION', {
    x: 7.1,
    y: 2.1,
    w: 5.1,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Arial',
    color: C.accentPurple,
    bold: true,
  });

  s.addText('Real-Time REST Telemetry Endpoint', {
    x: 7.1,
    y: 2.45,
    w: 5.1,
    h: 0.4,
    fontSize: 16,
    fontFace: 'Arial',
    color: C.textMain,
    bold: true,
  });

  const backendPoints = [
    'Route: /api/v1/dashboard/metrics supporting dynamic period parameters (?period=7d|30d|90d|1y).',
    'Calculates baseline growth, percentage changes, sparklines, and time series curves dynamically.',
    'Server-side caching headers: Cache-Control: public, s-maxage=10, stale-while-revalidate=30.',
    'Global Search with Ctrl+K shortcut: Instant debounced querying across active security pipelines.',
    'Security Notification Center: Bell flyout with unread count and real-time alert triage.',
  ];

  s.addText(backendPoints.map(p => `• ${p}`).join('\n\n'), {
    x: 7.1,
    y: 3.0,
    w: 5.1,
    h: 3.3,
    fontSize: 10,
    fontFace: 'Arial',
    color: C.textMuted,
    lineSpacing: 15,
  });
}

// =========================================================================
// SLIDE 8: Specialized Forensic Engines Deep-Dive
// =========================================================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, 'Deep-Dive: Modular Forensic Inspection Engines', 'Forensic Capabilities');

  const engines = [
    {
      name: 'Message Inspector',
      endpoint: '/api/v1/scans/messages',
      desc: 'Detects artificial urgency, fear-based extortion, fake KYC demands, and credential harvesting traps. Displays before/after PII diff views.',
    },
    {
      name: 'URL Deep Inspector',
      endpoint: '/api/v1/scans/urls',
      desc: 'Anti-SSRF IP verification, brand lookalike typosquatting (Levenshtein distance), and VirusTotal 70+ AV engine scan telemetry.',
    },
    {
      name: 'File Integrity Engine',
      endpoint: '/api/v1/files/hash',
      desc: 'Computes SHA-256 and SHA-512 checksums 100% in-browser via Web Crypto API. Cross-references known good publisher hashes without file transfer.',
    },
    {
      name: 'Claim Verifier',
      endpoint: '/api/v1/claims/verify',
      desc: 'Misinformation triage isolating sensational conspiracy rhetoric from factual propositions, citing reputable fact-checking archives.',
    },
  ];

  engines.forEach((eng, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    const xPos = 0.8 + col * 5.9;
    const yPos = 1.8 + row * 2.5;

    s.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: yPos,
      w: 5.7,
      h: 2.2,
      rectRadius: 0.15,
      fill: { color: C.bgCard },
      line: { color: C.border, width: 1 },
    });

    s.addText(eng.name, {
      x: xPos + 0.3,
      y: yPos + 0.25,
      w: 3.5,
      h: 0.35,
      fontSize: 14,
      fontFace: 'Arial',
      color: C.textMain,
      bold: true,
    });

    s.addText(eng.endpoint, {
      x: xPos + 0.3,
      y: yPos + 0.65,
      w: 5.1,
      h: 0.25,
      fontSize: 9,
      fontFace: 'Courier New',
      color: C.accentLavender,
    });

    s.addText(eng.desc, {
      x: xPos + 0.3,
      y: yPos + 0.95,
      w: 5.1,
      h: 1.1,
      fontSize: 10,
      fontFace: 'Arial',
      color: C.textMuted,
      lineSpacing: 15,
    });
  });
}

// =========================================================================
// SLIDE 9: Security Audit & Hardening (AIM Findings)
// =========================================================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, 'Security Audit Remediation: Production Hardening', 'Red-Team Validation');

  const aimFindings = [
    { id: 'AIM-001', title: 'Cryptographic JWT Verification', desc: 'Strict HMAC-SHA256 signature checking. Rejects alg: none, forged tokens, and expired timestamps.' },
    { id: 'AIM-002', title: 'Advanced SSRF Validation', desc: 'Decodes decimal, octal, hex (0x7f), and IPv4-mapped IPv6 IPs. Blocks CGNAT (100.64/10) and AWS metadata.' },
    { id: 'AIM-003', title: 'Defensive HTTP Headers', desc: 'Strict Content-Security-Policy (CSP), HSTS (max-age 31536000), frame-ancestors none, and nosniff.' },
    { id: 'AIM-004', title: 'Sensitive PII Redaction', desc: 'Automatic regex scrubbing for 12-digit Aadhaar cards, 10-char PAN cards, and UPI Virtual Payment Addresses.' },
    { id: 'AIM-005', title: 'Model Authority Restriction', desc: 'Cryptographically enfored invariant: AI neural reasoning cannot downgrade high-risk deterministic findings.' },
    { id: 'AIM-006', title: 'Timing-Safe Comparisons', desc: 'crypto.timingSafeEqual on normalized buffers eliminates cryptographic side-channel timing leaks.' },
  ];

  aimFindings.forEach((f, idx) => {
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const xPos = 0.8 + col * 3.9;
    const yPos = 1.8 + row * 2.5;

    s.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: yPos,
      w: 3.7,
      h: 2.2,
      rectRadius: 0.12,
      fill: { color: C.bgCard },
      line: { color: C.border, width: 1 },
    });

    s.addText(f.id, {
      x: xPos + 0.25,
      y: yPos + 0.2,
      w: 3.2,
      h: 0.25,
      fontSize: 9,
      fontFace: 'Arial',
      color: C.emerald,
      bold: true,
    });

    s.addText(f.title, {
      x: xPos + 0.25,
      y: yPos + 0.5,
      w: 3.2,
      h: 0.45,
      fontSize: 12,
      fontFace: 'Arial',
      color: C.textMain,
      bold: true,
    });

    s.addText(f.desc, {
      x: xPos + 0.25,
      y: yPos + 1.0,
      w: 3.2,
      h: 1.05,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: C.textMuted,
      lineSpacing: 14,
    });
  });
}

// =========================================================================
// SLIDE 10: Performance, Verification & Testing Metrics
// =========================================================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, 'Rigorous Testing & Performance Verification', 'Production Metrics');

  const metrics = [
    { num: '105 / 105', label: 'Unit & Regression Tests', sub: 'Zero failures across 46 test suites in 591ms' },
    { num: '11 / 11', label: 'Live API E2E Checks', sub: 'Health, Anti-SSRF, VT v3, PII, and Dossiers passing' },
    { num: '294ms', label: 'Server Startup', sub: 'Next.js Turbopack sub-second boot time' },
    { num: '25 Routes', label: 'Production Compiles', sub: 'Static prefetching and dynamic API gateway routes' },
  ];

  metrics.forEach((m, idx) => {
    const xPos = 0.8 + idx * 2.9;
    s.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.8,
      w: 2.7,
      h: 1.8,
      rectRadius: 0.15,
      fill: { color: C.bgCard },
      line: { color: C.accentPurple, width: 1.5 },
    });

    s.addText(m.num, {
      x: xPos + 0.2,
      y: 2.1,
      w: 2.3,
      h: 0.55,
      fontSize: 24,
      fontFace: 'Arial',
      color: C.accentLavender,
      bold: true,
      align: 'center',
    });

    s.addText(m.label, {
      x: xPos + 0.2,
      y: 2.7,
      w: 2.3,
      h: 0.35,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: C.textMain,
      bold: true,
      align: 'center',
    });

    s.addText(m.sub, {
      x: xPos + 0.2,
      y: 3.05,
      w: 2.3,
      h: 0.45,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: C.textMuted,
      align: 'center',
    });
  });

  // Lower verification table
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 4.0,
    w: 11.7,
    h: 2.6,
    rectRadius: 0.15,
    fill: { color: C.bgCard },
    line: { color: C.border, width: 1 },
  });

  s.addText('CONTINUOUS INTEGRATION & VERIFICATION PIPELINE', {
    x: 1.1,
    y: 4.25,
    w: 11.0,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Arial',
    color: C.emerald,
    bold: true,
  });

  const ciItems = [
    'Automated Playwright & Node test runner executes in isolated environments with synthetic attack vectors.',
    'Anti-tamper cryptographic seals applied to all generated incident dossiers.',
    'Pre-flight GitHub Actions checks enforce zero API key leaks in commits or client bundles.',
    'Vercel Edge/Serverless deployment provides globally distributed edge caching and DDoS mitigation.',
  ];

  s.addText(ciItems.map(item => `✔ ${item}`).join('\n\n'), {
    x: 1.1,
    y: 4.65,
    w: 11.0,
    h: 1.8,
    fontSize: 10.5,
    fontFace: 'Arial',
    color: C.textMuted,
    lineSpacing: 16,
  });
}

// =========================================================================
// SLIDE 11: Live Deployment & Access Architecture
// =========================================================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, 'Live Global Deployment on Vercel', 'Production Infrastructure');

  const deployments = [
    {
      title: 'Global Production URL',
      url: 'https://ai-protector.vercel.app',
      desc: 'Worldwide edge availability with automatic HTTPS and HTTP/2 multiplexing.',
      badge: 'MAIN SUITE',
    },
    {
      title: 'Cyber Analytics Dashboard',
      url: 'https://ai-protector.vercel.app/dashboard',
      desc: 'Dedicated dark SaaS overview, KPI cards, interactive crosshairs, and radar telemetry.',
      badge: 'ANALYTICS',
    },
    {
      title: 'GitHub Open Source Repository',
      url: 'https://github.com/sanyamvij-lab/ai-agent-protector',
      desc: 'Complete codebase, CI workflows, security audit reports, and test suites.',
      badge: 'VERSION CONTROL',
    },
  ];

  deployments.forEach((d, idx) => {
    const xPos = 0.8 + idx * 3.9;
    s.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.8,
      w: 3.7,
      h: 4.8,
      rectRadius: 0.15,
      fill: { color: C.bgCard },
      line: { color: C.border, width: 1 },
    });

    s.addText(d.badge, {
      x: xPos + 0.3,
      y: 2.1,
      w: 3.1,
      h: 0.25,
      fontSize: 9,
      fontFace: 'Arial',
      color: C.accentLavender,
      bold: true,
    });

    s.addText(d.title, {
      x: xPos + 0.3,
      y: 2.45,
      w: 3.1,
      h: 0.6,
      fontSize: 16,
      fontFace: 'Arial',
      color: C.textMain,
      bold: true,
    });

    s.addText(d.url, {
      x: xPos + 0.3,
      y: 3.1,
      w: 3.1,
      h: 0.5,
      fontSize: 9.5,
      fontFace: 'Courier New',
      color: C.accentPurple,
      bold: true,
    });

    s.addText(d.desc, {
      x: xPos + 0.3,
      y: 3.7,
      w: 3.1,
      h: 2.5,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: C.textMuted,
      lineSpacing: 16,
    });
  });
}

// =========================================================================
// SLIDE 12: Future Roadmap & Vision
// =========================================================================
{
  const s = pptx.addSlide();
  addSlideHeader(s, 'Future Roadmap & Strategic Vision', 'Phase Horizon');

  const roadmap = [
    { phase: 'PHASE 5', title: 'Worker Sandbox & YARA-X', desc: 'Isolated Python scan worker executing YARA-X signatures for zero-day binary analysis.' },
    { phase: 'PHASE 6', title: 'OpenSSF Scorecard', desc: 'Automated CI/CD supply-chain trust scoring across dependencies and GitHub repositories.' },
    { phase: 'PHASE 7', title: 'Agent Component Check', desc: 'Static analysis for autonomous AI agents, tool manifests, and MCP server permissions.' },
    { phase: 'PHASE 8', title: 'Decentralized Threat Feed', desc: 'Zero-knowledge shared threat registry preventing phishing reuse without data exposure.' },
  ];

  roadmap.forEach((r, idx) => {
    const xPos = 0.8 + idx * 2.9;
    s.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 2.0,
      w: 2.7,
      h: 4.4,
      rectRadius: 0.15,
      fill: { color: C.bgCard },
      line: { color: idx === 0 ? C.accentPurple : C.border, width: 1.5 },
    });

    s.addText(r.phase, {
      x: xPos + 0.25,
      y: 2.3,
      w: 2.2,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: C.accentLavender,
      bold: true,
    });

    s.addText(r.title, {
      x: xPos + 0.25,
      y: 2.7,
      w: 2.2,
      h: 0.6,
      fontSize: 14,
      fontFace: 'Arial',
      color: C.textMain,
      bold: true,
    });

    s.addText(r.desc, {
      x: xPos + 0.25,
      y: 3.4,
      w: 2.2,
      h: 2.7,
      fontSize: 10,
      fontFace: 'Arial',
      color: C.textMuted,
      lineSpacing: 15,
    });
  });
}

// Ensure public directory exists
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate the file
const outputPath = path.join(publicDir, 'AI_Protector_Executive_Tech_Deck.pptx');
pptx
  .writeFile({ fileName: outputPath })
  .then((fileName) => {
    console.log(`Successfully generated executive presentation at: ${fileName}`);
  })
  .catch((err) => {
    console.error('Failed to generate presentation:', err);
    process.exit(1);
  });
