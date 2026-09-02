# Darolfonun — Private Pilot Readiness

**Phase:** 3.2 — Product-First Production Readiness Audit v2.0
**Policy:** Offline Learning & Online Transaction Policy v1.0 — Governing
**Decision:** `NO-GO`  
**Architecture:** `FROZEN`  
**Feature Expansion:** `FROZEN`  
**UI/UX Foundation:** `ALLOWED IN PARALLEL`

## Executive Decision

دارالفنون برای ورود به Private Pilot هنوز آماده نیست.

این تصمیم دو دلیل مستقل دارد: یک P0 واقعی در Product Core UI/Data Integrity، و نبود Evidence واقعی برای Environment، Clerk، Remote D1، مسیر Production، Browser/Mobile، WAF، Monitoring و Recovery.

```text
Local Implementation: PASS
Product Core UI/Data Integrity: FAIL
Local Security Boundary: PASS
Offline Policy: PASS — policy approved
Offline Core Implementation: NOT VERIFIED
Offline Personal Snapshot: NOT VERIFIED / P1
Production Unlock: BLOCKED
Private Pilot: NO-GO
Phase 3.2: BLOCKED with recorded Product Core FAIL
Phase 4: BLOCKED
```

## Non-Negotiable Pilot Conditions

Private Pilot فقط در صورت تحقق همه موارد زیر مجاز است:

1. Real Clerk OAuth و JWT با Evidence معتبر.
2. Email Verification و Session واقعی.
3. Role/Status/Ownership در مسیر واقعی Browser اثبات‌شده.
4. Remote D1 Backup و Restore Verification.
5. اگر Staff در Pilot حضور دارد: Invite-only و MFA اجباری؛ در غیر این صورت این مورد به Post-Pilot منتقل شود.
6. Migration و Schema/Constraint/Data Integrity موفق.
7. Pages → `/api/*` → Worker → D1 در Browser اثبات‌شده.
8. Production CORS با Origin دقیق و بدون `*` برای مسیر Authenticated.
9. Student Critical Journey با Progress واقعی و Next Step واقعی.
10. اگر Staff در Pilot حضور دارد: Teacher Approval/Reject و Admin Security واقعی؛ در غیر این صورت Post-Pilot.
11. Mobile/PWA Critical Journey.
12. Offline Published Content و Offline Reading با Evidence معتبر؛ Personal Snapshotها باید یا Verify شوند یا Gap آن‌ها صریحاً در تصمیم Pilot ثبت شود.
13. عدم وجود Offline Auth، Exam، Progress Mutation یا Staff Mutation.
14. WAF و Edge Rate Limit برای Abuse Surfaceهای اصلی.
15. Monitoring برای 401/403/429/5xx و خطاهای Worker/D1/OAuth.
16. Rollback و Restore واقعاً تمرین‌شده.
17. Concurrency و Content Integrity بدون Failure بحرانی.
18. Final Regression با Artifact معتبر.

## Current Blockers

### P0 — Release Blockers

- Product Core UI چند State ثابت یا Mock دارد: Dashboard، Learning Path، Course/Chapter، Result، Progress و Next Step.
- Environment Inventory و Owner واقعی موجود نیست.
- Clerk واقعی و Student Authentication قابل Verify نیست.
- Remote D1 و `database_id` واقعی موجود نیست.
- مسیر واقعی API و CORS Production اثبات نشده.
- Backup/Restore و Recovery Evidence وجود ندارد.
- Browser OAuth و Student Critical Journey اجرا نشده.
- Authentication/Authorization/Ownership Production قابل اثبات نیست.
- اگر Staff در Pilot حضور داشته باشد، Staff Invite/MFA و Suspend/Revoke نیز P0 هستند.

### P1 — Must Fix Before Pilot

- Offline Core Browser E2E برای Published Learning Content
- Offline Profile Snapshot
- Offline Progress Snapshot
- Learning Path Snapshot
- Last Sync و Sync Failed UX
- Revision-based content sync
- Logout و Account Switch cleanup
- Revocation cleanup after reconnect
- Mobile/PWA E2E
- Concurrency evidence
- Basic WAF و Minimum Monitoring
- CSP و operational key rotation decision، در صورت لازم‌بودن برای Provider واقعی

Personal Offline Snapshotها نباید مانع ادامه Product Core work شوند، اما پیش از Pilot باید Status شفاف و Evidence معتبر داشته باشند.

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
