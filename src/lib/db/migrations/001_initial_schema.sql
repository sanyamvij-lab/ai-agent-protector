-- AI Protector — Initial Schema Migration (Phase 1)
-- Stores minimum metadata only. NEVER stores raw URLs, query parameters, or credentials.

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(32) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scans (
    scan_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(32) NOT NULL DEFAULT 'url',
    host VARCHAR(255) NOT NULL,
    url_hash VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    category VARCHAR(64) NOT NULL,
    provider_status JSONB NOT NULL,
    evidence JSONB NOT NULL,
    explanation TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    limitations JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for user scan history and anti-probing lookups
CREATE INDEX IF NOT EXISTS idx_scans_user_created ON scans (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_url_hash ON scans (url_hash);

CREATE TABLE IF NOT EXISTS false_positives (
    id VARCHAR(64) PRIMARY KEY,
    scan_id VARCHAR(64) NOT NULL REFERENCES scans(scan_id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
