# AI Protector — Database & Data Architecture Specification

> **Principle:** Never persist raw messages, uploaded files, or full prompts. Store only what the user explicitly chooses to retain.

---

## 1. Minimal Data Schema (PostgreSQL / SQLite Compatible)

While AI Protector MVP runs ephemerally in-memory, the following entities are specified for optional authenticated session and audit logging:

```sql
-- 1. User Account & Identity Reference
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_provider_id VARCHAR(255) NOT NULL UNIQUE,
    email_masked VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Privacy & Processing Settings
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    default_processing_mode VARCHAR(20) NOT NULL DEFAULT 'local', -- 'local', 'hybrid', 'cloud'
    cloud_ai_consent_granted BOOLEAN NOT NULL DEFAULT FALSE,
    cloud_ai_consent_date TIMESTAMP WITH TIME ZONE,
    history_retention_days INT NOT NULL DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Sanitized Scan Metadata (Zero Raw Content)
CREATE TABLE scan_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    request_id VARCHAR(64) NOT NULL UNIQUE,
    scan_type VARCHAR(32) NOT NULL, -- 'message', 'link', 'claim', 'file_hash'
    risk_level VARCHAR(20) NOT NULL, -- 'low', 'suspicious', 'high_risk', 'unverified'
    category VARCHAR(64),
    signals_count INT NOT NULL DEFAULT 0,
    pii_scrubbed_count INT NOT NULL DEFAULT 0,
    processing_mode VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing for fast user history pagination
CREATE INDEX idx_scan_metadata_user_created ON scan_metadata(user_id, created_at DESC);

-- 4. Minimal Audit Events (Security Log)
CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(64) NOT NULL, -- 'AUTH_SUCCESS', 'CONSENT_GRANTED', 'DATA_PURGED'
    client_ip_hash VARCHAR(64) NOT NULL, -- One-way salted hash of IP (k-anonymity)
    request_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 2. Retention & Deletion Lifecycle

1. **Immediate In-Memory Eviction**: In MVP and local privacy mode, scan payloads (`text`, `urls`, `files`) are dereferenced immediately after the response streams to the client.
2. **Right to Be Forgotten (`DELETE /api/v1/me/history`)**:
   - Cascades deletion across `scan_metadata` and local storage entries.
   - Leaves zero residual records of scans.
