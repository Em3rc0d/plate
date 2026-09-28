# PlacaClara

PlacaClara es una aplicación web para consultar y consolidar evidencia vehicular disponible en Perú antes de una compra. El producto presenta datos documentales, fuentes, cobertura y limitaciones; no sustituye una revisión mecánica, certificación registral ni asesoría legal.

## Stack

- Next.js 16 + React 19 + TypeScript strict
- Supabase PostgreSQL, Auth y Storage privado
- Mercado Pago Checkout API
- Masitaprex + PlacApi mediante adaptadores server-side
- React PDF
- Resend para entrega por correo
- Vercel como runtime objetivo

## Desarrollo local

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Validación mínima:

```sh
pnpm lint
pnpm typecheck
pnpm build
node --test tests/payment-safety.test.mjs
```

Las pruebas SQL de pagos se ejecutan únicamente en una base aislada. Nunca ejecutar fixtures de test contra producción.

## Estructura

```text
app/          páginas y Route Handlers de Next.js
components/   UI agrupada por superficie
src/          dominio, servicios e integraciones
supabase/     migraciones y snapshot inicial
tests/        contratos y seguridad de pagos
docs/         operación, referencias y evidencia histórica
public/       assets estáticos
```

El mapa detallado y las reglas de dependencia están en [docs/REPOSITORY-MAP.md](docs/REPOSITORY-MAP.md).

## Configuración

Todas las variables soportadas están documentadas en [`.env.example`](.env.example). Los secretos se configuran únicamente en el entorno y nunca se versionan.

Controles operativos especialmente sensibles:

- `MERCADO_PAGO_LIVE_MODE`
- `VEHICLE_PROVIDER_EXECUTION_ENABLED`
- `YAPE_CHECKOUT_ENABLED`
- `PREVIEW_PROVIDER_MODE`
- `REPORT_PRICE_PEN`

Cambiar variables en Vercel requiere un deployment nuevo para que el runtime las reciba.

## Base de datos

La fuente canónica del esquema evolutivo es `supabase/migrations/`. Aplicar las migraciones en orden:

```sh
pnpm exec supabase login
pnpm exec supabase link --project-ref YOUR_PROJECT_REF
pnpm exec supabase db push
```

`supabase/schema.sql` representa el bootstrap inicial y no reemplaza las migraciones posteriores. No ejecutarlo adicionalmente como una migración independiente.

Las migraciones existentes cubren plataforma inicial, controles de lanzamiento, índices, Libro de Reclamaciones, Mercado Pago, aislamiento TEST y métricas financieras.

## Seguridad de pagos

Un pago aprobado y un reporte generado son estados distintos. Un fallo posterior al cobro nunca debe iniciar un segundo pago.

El backend valida el snapshot de Mercado Pago, mantiene idempotencia en `payment_attempts`, concilia por provider payment ID y bloquea fulfillment de pagos TEST. Las llamadas a proveedores tienen además un kill switch independiente.

Yape permanece feature-gated mientras no esté certificado.

## Proveedores y costo

- Masitaprex: evidencia registral.
- PlacApi: SOAT, CITV y papeletas; identidad vehicular puede actuar como fallback.
- ConsultaDatos: fallback registral cuando esté configurado y validado.

Los costos se registran en `provider_calls`. Una actualización de fuentes sobre un reporte existente debe reutilizar la evidencia registral almacenada y refrescar únicamente las fuentes dinámicas requeridas.

La sonda administrativa realiza llamadas reales: no usarla como health check gratuito.

## Reportes y entrega

La misma estructura canónica alimenta reporte web y PDF. La entrega puede usar Resend; si el correo falla, el reporte ya persistido continúa disponible.

- enlace privado: puede contener identidad registral;
- enlace compartible: DTO saneado sin identidad del propietario ni datos de pago;
- PDF: storage privado y ruta controlada.

Redelivery/PDF no deben volver a consultar proveedores.

## Documentación

Empieza en [docs/README.md](docs/README.md).

Documentos principales:

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [DESIGN.md](DESIGN.md)
- [PROVIDERS.md](PROVIDERS.md)
- [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md)
- [docs/OPERATIONS.md](docs/OPERATIONS.md)

Los documentos de certificaciones o batches anteriores son evidencia histórica y no deben interpretarse como estado vigente del runtime.

## Regla de cambios

Antes de promover cambios de pago, proveedores, reportes o SQL:

1. mantenerlos aislados en Preview;
2. validar lint, tipos y build;
3. comprobar idempotencia y número de llamadas pagadas;
4. revisar métricas/costos;
5. cerrar el checklist operativo;
6. recién después promover a producción.
