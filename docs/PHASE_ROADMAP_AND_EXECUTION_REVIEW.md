# نقشه راه فازها و چارچوب جلسه بررسی اجرای دارالفنون

**تاریخ تهیه:** ۲ سپتامبر ۲۰۲۶
**Branch:** `arena/01a05d5b-darullfonon`
**Complexity Target:** `L1 — Simple`
**نوع سند:** جمع‌بندی مستندات موجود، وضعیت فعلی، نقشه راه و دستور جلسه تصمیم‌گیری

> این سند افزایشی است و جایگزین `PRODUCT_SPEC.md`، `ARCHITECTURE.md`، `FINAL_AUDIT.md`، `PHASE1_AUDIT.md`، `PHASE1_FULL_AUDIT.md` یا `PHASE2_API_QA.md` نمی‌شود.

> **Current status addendum:** بخش‌های تاریخی این سند وضعیت پیش از اجرای Phase 3 را توصیف می‌کنند. اکنون Phase 3 Authentication/Authorization در Repository پیاده‌سازی و Local تست شده است؛ Operational Verification و Production Release همچنان Blocked هستند. گزارش مرجع: `docs/PHASE3_COMPLETION_AUDIT.md`.

## وضعیت جاری در ۲ سپتامبر ۲۰۲۶

```text
Phase 0: PASS WITH WARNINGS — historical Discovery
Phase 1: PASS WITH WARNINGS — historical L1 Architecture
Phase 2: APPROVED WITH WARNINGS — Local API Integration
Phase 3: IMPLEMENTED LOCALLY — operational gates NOT VERIFIED
Phase 4: NOT STARTED — intentionally blocked
Production: BLOCKED
```

---

## 1. نکته مهم درباره جلسه و نظرات افراد

این فایل بر اساس وضعیت واقعی Repository، Commitها، Migrationها، API Smoke Testها و گزارش‌های QA تهیه شده است؛ **صورت‌جلسه یک جلسه برگزارشده نیست**.

در این محیط، نام و نظر واقعی مدیران، اعضای تیم تحقیق و توسعه، مشاوران AI، مهندسان کنترل کیفیت و مهندسان نظارت در اختیار نیست. بنابراین هیچ نظر یا حضور فرضی به افراد نسبت داده نمی‌شود. بخش «ثبت نظر اعضا» عمداً خالی و آماده تکمیل در جلسه واقعی است.

پس از دریافت نظر واقعی هر نقش، همین سند می‌تواند به‌صورت افزایشی با تصمیم‌های نهایی، مالک اقدام و موعد اجرا تکمیل شود.

---

## 2. پاسخ کوتاه: کجا هستیم؟

> متن این بخش Snapshot تاریخی پیش از اجرای Phase 3 است. وضعیت قابل اتکا برای امروز در «وضعیت جاری» و `docs/PHASE3_COMPLETION_AUDIT.md` آمده است.

```text
Phase 0 — Discovery
        ↓ PASS WITH WARNINGS
Phase 1 — L1 Architecture
        ↓ PASS WITH WARNINGS
Phase 2 — API Integration
        ↓ APPROVED WITH WARNINGS برای Local Development
-----------------------------------------------
موقعیت فعلی: پایان Phase 2 و آماده Gate تصمیم‌گیری Phase 3
-----------------------------------------------
Phase 3 — Production Security / Authentication
        ↓ NOT STARTED
Phase 4 — Release Readiness
        ↓ NOT STARTED
Production Release
        ↓ BLOCKED
```

### وضعیت دقیق فعلی

