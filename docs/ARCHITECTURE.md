# AI Protector — Architecture Specification (Phase 1: Link-Scanner Vertical Slice)

---

## 1. System Context & Overview

The Phase 1 Link-Scanner is a vertical slice providing evidence-based safety evaluation of submitted URLs before user action. It strictly abides by the zero-trust principle:
- **No server-side dereferencing:** The application never fetches, crawls, or opens submitted links server-side.
- **Fail-safe contract:** If threat intelligence cannot be verified, status is `unavailable`, never assumed "safe".
- **Data minimization:** The server only stores metadata (`host`, `url_hash`, `status`, `category`, `provider_status`) and never raw URLs with queries or credentials.

```
[ User Browser ]
       |  (1) POST /api/v1/scans (Bearer Token + raw URL)
       v
[ Auth & Rate-Limit Middleware ]
       |  (2) Verify caller session & enforce quotas
       v
[ URL Pipeline ]
       |---> (3a) Normalize & Strip Credentials (WHATWG URL)
       |---> (3b) Heuristic Engine (punycode, IP literals, subdomains, typosquatting)
       |---> (3c) 5-Min Memory Cache (Key: SHA-256(normalized_url))
       |---> (3d) Google Web Risk Adapter (Lookup API, 3s timeout, retry once)
       v
[ Decision Engine ]
       |  (4) Synthesize evidence into Section 5 Result Contract
       v
[ Persistence Layer ]
       |  (5) Write metadata to `scans` table (scan_id, user_id, host, url_hash)
       v
[ JSON Contract Response ] ---> [ UI: LinkScannerTab with States & Safeguards ]
```

---

## 2. Component Design

### 2.1 URL Normalizer & Sanitizer (`src/lib/security/url-normalizer.ts`)
- Parses via WHATWG standard `URL`.
- Rejects non-HTTP/HTTPS protocols (e.g., `javascript:`, `data:`, `file:`, `ftp:`).
- Enforces maximum length limit of 2048 characters.
- Detects and strips embedded credentials (`username`, `password`) and URL fragments (`#hash`).
- Generates a deterministic normalized URL and computes `SHA-256(normalized_url)` for logging, caching, and DB indexing.

### 2.2 Heuristics Engine (`src/lib/security/url-heuristics.ts`)
Produces explainable, structured `EvidenceItem` records:
1. `credentials_in_url`: Embedded username/password in authority segment (common in phishing).
2. `punycode_domain`: Internationalized domain names (`xn--`) or mixed-script homograph attacks.
3. `ip_literal_host`: Raw IPv4 / IPv6 host addressing (bypassing domain reputation and indicating SSRF or raw payload hosts).
4. `excessive_subdomains`: Domains containing > 3 sub-labels (frequently used for DNS evasion or subdomain hijacking).
5. `brand_in_subdomain`: High-target brand names residing in subdomains of unverified apex domains (e.g., `paypal.com.account-update.xyz`).

### 2.3 Provider Adapter: Google Web Risk (`src/lib/security/providers/webrisk-provider.ts`)
- **API Endpoint:** `https://webrisk.googleapis.com/v1/uris:lookup`
- **Threat Types:** `MALWARE`, `SOCIAL_ENGINEERING`, `UNWANTED_SOFTWARE`
- **Configuration:** Reads `WEBRISK_API_KEY`. If undefined, immediately returns `state: "not_configured"`.
- **Resilience:** 3,000ms timeout via `AbortController`. At most 1 retry on HTTP 5xx or timeout. Immediate error mapping on HTTP 4xx or quota exhaustion.
- **Output:** Normalized `ProviderStatus` (`ok | timeout | quota | error | not_configured`).

### 2.4 Decision Engine (`src/lib/security/url-decision-engine.ts`)
Applies deterministic status rules per Section 5:
- `known_malicious`: At least one licensed threat-intel provider reported a threat match.
- `suspicious`: No provider match, but specific, explainable heuristic flags observed.
- `no_known_threat`: Configured providers returned OK with no matches, and zero heuristics triggered. Always accompanied by mandatory limitation: *"No known threat detected is not a guarantee of safety."*
- `inconclusive`: Conflicting signals or partial provider failure.
- `unavailable`: External threat intelligence could not be reached or is unconfigured. **Never defaults to safe.**

### 2.5 Auth & Isolation (`src/lib/auth/auth-service.ts`)
- Validates Authorization headers (`Bearer <token>`).
- Supports roles: `user`, `support`, `analyst`, `admin`.
- Enforces access boundaries: Users can only query their own scans. Querying an unowned scan ID returns `404 Not Found` rather than `403 Forbidden` to prevent ID enumeration/probing attacks.

### 2.6 Persistence Layer (`src/lib/db/database.ts`)
- Stores metadata only: `scan_id`, `user_id`, `host`, `url_hash`, `status`, `category`, `provider_status`, `created_at`.
- Full URL, query strings, and parameters are **never stored**.
- Supports false-positive audit records for analyst review.
