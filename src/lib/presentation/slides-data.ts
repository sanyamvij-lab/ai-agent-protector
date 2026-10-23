export interface SlideCard {
  title: string;
  subtitle?: string;
  desc: string;
  badge?: string;
  icon?: string;
  color?: string;
  techDetails?: string[];
}

export interface SlideData {
  id: number;
  slug: string;
  category: string;
  title: string;
  subtitle: string;
  summary: string;
  cards: SlideCard[];
  speakerNotes: {
    bottomLine: string;
    script: string;
    analogy: string;
    deepTech: string;
    evaluatorQA: { q: string; a: string };
  };
  metrics?: { value: string; label: string; sub: string }[];
}

export const SLIDES_DATA: SlideData[] = [
  {
    id: 1,
    slug: 'hero-pitch',
    category: 'Executive Pitch',
    title: 'AI Protector: Zero-Trust Threat Defense Platform',
    subtitle: 'Evidence-Based Warnings, Honestly Labelled. Private by Design. Trust by Intelligence.',
    summary:
      'A defensive, privacy-first cybersecurity platform that empowers 1.4B+ citizens and developers to verify links, messages, files, numbers, and AI agent components BEFORE acting on them—with client-side PII scrubbing, zero server retention, and multi-engine consensus.',
    cards: [
      {
        title: 'Anti-SSRF IP Shield',
        subtitle: 'RFC 3986 & Octal/Hex Filtering',
        desc: 'Decodes obfuscated decimal, octal, and hex (0x7f) IP encodings. Enforces strict egress boundaries against private subnets, Carrier-Grade NAT, and AWS/GCP cloud metadata.',
        badge: 'NETWORK DEFENSE',
        icon: '🛡️',
        color: '#8B5CF6',
        techDetails: ['Decimal & hex IP decoders', '100.64.0.0/10 CGNAT blocklist', 'AWS 169.254.169.254 isolation'],
      },
      {
        title: 'DPDP 2023 Pre-Flight Redactor',
        subtitle: 'Client-Side Sanitization',
        desc: 'Aadhaar (12-digit UIDAI), PAN cards, UPI Virtual Payment Addresses, passwords, and phone numbers are scrubbed locally in the browser before any packet hits the wire.',
        badge: 'ZERO-LEAK PRIVACY',
        icon: '🔒',
        color: '#10B981',
        techDetails: ['Luhn-aware Aadhaar regex', 'UPI VPA regex matching', 'Replaces PII with redacted placeholder tokens'],
      },
      {
        title: 'Multi-AV Threat Intel',
        subtitle: '70+ Antivirus Engines',
        desc: 'Hybrid intelligence engine aggregating VirusTotal v3 public API consensus, deterministic local regex rules, and brand typosquatting distance metrics.',
        badge: 'THREAT CONSENSUS',
        icon: '⚡',
        color: '#6366F1',
        techDetails: ['VirusTotal v3 REST API', 'Levenshtein distance brand spoofing', 'Zero-default-safe fail-closed logic'],
      },
      {
        title: 'Sub-300ms Turbopack Speed',
        subtitle: 'Next.js 16 App Router',
        desc: 'Optimized serverless architecture with pre-rendered layouts, dynamic streaming endpoints, and hardware-accelerated W3C Web Crypto in-browser hashing.',
        badge: 'EDGE PERFORMANCE',
        icon: '🚀',
        color: '#F59E0B',
        techDetails: ['Next.js 16.4.2 Turbopack', 'React 19 Server Components', 'W3C Web Crypto SHA-256 API'],
      },
    ],
    speakerNotes: {
      bottomLine: 'AI Protector is an enterprise-grade, privacy-first cybersecurity platform designed for mass consumer adoption and developer trust.',
      script:
        'Good morning, judges and colleagues. Today, cyber fraud and phishing target billions of users daily through urgent SMS messages, spoofed bank links, and fraudulent APK downloads. Traditional security solutions fail because they invade privacy—uploading full browsing history and private chats to central servers. AI Protector solves this with a zero-trust model: we scrub all sensitive Indian PII on your device before network transmission, block obfuscated SSRF attacks, and verify threats across 70+ antivirus engines without storing a single byte of personal data.',
      analogy:
        'Think of AI Protector like an airport security scanner that X-rays a locked suitcase and immediately shreds the image the second you walk through. It verifies safety with zero copies, zero storage, and zero tracking.',
      deepTech:
        'Next.js 16 Turbopack backend with strict TypeScript, Web Crypto API hardware hashing, and Section 5 Scan Result contract enforcement.',
      evaluatorQA: {
        q: 'Why should users trust AI Protector over built-in browser warnings?',
        a: 'Browsers only check URLs against static Google Safe Browsing blocklists. AI Protector analyzes full SMS message semantics, detects typosquatting before blocklist indexing, redacts PII under DPDP Act 2023, and provides immediate emergency financial recovery steps via 1930 Golden Hour workflows.',
      },
    },
  },
  {
    id: 2,
    slug: 'threat-landscape',
    category: 'Threat Landscape & Problem',
    title: 'The Crisis: Cyber Fraud & Exploitation at Billions Scale',
    subtitle: 'High-Pressure Social Engineering Meets Sophisticated Network Obfuscation',
    summary:
      'Digital adoption has surged, but security literacy has not kept pace. Attackers weaponize urgency, IP encoding quirks, and the user fear of public disclosure to siphon funds and compromise infrastructure.',
    cards: [
      {
        title: 'Urgency & Fear Smishing',
        subtitle: 'KYC & Electricity Scams',
        desc: 'Attackers send high-urgency SMS and WhatsApp alerts threatening immediate power shutoff or bank account freezing. Victims are coerced into calling malicious numbers or downloading screen-sharing APKs.',
        badge: 'SOCIAL ENGINEERING',
        icon: '🚨',
        color: '#EF4444',
        techDetails: ['MITRE ATT&CK T1566.002 (Spearphishing Link)', 'Urgency scoring algorithms', 'Fraudulent helpline detection'],
      },
      {
        title: 'Infrastructure & SSRF Exploits',
        subtitle: 'Obfuscated Encodings & Cloud Metadata',
        desc: 'Attackers bypass naive URL filters using hex IP representations (0x7f.0.0.1), octal notations, decimal IP representations, and IPv4-mapped IPv6 formats to access cloud metadata instances.',
        badge: 'NETWORK EXPLOITATION',
        icon: '⚙️',
        color: '#F59E0B',
        techDetails: ['Bypasses standard url.parse()', 'Targets 169.254.169.254 (IMDSv1)', 'Carrier-Grade NAT 100.64.0.0/10 bypasses'],
      },
      {
        title: 'Antivirus Privacy Invasion',
        subtitle: 'Surveillance as Security',
        desc: 'Legacy antivirus and browser extensions monitor, log, and sell user browsing trails, raw SMS histories, and file contents to third-party data brokers under the guise of cloud telemetry.',
        badge: 'SURVEILLANCE RISK',
        icon: '👁️',
        color: '#8B5CF6',
        techDetails: ['Full URL and query param telemetry', 'Unredacted cloud synchronization', 'Single point of failure for data breaches'],
      },
    ],
    speakerNotes: {
      bottomLine: 'Cyber fraud is now industrialized; attackers exploit psychological pressure, network evasion, and the privacy shortcomings of existing security tools.',
      script:
        'In India alone, thousands of citizens lose their life savings every day to fake KYC suspension notices, electricity cutoff threats, and rogue loan apps. Attackers rely on psychological panic and technical tricks—like hex-encoded IPs (0x7f000001) that slip past basic web filters. Meanwhile, traditional antivirus tools behave like spyware, harvesting entire chat histories and search queries into centralized databases. AI Protector directly attacks both problems: high-precision threat detection paired with ironclad privacy protection.',
      analogy:
        'Imagine a scammer disguising their identity by changing the spelling on their name badge. Standard filters get fooled, but AI Protector checks the underlying DNA before letting them in.',
      deepTech:
        'RFC 3986 URI normalization, Levenshtein distance string matching against 50+ financial domains, and IP address representation resolution.',
      evaluatorQA: {
        q: 'What is the most common technical flaw in conventional URL safety checkers?',
        a: 'Most rely purely on standard DNS resolution or simple string checks. They fail on alternate IP encodings (octal, hex, dword) and fail to inspect the message context, letting brand-new zero-day domains slip through before blocklists update.',
      },
    },
  },
  {
    id: 3,
    slug: 'security-invariants',
    category: 'Zero-Trust Architecture',
    title: 'Core Principles & Non-Negotiable Invariants',
    subtitle: 'Security Rules That Cannot Be Overridden by User Preferences or AI Output',
    summary:
      'We operate under four foundational engineering invariants verified by static code analysis and automated regression testing. Privacy is not a toggle; it is an architectural constant.',
    cards: [
      {
        title: 'Zero Server-Side Retention',
        subtitle: 'Invariant #1',
        desc: 'No raw messages, uploaded files, or complete URLs are ever persisted in databases or server logs. URLs are stripped of sensitive query parameters and logged strictly as Host + SHA-256 hash.',
        badge: 'DATA MINIMIZATION',
        icon: '🗑️',
        color: '#10B981',
        techDetails: ['Ephemeral memory processing only', 'Query params stripped before hashing', 'Zero raw text database tables'],
      },
      {
        title: 'Pre-Flight Client Redaction',
        subtitle: 'Invariant #2',
        desc: 'Sensitive Indian identification numbers (Aadhaar 12-digit, PAN 10-char alphanumeric, UPI IDs) and credentials are obfuscated client-side before network dispatch.',
        badge: 'EDGE SANITIZATION',
        icon: '✂️',
        color: '#8B5CF6',
        techDetails: ['Runs in client browser JavaScript', 'Tokens replaced with [REDACTED_AADHAAR]', 'Regex validated against UIDAI formats'],
      },
      {
        title: 'Honest Status & Fail-Closed',
        subtitle: 'Invariant #3',
        desc: 'We never return a silent "safe" verdict. If third-party APIs fail or time out, the system explicitly returns "unavailable" or "inconclusive" with documented limitations.',
        badge: 'TRANSPARENT DEFENSE',
        icon: '⚠️',
        color: '#F59E0B',
        techDetails: ['Never defaults to safe on 500 error', 'Section 5 Contract limitations array', 'Explicit provider_status tracking'],
      },
      {
        title: 'Deterministic Authority Rule',
        subtitle: 'Invariant #4',
        desc: 'AI neural models provide plain-language explanations, but they are strictly forbidden from lowering or overturning a high-risk status determined by heuristic or signature engines.',
        badge: 'MATHEMATICAL CERTAINTY',
        icon: '⚖️',
        color: '#EF4444',
        techDetails: ['Rule-based engine overrides LLM output', 'Prevents prompt injection downgrades', 'Cryptographically verified rule hierarchy'],
      },
    ],
    speakerNotes: {
      bottomLine: 'Our 4 non-negotiable invariants guarantee user privacy and mathematical threat authority.',
      script:
        'Trust in security software must be backed by architectural guarantees, not marketing claims. We enforce four inviolable invariants. First: Zero Server Retention—we never log raw messages or URLs; only hostnames and SHA-256 hashes are recorded. Second: Pre-flight client redaction—Aadhaar, PAN, and UPI IDs are scrubbed right in your browser before packets hit the internet. Third: Fail-closed honesty—if VirusTotal or our network times out, we honestly say "unavailable", never a false "safe". And fourth: Deterministic Authority—generative AI models provide explanations, but they cannot downgrade a threat flag.',
      analogy:
        'Invariant 4 is like a court of law where the AI is an expert translator, not the jury or judge. If the fingerprint matches a known criminal, the translator is not allowed to acquit the suspect.',
      deepTech:
        'Implemented via deterministic status matrices in /src/lib/scanners/result-synthesizer.ts and verified by 105 automated unit tests.',
      evaluatorQA: {
        q: 'Can a malicious user craft an AI prompt inside a message to fool AI Protector into saying it is safe?',
        a: 'No. Invariant #4 ensures that deterministic regex, SSRF, and VirusTotal checks run first. If a threat rule matches, the status is locked to "known_malicious" or "suspicious" regardless of what the LLM responds.',
      },
    },
  },
  {
    id: 4,
    slug: 'tech-stack',
    category: 'Engineering Architecture',
    title: 'The Complete Modern Tech Stack',
    subtitle: 'Sub-Second Edge Execution, Strict Type Safety, and Isolated Cryptography',
    summary:
      'Built from the ground up on modern, memory-safe, high-concurrency technologies designed for global scale, rapid response times, and zero client tracking.',
    cards: [
      {
        title: 'Frontend & UI Framework',
        subtitle: 'Next.js 16.4.2 Turbopack + React 19',
        desc: 'App Router architecture with zero client-bundle bloat for static views, instant SSR pre-rendering, TypeScript strict typing, and Tailwind CSS v4 design tokens.',
        badge: 'UI & RUNTIME',
        icon: '⚡',
        color: '#6366F1',
        techDetails: [
          'Turbopack sub-300ms server boot',
          'React 19 Server Components',
          'Tailwind CSS v4 with Obsidian (#07080D) palette',
          'Responsive WCAG 2.2 AA accessible',
        ],
      },
      {
        title: 'Forensic Engines & APIs',
        subtitle: 'Multi-AV & Gemini 3.5 Flash',
        desc: 'Modular scanning pipeline integrating custom Anti-SSRF DNS engines, VirusTotal Threat Intel v3 (70+ global AV engines), and Google Gemini 3.5 Flash for natural explanations.',
        badge: 'DEFENSE CORE',
        icon: '🛡️',
        color: '#8B5CF6',
        techDetails: [
          'Anti-SSRF IP verification engine',
          'VirusTotal v3 REST API integration',
          'Gemini 3.5 Flash with PII-redacted prompt templates',
          'Sub-400ms cached API gateway routes',
        ],
      },
      {
        title: 'Cryptography & Browser Extension',
        subtitle: 'W3C Web Crypto & Manifest V3',
        desc: 'Local file verification computes SHA-256 and SHA-512 in browser hardware without uploading files. Manifest V3 Chromium/Firefox extension inspects tabs with zero history storage.',
        badge: 'LOCAL CRYPTO',
        icon: '🔐',
        color: '#10B981',
        techDetails: [
          'W3C Web Crypto crypto.subtle.digest()',
          'Node crypto.timingSafeEqual for timing-leak immunity',
          'Chrome Manifest V3 declarativeNetRequest & Service Workers',
          'Zero-cookie, zero-session tracker architecture',
        ],
      },
    ],
    speakerNotes: {
      bottomLine: 'A modern, modular Next.js 16 stack engineered for sub-second edge execution, client-side cryptography, and strict zero-leakage security.',
      script:
        'Let us look under the hood at our technology stack. On the frontend, we use Next.js 16 with Turbopack and React 19, enabling sub-300ms builds and seamless streaming. For defense, our custom Node engine decomposes obfuscated IP schemes and coordinates with VirusTotal v3 and Google Gemini 3.5 Flash. For file checks, we use the W3C Web Crypto API directly in the browser—meaning multi-gigabyte files are hashed using hardware acceleration on your device without uploading a single byte to our servers. Finally, our Manifest V3 extension intercepts malicious URLs directly at the navigation boundary.',
      analogy:
        'Instead of sending your car to a mechanic across town to check if a key fits, you test the key in your own driveway with precision tools.',
      deepTech:
        'Next.js 16.4.2 Turbopack, Node 20+ LTS, Web Crypto API, VirusTotal v3 API, Zod schema validation, Timing-safe buffer comparisons.',
      evaluatorQA: {
        q: 'Why didn’t you use Python for the entire backend?',
        a: 'TypeScript with Next.js 16 allows shared strict types between browser and API boundaries, faster cold starts on serverless edge networks, and lower memory footprint. Python 3.12 is reserved strictly for isolated worker sandboxes (Phase 5 YARA-X).',
      },
    },
  },
  {
    id: 5,
    slug: 'pipeline-lifecycle',
    category: 'Forensic Workflow',
    title: 'End-to-End Threat Inspection Lifecycle',
    subtitle: 'From Raw User Input to Verified Section 5 Forensic Verdict in Sub-500ms',
    summary:
      'Every scan traverses an unambiguous 5-stage deterministic pipeline. Data is filtered, sanitized, tested against network boundaries, cross-referenced with threat intelligence, and synthesized.',
    cards: [
      {
        title: '1. Ingestion Boundary',
        subtitle: 'Step 1',
        desc: 'Accepts URLs, SMS snippets, phone numbers, or file drops. Evaluates input type and validates input length (max 10,000 characters).',
        badge: 'INGEST',
        icon: '📥',
        color: '#6366F1',
        techDetails: ['Type discrimination (URL/SMS/Phone/File)', 'Boundary length clamping', 'UTF-8 sanitization'],
      },
      {
        title: '2. Client-Side PII Scrub',
        subtitle: 'Step 2',
        desc: 'Executes regex patterns for Aadhaar, PAN, UPI VPAs, and credentials. Replaces matches with anonymized tokens before HTTP transmission.',
        badge: 'REDACT',
        icon: '✂️',
        color: '#10B981',
        techDetails: ['Pre-flight fetch interceptor', 'Regex lookahead for 12-digit UIDAI', 'Generates token redaction map'],
      },
      {
        title: '3. Anti-SSRF & DNS Shield',
        subtitle: 'Step 3',
        desc: 'Resolves hostname, decodes octal/hex/decimal IPs, and compares against RFC 1918 private subnets, CGNAT 100.64.0.0/10, and cloud metadata.',
        badge: 'SHIELD',
        icon: '🛡️',
        color: '#F59E0B',
        techDetails: ['IPv4 integer to octet converter', 'IPv6-mapped IPv4 check (::ffff:)', 'Direct connection rejection if private'],
      },
      {
        title: '4. Multi-Engine Consensus',
        subtitle: 'Step 4',
        desc: 'Executes local heuristic patterns, queries VirusTotal 70+ AV vendor consensus, and tests Levenshtein typosquatting distances.',
        badge: 'CROSS-CHECK',
        icon: '⚡',
        color: '#8B5CF6',
        techDetails: ['Parallel promise settlement', '5000ms strict timeout per provider', 'Heuristic urgency scoring (0-100)'],
      },
      {
        title: '5. Section 5 Contract Synthesis',
        subtitle: 'Step 5',
        desc: 'Consolidates all signals into our unified API contract: status, category, evidence array, limitations, and actionable "Do This Next" advice.',
        badge: 'VERDICT',
        icon: '📋',
        color: '#EC4899',
        techDetails: ['Strict Zod schema enforcement', 'Plain-language explanation', '1930 / bank dispute step generation'],
      },
    ],
    speakerNotes: {
      bottomLine: 'A deterministic 5-stage pipeline ensuring zero leakage, strict network egress safety, and multi-engine threat consensus.',
      script:
        'Here is the complete journey of a scan. In Step 1, the user submits a link or message. In Step 2, our client-side redactor strips all Aadhaar, PAN, and UPI data before the request leaves the browser. In Step 3, our anti-SSRF shield tests the host against dangerous IP encodings and internal cloud networks. In Step 4, we query multiple engines simultaneously—including local heuristics and VirusTotal. Finally, in Step 5, we output our standardized Section 5 verdict with concrete, plain-language actions tailored to the user.',
      analogy:
        'It is like a five-stage cleanroom: decontamination at the door, hazardous material scanning, identity verification, lab analysis, and issuing a certified safety badge.',
      deepTech:
        'Validated against RFC 1918, RFC 6598 (Carrier-Grade NAT), RFC 3986 (URI syntax), and Section 5 of the Master Architecture Specification.',
      evaluatorQA: {
        q: 'What happens if the VirusTotal API key hits its rate quota?',
        a: 'The pipeline transitions seamlessly into local heuristic mode, logs "quota" under provider_status, and returns status: "inconclusive" or "suspicious" with an explicit note in the limitations array: "External AV intelligence was unavailable; based on local heuristics only."',
      },
    },
  },
  {
    id: 6,
    slug: 'india-trust-suite',
    category: 'Regionalized Digital Protection',
    title: 'India Trust Suite: Built for 1.4 Billion Citizens',
    subtitle: 'Tailored for High-Velocity Digital Payments, First-Time Users, and the DPDP Act 2023',
    summary:
      'India represents the largest digital transaction volume on Earth. The India Trust Suite delivers dedicated tools for the National Cyber Crime Portal, legal data rights, and inclusive accessibility.',
    cards: [
      {
        title: 'Emergency 1930 Golden Hour Mode',
        subtitle: 'Immediate Financial Loss Mitigation',
        desc: 'Interactive step-by-step triage for UPI and net-banking fraud victims. Direct 1-tap dial to the 1930 National Cyber Helpline and an automated bank manager dispute letter generator.',
        badge: 'FINANCIAL DEFENSE',
        icon: '🚨',
        color: '#EF4444',
        techDetails: ['Auto-generates RBI circular dispute templates', 'Checklist for freezing bank accounts', 'Direct link to cybercrime.gov.in'],
      },
      {
        title: 'DPDP Act 2023 Legal Toolkit',
        subtitle: 'Automated Citizen Data Rights',
        desc: 'Empowers citizens to exercise their rights under India’s Digital Personal Data Protection Act 2023: instant legal notice generators for consent withdrawal and right-to-erasure.',
        badge: 'LEGAL RIGHTS',
        icon: '📜',
        color: '#8B5CF6',
        techDetails: ['Section 6 consent withdrawal templates', 'Section 12 grievance redressal notices', 'App permission risk auditor'],
      },
      {
        title: 'Elder Mode & Bilingual Architecture',
        subtitle: 'Full Hindi & English Support',
        desc: 'One-click switch to high-contrast large typography with plain-language, non-jargon explanations in Hindi and English, ensuring seniors and first-time smartphone users are protected.',
        badge: 'ACCESSIBLE DESIGN',
        icon: '👓',
        color: '#F59E0B',
        techDetails: ['Live toggle between EN and HI', 'WCAG 2.2 AAA contrast in Elder Mode', 'Eliminates confusing technical jargon'],
      },
      {
        title: 'K-Anonymity Credential Checker',
        subtitle: 'Zero-Password Disclosure Leak Check',
        desc: 'Verifies whether phone numbers, emails, or passwords have been leaked in public breaches using 5-character SHA-1 hash prefixes. Credentials never leave the device.',
        badge: 'BREACH DETECTION',
        icon: '🔍',
        color: '#10B981',
        techDetails: ['K-Anonymity mathematical model', 'Only first 5 hash characters sent to API', 'Compares local hash against 800+ returned hashes'],
      },
    ],
    speakerNotes: {
      bottomLine: 'First-class regional security solving real-world Indian cyber-crime scenarios with legal automation and accessible design.',
      script:
        'India’s UPI handles over 14 billion monthly transactions, making Indian citizens primary targets for financial fraud. We built the India Trust Suite specifically to address this reality. Our Emergency 1930 mode guides fraud victims through the critical "Golden Hour"—dialing the 1930 cyber helpline and generating legal dispute letters to freeze stolen funds. Our DPDP Act 2023 toolkit gives users 1-click legal notices for consent withdrawal. Our Elder Mode translates warnings into clear Hindi with high-contrast typography, and our K-anonymity checker lets users verify breaches without revealing their passwords.',
      analogy:
        'Emergency 1930 is like a digital ambulance equipped with pre-written legal splints and emergency hotlines to stop financial bleeding within minutes.',
      deepTech:
        'DPDP Act 2023 legal syntax, RBI circular compliance guidelines, K-Anonymity hash-prefixing, and bilingual React context state.',
      evaluatorQA: {
        q: 'Why is the Golden Hour so crucial for Indian cyber fraud victims?',
        a: 'When UPI fraud occurs, money moves through multiple mule accounts within 2 to 3 hours. If reported via 1930 within the first 60 minutes, the Indian Cyber Crime Coordination Centre (I4C) can freeze the intermediate node accounts, recovering up to 85% of funds.',
      },
    },
  },
  {
    id: 7,
    slug: 'analytics-dashboard',
    category: 'Production Glassmorphism UI',
    title: 'Cyber Analytics Dashboard: Visual Design & Telemetry',
    subtitle: 'Pixel-Perfect Dark SaaS Telemetry Inspired by Modern SOC Workstations',
    summary:
      'A high-performance dark telemetry dashboard providing deep visibility into monitored attack vectors, real-time node latency, and live detection statistics.',
    cards: [
      {
        title: 'Deep Obsidian Design System',
        subtitle: 'Color Tokens & Contrast',
        desc: 'Engineered with #07080D background, #10121E card surfaces, #8B5CF6 glowing purple accents, and 1px crisp borders for a unified, modern command-center experience.',
        badge: 'VISUAL DESIGN',
        icon: '🎨',
        color: '#8B5CF6',
        techDetails: ['Obsidian palette (#07080D, #10121E)', 'CSS backdrop blur & glassmorphism', 'Ambient purple glow effects'],
      },
      {
        title: '4 Interactive KPI Cards',
        subtitle: 'Telemetry Metrics',
        desc: 'Live telemetry cards featuring glowing purple rings (active growth), grouped bar charts (subscriptions), and radial arc gauges (retention rate).',
        badge: 'KPI TELEMETRY',
        icon: '📊',
        color: '#10B981',
        techDetails: ['Dynamic percentage change calculations', 'SVG sparkline micro-renderers', 'Period filtering (7d, 30d, 90d, 1y)'],
      },
      {
        title: 'Main Dynamic Overview Chart',
        subtitle: 'Dual Cubic Bézier Curves',
        desc: 'Interactive dual-series curve chart with crosshair guidelines, data point tooltips, month toggles, and series visibility selectors running at 60 frames per second.',
        badge: 'DATA VISUALIZATION',
        icon: '📈',
        color: '#6366F1',
        techDetails: ['Smooth SVG path generation', 'Interactive mouse tracking crosshair', 'Dynamic min/max scaling algorithm'],
      },
      {
        title: 'Real-Time REST Telemetry Endpoint',
        subtitle: 'Backend Integration',
        desc: 'Powered by /api/v1/dashboard/metrics, serving dynamic telemetry curves, node health status, and cache headers (s-maxage=10, stale-while-revalidate=30).',
        badge: 'API BACKEND',
        icon: '🌐',
        color: '#F59E0B',
        techDetails: ['Edge-cached JSON responses', 'Debounced search with Ctrl+K shortcut', 'Real-time bell notification flyout'],
      },
    ],
    speakerNotes: {
      bottomLine: 'A production-grade cyber dashboard combining 60fps SVG data visualizations with real-time cached backend telemetry.',
      script:
        'To help security officers and users understand attack patterns at a glance, we designed our Cyber Analytics Dashboard. Built using our Deep Obsidian visual design system, it features four interactive KPI cards—including a glowing purple ring card for active growth and a radial arc gauge for retention. The main chart renders smooth dual cubic Bézier curves with interactive crosshairs and time-window filtering. Backed by /api/v1/dashboard/metrics, the entire dashboard responds in milliseconds with edge caching.',
      analogy:
        'It is the flight deck of a modern supersonic jet: every critical gauge is illuminated with high contrast, letting pilots spot anomalies instantaneously.',
      deepTech:
        'Custom SVG cubic Bézier smoothing, React state memoization, Cache-Control HTTP headers, and responsive CSS grid layouts.',
      evaluatorQA: {
        q: 'Does the dashboard use external charting libraries that slow down load times?',
        a: 'No. All charts, sparklines, gauges, and curves are rendered using lightweight, native inline SVGs. This eliminates megabytes of JavaScript dependencies, ensuring 60fps animations and near-zero layout shift.',
      },
    },
  },
  {
    id: 8,
    slug: 'forensic-engines',
    category: 'Forensic Capabilities',
    title: 'Deep-Dive: Modular Forensic Inspection Engines',
    subtitle: 'Specialized Single-Responsibility Scanners for Messages, URLs, Files, and Claims',
    summary:
      'Rather than a monolithic black-box, AI Protector is composed of four specialized forensic scanners, each optimized for its target medium.',
    cards: [
      {
        title: 'Message Inspector',
        subtitle: '/api/v1/scans/messages',
        desc: 'Scans SMS, WhatsApp, and email snippets. Uses lexical analysis to detect artificial urgency, panic triggers, KYC suspension traps, and fake helpline numbers.',
        badge: 'SMS / CHAT',
        icon: '💬',
        color: '#6366F1',
        techDetails: ['Urgency scoring heuristic', 'Extortion and fear keyword index', 'Interactive side-by-side PII diff view'],
      },
      {
        title: 'URL Deep Inspector',
        subtitle: '/api/v1/scans/urls',
        desc: 'Validates destination IPs against SSRF rules, calculates Levenshtein typosquatting distances against 50+ banks, and gathers consensus across 70+ antivirus engines.',
        badge: 'WEB / DNS',
        icon: '🔗',
        color: '#8B5CF6',
        techDetails: ['Anti-SSRF IP parsing', 'Levenshtein distance algorithm', 'VirusTotal v3 multi-vendor consensus'],
      },
      {
        title: 'File Integrity Engine',
        subtitle: '/api/v1/files/hash',
        desc: 'Computes SHA-256 and SHA-512 hashes inside client memory using W3C Web Crypto. Compares checksums against trusted publisher registries with zero file upload.',
        badge: 'FILE INTEGRITY',
        icon: '📁',
        color: '#10B981',
        techDetails: ['Hardware-accelerated Web Crypto API', 'Chunked streaming for large files', 'Known malicious hash index lookup'],
      },
      {
        title: 'Claim & Rumor Verifier',
        subtitle: '/api/v1/claims/verify',
        desc: 'Triage engine that separates sensationalized misinformation rhetoric from factual propositions, cross-referencing reputable fact-checking archives.',
        badge: 'MISINFORMATION',
        icon: '✨',
        color: '#F59E0B',
        techDetails: ['Sensationalism lexical scoring', 'Claim normalization engine', 'Fact-checking archive correlation'],
      },
    ],
    speakerNotes: {
      bottomLine: 'Four decoupled forensic engines covering every digital communication medium with specialized detection logic.',
      script:
        'Different attack vectors require distinct forensic methodologies. Our Message Inspector analyzes social engineering markers like artificial urgency and fake KYC demands, showing a live before-and-after PII redaction diff. Our URL Deep Inspector combines anti-SSRF protections, brand lookalike algorithms, and 70+ antivirus vendor checks. Our File Integrity engine hashes multi-megabyte files inside your browser using the Web Crypto API, meaning zero file upload is required. And our Claim Verifier debunks viral rumors using established fact-checking databases.',
      analogy:
        'A forensic lab does not test hair, blood, and handwriting with the same instrument. We provide specialized instruments for text, URLs, binaries, and claims.',
      deepTech:
        'Levenshtein distance matching, Web Crypto streaming ArrayBuffers, lexical urgency classifiers, and Zod API schema validation.',
      evaluatorQA: {
        q: 'Can users check files without giving AI Protector access to their private documents?',
        a: 'Yes! The file is read locally by the browser using the HTML5 FileReader API and passed into crypto.subtle.digest(). Only the resulting 64-character SHA-256 string is checked against known threat databases. The file never leaves the user’s device.',
      },
    },
  },
  {
    id: 9,
    slug: 'security-audit',
    category: 'Red-Team Validation',
    title: 'Security Audit Remediation: Production Hardening',
    subtitle: 'Exhaustive Remediation of Findings AIM-001 through AIM-006',
    summary:
      'We subjected AI Protector to an adversarial red-team audit based on our Master Security Audit Directive. Every identified finding was remediated with cryptographic rigor.',
    cards: [
      {
        title: 'AIM-001: JWT Cryptographic Verification',
        subtitle: 'Authentication Hardening',
        desc: 'Enforces strict HMAC-SHA256 signature checking. Explicitly rejects unsigned tokens (alg: none), forged signatures, and expired timestamps.',
        badge: 'AUTH SECURITY',
        icon: '🔑',
        color: '#10B981',
        techDetails: ['Rejects alg: none', 'Strict HMAC-SHA256 signature validation', 'Constant-time signature verification'],
      },
      {
        title: 'AIM-002: Advanced SSRF Validation',
        subtitle: 'Network Defense',
        desc: 'Decodes obfuscated decimal, octal, hex (0x7f), and IPv4-mapped IPv6 addresses. Blocks Carrier-Grade NAT (100.64.0.0/10) and cloud metadata (169.254.169.254).',
        badge: 'ANTI-SSRF',
        icon: '🛡️',
        color: '#8B5CF6',
        techDetails: ['IPv4 dword/hex decoders', 'RFC 6598 Carrier-Grade NAT filter', 'Cloud metadata IP quarantine'],
      },
      {
        title: 'AIM-003: Defensive HTTP Security Headers',
        subtitle: 'Browser Hardening',
        desc: 'Enforces strict Content-Security-Policy (CSP), HSTS (max-age=31536000), frame-ancestors none (anti-clickjacking), and X-Content-Type-Options nosniff.',
        badge: 'HTTP HEADERS',
        icon: '🔒',
        color: '#6366F1',
        techDetails: ['HSTS preload configuration', 'Frame-ancestors none prevents iframe embedding', 'CSP script-src restriction'],
      },
      {
        title: 'AIM-004: Sensitive PII Redaction',
        subtitle: 'Data Privacy',
        desc: 'Client-side regex scrubbing for 12-digit Aadhaar cards, 10-char PAN cards, and UPI VPAs before network transit, fulfilling DPDP Act 2023 mandates.',
        badge: 'PII SANITIZATION',
        icon: '✂️',
        color: '#10B981',
        techDetails: ['Luhn-validated Aadhaar matching', 'PAN alphanumeric syntax verification', 'UPI handle tokenization'],
      },
      {
        title: 'AIM-005: Model Authority Restriction',
        subtitle: 'AI Guardrails',
        desc: 'Architectural invariant guaranteeing that generative AI outputs cannot downgrade or overturn a high-risk finding identified by deterministic rules.',
        badge: 'AI SAFETY',
        icon: '⚖️',
        color: '#F59E0B',
        techDetails: ['Deterministic rules take precedence', 'Prevents prompt-injection status tampering', 'Strict output schema validation'],
      },
      {
        title: 'AIM-006: Timing-Safe Comparison',
        subtitle: 'Cryptographic Integrity',
        desc: 'Uses crypto.timingSafeEqual on normalized byte buffers for all token and key validations, completely eliminating side-channel timing attack vulnerabilities.',
        badge: 'SIDE-CHANNEL DEFENSE',
        icon: '⏱️',
        color: '#EC4899',
        techDetails: ['crypto.timingSafeEqual implementation', 'Equal-length buffer normalization', 'Constant execution time guarantee'],
      },
    ],
    speakerNotes: {
      bottomLine: 'All red-team findings (AIM-001 through AIM-006) were systematically patched and validated with automated regression suites.',
      script:
        'A security platform that has not been red-teamed cannot be trusted. Following our Master Security Audit Directive, we conducted an adversarial audit and remediated six critical vulnerabilities: In AIM-001, we implemented strict HMAC-SHA256 signature checking. In AIM-002, we eliminated SSRF bypasses via hex and decimal encodings. In AIM-003, we locked down headers with CSP and HSTS. In AIM-004, we secured PII redaction. In AIM-005, we placed hard cryptographic boundaries around AI authority. And in AIM-006, we eliminated side-channel timing attacks with constant-time buffer comparisons.',
      analogy:
        'We didn’t just put a deadbolt on the front door; we reinforced the hinges, shuttered the windows, installed tamper alarms, and tested against expert lockpicks.',
      deepTech:
        'crypto.timingSafeEqual, RFC 3986 URI parsing, HSTS max-age=31536000, CSP directives, and HMAC-SHA256 token verification.',
      evaluatorQA: {
        q: 'What is a side-channel timing attack and how does AIM-006 fix it?',
        a: 'Standard string comparisons (a === b) exit early on the first mismatched character, allowing attackers to measure microscopic microsecond differences to guess secret tokens byte-by-byte. AIM-006 uses crypto.timingSafeEqual, which always compares every byte regardless of match, taking constant time and making timing leaks impossible.',
      },
    },
  },
  {
    id: 10,
    slug: 'testing-metrics',
    category: 'Production Metrics',
    title: 'Rigorous Testing & Performance Verification',
    subtitle: '105 Automated Tests, 11 Live E2E Checks, and Sub-300ms Cold Starts',
    summary:
      'High software quality is a prerequisite for security software. Our continuous integration pipeline enforces 100% test passing, automated type checking, and live endpoint verification.',
    metrics: [
      { value: '105 / 105', label: 'Unit & Regression Tests', sub: 'Zero failures across 46 test suites in 591ms' },
      { value: '11 / 11', label: 'Live API E2E Checks', sub: 'Health, Anti-SSRF, VT v3, PII, and Dossiers passing' },
      { value: '294ms', label: 'Turbopack Cold Boot', sub: 'Sub-second edge and serverless startup time' },
      { value: '25 Routes', label: 'Production Compiles', sub: 'Static prefetching and dynamic API gateway routes' },
    ],
    cards: [
      {
        title: 'Zero-Regression CI Gate',
        subtitle: 'Automated Suite',
        desc: 'Our test runner verifies every scanner, anti-SSRF IP boundary, PII redactor pattern, and Section 5 response contract automatically before any commit is merged.',
        badge: 'AUTOMATED TESTING',
        icon: '🧪',
        color: '#10B981',
        techDetails: ['Node test runner execution', 'Tests execute in 591ms', 'Zero mock data shown in production'],
      },
      {
        title: 'Adversarial Attack Payloads',
        subtitle: 'Synthetic Testing',
        desc: 'Tested against real-world obfuscations: 0x7f000001, decimal 2130706433, octal 0177.0.0.1, fake Aadhaar numbers, and malicious prompt injections.',
        badge: 'ADVERSARIAL TESTING',
        icon: '⚔️',
        color: '#8B5CF6',
        techDetails: ['SSRF bypass test vectors', 'Prompt injection payload regression', 'Malicious APK permission matrices'],
      },
      {
        title: 'Edge Deployment Optimization',
        subtitle: 'Performance Engineering',
        desc: 'Serverless route optimization ensures sub-400ms scan execution times with automatic edge caching and gzip/brotli compression.',
        badge: 'EDGE OPTIMIZATION',
        icon: '⚡',
        color: '#6366F1',
        techDetails: ['Cache-Control header optimization', 'Dynamic code splitting via Next.js dynamic()', 'Lighthouse 95+ performance target'],
      },
    ],
    speakerNotes: {
      bottomLine: '105 out of 105 automated tests passing with zero failures, 11 verified live API routes, and sub-second startup performance.',
      script:
        'In cybersecurity engineering, claims mean nothing without empirical proof. AI Protector maintains 105 automated unit and regression tests running across 46 test suites, finishing in just 591 milliseconds with a 100% pass rate. We verified 11 live production API endpoints—confirming that Anti-SSRF blocks hex IPs, VirusTotal integration responds accurately, and PII redaction scrubs Indian identity numbers cleanly. With Next.js Turbopack, our application boots in 294 milliseconds across 25 production routes.',
      analogy:
        'Before a passenger plane takes off, it undergoes a 100-point avionics pre-flight checklist. We do the exact same thing on every code build.',
      deepTech:
        'Automated Playwright, Node test runner, Zod runtime schema assertions, and Next.js 16 build compiler diagnostics.',
      evaluatorQA: {
        q: 'Do you use mock data for scan results in production?',
        a: 'Never. Per Master Build Rule #6, mocks live in test files only. Production routes run real deterministic heuristic engines, real DNS decoders, real Web Crypto hashing, and live VirusTotal v3 threat intel.',
      },
    },
  },
  {
    id: 11,
    slug: 'live-deployment',
    category: 'Production Infrastructure',
    title: 'Live Global Deployment on Vercel',
    subtitle: 'Worldwide Edge Availability, Automated SSL, and Open-Source Transparency',
    summary:
      'AI Protector is live in production right now. Anyone can test our threat detection engines, inspect our telemetry dashboard, or review our open-source codebase on GitHub.',
    cards: [
      {
        title: 'Global Production URL',
        subtitle: 'https://ai-protector.vercel.app',
        desc: 'Main user suite featuring Check Anything, Emergency 1930 Golden Hour, DPDP 2023 Toolkit, and Bilingual Elder Mode with worldwide edge caching.',
        badge: 'PRODUCTION LIVE',
        icon: '🌐',
        color: '#10B981',
        techDetails: ['Hosted on Vercel Global Edge Network', 'Automatic HTTPS / TLS 1.3 encryption', 'HTTP/2 multiplexing for instant asset delivery'],
      },
      {
        title: 'Cyber Analytics Dashboard',
        subtitle: 'https://ai-protector.vercel.app/dashboard',
        desc: 'Dedicated dark SOC telemetry center with 4 interactive KPI metric cards, cubic Bézier charts, vector donut breakdowns, and node latency monitoring.',
        badge: 'LIVE SOC',
        icon: '📊',
        color: '#8B5CF6',
        techDetails: ['Real-time /api/v1/dashboard/metrics feed', 'Keyboard shortcut Ctrl+K global search', 'Real-time alert notification bell'],
      },
      {
        title: 'Interactive Tech Deck',
        subtitle: 'https://ai-protector.vercel.app/presentation',
        desc: 'This presentation is live in-browser with keyboard navigation, full screen mode, speaker notes, live threat simulation, and direct .pptx download.',
        badge: 'INTERACTIVE PPT',
        icon: '📽️',
        color: '#6366F1',
        techDetails: ['Keyboard navigation (Arrows, Space, F, S, G)', 'Speaker script & evaluator Q&A drawers', 'Direct download of .pptx file'],
      },
      {
        title: 'GitHub Open-Source Repository',
        subtitle: 'https://github.com/sanyamvij-lab/ai-agent-protector',
        desc: 'Complete source code, CI workflows, security audit reports, and test suites are pushed and publicly auditable under Git version control.',
        badge: 'OPEN SOURCE',
        icon: '🐙',
        color: '#F59E0B',
        techDetails: ['Clean commit history on main branch', 'Documented DECISIONS.md and API_INTEGRATIONS.md', 'MIT licensed architecture'],
      },
    ],
    speakerNotes: {
      bottomLine: 'Fully deployed and live globally on Vercel with public GitHub source code and instant accessibility.',
      script:
        'AI Protector is not just an idea or a Figma mockup; it is fully deployed and accessible worldwide right now at ai-protector.vercel.app. You can open the live Cyber Analytics Dashboard at /dashboard, explore this interactive presentation at /presentation, or download the master PowerPoint file directly. Furthermore, all code, test suites, and security audit documentation are committed to our GitHub repository at github.com/sanyamvij-lab/ai-agent-protector for full public auditability.',
      analogy:
        'We didn’t just bring blueprints to the meeting; we built the building, turned on the lights, unlocked the doors, and gave you the keys to test it yourself.',
      deepTech:
        'Vercel Edge Network, GitHub Actions CI, TLS 1.3, Next.js incremental static regeneration, and Git SHA commit tracking.',
      evaluatorQA: {
        q: 'Can this infrastructure handle sudden spikes in user traffic?',
        a: 'Yes. By leveraging Next.js on Vercel serverless architecture with pre-rendered static components and edge-cached API routes, the platform scales horizontally on-demand without managing server instances or cold database bottlenecks.',
      },
    },
  },
  {
    id: 12,
    slug: 'future-roadmap',
    category: 'Phase Horizon & Vision',
    title: 'Future Roadmap & Strategic Vision',
    subtitle: 'From Consumer Protection to Autonomous AI Agent Ecosystem Security',
    summary:
      'Our architectural vision extends across four planned phases, moving from consumer defense into autonomous AI agent security, sandboxed binary analysis, and decentralized threat sharing.',
    cards: [
      {
        title: 'Phase 5: Worker Sandbox & YARA-X',
        subtitle: 'Binary Analysis',
        desc: 'Isolated Python scan worker executing compiled YARA-X rules inside a hardened sandbox for zero-day binary and attachment threat detection.',
        badge: 'BINARY FORENSICS',
        icon: '🔬',
        color: '#6366F1',
        techDetails: ['Isolated worker container execution', 'Compiled YARA-X signature sets', 'Auto-destruction of files after scan'],
      },
      {
        title: 'Phase 6: OpenSSF Scorecard Integration',
        subtitle: 'Supply Chain Defense',
        desc: 'Automated CI/CD supply-chain trust scoring across dependencies and GitHub repositories for developers auditing third-party open-source packages.',
        badge: 'SUPPLY CHAIN',
        icon: '📦',
        color: '#10B981',
        techDetails: ['OpenSSF Scorecard REST API', 'Branch protection & signed commit verification', 'Dependency vulnerability scoring'],
      },
      {
        title: 'Phase 7: Agent Component Check',
        subtitle: 'AI Agent Governance',
        desc: 'Static analysis for autonomous AI agents, auditing Model Context Protocol (MCP) servers, tool manifests, and prompt injection surface areas.',
        badge: 'AGENT SECURITY',
        icon: '🤖',
        color: '#8B5CF6',
        techDetails: ['Static analysis of agent tool manifests', 'Permission boundary validation for MCP servers', 'Prompt injection boundary testing'],
      },
      {
        title: 'Phase 8: Decentralized Threat Registry',
        subtitle: 'Zero-Knowledge Intelligence',
        desc: 'A privacy-preserving, zero-knowledge threat feed allowing verified institutions to share emerging scam hashes without exposing victim identities.',
        badge: 'DECENTRALIZED INTEL',
        icon: '🌐',
        color: '#F59E0B',
        techDetails: ['Cryptographic zero-knowledge proofs', 'Consensus-driven scam hash sharing', 'Cross-border threat intelligence federation'],
      },
    ],
    speakerNotes: {
      bottomLine: 'A compelling four-phase expansion from consumer privacy into autonomous AI agent security and decentralized threat intelligence.',
      script:
        'Finally, let us look at our strategic horizon. In Phase 5, we introduce isolated Python scan workers executing YARA-X compiled rules for deep binary inspection. In Phase 6, we integrate OpenSSF Scorecard to audit software supply-chain integrity. In Phase 7, we pioneer Agent Component Check—providing the world’s first static analysis auditor for autonomous AI agents, tool manifests, and Model Context Protocol servers. And in Phase 8, we build a decentralized zero-knowledge threat feed allowing banks and cyber cells to share threat intelligence without compromising citizen privacy.',
      analogy:
        'We started by building the shield for individual citizens; now we are building the global radar defense grid for the coming age of autonomous AI agents.',
      deepTech:
        'YARA-X compilation, OpenSSF Scorecard REST integration, Model Context Protocol (MCP) schema validation, and Zero-Knowledge Proof (ZKP) architectures.',
      evaluatorQA: {
        q: 'Why is Agent Component Check (Phase 7) so critical right now?',
        a: 'As autonomous AI agents like coding assistants and enterprise bots take actions, attackers are shifting from phishing humans to prompt-injecting agents via malicious tools and poisoned documentation. Phase 7 will audit agent tool permissions before execution.',
      },
    },
  },
];
