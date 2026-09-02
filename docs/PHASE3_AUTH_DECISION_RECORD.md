# Phase 3 Authentication — Decision Record

**تاریخ ثبت:** ۲ سپتامبر ۲۰۲۶
**Branch:** `arena/01a05d5b-darullfonon`
**وضعیت:** PROVIDER SELECTED — Implementation انجام شد؛ Operational Verification باقی است
**مرجع Audit:** `docs/PHASE3_INITIAL_AUTH_AUDIT.md`

این سند فقط تصمیم‌هایی را ثبت می‌کند که در همین Session به‌صورت واقعی انتخاب شدند. برای تصمیم‌های انتخاب‌نشده، نظر شخص یا Owner جعل نشده و وضعیت `PENDING INPUT` باقی مانده است.

> **Current implementation addendum:** Clerk برای Implementation انتخاب و در Repository پیاده‌سازی شده است. Local functional/security smoke موفق است، اما Instance واقعی Clerk، Remote D1، CORS نهایی، WAF و Browser E2E هنوز به‌دلیل نبود Environment/Access قابل Verify نیستند. این Addendum بر Snapshotهای تاریخی زیر مقدم است.

---

## 1. تصمیم‌های ثبت‌شده

| موضوع | تصمیم فعلی | وضعیت |
|---|---|---|
| Student Authentication | OAuth/OIDC | CONFIRMED FOR EVALUATION |
| Staff Identity System | Provider مشترک با Student، با Policy جدا | CONFIRMED FOR EVALUATION |
| Teacher و Master | دو Role مستقل | CONFIRMED |
| Provider نهایی | Clerk | SELECTED FOR IMPLEMENTATION — secrets/POC pending |
| Teacher/Master Permission Matrix | Teacher آموزشی، Master محتوا، Admin هویت | CONFIRMED FOR PLAN |
| Recovery Policy | upstream IdP مسئول Recovery است | CONFIRMED FOR PLAN |
| Email Verification Trust Policy | فقط `email_verified` معتبر upstream | CONFIRMED |
| MFA برای Staff | Invite-only + MFA اجباری | CONFIRMED |
| PWA Offline Scope | Published Reading + Snapshot محدود Profile/Progress/Learning Path؛ بدون Mutation Queue | CONFIRMED FOR PHASE 3.2 PLAN |
| `@mt` Scope | Teacher و Master | CONFIRMED FOR PLAN |
| Migration Approval | صادر نشده | BLOCKED |

### تصمیم 1 — Teacher و Master مستقل‌اند

مدل Role باید حداقل چهار Role داشته باشد:

```text
student
teacher
master
admin
```

Permission Matrix انتخاب‌شده برای Plan این است:

```text
teacher = آموزشی
master  = مدیریت محتوا
admin   = هویت، Approval و عملیات امنیتی
```

این تصمیم برای Plan ثبت شده است؛ جزئیات ریز هر Endpoint باید در Authorization Contract نهایی شود.

### تصمیم 2 — Student مسیر OAuth/OIDC دارد

Student از مسیر عمومی OAuth/OIDC وارد می‌شود. Provider نهایی Clerk انتخاب و Adapter آن پیاده‌سازی شده است؛ Policyهای Email و Recovery این‌ها هستند:

- فقط `email_verified = true` معتبر upstream پذیرفته شود.
- اگر IdP ایمیل قابل اعتماد ندهد، User به‌صورت `active` ساخته نشود.
- Recovery به عهده upstream IdP باشد.
- Account Linking فعلاً در Scope نیست.

### تصمیم 3 — Staff از همان Provider استفاده می‌کند

Teacher، Master و Admin در همان Identity System قرار می‌گیرند، ولی Role و Policy آن‌ها باید از داده معتبر Backend/D1 خوانده شود؛ Suffix، Header و Claim قابل جعل سمت Client مجاز نیست.

این تصمیم از ایجاد دو Identity System جدا جلوگیری می‌کند، اما برای Staff به Invite، MFA و محدودیت‌های Origin/Redirect نیاز دارد.

### تصمیم 4 — Provider Selection

