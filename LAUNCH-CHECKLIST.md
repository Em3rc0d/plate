# Apertura comercial — acciones humanas exactas

El build compilado no significa que el servicio ya pueda vender. Este checklist requiere cuentas, identidades y evidencia real. No contiene automatizaciones de tests.

1. Supabase ya fue creado en producción (`vehicle-intelligence-pe`). Configurar en Vercel NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY/publishable key y SUPABASE_SERVICE_ROLE_KEY; no publicar service role.
2. Migraciones ya aplicadas: `initial_vehicle_platform`, `finishing_launch_controls` y `add_fk_indexes`. No ejecutar `schema.sql` como migración adicional. Para instalaciones nuevas, aplicar los tres archivos en orden.
3. Crear usuario confirmado de Auth y asignar raw_app_meta_data.role=admin. Cerrar signup público. Entrar en /admin.
4. Configurar MASITAPREX_API_KEY y su costo real por consulta. Confirmar habilitación del plan y uso de los datos.
5. Configurar PLACAPI_API_KEY y costo por crédito para identidad/SOAT/CITV/papeletas.
6. Opcional: configurar CONSULTADATOS_TOKEN. Corroborar contrato real Leyenda en la sonda; no prometer historial o restricciones adicionales sin evidencia.
7. Configurar al menos Yape o Plin: titular de cuenta, teléfono y QR propio si se usa. Verificar importe del producto y destinatario real.
8. Configurar Resend y remitente verificado si se quiere email. Opcional: sin ello el estado es NOT_CONFIGURED y la entrega se consulta en la página del pedido; no es bloqueo técnico de venta.
9. Completar BUSINESS_LEGAL_NAME, BUSINESS_RUC, BUSINESS_ADDRESS, SUPPORT_EMAIL y PRIVACY_EMAIL. Revisar las páginas de privacidad/términos/reembolsos, fijar versiones y la política efectiva. No inventar datos. Definir retención solo tras confirmar obligaciones del negocio; blank mantiene borrado desactivado.
10. Configurar BOOK_OF_CLAIMS_URL con el canal real del negocio. No se implementa ni certifica un libro de reclamaciones automático.
11. Configurar PostHog/Sentry si se utilizarán; ambos son opcionales. OpenAI también opcional. Confirmar que no se envían documentos, domicilios ni comprobantes.
12. Desplegar en Vercel, configurar NEXT_PUBLIC_SITE_URL con el origen final y comprobar capacidad para requests de 300s. Mantener PREVIEW_PROVIDER_MODE=BASIC salvo decisión expresa. No abrir campañas todavía.
13. Abrir /admin/readiness. Resolver todos los BLOCKER. READY TO SELL indica configuración disponible, no validación legal o de consultas externas.
14. Ejecutar /admin/providers/probe con AKE473. La sonda consume saldo y consulta los adaptadores configurados. No inventar respuestas si falla.
15. Comparar con docs/GOLDEN-AKE473.md, accesible desde la sonda tras autenticación. Confirmar 2014 fabricación vs 2015 modelo y la discrepancia histórica de CITV. Si las fuentes actuales difieren, conservar evidencia y no forzar coincidencia con la observación anterior.
16. Realizar una compra interna real autorizada: placa, contacto, políticas, pago al destinatario correcto y comprobante. No usar pruebas ficticias como evidencia de operación comercial.
17. Verificar manualmente: comprobante privado; abono real y aprobación; consultas registradas; reporte y estados; PDF; email solo si configurado; enlace compartible sin propietario, documentos ni datos de pago. Confirmar que redelivery no agrega llamadas a proveedores y que el ID del pedido se mantiene sin otro pago. Revisar recuperación únicamente sobre un fallo real o pedido interno controlado, nunca interrumpir pedidos de clientes para simularlo.
18. Solo después de completar lo anterior, abrir tráfico público.

## Evidencia que guardar

Fecha, ID interno de pedido/reporte, estado de cada proveedor y costos estimados. No añadir DNI completo, domicilio, comprobantes ni secretos a documentación pública. Si falta un requisito, mantener lanzamiento pendiente; no convertir ausencia de evidencia en PASS.

## Lean launch cost gate

Before the first paid order confirm:

- `LAUNCH_PROFILE=REGISTRY_LEAN`.
- `PREVIEW_PROVIDER_MODE=NONE`.
- Resend/PostHog/Sentry/OpenAI/ConsultaDatos/PlacApi variables are blank.
- Masitaprex is the only paid provider configured.
- Public marketing shows only capabilities supplied by configured providers.
- Do not switch to `FULL` until SOAT + CITV + fines have validated providers.
