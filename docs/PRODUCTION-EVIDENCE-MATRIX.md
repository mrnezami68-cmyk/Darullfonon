# Darolfonun — Product-First Production Evidence Matrix

**Phase:** 3.2 — Product-First Production Readiness Audit v2.0
**Policy:** Offline Learning & Online Transaction Policy v1.0
**Status:** Initial audit — no production PASS claimed  
**Release Baseline:** `3f29338`  
**Latest verification implementation:** `cf1cd16`

این Matrix بین Evidence محلی Phase 3.1 و Evidence لازم برای Private Pilot تفاوت می‌گذارد. Local PASS هرگز به‌عنوان Production PASS استفاده نشده است.

## Product Core Evidence

این بخش از Source Inspection و Evidence محلی Phase 3.1 استفاده می‌کند و برای جلوگیری از Fake Product State اضافه شده است.

| Product Core Step | Requirement | Test | Expected Result | Actual Result / Evidence | Status | Risk |
|---|---|---|---|---|---|---|
| Dashboard | وضعیت فعلی و قدم بعدی واقعی باشد | Source inspection | بدون مقدار ثابت برای User واقعی | `src/main.jsx`: Home مقدار ثابت Progress و مسیر ادامه دارد | `FAIL` | تصمیم‌گیری کاربر بر اساس State نادرست |
| Learning Path | مسیر و درصدها از داده واقعی بیاید | Source inspection | Status و Progress از API/D1 | `src/LearningViews.jsx`: Topics و درصدهای مسیر ثابت هستند | `FAIL` | Unlock یا وضعیت اشتباه |
| Course | Progress و Chapter Status واقعی باشد | Source inspection | فصل‌ها از Progress واقعی | `src/LearningViews.jsx`: Course API خوانده می‌شود اما Progress/Chapter Status ثابت است | `FAIL` | مسیر یادگیری گمراه‌کننده |
| Published Lesson | محتوای Published واقعی مطالعه شود | Local/API/Browser | فقط محتوای مجاز | Local boundary موفق؛ Browser/Production route اثبات نشده | `NOT VERIFIED` | نشت یا شکست مسیر |
| Quiz | Submit آنلاین به Server برسد | Local/API/Browser | Result معتبر از Backend | `src/api.js` مسیر Submit دارد؛ Local path موجود؛ Browser/Production اثبات نشده | `NOT VERIFIED` | نتیجه نامعتبر |
| Result | Score و Passed واقعی باشد | Source inspection | بدون Fallback ساختگی | `src/LearningViews.jsx`: Result View fallback ثابت Score/Answer دارد | `FAIL` | نمایش نتیجه ساختگی |
| Progress | Save و Display هر دو واقعی باشند | API + Source inspection | UI از D1 مقدار بگیرد | `src/api.js`، `src/LearningViews.jsx` و `src/StudentViews.jsx`: API موجود است، Home/Profile/Course مقادیر ثابت دارند | `FAIL` | اعتماد به Progress از بین می‌رود |
| Next Step | از وضعیت واقعی حاصل شود | Source inspection | Next Step Dynamic | `src/main.jsx` و `src/LearningViews.jsx`: پیشنهاد و Navigation ثابت است | `FAIL` | نقض هدف اصلی محصول |

## Gate Matrix

