# Customer PDF dossier v2

Scope: customer PDF only, on feat/mercadopago-checkout-api. The supplied customer brief is the design authority. The Mi Torito reference informs hierarchy and tables only; its claims, score and source data are not imported.

- Navy, warm ivory, restrained teal; embedded DejaVu Sans with its redistribution license.
- Vehicle cover; evidence summary and identity grid; registry and every current/historical owner; complete SOAT and CITV tables; fines and coverage; meaningful findings; sources, legal notice and existing authenticity route.
- No per-field VERIFIED labels, internal paths, raw timestamps or prominent UUIDs.
- Source/time appears per block, deduplicated without discarding distinct sources or consultation times.
- Partial data remains visible even if its evidence status is unavailable. Conflict alternatives remain visible. Empty, unavailable and unintegrated sources have different wording. Default zero fine counts are suppressed for unavailable queries.
- All canonical certificate fields, owner fields, restrictions and fines are retained. A historical owner row is not represented as proof of a transfer. No risk score or purchase verdict.
- Known generated findings are suppressed only where their exact message duplicates the coverage/exception blocks. Other findings are retained and exact duplicates removed.
- PDF cache filename includes dossier-v2. Next download regenerates the old layout using stored canonical data; no provider call is made. Previous paths remain tracked by the existing retention mechanism.
- The verification link uses the existing share/public code and configured site origin. No new verification mechanism or QR service is introduced.

## Verification

Run `pnpm exec tsc --noEmit` and `node --test tests/pdf-document.test.mjs` (Poppler/pdftotext required).
Set `PDF_PREVIEW_DIR=/absolute/path` to retain the synthetic PDFs for visual inspection.

Four offline scenarios cover complete data, 34 certificates, conflict/partial data, and unavailable consultations. Tests check preservation, leading zeros, absence of internal metadata, report-ID placement, footers and orphan pages. Render the resulting PDFs with pdftoppm and inspect all pages. The sample uses fictional identities and policy numbers, not a real AKE473 consultation.

Do not add a numeric inherited lineHeight to the page: the pinned renderer recalculates it during pagination. Local font assets are included in Next.js output tracing for the server runtime.

No paid data-provider execution, payment change or live consultation is part of this redesign. Live deployment and a real stored-report download remain production validation steps.
