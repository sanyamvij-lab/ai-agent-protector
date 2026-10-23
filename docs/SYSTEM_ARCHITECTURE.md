# AI Protector — Backend System Architecture

> **Architecture Style:** Clean Modular Monolith with Explicit Boundary Layers

---

## 1. Logical Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                        EXTERNAL UNTRUSTED CLIENT BOUNDARY                       |
|   (Web Browser, Desktop UI, Mobile Touchpoint, Automated API Client)            |
+---------------------------------------------------------------------------------+
                                       │
                                       │ HTTPS (TLS 1.3) + x-request-id
                                       ▼
+---------------------------------------------------------------------------------+
|                         BACKEND API GATEWAY (Next.js App Router)                |
|                                                                                 |
|   1. Correlation ID Generator (`req-<uuid>`)                                    |
|   2. Rate Limiting Guard (Sliding window: 30 req/min per IP)                    |
|   3. Input Payload Sanitizer (Zod Schema Validation & Size Bounds)              |
|   4. Server-Side PII Redactor (`PrivacyRedactor.redact`)                        |
+---------------------------------------------------------------------------------+
                                       │
                                       ▼ (Sanitized, Redacted Payload)
+---------------------------------------------------------------------------------+
|                         APPLICATION RISK SERVICES LAYER                         |
|                                                                                 |
|   ┌───────────────────────┐  ┌───────────────────────┐  ┌────────────────────┐  |
|   │ Message Risk Service  │  │   URL Risk Service    │  │ Claim Triage Serv. │  |
|   │ - Urgency cues        │  │ - Anti-SSRF IP Guard  │  │ - Fact/Opinion sep │  |
|   │ - Credential harvest  │  │ - Typosquatting Brand │  │ - Sensationalism   │  |
|   │ - Payment fraud cues  │  │ - Punycode detector   │  │ - Verification ref │  |
|   └───────────────────────┘  └───────────────────────┘  └────────────────────┘  |
|                                       │                                         |
|   ┌──────────────────────────────────────────────────────────────────────────┐  |
|   │ File Integrity Service (`src/lib/security/crypto-hasher.ts`)              │  |
|   │ - Standard SHA-256 / SHA-512 cryptographic verification                  │  |
|   └──────────────────────────────────────────────────────────────────────────┘  |
+---------------------------------------------------------------------------------+
                                       │
                                       ▼
+---------------------------------------------------------------------------------+
|                         AI ORCHESTRATION & GATEWAY LAYER                        |
|                                                                                 |
|   Mode Selector:                                                                |
|   ├─ Mode: "local"  ──► Deterministic Heuristic Engine (0-cost, in-memory)      |
|   └─ Mode: "cloud"  ──► Gemini API Adapter (Server secrets, timeout circuit)    |
|                         └─ Failure / Missing Key ──► Local Fallback             |
+---------------------------------------------------------------------------------+
                                       │
                                       ▼
+---------------------------------------------------------------------------------+
|                         RESULT NORMALIZATION & OBSERVABILITY                    |
|                                                                                 |
|   1. Envelope Normalizer: Formats response to standardized v1 schema            |
|   2. Structured Safe Logger: Emits sanitized operational logs (zero PII)        |
|   3. Response Egress: Returns HTTP 200/400/429/500 with request_id              |
+---------------------------------------------------------------------------------+
```

---

## 2. Architectural Boundaries & Isolation

1. **Frontend / Backend Boundary**: Frontend components never receive secret provider keys. All external AI operations transit the backend gateway.
2. **Untrusted Data Boundary**: All input text, URLs, file buffers, and model outputs are treated as untrusted strings. They are sanitized, validated against Zod schemas, and never evaluated as executable code or system instructions.
3. **Persistence Boundary**: By default, scan inputs are processed ephemerally in-memory and discarded upon response delivery. Zero persistent database records of raw user inputs exist.
