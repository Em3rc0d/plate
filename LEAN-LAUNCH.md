# Lean Launch — Vehicle Intelligence PE

## Fixed-cost policy

Launch with only:

- Vercel Free
- Supabase Free
- Yape/Plin manual
- Masitaprex as the only paid data provider

Keep disabled until justified by real usage:

- Resend
- PostHog
- Sentry
- OpenAI
- PlacApi
- ConsultaDatos
- Culqi/Izipay

## Product profile

`LAUNCH_PROFILE=REGISTRY_LEAN`

Commercial checkout requires:

- Supabase server access;
- vehicle identity capability;
- current registry-owner capability;
- at least one manual payment method;
- legal operator name + RUC;
- Book of Claims URL.

SOAT, CITV and fines are optional in this launch profile and must not be marketed as enabled unless a configured provider declares those capabilities.

Switch to `LAUNCH_PROFILE=FULL` only when registry + SOAT + CITV + fines are all backed by validated providers.

## Free-preview cost control

`PREVIEW_PROVIDER_MODE=NONE`

Anonymous visitors only normalize/validate the plate and see currently enabled coverage. No paid provider call is made before payment. Paid provider calls start only after manual payment approval.

## Current production Supabase

- Project: `vehicle-intelligence-pe`
- Ref: `ftupozoqqjhqllhjocyn`
- URL: `https://ftupozoqqjhqllhjocyn.supabase.co`
- Security Advisor after migrations: 0 findings
- Buckets `payment-proofs` and `report-pdfs`: private

Do not commit secret keys. `.env.production.template` intentionally contains placeholders for all secrets.
