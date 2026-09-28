# PlacaClara — estado técnico

Actualizado: 2026-09-28.

Este archivo es una fotografía técnica. La fuente de verdad de runtime sigue siendo código + migraciones + configuración del entorno.

## Código en main

`main` contiene actualmente:

- checkout Mercado Pago API;
- aislamiento TEST/LIVE e idempotencia;
- webhook firmado + reconciliación;
- proveedor registral Masitaprex;
- PlacApi para SOAT/CITV/papeletas;
- refresh selectivo sin repetir Masitaprex;
- reporte web/PDF tipo dossier;
- redelivery sin proveedores;
- Libro de Reclamaciones;
- métricas financieras;
- SEO técnico;
- analítica de conversión first-party;
- dashboard `/admin/analytics`.

## Validaciones confirmadas

- Mercado Pago TEST con tarjeta: aprobado sin marcar pedido como pagado ni ejecutar proveedores.
- Mercado Pago LIVE con tarjeta: un cargo controlado aprobado y persistido.
- Masitaprex LIVE: una ejecución real exitosa con costo persistido.
- Refresh selectivo: confirmó cero nuevas llamadas Masitaprex.
- PDF: generación operativa con React PDF.
- Email: entrega técnica probada con remitente de prueba; dominio remitente propio sigue siendo una tarea operacional independiente.
- Custom domain: `placaclara.com` y `www.placaclara.com` asociados; canonical decidido en `www`.
- SEO/funnel: build Preview del commit `71e6c530276acd4b6323d90e145cd344246aa091` en estado READY.

## Base de datos

Migraciones aplicadas en producción:

1. `initial_vehicle_platform`
2. `finishing_launch_controls`
3. `add_fk_indexes`
4. `book_of_claims`
5. `mercado_pago_checkout`
6. `harden_payment_test_isolation`
7. `payment_financials`
8. `order_analytics_id`
9. `analytics_events`

`supabase/schema.sql` es snapshot inicial, no esquema final.

## Estado de despliegue

La versión comercial previa está activa en Production.

El bloque SEO + funnel está mergeado en `main`, pero su promoción a Production está temporalmente bloqueada por Vercel. No afirmar que `robots.txt`, `sitemap.xml` o `/admin/analytics` están activos públicamente hasta que el commit correspondiente quede desplegado en Production.

## Pendientes operativos relevantes

- promover el `main` actual a Production cuando Vercel lo permita;
- validar públicamente canonical, robots, sitemap y noindex después de promover;
- crear/verificar propiedad de Google Search Console y enviar sitemap;
- confirmar webhook LIVE sobre el dominio definitivo;
- verificar dominio remitente de Resend y usar correo corporativo;
- conciliar fee/neto real del pago LIVE si aún figura pendiente;
- comprar créditos PlacApi antes de nuevas consultas CITV/papeletas;
- mantener Yape deshabilitado hasta certificación.

## Regla de seguridad

No se necesita un segundo pago ni una nueva consulta pagada para validar SEO, dominio, PDF existente, reporte web o estructura del repositorio.
