# PlacaClara — Contrato editorial social v1.0
Fecha de decisión: 2026-10-12 (America/Lima).
Estado: ACTIVE_FOR_DRAFTING_ONLY. Contrato versionado de marketing/social; NO cambia producto, tarifas, proveedores, flujos de pago ni publicación.

## Jerarquía de autoridad
Este contrato es SUBORDINADO a la verdad ejecutable de plate:
1. Capacidades reales: src/config/providers.ts mediante enabledCapabilities() + src/config/commercial.ts / commercialReadiness() en el entorno objetivo. Configuración presente NO garantiza respuesta de proveedor.
2. Precio y modo de lanzamiento del despliegue: src/config/env.ts / REPORT_PRICE_PEN + LAUNCH_PROFILE, mediante captura aprobada del entorno (no copiar valores supuestos ni secretos).
3. Semántica y límites: src/config/product.ts / legalNotice, components/marketing/coverage-list.tsx, src/reports/* y PROVIDERS.md.
4. Analítica y privacidad: src/analytics/index.ts, app/admin/analytics/page.tsx, disposiciones legales de la web.
5. Diseño del PRODUCTO: DESIGN.md; identidad visual social propia, verificable y subordinada a marca/claims. Si un artefacto anterior de marketing contradice lo anterior, no hereda autoridad.

Orden de resolución documental de docs/README.md: código+migraciones > entorno real > documentos canónicos > checklists > histórico. Las capturas/fotos previas son referencias visuales, no pruebas de cobertura.

## Promesa pública y audiencia
Promesa: ayudar a una persona en Perú que evalúa un auto usado a ver, antes de pagar por el auto, la información DOCUMENTAL que las fuentes habilitadas efectivamente devuelven, junto a origen, fecha, estados y limitaciones. PlacaClara ofrece consolidación documental, NO garantía de compra segura, diagnóstico mecánico, historial universal, certificación registral, afiliación estatal o predicción de riesgo.

Audiencia: compradores de autos usados que desean decidir con información relevante, no simplemente quienes consumen contenido de autos. Ninguna persona ilustrada puede presentarse como cliente real sin prueba y permiso.

## Jobs contractuales de contenido (un objetivo principal por pieza)
| Role JSON | Promesa entregable | Primary action permitida | Métrica orientativa |
|---|---|---|---|
| DISCOVERY | Identificar una confusión comprobable de compra de usado | LEARN, SAVE | guardados o visitas al perfil relevantes |
| EDUCATION | Enseñar la diferencia entre estado, cobertura, fecha, fuente y resultado | SAVE, SHARE | guardados/compartidos |
| TRUST | Mostrar funcionamiento y limitaciones reales sin falsear resultados | VIEW_SCOPE, VIEW_SAMPLE | sesiones cualificadas y vistas de cobertura |
| COVERAGE_INTENT | Pasar de una duda documental a comprobar cobertura para una placa | CHECK_COVERAGE | plate_submitted / preview_success |
| PURCHASE_INTENT | Decidir sobre un pago único informado después de revisar el alcance | CHECK_COVERAGE | checkout_started / payment_approved |

Los CTA se eligen por job, NUNCA para inflar comments/follows de forma arbitraria. Puede invitarse a preguntas útiles cuando sean proporcionales al tema, pero no como segundo objetivo encubierto ni como “comenta X y te envío Y” sin servicio real. La curiosidad debe surgir de una consecuencia o decisión real, no de urgencia falsa.

## Regla de hook + delivery
1. Promesa legible en 1–2 segundos cuando el medio lo permita; veracidad sobre intensidad. No “auto perfecto”, “comprobado sin accidentes”, “conoce TODO con una placa”, “sabes que no te estafarán”, ni cifras creadas.
2. El subhook plantea el conflicto documental: apariencia/relación personal versus evidencia; “sin registros” versus “no disponible”; matrícula versus cobertura; SOAT vs revisión física. No repetir estos ángulos sin novedad material.
3. La escena protagonista hace visible la decisión; el cuerpo entrega un hecho/fuente/límite o una demostración claramente etiquetada. No inventar respuestas del proveedor ni pantallas de “check verde” como si fueran reales.
4. Un cierre accionable proporcional al objetivo: “revisa cobertura antes de pagar”, “compara fuentes/fecha”, “guarda esta lista”. Nunca prometer que todas las categorías están disponibles.
5. Caption, visual y landing no se contradicen; la fecha, alcance y precio se revalidan al momento de aprobación/scheduling.

## Claims: estado, cobertura, precio, seguridad y privacidad
- Una fuente NOT_FOUND solo significa “sin registros devueltos”; no garantiza que no existan multas, accidentes o gravámenes. UNAVAILABLE / NOT_CONFIGURED / STALE / CONFLICT deben conservarse. Un check verde describe dato devuelto, no un auto seguro.
- Declarar cobertura SOLO si una captura de la configuración efectiva documenta la capability anunciada y la comunicación distingue “habilitada” de “datos encontrados para esta placa”. Sin snapshot: hablar genéricamente de cómo revisar el alcance, nunca ofrecer la prestación.
- Papeletas: delimitar jurisdicción, estado y fecha; no decir “sin multas nacionales” cuando la fuente es SUTRAN o limitada a Lima/Callao.
- SOAT: vigencia ≠ historia universal de siniestros. CITV ≠ inspección mecánica actual. Historial registral puede ser parcial.
- Precio: solo monto S/ verificado de REPORT_PRICE_PEN del despliegue vigente, con snapshot fechado; el default en código NO es prueba del precio live. Mostrar que el cargo es por reporte/pago único sin engañar sobre alcance y condiciones.
- Pago/comercial: no inducir compra si commercialReadiness() no permite cobrar; no promocionar Yape como integrado/certificado sin comprobar el flag. Reporte se genera después de pago aprobado, no al llenar placa.
- Testimonios, clientes, estadísticas, número de reportes, ahorros, resultados o endorsements requieren evidencia OBSERVED rastreable, consentimiento y alcance. Simulaciones deben tener sello legible “Ejemplo ilustrativo” y no pueden representar cobertura falsa.
- Nada de datos personales, placas reales de clientes, DNI, teléfonos o comprobantes en repos, prompts, capturas sociales o eventos analíticos. Redactar/anonymizar datos, pero no modificar pruebas para que parezcan resultados reales.

## Sistema de identidad visual social
La estética premium y una escena protagonista SÍ son admisibles en redes: contexto peruano de compra de usados, personas ilustrativas, automóvil, móvil y documentación; jerarquía tipográfica y alto contraste. La web sigue sus tokens propios. No imponer la estética clara/minimalista de DESIGN.md a todos los posters sociales ni copiar el azul/amarillo de piezas de referencia como nuevos tokens oficiales.

**Marca exacta:** el repositorio ofrece public/placaclara-mark.svg (isotipo). Usar ese asset sin recrearlo; para el lockup completo y wordmark, obtener master de marca aprobado y corroborar contra sitio. No inventar logos, sellos de gobierno, asociaciones oficiales o pantallas de interfaz como verdaderas. Si falta master, mostrar texto simple sin isotipo inventado y bloquear hasta QA de marca.

Generative images son concept art, no evidencia. Para contenido documental premium preferir escena/imagen + tipografía/CTA deterministas, con inspección real de pixels/claim/crop para evitar errores en placas, pantallas, tipografías y símbolos. Separar GEO_PASS, DESIGN_OWNER_ACCEPTED y FACTUAL_PASS: ninguno sustituye al otro. Respetar licencia de assets/personas.

**Tamaño/plataforma:** formatos autorizados en JSON. Para TikTok usar como hipótesis conservadora top 260, bottom 500, right 170, left 60 a 1080x1920, BASADO EN OBSERVACIÓN DE OTRA CUENTA, NO regla oficial ni validación de PlacaClara. Exigir revisión sobre preview real. Instagram 1:1, 4:5 o story según job, verificar safe areas/legibilidad por separado. La densidad de texto tiene costo en tamaño móvil; no llenar un diseño bonito con información redundante.

## Memoria, novedad y cola
Comparar las ocho dimensiones topic, angle, lesson, hook_family, example, visual_pattern, structure y cta frente a publicaciones, programados, aprobados y planificados; cooldown de preferencia siete días cuando aplique. Cambiar el titular NO cuenta como novedad. Imágenes anteriores del usuario no sustituyen un registro editorial completo. Si no es accesible TikTok/Instagram Studio y la cola Scheduled, estatus REVIEW_REQUIRED, nunca PASS supuesto.

No convertir sugerencias en publicaciones automáticas. Enriquecer el ledger al preparar briefs; incluir hash del archivo aprobado y plataforma para reconciliar. La plantilla de JSON es un borrador ficticio, no una nueva idea preaprobada.

## Medición y atribución
Embudos FIRST-PARTY reales actualmente identificados en código:
landing_view → plate_submitted → preview_success → checkout_started → payment_submitted → payment_approved → report_ready → report_viewed.
Admin expone métricas de 30 días; nunca mezclar esos conteos sin cohortes con likes/vistas de una publicación. Requiere denominadores, ventanas, origen, UTM/campaign join o evidencia de atribución verificable antes de afirmar que un POST generó pagos. Hoy no existe en este contrato prueba de atribución per-post end-to-end, marcar UNKNOWN.

Social: views, saves, shares, profile visits, outbound clicks, follows (cuando estén disponibles). Negocio: consultas de placa, vistas de cobertura, checkout, pagos; conservar la separación entre visitadores y buyers. Snapshots T+24h y T+7d para hipótesis iniciales (cadencia de observación, no benchmarking universal). No un “viral = ventas”; comparar variantes con fuente, formato, objetivo, ventana y tráfico compatibles; registro de negativos. No activar proveedores pagados para métricas ni publicar a fuerza.

## Estados / autoridad / procesos
DRAFT → READY_FOR_HUMAN_REVIEW (preflight técnico no prueba calidad) → APPROVED_FOR_MANUAL_SCHEDULING (recibo del dueño) → SCHEDULED (receipt real) → PUBLISHED (URL real y reconciliación). Este contrato NO expide autoridad para acceder a cuentas, programar, publicar, activar pagos ni consultar proveedores. El acceso a la plataforma es externo y manual hasta una integración separadamente certificada.

El paquete exacto debe contener claims + evidence refs + snapshot runtime cuando aplica + novelty receipts + pieza exportada SHA256 + pixel/mobile/design QA + CTA/metric + propietario/release + recibos externos. Sin owner o estado de plataforma incierto, dejar DRAFT/REVIEW_REQUIRED; no reintentar a ciegas.

## Gate crítico antes de publicar
Rechazo ante: cobertura ausente no verificada, precio sin snapshot, beneficio milagroso, logo incorrecto, pantallas falsas, repetición semántica, safe-zone mala, legibilidad deficiente, claims contradictorios con la web, CTA comercial no disponible, ausencia de pruebas o identidad/consentimiento. “Diseño espectacular” nunca compensa veracidad.

## Artefactos y comandos
- EDITORIAL_CONTRACT.v1.json — fuente de reglas versionadas.
- CONTENT_PACKAGE.v1.schema.json — forma de intercambio.
- fixtures/DRAFT.example.json — borrador sintético intencionalmente bloqueado.
- preflight.mjs — verificaciones deterministas/declarativas; no chequea la web, cuentas o QA real.
- tests/social-editorial.test.mjs — escenarios adversariales sin dependencias.
- node --test tests/social-editorial.test.mjs
- node docs/social/preflight.mjs docs/social/fixtures/DRAFT.example.json (esperado BLOCKED).

**Criterio de cierre documental:** autoridad y límites trazados, contrato/version/fixture/test verificables. **Criterio de integración operativa:** una pieza real con snapshot, corpus completo, vista móvil, aceptación del propietario, publicación manual confirmada y primeras ventanas de métricas; hasta entonces no afirmar uplift o conversión atribuida.
