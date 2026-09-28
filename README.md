# PlacaClara

PlacaClara es una aplicación web para consultar y consolidar información vehicular disponible en Perú antes de comprar un usado. Presenta datos documentales, fuente, fecha, cobertura y limitaciones; no sustituye una inspección mecánica ni una certificación registral.

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

Validación mínima antes de abrir un PR:

```sh
pnpm lint
pnpm typecheck
pnpm build
node --test tests/payment-safety.test.mjs tests/payment-sql.test.mjs tests/pdf-document.test.mjs
```

Las pruebas SQL que muten estado deben ejecutarse únicamente en una base aislada. Nunca ejecutar fixtures de test contra producción.

## Estructura

```text
app/          páginas y Route Handlers de Next.js
components/   UI agrupada por superficie
src/          dominio, servicios e integraciones
supabase/     migraciones append-only y snapshot inicial
tests/        contratos, seguridad de pagos y PDF
docs/         operación, referencias y evidencia histórica
public/       assets estáticos
```

El mapa detallado está en [docs/REPOSITORY-MAP.md](docs/REPOSITORY-MAP.md).

## Configuración

Todas las variables soportadas están documentadas en [`.env.example`](.env.example). Los secretos se configuran únicamente en el entorno.

Controles sensibles:

- `MERCADO_PAGO_LIVE_MODE`
- `VEHICLE_PROVIDER_EXECUTION_ENABLED`
- `YAPE_CHECKOUT_ENABLED`
- `PREVIEW_PROVIDER_MODE`
- `REPORT_PRICE_PEN`

Cambiar variables de Vercel requiere un deployment nuevo.

## Base de datos

La fuente canónica del esquema evolutivo es `supabase/migrations/`. Aplicar las migraciones en orden:

```sh
pnpm exec supabase login
pnpm exec supabase link --project-ref YOUR_PROJECT_REF
pnpm exec supabase db push
```

`supabase/schema.sql` es el bootstrap inicial y no reemplaza las migraciones posteriores.

Las migraciones actuales cubren plataforma base, controles de lanzamiento, índices, Libro de Reclamaciones, Mercado Pago, aislamiento TEST, métricas financieras y analítica de conversión first-party.

## Pagos

Mercado Pago se integra mediante tokenización en navegador y confirmación server-side. El servidor fija el importe, usa idempotencia, vuelve a consultar el pago al proveedor y no confía en el navegador para marcar un pedido como pagado.

Un pago aprobado y un reporte generado son estados distintos. Un fallo posterior al cobro nunca autoriza crear un segundo pago.

Yape permanece feature-gated hasta su certificación separada.

## Proveedores y costo

- Masitaprex: identidad, titularidad, historial registral y restricciones devueltas.
- PlacApi: SOAT, CITV y papeletas; identidad vehicular puede actuar como fallback.
- ConsultaDatos: fallback registral únicamente cuando esté configurado y validado.

Los costos se registran en `provider_calls`. Un refresh de un reporte existente reutiliza evidencia registral persistida y refresca únicamente SOAT, CITV y papeletas.

La sonda administrativa realiza llamadas reales y puede consumir saldo.

## Reportes y entrega

La misma estructura canónica alimenta reporte web y PDF.

- enlace privado: puede contener identidad registral enmascarada;
- enlace compartible: DTO saneado sin identidad del propietario ni datos del pedido;
- PDF: almacenado en bucket privado;
- redelivery/PDF: no vuelven a consultar proveedores.

## SEO y analítica

La URL pública canónica es `https://www.placaclara.com`.

El código incluye metadata, structured data, `robots.txt`, `sitemap.xml` y `noindex` para superficies transaccionales/privadas. La analítica first-party usa un UUID pseudónimo por sesión y no guarda placa, correo, teléfono ni credenciales de pago en `analytics_events`.

## Documentación

Empieza en [docs/README.md](docs/README.md). La documentación histórica se conserva, pero no tiene precedencia sobre código, migraciones ni configuración real.

## Regla de cambios

Antes de promover cambios de pagos, proveedores, reportes o SQL:

1. aislarlos en una rama;
2. validar en Preview;
3. comprobar lint, tipos, build y tests relevantes;
4. revisar idempotencia y número de llamadas pagadas;
5. revisar métricas/costos;
6. promover únicamente el artefacto validado.
