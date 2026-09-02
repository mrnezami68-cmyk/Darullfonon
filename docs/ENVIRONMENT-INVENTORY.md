# Darolfonun — Environment Inventory

**Phase:** 3.2 — Production Unlock Verification & Private Pilot Gate  
**Policy:** Offline Learning & Online Transaction Policy v1.0 — `APPROVED / GOVERNING POLICY`  
**Date:** ۱۴۰۵/۰۶/۱۱  
**Branch:** `arena/01a05d5b-darullfonon`  
**Release Baseline:** `3f29338`  
**Inventory Status:** `BLOCKED` — real Environment ownership and Provider access are not available

این سند فقط Inventory و وضعیت Evidence را ثبت می‌کند. هیچ Secret، Token، Private Key یا مقدار حساس در آن ثبت نمی‌شود.

## Status Legend

- `PASS`: مقدار و Evidence واقعی بررسی شده است.
- `NOT VERIFIED`: اطلاعات کافی برای قضاوت وجود ندارد.
- `BLOCKED`: اجرای بررسی به‌دلیل نبود Environment، Credential، Access یا Dependency ممکن نیست.
- `FAIL`: تست اجرا شده و نتیجه مورد انتظار رخ نداده است.

## Inventory

| Environment / Resource | Name / Value Known Without Secrets | Purpose | Owner | Data Classification | Provider | Status | Evidence / Gap |
|---|---|---|---|---|---|---|---|
| Development Frontend | Vite development app | UI development | Not provided | Local/demo data | Vite | `PASS` for local existence | Repository and local build available |
| Development API | Local Wrangler Worker | API and Auth boundary testing | Not provided | Local/demo data | Cloudflare Wrangler local | `PASS` for local existence | Local Worker smoke completed |
| Development D1 | `darullfonon` local binding | Local schema and functional testing | Not provided | Seed/demo data | Cloudflare D1 local | `PASS` for local existence | Migrations `0003` and `0004` applied locally |
| Staging Frontend | Not provided | Private integration testing | Not provided | Must be non-production | Cloudflare Pages | `BLOCKED` | Pages Project and URL unavailable |
| Staging API | Not provided | Real Clerk/D1 integration testing | Not provided | Must be non-production | Cloudflare Worker | `BLOCKED` | Worker name, URL and access unavailable |
| Staging D1 | Not provided | Remote schema and data testing | Not provided | Staging user/content data | Cloudflare D1 | `BLOCKED` | Database ID and Cloudflare access unavailable |
| Production Frontend | Not provided | Pilot/production UI | Not provided | Production user data | Cloudflare Pages | `BLOCKED` | Project, domain and owner unavailable |
| Production API | Not provided | Production API | Not provided | Production user data | Cloudflare Worker | `BLOCKED` | Deployment and route unavailable |
| Production D1 | `database_id` remains placeholder | Production source of truth | Not provided | Production user/content data | Cloudflare D1 | `BLOCKED` | Remote database is not configured |
| Clerk Development | Not provided | Local/Dev identity testing | Not provided | Identity data | Clerk | `NOT VERIFIED` | No real Clerk Instance evidence |
| Clerk Staging | Not provided | Real OAuth and staff POC | Not provided | Staging identity data | Clerk | `BLOCKED` | Instance, test accounts and Dashboard access unavailable |
| Clerk Production | Not provided | Pilot identity | Not provided | Production identity data | Clerk | `BLOCKED` | Instance, configuration and owner unavailable |
| Pages Origin | Not provided | Browser origin and CORS source | Not provided | Public origin | Cloudflare Pages | `NOT VERIFIED` | `https://app.example.com` was only a local JWT fixture value, not a production assertion |
| API Route | Frontend uses relative `/api` | Browser → Worker route | Not provided | Request path | Pages/Worker | `NOT VERIFIED` | Real Pages → `/api/*` → Worker route not proven |
| Worker Variables | Names documented; values unavailable | Runtime configuration | Not provided | Configuration | Wrangler | `NOT VERIFIED` | No production inventory or deployment evidence |
| Worker Secrets | Names documented; values unavailable | JWT and bootstrap configuration | Not provided | Secret | Wrangler Secret Store | `BLOCKED` | Secrets must be configured through the provider, never pasted into chat or Git |
| WAF / Edge Rules | Not provided | Abuse and edge protection | Not provided | Security configuration | Cloudflare | `BLOCKED` | Zone and rule access unavailable |
| Monitoring | Health endpoint exists locally | Error and operational visibility | Not provided | Operational telemetry | Cloudflare / selected logging | `NOT VERIFIED` | Alerts, retention and dashboards not supplied |
| Backup Location | Not provided | D1 backup and restore | Not provided | Production data | Cloudflare / approved storage | `BLOCKED` | No backup or restore evidence |

## Known Configuration Names

The repository documents the following configuration names. Their values are intentionally not copied here:

- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_CLERK_JWT_TEMPLATE`
- `CLERK_JWT_KEY`
- `CLERK_JWT_ISSUER`
- `CLERK_JWT_AUDIENCE` (optional when the real template uses it)
- `CLERK_AUTHORIZED_PARTIES`
- `ALLOWED_ORIGIN`
- `BOOTSTRAP_ADMIN_PROVIDER_SUBJECT`
- `ENVIRONMENT`
- D1 `database_id`

Production Preflight was executed without printing values and correctly returned `BLOCKED` because the real Environment and D1 configuration are absent.

## Required Inputs Before Unlock

1. Confirm Environment names and owners for Development, Staging and Production.
2. Provide Cloudflare access through the approved connection; do not paste tokens in chat.
3. Provide non-secret Pages Project, Worker, D1 and Domain identifiers.
4. Create or identify Clerk Staging and Production Environments.
5. Create test accounts for Student, Teacher, Master and Admin without recording credentials in this document.
6. Define Pages Origin, API route and OAuth redirect/origin allow-list.
7. Define Backup, Restore and Rollback owners.

## Gate Decision

```text
Environment Inventory: BLOCKED
Production Unlock: BLOCKED
Reason: real Environment ownership, Cloudflare resources and Clerk resources are not evidenced.
```