| Gate | Requirement | Environment | Test | Expected Result | Actual Result / Evidence | Status | Risk |
|---|---|---|---|---|---|---|---|
| 1 — Environment | Inventory، Owner، Domain، Resource و Secret boundary واقعی | Staging/Production | Review resource inventory | همه Resourceها نام، Owner و Purpose داشته باشند | فقط Local شناخته شده؛ Staging/Production نامشخص | `BLOCKED` | بدون مالک و Environment، مسئولیت Release مشخص نیست |
| 2 — Real Clerk | OAuth، Verification، Session و JWT؛ Invite/MFA فقط اگر Staff در Pilot است | Clerk Staging | Browser and Dashboard verification | جریان واقعی Clerk مطابق Pilot کامل اجرا شود | Instance و Test Account واقعی موجود نیست | `BLOCKED` | Authentication اثبات‌نشده؛ Staff Gate مشروط به Scope Pilot است |
| 3 — JWT Time | `iat ≤ now + skew`، `nbf ≤ now + skew`، `exp > now` و `iat < exp` | Real Clerk + Worker | Token claim matrix | همه روابط زمانی صحیح enforce شوند | Local valid/future-iat fixture موفق؛ Provider lifetime واقعی نامشخص | `NOT VERIFIED` | Lifetime و clock-skew عملیاتی ممکن است متفاوت باشد |
| 4 — Remote D1 | Backup، Verify، Migration، Schema، Constraint، Integrity | Staging/Production D1 | Controlled migration rehearsal | Schema و داده سالم و قابل بازیابی باشند | Remote `database_id` و Cloudflare access موجود نیست | `BLOCKED` | ریسک داده و Migration بدون rollback |
| 5 — API Routing | Browser → Pages → `/api/*` → Worker → D1 | Staging/Production | Browser Network Trace | مسیر واقعی همه Requestها موفق باشد | Frontend relative `/api` است؛ route واقعی اثبات نشده | `NOT VERIFIED` | API ممکن است در Pages به 404 یا Origin اشتباه برسد |
| 6 — CORS | Origin، Methods، Headers، Authorization و OPTIONS | Real Pages/Worker | Allowed and evil Origin tests | Origin مجاز کار کند و Origin غیرمجاز رد شود | Local evil Origin و `no-store` موفق؛ Origin واقعی نامعلوم | `NOT VERIFIED` | شکست OAuth/API یا بازشدن سطح دسترسی |
| 7 — Authorization | Role/Status/Ownership و عدم اعتماد به Client | Staging | Positive/negative role matrix | فقط Policy سمت Worker مجوز بدهد | Local code path و Demo-header rejection موفق؛ E2E واقعی موجود نیست | `NOT VERIFIED` | احتمال خطای Route/Deployment یا داده Role |
| 8 — Student Journey | Login تا Next Step با داده واقعی | Staging/Production | Full Browser journey | هیچ مرحله Mock و Progress واقعی باشد | Browser/Provider واقعی در دسترس نیست؛ Source audit نیز Stateهای ثابت را نشان می‌دهد | `NOT VERIFIED` | شکست هدف اصلی محصول یا نمایش State ساختگی |
| 9 — Teacher Journey | Request، Pending، Review، Approve/Reject و Resubmit | Staging | Two-role Browser journey | Client Role/Status را تغییر ندهد | Local route behavior موجود؛ Staff E2E واقعی اجرا نشده | `NOT VERIFIED` | Activation ناخواسته یا Audit نادرست |
| 10 — Staff Security | Invite-only، MFA، Login، Suspend، Logout و Revocation | Clerk + Worker Staging | Staff Browser matrix | Staff بدون Invite/MFA وارد نشود | Clerk واقعی و Staff test accounts موجود نیست؛ فقط اگر Staff در Pilot باشد Gate لازم است | `NOT VERIFIED` | در Pilot دارای Staff، P0 هویتی؛ در Pilot بدون Staff، Post-Pilot |
| 11 — Mobile/PWA | Login، Navigation، Course، Lesson، Quiz، Progress، Logout | Android/Mobile Chrome/Installed PWA | Device E2E | مسیر اصلی روی Device واقعی پایدار باشد | Browser و Android environment موجود نیست | `BLOCKED` | شکست تجربه اصلی Mobile |
| 12 — Offline Policy | Published content، Learning Path، Profile/Progress snapshot و status | Mobile PWA | Offline/online recovery matrix | Read-only آخرین وضعیت دیده و بعداً Sync شود | Service Worker عمومی Local بررسی شده؛ Snapshot/Sync/Browser evidence موجود نیست | `NOT VERIFIED` | تفاوت بین Policy Approved و Implementation فعلی |
| 13 — WAF/Edge | Abuse control برای Auth، Onboarding، Quiz، Progress و Staff | Cloudflare Zone | Rule review and rate test | Burst و Request مشکوک کنترل شود بدون اختلال عادی | Zone و Rule access موجود نیست | `BLOCKED` | حمله Burst پیش از D1 محدود نمی‌شود |
| 14 — Monitoring | 401/403/429/5xx، Worker/D1/OAuth/Onboarding/Quiz/Progress errors | Cloudflare | Alert/log review | Error قابل تشخیص، بدون Secret/PII غیرضروری | Health محلی وجود دارد؛ Alert و retention واقعی موجود نیست | `BLOCKED` | Incident بدون تشخیص یا پاسخ می‌ماند |
| 15 — Backup/Recovery | Backup location، retention، owner، restore و rollback | Staging/Production D1 | Restore verification | Backup واقعاً قابل Restore باشد | Backup و Restore evidence ارائه نشده | `BLOCKED` | Missing recovery capability؛ No-Go |
| 16 — Concurrency | Approval، Identifier، Progress و Quiz race | Staging/Worker/D1 | Concurrent requests | Duplicate، ownership یا audit ناسازگار ایجاد نشود | Evidence معتبر هم‌زمانی وجود ندارد | `NOT VERIFIED` | Race در داده یا Approval |
| 17 — Content Integrity | Published ancestor، Lesson/Quiz access و Offline boundary | Staging/Production/PWA | Published/Draft/Deleted matrix | Unpublished/Unauthorized/Deleted offline نشود | Local draft-ancestor boundary موفق؛ Remote/PWA evidence نیست | `NOT VERIFIED` | نشت محتوای Draft یا Revoked |
| 18 — Product Integrity | Dashboard، Progress، Next Step و Last Sync واقعی | Source + Browser/Mobile | Product critical journey review | Fake Product State نمایش داده نشود | Source audit در `src/main.jsx`، `src/LearningViews.jsx` و `src/StudentViews.jsx` چند State ثابت را نشان می‌دهد؛ E2E نیز نداریم | `FAIL` | کاهش اعتماد کاربر به مسیر یادگیری و P0 Product Core |
| 19 — AI Governance | AI بدون Human Approval Release/Secret/Migration را تأیید نکند | Audit process | Review actions and evidence | AI فقط Assist کند؛ Gate با Evidence تصمیم‌گیری شود | هیچ Production action یا Evidence جعلی انجام نشده | `PASS` | Human sign-off نهایی همچنان لازم است |
| 20 — Final Regression | مسیرهای Student، Staff، Offline و Recovery | Staging/Production/Mobile | Full regression | تمام P0/P1 با Artifact معتبر PASS شوند | وابستگی‌های محیطی فراهم نیست | `BLOCKED` | Release بدون اثبات کامل |

