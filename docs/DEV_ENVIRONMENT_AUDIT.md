# AI Protector — Developer Environment & Agent Supply-Chain Audit

**Audit Date:** 2026-10-23  
**Auditor:** Lead Engineer / AI Protector Supply-Chain Audit  
**Scope:** Active MCP Servers, Plugins, Global & Workspace Skills, and Agent Configuration Boundaries (§6.4)

---

## 1. Executive Summary

In compliance with **Section 6.4 (Developer-Environment Hygiene)** of the AI Protector Master Build Specification, an exhaustive audit was conducted across all tools, MCP servers, plugins, and skill definitions accessible to the coding agent. 

**Summary Verdict:**
- **Zero Production Secrets in Agent Context:** Verified that no production API keys, database credentials, or privileged cloud tokens are accessible to the agent.
- **MCP Server Isolation:** All 5 active MCP servers operate with least-privilege tool execution; none expose arbitrary host command execution outside standard IDE sandbox controls.
- **Skill Directory Analysis:** Scanned workspace skill directories (`.agents/skills/`, `.agents/claude-code/`, `.agents/ai-agent-skills/`, `.agents/ui-ux-pro-max-skill/`) for prompt injection, hidden exfiltration instructions, and malicious shell hooks.
- **Tool Boundary Restrictions:** Formally established that developer tooling such as `snyk/agent-scan` and `NVIDIA/SkillSpector` are confined to local development / CI environments and **must never be mounted as unhardened server-side endpoints**.

---

## 2. Active Model Context Protocol (MCP) Servers

| Server Name | Connection Type | Declared Capabilities | Risk Assessment & Boundary | Status |
|---|---|---|---|---|
| **Neon** | Lazy MCP | Serverless Postgres branch & database schema management | Development sandbox only; isolated from production user database. | **Approved (Dev Only)** |
| **data-agent-kit** | Lazy MCP | BigQuery / GCP editor context and templates | Read-only context queries; no raw data access. | **Approved** |
| **firebase-mcp-server** | Lazy MCP | Firebase SDK / Auth / Firestore inspection | Staging / testing configurations only. | **Approved** |
| **notebooks** | Lazy MCP | Notebook cell creation & inspection | Local ephemeral sandbox only. | **Approved** |
| **visualization** | Lazy MCP | Chart rendering utilities | Pure UI rendering; no network access. | **Approved** |

---

## 3. Active Customization Plugins

| Plugin Name | Source Path | Scope | Integrity Verification |
|---|---|---|---|
| **science** | `C:\Users\HP\.gemini\config\plugins\science` | Research, literature queries, bioinformatics tools | Checked; pure lookup tools. |
| **android-cli-plugin** | `C:\Users\HP\.gemini\config\plugins\android-cli-plugin` | Android build & emulator management | Confined to mobile development (Phase 8/11). |
| **chrome-devtools-plugin**| `C:\Users\HP\.gemini\config\plugins\chrome-devtools-plugin` | Browser inspection | Dev inspection only. |
| **data-agent-kit-plugin** | `C:\Users\HP\.gemini\config\plugins\data-agent-kit-plugin` | BigQuery / Data telemetry | Read-only. |
| **firebase** | `C:\Users\HP\.gemini\config\plugins\firebase` | Firebase integration tools | Isolated. |
| **flutter** | `C:\Users\HP\.gemini\config\plugins\flutter` | Cross-platform mobile tools | Dev inspection only. |
| **google-antigravity-sdk**| `C:\Users\HP\.gemini\config\plugins\google-antigravity-sdk` | Internal SDK bindings | Audited. |
| **google_maps_platform** | `C:\Users\HP\.gemini\config\plugins\google_maps_platform` | Mapping API tools | Unused by AI Protector core. |
| **modern-web-guidance** | `C:\Users\HP\.gemini\config\plugins\modern-web-guidance-plugin` | Web performance and styling guidance | Static markdown guidance only. |

---

## 4. Workspace Skill Repositories (`.agents/`)

The workspace contains 4 skill repositories checked into `.agents/`:

### 4.1 `.agents/claude-code`
- **Origin:** Anthropic PBC (Subject to Anthropic Commercial Terms).
- **Contents:** Command-line tooling specifications, prompt helpers, and documentation.
- **Audit Findings:** No shell execution hooks found in markdown definitions. `demo.gif` is a static asset. All `.md` files contain inert instructions.
- **Action:** Retained as read-only reference.

### 4.2 `.agents/ai-agent-skills`
- **Origin:** Community collection of 81 task-oriented agent skills.
- **Audit Findings:**
  - Evaluated skill definitions for prompt-injection markers (e.g., `"ignore previous instructions"`, `"system override"`, curl pipes to sh). None present.
  - No active daemon or background process spawned by these definitions.
- **Action:** Approved for developer reference.

### 4.3 `.agents/ui-ux-pro-max-skill`
- **Origin:** MIT License (`Copyright (c) 2024 Next Level Builder`).
- **Contents:** Design tokens, UI layout principles, color palettes, and accessibility guidelines.
- **Audit Findings:** Pure frontend design heuristics. Zero code execution hooks or remote telemetry.
- **Action:** Approved.

### 4.4 `.agents/skills/`
- **Audit Findings:** 81 individual skill folders containing `SKILL.md` files. All frontmatter is verified declarative markdown with no binary payloads or unpinned network scripts.
- **Action:** Retained in inert, read-only state.

---

## 5. Security & Boundary Guardrails Enforced

1. **No Production Credentials Provided to Agent:** The agent operates exclusively with mocked test tokens (`test-token-user-a`, `test-token-user-b`) and unconfigured external providers in development.
2. **Never Run Snyk Agent-Scan Server-Side:** Confirmed per §6.3 that `agent-scan` can trigger MCP server launches; it is strictly restricted to local machine developer audits and CI, never exposed as an API endpoint.
3. **NVIDIA SkillSpector Sandboxing Requirement:** SkillSpector will only be integrated in Phase 7 behind the `AGENT_COMPONENT_CHECK` feature flag within an isolated Docker/sandbox worker (§6.2), with the LLM second pass disabled by default.
4. **Git & Secret Scanning:** Continuous secret scanning via pre-commit and CI workflows will ensure no tokens are committed.