| بخش | وضعیت | شواهد اصلی |
|---|---|---|
| Product Discovery | تکمیل‌شده با Warning | `docs/PRODUCT_SPEC.md` |
| L1 Architecture | تکمیل‌شده با Warning | Commit `b1d41c5` و گزارش‌های Phase 1 |
| Frontend API Client | تکمیل‌شده | `src/api.js` |
| Student Course Flow | متصل به Worker/D1 محلی | Course، Chapter، Lesson، Quiz |
| Quiz Submit | متصل و پایدار در Local D1 | جدول `quiz_attempts` در Migration 0002 |
| Progress | Write/Read متصل | `POST/GET /api/v1/progress` |
| Glossary/Library | List، Filter و Detail متصل | API و UI Student |
| Master CRUD | Create، Read، Update، Archive متصل | API + UI؛ در خطای Backend داده محلی منبع اعتماد نیست |
| Phase 2 QA | تأییدشده با Warning | `docs/PHASE2_API_QA.md`؛ Snapshot تاریخی |
| Production Security | Implementation محلی انجام شده | Clerk/Remote D1/CORS/WAF/Browser E2E هنوز NOT VERIFIED |
| Production Release | مجاز نیست | Environment واقعی، Route Production و E2E کامل نشده است |

### آخرین وضعیت Git

```text
HEAD: c1a07d2 feat: implement Clerk authentication and authorization phase 3
Branch: arena/01a05d5b-darullfonon
Working tree: clean
```

---

## 3. اسناد مرجع فازبندی

| سند | نقش در برنامه |
|---|---|
| `docs/PRODUCT_SPEC.md` | تعریف محصول، کاربران، Scope و Out of Scope فاز Discovery |
| `docs/ARCHITECTURE.md` | معماری L1، اجزای Frontend/Worker/D1 و مرز Demo/Production |
| `docs/API_SPEC.md` | قرارداد endpointها، ورودی‌ها، خروجی‌ها و خطاها |
| `docs/SECURITY_NOTES.md` | شروط امنیتی پیش از Production |
| `docs/FINAL_AUDIT.md` | ممیزی Vertical Slice و پیشنهاد مسیر بعدی |
| `docs/PHASE1_AUDIT.md` | ممیزی معماری و API پایه |
| `docs/PHASE1_FULL_AUDIT.md` | ریسک‌ها و مسیر پیشنهادی Stabilization، API، Security و Release |
| `docs/PHASE2_API_QA.md` | نتیجه QA اجرای واقعی Phase 2 |
| `CHANGELOG.md` | تاریخچه افزایشی تغییرات و خروجی‌های Verified |

### رابطه اسناد

```text
PRODUCT_SPEC
    ↓ نیاز و Scope
ARCHITECTURE
    ↓ تصمیم فنی L1
FINAL_AUDIT / PHASE1_AUDIT
    ↓ کشف ریسک و Gate بعدی
PHASE1_FULL_AUDIT
    ↓ برنامه A تا D
PHASE2_API_QA
    ↓ تأیید اتصال واقعی Local
این سند
    ↓ نقشه راه و چارچوب تصمیم‌گیری تیمی
```

---

## 4. شیوه اجرای هر فاز

## Phase 0 — Discovery

### هدف

توافق روی مسئله، کاربر اصلی، خروجی MVP، Scope، Out of Scope، Platform و اصول تجربه کاربری پیش از تصمیم معماری.

### کارهای اجرایی

1. تعریف مسئله اصلی و معیار موفقیت.
2. تعریف Student و Master به‌عنوان دو نقش Demo مستقل.
3. تعیین مسیر اصلی Vertical Slice.
4. تعیین الزامات RTL، فارسی، Mobile First و Themeها.
5. ثبت موارد خارج از Scope مانند Authentication واقعی، Offline و Analytics پیشرفته.
6. تعیین Complexity Target روی `L1 — Simple`.

### خروجی مورد انتظار

- Product Spec تأییدشده.
- Scope و Out of Scope روشن.
- معیار موفقیت قابل تست.
- تصمیم‌های باز ثبت‌شده.

### Gate خروج

- Product و UX مسئله و مسیر اصلی را تأیید کنند.
- Scope Creep وجود نداشته باشد.
- تصمیم‌های معماری باز به Phase 1 منتقل شوند.

### وضعیت

```text
PASS WITH WARNINGS — documented historical gate
```

---

## Phase 1 — L1 Architecture / Stabilization

