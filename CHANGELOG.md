# Changelog

## Unreleased — 2026-09-02

### Added

- Phase 1 L1 Cloudflare Worker API
- Local D1 schema and migration with seed data
- Course, Chapter, Lesson and Progress endpoints
- Master content Create, Read, Update and Archive endpoints
- API and security documentation

### Fixed

- Invalid default Faculty ID during Course creation
- Worker TypeScript typecheck conflict between DOM and Workers types
- Master content validation requiring generated IDs and slugs
- Non-functional Glossary filters, Library download feedback and Master filters

### Deferred

- Production Authentication and Authorization
- Remote D1 database ID
- Frontend API integration (implemented in Phase 2 below)
- Offline content caching
- Real Certificate PDF generation

## Phase 2 — API Integration — 2026-09-02

### Added

- Central frontend API client with loading, error and retry states.
- Worker-backed Glossary, Library, Quiz submission and Progress read/write flows.
- D1 `quiz_attempts` migration and persisted quiz scoring.
- Student Knowledge and Library UI connected to published D1 content.
- Master content lists and CRUD/archive controls connected to the development Worker, with explicit local Demo fallback when the API is unavailable.
- Vite `/api` proxy for local Frontend ↔ Worker integration.

### Verified

- Fresh local D1 application of migrations `0001_initial.sql` and `0002_quiz_attempts.sql`.
- Build and Worker TypeScript typecheck.
- API smoke coverage for Health, Courses, Glossary, Library, Quiz, Quiz Submit, Progress and Master role guard/CRUD.
