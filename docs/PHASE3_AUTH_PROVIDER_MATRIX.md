# Phase 3 Auth Provider Matrix — Clerk vs Supabase

**تاریخ بررسی:** ۲ سپتامبر ۲۰۲۶
**وضعیت:** Clerk SELECTED — Implementation انجام شد؛ Environment Verification باقی است
**Scope تصمیم‌شده:** Student OAuth/OIDC، Identity System مشترک برای Staff، Roleهای جدا، Staff Invite-only + MFA اجباری
**هدف Complexity:** L1 — Simple

این Matrix جایگزین POC واقعی نیست. اطلاعات قابلیت‌ها از مستندات رسمی بررسی‌شده آمده، اما سازگاری نهایی با Cloudflare Worker، D1، PWA Offline و Originهای واقعی باید در POC همین Repository تست شود.

---

## 1. تصمیم‌های ثابت برای هر دو گزینه

هر Providerی انتخاب شود:

- Provider Subject هویت خارجی است؛ `users.id` داخلی مستقل می‌ماند.
- Authorization از D1 App User و Backend Policy می‌آید، نه از `@sd`/`@mt` یا Frontend.
- Roleهای `student`، `teacher`، `master` و `admin` در D1 Policy می‌شوند.
- Student با OAuth/OIDC وارد می‌شود.
- Staff از مسیر عمومی Account نسازد؛ Invite-only و MFA اجباری است.
- Token در `localStorage` ذخیره نمی‌شود.
- Session باید Cookie امن یا مکانیزم رسمی معادل داشته باشد.
- Offline فقط برای محتوای از قبل مجاز/Cache‌شده است؛ Offline Authorization وجود ندارد.
- Progress Sync پس از Online و با Session معتبر انجام می‌شود.

---

## 2. Matrix

| معیار | Clerk | Supabase Auth |
|---|---|---|
| OAuth/OIDC برای Student | Social/OAuth Connections و Hosted/SDK Flow | OAuth/OIDC و Authorization Code + PKCE |
| Session | Session Token/JWT؛ Cookie integration باید با Worker/Origin تست شود | Access/Refresh Token؛ Cookie/PKCE SSR pattern باید با Worker پیاده شود |
| اعتبارسنجی در Worker | مستندات Manual JWT Verification؛ بررسی Signature، `exp`، `nbf` و `azp` | JWT/JWKS و OIDC؛ اعتبارسنجی issuer/audience/signature در Worker لازم است |
| Staff Invite | قابلیت User/Organization/Invitation قابل بررسی | نیازمند پیاده‌سازی Invite در App یا قابلیت/تنظیمات Auth؛ در POC ثابت شود |
| Staff MFA | قابلیت‌های Session/Factor در Provider؛ enforcement واقعی در POC ثابت شود | MFA در Auth وجود دارد؛ enforcement Role-specific در POC ثابت شود |
| Email Verification | رفتار Provider و اعتماد به Claim باید Policy شود | رفتار Provider و `email_verified` باید Policy شود |
| Recovery | برای OAuth عمدتاً upstream IdP؛ مسیر داخلی اضافی لازم است اگر App Verification انتخاب شود | مشابه؛ Email recovery زمانی معنی‌دار است که Email Auth/Delivery هم فعال شود |
| D1 به‌عنوان App DB | مناسب؛ Profile/Role/Workflow در D1 و Identity در Clerk | مناسب؛ Auth Database را با D1 برنامه مخلوط نکنیم؛ فقط Subject/Profile در D1 |
| PWA و Offline | Cache/Offline مستقل از Provider؛ عدم ذخیره Token الزامی است | Cache/Offline مستقل از Provider؛ SDK پیش‌فرض و storage باید بررسی شود |
| Cloudflare Worker runtime | Manual verification بدون SDK سنگین مسیر محتمل است | Verify JWT/JWKS بدون آوردن کل Client SDK مسیر محتمل است |
| Vendor Exit | Mapping Subject و Migration نیازمند طراحی | Mapping Subject و Migration نیازمند طراحی |
| ریسک اصلی | وابستگی Vendor، هزینه/Region، پیچیدگی Cookie/Session در معماری سفارشی | خطای استفاده از Browser Storage، پیچیدگی Cookie/PKCE و Invite/Role Policy |
| نتیجه فعلی | Candidate | Candidate |

---

## 3. ارزیابی برای «کم‌پیچیدگی + PWA»

PWA Offline انتخاب Provider را به‌تنهایی تعیین نمی‌کند. Offline باید در Service Worker/Client Data Layer پیاده شود، نه با یک Identity System دوم.

### Hosted Flow مشترک پیشنهادی

```text
PWA online
  ↓
Provider Hosted OAuth
  ↓
Same-origin callback/Worker boundary
  ↓
Secure session cookie
  ↓
Worker verifies identity
  ↓
D1 maps provider_subject → app user/role/status
```

```text
PWA offline
  ↓
Cached published learning content فقط برای مطالعه
  ↓
No new login / no role change / no staff mutation
  ↓
Optional progress queue
  ↓
Online + valid session → Worker re-authorizes → sync
```