### هدف

تبدیل Scope تأییدشده به معماری ساده و قابل اجرا، بدون ارتقای غیرضروری به L2 یا L3.

### کارهای اجرایی

1. حفظ React/Vite و CSS موجود.
2. تعریف مرز Frontend، Worker و D1.
3. تعریف مدل رابطه‌ای ساده و Migration نسخه‌بندی‌شده.
4. ایجاد API پایه Course، Chapter، Lesson و Master Content.
5. تعریف Validation، Error Contract، Demo Role و CORS پایه.
6. اجرای Build، Typecheck، Migration و API Smoke Test.
7. ثبت ریسک‌های Production و جداسازی آن‌ها از Demo Development.

### خروجی

- `ARCHITECTURE.md`
- `API_SPEC.md`
- `SECURITY_NOTES.md`
- Worker و Migration اولیه
- گزارش‌های Phase 1

### Gate خروج

- معماری در L1 باقی بماند.
- Migration محلی از دیتابیس تازه موفق باشد.
- API پایه و Master CRUD از نظر Contract و Security Boundary قابل تست باشند.
- Production به‌دلیل Demo Auth و Placeholder D1 صریحاً مسدود بماند.

### وضعیت

```text
PASS WITH WARNINGS
```

**شاهد:** Commit `b1d41c5` و گزارش `docs/PHASE1_FULL_AUDIT.md`.

---

## Phase 2 — API Integration

### هدف

اتصال مسیر واقعی Frontend، Worker و D1 در حد Vertical Slice؛ نه ساخت API کامل و نه اضافه‌کردن پیچیدگی خارج از نیاز.

### کارهای اجرایی انجام‌شده

```text
Course List
  ↓
Course Detail
  ↓
Chapter
  ↓
Lesson
  ↓
Progress Write/Read
  ↓
Quiz GET
  ↓
Quiz Submit
  ↓
D1 quiz_attempts
```

همچنین:

- Glossary list/search/detail به API متصل شد.
- Library list/filter/detail به API متصل شد.
- Master Create/Read/Update/Archive به API متصل شد.
- Loading، Error، Retry و Empty State اضافه شد.
- Local Demo Data به‌عنوان fallback مشخص حفظ شد.
- Migration `0002_quiz_attempts.sql` اضافه و از دیتابیس تازه اجرا شد.

### خروجی

- `src/api.js`
- `src/useApiResource.jsx`
- اتصال Viewهای Student و Master
- Endpointهای جدید Worker
- Migration 0002
- `docs/PHASE2_API_QA.md`

### Gate خروج

- Build و Worker Typecheck موفق.
- Fresh D1 Migration `0001 + 0002` موفق.
- API Contract، Quiz Attempt و Progress read/write موفق.
- Role Guard و Master CRUD موفق.
- Regression روی Shell، Theme، RTL و Demo Boundary بدون آسیب.

### وضعیت

```text
APPROVED WITH WARNINGS — Local Development only
```

### مواردی که هنوز Production را مسدود می‌کنند

- Authentication واقعی و استخراج User ID از Session معتبر.
- Authorization واقعی برای Master.
- Remote D1 و Database ID واقعی.
- CORS Allowlist نهایی.
- Rate Limiting و Abuse Testing.
- Browser E2E کامل.

---

## Phase 3 — Production Security / Authentication

**وضعیت:** شروع نشده؛ مرحله بعدی پس از تأیید واقعی تیم.

### هدف

حذف وابستگی امنیتی به Demo Headerها و آماده‌سازی حداقل مرز امن برای Staging/Production.

### پیش‌شرط ورود

پیش از کدنویسی این فاز، جلسه باید درباره موارد زیر تصمیم مکتوب بدهد:

1. روش Authentication: Session امن، سرویس هویت بیرونی یا روش مورد تأیید محصول.
2. نقش‌ها و Permissionهای واقعی Student/Master.
3. محل نگهداری Session/Token و سیاست Expiration/Revocation.
4. User ID معتبر برای Progress و Quiz Attempt.
5. محیط و مالک Remote D1.
6. Origin واقعی Cloudflare Pages.
7. حداقل سیاست Rate Limiting و Audit Log.

