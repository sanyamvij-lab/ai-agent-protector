# AI Protector — Product Requirements Document (PRD)

> **Tagline:** Private by design. Trust by intelligence.  
> **Target Audience:** Everyday users, students, creators, and business professionals seeking private risk assessment.

---

## 1. Target User Personas & Core Use Cases

| Persona | Key Need | Primary Workflow |
|---|---|---|
| **Alex (Student / Everyday User)** | Verify urgent SMS or emails claiming accounts are locked or packages unpaid. | Pastes suspicious SMS into "Check a Message"; reviews detected urgency triggers and verified next steps. |
| **Priya (Creator / Freelancer)** | Verify sponsorship proposals, inbound contracts, and download links without malware exposure. | Uses "Check a Link" to detect typosquatting and "File Integrity" to calculate SHA-256 before running software. |
| **David (IT Lead / Security Conscious)** | Ensure team can triage threats without leaking confidential client data or proprietary code to public LLMs. | Enforces "Local Privacy Mode" with client-side PII scrubbing and zero server-side data retention. |

---

## 2. Functional Requirements (FR)

- **FR-1: Message Threat Scanner**
  - Accept text up to 16KB.
  - Automatically detect and visually flag PII (emails, phone numbers, SSNs, credentials) with live count before submission.
  - Output structured assessment: Risk Level (`low`, `suspicious`, `high_risk`), category, signal tags with plain-English rationales, uncertainty limits, and safe next actions.
- **FR-2: Safe Link Inspector**
  - Validate submitted URL syntax without visiting the destination in browser.
  - Decompose link into protocol (HTTPS vs HTTP), canonical host, network destination (Public vs Private/Loopback SSRF hazard), typosquatting targets, and punycode flags.
  - Deliver actionable next steps (e.g. "Visit official banking bookmark directly").
- **FR-3: Misinformation & Claim Triage**
  - Decompose multi-sentence claims into testable factual assertions vs. subjective sentiment.
  - Flag sensationalized clickbait language.
  - Provide direct links to established public fact-checking archives (Reuters, AP News, Snopes, Full Fact).
- **FR-4: Local Cryptographic File Integrity**
  - Compute SHA-256 and SHA-512 hashes 100% in-browser using Web Crypto API.
  - Accept drag-and-drop or file selection of any size without network transfer.
  - Support case-insensitive hash comparison with reference checksum.
  - Clearly educate users that cryptographic hashing confirms byte-level equality, not dynamic malware behavior.
- **FR-5: Privacy Center & Data Minimization**
  - Display active browser permission status (Geolocation = Disabled by default, Sensors = Untouched).
  - Provide a one-click "Nuclear Data Wipe" that purges all local storage and session state.
  - Present an interactive Data-Processing Transparency Matrix.
- **FR-6: Service Health & Telemetry**
  - Query real backend `/api/health` status for server uptime, memory, and route latency.
  - Display honest provider readiness indicators (Local heuristic engine vs. Cloud AI status).
- **FR-7: Processing Mode Control**
  - Allow user to toggle between `Local Privacy Mode`, `Hybrid Mode`, and `Cloud-Assisted AI`.
  - Require explicit user consent checkbox before transmitting any data in Cloud Mode.

---

## 3. Non-Functional Requirements (NFR)

- **NFR-1: Privacy by Design**: Zero raw messages, files, or browsing histories persisted to disk or external databases.
- **NFR-2: Security by Design**: Anti-SSRF filtering on all URL operations; API keys restricted to server-side environment variables.
- **NFR-3: Accessibility**: WCAG 2.2 Level AA compliance; full keyboard navigation; visible focus rings; ARIA live regions for async scan results.
- **NFR-4: Performance**: Local rule matching in <50ms; Web Crypto hashing in <500ms for standard documents; initial page load in <1.5s.
- **NFR-5: Responsive Layout**: Seamless experience across mobile (375px+), tablet (768px+), laptop (1024px+), and wide monitors (1440px+).

---

## 4. Explicit Non-Goals & Boundaries
1. **No Absolute Anonymity Claims**: The app will never claim to make users invisible to ISPs or network admins.
2. **No Location Harvesting**: Geolocation permissions are permanently turned off; basic features will never require GPS.
3. **No Automated Accusations**: The app flags patterns and signals, but never declares third-party individuals or sites definitively fraudulent without official evidence.
