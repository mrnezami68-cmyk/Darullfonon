# SECURITY NOTES — دارالفنون

**فاز:** Phase 1 — Architecture  
**وضعیت:** Development only / Demo Role

## کنترل‌های فعلی

- هیچ Secret یا API Key در Frontend قرار ندارد.
- Header `X-Demo-Role: master` فقط در محیط Development پذیرفته می‌شود.
- عملیات Master در صورت نبود Role با `403 MASTER_ROLE_REQUIRED` رد می‌شود.
- Input JSON، ID، slug و status اعتبارسنجی می‌شوند.
- حجم Body به 64KB محدود است.
- نام Tableها از Allowlist داخلی انتخاب می‌شود و از ورودی کاربر نمی‌آید.
- خطای خام Database به Client بازگردانده نمی‌شود.
- حذف Master به Archive تبدیل شده و حذف فیزیکی انجام نمی‌شود.
- CORS از طریق `ALLOWED_ORIGIN` قابل محدودسازی است.
- محتوای حساس Self Assessment هنوز در API عمومی قرار نگرفته است.

## محدودیت‌های شناخته‌شده

- Demo Role احراز هویت یا Authorization واقعی نیست.
- Local Storage و D1 local برای Production چندکاربره کافی نیستند.
- Rate Limiting هنوز اضافه نشده است.
- Session، Password و Token هنوز طراحی نشده‌اند.

## شروط پیش از Production

1. انتخاب و تأیید روش Authentication.
2. اجرای Authorization سمت Worker بر اساس Session/Token معتبر.
3. تنظیم `ALLOWED_ORIGIN` روی Origin واقعی Pages.
4. تعریف Rate Limiting برای Endpointهای Write و Login.
5. بررسی لاگ‌ها برای حذف اطلاعات حساس.
6. ایجاد D1 Database واقعی و اعمال Migration روی Remote.
7. تست Security برای جعل Role، Input Boundary و Abuse.
8. عدم Deploy با `database_id = REPLACE_WITH_D1_DATABASE_ID`.

## تصمیم امنیتی

تا زمان تکمیل موارد بالا، وضعیت انتشار Production:

```text
BLOCKED
```
