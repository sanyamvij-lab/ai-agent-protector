# AI Protector — Frontend Architecture Specification

> **Stack:** Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS v4 · Web Crypto API

---

## 1. High-Level Component Hierarchy

```
RootLayout (src/app/layout.tsx)
  └── Home (src/app/page.tsx)
        ├── ToastProvider (Global non-blocking feedback)
        ├── AppShell
        │     ├── DesktopSidebar (Collapsible navigation, categories, status)
        │     ├── MobileDrawer (Touch-friendly slideout navigation)
        │     ├── TopBar (Active breadcrumb, Service Health indicator, Mode badge)
        │     └── MainContentArea
        │           ├── DashboardTab (System telemetry, quick launch, recent activity)
        │           ├── MessageScannerTab (PII detector, heuristic scanner, verdict card)
        │           ├── LinkScannerTab (Anti-SSRF inspector, URL deconstruction grid)
        │           ├── ClaimVerifierTab (Fact/opinion separator, verification checklists)
        │           ├── FileIntegrityTab (Web Crypto SHA-256 stream hasher, comparison)
        │           ├── PrivacyCenterTab (Audit matrix, permission controls, nuclear wipe)
        │           ├── SecurityCenterTab (Impersonation cues, breach resources, hardening)
        │           └── SystemHealthTab (Real /api/health latency, memory, provider readiness)
        ├── ProcessingModeModal (Transparent mode explanation & consent dialog)
        └── GlobalFooter (Privacy guarantees, version metadata, compliance)
```

---

## 2. Directory Structure Conventions

```
src/
├── app/
│   ├── api/
│   │   ├── health/route.ts      # GET: System health, uptime & provider status
│   │   └── scan/
│   │       ├── claim/route.ts   # POST: Claim verification
│   │       ├── link/route.ts    # POST: Anti-SSRF link inspection
│   │       └── message/route.ts # POST: Message threat analysis
│   ├── globals.css              # Design tokens, variables & glassmorphism
│   ├── layout.tsx               # Root layout, fonts & metadata
│   └── page.tsx                 # Master shell orchestrator
├── components/
│   ├── ui/                      # Reusable Design System Primitives
│   │   ├── Alert.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Tabs.tsx
│   │   ├── Textarea.tsx
│   │   └── Toast.tsx
│   ├── layout/
│   │   ├── AppShell.tsx         # Sidebar + Mobile Drawer + TopBar
│   │   ├── Breadcrumb.tsx
│   │   └── HealthBadge.tsx      # Real-time health check badge
│   └── tabs/
│       ├── ClaimVerifierTab.tsx
│       ├── DashboardTab.tsx
│       ├── FileIntegrityTab.tsx
│       ├── LinkScannerTab.tsx
│       ├── MessageScannerTab.tsx
│       ├── PrivacyCenterTab.tsx
│       ├── SecurityCenterTab.tsx
│       └── SystemHealthTab.tsx
├── hooks/
│   ├── useHealthCheck.ts        # Queries /api/health periodically
│   ├── useLocalStorage.ts       # Privacy-conscious client storage
│   └── useToast.ts              # Global toast notifications
└── lib/
    ├── gateway/ai-gateway.ts
    ├── privacy/redactor.ts
    ├── security/
    └── types/index.ts
```

---

## 3. State Management & Privacy Boundary

1. **Ephemeral Execution**: Analysis requests (`raw text`, `file buffers`, `target URLs`) live purely in local React component state. They are destroyed when navigating or clicking clear.
2. **Scan History**:
   - Optional, user-controlled scan summaries are stored strictly in browser `localStorage`.
   - Raw submitted text is never stored in history—only sanitized metadata (timestamp, risk level, category, scrubbed PII count).
   - One-click deletion (`Nuclear Wipe`) calls `localStorage.clear()` and resets in-memory counters.
3. **API Secrets Boundary**:
   - No `NEXT_PUBLIC_*` tokens for AI providers.
   - Provider keys (`GEMINI_API_KEY`) stay strictly inside server-side Node.js environment.
