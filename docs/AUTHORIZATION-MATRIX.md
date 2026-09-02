# Darolfonun — Authorization Matrix

**Phase:** 3.2 — Production Unlock Verification & Private Pilot Gate  
**Policy:** Role/Status از Local State، URL، Header یا Request Client پذیرفته نمی‌شود.  
**Status:** Local policy implemented; real E2E `NOT VERIFIED`

## Approved Matrix

| Action | Student | Teacher | Master | Admin |
|---|---:|---:|---:|---:|
| Read Published Course | YES | YES | YES | YES |
| Read Published Lesson | YES | YES | YES | YES |
| Read Published Article/Library | YES | YES | YES | YES |
| Read Own Profile Snapshot | YES | YES | YES | YES |
| Read Own Progress | YES | YES | NO | NO |
| Submit Own Quiz Online | YES | YES | NO | NO |
| Request Teacher Role | YES | NO | NO | NO |
| Approve Teacher | NO | NO | NO | YES |
| Reject Teacher | NO | NO | NO | YES |
| Publish Content | NO | NO | YES | NO |
| Manage Course/Lesson/Quiz Content | NO | NO | YES | NO |
| Suspend User | NO | NO | NO | YES |
| Manage Identity/Security | NO | NO | NO | YES |
| Staff/Admin Mutation Offline | NO | NO | NO | NO |
| Exam/Quiz Submission Offline | NO | NO | NO | NO |
| Progress Mutation Offline | NO | NO | NO | NO |

در API فعلی، Progress و Quiz Submit فقط برای Student و Teacher فعالِ احراز‌شده تعریف شده‌اند؛ Master و Admin در این دو عملیات مجوز ندارند. در هر حال Role به‌تنهایی مالکیت ایجاد نمی‌کند و User فقط به داده خودش دسترسی دارد.

## Authorization Rules

1. **Authentication first:** Protected endpoints بدون Bearer معتبر باید `401` بدهند.
2. **Backend source:** Role و Status فقط از User Record معتبر D1 و Policy سمت Worker خوانده شوند.
3. **No client authority:** این منابع هرگز منبع Role یا Status نیستند:
   - LocalStorage
   - Query Parameter
   - URL
   - Header
   - Frontend State
   - Request Body
   - Identifier Suffix مانند `@sd` یا `@mt`
4. **Role/Status separation:** `role` و `status` مستقل هستند.
5. **Teacher lifecycle:** Teacher ابتدا `pending` است؛ Client نمی‌تواند آن را `active` کند.
6. **Staff boundary:** Master و Admin از مسیر عمومی Student یا Teacher ساخته نمی‌شوند.
7. **Ownership:** Progress، Quiz Attempt و Profile فقط برای User داخلی D1 همان Identity قابل دسترسی است.
8. **Content boundary:** Published بودن Course و Ancestorهای آن برای Public Content الزام است.
9. **Offline boundary:** Local Snapshot فقط Last Known Read-only State است و هیچ Authorization یا Mutation ایجاد نمی‌کند.
10. **Server wins:** در هر تعارض، D1/Backend بر Local State مقدم است.

## Status Transition Policy

```text
Student OAuth + trusted email_verified
  → student / active

Teacher Request
  → teacher / pending

Admin Approve
  → teacher / active

Admin Reject
  → teacher / rejected

Admin Suspend
  → existing role / suspended
```

Reject نباید Activation ایجاد کند. Suspend باید دسترسی Protected را پس از اعتبارسنجی بعدی قطع کند. Approval تکراری نباید Audit جعلی بسازد.

## Required Verification Matrix

| Scenario | Expected | Current Evidence | Phase 3.2 Status |
|---|---|---|---|
| Student reads Published Course | `200` | Local smoke | `NOT VERIFIED` for real route |
| Student reads another user Progress | `403` or policy denial | Ownership code path/local fixture | `NOT VERIFIED` in real E2E |
| Teacher pending uses Teacher action | Denied | Policy/code path | `NOT VERIFIED` in real E2E |
| Teacher cannot Approve Teacher | Denied | Role policy | `NOT VERIFIED` in real E2E |
| Master publishes Content | Allowed | Local implementation path | `NOT VERIFIED` in real E2E |
| Master suspends User | Denied | Role policy | `NOT VERIFIED` in real E2E |
| Admin approves pending Teacher | Allowed and one valid audit | Local approval path | `NOT VERIFIED` in real E2E |
| Forged Demo headers | Denied | Local `401 PASS`؛ این Evidence فقط Local است | `PASS` |
| Offline Progress mutation | No request / no server change | Design policy | `NOT VERIFIED` Browser |
| Offline Admin/Staff mutation | No request / no server change | Design policy | `NOT VERIFIED` Browser |

## Gate Decision

```text
Authorization Design: PASS
Authorization Local Enforcement: PASS
Authorization Real Environment / Browser E2E: NOT VERIFIED
Pilot Authorization Gate: NOT VERIFIED
```
