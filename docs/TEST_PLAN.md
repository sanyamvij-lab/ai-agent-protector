# AI Protector — Test & Quality Assurance Plan

> **Quality Gate:** A feature is not complete when it compiles; it is complete when tested, verified, and handles errors safely.

---

## 1. Test Levels & Matrix

| Level | Scope | Tools | Execution Command | Status |
|---|---|---|---|---|
| **Unit Tests** | PII Redaction, Anti-SSRF URL filtering, Threat heuristics, Claim triage | Node Test Runner + TSX | `npm test` | **9 Passed / 0 Failed** |
| **Integration Tests** | Next.js API Routes (`/api/scan/*`, `/api/health`), Rate Limits, Zod Schemas | Node `fetch` runner | `npm run test:e2e` | **4 Passed / 0 Failed** |
| **Security Tests** | SSRF loopback defense, API key leak inspection, Client bundle scan | Custom static analysis | Automated in build | **Verified Clean** |
| **Accessibility Tests** | Keyboard navigation, ARIA live regions, contrast ratios | Manual + DOM inspection | Continuous | **Compliant** |

---

## 2. Test Cases Specification

### Suite 1: Privacy & PII Redaction
- `TC-PII-01`: Email addresses are masked with `[REDACTED_EMAIL_X]` and never sent raw.
- `TC-PII-02`: SSNs (`\d{3}-\d{2}-\d{4}`) are replaced with `[REDACTED_SSN_X]`.
- `TC-PII-03`: Credit cards (13-16 digits) are masked with `[REDACTED_CARD_NUM_X]`.
- `TC-PII-04`: API keys (`sk-...`, `AIza...`) are masked with `[REDACTED_API_KEY_X]`.

### Suite 2: Anti-SSRF Link Inspection
- `TC-SSRF-01`: Loopbacks (`127.0.0.1`, `localhost`) are flagged as High Risk SSRF hazards.
- `TC-SSRF-02`: Private RFC 1918 IPs (`10.0.0.1`, `192.168.1.1`) are flagged as private network hazards.
- `TC-SSRF-03`: Cloud metadata IP (`169.254.169.254`) is blocked and flagged as critical.
- `TC-SSRF-04`: Brand typosquatting (`paypa1-update.xyz`) correctly identifies target brand (`PayPal`).
- `TC-SSRF-05`: Valid public HTTPS domain (`apple.com`) returns low risk.

### Suite 3: Heuristic Threat Analysis
- `TC-MSG-01`: Artificial urgency + credential harvesting yields `high_risk` and category `phishing`.
- `TC-MSG-02`: Standard team meeting notice yields `low` risk and category `benign`.

### Suite 4: Offline File Hashing
- `TC-HASH-01`: Computes standard SHA-256 in browser via Web Crypto with 0 network calls.
- `TC-HASH-02`: Exact match against expected reference yields confirmed integrity.
- `TC-HASH-03`: Mismatched hash yields alteration/corruption warning.
