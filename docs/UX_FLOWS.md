# AI Protector — UX Flows & State Transitions

> **Principle:** Every control has a defined action. Every operation has honest states.

---

## 1. Unified State Machine Across Modules

```
[Initial / Empty State]
       │
       ▼ (User enters input / drags file)
[Input State: Live Pre-flight Validation & PII Detection]
       │
       ▼ (User clicks primary action button)
[Loading State: Async Execution + Progress / Spinner + ARIA Announcement]
       │
       ├─────────────────────────┬─────────────────────────┐
       ▼                         ▼                         ▼
[Success State: Risk Verdict] [Partial / Warning]     [Error State: Safe Error]
  - Severity Badges             - Ambiguous Signal      - Meaningful Reason
  - Concrete Next Steps         - Uncertainty Notice    - Nonce / Retry Action
  - Privacy Receipt             - Secondary Guidance    - Local Fallback Option
```

---

## 2. Key User Journeys

### Journey 1: Suspicious Message / Smishing Assessment
1. **Entry**: User selects "Check a Message" from the sidebar.
2. **Input**: User pastes suspicious text.
3. **Live Pre-Flight Redaction**:
   - The UI immediately scans the text for sensitive patterns (SSN, credit card, phone, credentials).
   - If found, an emerald badge appears: `"2 sensitive items detected and masked for analysis"`.
4. **Execution**: User clicks `"Analyze Message"`.
   - The button shows an animated spinner and is disabled to prevent duplicate submissions.
   - Screen readers announce: `"Evaluating message risk patterns..."`.
5. **Result Display**:
   - Status badge appears (`High Risk`, `Suspicious`, or `No Warning Found`).
   - Signal cards detail matched keywords (e.g. `"Urgent account suspension within 24 hours"`).
   - Safe next steps provide clear instructions (e.g. `"Do not reply; contact institution via verified telephone"`).
   - Privacy receipt certifies: `"Processed locally in your browser with zero network transfer"`.
6. **Recovery / New Scan**: User clicks `"Clear"` or loads a new sample.

### Journey 2: Anti-SSRF Safe Link Inspection
1. **Entry**: User selects "Check a Link".
2. **Input**: User enters a target URL (e.g. `http://192.168.1.1/admin` or `http://paypa1-update.xyz`).
3. **Execution**: User clicks `"Audit Link"`.
4. **Technical Deconstruction View**:
   - Protocol check: flags unencrypted HTTP.
   - Route classification: flags private IP ranges as an SSRF hazard without making any network call to the target.
   - Typosquatting detector flags spoofed brand name (`PayPal`).
5. **Output**: Clear recommendation: `"Do not navigate to this address. It routes to an internal network interface."`

### Journey 3: Cryptographic File Integrity Verification
1. **Entry**: User selects "File Integrity".
2. **File Selection**: User drops or selects any software binary, document, or archive.
3. **Local Stream Hashing**:
   - Web Crypto computes SHA-256 and SHA-512 in client memory in <500ms.
   - No bytes leave the browser.
4. **Comparison**:
   - User pastes publisher's expected hash into the reference field.
   - System performs byte comparison and displays either:
     - 🟢 **Match Confirmed**: Byte-level integrity verified against publisher reference.
     - 🔴 **Mismatch Detected**: File has been altered, corrupted, or differs from the specified release.
5. **Education**: Clarifies that a matching hash proves file integrity, not dynamic malware safety.

### Journey 4: Nuclear Data Wipe
1. **Entry**: User navigates to "Privacy Center".
2. **Review**: User views the zero-location guarantee and active retention policies.
3. **Action**: User clicks `"Nuclear Data Wipe"`.
4. **Confirmation**: All `localStorage` history, cached hash calculations, and session metrics are erased.
5. **Feedback**: A success notification confirms complete local eradication.
