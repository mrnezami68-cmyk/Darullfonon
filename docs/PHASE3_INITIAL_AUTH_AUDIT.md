# DAROLFONUN AUTHENTICATION AUDIT — INITIAL

**تاریخ:** ۲ سپتامبر ۲۰۲۶  
**فاز:** پیش از Phase 3 — Authentication & User Management  
**Branch:** `arena/01a05d5b-darullfonon`  
**روش:** Inspect → Map → Understand → Identify Risks  
**Complexity Level فعلی:** `L1 — Simple`

---

## STATUS

```text
INITIAL AUDIT: COMPLETE
IMPLEMENTATION: BLOCKED — DECISION REQUIRED
PRODUCTION: RELEASE BLOCKED
```

Repository، Frontend، Worker، D1 Schema، Migrationها، API Contract، Demo Role و اسناد امنیتی بررسی شدند. این فایل Snapshot پیش از Implementation است؛ وضعیت اجرایی جدید در `docs/SECURITY_NOTES.md` و `docs/PHASE3_AUTH_DECISION_RECORD.md` ثبت شده است.

دلیل توقف پیش از Implementation، وجود تصمیم‌های High Risk و حل‌نشده است:

1. انتخاب Authentication Provider یا تصمیم آگاهانه برای عدم استفاده از Provider.
2. تعیین اینکه `Teacher` و `Master` در مدل کسب‌وکار یک نقش هستند یا دو نقش مستقل.
3. تعیین مسیر Master/Teacher: Invite، SSO یا Registration عمومی محدود.
4. تعیین کانال Recovery در شرایطی که Email/SMS داخلی نداریم.
5. تعیین اینکه Admin از همان `users` استفاده کند یا مدل دسترسی جدا داشته باشد.

---

## 1. EXISTING SYSTEM

### Architecture

```text
React/Vite PWA
      ↓
Cloudflare Pages / Vite Preview
      ↓
Cloudflare Worker
      ↓
Cloudflare D1
```

معماری برای یک Integration با Managed Identity Provider همچنان در L1 قابل حفظ است. فعلاً هیچ Auth Service، Token Issuer، Session Store یا User Database در Repository وجود ندارد.

### Frontend

فایل‌های بررسی‌شده:

- `src/main.jsx`
- `src/LearningViews.jsx`
- `src/StudentViews.jsx`
- `src/MasterView.jsx`
- `src/api.js`
- `src/useApiResource.jsx`

نتیجه:

- Registration واقعی وجود ندارد.
- Login واقعی وجود ندارد.
- Logout واقعی وجود ندارد.
- Session واقعی وجود ندارد.
- Password یا Recovery Flow وجود ندارد.
- Role Gate فعلی با `localStorage` و انتخاب Demo Role کار می‌کند.
- کاربر می‌تواند Student یا Master را در Demo انتخاب کند.
- این Role Gate برای Prototype است و Authorization محسوب نمی‌شود.
- `MasterView` در حال حاضر UI مدیریت محتوا و fallback محلی دارد؛ User Management یا Teacher Approval ندارد.
- `src/api.js` هیچ Endpointی برای `/auth/*`، `/users/*` یا Teacher Application ندارد.

### Backend

فایل بررسی‌شده:

- `worker/src/index.ts`

Endpointهای موجود:

```text
GET  /api/health
GET  /api/v1/courses
GET  /api/v1/courses/:slug
GET  /api/v1/chapters/:id
GET  /api/v1/lessons/:slug
GET  /api/v1/glossary
GET  /api/v1/glossary/:slug
GET  /api/v1/library
GET  /api/v1/library/:slug
GET  /api/v1/quizzes/:id
POST /api/v1/quizzes/:id/submit
GET  /api/v1/progress
POST /api/v1/progress
GET  /api/v1/master/content/:type
POST /api/v1/master/content/:type
PATCH /api/v1/master/content/:type/:id
DELETE /api/v1/master/content/:type/:id
```

نتیجه Authentication:

- هیچ `POST /auth/register` وجود ندارد.
- هیچ `POST /auth/login` وجود ندارد.
- هیچ `POST /auth/logout` وجود ندارد.
- هیچ `GET /auth/me` وجود ندارد.
- هیچ Password Handling وجود ندارد.
- هیچ Session Validation وجود ندارد.
- هیچ Teacher Application وجود ندارد.
- هیچ Admin Approval Endpoint وجود ندارد.
- `requireMaster` فقط در Development و با Header زیر اجازه می‌دهد:

```text
X-Demo-Role: master
```

این Header در Production منبع Authorization نیست. در محیط غیر Development عملیات Master رد می‌شود، اما مسیر جایگزین Authentication نیز هنوز ساخته نشده است.