## Offline Policy Evidence Sub-Matrix

| Contract | Requirement | Current Evidence | Status |
|---|---|---|---|
| Data Classification | Published content، Learning Path، محدود Profile و آخرین Progress مجاز؛ Token/Secret/Admin/Mutation ممنوع | Public content allow-list محلی وجود دارد؛ Profile/Progress Snapshot اثبات نشده | `NOT VERIFIED` |
| State Model | Online، Offline، Syncing، Sync Failed در حد نیاز UX | Offline fallback برای Public Content وجود دارد؛ چهار وضعیت رسمی E2E نشده | `NOT VERIFIED` |
| Snapshot Ownership | Logout، Account Switch و Revocation نباید Snapshot حساب قبلی را افشا کند | Token در LocalStorage نیست؛ cleanup خصوصی Browser اثبات نشده | `NOT VERIFIED` |
| Source of Truth | Server authoritative؛ Local فقط Last Known Read-only State | Policy ثبت شده؛ تست Reconnect/Conflict انجام نشده | `NOT VERIFIED` |
| Sync Contract | Backend Reachability، Session Check، Revision، Download Changed، Profile/Progress Refresh | Revision-based sync و Last Sync implementation/evidence موجود نیست | `NOT VERIFIED` |
| Transactions | Exam، Progress Mutation، Staff/Admin/Teacher و Password Online-only | Local design boundary با این اصل هم‌خوان است؛ Browser E2E هنوز لازم است | `PASS` |
| Security | Cache ≠ Authorization؛ Unpublished/Unauthorized/Revoked offline نشود | Backend Published boundary محلی موفق؛ revocation cleanup واقعی اثبات نشده | `NOT VERIFIED` |
| UX | پیام آخرین Sync و وضعیت Sync Failed قابل فهم باشد | Evidence دیداری/Browser وجود ندارد | `NOT VERIFIED` |

## Existing Phase 3.1 Evidence Reused

این موارد دوباره به‌عنوان Production PASS گزارش نمی‌شوند:

- Local Build و Worker Typecheck
- Dependency Audit
- Local JWT Signature و Future-IAT Rejection
- Student Onboarding، Logout و Revocation
- Local Role/Status Authorization و Ownership
- Published Content Boundary
- Local D1 Integrity و Audit Ordering
- Production Preflight Logic

## Decision

```text
Production Evidence: INCOMPLETE
Private Pilot: NO-GO
No production PASS is claimed without the Environment/Browser/Cloudflare evidence listed above.
```
