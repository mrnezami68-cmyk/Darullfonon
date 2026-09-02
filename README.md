# دارالفنون

دارالفنون یک PWA فارسی و RTL برای آموزش اقتصاد، بازارهای مالی، دانشنامه، کتابخانه و خودارزیابی است.

## وضعیت

- Complexity: L1 — Simple
- Phase: Phase 2 — API Integration (Approved with warnings for Local Development)
- Next stage: Phase 3 — Production Security / Authentication (not started)
- Frontend: React + Vite
- API: Cloudflare Worker
- Database: Cloudflare D1
- Authentication: Demo Role در Development
- Offline: فعلاً غیرفعال

## اجرا

```bash
npm install
npm run dev
```

Frontend روی پورت `5173` اجرا می‌شود.

## Worker و D1 محلی

```bash
npm run worker:db:local
npm run worker:dev -- --local --port 8787
```

Health check:

```bash
curl http://127.0.0.1:8787/api/health
```

برای Endpointهای Master در Development، Header زیر لازم است:

```text
X-Demo-Role: master
```

## تست و Build

```bash
npm run build
npm run worker:typecheck
```

## اسناد

- `docs/PRODUCT_SPEC.md` — Product Spec و Scope
- `docs/ARCHITECTURE.md` — معماری L1 و Deployment
- `docs/API_SPEC.md` — قرارداد API
- `docs/SECURITY_NOTES.md` — کنترل‌ها و شروط Production
- `docs/FINAL_AUDIT.md` — صورت‌جلسه ممیزی Vertical Slice
- `docs/darullfonon-mvp-execution-prompt-v1.0.md` — پرامپت اجرایی MVP
- `docs/PHASE_ROADMAP_AND_EXECUTION_REVIEW.md` — وضعیت فازها، نقشه راه و چارچوب جلسه تصمیم‌گیری

## هشدار Production

`wrangler.toml` عمداً شامل Placeholder برای `database_id` است. پیش از Deployment باید Database واقعی ساخته شود، مقدار واقعی ثبت شود و Migration روی Remote اعمال گردد.
