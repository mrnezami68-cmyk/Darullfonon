# PWA و Offline Access — Initial Audit

**تاریخ:** ۲ سپتامبر ۲۰۲۶  
**وضعیت:** AUDIT COMPLETE — OFFLINE READING SCOPE CONFIRMED FOR PLAN  
**Complexity Target:** `L1 — Simple`

این سند در پاسخ به نیاز بررسی قابلیت‌های فعلی PWA و امکان استفاده آفلاین ثبت شده است. بررسی فقط Inspect و Plan است؛ Service Worker، API یا Authentication تغییر نکرده‌اند.

---

## 1. قابلیت فعلی PWA

فایل‌های بررسی‌شده:

- `index.html`
- `public/manifest.webmanifest`
- `public/sw.js`
- `src/main.jsx`
- `src/api.js`
- `package.json`
- `vite.config.js`

نتیجه:

- Web App Manifest وجود دارد.
- اپ در `src/main.jsx`، `public/sw.js` را هنگام Load ثبت می‌کند.
- Service Worker فقط `install`، `activate` و `clients.claim()` دارد.
- هیچ `fetch` handler وجود ندارد.
- هیچ Cache Storage یا precache برای Shell وجود ندارد.
- خود فایل Service Worker صراحتاً می‌گوید Offline Content در MVP Cache نمی‌شود.
- هیچ IndexedDB، Offline Queue یا Sync وجود ندارد.
- API Client همه داده‌ها را از مسیر شبکه `/api` می‌گیرد.
- `localStorage` فعلی فقط Theme و Demo Role را نگه می‌دارد؛ این Session یا Offline Authorization نیست.

### نتیجه دقیق

```text
PWA Installability: PRESENT
Offline App Shell: NOT GUARANTEED
Offline Course Content: NOT IMPLEMENTED
Offline Progress Sync: NOT IMPLEMENTED
Offline Quiz Submission: NOT IMPLEMENTED
Offline Authentication: NOT IMPLEMENTED
```

بنابراین در وضعیت فعلی، نصب PWA به‌تنهایی به معنی قابل‌استفاده‌بودن آفلاین نیست.

---

## 2. Offline و Authentication چه تفاوتی دارند؟

آفلاین‌بودن نباید به معنای دورزدن Authentication/Authorization باشد:

- OAuth و اولین Sign-in به شبکه نیاز دارند.
- اعتبار Session، Role و Status باید در Backend تأیید شود.
- اگر شبکه قطع است، Worker نمی‌تواند برای درخواست جدید Authorization زنده انجام دهد.
- Cache سمت دستگاه Proof of Role یا Proof of Admin نیست.
- Teacher، Master و Admin نباید هیچ عملیات حساس را آفلاین انجام دهند.
- Offline mode باید یک حالت محدود برای محتوای از قبل دریافت‌شده باشد، نه یک Identity System دوم.

### مدل امن پیشنهادی

```text
Online:
  OAuth Login → Session Cookie → Worker Authorization → D1

Offline:
  Cached public/prefetched learning content → read-only
  No Progress Queue in MVP
  No Admin/Staff mutation
```

---

## 3. ساده‌ترین Offline Scope در L1

### Scope تأییدشده برای Plan

1. **Offline Reading:** Student پس از یک بار اتصال آنلاین، محتوای Published انتخاب‌شده را برای مطالعه آفلاین ببیند.
2. **No Offline Progress Queue در MVP:** Progress فقط Online ثبت شود تا نیاز به مالکیت Queue و Conflict Policy اضافه نشود.
3. **No Offline Quiz:** ثبت نهایی و Score فقط روی Server و در حالت Online انجام شود.
4. **No Offline Admin/Staff:** پنل Master، Admin و Teacher Application آفلاین در دسترس عملیاتی نباشد.
5. **No Token Storage:** Token، Refresh Token، Cookie Secret و Role در `localStorage`، Cache Storage یا IndexedDB ذخیره نشود.

### چرا این Scope کم‌ریسک است؟

