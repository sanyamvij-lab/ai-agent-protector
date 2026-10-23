# AI Protector — Backend Architecture Audit (Phase 0)

> **Date:** October 2026  
> **Status:** Completed  
> **Repository Root:** `C:\Users\HP\.gemini\antigravity-ide\scratch\ai-protector`

---

## 1. Current Stack & Module Map

| Area | Component | Implementation Status |
|---|---|---|
| **Runtime & Framework** | Next.js 16.4.2 App Router on Node v26.7.0 | Operational; full TypeScript 5 strict typing |
| **API Architecture** | Route Handlers in `src/app/api/` | Basic unversioned routes exist; needs standardized `/api/v1/` prefix |
| **Validation Layer** | Zod v4.6.7 | Active on existing route handlers |
| **PII Redaction** | `PrivacyRedactor` (`src/lib/privacy/redactor.ts`) | Server-side & client-side regex tokenization active |
| **URL Security** | `UrlInspector` (`src/lib/security/url-inspector.ts`) | Anti-SSRF private IP blocking & typosquatting detection active |
| **Scam Heuristics** | `MessageAnalyzer` (`src/lib/security/message-analyzer.ts`) | Urgency, credential theft, and payment fraud patterns active |
| **Claim Triage** | `ClaimVerifier` (`src/lib/security/claim-verifier.ts`) | Factual proposition vs. opinion separation active |
| **Hashing Engine** | `CryptoHasher` (`src/lib/security/crypto-hasher.ts`) | Native Web Crypto API for client, needs Node `crypto` server fallback |
| **AI Gateway** | `AiGateway` (`src/lib/gateway/ai-gateway.ts`) | Gemini adapter with offline heuristic fallback active |
| **Health Monitoring** | `GET /api/health` | Uptime, memory, and provider status active |

---

## 2. Feature Implementation Status

- **Implemented & Verified**:
  - `POST /api/scan/message`: Pre-flight PII redaction, heuristic analysis, rate limiting.
  - `POST /api/scan/link`: Anti-SSRF private IP blocking (RFC 1918, RFC 3927, loopbacks), typosquatting detection.
  - `POST /api/scan/claim`: Claim decomposition, sensationalism detection.
  - `GET /api/health`: Real memory usage, uptime, provider status.
- **Identified Backend Gaps to Complete**:
  1. **API Versioning**: Need standard `/api/v1/` endpoints (`/api/v1/scans/messages`, `/api/v1/scans/urls`, `/api/v1/claims/verify`, `/api/v1/files/hash`, `/api/v1/files/compare-hash`, `/api/v1/health/live`, `/api/v1/health/ready`, `/api/v1/status/providers`, `/api/v1/privacy/audit`).
  2. **Normalized Scan Result Contract**: Standardize request ID (`request_id`), status, assessment, signals (`code`, `label`, `severity`), uncertainty object, and privacy receipt across all v1 routes.
  3. **Standard Error Contract**: Standardize error JSON shape (`{ error: { code, message, request_id } }`) across all failure modes (validation, rate limit, payload size, server error).
  4. **Structured Privacy-Safe Logger**: Redact secrets, authorization headers, and raw PII before logging to console or telemetry.
  5. **Server-Side Cryptographic File Hashing Service**: Provide `/api/v1/files/hash` and `/api/v1/files/compare-hash` using Node standard library `crypto` for clients unable to use Web Crypto or verifying via automated API clients.

---

## 3. Database & Data-Flow Assessment
- **Zero Database Requirement for MVP**: In accordance with the Privacy-by-Default mandate, the core analysis engine executes ephemerally in-memory.
- **Client-Side History**: History is stored exclusively in the user's browser `localStorage`, with one-click purge capability (`Nuclear Data Wipe`).
- **Zero Raw Data Retention**: User messages, files, and full URLs are discarded after response completion.

---

## 4. Threat Summary & Security Controls

| Threat | Risk Level | Mitigation in Backend |
|---|---|---|
| **Server-Side Request Forgery (SSRF)** | High | Resolve and block private/loopback/cloud metadata IP ranges before external queries. |
| **API Key Leakage** | Critical | Keys stored strictly in server environment (`process.env.GEMINI_API_KEY`); never exposed to client bundles or logged. |
| **PII Exposure to Cloud AI** | High | Two-tier scrubbing (`PrivacyRedactor`) runs prior to any cloud provider request; cloud mode requires explicit user consent. |
| **Prompt Injection** | Medium | User messages treated as untrusted data strings; output strictly schema-validated via Zod. |
| **Denial of Service / Quota Burn** | Medium | In-memory sliding window rate limiter (30 req/min per IP) and 16KB payload size limit. |
