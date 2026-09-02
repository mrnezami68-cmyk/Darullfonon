-- Purpose: persist the minimum Quiz result needed by the Student vertical slice.
-- Risk: additive table only; existing learning/content data is untouched.
-- Validation: apply migration locally and submit one seeded Quiz.

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  passed INTEGER NOT NULL CHECK (passed IN (0, 1)),
  answers_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON quiz_attempts (quiz_id, created_at);
