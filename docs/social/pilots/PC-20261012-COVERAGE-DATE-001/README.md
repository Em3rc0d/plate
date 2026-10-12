# Primer piloto comercial PlacaClara — Fecha, fuente y cobertura
Fecha: 2026-10-12 | TikTok es-PE | Objetivo: COVERAGE_INTENT | Estado: **DRAFT / BLOCKED**.

## Mensaje
Hook: «Te mostraron un dato. ¿De qué fecha es?»
Trabajo editorial: pasar de una preocupación real sobre procedencia y actualidad documental a una consulta de cobertura antes de comprar un reporte.
Un solo CTA: «Consulta la placa y revisa la cobertura disponible en placaclara.com».
KPI candidato: plate_submitted, T+24h; atribución por post UNKNOWN.

## Entregables generados
- Póster 1080×1920 de calidad visual premium: archivo `placaclara_fecha_fuente_cobertura_tiktok_1080x1920.png`.
- Hash de PNG aprobado para cotejo: `ff1b7f89d6358485ac7a8cc9c2e54ccd786bb3c0cf19c0640617c5354c6731db`.
- Base generada con IA, tipografía/CTA deterministas, isotipo exactamente derivado de `public/placaclara-mark.svg`.
- Caption/alt text/JSON están en `package.json` (caption es campo `copy.caption`).
- **El binario PNG no se almacenó en GitHub.** El archivo fuente y render quedaron en el ZIP de la conversación. No confundir este expediente con alojamiento de imagen ni con media receipt externo.

## Evidencia comprobada
- Ref code: `src/config/product.ts`, `components/marketing/coverage-list.tsx`, `components/marketing/plate-form.tsx`, `app/(marketing)/page.tsx`. Lo observado es el diseño del flujo y su semántica, no un resultado real para una placa.
- Vercel: el despliegue del dominio se reporta READY; no se inspeccionaron secretos ni se comprobó un snapshot de capacidades/precio/live readiness.
- Preview local 270×480 y overlay de zonas conservadoras x60..910, y260..1420. TikTok Studio aún no inspeccionado.
- Antirrep: revisados los ejemplos visuales aportados por el usuario; el tema sobre FECHA/SOURCE se diferencia de estética, vínculo con vendedor, kilometraje, notaría y precio. NO se auditó todo published/scheduled/planned/approved de las cuentas.

## Gates
- G0 identidad, job y CTA: PASS declarativo.
- G1 claim factual basado en repo: PASS para las dos referencias técnicas; no es verificación del despliegue comercial real.
- G2 precio/cobertura: PENDING (snapshot runtime no verificado).
- G3 novedad: REVIEW_REQUIRED (cola externa/historial incompletos).
- G4 diseño: PENDING aprobación del propietario.
- G5 diseño geométrico interno: preliminar; safe-zone oficial y QA de TikTok Studio PENDING.
- G6 legal/derechos: PENDING; ilustración rotulada y sin datos de cliente.
- G7 KPI: ELEGIDO, pero ventas/post sin atribución.
- G8 owner receipt: ausente.
- G9 scheduled/published: no existe receipt; no afirmar estados externos.

## Gate automático ejecutado
Se ejecutó la lógica real de `docs/social/preflight.mjs` extraída del repositorio contra el objeto equivalente a `package.json` en V8: estado esperado `BLOCKED`, sin errores de estructura, y con bloqueos por snapshot productivo, novelty, diseño y demás recibos pendientes.

La prueba NO convierte los asserts declarados en verificación independiente. No se envió contenido a TikTok, no se activaron APIs de pago ni se realizaron consultas vehiculares.

## Siguiente decisión
Revisar pieza en el dispositivo / TikTok Studio, asegurar brand y legal, obtener captura read-only de enabledCapabilities() / commercialReadiness() / precio efectivo, verificar toda la cola editorial y recibir aprobación final. Sólo entonces elevar el estado mediante un nuevo commit y, por separado, programar manualmente con provider receipt.
