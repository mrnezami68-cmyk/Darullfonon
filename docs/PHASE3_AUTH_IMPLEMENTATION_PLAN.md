# Phase 3 Authentication — Minimal Implementation Plan

**وضعیت:** IMPLEMENTED — Clerk selected; production configuration/verification remains
**Complexity Target:** `L1 — Simple`
**اصل:** MAKE THE SMALLEST SAFE CHANGE
**مرجع:** `docs/PHASE3_INITIAL_AUTH_AUDIT.md` و `docs/PHASE3_AUTH_DECISION_RECORD.md`

این Plan مبنای اجرای Phase 3 است و Implementation حداقلی آن انجام شده است. مواردی که به Secret، Clerk Dashboard، Remote D1 یا تست Browser واقعی نیاز دارند، هنوز باید Operational Verification شوند.

---

## 0. Scope و Non-Goals

### In Scope

- Student OAuth/OIDC Sign-in.
- Shared Identity Provider برای Student و Staff با Policy جدا.
- چهار Role مستقل: `student`, `teacher`, `master`, `admin`.
- Teacher Application با `pending` و تصمیم Admin.
- Approve/Reject/Suspend فقط سمت Backend.
- `@sd` و `@mt` به‌عنوان Identifier مستقل از Authorization.
- Session امن و Logout معتبر.
- Offline Reading محدود برای محتوای Published از قبل دریافت‌شده؛ بدون Offline Authorization.
- Origin، Redirect URI، JWT/JWKS، Rate Limit و Input Validation.
- تست Functional، Security، Regression و Data Integrity.

### Non-Goals

- Auth Framework اختصاصی.
- Password Hashing داخل Worker مگر اینکه Provider عمداً کنار گذاشته شود.
- تشخیص نام واقعی، Fake Name یا AI Validation.
- Microservice، Redis، Queue یا Database جدید.
- Migration مخرب یا پاک‌کردن داده Phase 2.
- Offline Progress Queue و Offline Quiz در MVP.
- Offline Authentication یا عملیات Staff/Admin.
- Account Linking یا Multi-tenancy تا Requirement مستقل.

---

## 1. Gate A — Clerk Configuration و Verification

### وضعیت

Clerk به‌عنوان Provider نهایی انتخاب و Adapter آن در Frontend/Worker پیاده‌سازی شده است. Supabase بعد از مقایسه انتخاب نشد تا برای این L1، Cookie/Storage و Staff Workflow سفارشی اضافه نشود.

### تنظیمات لازم در Clerk/Environment

1. OAuth Connectionهای موردنیاز را فعال کنید.
2. Session Token Template با Claimهای زیر بسازید:
   - `email`
   - `email_verified`
   - `first_name`
   - `last_name`
   - `jti`
3. Secretهای Worker را با Wrangler تنظیم کنید:

```text
CLERK_JWT_KEY
CLERK_JWT_ISSUER
CLERK_AUTHORIZED_PARTIES
BOOTSTRAP_ADMIN_PROVIDER_SUBJECT
```

4. `VITE_CLERK_PUBLISHABLE_KEY` و در صورت استفاده `VITE_CLERK_JWT_TEMPLATE` را در Frontend تنظیم کنید.
5. Staff Invitation و MFA اجباری را در Clerk فعال کنید.
6. Origin/Redirect URIهای Dev/Staging/Prod را ثبت کنید.
7. Secret یا Provider Token وارد Repository نشود.

### Exit Criteria

- Clerk configuration واقعی ثبت شده باشد.
- Worker issuer، امضا، `iat`، `exp`، `nbf`، `jti` و `azp` را verify کند؛ `aud` در صورت تنظیم enforce شود.
- Session token در `localStorage` توسط Application ذخیره نشود.
- Logout، JTI revocation و Clerk `signOut()` قابل تست باشد.

---

## 2. Gate B — Contract و Policy

### کارها

1. ثبت جزئیات نهایی Endpointها بر اساس Permission Matrix تصویب‌شده:
   - `teacher` آموزشی.
   - `master` مدیریت محتوا.
   - `admin` هویت، Approval و عملیات امنیتی.
2. ثبت mapping قطعی Identifierها: `@sd` برای Student و `@mt` برای Teacher و Master.
3. اجرای Email Verification فقط با `email_verified` معتبر upstream؛ Email Verification داخلی در MVP ساخته نشود.
4. ثبت Recovery بر عهده upstream IdP و عدم ساخت Token/Email Recovery داخلی در MVP.
5. ثبت Staff Invite-only و MFA اجباری؛ Factor/Enforcement واقعی در Provider POC ثابت شود.
6. تعیین Enumeration policy:
   - پاسخ Login/Recovery عمومی اطلاعات اضافی فاش نکند.
   - Admin فقط داده لازم را ببیند.