**Clerk برای Phase 3 انتخاب شد.** دلیل انتخاب، هم‌خوانی مستقیم‌تر با نیازهای User Management، OAuth، Staff Invite/MFA و Session/JWT با کمترین کد اختصاصی در PWA/Worker است. Supabase به‌عنوان گزینه بررسی‌شده انتخاب نشد؛ Browser Storage/Cookie integration و Staff Workflow آن برای این L1 به POC بیشتری نیاز داشت.

Clerk باید با POC عملیاتی محدود در همین معماری تأیید شود:

```text
OAuth/OIDC integration with Cloudflare Worker
JWT/JWKS verification in Worker runtime
HttpOnly/Secure/SameSite session strategy
MFA for staff
Invitation / restricted onboarding
Email verification semantics
Recovery semantics
Rate limits and abuse controls
D1 profile mapping and webhook/sync needs
Region, cost, vendor exit and operational ownership
```

Clerk برای Phase 3 Approved for Implementation است؛ Operational Approval و Production Release پس از تست واقعی هنوز Blocked است.

---

## 2. مدل Role تصویب‌شده برای Plan

این مدل برای Plan انتخاب شده است؛ جزئیات ریز هر Endpoint همچنان در Authorization Contract نوشته می‌شود:

```text
student
  - مسیر عمومی OAuth
  - دسترسی به Learning و Progress خود

teacher
  - مسیر Application
  - ابتدا pending
  - پس از Admin Approval، active
  - دسترسی آموزشی Teacher طبق Permission Matrix

master
  - Staff داخلی/محتوا یا نقش مدیریتی میانی، فقط در صورت تأیید این تعریف
  - Invite-only
  - هرگز از مسیر عمومی Student/Teacher ساخته نشود

admin
  - Invite-only یا SSO سازمانی
  - مشاهده و Approve/Reject Teacher
  - Suspend و Audit طبق Policy
```

**نکته:** Repository فعلی `MasterView` را برای مدیریت Content نشان می‌دهد؛ این قرینه برای Recommendation است، نه مجوز حدس‌زدن معنای Master در سیستم نهایی.

---

## 3. موارد اجرای عملیاتی باقی‌مانده

### 3.1 Clerk Configuration

Clerk انتخاب شده است، اما این موارد باید در محیط واقعی تنظیم و تست شوند:

- Clerk Instance/Environment واقعی.
- OAuth Connections فعال.
- Session Token Template شامل `email`، `email_verified`، `first_name` و `last_name`.
- JWT Public Key، Issuer و Authorized Parties.
- Staff Invitation و MFA enforcement.
- هزینه، Region و شرایط خروج از Vendor.

### 3.2 Email Verification

تصمیم ثبت‌شده:

```text
فقط email_verified صریح و قابل اعتماد از upstream IdP پذیرفته شود.
Verification ایمیلی داخلی اضافه نمی‌شود.
```

اگر Provider یا upstream Claim قابل اعتماد ارائه نکند، User نباید به‌صورت `active` ساخته شود. این تصمیم، انتخاب قبلی «Verification تکمیلی داخل محصول» را اصلاح و جایگزین می‌کند تا Complexity در L1 بماند.

### 3.3 Recovery

تصمیم ثبت‌شده: Recovery حساب بر عهده upstream IdP است و Darulfounon در MVP Token/Email Recovery اختصاصی نمی‌سازد. در UI و Support باید این مرز شفاف باشد.

### 3.4 MFA

تصمیم ثبت‌شده: Staff از مسیر Invite-only وارد شود و MFA برای Staff اجباری باشد. جزئیات اینکه Provider انتخاب‌شده چه Factorها و Enforcementی ارائه می‌کند، در Provider POC بررسی می‌شود.

### 3.5 PWA Offline Scope

تصمیم Phase 3.2، ثبت‌شده در `docs/DAROLFONUN_OFFLINE_POLICY.md`، Published Reading و Snapshot محدود Profile، Progress و Learning Path را مجاز می‌داند. این Snapshotها فقط Last Known Read-only State هستند؛ Progress Mutation، Quiz، Auth و تمام عملیات Staff/Admin Online می‌مانند.

Implementation فعلی Service Worker فقط بخشی از این Policy را پوشش می‌دهد و Browser E2E، Snapshot، Sync و Cleanup هنوز Verify نشده‌اند.

