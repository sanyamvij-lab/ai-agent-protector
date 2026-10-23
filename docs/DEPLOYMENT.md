# AI Protector — Deployment & Setup Guide (Phase 1)

This document describes environment configuration, database setup, boot-time validations, and test execution for the Phase 1 Link-Scanner vertical slice.

---

## 1. Prerequisites

- **Node.js**: v20.x or later (LTS recommended)
- **Package Manager**: `npm` v10+ (or `pnpm`)
- **Database**: PostgreSQL 15+ (in production) or the built-in resilient in-memory SQLite/Postgres adapter (in development/test)
- **External Intel**: Google Cloud Project with the **Web Risk API** enabled (optional for development; required for live threat intel lookups)

---

## 2. Environment Configuration

Copy the template file to create your local environment:

```bash
cp .env.example .env.local
```

### Required & Optional Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | `development` | Runtime environment (`development`, `production`, `test`) |
| `PORT` | No | `3000` | HTTP port for Next.js application server |
| `APP_URL` | No | `http://localhost:3000` | Canonical origin for CORS restrictions |
| `DATABASE_URL` | Production | `postgresql://...` | Connection string to PostgreSQL instance |
| `SUPABASE_URL` | Production | - | URL of managed Supabase instance (if using Supabase Auth) |
| `SUPABASE_ANON_KEY` | Production | - | Public anon key for client-side authentication |
| `GOOGLE_WEB_RISK_API_KEY` | No | (empty) | Google Cloud API key with access to Web Risk Lookup API |
| `LOG_LEVEL` | No | `info` | Logging verbosity (`debug`, `info`, `warn`, `error`) |

### Boot-Time Validation

All environment variables are validated at server startup via `src/lib/config/env.ts` using a strict Zod schema. If an invalid or unparseable value is provided, the process will fail fast with a descriptive error message indicating the offending variable name.

If `GOOGLE_WEB_RISK_API_KEY` is omitted, the application will boot successfully, but link scans will honestly report `provider_status.state = "not_configured"` and status `unavailable`. **It will never falsely report "safe".**

---

## 3. Database & Migrations

### Schema Architecture
The database schema stores only privacy-preserving metadata (zero full raw URLs, zero browsing history):

- **`users`**: User identity, roles (`user`, `support`, `analyst`, `admin`), rate limit quotas.
- **`scans`**: `scan_id` (UUID), `user_id`, `host`, `url_hash` (SHA-256), `status`, `category`, `provider_status` (JSONB), `created_at`.
- **`false_positives`**: `id`, `scan_id`, `user_id`, `reason`, `reported_at`, `status`.

### Running Migrations

To apply migrations on PostgreSQL:

```bash
# Using standard psql
psql "$DATABASE_URL" -f src/lib/db/migrations/001_initial_schema.sql
```

In development or test environments without an active PostgreSQL instance, `src/lib/db/database.ts` automatically initializes an in-memory repository with the same schema and query semantics.

---

## 4. Running the Application

### Development Mode

```bash
npm run dev
```
The server will start at `http://localhost:3000`.

### Production Build & Launch

```bash
npm run build
npm run start
```

---

## 5. Running the Test Suite

All tests can be executed locally without external network dependencies:

### 1. Full Automated Test Suite
Runs all 40 unit and integration tests across both the Phase 1 Link-Scanner suite and the core security suites:

```bash
npm test
```

### 2. Live HTTP Endpoint Verification
Runs live HTTP verification against a running server at `http://localhost:3000`:

```bash
node test-phase1-live.mjs
```

This verifies:
- `401 Unauthorized` on unauthenticated requests.
- `400 Bad Request` on malformed URL schemes (e.g., `ftp://`).
- `201 Created` with full §5 compliant scan envelope on authenticated scans.
- `200 OK` when scan owners retrieve their scan.
- `404 Not Found` (anti-probing) when another user attempts to retrieve an unowned scan.
- `200 OK` when reporting false positives on owned scans.

---

## 6. Security & Invariant Checklist for Operators

1. **No Outbound Fetching of Target URLs:** Phase 1 never initiates an outbound HTTP/HTTPS connection to the scanned target URL. Lookups are strictly performed via the threat intelligence provider API.
2. **Redacted Logging:** Logs contain only the domain host and a SHA-256 hash of the normalized URL. Full URLs, authentication credentials, and query parameters are stripped before log writing.
3. **No False Safety Signals:** If external providers are offline, timed out, or unconfigured, the system reports status `unavailable`. It will never display a green or safe shield under error conditions.

---

## 7. Browser Extension (MV3) Setup & Loading

The AI Protector Manifest V3 browser extension is located in `src/extension/`.

### 7.1 Loading in Chromium (Chrome, Brave, Edge, Opera)
1. Open your browser and navigate to `chrome://extensions/` (or `edge://extensions/` / `brave://extensions/`).
2. Toggle **Developer mode** on (top-right corner).
3. Click **Load unpacked** (top-left).
4. Select the directory:
   ```
   <repo-root>/src/extension
   ```
5. The extension will appear with the shield icon and activate the background service worker.

### 7.2 Loading in Firefox Developer Edition / Nightly
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select `src/extension/manifest.json`.

### 7.3 Verifying Real-Time Protection
- Click the extension icon in the toolbar to inspect the current tab's reputation or perform on-demand link checks.
- Right-click any hyperlink on any page and click **"Scan Link with AI Protector"**.
- Try navigating to a test threat URL (e.g. `http://192.168.1.1/admin` or `https://paypal.secure-verification.net`); the extension intercepts the request and displays the Interstitial Warning page with verified evidence, "Return to Safety", and "Informed Override".

