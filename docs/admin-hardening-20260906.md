# Admin hardening — phase 1

Production permission migration applied 2026-09-06 UTC (2026-09-05 Chile).
No booking/payment/price rows updated. Migration version matches the server ledger.

## Delivered

- Financial movements and booking-service relations are server-only; anonymous and ordinary authenticated direct access revoked.
- Users can read their own allowlist row; only superadmin can manage other entries. Self-demotion/deletion restricted.
- Narrow private role lookup, fixed search_path, no user_metadata trust, checks verified real Auth user.
- Browser access logs require matching identity; server financial event types cannot be inserted by a browser.
- Explicit allowlist in application; no corporate-domain bypass. Password management endpoint requires superadmin.
- Recovery route no longer blocked by the admin layout.
- Financial server service no longer falls back to an anonymous client.
- Analytics endpoint requires admin; uses existing server credentials, read-only scope, no uploads or new conversions.
- Load failures shown explicitly; failed analytics charts hidden rather than rendered as zero.

## Evidence

PostgreSQL 17 isolated container, network disabled, synthetic fixture: anonymous denial, outsider denial, viewer non-escalation, legitimate superadmin CRUD, self-protection, audit identity restrictions and service-role finance/extras passed.
Real DB read-only checks after migration: anon financial/extras SELECT denied; superadmin sees both allowlisted accounts; viewer sees only own entry.
Home/disponibilidad/login/public price continue HTTP 200. Protected bookings API returns 401 without session. Public service agenda requires dates (400 without them, by design).
Existing server Google credentials successfully read a GA4 sessions report (HTTP 200). This test only reads analytics.
TypeScript and production build passed. No charged test or external notification was triggered.

## Reproduce SQL tests (disposable database ONLY)

Start official postgres:17-alpine without published ports, with `--network none` and `POSTGRES_HOST_AUTH_METHOD=trust` for local-only disposable test data. Do not use that authentication setting on production.

Run with psql `-v ON_ERROR_STOP=1`:
1. `tests/security/fixture.sql`
2. `supabase/migrations/20260906004112_harden_admin_data_access.sql` with `--single-transaction`
3. `tests/security/permissions.sql`

`npm test` runs the pure application permission tests (Node 24).

## Rollback and safe maintenance

Permission definitions/grants captured before migration in local ignored `.vercel/permissions-before.json`; NOT a data backup. Migration changes only policy/privileges and is transactional, with bounded locks/timeouts. Recovery superadmin checked before applying.
Previous app code remains compatible with these DB policies. Roll back application independently if needed; do not reopen anonymous access to resolve failures. Diagnose the authorized route and service-role configuration instead.
Do not reapply this migration on production: it is already in migration history. Other historical local/server migration discrepancies were not bulk-repaired.

## Not yet complete

Atomic/idempotent manual payments and extras, Webpay recovery and binding validation, historical reconciliation, offline CSV eligibility/outbox reconnection, complete RLS/view/storage review, backup restore drill and mobile acceptance coverage. This delivery is not a certification that the whole system is finished.
Do not automatically edit historical totals or dates, trigger charged transactions, send offline conversions, or broaden preview credentials.

## Next suggested feature

Internal exception inbox: approved payment awaiting registration, pending balance, failed notification/sync. Each item should explain the safe next action. No extra forms or steps for the guest. Define and test the underlying payment state machine first.
