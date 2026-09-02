# Darolfonun — P0 Product Core Remediation Plan

**Phase:** 3.2 — Product-First Production Readiness Audit v2.0
**Decision:** `APPROVED WITH CONTROL`
**Status:** `NO CODING YET`
**Architecture:** `FROZEN`
**Product Direction:** `LEARNING-FIRST`
**Release Baseline:** `3f29338`
**Branch:** `arena/01a05d5b-darullfonon`

این سند قبل از هر تغییر Source تهیه شده است. هدف آن واقعی‌کردن حداقل Product Core با استفاده از Code، API و D1 موجود است؛ نه Refactor گسترده، Feature Expansion یا ساخت معماری جدید.

---

## 1. Fake State Inventory

### Classification Rules

- **A — P0 / Must Fix:** مستقیماً حقیقت آموزشی، Progress، Result، Lesson Status، Learning Path یا Next Step را جعل می‌کند.
- **B — P1:** برای UX ارزشمند است اما برای هسته حداقلی آموزش حیاتی نیست.
- **C — Remove:** تزئینی یا غیرضروری است و حذف آن به مسیر اصلی آسیب نمی‌زند.
- **D — Defer:** ارزشمند است اما برای Pilot ضروری نیست یا فعلاً پیچیدگی نامتناسب دارد.

