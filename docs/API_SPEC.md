# API SPEC — دارالفنون

**نسخه:** 0.2
**Base URL:** `/api`
**محیط فعلی:** Cloudflare Worker + D1 + Clerk
**احراز هویت:** Clerk OAuth/OIDC Bearer Token؛ Role/Status فقط از D1 و Backend

---

## قرارداد عمومی پاسخ

موفق:

```json
{
  "data": {}
}
```

خطا:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "پیام قابل فهم برای کاربر"
  }
}
```

Headerهای عمومی:

```text
Content-Type: application/json
Authorization: Bearer <short-lived Clerk session token>
```

Token را Application در `localStorage` ذخیره نمی‌کند. Worker `RS256`، issuer، expiration، not-before، authorized party و JTI را بررسی می‌کند.

---

## Health

### `GET /api/health`

**هدف:** بررسی زنده‌بودن Worker و اتصال D1.

**Output 200:**

```json
{
  "status": "ok",
  "environment": "development",
  "database": "connected"
}
```

**Error:** `503 DATABASE_UNAVAILABLE`

---

## Student Learning

### `GET /api/v1/courses`

فهرست Courseهای Published.

**Output:** شامل Faculty، slug، title، summary، level، duration و lesson count.

**Errors:**

- `500 INTERNAL_ERROR`

### `GET /api/v1/courses/:slug`

جزئیات Course به‌همراه Levels و Chapters.

**Errors:**

- `404 COURSE_NOT_FOUND`

### `GET /api/v1/chapters/:id`

جزئیات Chapter و Lessons آن.

**Errors:**

- `404 CHAPTER_NOT_FOUND`

### `GET /api/v1/lessons/:slug`

محتوای Published یک Lesson.

**Errors:**

- `404 LESSON_NOT_FOUND`

### `GET /api/v1/progress`

فهرست Progress فقط برای Student یا Teacher فعالِ احراز‌شده فعلی.

### `POST /api/v1/progress`

ثبت یا به‌روزرسانی Progress برای Student یا Teacher فعالِ احراز‌شده فعلی. `user_id` فقط از Clerk Subject نگاشت‌شده در Backend تعیین می‌شود؛ Header یا Body نمی‌تواند مالکیت را تغییر دهد.

**Input:**

```json
{
  "lessonId": "lesson-crypto-03-03",
  "status": "Studied"
}
```

Statusهای مجاز:

- `InProgress`
- `Studied`
- `Passed`
- `NeedsReview`

**Errors:**

- `400 INVALID_PROGRESS`
- `404 LESSON_NOT_FOUND`
- `413 PAYLOAD_TOO_LARGE`

---

## Master Content

Content Typeهای فعلی:

- `courses`
- `lessons`
- `questions`
- `glossary`
- `library`

تمام Endpointهای زیر نیازمند `Authorization: Bearer <Clerk token>` و Role فعال `master` هستند. Admin در MVP مجوز مدیریت Content ندارد؛ دسترسی Content فقط با Backend Authorization کنترل می‌شود.

### `GET /api/v1/master/content/:type`

فهرست 200 رکورد آخر یک نوع محتوا.

**Errors:**

- `403 MASTER_ROLE_REQUIRED`
- `404 NOT_FOUND`

### `POST /api/v1/master/content/:type`

ایجاد محتوای جدید.

حداقل فیلدهای لازم:

- Course: `title`
- Lesson: `title`
- Question: `prompt`
- Glossary: `term`
- Library: `title`

فیلدهای اختیاری بر اساس Content Type در Worker نگاشت شده‌اند.

**Errors:**

- `400 INVALID_BODY`
- `400 INVALID_JSON`
- `400 VALIDATION_ERROR`
- `403 MASTER_ROLE_REQUIRED`
- `409 CONTENT_CONFLICT`
- `413 PAYLOAD_TOO_LARGE`

### `PATCH /api/v1/master/content/:type/:id`

ویرایش فیلدهای مجاز رکورد.

**Input نمونه:**

```json
{
  "status": "Published",
  "summary": "خلاصه ویرایش‌شده"
}
```

**Errors:**

- `400 NO_UPDATES`
- `400 INVALID_STATUS`
- `400 INVALID_SLUG`
- `400 VALIDATION_ERROR`
- `403 MASTER_ROLE_REQUIRED`
- `404 CONTENT_NOT_FOUND`
- `409 CONTENT_CONFLICT`

### `DELETE /api/v1/master/content/:type/:id`

حذف فیزیکی انجام نمی‌شود؛ رکورد به وضعیت `Archived` منتقل می‌شود.

**Errors:**

- `403 MASTER_ROLE_REQUIRED`
- `404 CONTENT_NOT_FOUND`

---

## Student Knowledge and Library

### `GET /api/v1/glossary`

فهرست مدخل‌های دانشنامه منتشرشده. پارامترهای اختیاری `q` برای جست‌وجو در term/full name/definition و `category` برای فیلتر دسته‌بندی هستند.

### `GET /api/v1/glossary/:slug`

جزئیات یک مدخل Published دانشنامه.

**Errors:** `404 GLOSSARY_NOT_FOUND`

### `GET /api/v1/library`

فهرست منابع کتابخانه منتشرشده. پارامترهای اختیاری `category`، `level` و `type` پشتیبانی می‌شوند.

### `GET /api/v1/library/:slug`

جزئیات یک منبع Published کتابخانه.

**Errors:** `404 LIBRARY_NOT_FOUND`

## Student Quiz

### `GET /api/v1/quizzes/:id`

جزئیات آزمون Published به‌همراه سؤال‌های Published و گزینه‌های parse‌شده.

**Errors:** `404 QUIZ_NOT_FOUND`

### `POST /api/v1/quizzes/:id/submit`

محاسبه نمره در Worker و ذخیره Attempt در جدول `quiz_attempts` برای Student یا Teacher فعالِ احراز‌شده فعلی. پاسخ نهایی فقط Online ثبت می‌شود و حالت Offline آن در MVP مجاز نیست.

**Input:**

```json
{
  "answers": {
    "question-crypto-03-01": 0,
    "question-crypto-03-02": 0
  }
}
```

**Output:** شامل `score`، `passingScore`، `passed`، `correct` و `total`.

**Errors:** `400 INVALID_ANSWERS`، `404 QUIZ_NOT_FOUND`، `409 QUIZ_EMPTY`، `413 PAYLOAD_TOO_LARGE`

## Authentication و User Management

### `GET /api/v1/auth/me`

اعتبارسنجی Clerk Token و برگرداندن وضعیت App User فعلی.

- اگر OAuth معتبر باشد ولی Onboarding انجام نشده باشد: `200` با `onboarded: false`.
- Role و Status از D1 خوانده می‌شوند.
- `provider_subject` و Token خام به Client برگردانده نمی‌شوند.

**Errors:** `401 AUTHENTICATION_REQUIRED`، `401 INVALID_TOKEN`، `401 SESSION_REVOKED`، `503 AUTH_CONFIGURATION_REQUIRED`

### `POST /api/v1/auth/onboarding/student`

Student را فقط برای OAuth هویت‌دار با `email_verified` معتبر ایجاد و Active می‌کند. Role و Status از Route Policy می‌آیند و از Body دریافت نمی‌شوند.

**Errors:** `401`، `403 EMAIL_VERIFICATION_REQUIRED`، `409 ACCOUNT_ROLE_CONFLICT`، `429 RATE_LIMITED`

### `POST /api/v1/auth/teacher/application`

درخواست Teacher را ایجاد می‌کند:

```text
role = teacher
status = pending
login_identifier = <base>@mt
```

این Endpoint Account فعال Teacher نمی‌سازد. `teachingField` الزامی و `bio` اختیاری است. ایجاد مجدد پس از `rejected` فقط با ارسال دوباره درخواست و Policy فعلی مجاز است.

### `GET /api/v1/auth/teacher/application`

درخواست خود Teacher را برای Role `teacher` برمی‌گرداند؛ حتی وضعیت `pending` یا `rejected` قابل مشاهده است.

### `POST /api/v1/auth/logout`

JTI توکن جاری را تا زمان Expiration در `auth_revoked_tokens` ثبت می‌کند و Frontend سپس `Clerk.signOut()` را اجرا می‌کند.

### Admin Teacher Workflow

```text
GET  /api/v1/admin/teacher-applications?status=pending
POST /api/v1/admin/teacher-applications/:id/approve
POST /api/v1/admin/teacher-applications/:id/reject
POST /api/v1/admin/users/:id/suspend
POST /api/v1/admin/master-provision
```

همه Endpointهای Admin نیازمند Clerk Authentication و Role فعال `admin` هستند. Approve/Reject با شرط وضعیت `pending` و D1 Batch انجام می‌شود تا درخواست دوباره یا Race Condition به Transition تکراری منجر نشود. رد درخواست Reason معتبر می‌خواهد و عملیات در `audit_logs` ثبت می‌شود.

`master-provision` فقط Role `master` را ایجاد می‌کند و Invite واقعی Clerk باید از مسیر Provider انجام شده باشد. ساخت Admin عمومی ممنوع است؛ Bootstrap Admin فقط با `BOOTSTRAP_ADMIN_PROVIDER_SUBJECT` انجام می‌شود.

## API Security Notes

- Demo Role و Headerهای `X-Demo-Role`/`X-Demo-User` در Authorization وجود ندارند.
- Origin واقعی باید از طریق `ALLOWED_ORIGIN` تعیین شود؛ بدون allow-list صریح، پاسخ Cross-Origin با `null` برگردانده می‌شود.
- Worker خطای خام D1 را به Client برنمی‌گرداند.
- Body درخواست به 64KB محدود شده است.
- Dynamic Table Name فقط از Allowlist داخلی انتخاب می‌شود.
- JWT فقط با `RS256` و Public Key تنظیم‌شده Clerk پذیرفته می‌شود.
- Responseهای Auth، User، Admin و Mutation با `Cache-Control: no-store` ارسال می‌شوند.
- Offline PWA فقط محتوای Published در Allowlist را Cache می‌کند و Protected Response را Cache نمی‌کند.
- Rate Limit فعلی D1-backed baseline است؛ برای Production باید Cloudflare WAF/Edge Limit و Rate Limit خود Provider نیز فعال باشد.
