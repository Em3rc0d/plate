# FINISHING BATCH STATUS

PASS en funciones significa implementación completada y compatible con lint, tipos y build. No significa validación autenticada contra servicios externos.

## Core fixes
- Resend decoupled: PASS. Pedido exige DB/proveedor/pago, no Resend; email NOT_CONFIGURED.
- Reprocess/recovery: PASS. Estados pagados fallidos/vencidos, tokens por intento e idempotencia persistida; reporte existente se recupera sin consultar salvo forceRefresh.
- Redelivery: PASS. PDF/email independientes de proveedores y protegidos por lease/revisión.
- Private/share report split: PASS. Tokens independientes; DTO compartible por allowlist sin identidad ni datos del pedido.
- Owner deduplication: PASS. Señales conservadoras, revisión de documentos inconsistentes y conteo omitido si ambiguo.

## Launch operations
- Readiness dashboard: PASS. Configuración, DB/buckets, capacidades, pago, entrega y negocio sin secretos.
- Provider probe: PASS. Sonda administrativa de proveedores reales, métricas y comparación normalizada sin PII.
- Legal/business config: PASS. Identidad no inventada; privacidad/términos/reembolsos y Libro configurable.
- Checkout policy consent: PASS. Checkbox requerido y versiones/timestamp persistidos.
- Retention controls: PASS. Plazos vacíos desactivados; ejecución manual, preview y lotes de 100; no borra contabilidad.

## Coverage architecture
- Capability registry: PASS.
- Future sections schema: PASS. Robo/captura/siniestros/GNV/valorización en NOT_CONFIGURED sin adaptadores falsos.
- Marketing coverage gating: PASS. CoverageList y cards dependen de capacidades habilitadas.

## Build
- Migrations: APPLIED en Supabase `vehicle-intelligence-pe`: initial_vehicle_platform, finishing_launch_controls y add_fk_indexes. El tercer archivo cubre los FK indexados señalados por Performance Advisor.
- Lint: PASS en el build de Astra previo al parche `commercialReady`; no se pudo rerun localmente por falta de acceso al registry de pnpm.
- Typecheck: PASS en el build de Astra previo al parche. Los archivos tocados por `commercialReady` pasaron validación sintáctica con TypeScript 5.8.3 en este entorno.
- Build: PASS en el build de Astra previo al parche, Next.js 16.3.6/webpack. Requiere un rerun final en Vercel o un entorno con dependencias instalables antes de abrir tráfico.
- Tests/CI: no creados ni ejecutados.
- Deployment: no desplegado.
- Supabase Security Advisor: PASS — sin lints de seguridad tras aplicar migraciones.
- Supabase Performance Advisor: sin foreign keys sin índice; solo avisos INFO de índices todavía no usados en una base vacía.

## Remaining human launch blockers
Administrador; credenciales y saldo de proveedores; configuración de Yape/Plin; datos legales, contactos y Libro de Reclamaciones; despliegue y origen correcto. Completar sonda AKE473 y compra interna real. Resend, OpenAI, PostHog y Sentry son opcionales; habilitarlos requiere sus credenciales si se desean.

## Files added/modified
El inventario completo está en docs/FINISHING-CHANGES.md. Incluye rutas de recuperación/redelivery/share/retención/probe, readiness, legales, tipos canónicos, deduplicación, capability registry, migración 2, documentación y golden manual.

## Critical caveats
Supabase ya está creado y migrado, pero faltan credenciales de proveedores y configuración de aplicación: sonda real no ejecutada, carga a Storage ni correo real verificados. ConsultaDatos sigue pendiente de contrato completo corroborado. No hay cola durable: recuperación manual con fencing; no puede deshacer llamadas/cobros ya en vuelo. La página readiness evalúa configuración y lectura de infraestructura, no certifica operación comercial ni conformidad jurídica. REPORT_RETENTION_DAYS elimina PDF bajo acción explícita, no report_json. Los textos legales requieren identidad y política efectiva del operador. La referencia golden es observación previa del usuario, no estado actual garantizado.

## Lean launch profile — 2026-09-26

The initial commercial profile is now `REGISTRY_LEAN` to keep fixed software cost at zero and use Masitaprex as the only paid provider. SOAT, CITV and fines remain capability-gated and are not commercial blockers in this profile. They become mandatory again when `LAUNCH_PROFILE=FULL`.

Anonymous preview defaults to `PREVIEW_PROVIDER_MODE=NONE`, so no provider credit is spent before payment approval. The public copy names the initial product `Reporte Registral Vehicular` and only renders configured capabilities.

Optional integrations remain disabled when their keys are blank: Resend, PostHog, Sentry, OpenAI, ConsultaDatos and PlacApi.