### توصیه فعلی

برای حفظ L1:

1. یک Provider مشترک انتخاب شود.
2. Hosted OAuth و PKCE استفاده شود؛ OAuth اختصاصی در Worker ساخته نشود.
3. JWT/Session فقط در Worker boundary اعتبارسنجی شود.
4. Session در `HttpOnly; Secure; SameSite` Cookie نگه‌داری شود یا مکانیزم رسمی Provider که همین شرط‌ها را satisfy کند.
5. PWA Cache فقط allow-list محتوای عمومی داشته باشد.
6. هیچ SDK یا Service جدیدی فقط برای Offline اضافه نشود تا نیاز دقیق مشخص شود.

این Recommendation انتخاب نهایی Clerk یا Supabase نیست.

---

## 4. POC کمینه و قابل مقایسه

برای هر Provider، یک Branch/Environment تستی یا POC موقت با این مسیر ساخته شود؛ هنوز در Repository اجرا نشده است:

### Identity

- یک Student با OAuth وارد شود.
- یک Staff Invite شود.
- `provider_subject` ثابت و غیرقابل حدس به D1 Profile Map شود.
- User بدون Subject معتبر ایجاد نشود.

### Worker

- JWT/Session با الگوریتم allow-list اعتبارسنجی شود.
- `issuer`، `iat`، `exp`، `nbf` و `azp` بررسی شوند؛ `audience` در صورت استفاده از آن enforce شود.
- کلیدها از JWKS/Provider رسمی و با Cache محدود دریافت شوند.
- Token جعلی، منقضی و Origin نادرست رد شود.
- Worker با SDK کامل Provider به Bundle/runtime وابسته نشود مگر دلیل روشن وجود داشته باشد.

### Session

- Cookie روی دامنه واقعی Preview/Production بررسی شود.
- `HttpOnly`، `Secure`، `SameSite` و `Path` مشاهده و ثبت شود.
- Token در LocalStorage/SessionStorage/CacheStorage نباشد.
- Logout و expiration واقعاً Session را بی‌اثر کند.
- CORS و `credentials` فقط برای Origin allow-list تست شود.

### Staff

- User عمومی نتواند Teacher/Master/Admin شود.
- Invite و MFA واقعی تست شود.
- Role از D1 Policy خوانده شود.
- OAuth Claim قابل تغییر سمت Client، Role را تغییر ندهد.

### PWA

- بعد از یک Login آنلاین، Offline Reading محدود تست شود.
- Offline Auth جدید ادعا نشود.
- Protected Response در Cache ذخیره نشود.
- فقط Snapshotهای Read-only پس از اتصال مجدد و Session معتبر Sync شوند؛ Progress Mutation و Transaction Queue مجاز نیست.

---

## 5. Exit Criteria برای انتخاب Provider

Provider فقط زمانی `APPROVED` شود که:

```text
[ ] Student OAuth در Browser واقعی کار کند.
[ ] Staff Invite و MFA واقعی قابل تست باشد.
[ ] Worker JWT/Session را بدون اعتماد به Client verify کند.
[ ] Cookie/Session با Constraint امنیتی سازگار باشد.
[ ] Logout، expiry و revoked/disabled user policy مشخص باشد.
[ ] D1 mapping و Role/Status transitions روشن باشد.
[ ] Email Verification و Recovery policy قابل اجرا باشد.
[ ] Rate Limit و abuse controls مالک و روش مشخص داشته باشد.
[ ] PWA Offline Reading بدون Offline Authorization کار کند.
[ ] هزینه، Region، vendor exit و remote secrets ثبت شده باشد.
[ ] Remote D1 و ALLOWED_ORIGIN توسط Owner فراهم شده باشد.
```

هر Checkbox اجرا‌نشده `NOT VERIFIED` است.

---

## 6. منابع رسمی بررسی‌شده

- Clerk Session Tokens: <https://clerk.com/docs/guides/sessions/session-tokens>
- Clerk Manual JWT Verification: <https://clerk.com/docs/guides/sessions/manual-jwt-verification>
- Clerk Social Connections: <https://clerk.com/docs/guides/how-clerk-works/overview>
- Supabase OAuth 2.1 Server / PKCE: <https://supabase.com/docs/guides/auth/oauth-server>
- Supabase OAuth Flows: <https://supabase.com/docs/guides/auth/oauth-server/oauth-flows>
- Supabase Server-side Auth / Cookies: <https://supabase.com/docs/guides/auth/server-side/advanced-guide>
- Cloudflare Workers Web Crypto: <https://developers.cloudflare.com/workers/runtime-apis/web-crypto/>

---

## 7. Verdict

```text
Clerk: SELECTED FOR PHASE 3
Supabase Auth: NOT SELECTED — more custom Cookie/Storage/Staff work for this L1
Cloudflare Access: مناسب‌تر برای Staff/Internal Edge، نه Student اصلی
Provider Selection: COMPLETE
Implementation: COMPLETE IN REPOSITORY
Operational Verification: PENDING Clerk keys, issuer, template, OAuth connection and MFA setup
```
