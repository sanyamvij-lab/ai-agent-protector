# AI Protector — Backend Requirements Document

> **Architecture Style:** Modular Monolith with Versioned RESTful Contracts  
> **Target Release:** v1.0.0

---

## 1. Functional Requirements (BR)

- **BR-1: Versioned API Routing (`/api/v1/`)**:
  - Expose versioned endpoints for all core capabilities: `/api/v1/scans/messages`, `/api/v1/scans/urls`, `/api/v1/claims/verify`, `/api/v1/files/hash`, `/api/v1/files/compare-hash`, `/api/v1/health/live`, `/api/v1/health/ready`, `/api/v1/status/providers`, `/api/v1/privacy/audit`.
  - Maintain backward compatibility for `/api/scan/*` and `/api/health`.
- **BR-2: Request Correlation & Tracing**:
  - Generate an opaque `x-request-id` (`req-<uuid>`) for every incoming request if not provided by client.
  - Return `x-request-id` in response headers and inside standard JSON envelopes.
- **BR-3: Standardized Normalized Scan Schema**:
  - Return consistent fields across all analysis endpoints: `request_id`, `status`, `assessment`, `summary`, `signals`, `evidence`, `uncertainty`, `processing`, `safe_next_steps`, `limitations`, `privacy_receipt`.
- **BR-4: Standardized Error Response Envelope**:
  - Uniform shape: `{ "error": { "code": "...", "message": "...", "request_id": "..." } }`.
  - Never leak stack traces, database internals, or secret values in production error responses.
- **BR-5: Pre-Flight PII Redaction & Data Minimization**:
  - Automatically mask emails, phone numbers, SSNs, credit cards, credentials, and API keys before analysis.
  - Record the number of scrubbed entities in `privacy_receipt`.
- **BR-6: Anti-SSRF Protection on URL Operations**:
  - Parse submitted URLs without dereferencing untrusted targets.
  - Strictly reject loopback addresses (`127.0.0.1`, `localhost`), private RFC 1918 IPs (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and link-local cloud metadata (`169.254.169.254`).
- **BR-7: Secure AI Provider Gateway with Graceful Fallback**:
  - Route consented external analysis requests through server-side Gemini API adapter.
  - Protect keys in server environment (`process.env.GEMINI_API_KEY`).
  - Fall back to deterministic local rule heuristics within 6s timeout or if keys are missing.
- **BR-8: Real Health & Readiness Probes**:
  - `GET /api/v1/health/live`: Fast process liveness (HTTP 200).
  - `GET /api/v1/health/ready`: Dependency check, heap memory allocation, and provider availability.

---

## 2. Non-Functional Requirements (BNFR)

- **BNFR-1: Privacy First**: Ephemeral in-memory execution; zero server-side database persistence of user messages, files, or browsing history.
- **BNFR-2: Performance**:
  - Local rule execution latency < 10ms.
  - API gateway total response time < 50ms for local mode.
  - Rate limiting overhead < 1ms.
- **BNFR-3: Abuse Prevention**:
  - In-memory sliding window rate limiting: max 30 requests/minute per client IP.
  - Request body size limits: 16KB for messages, 2KB for URLs, 8KB for claims, 10MB for file hashing.
- **BNFR-4: Observability**:
  - Structured, privacy-safe logger that scrubs sensitive identifiers and credentials before console output.
