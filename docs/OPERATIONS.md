# Runbook de operación

## Rama de trabajo

La rama comercial activa se valida primero en Preview. No promover a `main` hasta cerrar el checklist de lanzamiento y una ejecución end-to-end controlada.

## Kill switches

- `MERCADO_PAGO_LIVE_MODE`: separa TEST de LIVE.
- `VEHICLE_PROVIDER_EXECUTION_ENABLED`: bloquea ejecución pagada de proveedores.
- `YAPE_CHECKOUT_ENABLED`: Yape permanece oculto/bloqueado mientras no esté certificado.
- `PREVIEW_PROVIDER_MODE`: evita gasto de proveedores en preview anónimo.

Cambiar credenciales o flags requiere un deployment nuevo; un proceso ya desplegado no recibe retroactivamente las variables nuevas.

## Pago

El navegador tokeniza. El servidor fija importe, valida la respuesta de Mercado Pago y persiste `payment_attempts`.

Nunca:
- crear un segundo pago para recuperar un fulfillment fallido;
- confiar en el navegador para marcar PAID;
- usar tarjetas TEST con credenciales LIVE;
- exponer access tokens o PAN/CVV.

La conciliación administrativa obtiene de Mercado Pago el pago existente y persiste fee/neto. No genera un nuevo cargo.

## Proveedores

Ruta comercial actual:

- Masitaprex: identidad + situación registral.
- PlacApi: SOAT, CITV y papeletas.
- ConsultaDatos: fallback configurado solo cuando corresponda.

Una generación inicial puede consultar registro + fuentes dinámicas. Un refresh de un reporte existente debe conservar la evidencia registral y consultar solo SOAT/CITV/papeletas; no debe quemar Masitaprex nuevamente.

La sonda administrativa ejecuta adaptadores reales y puede consumir saldo. No usarla como health check rutinario.

## Entrega

Después del commit del reporte:

1. generar PDF;
2. guardar PDF privado;
3. enviar correo por Resend si `RESEND_API_KEY` y `REPORT_FROM_EMAIL` están configurados.

Fallar PDF o correo no invalida un pago ya aprobado ni autoriza un segundo cobro.

## Base de datos

`supabase/migrations/` es la historia canónica. Ejecutar migraciones en orden con `supabase db push` o el proceso controlado equivalente. `supabase/schema.sql` es un snapshot inicial y no debe ejecutarse además de las migraciones como si fuera una migración nueva.

## Validación antes de promover

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
node --test tests/payment-safety.test.mjs
```

Si se modifica SQL de pagos, ejecutar además la prueba SQL en un entorno aislado; nunca contra la base productiva.

Para cambios en proveedores, además de build:
- verificar número exacto de llamadas;
- revisar `provider_calls`;
- validar costo por llamada;
- comprobar que una actualización selectiva no crea una llamada registral innecesaria.

## Gate comercial

Antes de abrir tráfico deben estar comprobados en el entorno que se promoverá:

- pago LIVE;
- conciliación / webhook;
- proveedores requeridos;
- PDF;
- correo si forma parte de la entrega prometida;
- reporte web y enlace compartible;
- costos del tablero;
- precio comercial;
- identidad legal y canales de soporte;
- Yape deshabilitado mientras siga sin certificación.

No confundir “deployment READY” con “flujo comercial certificado”.
