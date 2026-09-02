# ARCHITECTURE — دارالفنون

**نسخه:** 0.1  
**فاز:** Phase 1 — Simple Architecture  
**Complexity Level:** L1 — Simple  
**وضعیت تاریخی سند پایه:** مبنای Phase 1؛ برای وضعیت فعلی به Addendum انتهای سند مراجعه شود.

---

## Current Phase 3 Addendum — ۲ سپتامبر ۲۰۲۶

معماری L1 حفظ شده است و فقط مرز Authentication/Authorization به آن افزوده شده است:

```text
React/Vite PWA + Clerk SDK
        ↓ Bearer short-lived session token
Cloudflare Worker + Web Crypto JWT verification
        ↓ D1 App User / Role / Status / Workflow
Cloudflare D1
```

- Clerk تنها Identity Provider است؛ Password، Recovery داخلی و Identity System دوم اضافه نشده است.
- Role و Status فقط از D1 و Policy سمت Worker تعیین می‌شوند.
- Frontend Token را در `localStorage` یا `sessionStorage` ذخیره نمی‌کند.
- Service Worker فقط Shell و Public Published Content را Cache می‌کند؛ Auth، Profile، Progress، Quiz Submit و Staff/Admin در Cache نیستند.
- Migrationهای `0003_authentication.sql` و `0004_rate_limits.sql` Local اعمال شده‌اند؛ Remote به دلیل نبود Database ID و Cloudflare Access هنوز Blocked است.
- Production هنوز مجاز نیست؛ جزئیات در `docs/PHASE3_COMPLETION_AUDIT.md` ثبت شده است.

---

## 1. تصمیم معماری

برای حل مسئله فعلی از ساده‌ترین معماری قابل اعتماد استفاده می‌شود:

```text
React/Vite PWA
      ↓
Cloudflare Pages
      ↓
Cloudflare Worker API
      ↓
Cloudflare D1
```

در Vertical Slice فعلی:

```text
React/Vite PWA
      ↓
Local Demo Data
```

Worker و D1 به‌صورت جداگانه آماده شده‌اند تا بعد از تأیید UX/UI بدون بازنویسی Frontend متصل شوند.

---

## 2. چرا L1 کافی است؟

نیازهای فعلی شامل این موارد است:

- صفحات Student
- مسیر آموزشی مرحله‌ای
- Quiz و Progress
- مدیریت محتوای Master
- داده رابطه‌ای ساده
- استقرار سبک روی Cloudflare

این نیازها با یک Frontend، یک Worker و یک D1 حل می‌شوند.

موارد زیر عمداً اضافه نشده‌اند:

- Microservice
- Queue
- Event Bus
- Redis
- API Gateway
- دیتابیس دوم
- State Management پیچیده
- سرویس احراز هویت شخص ثالث
- Cache توزیع‌شده پیشرفته

```text
WHY CURRENT ARCHITECTURE IS INSUFFICIENT FOR L2/L3:
Not applicable. No current requirement requires L2 or L3.
```

---

## 3. اجزای سیستم

### Frontend

- React
- Vite
- CSS موجود و Design Tokens
- `lucide-react` برای آیکون‌های یکپارچه
- PWA Manifest
- Service Worker سبک، بدون Cache محتوای آفلاین

### Backend

- Cloudflare Worker
- TypeScript
- Native Fetch API
- بدون Router یا Abstraction Layer اضافی

### Database

- Cloudflare D1
- SQLite-compatible schema
- Migration نسخه‌بندی‌شده در `worker/migrations`

### Deployment

- Frontend: Cloudflare Pages
- API: Cloudflare Worker
- Database: Cloudflare D1
- Secrets و متغیرهای محیطی: Wrangler Variables / Secrets

---

## 4. Authentication در Snapshot تاریخی Phase 1

> این بخش تاریخی است و با Current Phase 3 Addendum جایگزین شده است.

در Snapshot Phase 1:

- Authentication واقعی فعال نیست.
- Student و Master از Demo Role استفاده می‌کنند.
- APIهای مدیریتی در Development فقط Header زیر را می‌پذیرند:

```text
X-Demo-Role: master
```

