# AI Protector — Project Audit (Phase 1 Baseline)

**Date:** 2026-10-23  
**Auditor:** Antigravity Lead Engineer  
**Scope:** Repository audit prior to Phase 1 (Link-Scanner Vertical Slice) implementation.

---

## 1. Executive Summary

AI Protector is an existing Next.js 16 (Turbopack) web application designed for digital safety and client-side PII scrubbing. Prior work focused on exploratory UI prototypes, offline heuristics, and mock copilot integrations. 

To meet the requirements of the **Master Build Prompt (v2)**, the codebase requires a hardened, contract-compliant vertical slice for URL threat scanning. Specifically:
- Transition from ad-hoc scan response shapes to the canonical §5 Scan Result Contract.
- Introduce boot-time environment validation with zero client leaks.
- Replace unstructured and partial logging with strict URL-hash redaction (host + `sha256(normalizedUrl)` only).
- Implement official threat intelligence provider integration (**Google Web Risk API**) with strict timeout, retry, and "not_configured" fail-safe behavior.
- Implement an authenticated and authorization-checked persistence layer (`users`, `scans`, `false_positives`) where users can only access their own scans.
- Guarantee that missing or failing providers yield `status: "unavailable"` and never fall back to "safe".

---

## 2. Technology Stack Inventory

| Component | Repository Implementation | Master Prompt Baseline | Compliance Status |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js 16.4.2 (App Router, Turbopack) | Node / TypeScript modular monolith | Compliant |
| **Runtime** | Node.js v20+ / React 19.3.0 | TypeScript throughout | Compliant |
| **Styling** | Tailwind CSS v4, custom CSS variables | Responsive, Dark Mode (#0D0F12 / #FFFFFF) | Compliant |
| **Database** | In-memory ephemeral storage | PostgreSQL / Schema migrations | Migration needed for persistent metadata |
| **Validation** | Zod 4.6.7 | Zod schema validation | Compliant |
| **Testing** | Node.js native test runner via `tsx` | Vitest / Node test runner | Compliant |
| **Logging** | `SafeLogger` (PII redactor regex) | Host + hash normalized URL logging | Requires URL hash hardening |

---

## 3. Existing Capabilities & Gaps

### Existing Capabilities
1. **URL Inspector Heuristics** (`src/lib/security/url-inspector.ts`):
   - RFC 1918 / loopback / cloud metadata (169.254.169.254) anti-SSRF detection.
   - Punycode / Cyrillic homograph detection.
   - Basic brand typosquatting regex for 14 major institutions.
2. **Client-Side Privacy Redaction** (`src/lib/privacy/redactor.ts`):
   - Regex masking for emails, SSNs, credit cards, API keys, JWTs, and passwords.
3. **UI Foundations**:
   - Responsive dark-mode dashboard with `#0D0F12` background and pure `#FFFFFF` typography.
   - Animated UI elements (`ShinyButton`, `RuixenMoonChat`, `BeamWordmarkFooter`, horizontal testimonials).

### Critical Gaps Addressed in Phase 1
1. **Contract Incompatibility**: Scan endpoints returned custom JSON instead of the strict §5 versioned schema (`scan_id`, `status`, `category`, `evidence`, `provider_status`, `limitations`, `recommended_action`).
2. **Missing Google Web Risk Provider**: Threat intelligence lookup relied on third-party VirusTotal or static heuristics without the Google Web Risk Lookup API adapter.
3. **Missing Fail-Safe Behavior**: Absence of an explicit `unavailable` status when external providers are unconfigured, timing out (3s cap), or rate-limited.
4. **Missing Database Persistence**: Scans were not persisted in a structured database with user ownership checks (`user_id`, `host`, `url_hash`).
5. **Missing AuthN & AuthZ Isolation**: API routes lacked session / token validation ensuring users cannot read scans belonging to other accounts.
6. **URL Logging**: Full URLs were potentially logged in console statements; required host + normalized URL hash logging.

---

## 4. Phase 1 Action Plan

1. Create `src/lib/config/env.ts` with boot-time Zod validation and `.env.example`.
2. Implement `src/lib/observability/url-safe-logger.ts` logging only `host` and `sha256(url)`.
3. Create database layer with migration `001_initial_schema.sql` (`users`, `scans`, `false_positives`).
4. Implement WHATWG URL normalizer, credential stripper, and heuristics in `src/lib/security/url-normalizer.ts` & `url-heuristics.ts`.
5. Implement Google Web Risk provider adapter (`src/lib/security/providers/webrisk-provider.ts`) with 3s timeout, 1 retry on 5xx, and `not_configured` reporting.
6. Implement 5-minute memory cache keyed by URL hash.
7. Expose authenticated endpoints `POST /api/v1/scans`, `GET /api/v1/scans/:id`, and `POST /api/v1/scans/:id/false-positive`.
8. Update `LinkScannerTab.tsx` with all required UI states (loading, error, unavailable, malicious warning with Return to Safety, false-positive reporting).
9. Write and run tests verifying every requirement in §7.6.
