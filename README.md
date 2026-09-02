# دارالفنون

دارالفنون یک PWA فارسی و RTL برای آموزش اقتصاد، بازارهای مالی، دانشنامه، کتابخانه و خودارزیابی است.

## وضعیت

- Complexity: L1 — Simple
- Phase: Phase 3 — Authentication & Authorization (implemented locally; production verification blocked)
- Next stage: Phase 4 only after the Phase 3 release gate is closed
- Frontend: React + Vite + Clerk Provider
- API: Cloudflare Worker با JWT verification و Backend Authorization
- Database: Cloudflare D1 با User/Workflow/Audit/Rate-limit tables
- Authentication: Clerk OAuth/OIDC؛ Demo Role در Production وجود ندارد
- Offline: فقط Published public reading؛ بدون Offline Auth یا Mutation

## اجرا

```bash
npm install
npm run dev
```

Frontend روی پورت `5173` اجرا می‌شود.

## Worker و D1 محلی

```bash
npm run worker:db:local
npm run worker:dev -- --local --port 8787
```

Health check:

```bash
curl http://127.0.0.1:8787/api/health
```

برای Endpointهای محافظت‌شده، Frontend با Session Token کوتاه‌عمر Clerk هدر زیر را ارسال می‌کند. Token فقط در حافظه SDK استفاده می‌شود و نباید دستی در Repository یا Storage ذخیره شود:

```text
Authorization: Bearer <short-lived Clerk session token>
```

## تست و Build

```bash
npm run build
npm run worker:typecheck
npm run phase3:preflight
```

برای Gate انتشار Production، Preflight مقادیر را چاپ نمی‌کند و در نبود تنظیمات واقعی عمداً شکست می‌خورد:

```bash
npm run phase3:preflight -- --production
```

## اسناد

- `docs/PRODUCT_SPEC.md` — Product Spec و Scope
- `docs/ARCHITECTURE.md` — معماری L1 و Deployment
- `docs/API_SPEC.md` — قرارداد API
- `docs/SECURITY_NOTES.md` — کنترل‌ها و شروط Production
- `docs/FINAL_AUDIT.md` — صورت‌جلسه ممیزی Vertical Slice
- `docs/darullfonon-mvp-execution-prompt-v1.0.md` — پرامپت اجرایی MVP
- `docs/PHASE_ROADMAP_AND_EXECUTION_REVIEW.md` — وضعیت فازها، نقشه راه و چارچوب جلسه تصمیم‌گیری
- `docs/PHASE3_AUTHENTICATION_CONSULTATION.md` — مشاوره Authentication و طراحی ثبت‌نام پیش از Phase 3
- `docs/PHASE3_INITIAL_AUTH_AUDIT.md` — ممیزی اولیه Authentication و User Management بر اساس Requirement جدید
- `docs/PHASE3_AUTH_DECISION_RECORD.md` — انتخاب نهایی Clerk، تصمیم‌ها و Gateهای عملیاتی Authentication
- `docs/PHASE3_AUTH_IMPLEMENTATION_PLAN.md` — Plan و وضعیت اجرای Phase 3
- `docs/PHASE3_PWA_OFFLINE_AUTH_AUDIT.md` — Snapshot ممیزی Phase 3.1؛ دامنه آن با Policy رسمی Phase 3.2 جایگزین شده است
- `docs/DAROLFONUN_OFFLINE_POLICY.md` — Policy رسمی و حاکم Offline Learning & Online Transaction
- `docs/PHASE3_AUTH_PROVIDER_MATRIX.md` — مقایسه Clerk و Supabase برای OAuth، Worker و PWA
- `docs/PHASE-3.2-AUDIT-REPORT.md` — ممیزی Production Unlock و Private Pilot Gate
- `docs/PRODUCTION-EVIDENCE-MATRIX.md` — Matrix شواهد Gateهای Phase 3.2
- `docs/ENVIRONMENT-INVENTORY.md` — Inventory Environmentها، Resourceها و Ownerهای موردنیاز
- `docs/AUTHORIZATION-MATRIX.md` — Matrix رسمی Role، Status و Ownership
- `docs/PRODUCTION-ROLLBACK-RUNBOOK.md` — طرح Rollback، Backup و Recovery
- `docs/PRIVATE-PILOT-READINESS.md` — تصمیم و شروط آمادگی Private Pilot
- `docs/PHASE3_CLERK_SETUP.md` — تنظیمات Clerk، Secretها، Bootstrap و Flowهای Phase 3
- `docs/PHASE3_AUTH_TEST_REPORT.md` — تست‌های واقعی Local، موارد NOT VERIFIED و Release Blockers
- `docs/PHASE3_COMPLETION_AUDIT.md` — ممیزی زنجیره، انتخاب راهکار، اولویت ریسک‌ها و Gate ورود به Phase 4

## Authentication Configuration

Provider نهایی Phase 3: **Clerk**. برای اجرای Frontend، `VITE_CLERK_PUBLISHABLE_KEY` و در صورت استفاده `VITE_CLERK_JWT_TEMPLATE` را در Environment قرار دهید. برای Worker، Secretهای Clerk و `ALLOWED_ORIGIN` را با Wrangler تنظیم کنید؛ نمونه در `.env.example` ثبت شده است.

```bash
npx wrangler secret put CLERK_JWT_KEY --config wrangler.toml
npx wrangler secret put CLERK_JWT_ISSUER --config wrangler.toml
npx wrangler secret put CLERK_AUTHORIZED_PARTIES --config wrangler.toml
npx wrangler secret put BOOTSTRAP_ADMIN_PROVIDER_SUBJECT --config wrangler.toml
```

## هشدار Production

`wrangler.toml` هنوز شامل Placeholder برای `database_id` است. پیش از Deployment باید Database واقعی تنظیم شود، `ALLOWED_ORIGIN` دقیق تعیین گردد، Clerk OAuth/Session Template/MFA فعال شود و Migrationهای `0003` و `0004` روی Remote با Backup و Validation اعمال شوند.