| Component | Current State | Fake State | Category | Runtime Finding | Risk | Decision |
|---|---|---|---|---|---|---|
| Dashboard / Continue Card | Home مقدار ۴۸٪، Lesson ثابت و Progress Ring ثابت نشان می‌دهد | Progress و Current Lesson به‌عنوان وضعیت User واقعی | A / P0 | `src/main.jsx` مقدارهای ثابت دارد و از `getProgress`/`getCourses` استفاده نمی‌کند | کاربر مسیر و وضعیت واقعی خود را اشتباه می‌فهمد | `KEEP` با State واقعی |
| Dashboard / Faculty Cards | هشت حوزه با درصدهای ثابت یا «شروع نشده» دارد | درصد پیشرفت هر موضوع از Server نمی‌آید | A / P0 | `src/LearningViews.jsx` آرایه `topics` شامل Progress ثابت است | Learning Path جعلی می‌شود | `SIMPLIFY` به Published Course/واقعی |
| Learning Overview | `getCourses` و `getProgress` خوانده می‌شوند، اما `Math.max(34, studiedCount * 12)` استفاده می‌شود | حداقل Progress برابر ۳۴٪ حتی برای User بدون Progress | A / P0 | مقدار محاسبه‌شده با حداقل مصنوعی شروع می‌شود | نمایش Progress غیرواقعی | `KEEP` فقط با محاسبه معتبر |
| Course Progress | Course از API می‌آید، اما ۴۸٪ و «۱۲ درس از ۲۴» ثابت است | Course Progress و completed count ساختگی | A / P0 | `src/LearningViews.jsx` مقدارهای ثابت دارد | تصمیم اشتباه درباره ادامه مسیر | `KEEP` با داده موجود یا نمایش صادقانه unavailable |
| Course Chapter Status | وضعیت فصل با `index` تعیین می‌شود | Passed/Active/Locked مستقل از Progress واقعی | A / P0 | `chapterStatus` فقط بر اساس ترتیب index است | Unlock و دسترسی آموزشی نادرست | `KEEP` با مشتق‌سازی از داده معتبر |
| Chapter Lesson Status | دو Lesson اول همیشه done و Lesson سوم current است | Lesson Completion ساختگی | A / P0 | `lessonStatus` فقط بر اساس index است | کاربر تصور می‌کند درس را تمام کرده است | `KEEP` با `getProgress` |
| Lesson Completion | Save Progress به API ارسال می‌شود | مسیر UI قبل/بعد از ثبت، State واقعی را کامل منعکس نمی‌کند | A / P0 | `saveProgress` موجود است؛ وضعیت‌های بالا در صفحات دیگر ثابت‌اند | ناسازگاری بین Save و Display | `KEEP` و Refresh/derive از پاسخ معتبر |
| Quiz Result | Submit API نتیجه برمی‌گرداند؛ View در نبود Result مقدار Score و Answer ثابت دارد | Score، Passed و پاسخ درست ساختگی | A / P0 | `QuizResult` شامل fallback برای Score و `۷ از ۸` است | Result جعلی ممکن است به User نمایش داده شود | `REMOVE` fallback؛ نمایش unavailable/error |
| Progress Display | APIهای `getProgress` و `saveProgress` وجود دارند | Home/Profile/Course اعداد ثابت نشان می‌دهند | A / P0 | `src/main.jsx`، `src/LearningViews.jsx` و `src/StudentViews.jsx` مقادیر ثابت دارند | از بین رفتن اعتماد به Progress | `KEEP` با داده Server |
| Next Step | پیشنهاد «مدیریت ریسک» و Navigation ثابت است | Next Step مستقل از Current/Completed Lesson | A / P0 | پیشنهاد و مسیر در Source ثابت‌اند | هدف اصلی Learning نقض می‌شود | `KEEP` با مشتق‌سازی حداقلی |
| Profile Progress Area | آمار کلی، زمان، روزهای فعال و مسیرها ثابت‌اند | بخشی از Progress به‌عنوان User State ارائه می‌شود | A برای Progress؛ D برای بقیه | `src/StudentViews.jsx` مقادیر ۳۴٪، ۴۲ ساعت، ۲۷ روز و ۵ مدال دارد | نمایش وضعیت آموزشی نادرست | Progress واقعی؛ آمار غیرضروری `DEFER` |
| Lab Self-assessment | نتیجه ۶۸/۵۱/۷۲/۴۳ و ذخیره در Profile بدون Backend واقعی | نتیجه خودارزیابی ساختگی | D | خارج از Product Core و بدون API Persistence | Fake Product State در Feature فرعی | `DEFER` یا از Pilot خارج شود |
| Certificate Preview | Certificate و نام/تاریخ ثابت | سند واقعی وانمود می‌شود | D | خارج از Minimum Viable Learning Product | برداشت نادرست از اعتبار گواهی | `DEFER` |
| Static Faculty/Resource Copy | متن‌های معرفی و تزئینی ثابت | در صورت نمایش به‌عنوان Progress، مشکل‌زا؛ به‌عنوان Copy مشکلی ندارد | C/D | بخشی از UI و محتوای معرفی است | Scope و تست اضافه | `KEEP` فقط به‌عنوان Copy غیرحقیقتی؛ Progress آن حذف |

### Result Fallback Runtime Assessment

1. در Happy Path، `submitQuiz` نتیجه را از Worker دریافت می‌کند و `onComplete(result)` آن را به `QuizResult` می‌دهد.
2. با این حال، `QuizResult` قراردادی دارد که در صورت نبود `result` مقدار ثابت Score و تعداد پاسخ درست نمایش می‌دهد.
3. این Fallback Loading/Error کنترل‌شده نیست؛ به‌شکل Result قابل مشاهده طراحی شده است.
4. حتی اگر در اجرای عادی کمتر فعال شود، وجود آن با قانون `Fake Product State = Forbidden` سازگار نیست.
5. Classification نهایی: **A — P0 / Must Fix**؛ Fallback باید حذف و به حالت صریح unavailable/error تبدیل شود.

---

## 2. Existing API Mapping

