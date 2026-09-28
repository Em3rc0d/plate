# Vehicle Intelligence PE — V0.2 finishing batch

Monolito Next.js 16.3.6 / Node >=22 / TypeScript strict / Supabase / React PDF. Conserva el diseño previo. Sin tests, CI, cron ni microservicios por instrucción del usuario.

## Ejecución

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

NEXT_PUBLIC_SITE_URL debe coincidir exactamente con el origen del entorno. Sin credenciales la web funciona, proveedores NOT_CONFIGURED y compras bloqueadas por falta de infraestructura/proveedor/pago. Resend no bloquea una compra: la entrega web/PDF permanece disponible y email_status=NOT_CONFIGURED.

## Base de datos

Aplicar las dos migraciones en orden, no solo la inicial:

1. supabase/migrations/20260926025742_initial_vehicle_platform.sql
2. supabase/migrations/20260926040731_finishing_launch_controls.sql

```sh
pnpm exec supabase login
pnpm exec supabase link --project-ref YOUR_PROJECT_REF
pnpm exec supabase db push
```

No se aplicó migración remota durante este batch. supabase/schema.sql es referencia de la migración inicial, no un esquema completo actualizado ni una tercera migración. Aplicar mediante CLI o SQL Editor, no ejecutar schema.sql además de las migraciones. La segunda retira las RPC de generación antiguas: desplegar aplicación y migración coordinadamente, sin aprobaciones en curso. Los consentimientos históricos quedan null; no se inventa aceptación retroactiva.

## Admin

Crear usuario confirmado en Supabase Auth y asignar rol desde SQL Editor con UUID real:

```sql
update auth.users
set raw_app_meta_data=coalesce(raw_app_meta_data,'{}'::jsonb)||'{"role":"admin"}'::jsonb
where id='UUID-DEL-USUARIO'::uuid;
```

No se autoriza por user_metadata ni por correo. Mantener registro público cerrado. /admin/readiness lista configuración sin secretos; /admin/providers/probe diagnostica llamadas reales.

## Configuración

.env.example contiene los contratos originales y las nuevas opciones de negocio, política, retención, preview y recuperación. Al menos un proveedor y un método de pago (nombre + teléfono) habilitan pedidos con DB. QR opcional. SUPPORT_EMAIL y PRIVACY_EMAIL son canales públicos; BUSINESS_LEGAL_NAME/RUC/ADDRESS y BOOK_OF_CLAIMS_URL no se inventan. Completar y revisar antes de apertura.

Resend/remitente, OpenAI, PostHog y Sentry son opcionales. Las políticas tienen versiones registradas al checkout. Actualizar TERMS_VERSION/PRIVACY_VERSION al modificar materialmente esas políticas. Los textos describen el comportamiento; no equivalen a revisión jurídica ni acreditan autorización comercial de fuentes.

## Recuperación y entrega

- /api/admin/orders/[id]/reprocess: POST admin + Origin, JSON {requestId:UUID,forceRefresh:false}. Solo pedido pagado. Reintentos con el mismo UUID son idempotentes.
- Umbral REPORT_PROCESSING_STALE_MINUTES=10, mínimo 6 minutos por request máximo de 300 segundos. No recuperar intentos frescos.
- Un reporte existente se conserva y se entrega sin proveedores. forceRefresh=true es explícito, puede consumir saldo y genera una nueva revisión conservando enlaces/snapshots.
- /api/admin/reports/[id]/redeliver: POST {pdfOnly:false}; no llama proveedores. Si email SENT, no vuelve a enviar. pdfOnly=true solo intenta PDF faltante/fallido.
- Los tokens de intento impiden commits tardíos. No es una cola durable; acciones externas ya en vuelo no se pueden deshacer.

## Privacidad y retención

/reporte/[publicCode] es privado por secreto bearer. El botón crea /compartir/[shareCode] independiente y sin propietario/documentos/datos del pedido. Nunca compartir el enlace privado creyendo que es la vista reducida. Revocar un reporte completo mediante expires_at; revocar solo compartición poniendo share_code=null con administración de DB.

PAYMENT_PROOF_RETENTION_DAYS y REPORT_RETENTION_DAYS vacíos: sin borrado automático. La herramienta en readiness calcula y ejecuta lotes manuales de hasta 100 por grupo. REPORT_RETENTION_DAYS afecta PDF, no report_json. Nunca elimina pedidos/contabilidad. Las políticas deben ser confirmadas por el operador antes de definir plazos. No hay cron.

## Preview y capacidades

NONE solo valida placa; BASIC usa identidad económica/caché; FULL habilita registro profundo de forma explícita. Ningún modo muestra propietario. CoverageList usa src/config/providers.ts. Robo, captura, siniestros, GNV y valorización existen como secciones NOT_CONFIGURED; no se venden ni se simulan.

## Vercel

Framework Next.js, Node >=22. Instalar pnpm install --frozen-lockfile; build pnpm build. Configurar env por entorno y NEXT_PUBLIC_SITE_URL real. Confirmar soporte del plan para maxDuration=300. Configurar API keys únicamente servidor. No se desplegó porque no se aportó destino/cuenta/credenciales.

## Validación

```sh
pnpm lint
pnpm typecheck
pnpm build
```

No se crearon ni ejecutaron tests. Compilación y tipos no acreditan integración externa. LAUNCH-CHECKLIST.md contiene los pasos manuales y la compra interna. docs/GOLDEN-AKE473.md es referencia previa aportada, no datos actuales certificados ni fixture de producción.

## Documentos

ARCHITECTURE.md · DESIGN.md · PROVIDERS.md · BUILD-STATUS.md · LAUNCH-CHECKLIST.md · docs/GOLDEN-AKE473.md.





