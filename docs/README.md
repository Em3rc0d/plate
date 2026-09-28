# PlacaClara — documentación

Este directorio es el índice operativo del repositorio. La documentación está separada por propósito para evitar usar evidencia histórica como si fuera configuración vigente.

## Documentos canónicos

- [README](../README.md): entrada al proyecto, ejecución local y mapa rápido.
- [Arquitectura](../ARCHITECTURE.md): límites del sistema, flujo de pago, proveedores, reportes y seguridad.
- [Diseño](../DESIGN.md): sistema visual y reglas de presentación.
- [Proveedores](../PROVIDERS.md): contratos, capacidades y semántica de cada fuente.
- [Mapa del repositorio](./REPOSITORY-MAP.md): responsabilidad de cada carpeta y reglas de dependencia.
- [Operación](./OPERATIONS.md): despliegue, pagos, proveedores, entrega y acciones seguras.

## Lanzamiento y operación

- [Checklist de lanzamiento](../LAUNCH-CHECKLIST.md): gates antes de abrir tráfico.
- [Estado de build](../BUILD-STATUS.md): evidencia de validaciones realizadas; puede ser histórica.
- [Golden AKE473](./GOLDEN-AKE473.md): referencia administrativa controlada. No es fixture comercial ni fallback.

## Evidencia histórica

Estos archivos describen decisiones o certificaciones de momentos concretos. No sustituyen al código ni a la configuración actual.

- [Mercado Pago TEST certification](./MERCADO-PAGO-TEST-CERTIFICATION.md)
- [Trust redesign](./TRUST-REDESIGN.md)
- [Finishing changes](./FINISHING-CHANGES.md)
- [Lean launch](../LEAN-LAUNCH.md)

## Precedencia

Cuando dos fuentes se contradicen, usar este orden:

1. código ejecutable y migraciones aplicadas;
2. configuración real del entorno;
3. documentación canónica actual;
4. checklists y estado de build;
5. documentos históricos.

Nunca copiar secretos, tokens, datos completos de propietarios ni comprobantes a documentación pública.
