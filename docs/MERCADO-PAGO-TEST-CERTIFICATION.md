# Mercado Pago TEST certification — PlacaClara

Date: 2026-09-27 (America/Lima). Branch: `feat/mercadopago-checkout-api`.
Baseline reviewed: `f8e2bbbd7f8248bfcdff5b48286cbeb8315a8f88`.

**Decision: NOT CERTIFIED. No LIVE activation or vehicle-provider execution is authorized.**

## Evidence and Yape investigation

The Vercel runtime log for the branch records a POST to `/v1/payments` returning
HTTP 400, `bad_request`, `Cannot infer Payment Method`, at 22:13:39 UTC. This is
an integration/creation failure, not the expected business rejection of a Yape
payment. It cannot satisfy the rejected-payment gate.

The official Yape Payments API page documents the existing SDK flow
`mp.yape({phoneNumber, otp}).create()` and the payload with `payment_method_id:
"yape"`, one installment, token, amount and payer email. The TEST section explicitly
requires the TEST credentials of the production account. It documents:

| Phone | OTP | Expected outcome/detail |
| --- | --- | --- |
| 111111111 | 123456 | approved |
| 111111113 | 123456 | cc_rejected_insufficient_amount |
| 111111117 | 123456 | cc_rejected_bad_filled_security_code |

The page's production-integration instructions must not be confused with its TEST
section. No evidence supports switching to LIVE to solve this TEST error.

Sources checked:
- https://www.mercadopago.com.pe/developers/es/docs/checkout-api-payments/integration-configuration/yape?scope=prod
- https://www.mercadopago.com.pe/developers/es/docs/checkout-api-payments/integration-test/make-test-purchase
- https://www.mercadopago.com.pe/developers/es/reference/online-payments/checkout-api/payment-methods/get

**Root cause remains unconfirmed.** The payload in the reviewed code matches the
documented shape. Token metadata, credential pairing and method availability in
the actual deployment have not yet been inspected. Prefix equality does not prove
that two credentials belong to one application. A card approval also does not prove
Yape availability. Do not add an inferred issuer, change endpoints, proxy the OTP,
or substitute a card token to hide the error.

## Changes prepared

- Every outbound vehicle-provider request now stops before fetch, retries, billing
  logs or analytics in TEST, including preview/admin/probe paths.
- Report generation stops before database changes or delivery in TEST.
- `VEHICLE_PROVIDER_EXECUTION_ENABLED=false` is the default independent kill switch.
  Even LIVE mode cannot enable providers alone. Keep it false throughout certification.
- Both Mercado Pago credential prefixes are checked against the configured mode.
- The payment API accepts only one installment. Yape cannot carry a card issuer override.
- Verified payment responses must match the expected method as well as account,
  amount, currency, external reference and environment.
- A replay of a deterministic failed creation preserves REJECTED. HTTP 408/409/429,
  transport errors and 5xx remain ambiguous and do not authorize automatic repost.
- DB update failures are checked instead of silently permitting another payment.
- Client refs synchronously prevent overlapping submissions, including Yape
  tokenization; unresolved attempts keep payment submission disabled.
- TEST Yape UI displays only mode, country, same-Public-Key boolean and Yape marker.
  It never displays/logs the token, phone or OTP. Inconsistent returned metadata
  prevents submitting the payment. Missing metadata remains explicitly unconfirmed.
- Provider error logs now include request ID and allowlisted cause codes, not tokens.
- Admin-only TEST-only GET `/api/admin/payments/mercado-pago/diagnostics` reads
  `/users/me` and `/v1/payment_methods`; it returns booleans and a public-key digest.
  It never creates a payment or calls vehicle providers. If either read fails,
  the result is inconclusive, not proof of bad credentials. It explicitly does not
  certify same-application pairing.
- New migration hardens the SQL state machine: TEST cannot mark an order PAID even
  with `p_mark_paid=true`; mode changes, terminal-state regressions and unknown
  status after approval are rejected. Existing stale-event handling is preserved.

The new migration has been tested locally but **has not been applied remotely**.
The existing migration was left intact.

## Gates

| Gate | Evidence now | Certification status |
| --- | --- | --- |
| 1. Yape TEST approved | Docs and error log verified; no successful new real payment | BLOCKED |
| 2. Signed webhook | Real verifier passes local valid/tampered/stale fixtures | Remote delivery and replay PENDING |
| 3. Idempotency/double click | Concurrent service fixtures post once; SQL same-key/active-order assertions pass | Browser + deployed DB concurrency PENDING |
| 4. Card rejection | Service rejection fixture passes | Actual MP TEST rejection PENDING |
| 5. Yape rejection | Service rejection fixture passes; official failure input identified | Actual MP TEST rejection PENDING |
| 6. Attempt state machine | SQL functions executed in isolated PostgreSQL/PGlite | Remote migration/verification PENDING |
| 7. provider_calls=0 | Zero network and DB calls in provider TEST guard fixtures | Actual DB baseline/window comparison PENDING |
| 8. Evaluate LIVE | All preceding gates must close with real evidence | BLOCKED |

The user's reported card approval remains user-supplied evidence, not independently
reproduced in this session. There were no Mercado Pago payment creations, no LIVE
changes and no Masitaprex calls from this work session.

## Reproducible offline verification

```sh
node --test tests/payment-safety.test.mjs
# Install @electric-sql/pglite in an isolated QA directory; no app dependency needed.
PGLITE_MODULE=/absolute/path/to/@electric-sql/pglite node --test tests/payment-sql.test.mjs
pnpm typecheck
```

20 JS contract/security tests plus one SQL integration test passed. The SQL test
creates isolated fixtures and runs the actual migration functions. It does not
represent a multi-connection production load test. Never execute the fixture SQL
against the production database.

## Required next evidence

1. Verify the exact deployment SHA and that `MERCADO_PAGO_LIVE_MODE=false` and
   `VEHICLE_PROVIDER_EXECUTION_ENABLED=false`. Apply the reviewed migration through
   the normal database migration process before remote state-machine testing.
2. With an authenticated admin session, read the diagnostics endpoint. In the
   Mercado Pago application dashboard confirm both TEST keys are from the same
   production account/application and the collector matches. Never paste keys here.
3. Generate a fresh Yape token through the SDK using the approved test fixture.
   Record the TEST metadata diagnostic and the resulting server request ID/cause
   codes. Token field `cardholder.name=yape` is a marker, not independent proof of
   method eligibility. Verify the method on the authoritative payment GET response.
4. Obtain real provider IDs for Yape approval, card rejection and Yape rejection;
   verify `live_mode=false`, amounts, method and persisted attempts.
5. Trigger a real Mercado Pago signed notification and replay it; verify one
   matching attempt and no fulfillment. Test a tampered signature yields 401.
6. Submit concurrent requests/double click in the browser; verify one provider
   payment and one logical active attempt. Never automatically repost an ambiguous
   result. A CREATING result may require explicit reconciliation/support.
7. Compare `provider_calls` counts before/after the exact test window, including
   calls with no order association. Retain the timestamps and query results.

The connected Supabase account did not list PlacaClara. The browser opened the
PlacaClara administrator login without an existing session. Those access gaps
prevented remote database evidence and authenticated diagnostics, not local fixes.

Production build and TypeScript check passed. ESLint has only two pre-existing
unused-variable warnings in the marketing homepage.
