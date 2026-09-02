# Phase 3 — Clerk Setup و راه‌اندازی عملیاتی

**Provider نهایی:** Clerk
**وضعیت کد:** Implemented
**وضعیت محیط:** نیازمند مقادیر واقعی Clerk و Remote D1

این سند راه‌اندازی Provider را توضیح می‌دهد. هیچ Secret واقعی نباید در Git یا Frontend قرار گیرد.

---

## 1. تنظیمات Clerk

### Student OAuth

در Clerk Dashboard فقط Connectionهای OAuth موردنیاز را فعال کنید. برای MVP بهتر است ابتدا یک Connection فعال باشد تا سطح تست کوچک بماند. Student از Hosted Sign-in/Sign-up استفاده می‌کند؛ Account در اولین ورود ساخته نمی‌شود تا کاربر در دارالفنون مسیر `Student` یا `Teacher` را انتخاب کند.

### Session Token / JWT Template

Frontend برای درخواست به Worker از `getToken({ template: VITE_CLERK_JWT_TEMPLATE })` استفاده می‌کند. یک JWT Template سبک با Lifetime کوتاه، ترجیحاً ۶۰ ثانیه، بسازید و این Claimها را اضافه کنید:

```json
{
  "email": "{{user.primary_email_address}}",
  "email_verified": "{{user.email_verified}}",
  "first_name": "{{user.first_name}}",
  "last_name": "{{user.last_name}}"
}
```

Claimهای `iss`، `sub`، `iat`، `exp`، `nbf`، `jti` و `azp` به‌صورت خودکار توسط Clerk ایجاد می‌شوند. Worker فقط Token با `RS256`، Issuer درست، زمان معتبر، JTI و Authorized Party مجاز را می‌پذیرد.

اگر Template از `aud` استفاده می‌کند، مقدار دقیق آن را در `CLERK_JWT_AUDIENCE` تنظیم کنید. در غیر این صورت این Secret لازم نیست.

> نکته: این پروژه برای کاهش Complexity از Custom JWT کوتاه‌عمر و JTI Revocation استفاده می‌کند؛ Token در Application Storage ذخیره نمی‌شود. Clerk Session/Cookie خودش توسط SDK مدیریت می‌شود و Application به `localStorage` برای Auth دست نمی‌زند.

### Staff

1. Teacher از مسیر عمومی OAuth فقط Application ایجاد می‌کند و `pending` می‌ماند.
2. Master و Admin از Registration عمومی ساخته نمی‌شوند.
3. برای Master در Clerk Invite ایجاد کنید، سپس Admin در دارالفنون هویت Provider Subject را Provision کند.
4. MFA را برای Staff اجباری کنید.
5. Bootstrap Admin فقط با یک Provider Subject دقیق و Secret موقت انجام شود.

---

## 2. Frontend Environment

در محیط Frontend:

```text
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_CLERK_JWT_TEMPLATE=darullfonon
```

Publishable Key قابل انتشار در Bundle است؛ هیچ `CLERK_SECRET_KEY` یا Private Key در اینجا قرار ندهید.

بدون `VITE_CLERK_PUBLISHABLE_KEY`، UI به‌جای Demo Role صفحه پیکربندی نشان می‌دهد و وارد محصول نمی‌شود.

---

## 3. Worker Secrets و Variables

Secretها را با Wrangler ثبت کنید:

```bash
npx wrangler secret put CLERK_JWT_KEY --config wrangler.toml
npx wrangler secret put CLERK_JWT_ISSUER --config wrangler.toml
npx wrangler secret put CLERK_AUTHORIZED_PARTIES --config wrangler.toml
npx wrangler secret put BOOTSTRAP_ADMIN_PROVIDER_SUBJECT --config wrangler.toml
```

اختیاری:

```bash
npx wrangler secret put CLERK_JWT_AUDIENCE --config wrangler.toml
```

مقادیر:

- `CLERK_JWT_KEY`: Public Key مربوط به Clerk به‌صورت PEM. Private Key هرگز در Worker/Repository قرار نگیرد.
- `CLERK_JWT_ISSUER`: مقدار دقیق Issuer محیط Clerk، بدون حدس یا wildcard.
- `CLERK_JWT_AUDIENCE`: فقط اگر Token Template Claim `aud` دارد.
- `CLERK_AUTHORIZED_PARTIES`: Origin دقیق Pages، بدون wildcard؛ چند مقدار با comma قابل ثبت است.
- `BOOTSTRAP_ADMIN_PROVIDER_SUBJECT`: فقط Subject اولین Admin. بعد از Bootstrap، Adminهای بعدی باید با فرآیند کنترل‌شده Provision شوند و مقدار Bootstrap حذف/چرخانده شود.

Variable غیرمحرمانه:

```text
ALLOWED_ORIGIN=https://app.example.com
ENVIRONMENT=production
```

`ALLOWED_ORIGIN` نباید `*` باشد.

---

## 4. D1 و ترتیب Bootstrap

ترتیب امن:

```text
1. ساخت Remote D1 و ثبت database_id واقعی
2. Backup/Snapshot
3. Apply 0003_authentication.sql و 0004_rate_limits.sql روی Remote
4. تنظیم Clerk و Worker Secrets
5. ورود Bootstrap Admin با OAuth
6. بررسی /api/v1/auth/me
7. حذف یا چرخاندن Bootstrap Secret
8. Invite و MFA Staff
9. Functional/Security/Regression Test
```

هیچ User با SQL دستی و Email دلخواه در Production ساخته نشود، مگر فرآیند Provisioning مستند و Review شده باشد.

---

## 5. Flowهای محصول

### Student

```text
Clerk OAuth
  → email_verified=true
  → /api/v1/auth/me (onboarded=false)
  → Student selection
  → /api/v1/auth/onboarding/student
  → role=student, status=active, @sd
```

### Teacher

```text
Clerk OAuth
  → email_verified=true
  → /api/v1/auth/me (onboarded=false)
  → Teacher application
  → /api/v1/auth/teacher/application
  → role=teacher, status=pending, @mt
  → Admin approve/reject
```

### Master

```text
Clerk Invite + MFA
  → Admin /api/v1/admin/master-provision
  → role=master, status=active, @mt داخلی
  → Content API فقط با Backend Role Check
```

### Admin

```text
Clerk OAuth + MFA
  → Bootstrap Subject یا Provisioning کنترل‌شده
  → role=admin, status=active
  → Teacher Approval و Security Operations
```

---

## 6. Troubleshooting امن

- `AUTH_CONFIGURATION_REQUIRED`: Secretهای Worker کامل نیستند.
- `INVALID_TOKEN`: Issuer، Public Key، Lifetime، Algorithm یا Template Claim بررسی شود.
- `EMAIL_VERIFICATION_REQUIRED`: Template Claim `email_verified` واقعاً Boolean `true` نیست یا Email upstream تأیید نشده است.
- `ONBOARDING_REQUIRED`: کاربر OAuth هنوز Student/Teacher را انتخاب نکرده است.
- `ACCOUNT_ROLE_CONFLICT`: همان Provider Subject قبلاً با Role دیگری ثبت شده است؛ Account دوم با Suffix راه‌حل نیست.
- `INSUFFICIENT_ROLE`: Role/Status از D1 اجازه عملیات نمی‌دهد.
- `SESSION_REVOKED`: JTI Logout شده است؛ Token جدید از Clerk بگیرید.

در هیچ خطایی، Token، Private Key یا Provider Secret در Log چاپ نشود.
