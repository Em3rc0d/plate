# Primer piloto comercial PlacaClara — Fecha, fuente y cobertura
Fecha: 2026-10-12 | TikTok es-PE | Objetivo: COVERAGE_INTENT | Estado: **DRAFT / BLOCKED**.

## Mensaje
Hook: «Te mostraron un dato. ¿De qué fecha es?»
Trabajo editorial: pasar de una preocupación real sobre procedencia y actualidad documental a una consulta de cobertura antes de comprar un reporte.
Un solo CTA: «Consulta la placa y revisa la cobertura disponible en placaclara.com».
KPI candidato: plate_submitted, T+24h; atribución por post UNKNOWN.

## Entregables generados
- Arte actualizado tras feedback visual: `consulta_la_placa_antes_de_comprar.png`, **941×1672 (aprox. 9:16)**. La versión final normalizada a 1080×1920 y las zonas seguras aún deben certificarse.
- SHA-256 del PNG más reciente: `01e919fa77f437db7b6c01c2b48077495c370db89a70d16505e739360516ea73`. Este hash identifica un render, NO una autorización de publicación.
- Arte final de esta iteración generado con IA. **Texto y logo incrustados requieren cotejo/recomposición determinista con `public/placaclara-mark.svg`**; no afirmar correspondencia exacta de marca hasta hacerlo.
- Caption/alt text/JSON están en `package.json` (caption es campo `copy.caption`).
- **El binario PNG no se almacenó en GitHub.** El archivo fuente y render quedaron en el ZIP de la conversación. No confundir este expediente con alojamiento de imagen ni con media receipt externo.

## Evidencia comprobada
- Ref code: `src/config/product.ts`, `components/marketing/coverage-list.tsx`, `components/marketing/plate-form.tsx`, `app/(marketing)/page.tsx`. Lo observado es el diseño del flujo y su semántica, no un resultado real para una placa.
- Vercel: el despliegue del dominio se reporta READY; no se inspeccionaron secretos ni se comprobó un snapshot de capacidades/precio/live readiness.
- El preview 270×480 y overlay anteriores pertenecen a un asset distinto: **no aplican a este nuevo SHA**. La nueva pieza tiene dimensiones 941×1672; debe revisarse sobre interfaz real de TikTok, con las áreas seguras reescaladas y especial atención al CTA inferior. TikTok Studio no inspeccionado.
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

## Feedback visual del propietario (2026-10-12)
El propietario pidió evitar uncanny valley y posteriormente respondió **«Me gusta mucho!»** a la iteración gráfica `consulta_la_placa_antes_de_comprar.png`. Esto constituye **aceptación cualitativa de la dirección creativa** (escena natural, composición premium, hook y CTA claros), pero **no certifica exactitud del logo, píxeles finales, zonas seguras, derechos, historial o precio/cobertura**. Por tanto no se transforma `gates.design` ni `gates.owner` en PASS. El gate comercial/novelty, revisión final móvil y decisión de scheduling permanecen bloqueados. No publicar ni marcar Scheduled sin receipts externos.
