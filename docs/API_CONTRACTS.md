# AI Protector — API Contracts (v1 Specification)

> **Base Path:** `/api/v1`  
> **Protocol:** HTTPS / JSON  
> **Headers:** `Content-Type: application/json`, `x-request-id: <opaque-id>` (optional in request, guaranteed in response)

---

## 1. Standard Envelope Conventions

### Success Envelope (Normalized Scan Result)
```json
{
  "request_id": "req-1729612800000-abc123",
  "status": "completed",
  "assessment": "high_risk" | "suspicious" | "low" | "unverified",
  "confidence_score": 0.92,
  "summary": "High risk detected. Identified 2 critical security indicators.",
  "signals": [
    {
      "code": "urgency_pressure",
      "label": "Artificial Urgency & Coercive Pressure",
      "category": "urgency",
      "severity": "high",
      "description": "Scammers induce panic with artificial deadlines."
    }
  ],
  "evidence": [],
  "uncertainty": {
    "level": "low" | "moderate" | "high",
    "explanation": "Direct heuristic pattern match confirmed."
  },
  "processing": {
    "mode": "local" | "hybrid" | "cloud",
    "provider": "local_heuristics" | "gemini_1.5_flash"
  },
  "safe_next_steps": [
    "Do NOT reply, click any embedded links, or call the phone number provided."
  ],
  "limitations": [
    "Heuristic text classification identifies structural risk patterns, not sender identity verification."
  ],
  "privacy_receipt": {
    "processed_locally": true,
    "pii_scrubbed_count": 1,
    "network_transferred": false
  }
}
```

### Standard Error Envelope
```json
{
  "error": {
    "code": "VALIDATION_ERROR" | "RATE_LIMIT_EXCEEDED" | "PAYLOAD_TOO_LARGE" | "INTERNAL_ERROR",
    "message": "Human-readable description of error.",
    "request_id": "req-1729612800000-abc123"
  }
}
```

---

## 2. Endpoints Catalog

### 1. `POST /api/v1/scans/messages`
- **Request Body**:
  ```json
  {
    "text": "string (min 1, max 16000)",
    "mode": "local" | "hybrid" | "cloud"
  }
  ```
- **Responses**: `200 OK` (Normalized Scan Result), `400 Bad Request`, `429 Rate Limited`.

### 2. `POST /api/v1/scans/urls`
- **Request Body**:
  ```json
  {
    "url": "string (min 1, max 2048)",
    "mode": "local" | "hybrid" | "cloud"
  }
  ```
- **Responses**: `200 OK` (Link Scan Result), `400 Bad Request`, `429 Rate Limited`.

### 3. `POST /api/v1/claims/verify`
- **Request Body**:
  ```json
  {
    "claim": "string (min 1, max 8000)",
    "mode": "local" | "hybrid" | "cloud"
  }
  ```
- **Responses**: `200 OK` (Claim Verify Result), `400 Bad Request`.

### 4. `POST /api/v1/files/hash`
- **Request Body**:
  ```json
  {
    "content_base64": "string",
    "file_name": "string",
    "comparison_hash": "string (optional)"
  }
  ```
- **Responses**: `200 OK` (SHA-256 and SHA-512 calculated with match verdict).

### 5. `POST /api/v1/files/compare-hash`
- **Request Body**:
  ```json
  {
    "calculated_hash": "string (64 chars hex)",
    "reference_hash": "string (64 chars hex)"
  }
  ```
- **Responses**: `200 OK` (`{ "is_match": true | false, "explanation": "..." }`).

### 6. `GET /api/v1/health/live` & `GET /api/v1/health/ready`
- **Responses**: `200 OK` (`{ "status": "healthy", "uptime_seconds": 120 }`).

### 7. `GET /api/v1/status/providers`
- **Responses**: `200 OK` (Safe, non-secret availability of local heuristics and cloud gateway).

### 8. `GET /api/v1/privacy/audit`
- **Responses**: `200 OK` (Verification of zero geolocation, zero sensor access, and zero server storage).
