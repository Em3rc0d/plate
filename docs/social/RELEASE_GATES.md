# Gate de aprobación de piezas sociales — v1

Autoridad: SOCIAL_EDITORIAL_CONTRACT.md, siempre debajo de la lógica operativa de plate. Activo para preparar borradores; no otorga autonomía externa.

| Gate | Responsable del dato | Prueba requerida | Si falta |
|---|---|---|---|
| G0 Identidad y objetivo | Editor / perfil | brand_id=placaclara, audiencia peruana y exactamente un job/primary_action coherente | REJECT |
| G1 Evidencia factual | Revisor | cada claim trazable a fuente/documento+fecha, no promesas absolutas | REVIEW_REQUIRED |
| G2 Precio/capacidad/pago | Operador de plate | captura de configuración del despliegue actual, read-only, sin secretos; enabledCapabilities + commercialReadiness + REPORT_PRICE_PEN | BLOCKED si copy comercial |
| G3 Novedad global | Editor + operador de redes | ledger published/planned/approved/scheduled y comparación semántica ocho dimensiones, incluso cola TikTok/Instagram Studio | REVIEW_REQUIRED |
| G4 Dirección artística | Owner | originalidad, historia visual, marca master, aceptación explícita distinta de QA geométrica | REVISE |
| G5 Pixels y plataforma | QA humano | PNG/MP4 exacto+SHA256, visualización móvil y UI overlays específicos plataforma, alt text, textos, derechos | BLOCKED |
| G6 Riesgo legal/comercial | Revisor | sin testimonios/placas/clientes inventados, cobertura delimitada y aviso proporcional, privacidad | BLOCKED |
| G7 CTA y atribución | Editor y analítica | acción medible y coherente, KPI/ventana, fuente tráfico; tasa comercial solo con join real | INCONCLUSIVE si no hay métricas |
| G8 Autorización | Propietario | visto bueno del artefacto final; cambio material exige nueva versión y revisión | BLOCKED |
| G9 Programación/publicación | Cuenta oficial por humano/adaptador certificado separado | receipt de proveedor, hora zona America/Lima, cuenta correcta, link público tras publicar, reconciliación | SCHEDULE_UNKNOWN; NO afirmar scheduled/published |

## Flujo de decisión
1. Investigar una pregunta de comprador; distinguir hipótesis de un hecho. Registrar el objetivo contractual antes de escribir el gancho.
2. Preparar y verificar claims contra fuentes y estado del runtime real. Precio no tomado de defaults, screenshot antiguo o material promocional previo.
3. Consultar ledger histórico completo y cola de posts programados. Sin acceso = bloquear promoción del borrador; una aprobación manual no transforma “unknown” en “PASS” retroactivo.
4. Diseñar la tensión social como decisión auténtica y la respuesta como un hecho demostrable. Guardado/visita/cobertura/conversión tienen trabajos diferentes.
5. Renderizar: composición premium, identidad auténtica, texto legible en móvil, límites de la fuente visibles. Código o pantallas de reporte ilustrativas deben declararlo.
6. Comprobar todos los gates, fijar hash/caption/audiencia/plataforma y solicitar revisión humana. No publicar desde el preflight.
7. Verificar efectivamente Scheduling en la plataforma correspondiente; registrar fecha/hora Lima y receipt. Solo marcar Published cuando la URL exista y la plataforma coincida con la pieza aprobada.
8. Medir con cohortes comparables y registrar UNKNOWN cuando no haya atribución. Una publicación observada no es un patrón comprobado.

## Estado de certificación
- POLICY_DOCS: versionados.
- MACHINE_CONTRACT: versionado.
- STRUCTURAL_PREFLIGHT: disponible offline; no resuelve semántica, runtime live ni diseño.
- BRAND_SOCIAL_VISUAL_UAT: PENDING.
- FULL_CORPUS_AND_SCHEDULE_RECEIPT: PENDING.
- PER_POST_TO_SALE_ATTRIBUTION: NOT_DEMONSTRATED.
- PUBLISHER_ADAPTER: NOT_AUTHORIZED.
- ZERO_PAID_API_REQUIREMENT: SATISFIED_BY_DESIGN (solo documentos/tests locales, no consulta de proveedores).

Aceptación de esta política no certifica los assets existentes del usuario ni exige cambiar sus posts pasados. No ejecutar paid provider probes para “demostrar” contenido social.
