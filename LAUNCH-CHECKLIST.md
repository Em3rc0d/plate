# PlacaClara — checklist de operación comercial

Este checklist separa lo ya certificado de lo todavía pendiente. No volver a ejecutar pruebas pagadas solo para “reconfirmar” algo ya demostrado.

## Certificado / implementado

- [x] Supabase productivo y migraciones aplicadas.
- [x] Admin autenticado por rol.
- [x] Mercado Pago Checkout API integrado.
- [x] Tarjeta TEST certificada sin fulfillment.
- [x] Tarjeta LIVE validada con un cargo controlado.
- [x] Idempotencia y prevención de doble pago.
- [x] Masitaprex ejecutado exitosamente en LIVE.
- [x] PlacApi SOAT ejecutado en una prueba controlada.
- [x] Refresh selectivo sin nueva llamada Masitaprex.
- [x] Reporte web + PDF dossier.
- [x] Redelivery sin proveedores.
- [x] Libro de Reclamaciones implementado.
- [x] Dominio propio asociado a Vercel.
- [x] Yape bloqueado por feature flag.
- [x] SEO + funnel compilado en Preview.

## Antes de escalar tráfico

- [ ] Promover el `main` actual a Production.
- [ ] Verificar `https://www.placaclara.com/robots.txt`.
- [ ] Verificar `https://www.placaclara.com/sitemap.xml`.
- [ ] Verificar canonical y `noindex` de superficies transaccionales.
- [ ] Confirmar en Mercado Pago el webhook de producción:
      `https://www.placaclara.com/api/payments/mercado-pago/webhook`.
- [ ] Confirmar recepción/validación de webhook firmado LIVE sin crear un nuevo pago.
- [ ] Conciliar fee/neto del pago LIVE si sigue pendiente.
- [ ] Verificar dominio de Resend y configurar remitente corporativo.
- [ ] Crear/verificar propiedad de Search Console y enviar sitemap.
- [ ] Comprar saldo/créditos PlacApi antes de depender de CITV/papeletas en ventas reales.
- [ ] Revisar política efectiva de retención y privacidad con criterio legal/comercial.
- [ ] Mantener `YAPE_CHECKOUT_ENABLED=false` hasta una certificación separada.

## Validación de release

Para cambios nuevos:

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
node --test tests/payment-safety.test.mjs tests/payment-sql.test.mjs tests/pdf-document.test.mjs
```

Además:

- pagos: comprobar idempotencia y cero cobros duplicados;
- proveedores: comprobar número/costo exacto de llamadas;
- refresh: confirmar que no repita Masitaprex;
- UI: revisar desktop/mobile;
- SQL: migraciones append-only;
- producción: promover únicamente el commit/artifact validado.

## Evidencia

Guardar IDs internos, estados, timestamps y costos. No añadir secretos, DNI completo, domicilio ni comprobantes a documentación pública.