| Product Core | Existing API | Current Use | Sufficiency | Required Direction |
|---|---|---|---|---|
| Dashboard | `getAuthMe()` → `/v1/auth/me` | در Auth Flow استفاده می‌شود | برای Identity کافی | استفاده از User معتبر؛ ساخت Profile API جدید ممنوع |
| Dashboard | `getCourses()` → `/v1/courses` | در Learning Overview استفاده می‌شود | برای Published Course List کافی | Dashboard نباید Course/Progress ثابت نمایش دهد |
| Dashboard | `getProgress()` → `GET /v1/progress` | فقط در Learning Overview خوانده می‌شود | برای Progress User فعلی کافی | استفاده برای Current/Overall State؛ بدون حداقل مصنوعی |
| Learning Path | `getCourses()` | List واقعی Courses، Faculty و Counts | برای فهرست Published کافی؛ برای Progress per Course کامل نیست | نمایش Published Course واقعی؛ Progress حوزه‌ها فقط اگر قابل مشتق‌سازی باشد |
| Learning Path | `getProgress()` | Records با `lesson_id` و `chapter_id` | برای Overall و Current Chapter کافی | عدم نمایش درصدی که Mapping معتبر ندارد |
| Course | `getCourse(slug)` → `/v1/courses/:slug` | Course، Level و Chapter خوانده می‌شود | برای ساختار Course کافی | Progress/Chapter State با Progress واقعی یا State صادقانه |
| Chapter/Lesson Status | `getChapter(id)` → `/v1/chapters/:id` | Lessons Published خوانده می‌شوند | برای مقایسه Lesson ID با Progress کافی | حذف index-based status |
| Lesson | `getLesson(slug)` → `/v1/lessons/:slug` | Content و Metadata خوانده می‌شود | برای مطالعه کافی | حفظ Published Boundary و عدم جعل Completion |
| Lesson Progress | `saveProgress()` → `POST /v1/progress` | در Lesson Completion استفاده می‌شود | برای Mutation کافی | نمایش نتیجه بر اساس Response معتبر و Refresh لازم |
| Progress Display | `getProgress()` | محدود به Learning Overview | برای Read User Progress کافی | Reuse در Course/Chapter/Profile حداقلی |
| Quiz | `getQuiz(id)` → `/v1/quizzes/:id` | Quiz و Questions واقعی | کافی برای Start | Online-only باقی بماند |
| Quiz Result | `submitQuiz(id, answers)` → `POST /v1/quizzes/:id/submit` | Result فوری واقعی برمی‌گردد | برای Immediate Result کافی | حذف fallback؛ Historical Result API فعلاً ساخته نشود |
| Next Step | ترکیب `getProgress`، `getCourse` و `getChapter` | فعلاً استفاده نمی‌شود؛ متن ثابت است | برای یک Active Course قابل مشتق‌سازی است | Pilot را به مسیر قابل محاسبه محدود کن؛ General Recommendation را Defer کن |

### API Gaps باید صریح بمانند

- Endpoint تجمیعی برای Course Progress وجود ندارد.
- Endpoint برای آخرین Quiz Attempt وجود ندارد.
- Endpoint مستقیم برای Next Step وجود ندارد.
- Endpoint برای Profile Statistics وجود ندارد.

در Remediation فعلی، این Gaps به‌صورت خودکار به New API تبدیل نمی‌شوند. برای Minimum Learning Product، از ترکیب APIهای موجود و Simplification استفاده می‌شود. ساخت Endpoint جدید فقط پس از اثبات ناتوانی مسیر موجود و ثبت Change/Decision مجاز است.

---

## 3. Existing D1 Mapping

