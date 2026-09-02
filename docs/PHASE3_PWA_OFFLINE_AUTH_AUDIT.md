# Phase 3 — PWA Offline و مرز Authentication

**تاریخ:** ۲ سپتامبر ۲۰۲۶
**وضعیت:** Implementation محلی انجام شده؛ Browser Offline E2E و Production Verification باقی است
**Complexity Target:** `L1 — Simple`

این سند نتیجه ممیزی فعلی Service Worker، Cache و مرز Auth است. نسخه‌های قبلی این فایل Snapshot پیش از Implementation بودند؛ این نسخه وضعیت جاری Repository را ثبت می‌کند.

---

## 1. تصمیم و مرز نهایی

```text
Offline Reading: فقط محتوای Published عمومی که قبلاً دریافت شده است
Offline Authentication: ممنوع
Offline Progress Queue: ممنوع در MVP
Offline Quiz Submit: ممنوع
Offline Teacher/Admin/Master Mutation: ممنوع
Offline Authorization: وجود ندارد
```

Cache دستگاه Proof of Role، Proof of Session یا مجوز Mutation نیست.

---

## 2. Implementation فعلی

### Service Worker

`public/sw.js` این موارد را انجام می‌دهد:

- Shell استاتیک (`/`, `/index.html`, Manifest و Icon) را در Cache نسخه‌دار نگه می‌دارد.
- فقط GETهای همان Origin را بررسی می‌کند.
- Request دارای `Authorization` را از Cache خارج می‌کند.
- فقط این الگوهای Public API را Cache می‌کند:

```text
GET /api/v1/courses
GET /api/v1/courses/:slug
GET /api/v1/chapters/:id
GET /api/v1/lessons/:slug
GET /api/v1/glossary
GET /api/v1/glossary/:slug
GET /api/v1/library
GET /api/v1/library/:slug
```

- Requestهای Auth، Progress، Quiz Submit، Admin، Teacher و Master را Cache نمی‌کند.
- روی Offline بودن، فقط Cache قبلی همان Public Content را برمی‌گرداند؛ در نبود Cache پاسخ `503 OFFLINE` می‌دهد.
- Cache نسخه قدیمی را هنگام `activate` حذف می‌کند.

### API Client

- API URL از مسیر نسبی `/api` استفاده می‌کند.
- Token فقط از Clerk SDK گرفته و در حافظه برای ساخت `Authorization: Bearer` استفاده می‌شود.
- `credentials: include` استفاده نمی‌شود؛ چون Session محصول Bearer-based است و Cookie API انتخاب نشده است.
- پاسخ‌های Auth/User/Admin/Mutation با `Cache-Control: no-store` در Worker برگردانده می‌شوند.

### Backend

- Progress و Quiz مالکیت را از User معتبر D1 می‌گیرند.
- Progress فقط برای Lesson منتشرشده پذیرفته می‌شود.
- هیچ عملیات حساس از Cache یا Offline Request مجوز نمی‌گیرد.

---

## 3. نقاط قوت

- Allow-list به‌جای Cache عمومی API استفاده شده است.
- Requestهای دارای Authorization به‌صورت صریح از Cache خارج هستند.
- هیچ Token، Profile، Progress، Teacher Application یا Audit Log در Cache ذخیره نمی‌شود.
- Offline یک حالت محدود برای Reading است و Identity System دوم ایجاد نمی‌کند.
- Public Content در Backend نیز فقط در وضعیت `Published` ارائه می‌شود.
- Cache نسخه‌دار است و تغییر نسخه باعث پاک‌شدن Cache قدیمی می‌شود.

---

## 4. محدودیت‌های باقی‌مانده

این موارد در این محیط قابل اجرای واقعی نبودند و نباید `PASS` اعلام شوند:

- Browser Offline E2E روی Chrome/Chromium واقعی.
- تست Device/Browser Profile جدا برای بررسی Cache و Logout.
- تست قطع شبکه در میانه دریافت و بازخوانی کامل Public Content.
- تست Cache invalidation پس از تغییر نسخه و Deployment واقعی.
- بررسی رفتار Service Worker روی Origin نهایی Pages و مسیر واقعی `/api`.

همچنین Cache عمومی روی دستگاه توسط هر فرد دارای دسترسی به Browser Profile قابل مشاهده است؛ به همین دلیل محتوای خصوصی یا Role-sensitive نباید به Allow-list اضافه شود.

---

## 5. Acceptance Testهای لازم پیش از Release

```text
[ ] Online: دریافت Public Published Content و مشاهده آن در Cache
[ ] Offline: بازشدن فقط همان Content دریافت‌شده
[ ] Offline: Content دریافت‌نشده → 503/پیام واضح
[ ] Offline: Auth/Session جدید ایجاد نشود
[ ] Offline: Progress و Quiz Submit ثبت نشود
[ ] Offline: Teacher/Admin/Master mutation انجام نشود
[ ] Authorization request در Cache ذخیره نشود
[ ] تغییر نسخه Service Worker Cache قبلی را invalidate کند
[ ] Origin نهایی Pages و مسیر /api واقعاً کار کند
[ ] Logout باعث باقی‌ماندن داده حساس در Cache نشود
```

تا اجرای این موارد با Browser واقعی:

```text
PWA Offline Browser E2E: NOT VERIFIED
PWA Design Boundary: PASS BY INSPECTION
Production PWA Release: BLOCKED
```

---

## 6. تصمیم برای ادامه Phase 3

در Phase 3 فعلی هیچ Queue، Sync، IndexedDB یا Encryption سمت Client اضافه نمی‌شود. اگر Offline Progress یا Quiz در آینده Requirement واقعی شد، باید Change Request جدا با Idempotency، Conflict Policy، مالکیت User و Threat Model تصویب شود.