Progress در وضعیت فعلی User ID را از Header زیر می‌گیرد یا مقدار پیش‌فرض دارد:

```text
X-Demo-User: demo-student
```

این مقدار قابل جعل است و فقط برای Demo Development قابل قبول است.

### Database

فایل‌های بررسی‌شده:

- `worker/migrations/0001_initial.sql`
- `worker/migrations/0002_quiz_attempts.sql`
- Local D1 `sqlite_master`

جداول فعلی:

```text
faculties
courses
levels
chapters
lessons
quizzes
questions
glossary_entries
library_resources
content_relations
progress
quiz_attempts
```

وجود ندارند:

```text
users
sessions
password_reset_tokens
email_verification_tokens
teacher_profiles
teacher_applications
audit_logs
```

همچنین در Schema فعلی این موارد برای User وجود ندارند:

- `role`
- `status`
- `login_identifier`
- `password_hash`
- `email_verified`
- `verified_at`
- `verified_by`
- `rejection_reason`

Constraintهای مرتبط با User نیز وجود ندارند. Uniqueهای فعلی مربوط به Content مانند Course Slug، Lesson Slug و Glossary Slug هستند.

### Existing Data

Local D1 دارای Seed محتوای آموزشی و داده آزمایشی Phase 2 است. هیچ User، Teacher Application یا Admin Record در Migrationهای فعلی تعریف نشده است.

Remote D1 هنوز با مقدار واقعی تنظیم نشده است:

```text
database_id = "REPLACE_WITH_D1_DATABASE_ID"
```

---

## 2. GAP ANALYSIS نسبت به Requirement جدید

| Requirement | وضعیت فعلی | نتیجه |
|---|---|---|
| Student Registration | وجود ندارد | نیازمند طراحی و پیاده‌سازی |
| Student Email Verification | وجود ندارد | نیازمند Provider/Email Strategy |
| Student ACTIVE بعد از Verification | وجود ندارد | نیازمند User State |
| Teacher Registration | وجود ندارد | نیازمند Application Flow |
| Teacher PENDING | وجود ندارد | نیازمند Status و Application |
| Admin Review | وجود ندارد | نیازمند Admin Authorization و Endpoint |
| Teacher Approve | وجود ندارد | نیازمند Transition به ACTIVE |
| Teacher Reject | وجود ندارد | نیازمند REJECTED و Reason |
| Student/Teacher/Admin Role | وجود ندارد | نیازمند تصمیم مدل Role |
| `@sd` Identifier | وجود ندارد | نیازمند Generator و Unique Constraint |
| `@mt` Identifier | وجود ندارد | نیازمند Generator و Unique Constraint |
| Password Hash | وجود ندارد | Provider decision required |
| Session | وجود ندارد | Provider/Session decision required |
| Password Recovery | وجود ندارد | Recovery channel required |
| Rate Limiting | وجود ندارد | Phase 3 Security work |
| Audit Trail | وجود ندارد | نیازمند Scope decision |
| Teacher Profile | وجود ندارد | فقط در صورت Requirement واقعی |
| Admin API Authorization | فقط Demo Header | Production blocker |

---

## 3. ریسک‌های Critical و High

### CRITICAL-001 — هیچ Authentication واقعی وجود ندارد

**Impact:** هیچ User Identity قابل اعتماد برای Progress، Quiz Attempt، Profile یا Admin وجود ندارد.

**Recommendation:** Managed Auth یا راهکار Auth صریحاً انتخاب و Token/Session در Worker اعتبارسنجی شود.

**Priority:** قبل از هر Production و قبل از Approval Phase 3.

### CRITICAL-002 — Demo Role قابل جعل است

**Impact:** `X-Demo-Role: master` در Development کافی است، اما در Production قابل استفاده نیست و Frontend Role Gate امنیت ندارد.

**Recommendation:** Role از Session/Token معتبر و Policy سمت Backend استخراج شود.

### CRITICAL-003 — Teacher Approval وجود ندارد

**Impact:** هیچ راهی برای Pending، Approve، Reject یا جلوگیری از فعال‌شدن مستقیم Teacher وجود ندارد.

**Recommendation:** Teacher را به Application با Status مستقل تبدیل کنید و Activation فقط توسط Admin مجاز باشد.

### HIGH-001 — مدل `Teacher` و `Master` مبهم است

در متن Requirement از `Student / Teacher / Admin` استفاده شده، اما Target User Model شامل `student / master / admin` است. در Repository نیز Master به‌عنوان Content Manager شناخته می‌شود، نه Teacher.

**Decision Required:**

```text
Teacher == Master
یا
Teacher و Master دو Role مستقل هستند
```

بدون این تصمیم، ایجاد Schema و Endpoint می‌تواند مسیر غلطی بسازد.

