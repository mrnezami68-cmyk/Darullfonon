# مشاوره معماری Authentication و طراحی ثبت‌نام

**تاریخ:** ۲ سپتامبر ۲۰۲۶
**مرحله:** پیش از ورود به Phase 3 — Production Security
**Branch:** `arena/01a05d5b-darullfonon`
**Complexity Target:** `L1 — Simple`
**نوع سند:** مشاوره تصمیم‌گیری؛ بدون تغییر کد

> این سند گزارش حضور یا صورت‌جلسه برگزارشده نیست. نام و نظر واقعی افراد در اختیار نیست و هیچ نظر ساختگی به شخصی نسبت داده نمی‌شود. بخش «دیدگاه نقش‌ها» تحلیل کارشناسی بر اساس مسئولیت هر نقش است و بخش «ثبت رأی واقعی» باید در جلسه واقعی تکمیل شود.

---

## 1. مسئله تصمیم‌گیری

در وضعیت فعلی:

- Student و Master با Demo Role کار می‌کنند.
- `X-Demo-Role` و `X-Demo-User` برای Production قابل قبول نیستند.
- ارسال کد ایمیل، SMS یا سرویس Mail داخلی نداریم.
- Frontend روی React/Vite، API روی Cloudflare Worker و داده روی D1 است.
- Complexity باید روی `L1 — Simple` باقی بماند.

دو تصمیم قبل از Phase 3 لازم است:

1. Authentication بدون ساخت سیستم ارسال کد چگونه انجام شود؟
2. صفحه ثبت‌نام و ورود Student و Master چه تفاوتی داشته باشد؟

---

## 2. پاسخ کوتاه مدیریتی

### آیا بدون داشتن سیستم ارسال کد، Authentication ممکن است؟

