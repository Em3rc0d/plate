# Runbook de operación

## Flujo de ramas

Trabajar en rama. Validar primero en Preview. Promover únicamente un artefacto que corresponda al commit revisado. No usar un deployment `READY` como sustituto de una validación funcional.

## Kill switches

- `MERCADO_PAGO_LIVE_MODE`: separa TEST de LIVE.
- `VEHICLE_PROVIDER_EXECUTION_ENABLED`: bloquea proveedores pagados.
- `YAPE_CHECKOUT_ENABLED`: Yape permanece oculto/bloqueado mientras no esté certificado.
- `PREVIEW_PROVIDER_MODE`: `NONE` evita gasto en consulta anónima.

Cambiar credenciales o flags requiere un deployment nuevo.

## Pago

El navegador tokeniza. El servidor fija el importe, valida el snapshot de Mercado Pago y persiste `payment_attempts`.

Nunca:
- crear un segundo pago para recuperar un fulfillment fallido;
- confiar en el navegador para marcar `PAID`;
- usar tarjetas TEST con credenciales LIVE;
- exponer access tokens, PAN o CVV.

La conciliación administrativa obtiene el pago existente por ID y persiste fee/neto. No genera un nuevo cargo.

Webhook de producción esperado:

```text
https://www.placaclara.com/api/payments/mercado-pago/webhook
```

La firma debe validarse con `MERCADO_PAGO_WEBHOOK_SECRET`.

## Proveedores

Ruta comercial actual:

- Masitaprex: identidad + situación registral.
- PlacApi: SOAT, CITV y papeletas.
- ConsultaDatos: fallback cuando esté configurado y validado.

Una generación inicial puede consultar registro + fuentes dinámicas. Un refresh debe conservar evidencia registral y refrescar solo SOAT/CITV/papeletas.

La sonda administrativa ejecuta adaptadores reales y puede consumir saldo. No usarla como health check rutinario.

## Entrega

Después del commit del reporte:

1. generar PDF;
2. guardar PDF privado;
3. enviar correo si Resend y un remitente verificado están configurados.

Fallar PDF o correo no invalida un pago aprobado ni autoriza un segundo cobro.

## Base de datos

`supabase/migrations/` es la historia canónica. Las migraciones son append-only. `supabase/schema.sql` es un snapshot inicial y no debe ejecutarse como migración adicional.

## SEO

Dominio canónico:

```text
https://www.placaclara.com
```

Después de cada release SEO comprobar:

- home 200;
- canonical;
- `/robots.txt`;
- `/sitemap.xml`;
- `noindex` en consulta/checkout y superficies privadas;
- Search Console con propiedad y sitemap correctos.

## Analítica

`analytics_events` almacena eventos pseudónimos first-party con UUID de sesión. No incluir placa, correo, teléfono, DNI, comprobantes ni credenciales de pago en propiedades de eventos.

El dashboard administrativo vive en `/admin/analytics`.

## Validación antes de promover

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
node --test tests/payment-safety.test.mjs tests/payment-sql.test.mjs tests/pdf-document.test.mjs
```

Si se modifica SQL de pagos, validar además el flujo SQL en un entorno aislado.

Para cambios en proveedores:
- verificar número exacto de llamadas;
- revisar `provider_calls`;
- validar costo real;
- comprobar que refresh selectivo no vuelve a llamar Masitaprex.

## Gate comercial

Antes de abrir tráfico pagado o escalar campañas deben estar comprobados:

- pago LIVE;
- webhook y conciliación;
- proveedores requeridos con saldo;
- PDF y reporte web;
- correo si se promete como canal de entrega;
- enlace compartible;
- costos/margen del tablero;
- precio comercial;
- identidad legal y soporte;
- Yape deshabilitado mientras siga sin certificación.

No confundir “deployment READY” con “flujo comercial certificado”.