### HIGH-002 — Recovery Channel مشخص نیست

در نبود Email/SMS داخلی، باید مشخص شود:

- Provider ایمیل Verification/Recovery را ارسال می‌کند.
- OAuth/OIDC مسیر اصلی است.
- Passkey با Recovery Policy استفاده می‌شود.
- یا محصول فعلاً Production Account ندارد.

### HIGH-003 — User ID و Email Identifier هنوز مدل نشده‌اند

`login_identifier` نباید Hash نام کاربر باشد و User ID باید مستقل و تصادفی باشد. در حال حاضر هیچ‌کدام وجود ندارد.

### HIGH-004 — CORS Production Configuration نهایی نیست

`ALLOWED_ORIGIN` هنوز مقدار نهایی ندارد و `wrangler.toml` برای Remote آماده نیست. این موضوع بعد از انتخاب Provider باید با Redirect URI و Origin دقیق بررسی شود.

### HIGH-005 — Rate Limit و Abuse Protection وجود ندارد

Endpointهای Registration، Login، Recovery و Verification هنوز وجود ندارند و هیچ Rate Limit یا Bot Protection برای آن‌ها تعریف نشده است.

---

## 4. COMPLEXITY DECISION

```text
CURRENT LEVEL:
L1 — Simple Demo + Content API

REQUIRED LEVEL:
L1 + Managed Identity Provider Integration
```

### چرا Architecture فعلی برای Requirement کامل کافی نیست؟

چون فعلاً User، Session، Password، Verification، Recovery و Authorization وجود ندارند؛ اما این کمبود با یک Adapter سبک برای Provider خارجی و چند جدول Profile/Application قابل حل است.

### ساده‌ترین Alternative

```text
Managed Identity Provider
        ↓ JWT / OIDC Session
Cloudflare Worker verification
        ↓
D1 application profile + teacher application + audit records
```

برای این مسیر، Auth Database جدا، Microservice، Redis، Queue یا User Service مستقل لازم نیست.

### Trade-offها

- وابستگی به Provider خارجی.
- هزینه و محدودیت‌های Provider.
- نیاز به بررسی Region و Data Residency.
- نیاز به Recovery و Support Plan.
- انتقال بخشی از هویت به Vendor، در مقابل کاهش ریسک ساخت Auth اختصاصی.

### تصمیم

```text
L1 حفظ می‌شود.
ساخت Authentication اختصاصی در Worker/D1 بدون تصمیم امنیتی جدا، رد است.
```

---

## 5. پیشنهاد مدل داده مفهومی، بدون اجرای Migration

این Schema فقط برای بحث جلسه است و هنوز تأیید یا اجرا نشده است:

```text
users
  id
  first_name
  last_name
  email
  phone
  role
  login_identifier
  status
  email_verified
  provider
  provider_subject
  created_at
  updated_at
  verified_at
  verified_by
  rejection_reason

teacher_applications
  id
  user_id
  teaching_field
  academic_degree
  institution
  teacher_bio
  status
  reviewed_at
  reviewed_by
  rejection_reason
  created_at
  updated_at
```

### اصول مدل

- `provider_subject` باید Unique باشد.
- `login_identifier` باید Unique باشد.
- `role` و `status` جدا باشند.
- User ID مستقل از نام و Identifier باشد.
- `teacher_applications` فقط اگر اطلاعات Teacher واقعاً نیاز محصول باشد اضافه شود.
- `verification_document` تا زمانی که Upload واقعی Requirement نشده، اضافه نشود.
- Password و Session Token در D1 ذخیره نشوند اگر Provider مسئول آن‌هاست.

---

## 6. رفتار هدف سیستم

### Student

```text
Registration
  ↓
Input Validation
  ↓
Email Verification یا OAuth/OIDC
  ↓
Generate @sd Identifier
  ↓
Create/Link User
  ↓
role = student
status = active
  ↓
Login
```

### Teacher

```text
Registration
  ↓
Input Validation
  ↓
Email Verification یا OAuth/OIDC
  ↓
Generate @mt Identifier
  ↓
Teacher Application
  ↓
role = teacher/master
status = pending
  ↓
Admin Review
  ├── Approve → active
  └── Reject  → rejected
```

Teacher نباید بتواند `status = active` یا `role = admin` را از Client ارسال کند.

### Admin

```text
Authenticated
  ↓
Authorized
  ↓
Admin Policy
  ↓
View / Approve / Reject / Suspend
```

---

## 7. APIهای موردنیاز، فقط به‌عنوان Target

این فهرست هنوز API نهایی نیست و قبل از اجرای Phase 3 باید با API موجود تطبیق داده شود:

