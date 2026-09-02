# API SPEC — دارالفنون

**نسخه:** 0.1  
**Base URL:** `/api`  
**محیط فعلی:** Local Worker + D1  
**احراز هویت:** Demo Role در Development

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
```

برای عملیات Master در Development:

```text
X-Demo-Role: master
```

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

### `POST /api/v1/progress`

ثبت یا به‌روزرسانی Progress کاربر Demo.

Header اختیاری:

```text
X-Demo-User: demo-student
```

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

تمام Endpointهای زیر نیازمند `X-Demo-Role: master` در Development هستند.

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

## API Security Notes

- Demo Role فقط برای Development است.
- `X-Demo-Role` نباید در Production به‌عنوان Authorization استفاده شود.
- Origin واقعی باید از طریق `ALLOWED_ORIGIN` تعیین شود.
- Worker خطای خام D1 را به Client برنمی‌گرداند.
- Body درخواست به 64KB محدود شده است.
- Dynamic Table Name فقط از Allowlist داخلی انتخاب می‌شود.
