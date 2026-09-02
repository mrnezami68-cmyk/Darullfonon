-- Purpose: add the minimum D1 application identity and Teacher approval model for Clerk.
-- Impact: additive only; existing content, progress and quiz data are untouched.
-- Risk: existing Demo user_id values are not backfilled or trusted. A later, separately
--       approved mapping is required before adding ownership foreign keys to those tables.
-- Validation: apply locally, inspect CHECK/UNIQUE/FK constraints, test concurrent identifier
--             creation and Teacher status transitions before any remote apply.
-- Rollback consideration: do not run a destructive down migration against user data;
--                         use a reviewed forward fix or an approved D1 restore.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('clerk')),
  provider_subject TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'master', 'admin')),
  status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'rejected', 'suspended')),
  email TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0 CHECK (email_verified IN (0, 1)),
  login_identifier TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_at TEXT,
  verified_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  rejection_reason TEXT
);

CREATE TABLE IF NOT EXISTS teacher_applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'rejected', 'suspended')),
  teaching_field TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  reviewed_at TEXT,
  reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth_revoked_tokens (
  jti TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  revoked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_role_status ON users (role, status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_teacher_applications_status ON teacher_applications (status, updated_at);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expiry ON auth_revoked_tokens (expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs (target_type, target_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor_user_id, created_at);
