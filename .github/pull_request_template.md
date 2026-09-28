## Qué cambia

Describe el cambio y por qué es necesario.

## Riesgo

- [ ] No cambia rutas/contratos públicos sin documentarlo.
- [ ] No introduce secretos ni PII.
- [ ] No altera pagos, proveedores o SQL, o el cambio está explícitamente descrito.
- [ ] No aumenta llamadas pagadas a proveedores de forma accidental.

## Validación

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm build`
- [ ] Tests relevantes ejecutados.
- [ ] Si hubo migración: es append-only y se validó en entorno seguro.
- [ ] Si hubo pagos: se preserva idempotencia y no se habilita doble cobro.
- [ ] Si hubo proveedores: se verificó cantidad/costo de llamadas.
- [ ] Si hubo UI: mobile + desktop revisados.

## Operación

- [ ] Variables nuevas documentadas en `.env.example`.
- [ ] Runbook/checklist actualizado si cambia comportamiento operativo.
- [ ] No requiere promover a producción para comprobarse.
