# AI Protector — Implementation Roadmap & Sprints

> **Execution Standard:** Phased delivery. Never skip testing for speed. Every milestone has a mandatory exit gate.

---

## Sprint Overview

```
Sprint 0: Audit & Definition ──► Sprint 1: Design System & Shell ──► Sprint 2: Message Scanner
                                                                                │
Sprint 5: File Integrity ◄── Sprint 4: Claim Verification ◄── Sprint 3: URL Checker
      │
      ▼
Sprint 6: Privacy Center & Settings ──► Sprint 7: Security & Health ──► Sprint 8: Production Release
```

---

## Sprint Breakdown & Exit Gates

### Sprint 0 — Audit & Definition (Completed)
- **Deliverables**: Repository audit, PRD, architecture, UX flows, design tokens, API map, test plan.
- **Exit Gate**: Planning suite fully documented in `docs/`.

### Sprint 1 — Production Design System & App Shell (In Progress)
- **Deliverables**:
  - Reusable UI component library (`Button`, `Card`, `Badge`, `Input`, `Textarea`, `Toast`, `Modal`, `Alert`, `Tabs`).
  - Production App Shell: Collapsible sidebar, mobile drawer, active breadcrumb, global top bar.
  - Global Toast Notification Provider.
- **Exit Gate**: Shell renders responsively on mobile (375px) and desktop (1440px) with working sidebar collapse and zero dead links.

### Sprint 2 — Message Threat Scanner (Completed & Hardened)
- **Deliverables**: Live PII masking preview, threat heuristic engine, structured output cards, safe next steps.
- **Exit Gate**: All PII scrubbing unit tests pass; API returns valid JSON.

### Sprint 3 — Anti-SSRF Safe Link Checker (Completed & Hardened)
- **Deliverables**: URL parser, Anti-SSRF private IP guard, typosquatting detector, punycode check.
- **Exit Gate**: All private IPs blocked; zero remote execution of untrusted links.

### Sprint 4 — Misinformation & Claim Triage (Completed & Hardened)
- **Deliverables**: Claim decomposition, sensationalism detector, verification guidance, trusted fact-checking references.
- **Exit Gate**: Evidence over certainty enforced; no fabricated citations.

### Sprint 5 — File Integrity (Web Crypto Hashing) (Completed & Hardened)
- **Deliverables**: 100% on-device Web Crypto SHA-256 calculation, drag-and-drop zone, baseline comparison, integrity explanation.
- **Exit Gate**: Offline hashing confirmed; zero bytes transmitted over network.

### Sprint 6 — Privacy Center & Permission Minimization (Completed & Hardened)
- **Deliverables**: Permissions audit (Zero Geolocation, Zero Sensor requests), one-click Nuclear Data Wipe, data processing matrix.
- **Exit Gate**: Complete eradication of local storage confirmed on wipe.

### Sprint 7 — Security Center & Real System Health
- **Deliverables**: Real `/api/health` endpoint reporting uptime, memory, and provider readiness; impersonation cues; breach resources.
- **Exit Gate**: System health reflects real server telemetry.

### Sprint 8 — Final QA, Accessibility & Release
- **Deliverables**: Full test pass (`npm test`, `npm run test:e2e`), production build (`npm run build`), WCAG 2.2 AA audit.
- **Exit Gate**: Zero broken links, zero leaked secrets, 100% test pass.