| Product Core | Existing D1 Tables / Columns | Source of Truth | Current Assessment |
|---|---|---|---|
| Student Identity | `users.id`, `provider_subject`, `role`, `status`, Profile fields | D1 User + Clerk Identity | موجود و سمت Worker کنترل می‌شود |
| Dashboard Courses | `faculties`, `courses` با `status='Published'` | D1 Published Content | داده کافی برای Course List وجود دارد |
| Learning Path | `courses`, `levels`, `chapters`, `lessons`, `sort_order`, `status` | D1 Content Graph | ترتیب و Published Boundary وجود دارد؛ Aggregate Progress ندارد |
| Lesson Status | `progress.user_id`, `lesson_id`, `status`, `updated_at` | D1 Progress | داده کافی برای User-specific Lesson Status وجود دارد |
| Course Progress | Join منطقی Progress با Lesson/Chapter/Course | D1 Progress + Content | Schema داده لازم را دارد، اما API فعلی همه Join را در یک پاسخ نمی‌دهد |
| Quiz Definition | `quizzes`, `questions`, Published Status | D1 Content | برای Quiz واقعی کافی است |
| Quiz Result | `quiz_attempts.user_id`, `quiz_id`, `score`, `passed`, `created_at` | D1 Quiz Attempts | Result ذخیره می‌شود؛ Read Historical API وجود ندارد |
| Next Step | `progress` + `lessons.sort_order` + `chapters.sort_order` | Derived Server/Client State | Dedicated field/table ندارد؛ برای مسیر محدود قابل مشتق‌سازی است |
| Profile Statistics | هیچ جدول/فیلد کامل برای زمان، روز فعال یا مدال وجود ندارد | — | این آمار برای Remediation حذف/Defer می‌شوند |

### D1 Decision

- Migration جدید لازم نیست.
- جدول جدید لازم نیست.
- Schema فعلی Progress و Quiz Result برای Minimum Core کافی است.
- Progress باید همچنان از D1 خوانده شود؛ Local یا Frontend State منبع حقیقت نیست.
- عدم وجود Foreign Key مستقیم از `progress.user_id` به `users.id` در این Plan با Migration جدید دست‌کاری نمی‌شود؛ API Ownership فعلی و Constraintهای موجود باید در Gate جداگانه حفظ و Verify شوند.

---

## 4. Required Minimal Changes

### P0-1 — Remove Fake Product State

- حذف اعداد ثابت Progress در Dashboard، Learning، Course و Profile Progress Area.
- حذف `Math.max(34, ...)` و هر حداقل مصنوعی.
- حذف `chapterStatus` و `lessonStatus` مبتنی بر index.
- حذف Current Lesson و Recommendation ثابت در مسیر اصلی.
- حفظ فقط Copyهای تزئینی که به‌عنوان وضعیت واقعی معرفی نمی‌شوند.

### P0-2 — Reuse Existing API for Real State

- خواندن Progress معتبر از `getProgress()` در صفحات لازم.
- استفاده از `getCourses()` و `getCourse()` برای Published Learning Path.
- مقایسه Lesson ID و Chapter ID واقعی با Progress records.
- استفاده از `saveProgress()` و Response معتبر برای Update UI.
- عدم ایجاد API یا D1 Schema جدید در قدم اول.

### P0-3 — Safe Quiz Result

- Result فقط از Response موفق `submitQuiz` نمایش داده شود.
- نبود Result باید حالت صریح `Unavailable/Error` داشته باشد.
- Score، Passed، Correct و Total بدون Response معتبر نمایش داده نشوند.
- Historical Quiz Result و Profile History فعلاً خارج از Scope بماند.

### P0-4 — Minimal Next Step

Next Step برای Pilot باید از یکی از این داده‌های واقعی مشتق شود:

1. آخرین Progress معتبر User.
2. Lessonهای Published و مرتب‌شده در Chapter فعال.
3. Current Lesson و اولین Lesson بعدی.
4. Passed/Studied بودن Lesson یا Chapter.

اگر APIهای موجود برای محاسبه General Next Step کافی نباشند، رفتار Pilot باید به یک Active Course/Path قابل محاسبه Simplify شود؛ نه اینکه متن ثابت یا API جدید بدون بررسی ساخته شود.

### P0-5 — Honest Empty/Error States

اگر Progress، Course Mapping یا Result قابل دریافت نیست:

- مقدار ساختگی نمایش داده نشود.
- UI پیام قابل فهم و مسیر Retry/Continue داشته باشد.
- وضعیت `Unavailable` با Progress صفر اشتباه نشود.

