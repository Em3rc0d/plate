# PlacaClara — Trust / Automotive redesign

## Alcance y resultado

Rediseño de presentación sobre la aplicación existente. Rama local: `design/placaclara-light-trust`. Base: `4fa289f1b41573f349065d14c9ed2f559e3cfd55`. No despliegue ni push; sin cambios en variables de producción o datos de Supabase.

La portada pasa a una composición documental clara: placa y consulta inmediata, precio cerca de la acción, muestra ilustrativa del reporte, cobertura derivada de proveedores habilitados, tres pasos y explicación de los seis estados. El checkout y los reportes usan el mismo lenguaje visual. Las páginas legales y admin heredan los tokens sin reestructurar sus flujos.

## Antes → después

| Antes                                               | Después                                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Fondo oscuro #0B0F14 y acento menta                 | Fondo #F6F7F5, hojas blancas, texto #192D35, teal #155C58                            |
| Ficha inclinada, sombra fuerte, icono de escaneo    | Documento recto, placa delimitada e icono de automóvil                               |
| Tarjetas genéricas y lenguaje de configuración      | Módulos: qué se consulta, qué se ve y cuál es su límite                              |
| Solo estructura abstracta del reporte               | Muestra con placa ficticia DEMO-000, identidad, estados, fuente y fecha ilustrativos |
| Precio en panel de landing SaaS                     | Una ficha de compra con producto, cobertura y pago único                             |
| Estados principalmente dentro de la evidencia       | Estados antes de los valores; fuente y fecha seguidas por limitaciones               |
| Cobertura incompleta mencionada en textos generales | Marketing y muestra restringidos a `enabledCapabilities()`                           |

`DESIGN.md` contiene los tokens, tipografía, espaciado, reglas responsive, procedencia, estados y patrones prohibidos.

## Archivos modificados

| Archivo                                           | Cambio                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------- |
| `DESIGN.md`                                       | Auditoría y especificación visual v0.3                                          |
| `app/globals.css`                                 | Tokens claros; documentos, formularios, reportes, responsive, foco e impresión  |
| `app/(marketing)/page.tsx`                        | Hero, muestra, módulos, pasos, transparencia, precio y preguntas                |
| `components/marketing/report-preview.tsx` (nuevo) | Muestra sintética, limitada por capacidades configuradas                        |
| `components/marketing/shell.tsx`                  | Cabecera automotriz, acceso móvil a precio, soporte e identidad legal existente |
| `components/marketing/plate-form.tsx`             | Entrada prominente, validación accesible y teclado móvil                        |
| `components/marketing/coverage-list.tsx`          | Módulos documentales y versión compacta para checkout                           |
| `app/consulta/page.tsx`                           | Copy y paso del readiness comercial a la UI                                     |
| `components/checkout/preview.tsx`                 | Cobertura explícita, feedback accesible y compra bloqueada sin readiness        |
| `app/checkout/page.tsx`                           | Ficha de producto, precio, cobertura y contacto                                 |
| `components/checkout/order-form.tsx`              | Estado ocupado, consentimiento legible y paneles accesibles Yape/Plin           |
| `app/pago/[orderId]/page.tsx`                     | Resumen etiquetado de placa, importe, método, estado e ID                       |
| `components/report/report-view.tsx`               | Jerarquía documental de estados, datos, fuentes, fecha y límites                |
| `app/compartir/[shareCode]/page.tsx`              | Procedencia por sección usando solo datos ya saneados; fecha de Lima            |
| `app/layout.tsx`                                  | Descripción sin anunciar coberturas opcionales; atributo de scroll de Next      |
| `src/config/product.ts`                           | Nombre predeterminado PlacaClara; etiquetas y semántica intactas                |
| `docs/TRUST-REDESIGN.md`                          | Entrega y evidencia de validación                                               |

## Decisiones inferidas

- Acercar el precio a la primera consulta y mantener acceso a precio en la cabecera móvil.
- Usar una placa deliberadamente no consultable, DEMO-000, para impedir que la muestra se interprete como un reporte real. El formulario conserva su ejemplo ABC-123.
- Mostrar una muestra compacta en el hero y una detallada antes de la compra. Con cero proveedores se muestra solo el formato y se declara la falta de cobertura.
- Usar tipografía del sistema, sin fuentes, imágenes ni servicios externos adicionales.
- Añadir el mismo readiness comercial al enlace de compra de la consulta, además del bloqueo de checkout ya existente; no cambia contratos de API.
- Corregir paneles ausentes en las pestañas Yape/Plin, detectados durante la revisión automática de accesibilidad. El payload y el flujo de pago se conservan.

## Validación

- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS.
- `pnpm build`: PASS, build de producción sin rutas de prueba.
- `git diff --check`: PASS.
- Navegador Chromium local: portada, consulta, checkout, términos y ReportView con fixture sintético.
- Reflow sin desbordamiento horizontal a 320, 390 y 768 px en las cinco superficies; revisión visual a 1440 px. Comprobación adicional con texto ampliado.
- Campo y CTA visibles en el primer viewport móvil de 390 × 844.
- Axe, reglas WCAG 2 A/AA y 2.1 AA: cero infracciones detectadas en esas cinco superficies tras corregir las pestañas.
- Perfil local simulado Masitaprex: cuatro módulos registrales; cero módulos SOAT/CITV/papeletas anunciados. Sin DB ni credenciales reales, no se realizan consultas al proveedor.
- Formulario: error de placa, normalización ABC-123 → ABC123, navegación y POST a preview; respuesta visible sin compra cuando readiness es falso.
- Checkout: botón de pago deshabilitado cuando readiness es falso.
- Reduced motion respetado; acciones del reporte ocultas al imprimir.
- Cero errores de ejecución registrados por el navegador en la prueba final del flujo.
- No cambios en `src/providers`, `src/db`, `src/orders`, `src/reports`, `src/auth`, `app/api`, `proxy.ts`, migraciones, dependencias ni lockfile. Sanitizador compartido, masking, autorización, PDF, contratos y semántica se preservan.

## Límites de la validación

No se probó el circuito de pago con abono real, proveedor autenticado, entrega de correo o Supabase. Las rutas privadas/compartidas de producción no se abrieron; ReportView se inspeccionó con datos sintéticos y la vista compartida mediante revisión del código. La generación de PDF no se ejecutó; su implementación permanece intacta. No se cargaron datos personales ni la placa AKE473 en marketing.

No se puede afirmar comprensión en cinco segundos ni mejora de confianza sin pruebas con compradores reales. Las comprobaciones de Axe y reflow no equivalen a una auditoría completa con lectores de pantalla. La muestra refleja únicamente lo habilitado en el entorno donde se compila la página, siguiendo el comportamiento existente.

Las fixtures, las claves ficticias de QA y las rutas temporales quedaron fuera del código entregado. La revisión no configura proveedores, identidad legal ni pagos de producción.