7. تعریف Status transition:

```text
pending  → active       (Admin approve)
pending  → rejected     (Admin reject)
active   → suspended    (Admin suspend)
rejected → pending      (فقط اگر Policy اجازه دهد)
```

### خروجی

```text
ADR نهایی
API Contract
Authorization Matrix
Status Transition Table
Error/Enumeration Policy
```

### Exit Criteria

- هیچ Role یا Status از Request عمومی پذیرفته نشود.
- تفاوت Permission بین `teacher` و `master` بدون ابهام باشد.

---

## 3. Gate C — Schema Plan و Migration Approval

### حداقل مدل پیشنهادی

Provider مسئول Password/Session باشد؛ D1 فقط App Identity و Workflow را نگه دارد:

```text
users
  id                 TEXT PRIMARY KEY
  provider           TEXT NOT NULL
  provider_subject   TEXT NOT NULL UNIQUE
  role               TEXT NOT NULL CHECK (...)
  status             TEXT NOT NULL CHECK (...)
  email             TEXT
  email_verified     INTEGER NOT NULL DEFAULT 0
  login_identifier   TEXT NOT NULL UNIQUE
  created_at         TEXT NOT NULL
  updated_at         TEXT NOT NULL
  verified_at        TEXT
  verified_by        TEXT
  rejection_reason   TEXT

teacher_applications
  id                 TEXT PRIMARY KEY
  user_id            TEXT NOT NULL REFERENCES users(id)
  status             TEXT NOT NULL CHECK (...)
  reviewed_at        TEXT
  reviewed_by        TEXT REFERENCES users(id)
  rejection_reason   TEXT
  created_at         TEXT NOT NULL
  updated_at         TEXT NOT NULL

-- audit_logs فقط در صورت تأیید Scope
```

### نکات مهم

- `role` و `status` جدا هستند.
- `provider_subject` و `login_identifier` Unique هستند.
- User ID مستقل از Login Identifier است.
- `master` و `admin` باید Invite/Provisioning امن داشته باشند؛ Row عمومی برای آن‌ها ساخته نشود.
- اگر `@mt` برای Teacher و Master لازم است، باید format namespace و uniqueness جهانی آن صریح شود.
- `progress.user_id` و `quiz_attempts.user_id` فعلی با `demo-student` داده Demo دارند؛ تبدیل به FK یا mapping باید جداگانه و پس از inventory داده تصمیم‌گیری شود.
- هیچ Password یا Session Token خام در D1 اضافه نشود، مگر Provider decision تغییر کند.

### Migration Gate Form

قبل از اجرای Migration باید نسخه نهایی همین موارد ثبت شود:

```text
Purpose
Impact
Risk
Validation
Rollback consideration
Local result
Remote target and backup
Owner approval
```

---

## 4. Gate D — Backend Identity Boundary

### Worker کارهایی که باید انجام دهد

1. Parse Cookie/Authorization طبق Session Strategy.
2. Verify JWT/OIDC:
   - issuer
   - audience
   - algorithm allow-list
   - signature/JWKS
   - `exp`
   - `nbf`
   - authorized party (`azp`) مطابق Allow-list محیط
3. Resolve Provider Subject به D1 User.
4. برای User جدید فقط Role/Status Policy سمت سرور اعمال کند.
5. Authorization را از User Record و Backend Policy استخراج کند.
6. برای Progress و Quiz، `user_id` را فقط از Identity معتبر بگیرد.
7. Demo Headerهای Role/User را از Production Authorization حذف کند؛ این مورد در Repository انجام شده است.
8. خطاهای عمومی Auth را بدون User Enumeration برگرداند.
9. CORS را با allow-list صریح و credentials policy تنظیم کند.
10. Rate Limit برای Login/Callback/Teacher Application/Admin mutation طبق قابلیت Provider/Cloudflare اضافه کند.

### Target Endpoint Groups

```text
GET  /api/v1/auth/me
POST /api/v1/auth/logout

POST /api/v1/teacher/applications
GET  /api/v1/teacher/application

GET  /api/v1/admin/teacher-applications
POST /api/v1/admin/teacher-applications/:id/approve
POST /api/v1/admin/teacher-applications/:id/reject
POST /api/v1/admin/users/:id/suspend
```

Endpointهای Hosted OAuth/Callback بعد از Provider انتخاب می‌شوند؛ این لیست الزاماً Contract نهایی نیست.

---

## 5. Gate E — Frontend Minimal Auth Integration

### کارها

- حذف `DemoRoleGate` از مسیر Production.
- مسیر Demo Role/User حذف شده است و در Production قابل فعال‌سازی نیست.
- درخواست `/auth/me` برای نمایش state.
- استفاده از relative URL؛ هرگز `localhost` در Browser.
- عدم ذخیره Token در `localStorage`.
- نمایش Student، Teacher Pending، Master و Admin بر اساس پاسخ Backend.
- عدم نمایش دکمه Approve/Reject برای Role غیر Admin.
- نمایش وضعیت Verification/Pending بدون افشای داده حساس.
- Logout از Backend و پاک‌شدن state محلی UI.