### کارهای اجرایی

1. پیاده‌سازی Authentication انتخاب‌شده بدون شکستن Demo Mode محلی.
2. استخراج User ID از Session معتبر، نه `X-Demo-User` قابل جعل.
3. پیاده‌سازی Authorization سمت Worker برای همه endpointهای Master.
4. Fail-closed کردن CORS در Production و الزام `ALLOWED_ORIGIN` معتبر.
5. ساخت Remote D1 و اعمال Migration با کنترل نسخه.
6. جداسازی Seed Demo از Migration Production در صورت نیاز.
7. تعریف Rate Limiting پایه برای Login و Write Endpointها.
8. تست جعل Role، دسترسی بین کاربران، Input Boundary و Abuse.
9. ثبت Secretها فقط در Wrangler Secrets/Variables و عدم ورود آن‌ها به Frontend.

### خروجی مورد انتظار

- تصمیم Authentication ثبت‌شده.
- Session/Token و Authorization تست‌شده.
- Remote D1 با Migration تأییدشده.
- CORS Allowlist نهایی.
- تست Security و گزارش ریسک.
- به‌روزرسانی افزایشی `SECURITY_NOTES.md`، `ARCHITECTURE.md` و `API_SPEC.md`.

### Gate خروج

```text
هیچ Critical/High Security Finding باز نماند.
Demo Header در Production پذیرفته نشود.
Remote D1 و Rollback Plan تأیید شوند.
```

تا قبل از این Gate، Production Release ممنوع است.

---

## Phase 4 — Release Readiness

**وضعیت:** شروع نشده و وابسته به خروج موفق Phase 3.

### هدف

تأیید نهایی قابلیت انتشار با تست کاربر، Browser، Performance، Migration و عملیات.

### کارهای اجرایی

1. Browser Smoke Test مسیر Student از Role تا Result.
2. Browser Smoke Test مسیر Master با Permission واقعی.
3. تست Responsive روی Viewportهای اصلی.
4. Regression روی Light، Dark، Reading، RTL و Mobile Navigation.
5. اجرای Lighthouse و بررسی Bundle/Font/Asset.
6. اجرای Migration روی Remote در محیط کنترل‌شده.
7. بررسی Production Config، Origin، Secret و Database ID.
8. تعریف Monitoring پایه Worker و Client.
9. تهیه Rollback و Backup/Recovery Plan مناسب D1.
10. ثبت Known Limitations و تصمیم Go/No-Go.

### Gate خروج

```text
Browser Smoke: PASS
Regression: PASS
Remote Migration: PASS
Production Configuration: PASS
Critical/High Finding: 0 open
Go/No-Go: GO
```

پس از این Gate، انتشار Production قابل بررسی است؛ نه پیش از آن.

---

## 5. نقشه راه اجرایی پیشنهادی

```text
[Phase 0: Discovery]
        │  Scope / Product Gate
        ▼
[Phase 1: L1 Architecture]
        │  Architecture / API Gate
        ▼
[Phase 2: API Integration]
        │  Local Integration QA Gate — APPROVED WITH WARNINGS
        ▼
[جلسه تصمیم‌گیری تیمی]
        │  Authentication + Remote D1 + Security Scope
        ▼
[Phase 3: Production Security]
        │  Security Gate
        ▼
[Phase 4: Release Readiness]
        │  Browser / Regression / Operations Gate
        ▼
[Production Go / No-Go]
```

### ترتیب اولویت فعلی

```text
1. ثبت نظر واقعی نقش‌های جلسه
2. تصویب یا اصلاح محدوده Phase 3
3. انتخاب Authentication
4. تعیین مالک و محیط Remote D1
5. اجرای Phase 3 با حفظ L1
6. ممیزی امنیتی مجدد
7. اجرای Phase 4
8. تصمیم نهایی Production Go/No-Go
```

