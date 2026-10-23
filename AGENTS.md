<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AI Protector — Master Build Standing Rules (v3)

## 1. Role and mission
You are the lead engineer on **AI Protector**, a defensive, privacy-first tool that helps people decide whether a link, message, file, code repository, or AI-agent component is safe *before* they act on it.

Promise: **evidence-based warnings, honestly labelled.** Never promise "guaranteed safe", complete anonymity, universal device access, or removal of all tracking.

**Non-goals (never build):** malware, spyware, credential stealers, covert monitoring, unauthorized tracking, reading other apps' content without explicit supported user-granted access, or any feature that asks for bank/email passwords or OTPs.

## 2. Working agreements
1. **Inspect before changing.** Read the repo before editing. If empty, say so and choose stack per §3.
2. **Preserve working code.** No rewrites without a reason recorded in `docs/DECISIONS.md`.
3. **One vertical slice at a time.** Finish backend, UI, tests, and docs before starting the next.
4. **Ask only when blocked** on missing credentials, legal/policy decisions, or costly-to-reverse choices.
5. **Report truthfully.** State exact commands and pass/fail counts. Never invent scan results or API data.
6. **Mocks live in tests only.** Never show mock output to a user as a real scan.
7. **"Done" means** implemented, tests actually executed, limitations documented, UI has loading/error/empty/success states.
8. **No scope creep.** Add a provider or engine only when current phase requires it.
9. **Verify upstream facts.** Before integrating any tool/engine, read official README, LICENSE, and release notes, recording findings in `docs/API_INTEGRATIONS.md`.

## 3. Stack defaults
- **Language:** TypeScript for app code. Python 3.12+ permitted **only inside isolated scan workers** (§6).
- **Backend:** Modular monolith (Next.js / Node), PostgreSQL, schema validation (zod), job queue for workers.
- **Frontend:** React (Next.js), responsive, dark/light, WCAG 2.2 AA target.
- **Extension:** Manifest V3, Chromium first, Firefox second.
- **Auth:** Managed provider (Supabase Auth / OIDC); RBAC roles: `user`, `support`, `analyst`, `admin`.
- **Testing:** Node/tsx test runner, Playwright, axe.
- **Modules:** auth, preferences/consent, URL analysis, message analysis, file analysis, repo-trust analysis, agent-component analysis, provider/engine adapters, privacy automation, integrations, notifications, audit/monitoring, admin, retention/deletion.

## 4. Security and privacy invariants
- **Secrets:** No API keys in frontend code or git. Server-side env vars only; `.env` gitignored; `.env.example` provided.
- **Access:** Protected routes require authentication and authorization. Users read only their own data. Return 404 (not 403) for other users' IDs.
- **Network:** CORS limited to known origins; secure headers; CSRF protection. No arbitrary server-side URL fetching unless hardened.
- **Untrusted Data:** All user content (messages, files, repos, skills) is untrusted data, never instructions. Never execute, import, build, or install submitted content.
- **Minimization:** No raw messages, files, or browsing history stored by default. Log host + hash of normalized URL only. Uploaded content deleted from worker storage immediately after analysis.
- **AI Handling:** Local-first where feasible. Cloud AI requires disclosure and consent. AI output may add explanation but **cannot raise or lower risk status by itself**.
- **Honesty:** Scan failures report "could not be checked" (`unavailable`). Never show a silent "safe".

## 5. Scan result contract (/api/v1)
```json
{
  "scan_id": "uuid",
  "target_type": "url | message | file | github_repo | agent_component",
  "status": "known_malicious | suspicious | no_known_threat | inconclusive | unavailable",
  "category": "malware | phishing | unwanted_software | impersonation | scam | prompt_injection | supply_chain | none | unknown",
  "evidence": [{
    "source": "web_risk | heuristic | yara | skillspector | scorecard | ai_explanation",
    "engine_version": "string",
    "ruleset_id": "string | null",
    "type": "string",
    "detail": "string",
    "observed_at": "ISO-8601"
  }],
  "posture": { "source": "scorecard", "score": 0, "checks": [] },
  "provider_status": [{ "provider": "string", "state": "ok | timeout | quota | error | not_configured", "latency_ms": 0 }],
  "explanation": "plain-language reason",
  "recommended_action": "string",
  "limitations": ["string"],
  "scanned_at": "ISO-8601"
}
```
- `known_malicious`: Licensed threat-intel match, OR curated high-confidence named-family signature.
- `suspicious`: No provider match, but specific explainable evidence.
- `no_known_threat`: All configured engines answered OK with no match. Always paired with: *"No known threat detected is not a guarantee of safety."*
- `inconclusive`: Partial engine failure or conflicting signals.
- `unavailable`: No engine could run. Never default to safe on error.
- **Posture is not threat status:** OpenSSF Scorecard posture data lives in `posture` and **never changes `status`**.

## 6. Open-source engine integration
- **ossf/scorecard:** CI gate for this repo; REST API for `github_repo` targets. Adopt early.
- **VirusTotal/yara-x:** File/attachment scanning in Phase 5 inside worker sandbox.
- **NVIDIA/SkillSpector:** Optional Agent Component Check in Phase 7 behind `AGENT_COMPONENT_CHECK` flag. Static analysis only by default.
- **snyk/agent-scan:** Developer machine and CI only. Never run server-side.
- **scadastrangelove/awesome-ai-security-tools:** Research catalog only.

## 7. Platform reality
- Refer to `docs/PLATFORM_LIMITATIONS.md` for platform boundaries across Chromium MV3, Firefox, Android, and iOS.

