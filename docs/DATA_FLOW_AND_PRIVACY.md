# AI Protector — Data Flow & Privacy Lifecycle

> **Mandate:** Collect minimal data, disclose all processing, execute ephemerally, and enforce zero persistent storage by default.

---

## 1. Data Classification Matrix

| Classification | Examples in AI Protector | Processing Handling | Retention Policy | Third-Party Transfer? |
|---|---|---|---|---|
| **Public Data** | Canonical domain names, public fact-check URLs, software checksums | In-memory evaluation | Ephemeral | None |
| **Personal Data (PII)** | User email addresses, phone numbers, recipient names in messages | **Pre-flight & Server Redaction**: Masked with `[REDACTED_EMAIL_X]` | **Zero Storage**: Never saved to disk or DB | Never transferred in plaintext |
| **Sensitive Identifiers** | Social Security Numbers (SSNs), Credit Card Numbers | **Pre-flight & Server Redaction**: Masked with `[REDACTED_SSN_X]` | **Zero Storage**: Discarded immediately | Never transferred in plaintext |
| **Secrets & Credentials** | API keys (`sk-...`, `AIza...`), passwords, auth tokens (`Bearer...`) | **Immediate Redaction**: Masked with `[REDACTED_API_KEY_X]` | **Zero Storage**: Discarded immediately | Strictly blocked from transit |
| **Hardware & Sensor Data** | Geolocation coordinates, camera/microphone streams | **Disabled by Default**: Never requested | **Zero Storage**: Untouched | None |

---

## 2. End-to-End Data Flow Stages

```
User Input (Browser)
       │
       ▼ [Stage 1: Pre-Flight Redaction in Browser]
Client Regex Engine replaces emails/SSNs/credentials with masked tokens
       │
       ▼ [Stage 2: HTTPS Transport with Nonce & Request ID]
Encrypted transit to Next.js API Gateway (`/api/v1/*`)
       │
       ▼ [Stage 3: Server-Side Gateway Sanitization]
Zod schema validation + secondary PII scrub pass + Rate limit verification
       │
       ▼ [Stage 4: Risk Orchestration]
- If mode is "local": Evaluated 100% in-memory via deterministic heuristics
- If mode is "cloud": Pre-redacted payload transmitted to Gemini API
       │
       ▼ [Stage 5: Output Normalization]
Response mapped to standard normalized schema with privacy receipt
       │
       ▼ [Stage 6: Ephemeral Memory Purge]
All input strings and intermediate buffers dereferenced; zero logs written to disk
```

---

## 3. External Third-Party Disclosures

1. **Google Gemini API**:
   - Only queried when processing mode is explicitly toggled to `cloud` by the user.
   - Requires explicit user consent checkbox in the UI.
   - Receives only pre-redacted text strings (all PII, credentials, and SSNs masked).
   - Zero raw user inputs are retained or used for foundation model retraining.
