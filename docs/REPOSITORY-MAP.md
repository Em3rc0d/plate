# Mapa del repositorio

PlacaClara usa un monolito modular Next.js. La estructura está separada por dominio; no se mueven rutas de runtime solo por estética.

```text
/
├── app/                    # App Router: páginas y Route Handlers
│   ├── (marketing)/        # superficie pública
│   ├── admin/              # backoffice autenticado
│   └── api/                # contratos HTTP
├── components/
│   ├── admin/              # UI del backoffice
│   ├── checkout/           # consulta, pedido y pago
│   ├── claims/             # Libro de Reclamaciones
│   ├── marketing/          # landing y contenido público
│   ├── report/             # presentación del reporte
│   └── ui/                 # primitivas visuales
├── src/
│   ├── analytics/          # eventos pseudónimos / PostHog opcional
│   ├── config/             # env, producto, capacidades, readiness
│   ├── db/                 # Supabase y autorización admin
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
├── tests/                  # contratos y seguridad
├── docs/                   # runbooks, evidencia y referencias
├── assets/                 # fuentes empaquetadas requeridas por PDF
└── public/                 # assets estáticos
```

## Reglas de dependencia

- `app/` orquesta; la lógica de negocio vive en `src/`.
- Componentes cliente nunca importan service role, proveedores ni secretos.
- `src/providers/` transforma contratos externos a resultados normalizados; no decide estados comerciales.
- `src/evidence/` normaliza evidencia; no efectúa cobros ni llamadas HTTP.
- `src/vehicle/service.ts` coordina proveedores, evidencia, persistencia y entrega.
- `src/payments/` decide estados de pago; un fallo de fulfillment nunca reinterpreta un pago aprobado como fallido.
- `src/reports/` no provoca consultas a proveedores durante PDF/redelivery.
- `supabase/migrations/` es append-only. No reescribir migraciones ya aplicadas.
- Nuevos secretos se declaran en `src/config/env.ts` y se documentan en `.env.example`.

## Convenciones

- Código: inglés técnico; copy de producto: español.
- Adaptadores: `src/providers/<capability>/<provider>-<purpose>.ts`.
- Route Handlers: `app/api/<surface>/<resource>/route.ts`.
- Componentes: agrupar por superficie, no por tipo genérico.
- SQL: `YYYYMMDDHHMMSS_descripcion_snake_case.sql`.
- Commits: `feat(scope):`, `fix(scope):`, `docs(scope):`, `chore(scope):`.

## Rutas que no deben moverse por limpieza

- `app/**`: convenciones de Next.js.
- `docs/GOLDEN-AKE473.md`: incluido explícitamente por `next.config.ts`.
- `supabase/migrations/**`: historial aplicado.
- `src/reports/pdf-*`: runtime PDF ya validado.

La higiene futura debe priorizar límites, documentación y eliminación de ambigüedad antes que renames masivos.