```text
POST /api/v1/auth/register/student
POST /api/v1/auth/register/teacher
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/verify-email
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password

GET  /api/v1/admin/teachers/pending
POST /api/v1/admin/teachers/:id/approve
POST /api/v1/admin/teachers/:id/reject
POST /api/v1/admin/users/:id/suspend
```

اگر Provider Hosted UI یا OAuth انتخاب شود، برخی Endpointهای Auth در Application وجود نخواهند داشت و Worker فقط Callback/Token Verification و Profile Mapping را انجام می‌دهد. قبل از تغییر Contract باید Provider انتخاب شود.

---

## 8. وضعیت تست پایه پس از Inspect

| تست | نتیجه | توضیح |
|---|---|---|
| `npm run build` | PASS | Build فعلی بدون تغییر موفق است. |
| `npm run worker:typecheck` | PASS | Worker فعلی بدون تغییر Typecheck شد. |
| Local D1 Schema Inspection | PASS | جدول User/Auth/Teacher وجود ندارد؛ فهرست در این گزارش ثبت شد. |
| Existing Content API | PASS | APIهای فعلی بر اساس Phase 2 در دسترس هستند. |
| Real Registration | NOT VERIFIED | هنوز وجود ندارد. |
| Real Login | NOT VERIFIED | هنوز وجود ندارد. |
| Real Logout | NOT VERIFIED | هنوز وجود ندارد. |
| Password Security | NOT VERIFIED | Password در پروژه وجود ندارد. |
| Session Security | NOT VERIFIED | Session در پروژه وجود ندارد. |
| Teacher Approval | NOT VERIFIED | Flow و Endpoint وجود ندارد. |
| Admin Authorization | FAIL FOR PRODUCTION | فقط Demo Header در Development وجود دارد. |
| Race Condition Identifier | NOT VERIFIED | Identifier Generator وجود ندارد. |
| Recovery | NOT VERIFIED | Provider و کانال Recovery انتخاب نشده است. |
| Rate Limiting | NOT VERIFIED | پیاده‌سازی نشده است. |
| Remote D1 | NOT VERIFIED | Database ID هنوز Placeholder است. |

---

## 9. تصمیم‌های لازم قبل از Plan و Implementation

### Decision A — Role Model

یکی از این مدل‌ها باید تصویب شود:

```text
A) student / teacher / admin
   و Master فقط نام UI برای teacher است.

B) student / master / admin
   و Master همان Teacher عملیاتی است.

C) student / teacher / master / admin
   با تفاوت دقیق Permission بین teacher و master.
```

پیشنهاد L1:

```text
student / teacher / admin
```

و اگر «Master» در محصول نام تاریخی پنل محتواست، آن را Label UI نگه داریم، نه Role امنیتی مستقل؛ مگر Requirement جدا برای Content Manager تصویب شود.

### Decision B — Student Auth

- Managed Email/Password
- OAuth/OIDC
- Email/Password + OAuth
- Passkey به‌عنوان مرحله بعد

### Decision C — Master/Teacher Auth

- Invite-only
- SSO سازمانی
- Cloudflare Access برای پنل داخلی
- Provider مشترک با Student، اما با Policy جدا

### Decision D — Provider

Shortlist قبلی:

```text
Clerk
Supabase Auth
Cloudflare Access برای Master داخلی
```

انتخاب نهایی بدون POC، بررسی هزینه، Region، Recovery، MFA و خروج از Vendor انجام نشود.

### Decision E — Identifier

- حفظ `@sd` و `@mt` به‌عنوان Login Identifier فقط.
- عدم استفاده از Suffix برای Authorization.
- تعریف Canonicalization و Transliteration.
- تعریف Fallback امن برای نام خالی یا غیرقابل Transliterate.

---

## 10. Initial Audit Verdict

```text
OVERALL: DECISION REQUIRED
COMPLEXITY: L1 — Simple
IMPLEMENTATION: NOT STARTED
PRODUCTION: RELEASE BLOCKED
```

سیستم فعلی برای Phase 2 و Content API سالم است، اما برای Authentication و User Management Requirement جدید هیچ Implementation واقعی ندارد. این موضوع Bug قابل اصلاح سریع نیست؛ ابتدا باید Role Model و Authentication Provider تصویب شود.

تا قبل از این تصمیم‌ها:

```text
No Migration
No Password Implementation
No Auth Endpoint Implementation
No Teacher Approval Implementation
No Production Deployment
```

پس از تصمیم رسمی، مسیر اجرا باید این باشد:

```text
DECISION
  ↓
ADR / Auth Contract
  ↓
Minimal Schema Plan
  ↓
Provider POC
  ↓
Implementation
  ↓
Security Test
  ↓
Regression
  ↓
Technical Audit
```

این گزارش Initial Audit است و هنوز Final Quality Gate یا Production Approval محسوب نمی‌شود.
