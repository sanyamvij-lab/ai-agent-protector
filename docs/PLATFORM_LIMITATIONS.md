# AI Protector — Platform Reality & Technical Boundaries

**Last Updated:** 2026-10-23  
**Auditor:** Lead Security Engineer  
**Scope:** Browser Extension (MV3), Mobile Web, PWA, and Operating System Capabilities (§7)

---

## 1. Platform Reality Matrix

| Capability | Chromium (MV3) | Firefox (MV2 / MV3) | Android | iOS |
|---|---|---|---|---|
| **Warn on navigation to flagged URL** | **Supported** via `webNavigation` + dynamic redirection or `declarativeNetRequest`. Best pattern: `webNavigation.onBeforeNavigate` with redirect to local interstitial page `chrome-extension://.../warning.html`. | **Supported** via `webNavigation`. Note: Firefox background scripts support persistent scripts or event pages; MV3 uses event-driven background. | **Browser-dependent.** Standard browser navigation cannot be intercepted externally. Supported only inside Firefox/Kiwi extensions or custom browser apps. OS-wide VPN/Accessibility interceptors carry severe privacy & policy hazards. | **Safari Extension only** via Declarative Web Request or content blocker rules. Direct app-level interception across third-party apps is blocked by iOS sandbox. |
| **User-initiated scan (context menu / share)** | **Supported** via `chrome.contextMenus` API (`contexts: ["link", "selection"]`). | **Supported** via `browser.contextMenus` API. | **Supported** via Web Share Target API / PWA manifest or native Android Share Sheet intent filter. | **Supported** via iOS Action / Share Extension or Safari Share Sheet. |
| **Clear cookies / site data (user-scoped)** | **Supported** via `chrome.browsingData` and `chrome.cookies` APIs with optional permissions requested at runtime. | **Partially supported**; differences in cookie partition storage and container tabs. | **Not programmatic from a website.** Browser sandbox prevents web apps from deleting local browser state; guidance/deep links only. | **Not programmatic.** Safari sandbox strictly prohibits external cookie/data deletion; user guidance only. |
| **Intercept links clicked in other apps** | **Not possible.** Extensions are strictly sandboxed inside the browser process. | **Not possible.** Same browser boundary. | **Not recommended / High Policy Risk.** Technically feasible only via Accessibility Services or local VPN loopback, but violates Google Play policy without strict accessibility justifications. | **Not possible.** iOS operating system architecture strictly isolates apps and enforces default browser routing. |
| **Delete server-side data held by companies** | **Not possible.** Extensions cannot force a third-party server to delete its database records. | **Not possible.** Same constraint. | **Not possible.** | **Not possible.** |

---

## 2. Chromium MV3 vs. Firefox MV3 Nuances

### 2.1 Service Workers vs. Background Event Pages
- **Chromium MV3:** Background scripts are strictly ephemeral **Service Workers**. They do not maintain in-memory state between wakeups. All state (trusted domains, cached scan results, authentication tokens) must be persisted in `chrome.storage.local` or `chrome.storage.session`. DOM manipulation (`document.createElement`) is unavailable in the background service worker.
- **Firefox MV3:** Supports background event pages and is transitioning to background service workers. Polyfill `webextension-polyfill` or standard `chrome.*` / `browser.*` namespace mapping ensures dual-browser interoperability.

### 2.2 Navigation Interception Patterns
- `declarativeNetRequest` (DNR): Fast, declarative rule evaluation handled directly by the browser engine without waking the service worker. However, DNR cannot perform asynchronous threat-intelligence API lookups on arbitrary dynamic URLs without pre-compiling tens of thousands of static rules.
- `webNavigation.onBeforeNavigate`: Allows listening to navigation attempts. When a non-internal URL (`http:`, `https:`) is navigated to, the extension checks:
  1. Is the URL an internal extension page (`chrome-extension://`)? If so, ignore.
  2. Is the domain in the user's local `trusted_sites` list? If so, allow.
  3. Does the URL have an active "informed override" session token? If so, allow.
  4. Query the AI Protector API (`POST /api/v1/scans`).
  5. If `known_malicious` or `suspicious`, redirect tab to `interstitial/warning.html?url=...&scan_id=...`.

### 2.3 Least-Privilege Permission Model
- **Core Permissions:**
  - `webNavigation`: Required to intercept high-risk navigation before page rendering.
  - `storage`: Required for local trusted sites, user preferences, and ephemeral override tokens.
  - `contextMenus`: Required for right-click link inspection without monitoring all page clicks.
- **Optional Host Permissions:**
  - Rather than requesting `<all_urls>` by default, the extension requests access only to the user's configured AI Protector backend origin (`http://localhost:3000` or production domain).
