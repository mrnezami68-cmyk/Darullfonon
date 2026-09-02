# Darolfonun — Private Pilot Readiness

**Phase:** 3.2 — Production Unlock Verification & Private Pilot Gate  
**Policy:** Offline Learning & Online Transaction Policy v1.0 — Governing  
**Decision:** `NO-GO`  
**Architecture:** `FROZEN`  
**Feature Expansion:** `FROZEN`  
**UI/UX Foundation:** `ALLOWED IN PARALLEL`

## Executive Decision

دارالفنون برای ورود به Private Pilot هنوز آماده نیست.

این تصمیم به‌دلیل شکست Implementation محلی نیست؛ دلیل آن نبود Evidence واقعی برای Environment، Clerk، Remote D1، مسیر Production، Browser/Mobile، WAF، Monitoring و Recovery است.

```text
Local Implementation: PASS
Local Security Boundary: PASS
Offline Policy: PASS — policy approved
Offline Implementation: NOT VERIFIED / partial against new policy
Production Unlock: BLOCKED
Private Pilot: NO-GO
Phase 4: BLOCKED
```

## Non-Negotiable Pilot Conditions

Private Pilot فقط در صورت تحقق همه موارد زیر مجاز است:

1. Real Clerk OAuth و JWT با Evidence معتبر.
2. Email Verification و Session واقعی.
3. Staff Invite-only و MFA اجباری.
4. Role/Status/Ownership در مسیر واقعی Browser اثبات‌شده.
5. Remote D1 Backup و Restore Verification.
6. Migration و Schema/Constraint/Data Integrity موفق.
7. Pages → `/api/*` → Worker → D1 در Browser اثبات‌شده.
8. Production CORS با Origin دقیق و بدون `*` برای مسیر Authenticated.
9. Student Critical Journey با Progress واقعی و Next Step واقعی.
10. Teacher Approval/Reject و Admin Security واقعی.
11. Mobile/PWA Critical Journey.
12. Offline Published Content و Snapshotهای مجاز با Last Sync.
13. عدم وجود Offline Auth، Exam، Progress Mutation یا Staff Mutation.
14. WAF و Edge Rate Limit برای Abuse Surfaceهای اصلی.
15. Monitoring برای 401/403/429/5xx و خطاهای Worker/D1/OAuth.
16. Rollback و Restore واقعاً تمرین‌شده.
17. Concurrency و Content Integrity بدون Failure بحرانی.
18. Final Regression با Artifact معتبر.

## Current Blockers

### P0 — Release Blockers

- Environment Inventory و Owner واقعی موجود نیست.
- Clerk واقعی و Staff Invite/MFA قابل Verify نیست.
- Remote D1 و `database_id` واقعی موجود نیست.
- مسیر واقعی API و CORS Production اثبات نشده.
- Backup/Restore و Recovery Evidence وجود ندارد.
- WAF/Edge و Monitoring واقعی در دسترس نیست.
- Browser OAuth و Student Critical Journey اجرا نشده.
- Authentication/Authorization/Ownership Production قابل اثبات نیست.

### P1 — Must Fix Before Pilot

- Offline Profile Snapshot
- Offline Progress Snapshot
- Learning Path Snapshot
- Last Sync و Sync Failed UX
- Revision-based content sync
- Logout و Account Switch cleanup
- Revocation cleanup after reconnect
- Mobile/PWA Offline E2E
- Concurrency evidence
- Product Integrity evidence برای Dashboard/Progress/Next Step
- CSP و operational key rotation decision، در صورت لازم‌بودن برای Provider واقعی

### P2 — Record, Do Not Expand Now

- Dashboardهای Static غیرضروری
- تکمیل Analytics
- بهبودهای فرعی UX
- تست خودکار گسترده‌تر پس از تثبیت Environment
- مدل‌های پیچیده‌تر Progress

### P3 — Future Phase

- Offline Exam
- Offline Mutation Queue
- Social Features
- Certificate System
- Search گسترده
- Microservice/Queue/Redis
- AI Product Feature

## Pilot Scope Recommendation

Pilot باید محدود، دعوتی و قابل کنترل باشد:

- فقط کاربران شناخته‌شده و Allow-listed
- محتوای Published و بازبینی‌شده
- Student مسیر کامل واقعی Learning را تجربه کند
- Staff فقط Invite-only و MFA
- هیچ مسیر Demo یا Header جعلی برای Authorization
- هیچ Feature جدید خارج از هدف یادگیری اضافه نشود
- Support و Incident Owner مشخص باشد
- امکان Suspend و Rollback آماده باشد

محدود بودن Pilot نباید باعث تخفیف در Authentication، Authorization، Ownership، Backup یا Data Integrity شود.

## Product Success Criteria

کاربر باید بدون سردرگمی بتواند تشخیص دهد:

- اکنون در کجای Learning Path است.
- Course و Lesson بعدی چیست.
- چه چیزی را واقعاً تمام کرده است.
- آیا Progress در Server ثبت شده است.
- آخرین Sync چه زمانی انجام شده است.
- در Offline کدام قابلیت‌ها فقط Read-only هستند.

Mock Data برای طراحی UI مجاز است، اما Fake Product State برای User واقعی ممنوع است.

## Entry Decision

```text
GO: Not authorized
NO-GO: APPROVED
Next Action: P0/P1 Production Unlock Audit
Architecture Change Request: None at this stage
Coding: Only after a real P0/P1 blocker is evidenced
```