---

## 5. Remove / Simplify / Defer Decisions

| Item | Decision | دلیل |
|---|---|---|
| Hardcoded Progress/Result/Next Step | `REMOVE` | مستقیماً حقیقت آموزشی را جعل می‌کند |
| Index-based Chapter/Lesson Status | `REMOVE` | با Progress واقعی سازگار نیست |
| هشت Topic با درصد ثابت | `SIMPLIFY` | Published Course List و Active Path ارزش کافی دارند؛ درصد جعلی ممنوع |
| General Course Progress Aggregation | `DEFER` یا فقط برای Active Course | API تجمیعی موجود نیست و New API فعلاً مجاز نیست |
| Historical Quiz Result API | `DEFER` | Immediate Result برای Minimum Core کافی است |
| Profile Time/Active Days/Medals | `DEFER` | D1 Source و API معتبر موجود نیست؛ خارج از Remediation هدف |
| Lab Self-assessment | `DEFER` / خارج از Pilot | ارزش مستقیم برای مسیر اصلی ندارد و Result فعلی Fake است |
| Certificate Preview | `DEFER` | Minimum Learning Product نیست و نتیجه نمایشی تولید می‌کند |
| Offline Personal Snapshot | `DEFER تا پس از Product Core/P0` | Policy آن را P1 می‌داند؛ Remediation فعلی نیست |
| New Progress/Next-Step API | `DEFER` | ابتدا Existing API و Client Derivation بررسی شود |
| New Database/Store/Dependency | `REMOVE` | هیچ ضرورت اثبات‌شده‌ای ندارد |

### Feature Elimination Rule

هر راه‌حل پیشنهادی که نیازمند Store جدید، Abstraction گسترده، API جدید یا Migration باشد، تا زمانی که ناتوانی Code/API/D1 موجود مستند نشود، رد یا Deferred است.

---

## 6. Complexity Estimate

| Measure | Expected Remediation Budget |
|---|---:|
| Files Changed | 2 تا 3 فایل موجود |
| Lines Changed | کوچک تا متوسط؛ هدف کمتر از ۱۵۰ خط تغییر خالص |
| New Dependencies | 0 |
| New API Endpoints | 0 در قدم اول |
| New DB Tables | 0 |
| New Migrations | 0 |
| New Architecture Components | 0 |
| Backend Rewrite | 0 |
| Framework/State Management Rewrite | 0 |
| Estimated Risk | Medium؛ به‌دلیل mapping Progress و جلوگیری از Regression |
| Estimated Delivery | یک Remediation محدود، نه پروژه مستقل |

این Estimate تقریبی است و قبل از Coding باید با Diff واقعی بازبینی شود. اگر به‌دلیل کمبود API، تغییر از این Budget عبور کند، Stop Condition فعال می‌شود.

---

## 7. Files Expected to Change

### مجاز و محتمل

1. `src/main.jsx`
   - Dashboard و Continue Card
   - حذف Progress و Current Lesson ثابت
   - استفاده از State واقعی یا نمایش صادقانه unavailable

2. `src/LearningViews.jsx`
   - Learning Overview
   - Course Progress و Chapter Status
   - Lesson Status
   - Quiz Result fallback
   - Next Step محدود و مشتق‌شده

3. `src/StudentViews.jsx`
   - فقط برای حذف Progress جعلی از Profile یا جلوگیری از نمایش آن به‌عنوان User State
   - آمار غیرضروری Profile در این Remediation بازطراحی نمی‌شود

### فعلاً نباید تغییر کنند

- `worker/src/index.ts`
- `worker/migrations/*`
- `src/api.js`، مگر اینکه در حین پیاده‌سازی نقص واقعی در Contract موجود ثابت شود
- `public/sw.js`
- Clerk/Authentication Provider
- Wrangler/Cloudflare Configuration

## Files Changed Before Coding