### مواردی که نباید هم‌زمان شروع شوند

برای حفظ L1 و کاهش ریسک، این موارد تا زمان نیاز مصوب نباید وارد شوند:

- Microservice یا API Gateway.
- Queue/Event Bus.
- Redis یا Cache توزیع‌شده پیچیده.
- Offline Content Cache.
- Permission Matrix پیچیده پیش از نیاز واقعی.
- Analytics پیشرفته.
- Test Suite سنگین پیش از تعیین Browser Smoke پایه.

---

## 6. چارچوب جلسه واقعی بررسی فازها

### هدف جلسه

1. تأیید اینکه تیم روی وضعیت فعلی توافق دارد.
2. بررسی شواهد Phase 0، Phase 1 و Phase 2.
3. تصمیم‌گیری درباره ورود به Phase 3.
4. تعیین شروط، مالک و زمان‌بندی اقدامات.
5. جلوگیری از شروع Production Security بدون تصمیم معماری Authentication و Remote D1.

### افراد و نقش‌های مورد انتظار

حضور واقعی و اعلام نظر این گروه‌ها باید در جلسه ثبت شود:

- مدیر پروژه / Project Director
- مدیر محصول و UX Lead
- مدیر تحقیق و توسعه نرم‌افزار
- Solution Architect
- Full-Stack / Frontend / Backend Developer
- مهندس یا سرپرست پایگاه داده و Cloudflare
- مهندس کنترل کیفیت و QA Lead
- مهندس اتوماسیون یا Browser Test
- Technical Auditor
- مهندس بخش نظارت / Compliance یا Release Oversight
- مشاور یا مشاوران AI
- نماینده مدیران مربوط به محصول، فنی و انتشار

این فهرست «نقش مورد انتظار» است و به معنای حضور قطعی هیچ فردی نیست.

### دستور جلسه پیشنهادی — ۱۲۰ دقیقه

| زمان | موضوع | خروجی الزامی |
|---:|---|---|
| ۱۰ دقیقه | افتتاح و تعیین هدف | توافق روی تصمیم‌های موردنیاز |
| ۱۵ دقیقه | مرور Product و Phase 0 | تأیید Scope و Out of Scope |
| ۱۵ دقیقه | مرور Architecture و Phase 1 | تأیید L1 و ریسک‌های باقی‌مانده |
| ۲۵ دقیقه | ارائه شواهد Phase 2 | تأیید Build، Migration، API و Student Path |
| ۲۰ دقیقه | بررسی QA و Regression | قبول، شرط‌گذاری یا رد Gate |
| ۲۵ دقیقه | تصمیم Phase 3 | انتخاب Auth، Remote D1 و Security Scope |
| ۱۰ دقیقه | ثبت نظر تک‌تک نقش‌ها | Position، ریسک و شرط هر نقش |
| ۱۰ دقیقه | جمع‌بندی و تعیین مالک | Action، Owner، Deadline و Gate بعدی |

### قالب اظهار نظر هر عضو

هر فرد باید بدون ابهام این پنج مورد را اعلام کند:

```text
نام و نقش:
موضع: Approve / Approve with Conditions / Reject
نظر درباره وضعیت فعلی:
مهم‌ترین ریسک یا مخالفت:
شرط ورود به Phase بعد:
اقدام پیشنهادی، مالک و موعد:
```

### پرسش‌های اجباری جلسه

#### برای مدیریت و محصول

- آیا Scope فعلی هنوز همان Scope مصوب است؟
- آیا Phase 2 برای Local Demo نیاز محصول را برآورده کرده است؟
- آیا ورود به Production Security از نظر کسب‌وکار اولویت دارد؟

#### برای معماری و مهندسی

- آیا انتخاب Authentication با L1 سازگار است؟
- آیا Remote D1 در این مرحله لازم است یا Staging جدا نیاز داریم؟
- آیا تغییر پیشنهادی باعث ارتقای ناخواسته L1 به L2 می‌شود؟

