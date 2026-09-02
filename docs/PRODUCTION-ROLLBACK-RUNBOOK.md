# Darolfonun — Production Rollback Runbook

**Phase:** 3.2 — Production Unlock Verification & Private Pilot Gate  
**Status:** `NOT VERIFIED` — operational owners, backup location and restore rehearsal are not provided  
**Rule:** Backup بدون Restore Verification مجوز Release نیست.

این Runbook یک طرح اجرایی کنترل‌شده است؛ تا زمانی که Owner، Resource و Restore Evidence واقعی ثبت نشود، قابل اعلام به‌عنوان Runbook عملیاتی نهایی نیست.

## 1. Scope

این Runbook برای این اجزا است:

- Cloudflare Pages Frontend
- Cloudflare Worker API
- Cloudflare D1
- Clerk Configuration
- PWA Cache/Version
- CORS، WAF و Rate Limit configuration

## 2. Required Owners

| Responsibility | Owner | Status |
|---|---|---|
| Release Owner | Not provided | `BLOCKED` |
| Security Owner | Not provided | `BLOCKED` |
| D1/Data Owner | Not provided | `BLOCKED` |
| Cloudflare Owner | Not provided | `BLOCKED` |
| Clerk Owner | Not provided | `BLOCKED` |
| Incident Communicator | Not provided | `BLOCKED` |

هیچ Ownerی در این سند حدس زده نشده است.

## 3. Pre-Change Gate

قبل از هر تغییر Remote یا Release باید این Evidenceها ثبت شوند:

1. Change ID و Timestamp
2. Purpose و محدوده تغییر
3. Impact و Risk
4. Backup Location و Backup ID
5. Backup Verification، شامل امکان خواندن و Restore Test
6. Migration/Deployment Version
7. Schema و Constraint Snapshot
8. Current Worker/Pages Version
9. Clerk Configuration Snapshot بدون Secret
10. Rollback Decision Owner
11. Smoke Test Plan
12. Communication Plan

## 4. D1 Backup and Restore

ترتیب الزامی:

```text
Freeze risky mutation
→ Create backup/snapshot
→ Verify backup artifact
→ Rehearse restore on isolated/staging target
→ Record schema and row/integrity checks
→ Apply change
→ Validate
```

برای D1 باید حداقل این موارد پس از Restore بررسی شوند:

- User count و Provider Subject uniqueness
- Role و Status validity
- Course/Lesson/Quiz relationships
- Progress ownership
- Revocation records
- Audit ordering و integrity
- Foreign keys و Unique constraints

Backup فعلی، Location، Retention و Restore Verification در دسترس نیست؛ بنابراین این بخش `BLOCKED` است.

## 5. Worker Rollback

در صورت خطای 5xx، Authentication، Authorization، D1 یا CORS پس از Deploy:

1. Incident را ثبت و Release را متوقف کن.
2. آخرین Worker Version سالم را شناسایی کن.
3. ابتدا روی Staging/Preview Rollback را بررسی کن.
4. Rollback Worker را با Cloudflare Version کنترل‌شده انجام بده.
5. Health، Public Read، Protected `401`، CORS و مسیرهای اصلی را تست کن.
6. لاگ‌ها را برای Secret، Token و PII بررسی کن.
7. تصمیم ادامه Pilot را فقط Release Owner و Security Owner صادر کنند.

## 6. Pages Rollback

در صورت شکست UI، OAuth Landing، API Base Path یا PWA:

1. Pages Deployment قبلی سالم را مشخص کن.
2. Preview/Stage را بررسی کن.
3. نسخه قبلی را Deploy/Activate کن.
4. Browser smoke روی `/api/*`، Login، Course، Lesson و Logout اجرا کن.
5. Service Worker version و Cache behavior را بررسی کن.
6. اگر نسخه جدید Cache ناسازگار دارد، Cache invalidation را به‌صورت کنترل‌شده اجرا کن.

## 7. D1 Migration Rollback

- Down Migration خودکار روی User یا Production Data بدون تأیید مجاز نیست.
- در تغییر Schema، ابتدا forward fix یا Restore تأییدشده بررسی شود.
- Migration باید Id، Timestamp و Result داشته باشد.
- در صورت ناسازگاری Schema، Writeهای حساس متوقف و وضعیت Data Integrity بررسی شود.
- هیچ Migration مخرب بدون Backup و Restore Verification اجرا نشود.

## 8. Clerk Rollback / Incident

در صورت شکست OAuth، JWT، MFA یا Claim:

1. Client Release و Staff onboarding را متوقف کن.
2. آخرین Configuration معتبر Clerk را شناسایی کن.
3. تغییرات Template/Connection/MFA را فقط از Dashboard رسمی و با Owner برگردان.
4. Tokenهای جدید، Issuer، Audience، Authorized Party و Key status را Verify کن.
5. Logout، Expiry، Revocation و Staff MFA را دوباره تست کن.
6. تا تکمیل تست، Pilot را `NO-GO` نگه دار.

## 9. PWA / Offline Safety

در Incident مربوط به Cache:

- Offline Transaction وجود ندارد و نباید فعال شود.
- محتوای Unpublished/Unauthorized/Deleted نباید در Cache باقی بماند.
- Snapshotهای خصوصی پس از Logout یا Account Switch نباید قابل استفاده باشند.
- اگر Revocation در Reconnect تأیید شد، داده مربوط باید Update یا Remove شود.
- Local State هرگز نباید Session یا Authorization بسازد.

## 10. Abort Conditions

Pilot یا Release باید متوقف شود اگر هر یک رخ دهد:

- Broken Authentication یا Authorization
- User data leakage
- Demo User/Production User collision
- Unverified یا corrupt backup
- D1 integrity failure
- Broken `/api/*` route
- Widespread 5xx/401/403/429 بدون توضیح
- Failed Staff MFA یا Suspend enforcement
- Offline mutation یا unauthorized cache
- Progress یا Quiz state نادرست

## 11. Recovery Verification Required

برای تبدیل وضعیت این سند از `NOT VERIFIED` به `PASS` باید این Evidenceها پیوست شوند:

- Backup artifact ID و timestamp
- Restore result روی target ایزوله
- D1 integrity query result
- Worker/Pages version result
- Smoke test result
- Owner approval
- Incident/rollback rehearsal result

## Runbook Decision

```text
Rollback Design: DEFINED
Backup Evidence: NOT VERIFIED
Restore Evidence: NOT VERIFIED
Operational Runbook: NOT VERIFIED
Private Pilot: NO-GO
```