---

## 6. Gate F — Teacher/Admin Workflow

### Teacher

```text
OAuth identity
  ↓
application validation
  ↓
users.role = teacher
users.status = pending
  ↓
Admin review
```

Client هرگز نمی‌تواند `active`، `admin` یا `master` را set کند.

### Admin

- فهرست Pending با Pagination و حداقل داده لازم.
- Approve اتمیک: Application و User state با بررسی Current Status.
- Reject با Reason محدود و Audit.
- جلوگیری از Double Approve/Reject با شرط State و بررسی نتیجه Update.
- دسترسی به عملیات فقط با Authentication + Backend Authorization.

### Master

Master فقط با Invite/Provisioning امن وارد شود و به Content Management دسترسی داشته باشد؛ جزئیات Endpointهای Content باید با Policy Backend نهایی شود.

---

## 7. Gate G — Security Test Plan

### Authentication

- Token جعلی، امضای اشتباه، issuer/audience اشتباه.
- Token منقضی، `nbf` آینده و algorithm confusion.
- Cookie بدون Secure/HttpOnly/SameSite مناسب.
- Logout و Session expiration.
- Origin و Redirect URI خارج از allow-list.
- عدم پذیرش `X-Demo-Role` و `X-Demo-User` در Production.

### Authorization

- Student به Progress User دیگر.
- Teacher pending به Teacher feature.
- Teacher به Admin endpoint.
- Master به Admin approval.
- Admin operation بدون Session.
- تغییر `role`/`status` از Request body.

### Registration/Workflow

- Duplicate Provider Subject.
- Duplicate `@sd`/`@mt`.
- Unicode normalization و collision.
- Concurrent identifier creation.
- Double approve/reject.
- Invalid status transition.
- Enumeration در Login/Recovery/Application.

### Abuse

- Rate Limit و Retry burst.
- Oversized/invalid JSON.
- Replay callback/code.
- CSRF برای Cookie mutation.
- XSS در نام/Reason/Application text.
- SQL injection و dynamic content type.

### Data Integrity

- FKها و CHECKها.
- Orphan application.
- User/Progress ownership.
- Migration idempotence.
- Local vs Remote schema parity.

---

## 8. Gate H — Regression و Release

قبل از اعلام `PASS` باید همه موارد زیر واقعی اجرا و Artifact آن ثبت شود:

```text
npm run build
npm run worker:typecheck
Local D1 migration apply
Schema/constraint inspection
Functional Student OAuth test
Functional Teacher pending test
Functional Admin approve/reject test
Functional Logout test
Security test suite
Authorization matrix test
Race/concurrency test
Data integrity test
Remote D1 verification
Production CORS verification
Rate-limit verification
```

هر مورد اجرا‌نشده باید `NOT VERIFIED` بماند. وجود POC یا Typecheck به‌تنهایی `PASS` Authentication محسوب نمی‌شود.

---

## 9. Offline Plan Boundary

بررسی PWA در `docs/PHASE3_PWA_OFFLINE_AUTH_AUDIT.md` ثبت شده است. تصمیم فعلی فقط Offline Reading محدود و read-only برای محتوای Published از قبل دریافت‌شده است:

```text
Offline Reading: CONFIRMED FOR PLAN
Offline Progress Queue: NO FOR MVP
Offline Quiz: NO
Offline Auth: NO
Offline Staff/Admin: NO
```

Service Worker اکنون فقط allow-list محتوای عمومی را Cache می‌کند. هیچ Token، `/auth/me`، Progress، Teacher Application، Master یا Admin Response در Cache قرار نمی‌گیرد. Offline mode نباید Identity System دوم بسازد.

---

## 10. Final Plan Verdict

```text
PLAN: COMPLETE
IMPLEMENTATION: COMPLETE IN REPOSITORY
LOCAL MIGRATION: APPLIED
PRODUCTION CONFIGURATION: PENDING OWNER SECRETS
REMOTE MIGRATION: BLOCKED BY PLACEHOLDER DATABASE ID
PRODUCTION: RELEASE BLOCKED UNTIL OPERATIONAL TESTS
```

ترتیب کم‌ریسک اجرای واقعی:

```text
Provider Matrix / POC
  ↓
Permission + Verification + Recovery + MFA Policy
  ↓
Final Auth Contract
  ↓
Migration Approval
  ↓
Backend Identity Boundary
  ↓
Teacher/Admin Workflow
  ↓
Frontend integration
  ↓
Security + Regression + Data Integrity
```
