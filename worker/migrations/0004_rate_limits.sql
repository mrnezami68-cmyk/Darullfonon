-- Purpose: add a small D1-backed mutation limiter for onboarding and privileged actions.
-- Impact: additive bucket table only; no existing user/content rows change.
-- Risk: D1-backed limits are a baseline, not a replacement for Cloudflare WAF/edge
--       limits or Clerk's own OAuth abuse controls at production scale.
-- Validation: verify window reset, 429/Retry-After, per-subject/IP keys and cleanup policy.
-- Rollback consideration: keep the table; disable callers with a reviewed forward fix.

CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  bucket_key TEXT PRIMARY KEY,
  window_started INTEGER NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count >= 0),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_updated ON rate_limit_buckets (updated_at);
