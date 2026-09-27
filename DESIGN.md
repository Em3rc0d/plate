# PlacaClara — sistema visual v0.3

## Auditoría y procedencia

OBSERVED: v0.2 usa fondo #0B0F14, acento menta, ficha inclinada con sombra, icono de escaneo y terminología de configuración en páginas públicas. La cobertura ya deriva de `src/config/providers.ts`; checkout usa `commercialReadiness`; la vista compartida pasa por `sanitizeSharedReport`.

OFFICIAL: brief Trust / Automotive Redesign Pass. Promesa: «La información del auto, clara antes de comprar». Servicio documental peruano, sin afiliación oficial, inspección mecánica ni recomendación de compra.

GENERATED (confianza alta respecto al brief): tokens, composición documental y componentes de esta versión. INFERRED (confianza media, pendiente de usuarios): placa y precio cerca de la primera acción, muestra documental antes de compra y transparencia como argumentos de confianza. No se afirma haber validado comprensión en cinco segundos.

## Personalidad y composición

Clara, práctica, local, documental y profesional. Base clara; marca tipográfica con icono de automóvil; placa con borde y números tabulares; encabezados y filas de documento. El hero contesta qué consultar, qué recibir y sus límites. Una muestra compacta en el hero y una muestra detallada antes del precio. No fotografías decorativas ni servicios externos.

## Tokens GENERATED

| Token CSS        | Valor   | Uso                              |
| ---------------- | ------- | -------------------------------- |
| --bg             | #F6F7F5 | Papel de fondo                   |
| --surface        | #FFFFFF | Formularios y documentos         |
| --surface-2      | #EDF1F0 | Transparencia y notas            |
| --border         | #D4DDDC | Separadores decorativos          |
| --control-border | #788984 | Bordes de controles              |
| --text           | #192D35 | Texto principal                  |
| --muted          | #53646B | Texto secundario                 |
| --accent         | #155C58 | Marca, enlaces y botón principal |
| --accent-strong  | #104843 | Hover                            |
| --success        | #226348 | Información devuelta             |
| --warning        | #80550D | Revisar / desactualizado         |
| --danger         | #A33131 | Conflicto o error real           |
| --report-bg      | #F6F7F5 | Fondo de reporte                 |
| --report-card    | #FFFFFF | Hoja                             |
| --report-text    | #192D35 | Texto de reporte                 |

Texto de botón blanco sobre teal oscuro. Estados siempre con texto: verde sobre #EAF3ED; neutro sobre #EEF2F4; ámbar sobre #FFF3D9; rojo sobre #FBECEC. Ningún estado depende exclusivamente del color. Contraste AA para texto normal y foco perceptible; controles con borde más oscuro que separadores.

## Tipografía, espacios y responsive

Arial/Helvetica/sans-serif del sistema, sin descargas. Cuerpo 16px/1.6, etiquetas 14px, metadatos 13px/1.6. H1 36–54px y 32–40px en móvil; H2 28–36px. Placas monoespaciadas y precios tabulares. Espaciado 4/8/12/16/24/32/48/64/80. Radios 6px controles, 8px documentos. Ancho máximo 1160px, reporte 1000px, formulario 620px. Breakpoints 800px y 420px. Controles >=48px; enlaces de navegación >=44px. Grillas a una columna; filas flexibles; palabras largas se parten; nada depende del hover. A 320px y zoom de texto 200%, sin recorte horizontal.

## Componentes

- Shell: cabecera clara; navegación sencilla; precio accesible también en móvil; footer con identidad legal, RUC, soporte y reclamaciones solo si están configurados. Sin identidad ficticia.
- PlateForm: etiqueta visible, entrada prominente, errores asociados, CTA «Consultar placa»; no cobro al consultar.
- CoverageList: capacidades de providers.ts, con descripción de qué se revisa, qué se ve y limitación; versión compacta para checkout. No anunciar capacidades no habilitadas.
- ReportPreview: server component, datos sintéticos fijos, placa DEMO-000 no consultable, sin personas. Estado/fuente/fecha explícitamente ilustrativos. Si no hay fuentes, mostrar muestra de formato sin resultados ni coberturas prometidas. No realizar consultas.
- Precio: un producto, precio de env, pago único, cobertura real. Sin tiers, descuentos o suscripción.
- Checkout: placa/producto/precio/cobertura/contacto/método. Conservar payloads, consentimiento, rutas y bloqueo de commercialReadiness.
- Reporte: título → estados observados → valores → fuente → fecha → limitaciones. No agregar estados resumidos que oculten discrepancias. Vista compartida usa exclusivamente el resultado saneado existente.
- Accesibilidad: skip link, labels, foco, aria-invalid/describedby, anuncios de carga y resultado, details semántico, reduced motion. Impresión sin acciones, con evidencia visible.

## Estados OFFICIAL (sin cambios de semántica)

| Código         | Descripción pública                        | Color           |
| -------------- | ------------------------------------------ | --------------- |
| VERIFIED       | La fuente devolvió información             | Verde apagado   |
| NOT_FOUND      | La fuente consultada no devolvió registros | Neutro          |
| UNAVAILABLE    | La información no pudo obtenerse           | Neutro          |
| NOT_CONFIGURED | Fuente no habilitada                       | Neutro          |
| STALE          | Información desactualizada                 | Ámbar           |
| CONFLICT       | Datos que no coinciden                     | Rojo controlado |

No transformar NOT_FOUND en inexistencia de antecedentes. No usar verde para cobertura ausente. La verificación describe una respuesta documental, nunca la seguridad del vehículo.

## Patrones prohibidos

Fondos negros dominantes, glow, glassmorphism, gradientes AI, fichas flotantes/inclinadas, escáneres, animaciones en bucle, scores, porcentajes de riesgo, verdictos de compra, logos oficiales, contadores ficticios o garantías de cobertura universal. Movimiento limitado a color/foco/feedback; reduced motion elimina animación y scroll suave.

## Invariantes y validación

No modificar backend, migraciones, contratos, pagos, privacidad, retención, router, PDF ni variables de producción. Sin nuevas dependencias. Proveedores opcionales continúan apagados salvo configuración existente. Validar lint/typecheck/build y navegación responsive local. La comprobación visual no sustituye una prueba de comprensión con compradores reales. Versionar tokens y reglas junto a sus componentes.
