# AI Protector — API & Security Engine Integrations Specification

This document details official upstream specifications, pricing, licenses, timeouts, failure mapping, and data boundaries for all external threat-intelligence providers and open-source security engines (§2 Rule 9 & §6).

---

## 1. Google Web Risk API (Lookup API v1)

| Specification Field | Implementation Detail |
| :--- | :--- |
| **Provider Name** | Google Cloud Web Risk |
| **API Version** | `v1` (Lookup API) |
| **Purpose** | Match submitted URLs against Google's authoritative threat lists to detect known malware, social engineering (phishing), and unwanted software. |
| **Setup URL** | [https://cloud.google.com/web-risk/docs/lookup-api](https://cloud.google.com/web-risk/docs/lookup-api) |
| **Required Permissions** | `webrisk.uris.lookup` (Enable "Web Risk API" in Google Cloud Console) |
| **Environment Secret Name** | `GOOGLE_WEB_RISK_API_KEY` (or `WEBRISK_API_KEY`) |
| **Endpoint URL** | `https://webrisk.googleapis.com/v1/uris:lookup` |
| **HTTP Method** | `GET` |
| **Query Parameters** | `key=<KEY>&uri=<NORMALIZED_URI>&threatTypes=MALWARE&threatTypes=SOCIAL_ENGINEERING&threatTypes=UNWANTED_SOFTWARE` |
| **Data Sent** | Normalized URL string (credentials stripped, fragments removed). |
| **Timeout Policy** | 3,000 milliseconds (enforced via `AbortController`). |
| **Retry Policy** | Maximum 1 retry on 5xx or network timeout. **Zero retries** on 4xx client errors or HTTP 429 quota exhaustion. |
| **Failure Behavior** | If unconfigured: returns `state: "not_configured"`.<br>If timeout: returns `state: "timeout"`.<br>If 429: returns `state: "quota"`.<br>If error: returns `state: "error"`.<br>Synthesizes overall scan status to `unavailable`. Never defaults to "safe". |
| **Pricing & Quotas** | - First 100,000 requests per month: **Free**.<br>- Beyond 100,000 requests: $0.25 per 1,000 requests.<br>- Rate quota: 600 requests per minute per project.<br>- Commercial use permitted under Google Cloud Terms of Service. |

---

## 2. OpenSSF Scorecard (ossf/scorecard)

| Specification Field | Implementation Detail |
| :--- | :--- |
| **Provider Name** | OpenSSF Scorecard |
| **Repository** | [https://github.com/ossf/scorecard](https://github.com/ossf/scorecard) |
| **Action** | `ossf/scorecard-action` (pinned by commit SHA in `.github/workflows/scorecard.yml`) |
| **REST API Endpoint** | `https://api.securityscorecards.dev/projects/{platform}/{org}/{repo}` |
| **License (Code / Data)** | Code: **Apache-2.0** / Public REST API Data: **CDLA-Permissive-2.0** |
| **Purpose** | (a) **Phase 1 CI Gate:** Automate supply-chain posture auditing of AI Protector's repository (branch protection, pinned dependencies, token permissions).<br>(b) **Phase 6 Product Feature:** Retrieve precomputed supply-chain posture scores for `github_repo` targets. |
| **Data Sent** | Public repository identifier (`github.com/org/repo`) only. No source code or tokens transmitted. |
| **Failure & Posture Rule** | **Posture is NOT threat status.** Scorecard output is mapped to `posture: { source: "scorecard", score, checks }`. A low score indicates weaker hygiene, NOT malware. Absence of precomputed data returns status `inconclusive`. A high score never guarantees safety. |
| **Pricing & Quotas** | Public API is free, cached, rate-limited by IP/user-agent. |

---

## 3. VirusTotal YARA-X (VirusTotal/yara-x)

| Specification Field | Implementation Detail |
| :--- | :--- |
| **Engine Name** | YARA-X (Official successor to legacy C YARA) |
| **Repository** | [https://github.com/VirusTotal/yara-x](https://github.com/VirusTotal/yara-x) |
| **Status** | Legacy `VirusTotal/yara` is in maintenance mode. YARA-X is the active, Rust-based engine used in production at VirusTotal. |
| **License** | **BSD-3-Clause** |
| **Purpose** | File and attachment scanning (Phase 5). High-performance pattern matching against compiled rule signatures. |
| **Worker Sandbox Isolation** | Executed strictly inside an isolated worker container (§6.2): non-root, read-only filesystem, no network access, memory & CPU limits, tmpfs scratch wiped after each job. |
| **Rule Metadata & Contract** | Rules must specify `id`, `source`, `license`, `confidence` (`high \| medium \| low`). Only `high`-confidence named-family signatures may yield `known_malicious`. All other matches yield `suspicious`. |
| **Licensing Constraint** | Community rulesets are frequently GPL-licensed. Do NOT bundle GPL rules into commercial bundles without legal review. Curate internal and permissively licensed rules. |

---

## 4. NVIDIA SkillSpector (NVIDIA/SkillSpector)

| Specification Field | Implementation Detail |
| :--- | :--- |
| **Engine Name** | NVIDIA SkillSpector |
| **Repository** | [https://github.com/NVIDIA/SkillSpector](https://github.com/NVIDIA/SkillSpector) |
| **License** | **Apache-2.0** |
| **Upstream Requirements** | Python 3.12+; static AST parser, taint tracker, OSV.dev advisory lookups. |
| **Purpose** | (a) **Dogfooding:** CI audit of skills and instruction files committed to this repo.<br>(b) **Phase 7 Optional Module:** "Agent Component Check" for developers, behind `AGENT_COMPONENT_CHECK` feature flag. |
| **Known Upstream Issue** | Do **not** install unpinned `mcp` extra on the server (resolves to breaking 2.x releases). |
| **Execution Rules** | Static analysis only by default. The LLM second pass is strictly **disabled** unless the user explicitly opts in per scan with cloud disclosure. Submitted skills are parsed as untrusted text/AST—never executed. |
| **Threat Mapping** | Critical/high static findings map to `suspicious` (category: `prompt_injection` or `supply_chain`). Never maps to `known_malicious` without a curated high-confidence signature. |

---

## 5. Snyk agent-scan (snyk/agent-scan)

| Specification Field | Implementation Detail |
| :--- | :--- |
| **Tool Name** | Snyk Agent Scan |
| **Repository** | [https://github.com/snyk/agent-scan](https://github.com/snyk/agent-scan) |
| **License** | **Apache-2.0** |
| **Role & Restriction** | **DEVELOPER TOOLING AND CI ONLY.** |
| **Critical Hazard** | Scanning an MCP configuration file can trigger agent-scan to **launch the configured MCP servers**, and contacts Snyk's backend service. |
| **Invariant** | **NEVER run server-side or wrap as an API endpoint.** Documented exclusively as an optional CLI checklist for developers auditing their local environments. |

---

## 6. awesome-ai-security-tools (scadastrangelove/awesome-ai-security-tools)

| Specification Field | Implementation Detail |
| :--- | :--- |
| **Catalog Name** | Awesome AI Security Tools |
| **Repository** | [https://github.com/scadastrangelove/awesome-ai-security-tools](https://github.com/scadastrangelove/awesome-ai-security-tools) |
| **License** | Mixed / Non-standard across listed tools. |
| **Role & Restriction** | **RESEARCH AND DISCOVERY ONLY.** |
| **Invariant** | Never auto-clone or execute repositories listed in the catalog. Every tool evaluated must undergo license verification, Scorecard check, and manual security review before adoption. |
