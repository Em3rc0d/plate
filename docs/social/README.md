# Social editorial — PlacaClara
Estado: ACTIVE_FOR_DRAFTING_ONLY (v1, 2026-10-12).

Este módulo fija la autoridad de hooks, CTA, diseño social, fuentes, novedad y medición para publicaciones destinadas a vender reportes documentales vehiculares en Perú, **sin** convertir la biblioteca en un publicador.

Lee en orden:
1. [Contrato editorial y límites comerciales](SOCIAL_EDITORIAL_CONTRACT.md)
2. [Política JSON versionada](EDITORIAL_CONTRACT.v1.json)
3. [Esquema de paquete](CONTENT_PACKAGE.v1.schema.json)
4. [Ejemplo sintético intencionalmente bloqueado](fixtures/DRAFT.example.json)
5. [Preflight offline](preflight.mjs)
6. [Gate de lanzamiento y evidencia faltante](RELEASE_GATES.md)
7. [3S4F — heurística experimental de atención](3S4F.md)

### Pruebas (Node 22, sin instalar paquetes ni consultar APIs)
```bash
node --test tests/social-editorial.test.mjs
node docs/social/preflight.mjs docs/social/fixtures/DRAFT.example.json
```
La segunda llamada DEBE devolver exit code 1 y estado BLOCKED: la fixture no representa un post real listo para publicar.

**No confundir** una validación de forma y receipts autodeclarados con evidencia independiente de proveedor, producto, diseño o publicaciones. Sin cola Scheduled confiable, el estado de novedad permanece REVIEW_REQUIRED.

Toda copia publicitaria debe comprobar el alcance real a través de src/config/providers.ts, src/config/commercial.ts, src/config/env.ts y el aviso de src/config/product.ts. Una simulación no puede convertirse en una afirmación comercial.

## Pilotos registrados (no certificados)

- [PC-20261012-COVERAGE-DATE-001](pilots/PC-20261012-COVERAGE-DATE-001/README.md): visual premium aprobado como dirección, normalizado a 1080×1920 para revisión; release DRAFT/BLOCKED por brand/safe-zone/novelty/commercial snapshot y QA en plataforma pendientes.

## Heurística 3S4F

`3S4F` se registra como marco creativo **EXPERIMENTAL / NON-SCIENTIFIC** para diseñar hooks y tensión narrativa. Puede intensificar el primer segundo, pero nunca sustituye evidencia, verificación de claims, novedad, QA, legal ni aprobación. Ver [3S4F.md](3S4F.md).