- تجربه اصلی مطالعه Offline می‌شود.
- Auth و Authorization همچنان فقط Backend مرجع دارند.
- Cache داده حساس User/Staff ایجاد نمی‌شود.
- نیاز به Database یا Service جدید ندارد.
- Progress در MVP اصلاً Queue نمی‌شود و فقط Online ثبت می‌شود.

---

## 4. طرح فنی حداقلی، در صورت اجرای Offline Reading

### Service Worker

- Precache کردن Assetهای Hash‌شده Shell با نسخه مشخص.
- Runtime cache فقط برای allow-list محتوای عمومی و Published:

```text
GET /api/v1/courses
GET /api/v1/courses/:slug
GET /api/v1/chapters/:id
GET /api/v1/lessons/:slug
GET /api/v1/glossary
GET /api/v1/library
```

- عدم Cache برای:

```text
/auth/*
/api/v1/auth/*
/api/v1/progress
/api/v1/quizzes/*/submit
/api/v1/admin/*
/api/v1/teacher/*
/api/v1/master/*
/api/v1/auth/me
```

- cache key نسخه‌دار و invalidation برای Content update.
- عدم استفاده از `Cache-Control` به‌عنوان جایگزین Authorization.

### Client Data

- در Scope فعلی، هیچ Offline Progress Queue در MVP ایجاد نمی‌شود.
- Progress فقط با اتصال شبکه و Session معتبر به Worker ارسال می‌شود.
- در صورت اضافه‌شدن Queue در آینده، باید در IndexedDB (نه `localStorage`) و با `client_event_id` یکتا، قفل مالکیت User و Sync idempotent طراحی شود.

### Backend

- هر Progress Request آنلاین دوباره Validation و Authorization شود.
- `user_id` فقط از Session معتبر Worker تعیین شود.
- `status` و `role` از Request عمومی پذیرفته نشوند.

---

## 5. امنیت Cache و Device

Cache روی دستگاه ممکن است توسط هر فردی که به Device/Browser Profile دسترسی دارد خوانده شود. بنابراین:

- فقط محتوای عمومی یا محتوایی که Product صراحتاً Offline آن را مجاز می‌داند Cache شود.
- Progress شخصی، Profile، Email، Teacher Application، Admin List و Audit Log Cache نشوند.
- Offline Content نباید شامل داده‌ای باشد که بعداً با Logout باید حذف شود، مگر Cache Ownership و Clear Policy مشخص شود.
- Clear Site Data/Logout باید رفتار Cache را روشن کند.
- رمزگذاری Client-side بدون Key Management واقعی امنیت کاذب ایجاد می‌کند و برای L1 پیشنهاد نمی‌شود.

---

## 6. Acceptance Criteria پیشنهادی Offline Reading

این موارد Scope تأییدشده را به Test Case تبدیل می‌کنند:

```text
1. پس از یک بازدید آنلاین، Shell و محتوای Published انتخاب‌شده آفلاین باز شوند.
2. Offline UI صریحاً «حالت مطالعه آفلاین» را نشان دهد، نه «Session معتبر جدید».
3. هیچ Auth Token یا Staff/User Response حساس در Cache Storage ذخیره نشود.
4. Progress و Quiz در Offline قابل ثبت نهایی نباشند.
5. Admin/Teacher/Master mutation در Offline قابل انجام نباشد.
6. Offline content بعد از تغییر نسخه، invalidation داشته باشد.
7. Service Worker فقط routeهای allow-list شده را Cache کند.
```

---

## 7. تصمیم ثبت‌شده

```text
Offline Reading: CONFIRMED FOR PLAN
Offline Progress Queue: NO FOR MVP
Offline Quiz: NO
Offline Auth: NO
Offline Staff/Admin: NO
```

این Scope برای حفظ L1 انتخاب شده است. اگر بعداً Progress Queue یا Offline Quiz لازم شود، باید Change Request و Security/Data Integrity Plan جدا داشته باشد.