بله. لازم نیست ارسال Email/SMS را خودمان از صفر بسازیم. می‌توان از یک **Managed Identity Provider** استفاده کرد که ثبت‌نام، ورود، Session، Verification، Recovery و در صورت نیاز MFA را مدیریت کند. Supabase Auth روش‌های password، magic link، OTP، social، SSO و MFA را ارائه می‌کند و از JWT برای Authentication استفاده می‌کند. [1](https://supabase.com/docs/guides/auth)

اما یک نکته قطعی وجود دارد:

```text
Passwordless Email / Magic Link / Email OTP
        نیازمند Email Delivery است.
```

اگر ما Email یا SMS نداریم، سه انتخاب داریم:

1. استفاده از Email/Password و واگذاری Verification/Recovery به سرویس Managed Auth.
2. استفاده از OAuth/OIDC مانند Google یا یک Identity Provider مورد تأیید.
3. استفاده از Passkey، فقط پس از طراحی دقیق Recovery و پشتیبانی دستگاه‌ها.

اگر هیچ کانال Email، SMS، OAuth یا Passkey قابل اتکا نداریم، ساخت حساب کاربری Production با Recovery امن ممکن نیست. ساخت Username/Password در Worker و D1 در این شرایط توصیه نمی‌شود.

### تصمیم پیشنهادی

```text
Student:
Managed Auth + Email/Password
به‌علاوه حداقل یک OAuth/OIDC اختیاری در صورت تأیید محصول و دسترسی

Master:
ثبت‌نام عمومی ممنوع
Invite-only یا SSO سازمانی
به‌علاوه MFA اجباری
```

---

## 3. مقایسه گزینه‌های Authentication

| گزینه | مناسب برای Student | مناسب برای Master | مزیت اصلی | ریسک / ملاحظه |
|---|---|---|---|---|
| Clerk | بله | بله، با Role/Permission | راه‌اندازی سریع، UI آماده یا Flow سفارشی، Session و MFA | وابستگی به Vendor، بررسی هزینه، منطقه داده و دسترسی الزامی |
| Supabase Auth | بله | بله | روش‌های متنوع Auth، JWT، Social، SSO و MFA | یک سرویس بیرونی دیگر در کنار D1؛ داده App همچنان می‌تواند در D1 بماند |
| Auth0 | بله | بسیار مناسب | بلوغ بالا، Token و Permissionهای دقیق | احتمالاً برای L1 بیش از نیاز و از نظر تنظیمات سنگین‌تر |
| Cloudflare Access | برای Student عمومی، انتخاب اول نیست | بسیار مناسب برای پنل داخلی | حفاظت مستقیم از Worker، Policy و هویت در لبه Cloudflare | بیشتر مناسب Internal/Admin است؛ جایگزین کامل ثبت‌نام عمومی Student نیست |
| Firebase Auth | بله | قابل استفاده | SDK و Providerهای متعدد | وابستگی بیشتر به اکوسیستم Google در کنار Cloudflare/D1 |
| ساخت Auth در Worker/D1 | از نظر تئوری بله | از نظر تئوری بله | کنترل کامل | ساخت Password Hash، Session، Recovery، MFA، Rate Limit، Abuse و Rotation؛ خارج از L1 فعلی |

### نتیجه مشاوره فنی

برای تصمیم نهایی، دو گزینه باید به Proof of Concept کوتاه بروند:

```text
Candidate A: Clerk
Candidate B: Supabase Auth
```

و یک مسیر جدا برای Master بررسی شود:

```text
Cloudflare Access یا SSO سازمانی
```

Auth0 فقط در صورتی وارد بررسی اصلی شود که نیاز Enterprise، چندسازمانی یا Permissionهای پیشرفته واقعاً تصویب شود. مستندات Auth0 تأکید می‌کند API باید امضای JWT، audience، claimهای استاندارد و Permissionها را اعتبارسنجی کند؛ این الگو برای هر Provider انتخابی لازم است. [2](https://auth0.com/docs/secure/tokens/access-tokens/validate-access-tokens)

---

## 4. نظر مشاوره‌ای درباره هر مدل

## مدل پیشنهادی A — Managed Auth با Email/Password

### Flow Student

```text
Student
  ↓
صفحه ایجاد حساب
  ↓
Email + Password
  ↓
Provider User Account
  ↓
Session / JWT
  ↓
Worker Token Verification
  ↓
D1 Profile و Learning Data
```

در این مدل ما سیستم Mail داخلی نمی‌سازیم. Provider می‌تواند Verification و Recovery را مدیریت کند؛ جزئیات sender domain، deliverability و سیاست Verification باید در Proof of Concept همان Provider بررسی شود.

### مزایا

- تجربه آشنای کاربر.
- عدم نیاز به ساخت Password Hash و Session از صفر.
- مناسب برای Student عمومی.
- قابل اتصال به Worker با JWT.

### ضعف‌ها

- برای Recovery و Verification همچنان یک کانال ارتباطی لازم است.
- اگر Email Provider به کاربران نرسد، پشتیبانی و بازیابی مشکل می‌شود.
- باید Vendor Lock-in، قیمت، منطقه داده و دسترسی بررسی شود.

---

## مدل پیشنهادی B — OAuth/OIDC

### Flow Student

```text
Student
  ↓
ادامه با Provider انتخاب‌شده
  ↓
OAuth/OIDC Authorization
  ↓
Callback و Session
  ↓
Worker بررسی iss / aud / exp / sub
  ↓
D1 Profile
```

### مزایا

- عدم نیاز به ارسال کد توسط ما.
- عدم نیاز کاربر به ساخت Password جدید.
- Verification اولیه توسط Identity Provider.

### ضعف‌ها

- وابستگی به در دسترس بودن Provider.
- احتمال محدودیت منطقه‌ای یا سیاستی.
- باید account linking و تغییر Provider طراحی شود.
- برای Master، OAuth عمومی به‌تنهایی کافی نیست و باید با Invite، Domain یا Group محدود شود.

---

## مدل پیشنهادی C — Cloudflare Access برای Master

Cloudflare Access می‌تواند یک Worker را مستقیماً پشت Policy قرار دهد و هویت کاربر احراز‌شده را در اختیار Worker بگذارد؛ مستندات Cloudflare برای Worker، خواندن هویت از `ctx.access` را توضیح می‌دهد. [3](https://developers.cloudflare.com/workers/configuration/cloudflare-access/)

برای Master این مدل جذاب است چون:

- صفحه ثبت‌نام عمومی Master حذف می‌شود.
- دسترسی از طریق Policy، گروه، Domain یا حساب سازمانی کنترل می‌شود.
- می‌توان MFA و Session Policy جداگانه برای پنل حساس تعریف کرد.
- Worker دیگر نقش Master را از Header قابل جعل قبول نمی‌کند.

Cloudflare Access در درجه اول برای Web Appهای محافظت‌شده و Internal/Admin مناسب است؛ Student عمومی به یک تجربه ثبت‌نام مصرف‌کننده و Account Recovery نیاز دارد، بنابراین Access به‌تنهایی انتخاب اول Student نیست. Cloudflare برای Self-hosted Application از Policy، Session Management و Identity Provider پشتیبانی می‌کند. [4](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/choose-application-type/)

---

## 5. تعریف قطعی Roleها

### Student

- می‌تواند از مسیر عمومی ثبت‌نام کند.
- Role او نباید از فرم ثبت‌نام انتخاب شود.
- پس از ثبت‌نام، Role پیش‌فرض `student` است.
- تغییر Role فقط از مسیر مدیریتی Server-side انجام شود.
- Progress، Quiz Attempt و Profile به Subject معتبر Provider متصل شود.

### Master

- ثبت‌نام عمومی ندارد.
- کاربر Master با Invite، SSO سازمانی یا Provisioning دستی ایجاد می‌شود.
- Role Master از Client قابل ارسال یا تغییر نیست.
- MFA اجباری است.
- هر عملیات Write در Worker نیازمند بررسی Session، Role و Permission است.
- برای پنل داخلی، Cloudflare Access می‌تواند لایه جلویی باشد؛ Authorization داخل Application همچنان باید روشن و قابل Audit بماند.

### اصل غیرقابل مذاکره

```text
Role انتخابی در UI = اطلاعات نمایشی
Role معتبر = Claim/Session معتبر + بررسی Server-side + Policy
```

---

## 6. طراحی صفحه ثبت‌نام و ورود Student

## 6.1 صفحه ورود مشترک اولیه

پیشنهاد می‌شود به‌جای دو سیستم هویت جدا، یک Auth Shell داشته باشیم و مقصد را بر اساس مسیر مشخص کنیم:

```text
/auth/sign-in
/auth/sign-up
/master/sign-in
/master/invite/:token
```

در صفحه عمومی، هیچ گزینه‌ای با عنوان «من Master هستم» قرار نگیرد. انتخاب Master در صفحه عمومی باعث Role Escalation و خطای UX می‌شود.

### اجزای صفحه Student Sign-up

1. Logo و نام دارالفنون.
2. عنوان روشن: «حساب یادگیری خودت را بساز».
3. توضیح کوتاه درباره مزیت حساب:
   - ذخیره Progress
   - ادامه مسیر در دستگاه دیگر
   - نگهداری نتیجه Quiz
4. Email.
5. Password.
6. تکرار Password، اگر Provider این مرحله را در UI خود مدیریت نکند.
7. پذیرش Terms و Privacy.
8. CTA اصلی: «ساخت حساب و شروع یادگیری».
9. گزینه OAuth/OIDC تأییدشده، در صورت تصویب.
10. لینک «قبلاً حساب داری؟ ورود».
11. لینک «بازیابی حساب» در صفحه ورود، نه الزاماً در ثبت‌نام.
12. پیام خطای قابل فهم بدون افشای وجود یا عدم وجود حساب.

### حالت بعد از ثبت‌نام

اگر Verification Email فعال باشد:

```text
حساب ساخته شد.
در صورت نیاز، Provider مراحل تأیید را نمایش می‌دهد.
گزینه‌های تغییر Email، ارسال دوباره و بازگشت به ورود وجود دارد.
```

اگر فقط OAuth فعال باشد:

```text
Session برقرار شد.
کاربر وارد Onboarding کوتاه می‌شود.
```

### Onboarding پس از ورود

- نام نمایشی.
- هدف یادگیری.
- سطح فعلی.
- انتخاب حوزه‌های علاقه.
- امکان رد کردن Onboarding.

این اطلاعات نباید در Registration اولیه زیاد شوند؛ هدف صفحه ثبت‌نام، شروع سریع و قابل اعتماد است.

---

## 6.2 صفحه Login Student

اجزای پیشنهادی:

- Email یا Provider Identifier.
- Password، اگر مدل Email/Password انتخاب شده است.
- CTA «ورود به مسیر من».
- «فراموشی رمز عبور».
- OAuth/OIDC همان Providerهای ثبت‌نام.
- پیام خطا عمومی و غیرقابل استفاده برای User Enumeration.
- لینک ثبت‌نام.
- نمایش وضعیت Session و خروج.

### نکته UX

Student نباید در صفحه Login با اصطلاحاتی مانند JWT، Session، D1 یا Worker مواجه شود. این موارد فقط در معماری و لاگ فنی هستند.

---

## 7. طراحی صفحه Master

## 7.1 تصمیم اصلی: Master صفحه ثبت‌نام عمومی ندارد

عنوان درست صفحه:

```text
ورود به پنل مدیریت دارالفنون
```

نه:

```text
ثبت‌نام Master
```

### سناریوی عادی

```text
مدیر سیستم کاربر را در Provider دعوت یا Provision می‌کند
        ↓
کاربر دعوت را می‌پذیرد
        ↓
Authentication اولیه
        ↓
تنظیم MFA
        ↓
فعال شدن Role/Permission
        ↓
ورود به Master Dashboard
```

### اگر Email Delivery در اختیار ما نباشد

دو حالت قابل قبول وجود دارد:

1. Provider یا SSO سازمانی Email/Invite را مدیریت کند.
2. Super Admin حساب را از پنل Provider ایجاد کند و فرآیند فعال‌سازی امن را خارج از صفحه عمومی انجام دهد.

ارسال دستی Password در Chat، پیام‌رسان یا Ticket توصیه نمی‌شود.

### اجزای صفحه Master Login

- عنوان «ورود مدیران و تیم محتوا».
- توضیح «دسترسی Master فقط با دعوت یا حساب سازمانی فعال می‌شود.»
- دکمه SSO/OIDC یا Email/Password Provider.
- MFA Challenge.
- لینک راهنمای تماس با مدیر سیستم.
- عدم وجود دکمه «ایجاد حساب Master».
- عدم وجود Role Selector.

### مسیر دعوت Master

صفحه Invite باید:

- Invite Token را فقط از Provider معتبر بپذیرد.
- Expired یا مصرف‌شده‌بودن دعوت را واضح اعلام کند.
- Role و Scope دعوت را به‌صورت Read-only نمایش دهد.
- ایجاد Password یا اتصال SSO را به Provider بسپارد.
- MFA را پیش از ورود به Dashboard فعال کند.
- پس از اتمام، کاربر را به Master Dashboard ببرد.

---

## 8. معماری Token و Session برای Phase 3

بدون ورود به کدنویسی، قرارداد تصمیم باید این باشد:

```text
Frontend
  ↓ Authorization Bearer یا Secure Session Cookie
Worker
  ↓ Verify signature, issuer, audience, expiry, subject
  ↓ Resolve application profile and role
D1
  ↓ Read/Write by verified subject
```

Worker باید حداقل این موارد را بررسی کند:

- امضای Token.
- `iss` یا Issuer مورد انتظار.
- `aud` یا Audience مربوط به همین API.
- `exp` و زمان اعتبار.
- `sub` به‌عنوان Subject پایدار کاربر.
- Role/Permission معتبر از Claim امن یا Profile server-side.
- عدم پذیرش `X-Demo-User` یا Role Header در Production.

Clerk نیز برای اتصال به Backend، Manual JWT Verification و بررسی کلید عمومی/Session Token را مستند کرده است. [5](https://clerk.com/docs/guides/sessions/manual-jwt-verification)

### D1 Profile پیشنهادی

هویت اصلی از Provider می‌آید؛ D1 فقط Profile و داده محصول را نگهداری می‌کند:

```text
provider
provider_subject UNIQUE
display_name
role
status
created_at
updated_at
```

Password، Refresh Token و Secret Provider نباید در D1 ذخیره شوند مگر با تصمیم امنیتی مستقل و توجیه روشن.

---

## 9. دیدگاه‌های کارشناسی بر اساس نقش

این بخش «نظر یک فرد حاضر» نیست؛ تحلیل مسئولیت هر نقش برای تکمیل جلسه واقعی است.

### مدیریت محصول و مدیران

- اولویت باید شروع سریع Student و جلوگیری از ایجاد مانع غیرضروری باشد.
- Master نباید Registration عمومی داشته باشد.
- انتخاب Provider باید با هزینه، منطقه داده، دسترسی کاربران فارسی‌زبان، پشتیبانی و خروج امن از Vendor بررسی شود.
- تصمیم Auth باید یک تصمیم محصولی و حقوقی هم باشد، نه فقط انتخاب یک SDK.

### Product / UX

- Student و Master باید زبان و مسیر جدا داشته باشند، اما لزوماً دو User Store جدا نباشند.
- Role Selector در Registration عمومی ممنوع.
- Student با پیام «شروع یادگیری» وارد شود، Master با پیام «دسترسی دعوتی و امن».
- صفحه Auth باید Mobile First، RTL، کم‌فیلد و قابل بازیابی باشد.
- خطاها نباید فنی یا افشاگر وجود حساب باشند.

### مهندس امنیت

- ساخت Auth اختصاصی بدون Email، Recovery و MFA مسیر پرریسکی است.
- Master باید Invite-only و MFA اجباری باشد.
- Token باید در Worker با Signature، Issuer، Audience، Expiry و Subject اعتبارسنجی شود.
- Role از Client پذیرفته نشود.
- Password، Secret و Token بلندمدت در D1 یا Local Storage قرار نگیرد.
- Account Recovery، Session Revocation، Brute Force، Credential Stuffing و User Enumeration باید در Threat Model باشند.
- Managed Auth انتخاب اول است؛ اما DPA، Data Residency، Incident Response و خروج از Provider باید بررسی شود.

### مهندس شبکه

- Frontend و Worker باید با HTTPS و Originهای مشخص ارتباط داشته باشند.
- CORS در Production باید Allowlist و Fail-closed باشد.
- Callbackهای OAuth فقط روی URLهای ثبت‌شده مجاز باشند.
- Cookie Domain، SameSite، Secure و مسیر API باید از ابتدا تصمیم‌گیری شود.
- CSP، Redirect URI، TLS، DNS و محیط Preview/Production باید جدا باشند.
- Cloudflare Access برای Master داخلی می‌تواند سطح Edge را محافظت کند؛ اما جایگزین Authorization داخل Worker نیست.

### مهندس Database

- Identity Provider صاحب هویت است؛ D1 صاحب داده محصول.
- اتصال باید با `provider_subject` یکتا انجام شود، نه Email به‌تنهایی.
- Role، Status و Audit باید در Profile یا Claim قابل اعتماد باشند.
- تغییر Email نباید باعث از دست رفتن Progress شود.
- Migration باید کم‌خطر، قابل Rollback و مستقل از Seed Demo باشد.
- PII حداقلی نگهداری شود و Retention مشخص باشد.

### مهندس توسعه نرم‌افزار

- Integration باید با Standard OIDC/JWT و یک Adapter کوچک انجام شود.
- API Client فعلی حفظ شود؛ فقط Session/Authorization به آن اضافه شود.
- Demo Mode محلی باید با Flag محیطی باقی بماند، نه با مسیر Production.
- Provider SDK نباید منطق Product و D1 را در خود ببلعد.
- API باید خطاهای 401 و 403 جدا داشته باشد.
- هیچ Secret یا Client Secret در Frontend قرار نگیرد.

### مهندس QA و کنترل کیفیت

حداقل سناریوهای لازم:

- Student Sign-up موفق.
- Email تکراری.
- Password ضعیف.
- OAuth Callback نامعتبر.
- Session منقضی‌شده.
- Token با Audience اشتباه.
- Token با Issuer اشتباه.
- User بدون Profile.
- Student تلاش برای Master Endpoint.
- Master بدون MFA.
- Master با Invite منقضی‌شده.
- Logout و Revocation.
- Recovery و تغییر Email.
- قطع موقت Provider.
- CORS و Redirect URI نادرست.
- عدم نشت اطلاعات در Error Message.

### مشاوران AI

- AI نباید بدون تأیید امنیت و مدیریت، Provider یا سیاست Role را نهایی کند.
- هیچ PII، Password، Token یا محتوای حساس Auth نباید به مدل AI ارسال شود.
- پیشنهاد AI باید با L1، Threat Model و محدودیت‌های واقعی محصول سازگار باشد.
- AI می‌تواند در مقایسه Providerها، طراحی Test Case و مرور Threat Model کمک کند؛ تصمیم نهایی انسانی است.
- استفاده از AI برای تولید Auth Code بدون Review امنیتی ممنوع.

### مهندس نظارت / Compliance / ممیزی

- Consent، Privacy Policy، Terms و Retention باید پیش از Production روشن باشند.
- Provider، کشور پردازش داده و Subprocessorها باید ثبت و تأیید شوند.
- Master Actions باید Audit قابل پیگیری داشته باشند.
- Demo و Production باید در UI، Environment و مستندات جدا و واضح باشند.
- Go/No-Go امنیتی نباید فقط بر اساس موفقیت Login UI صادر شود.

### مدیر تحقیق و توسعه

- انتخاب Provider باید با یک Spike محدود و قابل اندازه‌گیری انجام شود.
- معیار انتخاب: زمان راه‌اندازی، کیفیت Integration با Worker، پشتیبانی JWT/OIDC، Recovery، MFA، هزینه، Region و امکان خروج.
- پس از انتخاب، Provider در ADR ثبت شود و از تغییر مکرر جلوگیری شود.
- همچنان L1 حفظ شود؛ Authentication نباید به Microservice یا User Service مستقل تبدیل شود مگر Requirement جدید تصویب شود.

---

## 10. معیار انتخاب Provider

برای هر Candidate امتیاز ۱ تا ۵ ثبت شود:

| معیار | وزن پیشنهادی |
|---|---:|
| راه‌اندازی Student بدون Email Service داخلی | ۲۰٪ |
| JWT/OIDC و اعتبارسنجی ساده در Worker | ۲۰٪ |
| Invite، MFA و Role برای Master | ۲۰٪ |
| Recovery و پشتیبانی کاربر | ۱۵٪ |
| هزینه و محدودیت‌های Vendor | ۱۰٪ |
| منطقه داده و دسترسی کاربران | ۱۰٪ |
| امکان خروج و انتقال هویت | ۵٪ |

### شرط رد Candidate

هر Provider که یکی از این موارد را نداشته باشد، نباید به Production برود:

- Token Verification استاندارد.
- Session Revocation یا روش قابل قبول کنترل Session.
- Recovery قابل اتکا.
- MFA برای Master.
- مستندات و پشتیبانی قابل بررسی.
- امکان تنظیم Redirect و Origin امن.

---

## 11. تصمیمات پیشنهادی برای رأی جلسه

### تصمیم ۱ — Student

```text
Approve:
Managed Auth برای Student
Email/Password یا OAuth/OIDC تأییدشده
عدم ساخت Auth اختصاصی در Worker/D1
```

### تصمیم ۲ — Master

```text
Approve:
No Public Registration
Invite-only یا SSO سازمانی
MFA اجباری
Cloudflare Access به‌عنوان گزینه محافظت Edge برای پنل داخلی
```

### تصمیم ۳ — نقش

```text
Reject:
Role Selector در فرم ثبت‌نام
X-Demo-Role در Production
X-Demo-User به‌عنوان User Identity
```

### تصمیم ۴ — Proof of Concept

```text
مقایسه محدود Clerk و Supabase Auth
با مسیر Student Sign-up/Sign-in و Master Invite/MFA
سپس ثبت تصمیم در ADR
```

---

## 12. ثبت نظر واقعی افراد در جلسه

| نقش | نام واقعی | رأی | دلیل | شرط تأیید | امضا / تاریخ |
|---|---|---|---|---|---|
| مدیر محصول | Pending | Pending | Pending | Pending | Pending |
| مدیر تحقیق و توسعه | Pending | Pending | Pending | Pending | Pending |
| Project Director | Pending | Pending | Pending | Pending | Pending |
| Product / UX Lead | Pending | Pending | Pending | Pending | Pending |
| مهندس امنیت | Pending | Pending | Pending | Pending | Pending |
| مهندس شبکه | Pending | Pending | Pending | Pending | Pending |
| مهندس Database | Pending | Pending | Pending | Pending | Pending |
| مهندس Frontend | Pending | Pending | Pending | Pending | Pending |
| مهندس Backend / Worker | Pending | Pending | Pending | Pending | Pending |
| QA Lead | Pending | Pending | Pending | Pending | Pending |
| Browser / E2E Engineer | Pending | Pending | Pending | Pending | Pending |
| مشاور AI | Pending | Pending | Pending | Pending | Pending |
| مهندس نظارت / Compliance | Pending | Pending | Pending | Pending | Pending |
| Technical Auditor | Pending | Pending | Pending | Pending | Pending |

---

## 13. جمع‌بندی کارشناسی فعلی

این جمع‌بندی بر اساس بررسی فنی و نقش‌هاست و تا قبل از ثبت رأی واقعی، «تصمیم نهایی جلسه» محسوب نمی‌شود:

1. برای Student، بهترین مسیر L1 استفاده از Managed Auth است؛ ساخت Auth اختصاصی با نبود Email/SMS، Recovery و MFA ریسک و پیچیدگی زیادی وارد می‌کند.
2. نداشتن سرویس ارسال کد مانع Authentication نیست؛ می‌توان Email/Password یا OAuth را انتخاب کرد و Delivery را به Provider سپرد.
3. اگر هیچ Email، SMS، OAuth یا Passkey نداریم، Production Account با Recovery قابل اتکا نداریم و باید ابتدا یک کانال هویت تصویب شود.
4. Student و Master بهتر است یک سیستم هویت مشترک داشته باشند، اما مسیر UX و Policy آن‌ها جدا باشد.
5. Student می‌تواند Registration عمومی داشته باشد؛ Master نباید Registration عمومی داشته باشد.
6. Master باید Invite-only یا SSO سازمانی و دارای MFA باشد.
7. Cloudflare Access گزینه جدی برای محافظت پنل Master داخلی است، نه جایگزین اصلی ثبت‌نام عمومی Student.
8. تصمیم نهایی بین Clerk و Supabase Auth باید با POC محدود، بررسی Region/هزینه/Recovery و نظر امنیت انجام شود.
9. Role باید Server-side تعیین و بررسی شود؛ Role انتخابی در فرم اعتبار امنیتی ندارد.
10. شروع Phase 3 فقط پس از ثبت تصمیم Auth، Owner، Provider، روش Session، روش Recovery و سیاست Master مجاز است.

### Gate ورود به Phase 3

```text
Auth Provider: Approved
Student Flow: Approved
Master Flow: Invite-only / SSO Approved
MFA for Master: Approved
Token Validation Contract: Approved
D1 Identity Mapping: Approved
Recovery Policy: Approved
Security Owner: Assigned
QA Acceptance Matrix: Approved
```

تا زمانی که این Gate توسط افراد واقعی جلسه تأیید نشود، Phase 3 نباید وارد پیاده‌سازی Production شود.

---

## منابع رسمی بررسی‌شده

1. [Supabase Auth overview](https://supabase.com/docs/guides/auth) — روش‌های Password، Magic Link، OTP، Social، SSO، MFA و JWT.
2. [Auth0 access token validation](https://auth0.com/docs/secure/tokens/access-tokens/validate-access-tokens) — اعتبارسنجی Signature، Audience، Claimها و Permissionها.
3. [Cloudflare Workers Access](https://developers.cloudflare.com/workers/configuration/cloudflare-access/) — حفاظت Worker و دریافت Identity با `ctx.access`.
4. [Cloudflare Access application types](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/choose-application-type/) — Self-hosted Application، Policy و Session Management.
5. [Clerk manual JWT verification](https://clerk.com/docs/guides/sessions/manual-jwt-verification) — اعتبارسنجی Session Token و کلید عمومی.
6. [Clerk sign-up/sign-in options](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options) — Email، Password، Passkeys، Phone و سایر Strategyها.
7. [Clerk basic RBAC](https://clerk.com/docs/guides/secure/basic-rbac) — نگهداری Role در Metadata امن و بررسی سمت Server.