```text
Files Changed: 0
Lines Changed: 0
New Dependencies: 0
New API Endpoints: 0
New DB Tables: 0
New Migrations: 0
New Architecture Components: 0
```

---

## 8. Risk Register

| Risk | Level | Mitigation |
|---|---|---|
| Progress records برای Course عمومی قابل Aggregate مستقیم نیستند | Medium | Pilot را به Active Course قابل محاسبه محدود کن؛ درصد جعلی نمایش نده |
| حذف fallback باعث دیده‌شدن Empty/Error می‌شود | Low/Medium | Empty/Error UX صریح و قابل فهم؛ Fake State از Empty بدتر است |
| تغییر وضعیت فصل‌ها ممکن است Unlock قبلی را تغییر دهد | Medium | ابتدا فقط Stateهای قابل اثبات را نمایش بده؛ Rule روشن برای Sequence ثبت شود |
| API `getProgress` فقط Student/Teacher را می‌پذیرد | Low برای Student Pilot | Product Core فقط با Student فعال تست شود؛ Matrix واقعی حفظ شود |
| Quiz Result بعد از Refresh قابل بازیابی نیست | Medium | Immediate Result را واقعی نمایش بده؛ Historical Result را Defer کن |
| Next Step عمومی نیازمند Graph کامل‌تر است | Medium | Current Active Path را محدود و واقعی نگه دار؛ New API فعلاً نساز |
| Profile دارای Static Statistics باقی می‌ماند | Low/Medium | آن بخش‌ها به‌عنوان خارج از Remediation/P2 ثبت و در Pilot به‌عنوان حقیقت نمایش داده نشوند |
| حذف UI فرعی باعث تغییر ظاهری می‌شود | Low | Product Core و Learning Journey مقدم است؛ UI polish تابع آن است |
| External Production Gates همچنان بسته‌اند | High | Remediation محلی به‌عنوان Production PASS گزارش نشود |

### Stop Conditions

Coding باید متوقف شود اگر:

- New API برای Product Core ضروری تشخیص داده شود.
- New Database، Migration یا Storage Architecture لازم شود.
- محاسبه Next Step به Backend Redesign نیاز داشته باشد.
- اصلاح به State Management یا Frontend Rewrite تبدیل شود.
- حذف Fake State باعث شکستن Product Core و نیاز به Feature جدید شود.

در این شرایط ابتدا گزارش Delta و `ARCHITECTURE CHANGE REQUEST` در صورت لزوم ارائه شود.

---

## 9. Before / After Measurement Plan

### Before Measurement — ثبت‌شده از Source Audit

| Measure | Current Observation |
|---|---|
| Dashboard Continue Progress | ثابت روی ۴۸٪ |
| Dashboard Current Lesson | متن ثابت «فصل ۶ · درس ۳» |
| Topic Progress | هشت مقدار ثابت؛ شامل ۳۰٪، ۱۵٪، ۲۰٪، ۷۲٪ و غیره |
| Learning Overall Progress | دارای حداقل مصنوعی ۳۴٪ |
| Course Progress | ثابت روی ۴۸٪ و ۱۲ از ۲۴ |
| Chapter Status | تابع index، نه Progress |
| Lesson Status | دو مورد done و یک مورد current بر اساس index |
| Quiz Result fallback | Score ثابت ۸۲ و پاسخ درست ثابت ۷ از ۸ |
| Profile Progress | ثابت روی ۳۴٪ و مسیرهای ثابت |
| Next Step | Recommendation و Navigation ثابت |
| Files Changed Before Coding | 0 |
| Dependencies/API/Tables/Migrations/Components | 0 |

### After Measurement — Acceptance Criteria

پس از Remediation، بدون اعلام Production PASS، این موارد باید اندازه‌گیری شوند:

1. هیچ Progress عددی در Product Core بدون منبع API/D1 معتبر نمایش داده نشود.
2. هیچ Score، Passed، Correct یا Total بدون Result معتبر نمایش داده نشود.
3. Chapter/Lesson Status از Progress واقعی یا State صریح `Unavailable/Available` بیاید، نه index ثابت.
4. پس از `saveProgress`، UI با Response معتبر یا Refresh از `getProgress` به‌روز شود.
5. تغییر Progress باید Current Lesson و Next Step را تغییر دهد، یا UI صریحاً اعلام کند که Mapping برای آن مسیر در دسترس نیست.
6. User بدون Progress نباید Progress ساختگی مانند ۳۴٪ دریافت کند.
7. مسیر Published Course/Lesson بدون جعل status قابل استفاده باشد.
8. Error/Empty/Loading به‌عنوان وضعیت واقعی از Progress صفر متمایز باشند.
9. Quiz Result در صورت نبود Response، هیچ نتیجه عددی ساختگی نشان ندهد.
10. Build، Worker Typecheck، `git diff --check` و Local Core Smoke پس از تغییر موفق باشند.
11. Complexity Budget از مقدار ثبت‌شده عبور نکند؛ در غیر این صورت Stop Condition فعال شود.

### Evidence Required After Approval

- Source Diff محدود
- Browser/Local Network Trace برای APIهای موجود
- Response واقعی Progress و Quiz Result
- قبل/بعد Screenshot یا Browser Evidence برای Product Core
- Build/Typecheck Result
- Test Account و داده Demo از Production جدا

---

## 10. Final Implementation Scope

### In Scope — P0

- Dashboard واقعی یا صادقانه unavailable
- Learning Path بر اساس Published Course و داده قابل اثبات
- Course Progress بدون مقدار ثابت
- Chapter/Lesson Status بر اساس Progress موجود
- Quiz Result بدون Fallback ساختگی
- Progress Display از API/D1
- Next Step حداقلی و مشتق‌شده از داده موجود
- Error/Empty/Loading صادقانه در مسیر اصلی

### Out of Scope

- Offline Personal Snapshot
- Revision Sync
- Production Unlock
- Clerk/Staff/MFA Expansion
- WAF/Advanced Monitoring
- Historical Quiz Result
- Certificate
- Self-assessment Persistence
- General Analytics
- New Endpoint/Data Model
- Framework/State Management Rewrite

### Final Plan Decision

```text
Remediation Plan: APPROVED WITH CONTROL
Coding: NOT AUTHORIZED YET — awaits Plan review/approval
P0 Product Core: CONFIRMED
Architecture Change Request: NONE
New API: NONE IN FIRST PASS
New D1/Migration: NONE
```

---

## Phase 4 Decision

Phase 4 زمانی قابل شروع است که این شروط هم‌زمان برقرار باشند:

1. Product Core هیچ `FAIL` باز نداشته باشد.
2. Dashboard، Learning Path، Course، Lesson، Quiz Result، Progress و Next Step واقعی باشند.
3. Authentication و Authorization واقعی Verify شده باشند.
4. Remote D1، Ownership و Data Integrity با Backup معتبر PASS شوند.
5. مسیر واقعی Pages → `/api/*` → Worker → D1 PASS شود.
6. Private Pilot با Browser/Mobile Evidence معتبر اجرا شود.
7. Backup و Restore Verification PASS باشد.
8. هیچ P0 امنیتی، داده‌ای یا Product Core باز نماند.
9. Final Regression موفق باشد.
10. تصمیم Go برای Private Pilot صادر و Pilot محدود مشاهده و ارزیابی شود.

بنابراین پاسخ زمانی:

```text
Phase 4: بعد از Private Pilot موفق و بسته‌شدن P0/P1های ضروری
Current Status: BLOCKED
Calendar Date: قابل تعیین نیست؛ به Evidence و دسترسی Environment وابسته است
```

Phase 4 نباید صرفاً به‌دلیل آماده‌شدن UI یا موفقیت Local شروع شود.
