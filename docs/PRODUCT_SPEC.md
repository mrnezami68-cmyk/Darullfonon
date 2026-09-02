# PRODUCT SPEC — دارالفنون

**نسخه:** 0.1  
**فاز:** Phase 0 — Discovery  
**وضعیت تاریخی سند پایه:** Discovery baseline؛ برای وضعیت فعلی و تصمیم‌های Phase 3 به Addendum انتهای سند مراجعه شود.
**Complexity Target:** L1 — Simple

---

## Current Phase 3 Addendum — ۲ سپتامبر ۲۰۲۶

- هویت و Session محصول در Phase 3 با Clerk OAuth/OIDC پیاده‌سازی شده است.
- Student پس از `email_verified=true` با وضعیت `active` ساخته می‌شود.
- Teacher ابتدا `pending` است و فقط Admin می‌تواند آن را فعال یا رد کند.
- Master و Admin مسیر عمومی ندارند و از Invite/Provisioning کنترل‌شده استفاده می‌کنند.
- Offline فقط برای Published Public Content است؛ Offline Auth، Progress Queue، Quiz Submit و Staff/Admin Mutation وجود ندارد.
- این Addendum تصمیم‌های Auth را به‌روزرسانی می‌کند؛ Scope محصول و محدودیت‌های MVP سند پایه همچنان مرجع UX هستند.

---

## 1. خلاصه محصول

دارالفنون یک Web Application فارسی و RTL برای یادگیری مرحله‌ای اقتصاد، بازارهای مالی و رفتار مالی است. محصول ترکیبی از مدرسه مدرن، کتابخانه ایرانی و ابزار شناخت مسیر یادگیری است.

محصول دو فضای Demo دارد:

- Student: یادگیری، مطالعه، آزمون و پیشرفت
- Master: مدیریت محتوای آموزشی

در نسخه فعلی، ورود با Authentication واقعی انجام نمی‌شود و نقش کاربر به‌صورت Demo Role انتخاب می‌شود.

---

## 2. هدف اصلی

کمک به کاربر برای ساختن یک مسیر آموزشی روشن و قابل ادامه، بدون سردرگمی در انتخاب موضوع، درس یا قدم بعدی.

کاربر باید در هر لحظه بداند:

- کجای مسیر است.
- چه چیزی را تکمیل کرده است.
- چه چیزی در دسترس نیست و چرا.
- قدم بعدی چیست.

---

## 3. کاربران هدف

### Student

کاربری که می‌خواهد:

- اقتصاد و بازارهای مالی را اصولی یاد بگیرد.
- از یک درس به درس بعدی مسیر مشخصی داشته باشد.
- دانش خود را با Quiz بسنجد.
- پیشرفت، مدال و گواهی خود را ببیند.
- در صورت نیاز یک مفهوم یا منبع را خارج از Course پیدا کند.

### Master

کاربری که می‌خواهد بدون کدنویسی:

- Course، Chapter و Lesson ایجاد و ویرایش کند.
- Quiz و سؤال مدیریت کند.
- Glossary و Library را توسعه دهد.
- روابط میان محتوا را ثبت کند.
- وضعیت انتشار محتوا را کنترل کند.

---

## 4. مشکل اصلی

محتوای آموزشی اقتصاد و بازارهای مالی معمولاً پراکنده، فنی و فاقد مسیر پیشرفت قابل فهم است. کاربر در بسیاری از محصولات نمی‌داند از کجا شروع کند، چه زمانی آماده مرحله بعد است و چگونه یادگیری خود را ادامه دهد.

دارالفنون این مشکل را با آموزش سلسله‌مراتبی، Next Step روشن، Reading Mode و Progress قابل فهم حل می‌کند.

---

## 5. مهم‌ترین قابلیت MVP فعلی

### Vertical Slice آموزشی Student

مسیر اصلی قابل تست:

```text
Demo Role: Student
  ↓
Home
  ↓
Learning
  ↓
Course
  ↓
Chapter
  ↓
Lesson
  ↓
Quiz Introduction
  ↓
Quiz Flow
  ↓
Quiz Result
  ↓
Unlock فصل بعد
```

این مسیر مهم‌ترین خروجی فاز فعلی است و قبل از قابلیت‌های فرعی باید کامل، روان و قابل اعتماد باشد.

---

## 6. Scope فاز Vertical Slice

### داخل Scope

- انتخاب یا ورود Demo Role
- Home کاربر Student
- Continue Learning
- صفحه Learning و موضوعات
- Course detail
- ساختار Chapterها
- Lesson با Reading Mode
- وضعیت‌های Locked، In Progress، Studied و Passed
- Quiz آموزشی
- انتخاب پاسخ و حرکت بین سؤال‌ها
- نتیجه قبولی و عدم قبولی
- پیام Unlock فصل بعد
- Themeهای Light، Dark و Reading
- Responsive Mobile First
- داده نمایشی فارسی
- حالت‌های Normal، Empty، Error و Success برای مسیرهای ضروری

### خارج از Scope فاز فعلی

- Authentication واقعی
- Offline Mode
- Backend واقعی
- Cloudflare Worker و D1
- CRUD متصل به سرور
- صدور واقعی PDF یا Image برای Certificate
- جست‌وجوی سراسری کامل
- Analytics پیشرفته
- Drag & Drop ساختار آموزشی
- Permissionهای پیچیده
- پرداخت، اشتراک و قابلیت‌های اجتماعی

این موارد حذف نشده‌اند و در Backlog / فازهای بعد قرار می‌گیرند.

