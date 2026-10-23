# AI Protector — Architecture Decision Records (ADRs)

---

## ADR-01: Next.js 16 App Router for Full-Stack Security Boundary
- **Context**: Need a framework that cleanly separates client-side privacy controls from backend API gateway without leaking API keys to client bundles.
- **Decision**: Use Next.js 16 with React 19 and TypeScript. Server components and `/api` routes hold all provider keys (`GEMINI_API_KEY`); client components handle rendering and local hashing.
- **Consequences**: Zero risk of embedding provider credentials in frontend JS bundles.

## ADR-02: Web Crypto API for Client-Side File Hashing
- **Context**: Need fast, standard SHA-256 and SHA-512 calculation that preserves absolute user privacy.
- **Decision**: Use the W3C standard `crypto.subtle.digest` in browser JavaScript instead of uploading files to a backend.
- **Consequences**: Zero server bandwidth cost; zero data leakage; files of any size calculate offline instantly.

## ADR-03: Two-Tier Pre-Flight PII Redaction
- **Context**: Users might paste messages containing personal data (emails, SSNs, passwords) into the scanner.
- **Decision**: Perform pre-flight regex and tokenization in the browser before user submission, and repeat scrubbing on the server gateway before any external model query.
- **Consequences**: Redacted tokens replace raw PII so third-party cloud models never observe sensitive user identifiers.

## ADR-04: Static URL Deconstruction over Active Web Crawling
- **Context**: Auditing links on a server creates significant Server-Side Request Forgery (SSRF) and drive-by download risks.
- **Decision**: Perform structural, protocol, IP block, and typosquatting inspection without actively dereferencing or following redirects to untrusted destinations.
- **Consequences**: Eliminates SSRF against internal microservices or cloud metadata (`169.254.169.254`).

## ADR-05: Deterministic Local Heuristics as Default
- **Context**: External AI providers incur latency, cost, and network dependency.
- **Decision**: Implement deterministic rule engines (`MessageAnalyzer`, `UrlInspector`, `ClaimVerifier`) that work 100% offline out-of-the-box.
- **Consequences**: The platform functions seamlessly with zero external API keys and zero cost.

## ADR-06: Zero Server-Side Persistence
- **Context**: Storing user scan queries creates privacy and data breach liabilities.
- **Decision**: Execute all scans ephemerally in-memory. Store scan history strictly in user-controlled browser `localStorage`.
- **Consequences**: No database leak risk; users can purge all data with a single click.

## ADR-07: Contract Compliance with Section 5 Schema
- **Context**: Frontends and automated agents require predictable, versioned output.
- **Decision**: All URL scans conform strictly to `/api/v1/scans` schema returning `scan_id`, `target_type`, `status`, `category`, `evidence`, `provider_status`, `explanation`, `recommended_action`, `limitations`, and `scanned_at`.
- **Consequences**: Deterministic evaluation and zero ambiguity for consuming clients.

## ADR-08: Google Web Risk Lookup API Integration
- **Context**: Licensed threat intelligence is required for high-confidence identification of known malware, phishing, and unwanted software.
- **Decision**: Implement Google Web Risk Lookup API with 3s timeout, 1 retry on 5xx, and explicit `not_configured` mapping if `WEBRISK_API_KEY` is missing.
- **Consequences**: Commercial-grade threat data with strict error and timeout boundaries.

## ADR-09: Fail-Safe Invariant (Missing/Failed Provider = Unavailable)
- **Context**: Systems that default to "safe" when an external provider fails create false confidence and user harm.
- **Decision**: Enforce that provider errors, timeouts, quotas, or missing configuration yield `status: "unavailable"` and never "no_known_threat".
- **Consequences**: Truthful, evidence-based reporting without false safety assertions.

## ADR-10: Hash-Only URL Logging & Storage
- **Context**: Full URLs contain authentication tokens, password reset secrets, and personal information.
- **Decision**: Log and persist only the parsed `host` and `SHA-256(normalized_url)`. Strip credentials and query params prior to logging.
- **Consequences**: Eliminates PII and credential exposure in logs and database storage.

## ADR-11: 404 Response on Unauthorized Scan Retrieval (Anti-Probing)
- **Context**: Returning `403 Forbidden` when User B accesses User A's scan ID confirms the existence of the scan ID.
- **Decision**: Return `404 Not Found` for any scan ID not owned by the authenticated caller.
- **Consequences**: Prevents scan ID enumeration and timing attacks.

## ADR-12: Manifest V3 Browser Extension Architecture
- **Context**: Users require real-time defensive warnings upon navigating to hazardous URLs and on-demand context-menu scans without compromising browsing privacy.
- **Decision**:
  1. Build under Chromium Manifest V3 with cross-browser compatibility for Firefox MV3.
  2. Use `webNavigation` for navigation listener and `chrome.storage.local` for local trusted sites and ephemeral override tokens.
  3. When a destination link is classified as `known_malicious` or `suspicious`, redirect the tab to an internal interstitial warning page (`interstitial/warning.html`) displaying plain-language explanation, evidence with sources and timestamps, and a prominent "Return to Safety" action.
  4. Provide an "Informed Override" mechanism that requires deliberate user confirmation and sets a short-lived session bypass token so the user is never permanently locked out.
  5. Never record browsing history or persist visited URLs. Transmit only the destination URL to the configured backend API.
- **Consequences**: Zero ambient history surveillance, strong defensive protection, full user agency, and compliance with MV3 least-privilege principles.

## ADR-13: HackerWrath 3.0 Privacy Module Architecture & India Cyber Trust Integration
- **Context**: In HackerWrath 3.0 (Problem Statement 01: Digital Security and Trust), the application required a dedicated, mobile-first Privacy module tailored for Indian citizens (students, senior citizens, first-time users), with plug-and-play interfaces for other hackathon modules (fraud, misinformation, identity).
- **Decision**:
  1. **Zero-Knowledge User Space**: Require no accounts, no logins, and no third-party trackers. Store user scan history strictly in browser `localStorage` with a 1-click Nuclear Data Purge.
  2. **Mandatory Anti-Scam Notice**: Display a persistent sticky alert on all viewports: *"🔒 AI Protector will NEVER ask for your OTP, UPI PIN, Bank Password, Aadhaar or PAN card number."*
  3. **"What Happens to Your Input" Panel**: Integrate a transparent zero-persistence disclosure modal accessible across all tools.
  4. **K-Anonymity for Passwords**: Perform 100% SHA-1 hashing in client-side Web Crypto. Transmit only the 5-character prefix to `/api/v1/pwned-range/[prefix]` proxy, guaranteeing the full password never leaves the browser.
  5. **India-Specific "Do This Next" Panel**: Map every verdict to national cyber response assets (DoT Chakshu / Sanchar Saathi, Helpline 1930, cybercrime.gov.in).
  6. **DPDP Act 2023 & RBI Zero-Liability**: Provide automated legal letter generators citing Section 12/13 of the Digital Personal Data Protection Act 2023 and RBI Circular `DBR.No.Leg.BC.78/09.07.005/2017-18`, noting the 13 May 2027 statutory phase-in date.
  7. **Elder Mode & Bilingual i18n**: Support high-contrast, large-typography Elder Mode and instant toggle between English and हिंदी (Hindi).
- **Consequences**: Satisfies all hackathon trust invariants, provides realistic defensibility against prominent Indian cybercrime (Digital Arrest, electricity cutoff scams, predatory loan apps), and ensures zero user data risk.

