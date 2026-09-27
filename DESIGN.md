# Vehicle Intelligence PE — sistema de diseño

## Provenance

OFFICIAL: requisitos del brief aportado por el usuario; no significa afiliación gubernamental.
OBSERVED: contratos públicos consultados de PlacApi y Masitaprex; no son llamadas reales autenticadas.
INFERRED: separación de acceso al pedido y reporte, bloqueo de compra sin servicios esenciales.
GENERATED: composición de landing, componentes, escalas y reglas de interfaz.

## Promesa OFFICIAL

Consulta una placa y consolida la información registral, administrativa y documental disponible para revisar un vehículo usado antes de comprarlo.

## Dirección GENERATED

Inteligencia documental automotriz sobria. Landing oscura con tipografía protagonista y una ficha estructural de reporte claramente ilustrativa, sin datos vehiculares inventados. Reporte claro y legible al imprimir. Sin logos oficiales, badges de alianza, contadores ficticios ni puntajes de riesgo.

## Tokens OFFICIAL

| Token         | Valor                 |
| ------------- | --------------------- |
| bg            | #0B0F14               |
| surface       | #111821               |
| surface-2     | #17212B               |
| border        | rgba(255,255,255,.10) |
| text          | #F4F7FA               |
| muted         | #93A1AF               |
| accent        | #6EE7C7               |
| accent-strong | #35CFA7               |
| warning       | #F3C969               |
| danger        | #F18484               |
| report-bg     | #F7F8FA               |
| report-card   | #FFFFFF               |
| report-text   | #111827               |

Tipografía sistema Arial/Helvetica/sans; sin dependencia de descarga de fuente. Números tabulares en placa, precio y métricas. Cuerpo 16px; formularios 14px; metadatos 12–13px. Títulos 36–62px desktop, 30–46px móvil. Espaciado 4/8/12/16/24/32/48/64; cards 12px, controles 10px.

## Componentes GENERATED

Button con variante primary/outline/ghost y composición Slot (patrón shadcn). Tabs accesibles Radix para Yape/Plin. Formularios HTML semánticos con labels, errores role=alert y estados de procesamiento. Tabla administrativa desplazable horizontalmente. Details/summary para FAQ. Evidencia con texto de estado además de color.

## Responsive y accesibilidad GENERATED

Ancho máximo 1160px; reporte 1000px; formularios aislados 620px. A 800px hero, cards y checkout pasan a una columna. Padding móvil 16px. Controles táctiles >=48px. Skip link, foco visible, navegación con teclado, etiquetas explícitas, inputs semánticos, contraste y estados sin depender solo del color. Reduce motion elimina transiciones y scroll suave. Reporte imprime sin botones ni navegación. Evitar esconder contenido crítico detrás de hover.

## Estados OFFICIAL

VERIFIED: dato devuelto. NOT_FOUND: cero resultados de la fuente consultada. UNAVAILABLE: consulta/campo no obtenido. NOT_CONFIGURED: fuente no habilitada. STALE: frescura vencida. CONFLICT: evidencia incompatible. No convertir ausencia de respuesta en ausencia de deuda. No ofrecer “compra segura” ni “sin accidentes”.

## UX INFERRED

Consultar no cobra. Checkout no acepta compra sin DB, proveedor y medio de pago; el correo de entrega es opcional. Comprobante aprobado solo tras confirmar abono real. Pedido fallido dice resolución manual/devolución y no invita a pagar otra vez. La acción de compartir crea una vista separada sin identidad; el enlace privado se describe como secreto. Limitaciones visibles antes y después de la compra.

## Versionado

V0.1: tokens en app/globals.css; componentes bajo components/. Cualquier cambio de estado o vocabulario debe reflejarse en labels, web, PDF y este documento. No hay suite de regresión visual por instrucción del brief.

## V0.2 — cierre operativo GENERATED / INFERRED

Se conserva composición, tokens y responsive. CoverageList deriva ofertas de capacidades habilitadas. Sin fuente no se anuncia robo/captura/siniestros/GNV/valorización. El reporte muestra estas secciones con NOT_CONFIGURED y texto explícito, nunca verde.

Resumen: verificaciones por sección, hallazgos y secciones con cobertura parcial/no disponible. Etiqueta documental derivada de evidencia, sin score. Propietarios ambiguos no muestran un conteo exacto. NOT_FOUND no se traduce en inexistencia.

Pago: ID completo, placa, monto, método y estado siempre visibles. Se evita prometer correo sin configuración; el pedido puede actualizarse en pantalla sin nuevas llamadas a proveedores. Consentimiento requerido sin marketing preseleccionado, con links a políticas y persistencia de versiones.

Admin: botón de recuperación solo para fallidos/pagados sin reporte o intentos vencidos; edad visible. Reenviar entrega y reintentar PDF están separados de actualizar fuentes. Actualizar fuentes advierte consumo de saldo. Readiness usa READY/OPTIONAL/BLOCKER en texto. Retención muestra elegibilidad antes de una ejecución explícita.

Vista compartible sin nombres, documentos, direcciones, email, teléfono, pago, metadatos de titularidad ni resumen libre de IA. La vista privada conserva el botón para crear/copiar ese enlace, nunca copia accidentalmente la URL privada.
