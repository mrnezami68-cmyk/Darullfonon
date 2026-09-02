# SECURITY NOTES — دارالفنون

**فاز:** Phase 3 — Authentication & Authorization
**Provider:** Clerk OAuth/OIDC
**وضعیت:** Implemented locally / Production verification required

## کنترل‌های پیاده‌شده

- Frontend فقط Clerk Publishable Key را می‌بیند؛ Secret در Frontend قرار نمی‌گیرد.
- Application Token را در `localStorage` یا `sessionStorage` ذخیره نمی‌کند؛ Token کوتاه‌عمر Clerk فقط برای درخواست محافظت‌شده در حافظه استفاده می‌شود.
- Worker فقط `RS256` را می‌پذیرد و Public Key Clerk را از Secret می‌گیرد.
- Worker `issuer`، امضا، `exp`، `nbf`، `jti` و `azp` را بررسی می‌کند؛ `aud` در صورت تنظیم Secret مربوطه enforce می‌شود.
- Role و Status از D1 User Record خوانده می‌شوند؛ از Request، Suffix یا Demo Header پذیرفته نمی‌شوند.
- `X-Demo-Role` و `X-Demo-User` دیگر مسیر Authorization نیستند.
- `@sd` و `@mt` فقط Login Identifier هستند و Unique Constraint دارند.
- User ID با `crypto.randomUUID()` ساخته می‌شود و به نام/Identifier وابسته نیست.
- `student` فقط با `email_verified` معتبر upstream به `active` می‌رسد.
- Teacher با Route Policy ثابت به `role=teacher,status=pending` ساخته می‌شود و فعال‌سازی Client-side ندارد.
- Master فقط با Invite/Provisioning داخلی Admin ساخته می‌شود؛ Admin عمومی ساخته نمی‌شود.
- Admin با Bootstrap Subject پیکربندی‌شده یا Provisioning کنترل‌شده ایجاد می‌شود.
- Approve/Reject Teacher با شرط وضعیت `pending` و D1 Batch انجام می‌شود.
- Approve/Reject/Suspend در `audit_logs` ثبت می‌شوند.
- Logout، JTI توکن جاری را تا زمان Expiration در `auth_revoked_tokens` revoke می‌کند و سپس Clerk `signOut()` اجرا می‌شود.
- Progress و Quiz Attempt مالکیت را فقط از User معتبر Worker می‌گیرند؛ Progress برای Lesson غیر Published پذیرفته نمی‌شود.
- مسیرهای Public برای Chapter، Lesson و Quiz فقط وقتی داده می‌دهند که Course والد Published باشد.
- Rate Limit پایه برای Student Onboarding، Teacher Application و Admin Mutation با D1 Bucket فعال است.
- بدون `ALLOWED_ORIGIN`، CORS به Origin دلخواه Echo نمی‌شود و مقدار `null` برمی‌گرداند.
- Responseهای Auth/User/Admin/Mutation با `Cache-Control: no-store` ارسال می‌شوند.
- Service Worker فقط Content عمومی و Published را Cache می‌کند؛ Auth، Progress، Quiz Submit و Staff/Admin Cache نمی‌شوند.
- Body درخواست به 64KB و Token به 16KB محدود شده است.
- Dynamic Table Name فقط از Allowlist داخلی انتخاب می‌شود.

## Schema و Migration

```text
0003_authentication.sql — users, teacher_applications, auth_revoked_tokens, audit_logs
0004_rate_limits.sql    — D1-backed baseline rate-limit buckets
```

هر دو Migration به‌صورت Local اعمال و Schema آن‌ها بررسی شده‌اند. داده Demo قبلی در `progress` و `quiz_attempts` backfill نشده و تا تصمیم مستقل نباید به User واقعی متصل شود.

## Policyهای Auth

```text
Student: OAuth/OIDC → trusted email_verified → active
Teacher: OAuth/OIDC → application → pending → Admin approve/reject
Master: Provider Invite + Admin provisioning → active
Admin: bootstrap/provider-controlled → active
```

Recovery حساب OAuth بر عهده upstream IdP است. Offline PWA فقط مطالعه محتوای Published از قبل دریافت‌شده را پشتیبانی می‌کند و Offline Auth/Mutation وجود ندارد.

## محدودیت‌ها و موارد NOT VERIFIED

- Clerk Instance، OAuth Connectionها، Session Template و MFA واقعی هنوز در Dashboard تنظیم نشده‌اند.
- `VITE_CLERK_PUBLISHABLE_KEY` و Worker Secretها هنوز در این محیط ثبت نشده‌اند.
- Remote D1 به‌دلیل Placeholder بودن `database_id` بررسی نشده است.
- CORS Production با Origin واقعی Verify نشده است.
- Browser E2E با OAuth Provider واقعی اجرا نشده است.
- Cloudflare WAF/Edge Rate Limit هنوز به‌عنوان لایه Production تنظیم نشده است؛ D1 Rate Limit فقط baseline است.
- CSP و تنظیمات نهایی Pages/Clerk باید پیش از Release اضافه و تست شوند.

## شروط پیش از Production

1. مقدار واقعی Remote `database_id` ثبت شود.
2. Migrationهای `0003` و `0004` با Backup و Validation روی Remote اعمال شوند.
3. Clerk OAuth Connections و Session Token Template با `email_verified` تنظیم شوند.
4. Worker Secretهای Clerk و `ALLOWED_ORIGIN` واقعی با Wrangler تنظیم شوند.
5. Bootstrap Admin یک بار اجرا و Secret آن بعد از Provisioning چرخانده/حذف شود.
6. Invite و MFA برای Staff فعال و در Browser واقعی تست شود.
7. Security Test برای Token، Role، Status، Logout، CSRF/XSS، Rate Limit و Race Condition اجرا شود.
8. Cloudflare WAF/Rate Limiting و Monitoring فعال شود.
9. Remote D1 integrity و Local/Remote schema parity تأیید شود.

تا تکمیل این موارد:

```text
Production Release: BLOCKED
Authentication Status: IMPLEMENTED LOCALLY / NOT PRODUCTION VERIFIED
```
