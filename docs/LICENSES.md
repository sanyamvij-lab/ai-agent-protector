# AI Protector — Open-Source Engine & Data License Register

**Last Updated:** 2026-10-23  
**Status:** Actively Maintained (§6.5 Compliance)

---

## 1. Engine & Tool License Matrix

| Component / Tool | Upstream Repository | Version / Tag | Code License | Data License / Terms | Integration Boundary in AI Protector | Attribution & Compliance Duty |
|---|---|---|---|---|---|---|
| **OpenSSF Scorecard** | `ossf/scorecard` | v5.x / Action v2.4.0 (pinned by SHA) | **Apache-2.0** | **CDLA-Permissive-2.0** (REST API precomputed data) | CI gate for this repo (Phase 1); REST API lookup for `github_repo` targets (Phase 6). | Include Apache-2.0 copyright notice. Preserve CDLA-Permissive-2.0 notice when caching/displaying API data. |
| **YARA-X** (Successor to YARA) | `VirusTotal/yara-x` | 0.12+ (Rust) | **BSD-3-Clause** | N/A (Rulesets licensed separately) | File/attachment scanning (Phase 5) strictly inside worker sandbox. | Retain BSD copyright notice. |
| **YARA Community Rulesets** | Multiple (e.g. Neo23x0, ReversingLabs) | Curated | **GPL-2.0 / GPL-3.0 / Apache-2.0** (mixed) | N/A | Must NOT bundle GPL rulesets into proprietary or commercial distribution without legal clearance. Prefer internal or Apache/MIT rulesets. | Check each rule file license before bundling. |
| **NVIDIA SkillSpector** | `NVIDIA/SkillSpector` | 0.2+ | **Apache-2.0** | OSV.dev terms for advisory database | Optional "Agent Component Check" (Phase 7, behind `AGENT_COMPONENT_CHECK` flag). Sandboxed static analysis only. | Include NVIDIA Apache-2.0 license notice and disclaimer. |
| **Snyk agent-scan** | `snyk/agent-scan` | Latest via PyPI (`uvx`) | **Apache-2.0** | Snyk Service Terms | **Developer machine and CI tooling ONLY.** NEVER run server-side or mount as API endpoint. | Retain Snyk Apache-2.0 notice for CLI distribution. |
| **awesome-ai-security-tools** | `scadastrangelove/awesome-ai-security-tools` | Main branch | **Mixed / Non-standard** | N/A | **Research & discovery catalog ONLY.** Never auto-clone or run tools blindly. | Comply with individual licenses of any tool evaluated. |
| **Google Web Risk API** | Google Cloud | v1 REST | Proprietary API client | Google Cloud Terms of Service | Core URL threat intelligence lookup adapter (Phase 1). | 100,000 queries/month free tier; paid tier beyond. Obey attribution and acceptable use policy. |
| **Next Level Builder UI/UX Pro Max** | `.agents/ui-ux-pro-max-skill` | 2024 Release | **MIT** | N/A | Design system and layout heuristics. | Retain MIT copyright notice: `Copyright (c) 2024 Next Level Builder`. |
| **Anthropic Claude Code Tooling** | `.agents/claude-code` | Reference | **Anthropic Commercial Terms** | N/A | Read-only agent assistance reference. | Subject to Anthropic Terms of Service. |

---

## 2. Invariant Rules for Open-Source Security Tools

1. **GPL Contamination Defense:**
   - Any community YARA rules containing GPL licenses must be kept separate from the core TypeScript application codebase. In Phase 5, rules will be loaded dynamically at runtime inside an isolated, containerized scanner worker (`/opt/rules/`), preserving modular isolation.
2. **Data-Only Use of OpenSSF Scorecard Data:**
   - Pre-computed Scorecard results fetched via `https://api.securityscorecards.dev/projects/...` are distributed under **CDLA-Permissive-2.0**. AI Protector provides appropriate attribution and includes the date computed.
3. **No Execution of User Content:**
   - All input targets (files, archives, repositories, skills) are treated as untrusted binary/text data. Under no circumstances will submitted code be compiled, built, imported, or executed on the host server.
4. **Attribution File Generation:**
   - Prior to any production binary or docker container build, an automated script will generate an updated `THIRD_PARTY_LICENSES.txt` incorporating all dependencies and engine notices.
