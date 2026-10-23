# AI Protector — Backend Test Strategy

---

## 1. Test Layers & Exit Criteria

```
Unit Tests (Pure Functions & Regex Heuristics)
  ├── PrivacyRedactor: Email, SSN, Credit Card, Key masking
  ├── UrlInspector: SSRF IP rejection, Typosquatting brand matches
  ├── MessageAnalyzer: Urgency, Credential Harvesting, Payment Fraud
  └── CryptoHasher: SHA-256 and SHA-512 byte hashing & comparison
            │
            ▼
Integration Tests (Next.js API Route Handlers)
  ├── POST /api/v1/scans/messages
  ├── POST /api/v1/scans/urls
  ├── POST /api/v1/claims/verify
  ├── POST /api/v1/files/hash & compare-hash
  ├── GET /api/v1/health/live & ready
  └── GET /api/v1/status/providers
            │
            ▼
Security Tests (Abuse & Boundary Attacks)
  ├── SSRF Loopback and Cloud Metadata probes
  ├── Malformed / Oversized JSON payloads (>16KB)
  └── Rate Limit flood (>30 req/min)
```

---

## 2. Test Commands & Quality Gate
- `npm test`: Executes unit tests via Node native test runner (`tsx --test src/tests/security.test.ts`).
- `npm run test:e2e`: Runs integration tests against active server endpoints (`node test-e2e-api.mjs`).
- **Exit Gate**: 100% test pass required prior to marking any feature complete.
