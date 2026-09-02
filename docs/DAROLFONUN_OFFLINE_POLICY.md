# دارالفنون — Offline Learning & Online Transaction Policy

**نسخه:** 1.0  
**وضعیت:** `APPROVED / GOVERNING POLICY`  
**تاریخ تصویب:** ۱۴۰۵/۰۶/۱۱  
**دامنه:** PWA، UX/UI، Frontend، Worker، D1، Authentication، Learning، Profile و Sync

این سند مرجع رسمی رفتار Offline دارالفنون است و در Phase 3.2 و Private Pilot بر اسناد قبلی Offline مقدم است.

## 1. اصل بنیادی

> **Offline Reading, Online Transactions**

تجربه یادگیری تا حد امکان بدون اینترنت ادامه پیدا می‌کند؛ اما تمام عملیات رسمی، حساس و Server-Authoritative آنلاین باقی می‌مانند.

```text
D1 / Backend = Source of Truth
Local Store = Last Known Read-only State
Server wins
```

## 2. معماری مصوب

```text
React / Vite PWA
        ↓
Cloudflare Pages
        ↓
Cloudflare Worker
        ↓
Cloudflare D1
        +
Clerk
```

Offline باید با قابلیت‌های موجود PWA و یک Local Store سبک اجرا شود. موارد زیر خارج از Policy هستند:

- Offline Authentication
- Offline Transaction Queue
- Offline Progress یا Quiz Mutation
- Offline Staff/Admin Mutation
- Redis، Queue، Microservice، Sync Service جداگانه، Event Sourcing، CRDT و WebSocket

## 3. Offline-capable

موارد زیر در صورت دریافت معتبر و مجاز قابل مشاهده Offline هستند:

- App Shell
- Published Articles
- Published Library Content
- Published Courses و Lessons
- Learning Path Snapshot
- Profile Snapshot محدود
- آخرین Progress معتبر
- محتوای قبلاً دریافت‌شده و مجاز

محتوای Unpublished، Unauthorized، Deleted، Revoked و داده‌های خصوصی یا مدیریتی نباید صرفاً به‌دلیل Cache شدن قابل مشاهده شود.

## 4. Online-required

موارد زیر همیشه به Backend و Session معتبر نیاز دارند:

- ورود و احراز هویت جدید
- آزمون، شروع آزمون و ارسال پاسخ
- ثبت نتیجه آزمون
- Progress Mutation
- تغییر رمز و اطلاعات حساس حساب
- عملیات Teacher، Master و Admin
- هر عملیات مدیریتی، امنیتی یا Server-Authoritative

## 5. جدول قابلیت‌ها

| قابلیت | Online | Offline | سیاست |
|---|---:|---:|---|
| App Shell | بله | بله | قابل استفاده |
| Articles، Library و مطالب آموزشی Sync‌شده | بله | بله | آخرین نسخه محلی |
| Course و Lesson منتشرشده و Sync‌شده | بله | بله | Read-only |
| Learning Path | بله | بله | آخرین Snapshot |
| Profile | بله | بله | آخرین Snapshot محدود |
| Progress Display | بله | بله | آخرین وضعیت Sync‌شده |
| Exam و Quiz Submission | بله | خیر | Online Required |
| Progress Mutation | بله | خیر | Server-Authoritative |
| Password/Sensitive Account Change | بله | خیر | Online Required |
| Teacher/Master/Admin Operations | بله | خیر | Online Required |

## 6. رفتار Offline و UX

در قطع اینترنت، PWA نباید فقط صفحه خطا نمایش دهد. باید:

1. App Shell را باز کند.
2. Offline بودن را تشخیص دهد.
3. محتوای محلی معتبر را نمایش دهد.
4. آخرین Profile و Progress معتبر را نمایش دهد.
5. زمان آخرین Sync را نمایش دهد.
6. قابلیت‌های Online-required را غیرفعال یا محدود کند.

وضعیت‌های قابل نمایش در UI فقط در حد نیاز محصول:

```text
Online
Offline
Syncing
Sync Failed
```

نمونه پیام:

```text
آفلاین — نمایش آخرین اطلاعات همگام‌شده
آخرین همگام‌سازی: امروز، ۱۸:۲۵
```

`Backend Reachability` باید در لایه فنی از `navigator.onLine` جدا تشخیص داده شود، اما لازم نیست به State پیچیده مستقل در UI تبدیل شود.

## 7. Snapshot Ownership

هر Snapshot کاربرمحور باید به User صحیح وابسته باشد.

- Logout: داده‌های هویتی و Snapshotهای خصوصی پاک یا غیرقابل استفاده شوند.
- Account Switch: Snapshot حساب قبلی برای حساب جدید نمایش داده نشود.
- Revocation: پس از Online شدن، Authorization و Content Refresh انجام شود.
- Session Expiry: Snapshot فقط برای نمایش آخرین وضعیت آموزشی قابل استفاده باشد و هیچ عملیات Authenticated از آن انجام نشود.
- Token، Secret یا Credential نباید در Local Store ذخیره شود.

## 8. Progress

### Online

Progress طبق قرارداد Backend و User معتبر D1 ثبت می‌شود.

