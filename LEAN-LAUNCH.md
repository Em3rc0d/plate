# Lean Launch — documento histórico

> **Estado: histórico.** Este archivo conserva las decisiones de la fase inicial de PlacaClara y no describe el runtime comercial actual. Para operación vigente usa [docs/README.md](docs/README.md), [docs/OPERATIONS.md](docs/OPERATIONS.md) y [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md).

## Decisión original

La primera estrategia de lanzamiento buscaba minimizar costo fijo usando Vercel/Supabase y una cobertura registral mínima con Masitaprex, manteniendo integraciones adicionales apagadas hasta validación.

`LAUNCH_PROFILE=REGISTRY_LEAN` y `PREVIEW_PROVIDER_MODE=NONE` nacieron en esta etapa para separar disponibilidad comercial de proveedores no certificados y evitar gasto antes del pago.

## Qué cambió después

Posteriormente se integraron y certificaron componentes que este documento original no contemplaba como estado operativo:

- Mercado Pago Checkout API;
- pago LIVE controlado;
- PlacApi para fuentes dinámicas;
- Libro de Reclamaciones;
- reporte dossier web/PDF;
- métricas financieras;
- dominio propio;
- SEO técnico y funnel first-party.

Por tanto, las referencias históricas a “Yape/Plin manual”, “solo Masitaprex” o integraciones todavía inexistentes no deben usarse para configurar Production.

## Principio que sigue vigente

Mantener gates explícitos y no gastar créditos antes de que el flujo comercial lo justifique. La fuente de verdad de capacidades es el código + configuración real del entorno.
