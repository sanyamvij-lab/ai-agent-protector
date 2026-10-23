# AI Protector — Observability & Incident Response

---

## 1. Structured Logging Rules
- Logs must be emitted in structured JSON format.
- Every entry must include `timestamp`, `level`, `request_id`, and `module`.
- **Zero Raw PII in Logs**: User message contents, raw files, passwords, or authorization tokens are strictly redacted before output.

```json
{
  "timestamp": "2026-10-22T20:00:00.000Z",
  "level": "info",
  "request_id": "req-1729612800000-xyz",
  "module": "api/v1/scans/messages",
  "action": "scan_completed",
  "risk_level": "high_risk",
  "pii_entities_scrubbed": 2,
  "duration_ms": 14
}
```

---

## 2. Incident Runbooks

### Runbook 1: Exposed AI Provider Key
1. **Containment**: Rotate or revoke the key immediately in Google AI Studio / Cloud Console.
2. **Mitigation**: Update the server environment variable (`GEMINI_API_KEY`).
3. **Verification**: Restart the service and test `/api/v1/status/providers`.
4. **Audit**: Review git commit history and deployment logs to confirm no plaintext key remains.

### Runbook 2: Cloud Provider Outage / High Latency
1. The AI Gateway automatically catches 6-second timeouts and falls back to deterministic local rule heuristics.
2. The user receives a completed scan marked with `mode: "hybrid" (fallback engine)`.
3. No user request fails or stalls.