این Header امنیت Production محسوب نمی‌شود.

### شرط Production

پیش از Release واقعی باید این موارد طراحی و تأیید شوند:

- Session یا Token امن
- Hash و نگهداری رمز عبور، در صورت انتخاب Email/Password
- Authorization سمت Worker
- جلوگیری از جعل Role
- Rate Limiting مناسب Endpointهای حساس

تا آن زمان، Production API مدیریتی Release نمی‌شود.

---

## 5. Data Flow اصلی

### Student

```text
Student UI
  ↓
GET /api/v1/courses
  ↓
GET /api/v1/courses/:slug
  ↓
GET /api/v1/chapters/:id
  ↓
GET /api/v1/lessons/:slug
  ↓
POST /api/v1/progress
```

### Master

```text
Master UI
  ↓
X-Demo-Role: master (Development only)
  ↓
GET /api/v1/master/content/:type
POST /api/v1/master/content/:type
PATCH /api/v1/master/content/:type/:id
DELETE /api/v1/master/content/:type/:id
  ↓
D1
```

DELETE برای محتوای Master حذف فیزیکی انجام نمی‌دهد و محتوا را به Archived تغییر می‌دهد.

---

## 6. D1 Model

موجودیت‌های اصلی:

- faculties
- courses
- levels
- chapters
- lessons
- quizzes
- questions
- glossary_entries
- library_resources
- content_relations
- progress

روابط ضروری:

```text
Faculty 1 → N Course
Course 1 → N Level
Course 1 → N Chapter
Level 1 → N Chapter
Chapter 1 → N Lesson
Chapter 1 → N Quiz
Quiz 1 → N Question
User 1 → N Progress
```

Content Relations برای ارتباط‌های منعطف بین Lesson، Glossary، Library و Course نگهداری می‌شود.

---

## 7. Migration

### 0001_initial.sql

- **Purpose:** ایجاد مدل پایه آموزشی و محتوایی
- **Tables affected:** همه جداول L1
- **Change:** ساخت Table، Constraint، Index و Seed داده نمایشی
- **Risk:** فقط Schema تازه ایجاد می‌شود؛ داده Production موجود نیست
- **Validation:** اجرای موفق Migration در Local D1

---

## 8. Error و Security Boundary

Worker:

- Input JSON را Validate می‌کند.
- حجم Body را به 64KB محدود می‌کند.
- ID و slug را Validate می‌کند.
- دسترسی Master را برای Read/Write مدیریتی بررسی می‌کند.
- خطای داخلی را به کاربر افشا نمی‌کند.
- API Key یا Secret در Frontend ندارد.
- CORS از طریق `ALLOWED_ORIGIN` قابل محدودسازی است.

برای Production باید `ALLOWED_ORIGIN` به Origin واقعی Pages محدود شود و مقدار `*` استفاده نشود.

---

## 9. Local Development

نصب وابستگی‌ها:

```bash
npm install
```

اجرای Frontend:

```bash
npm run dev
```

اجرای Migration محلی:

```bash
npm run worker:db:local
```

اجرای Worker محلی:

```bash
npm run worker:dev -- --local --port 8787
```

Typecheck Worker:

```bash
npm run worker:typecheck
```

---

## 10. Deployment اولیه

ساخت Database:

```bash
npx wrangler d1 create darullfonon
```

سپس `database_id` واقعی در `wrangler.toml` ثبت شود؛ مقدار Placeholder نباید Deploy شود.

اجرای Migration روی Remote:

```bash
npx wrangler d1 migrations apply darullfonon --remote --config wrangler.toml
```

Deploy Worker:

```bash
npx wrangler deploy --config wrangler.toml
```

Deploy Frontend باید جداگانه از طریق Cloudflare Pages انجام شود.

---

## 11. تصمیم‌های عمداً Deferred

- Authentication واقعی
- اتصال Frontend به API واقعی
- Production database ID
- Session management
- Rate Limiting
- PDF Certificate
- Offline content caching

این موارد تا زمانی که Requirement و تأیید لازم را نداشته باشند، به معماری پیچیده‌تر تبدیل نمی‌شوند.
