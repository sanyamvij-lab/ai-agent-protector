# AI Protector — Threat Model (Phase 1: Link-Scanner Vertical Slice)

**Methodology:** STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)  
**Target:** Phase 1 URL Scanning Pipeline & Endpoint (`POST /api/v1/scans`)

---

## 1. STRIDE Analysis Matrix

| Threat Category | Specific Threat Scenario | Impact | Mitigation in Phase 1 Implementation |
| :--- | :--- | :--- | :--- |
| **Spoofing (Identity)** | Attacker submits scans impersonating another user or calls protected endpoints without auth. | High | Bearer token verification and session context required on all protected `/api/v1/scans` routes. Scans bound to verified `user_id`. |
| **Tampering (Data Integrity)** | Attacker alters scan results in transit or injects script payloads via URL input. | High | Strict Zod validation on URL length (max 2048) and schema; sanitization of outputs; responses rendered safely in React without `dangerouslySetInnerHTML`. |
| **Repudiation** | User denies performing a scan or submitting a false-positive report. | Low | Structured audit logs recording `timestamp`, `user_id`, `host`, and `sha256(normalized_url)`. |
| **Information Disclosure** | 1. Server logs leak sensitive tokens or credentials embedded in query parameters.<br>2. User B probes scan IDs of User A.<br>3. API keys leak into client-side JS bundles. | Critical | 1. Stripping embedded credentials before storage; logging only `host` and `SHA-256(url)`.<br>2. `GET /api/v1/scans/:id` returns `404 Not Found` for unowned IDs to defeat probing.<br>3. `WEBRISK_API_KEY` loaded server-side only; validated at boot; never exposed to browser. |
| **Denial of Service** | 1. Malicious input with giant payload exhaust memory.<br>2. Flood of scan requests exhausts Web Risk provider quota or server CPU. | High | 1. 2048-char request size cap enforced at boundary.<br>2. Per-IP and per-user in-memory token-bucket rate limiter.<br>3. 5-minute memory cache by URL hash prevents redundant upstream API calls.<br>4. 3,000ms hard timeout with `AbortController` on upstream requests. |
| **Elevation of Privilege** | Normal user attempts to read administrative telemetry or bypass role limits. | Medium | Role-based Access Control (RBAC) supporting `user`, `support`, `analyst`, and `admin`. Scan management restricted to owner. |

---

## 2. Server-Side Request Forgery (SSRF) Defense

**Strict Rule:** Phase 1 **does NOT fetch, dereference, or crawl** submitted URLs on the server.
- The server performs static lexical and cryptographic analysis on the URL string.
- External calls are made **only** to authorized threat-intelligence APIs (Google Web Risk at `webrisk.googleapis.com`) using trusted Google endpoints with TLS verification.
- IP-literal hosts and private address ranges (RFC 1918, 127.0.0.0/8, 169.254.169.254) are flagged as suspicious heuristics without server connection.

---

## 3. Threat Intelligence Failure Invariants

- If Google Web Risk is not configured: Status MUST be `unavailable` with reason `provider_not_configured`.
- If Google Web Risk times out (3,000ms): Status MUST be `unavailable` or `inconclusive`.
- **Under NO circumstances may an error or missing provider result in `no_known_threat` or "safe".**