```text
Offline Reading: yes, limited and read-only
Offline Profile/Progress/Learning Path Snapshot: approved, implementation pending verification
Offline Transaction Queue: no for MVP
Offline Quiz: no
Offline Auth: no
Offline Staff/Admin: no
```

جزئیات Policy در `docs/DAROLFONUN_OFFLINE_POLICY.md` و Audit Phase 3.2 در `docs/PHASE-3.2-AUDIT-REPORT.md` ثبت شده است.

### 3.6 Session Strategy

برای Implementation فعلی:

```text
Clerk SDK session → short-lived token in memory → Authorization: Bearer
Worker JWT verification → D1 user/status/role authorization
```

Application هیچ Tokenی را در `localStorage` یا `sessionStorage` نمی‌نویسد. Logout ابتدا JTI توکن جاری را در `auth_revoked_tokens` revoke می‌کند و سپس `signOut()` کلاینت Clerk را اجرا می‌کند.

این Strategy برای کاهش Complexity انتخاب شده است؛ Production باید با Clerk Session Template، expiration کوتاه، CSP و XSS test عملیاتی تأیید شود.

---

## 4. Identifier Decision

Requirement زیر Confirmed است:

```text
@sd و @mt فقط Login Identifier هستند.
هیچ‌کدام Authorization یا Proof of Role نیستند.

@sd → student
@mt → teacher و master
admin → بدون suffix عمومی؛ Invite/Provider Subject
```

مواردی که باید در Contract مشخص شوند:

- Normalization و Transliteration فارسی.
- Canonical Case و فاصله/نیم‌فاصله.
- Collision handling و deterministic retry.
- رفتار نام خالی، Unicode نامعتبر یا کاراکترهای حذف‌شده.
- Database `UNIQUE` و handling رقابت هم‌زمان.

User ID مستقل، تصادفی و غیرقابل حدس خواهد بود؛ نام و Identifier به‌عنوان ID داخلی استفاده نمی‌شوند.

---

## 5. Migration Gate

Migrationهای افزایشی Authentication برای Clerk تصویب و فقط روی Local D1 اجرا شدند:

```text
0003_authentication.sql
0004_rate_limits.sql

Remote D1: NOT APPLIED — database_id هنوز Placeholder است
```

### Migration آینده — فرم ثبت قبل از اجرا

```text
Purpose:
  افزودن حداقل User/Profile و Teacher Application برای Auth انتخاب‌شده.

Impact:
  Migration افزایشی روی D1؛ احتمالاً بدون تغییر محتوای فعلی.
  Mapping داده‌های Demo در progress و quiz_attempts هنوز تعیین نشده است.

Risk:
  Orphan Demo user_id، Collision Identifier، ناسازگاری با Remote D1،
  و دسترسی ناخواسته در صورت اتصال اشتباه Role/Status.

Validation:
  Fresh local apply، schema inspection، UNIQUE collision test،
  FK/integrity test، Auth functional test، security test و rollback rehearsal.

Rollback consideration:
  قبل از Remote Apply backup/snapshot و migration plan ثبت شود.
  Down migration خودکار روی User data مجاز نیست؛ rollback باید
  با forward fix یا restore تأییدشده انجام شود.

Approval:
  Local: APPROVED AND APPLIED
  Remote: BLOCKED — Owner، Database ID و زمان Remote D1 مشخص نیست.
```

---

## 6. Gate فعلی

```text
Provider Approved: YES FOR IMPLEMENTATION — Clerk
Role Permission Matrix: YES FOR IMPLEMENTATION
Email Verification Policy: YES — trusted upstream `email_verified` only
Recovery Policy: YES — upstream IdP owns recovery
Session Strategy: YES FOR IMPLEMENTATION — Clerk short-lived token + D1 JTI revocation
MFA/Invite Policy: YES — Invite-only + MFA required for Staff
PWA Offline Reading Scope: YES FOR PLAN
Migration Plan: LOCAL APPLIED; REMOTE BLOCKED

IMPLEMENTATION: COMPLETE IN REPOSITORY
OPERATIONAL VERIFICATION: PENDING ENVIRONMENT CONFIGURATION
RELEASE: BLOCKED UNTIL REMOTE/PRODUCTION TESTS
```

تا تکمیل Gate بالا، تغییر در `worker/src/index.ts`، Migration، Session، Password یا Frontend Auth انجام نمی‌شود.
