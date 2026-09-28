# Mapa del repositorio

PlacaClara usa un monolito modular Next.js. La estructura actual ya está separada por dominio; por seguridad no se mueven rutas de runtime solo por estética.

```text
/
├── app/                    # App Router: páginas y Route Handlers
│   ├── (marketing)/        # superficie pública
│   ├── admin/              # backoffice autenticado
│   └── api/                # contratos HTTP
├── components/
│   ├── admin/              # UI del backoffice
│   ├── checkout/           # creación de pedido y pago
│   ├── claims/             # libro de reclamaciones
│   ├── marketing/          # landing y contenido público
│   ├── report/             # presentación del reporte
│   └── ui/                 # primitivas visuales
├── src/
│   ├── analytics/          # eventos sin PII
│   ├── config/             # env, producto, capacidades, readiness
│   ├── db/                 # acceso a Supabase y autorización admin
│   ├── email/              # entrega por correo
│   ├── evidence/           # normalización de evidencia
│   ├── findings/           # hallazgos deterministas / IA opcional
│   ├── maintenance/        # retención y mantenimiento
│   ├── observability/      # telemetría controlada
│   ├── orders/             # ciclo de vida del pedido
│   ├── payments/           # Mercado Pago y conciliación
│   ├── providers/          # adaptadores externos
│   ├── reports/            # PDF, sharing, delivery y resumen
│   ├── utils/              # utilidades transversales pequeñas
│   └── vehicle/            # modelo canónico y orquestación
├── supabase/
│   ├── migrations/         # fuente canónica del esquema evolutivo
│   └── schema.sql          # snapshot inicial; no sustituye migraciones
├── tests/                  # pruebas de seguridad/estado de pagos
├── docs/                   # evidencia, runbooks y referencias
└── public/                 # assets estáticos
```

## Reglas de dependencia

- `app/` debe orquestar; la lógica de negocio vive en `src/`.
- Componentes cliente nunca importan service role, proveedores ni secretos.
- `src/providers/` solo transforma contratos externos a `ProviderResult`; no decide estados comerciales.
- `src/evidence/` normaliza evidencia; no efectúa cobros ni llamadas HTTP.
- `src/vehicle/service.ts` coordina proveedores, evidencia, findings, persistencia y entrega.
- `src/payments/` decide estados de pago; un error de fulfillment nunca debe reinterpretarse como pago fallido.
- `src/reports/` no debe provocar consultas a proveedores durante redelivery/PDF.
- `supabase/migrations/` es append-only. No reescribir migraciones ya aplicadas.
- Nuevos secretos se declaran en `src/config/env.ts` y se documentan en `.env.example`; nunca se versionan valores reales.

## Convenciones

- Rutas y nombres de dominio: inglés técnico en código; copy de producto en español.
- Adaptadores: `src/providers/<capability>/<provider>-<purpose>.ts`.
- Route Handlers: `app/api/<surface>/<resource>/route.ts`.
- Componentes: agrupar por superficie, no por tipo genérico.
- SQL: `YYYYMMDDHHMMSS_descripcion_snake_case.sql`.
- Commits: `feat(scope):`, `fix(scope):`, `docs(scope):`, `chore(scope):`.

## Zonas que no deben “ordenarse” moviendo archivos

Estas rutas dependen de convenciones de framework o tracing y se mantienen estables:

- `app/**`: rutas de Next.js.
- `app/api/**`: endpoints públicos/admin.
- `docs/GOLDEN-AKE473.md`: incluido explícitamente por `next.config.ts`.
- `supabase/migrations/**`: historial aplicado.
- `src/reports/pdf-*`: runtime PDF ya certificado en Vercel.

La limpieza futura debe priorizar límites y documentación antes que renames masivos.