#### برای QA و کنترل کیفیت

- آیا هر Gate شواهد قابل تکرار دارد؟
- کدام تست پیش از Phase 3 یا Phase 4 اجباری است؟
- آیا Warning موجود Blocker است یا باید به Backlog برود؟

#### برای نظارت و ممیزی

- آیا Demo و Production در مستندات و UI از هم قابل تشخیص‌اند؟
- آیا User ID، Role و Audit Trail قابل اعتماد خواهند بود؟
- چه ریسک‌هایی باید پیش از Go/No-Go بسته شوند؟

#### برای مشاوران AI

- آیا استفاده از AI در محصول یا چرخه توسعه نیازمند کنترل داده، حریم خصوصی یا ثبت Audit جداست؟
- آیا پیشنهاد فنی AI با Scope، L1 و امنیت محصول سازگار است؟
- چه چیزی نباید به دلیل AI وارد Scope شود؟

---

## 7. ثبت نظر واقعی اعضا — تکمیل در جلسه

| نقش | نام فرد | موضع | نظر / ریسک | شرط Phase 3 | Owner / موعد |
|---|---|---|---|---|---|
| Project Director | Pending | Pending | Pending | Pending | Pending |
| Product / UX Lead | Pending | Pending | Pending | Pending | Pending |
| R&D Manager | Pending | Pending | Pending | Pending | Pending |
| Solution Architect | Pending | Pending | Pending | Pending | Pending |
| Full-Stack Engineer | Pending | Pending | Pending | Pending | Pending |
| Database / Cloudflare Engineer | Pending | Pending | Pending | Pending | Pending |
| QA Lead | Pending | Pending | Pending | Pending | Pending |
| Browser Test Engineer | Pending | Pending | Pending | Pending | Pending |
| Technical Auditor | Pending | Pending | Pending | Pending | Pending |
| Oversight / Compliance | Pending | Pending | Pending | Pending | Pending |
| AI Advisor | Pending | Pending | Pending | Pending | Pending |
| Product / Technical Management | Pending | Pending | Pending | Pending | Pending |

---

## 8. جمع‌بندی فعلی بر اساس شواهد Repository

این جمع‌بندی، نتیجه بررسی فنی موجود است و **جایگزین جمع‌بندی جلسه واقعی و نظرات افراد نیست**:

1. Phase 0 و Phase 1 از نظر مستندات و Gate تاریخی پشت سر گذاشته شده‌اند و هر دو با Warning ثبت شده‌اند.
2. Phase 2 در Local Development اجرا شده و QA آن را `APPROVED WITH WARNINGS` اعلام کرده است.
3. اتصال Frontend، Worker و D1 در Local برای مسیرهای اصلی و مرز Auth وجود دارد؛ داده محلی Master در خطای Backend منبع اعتماد نیست.
4. Complexity روی `L1 — Simple` باقی مانده است.
5. Phase 3 در Repository پیاده‌سازی شده، اما Clerk/Remote D1/CORS/WAF و Browser E2E عملیاتی Verify نشده‌اند.
6. Phase 4 تا بسته‌شدن Gateهای Environment-dependent Phase 3 نباید شروع شود.
7. Production تا تکمیل این Gateها و اجرای Final Audit همچنان Blocked است.

### تصمیم کاری فعلی

```text
Phase 2 Local Gate: قبول با Warning تاریخی
Phase 3 Repository Gate: قبول برای Local؛ Production NOT VERIFIED
ورود به Phase 4: Blocked تا بسته‌شدن Gateهای Phase 3
Production Release: رد تا تکمیل Phase 3 و Phase 4
```

### جمع‌بندی نهایی پس از برگزاری جلسه

```text
[پس از جلسه واقعی تکمیل شود]
- تصمیم نهایی:
- Phase مجاز برای شروع:
- شروط لازم:
- اقدامات مصوب:
- مالک هر اقدام:
- موعد هر اقدام:
- ریسک‌های پذیرفته‌شده:
- تاریخ بازبینی بعدی:
```
