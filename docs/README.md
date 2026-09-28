# PlacaClara — documentación

Este directorio es el índice operativo del repositorio. La documentación está separada por propósito para evitar usar evidencia histórica como si fuera configuración vigente.

## Documentos canónicos

- [README](../README.md): entrada al proyecto y ejecución local.
- [Arquitectura](../ARCHITECTURE.md): límites, flujo de pagos, proveedores, reportes y seguridad.
- [Diseño](../DESIGN.md): sistema visual y reglas de presentación.
- [Proveedores](../PROVIDERS.md): contratos, capacidades, costos y semántica de cada fuente.
- [Mapa del repositorio](./REPOSITORY-MAP.md): responsabilidad de cada carpeta.
- [Operación](./OPERATIONS.md): despliegue, pagos, proveedores, entrega, SEO y acciones seguras.
- [Checklist de lanzamiento](../LAUNCH-CHECKLIST.md): gates pendientes y ya certificados.
- [Estado de build](../BUILD-STATUS.md): fotografía técnica del estado actual.

## Evidencia histórica

Estos archivos documentan decisiones o certificaciones de momentos concretos. No sustituyen al código ni a la configuración del entorno actual.

- [Golden AKE473](./GOLDEN-AKE473.md)
- [Mercado Pago TEST certification](./MERCADO-PAGO-TEST-CERTIFICATION.md)
- [Trust redesign](./TRUST-REDESIGN.md)
- [Customer PDF dossier](./CUSTOMER-PDF-DOSSIER.md)
- [Finishing changes](./FINISHING-CHANGES.md)
- [Lean launch](../LEAN-LAUNCH.md)

## Precedencia

Si dos fuentes se contradicen, usar este orden:

1. código ejecutable y migraciones aplicadas;
2. configuración real del entorno;
3. documentación canónica actual;
4. checklists y estado de build;
5. documentos históricos.

Nunca copiar secretos, tokens, datos completos de propietarios ni comprobantes a documentación pública.
