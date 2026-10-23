# AI Protector — API Integration Map

> **Rule:** Never invent endpoints. Document real contracts, payload sizes, timeouts, and fallback behaviors.

---

## 1. Endpoints Specification

### 1. `GET /api/health`
- **Purpose**: System health, uptime, memory, and provider readiness.
- **Auth**: Public / No auth required.
- **Response Schema**:
  ```json
  {
    "status": "healthy" | "degraded",
    "uptimeSeconds": 1420,
    "timestamp": "2026-10-22T19:30:00.000Z",
    "version": "1.0.0",
    "memoryMb": {
      "rss": 84,
      "heapUsed": 48
    },
    "providers": {
      "localHeuristics": "ready",
      "cloudAiGateway": "ready" | "fallback_only"
    }
  }
  ```

### 2. `POST /api/scan/message`
- **Purpose**: Scam, phishing, impersonation, and urgency assessment.
- **Max Payload**: 16 KB (`16,000` chars).
- **Rate Limit**: 30 requests / minute per client IP.
- **Request Schema**:
  ```json
  {
    "text": "string (min 1, max 16000)",
    "mode": "local" | "hybrid" | "cloud"
  }
  ```
- **Response Schema**: `MessageScanResult` (see `src/lib/types/index.ts`).
- **Fallback**: Automatically falls back to deterministic local heuristic engine on cloud timeout (6s) or missing API key.

### 3. `POST /api/scan/link`
- **Purpose**: Anti-SSRF URL inspection, typosquatting detection, punycode check.
- **Max Payload**: 2,048 chars.
- **Rate Limit**: 30 requests / minute per client IP.
- **Request Schema**:
  ```json
  {
    "url": "string (min 1, max 2048)",
    "mode": "local" | "hybrid" | "cloud"
  }
  ```
- **Response Schema**: `LinkScanResult` (see `src/lib/types/index.ts`).
- **Security Guard**: Does NOT dereference or fetch remote webpage contents; checks IP blocks against RFC 1918 / RFC 3927 to neutralize SSRF.

### 4. `POST /api/scan/claim`
- **Purpose**: Misinformation triage, claim decomposition, verification checklists.
- **Max Payload**: 8 KB.
- **Request Schema**:
  ```json
  {
    "claim": "string (min 1, max 8000)",
    "mode": "local" | "hybrid" | "cloud"
  }
  ```
- **Response Schema**: `ClaimVerifyResult` (see `src/lib/types/index.ts`).