---

## 7. Role و Authentication در Snapshot تاریخی Discovery

> این بخش تاریخی است و تصمیم فعلی در Current Phase 3 Addendum ثبت شده است.

در MVP پایه:

- Authentication واقعی وجود ندارد.
- کاربر در حالت Demo Role قرار دارد.
- Student و Master باید مسیرهای جداگانه و واضح داشته باشند.
- این حالت فقط برای Prototype و تست محصول است و نباید به‌عنوان امنیت واقعی تلقی شود.

Authentication واقعی در Phase 1 به‌عنوان یک تصمیم معماری جدا بررسی می‌شود.

---

## 8. Platform و PWA

- Platform: Web Application
- PWA: بله
- Offline: فعلاً خیر
- هدف PWA فعلی: نصب‌پذیری و تجربه مناسب موبایل
- محتوای آفلاین و Service Worker پیشرفته در Scope فعلی نیست.

---

## 9. اصول تجربه کاربری

- مسیرها باید روان، کوتاه و قابل پیش‌بینی باشند.
- هر صفحه باید یک CTA اصلی و یک Next Step مشخص داشته باشد.
- Loading و تغییر وضعیت باید برای کاربر قابل فهم باشد.
- هیچ خطای فنی مستقیماً به Student نمایش داده نشود.
- رنگ‌های نئون ممنوع هستند.
- رنگ‌های اصلی باید آرام، رسمی و با حس سلطنتی باشند.
- تزئینات ایرانی در جزئیات استفاده شوند، نه به‌عنوان مانع مطالعه.
- Lesson باید کم‌مزاحمت‌ترین فضای محصول باشد.
- اطلاعات مهم نباید فقط با رنگ منتقل شوند.
- کاربر نباید برای ادامه مسیر دوباره Course را جست‌وجو کند.

---

## 10. الزامات بصری

- RTL کامل
- فارسی به‌عنوان زبان اصلی رابط
- Light Theme
- Dark Theme
- Reading Mode مستقل
- Mobile First
- کنتراست مناسب و Focus State
- Typography خوانا برای متن طولانی
- رنگ‌های لاجوردی، فیروزه‌ای، طلایی و خنثی‌های گرم
- بدون Neon، Gradientهای تند یا افکت‌های پرزرق‌وبرق

---

## 11. معیار موفقیت Vertical Slice

فاز فعلی زمانی موفق است که:

1. کاربر بتواند بدون سردرگمی از Home وارد Learning شود.
2. کاربر بتواند یک Course را باز کند.
3. وضعیت فصل‌ها و درس‌ها را بفهمد.
4. بتواند Lesson را در حالت عادی و Reading Mode بخواند.
5. Quiz بدون بن‌بست و با کنترل واضح اجرا شود.
6. تا زمانی که پاسخ انتخاب نشده، ادامه آزمون رفتار مناسبی داشته باشد.
7. نتیجه قبولی و پیام Unlock به‌صورت واضح نمایش داده شود.
8. مسیر برگشت و Breadcrumb در صفحات عمیق وجود داشته باشد.
9. Layout در Mobile و Desktop قابل استفاده باشد.
10. Themeها بدون از دست رفتن وضعیت اصلی کاربر تغییر کنند.
11. Build و Smoke Test موفق باشند.
12. تجربه کاربر آرام، سریع، قابل فهم و خوشایند باشد.

---

## 12. وضعیت‌های ضروری

### Student

- Normal
- Loading
- Empty
- Error
- Success
- Locked
- In Progress
- Passed
- Reading Mode
- Dark Mode
- Light Mode

### Demo Role

- Student selected
- Master selected
- Invalid / unavailable role

---

## 13. محدودیت‌های فنی فعلی

- پروژه موجود React/Vite است و بدون دلیل نباید Framework آن تغییر کند.
- تغییرات باید Minimal و قابل بازگشت باشند.
- وابستگی جدید فقط در صورت Requirement واقعی اضافه شود.
- داده‌های فاز فعلی می‌توانند محلی و نمایشی باشند.
- Backend و D1 هنوز برای این فاز تأیید نهایی نشده‌اند.

---

## 14. تصمیم‌های باز برای Phase 1

این موارد به دلیل اثر مستقیم روی معماری، در Phase 1 جداگانه تأیید می‌شوند:

1. آیا Backend واقعی در MVP نهایی الزامی است؟
2. آیا Cloudflare Worker و D1 از همین MVP فعال شوند؟
3. روش Authentication بعد از Demo Role چیست؟
4. آیا Master CRUD باید از ابتدا به D1 متصل باشد یا بعد از تکمیل Vertical Slice؟
5. دامنه یا URL انتشار چیست؟

تا زمان تعیین این موارد، معماری را از L1 بالاتر نمی‌بریم و سرویس جدیدی اضافه نمی‌کنیم.

---

## 15. خروجی Phase 0

```text
PRODUCT SPEC ✓
Primary User ✓
Core Problem ✓
Primary Feature ✓
Scope ✓
Out of Scope ✓
Platform ✓
PWA ✓
Offline Requirement ✓
Design Direction ✓
Open Architecture Decisions ✓
```

**Phase 0 — Discovery: PASS WITH WARNINGS**

هشدارها مربوط به Backend، D1، Authentication و Deployment هستند و مانع اجرای طراحی و تست Vertical Slice نمی‌شوند، اما پیش از اتصال داده واقعی باید تعیین تکلیف شوند.