### Offline

فقط آخرین Progress ثبت‌شده روی Server نمایش داده می‌شود. فعالیت جدید کاربر نباید به‌عنوان Progress ثبت‌شده یا Sync‌شده نمایش داده شود.

```text
Offline Progress Submission = NOT ALLOWED
Offline Progress Display = ALLOWED
```

## 9. آزمون و تراکنش

آزمون کاملاً Online است. در Offline کاربر نمی‌تواند آزمون را شروع کند، پاسخ بفرستد یا نتیجه رسمی تولید کند.

مسیر رسمی:

```text
Start Exam
→ Server Validation
→ Exam Session
→ Answer Submission
→ Server Evaluation
→ Result Saved
→ Profile Updated
```

## 10. Sync on Reconnect

چرخه Sync حداقلی است:

```text
Online Detected
      ↓
Backend Reachability
      ↓
Session / Authorization Check
      ↓
Check Content Revision
      ↓
Download Changed Content
      ↓
Refresh Profile / Progress
      ↓
Update Local Store
      ↓
Update Last Sync
```

اگر Revision تغییر نکرده باشد، Dataset کامل دوباره دانلود نمی‌شود. مدل ترجیحی Revision/Version-based Sync است.

هیچ Transaction Replay یا Mutation Queue وجود ندارد.

اگر Session معتبر نباشد، Local Snapshot نباید Session جدید یا عملیات رسمی ایجاد کند.

## 11. Cache و Local Store

- Cache Storage برای App Shell و منابع مناسب
- IndexedDB برای داده‌های ساختاریافته و Snapshotها
- LocalStorage نباید Database اصلی Offline باشد
- Cache ≠ Authorization
- داده‌های خصوصی و مدیریتی نباید در Cache عمومی قرار گیرند

## 12. حذف و لغو دسترسی

در Offline امکان اطلاع فوری از Revocation وجود ندارد؛ Local Content فقط بر اساس آخرین وضعیت معتبر ذخیره می‌شود.

پس از Online شدن:

```text
Session / Authorization Check
→ Content Authorization Refresh
→ Remove / Update Revoked Content
```

Backend همچنان مرجع نهایی دسترسی است.

## 13. Source of Truth و تعارض

در همه تعارض‌ها:

```text
D1 / Backend State > Local State
```

Local State برای استمرار تجربه کاربری است، نه ایجاد حقیقت مستقل.

## 14. امنیت Offline

Offline نباید امکان این موارد را ایجاد کند:

- مشاهده محتوای غیرمجاز
- مشاهده داده کاربر دیگر
- مشاهده داده Staff
- تغییر Role یا Status
- اجرای عملیات رسمی
- استفاده از Snapshot برای Authorization

Role و Status هرگز از Local State پذیرفته نمی‌شوند.

## 15. محتوای جدید

پس از اتصال مجدد:

```text
Server Content
→ New Content?
→ Download Changed Content
→ Local Update
→ Available Offline
```

فقط محتوای دریافت‌شده و تأییدشده می‌تواند Offline در دسترس قرار گیرد.

## 16. وضعیت داده

در صورت نیاز و بدون پیچیده‌سازی غیرضروری، وضعیت داده می‌تواند یکی از این موارد باشد:

```text
SYNCED
STALE
UPDATING
FAILED
NOT_AVAILABLE_OFFLINE
```

## 17. دامنه MVP

### Included

- App Shell
- Articles، Library و محتوای آموزشی Published
- Course و Lesson منتشرشده
- Learning Path Snapshot
- Profile Snapshot محدود
- Progress Snapshot
- Content Sync
- Sync Status
- Offline Indicator

### Excluded

- Offline Exam
- Offline Exam Submission
- Offline Password Change
- Offline Staff/Admin/Master
- Offline Mutation Queue
- هر معماری پیچیده جدید

## 18. الزامات QA پیش از Private Pilot

### Offline

1. قطع اینترنت
2. بازکردن PWA
3. مشاهده Course، Lesson، Article و Library
4. مشاهده Profile و Progress آخرین Sync
5. نمایش Last Sync
6. تلاش برای ورود به Exam
7. تلاش برای تغییر Password
8. بررسی عدم اجرای عملیات رسمی

### Online Recovery

9. بازگشت اینترنت
10. تشخیص Backend
11. دریافت محتوای جدید
12. Update Local Store
13. دریافت Profile و Progress جدید
14. Update UI
15. ثبت Last Sync جدید

### Security

16. عدم دسترسی Offline به Unpublished
17. عدم دسترسی Offline به Unauthorized/Revoked
18. عدم پذیرش Role/Status از Local State
19. عدم دورزدن Authorization با Cache
20. عدم باقی‌ماندن Snapshot حساب قبلی پس از Logout/Account Switch

## 19. اصل اجرایی نهایی

این Policy، طراحی و پیاده‌سازی PWA، Frontend، Worker، D1، Authentication، QA و Phase 3.2 را راهبری می‌کند.

> **Learn Offline. Transact Online. Sync on Reconnect. Server Wins.**

هر پیاده‌سازی Offline خارج از این محدوده نیازمند Change Request جداگانه است.
