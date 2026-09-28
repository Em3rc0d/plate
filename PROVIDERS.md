# Proveedores y contratos

Los proveedores se consumen exclusivamente server-to-server. La disponibilidad real depende de credenciales, saldo y respuesta de cada fuente.

| Proveedor | Propósito | Endpoint | Autenticación |
| --- | --- | --- | --- |
| Masitaprex | Registro primario | `POST https://api.masitaprex.com/v3/consulta/placa` | `x-api-key` |
| ConsultaDatos | Registro fallback | `GET https://api2.consultadatos.com/api/placa/leyenda/{PLATE}` | Bearer |
| PlacApi | Identidad fallback | `POST https://placapi.com/api/vehiculo-pe` | API key |
| PlacApi | SOAT | `POST https://placapi.com/api/soat-pe` | API key |
| PlacApi | CITV | `POST https://placapi.com/api/revision-tecnica-pe` | API key |
| PlacApi | Papeletas | `POST https://placapi.com/api/multas-pe` | API key |

## Masitaprex

Capacidades utilizadas:

- identidad vehicular;
- titular registral actual;
- historial de titulares;
- restricciones devueltas por la fuente.

La ejecución LIVE controlada confirmó el endpoint registral y un costo observado/persistido de **S/ 1.2308** para esa llamada. El valor de `MASITAPREX_COST_PER_QUERY_PEN` debe mantenerse alineado con el costo real vigente; no tratar este documento como tarifa contractual futura.

Se excluyen domicilios y los documentos se enmascaran.

## ConsultaDatos

Permanece como fallback. Comercialmente se limita a capacidades cuyo contrato/respuesta haya sido validado. No asumir equivalencia con Masitaprex para historial o restricciones sin evidencia.

## PlacApi

Endpoints documentados usados por la aplicación:

- `/api/vehiculo-pe`: identidad fallback;
- `/api/soat-pe`: SOAT;
- `/api/revision-tecnica-pe`: CITV;
- `/api/multas-pe`: papeletas.

Cada endpoint consume crédito según contrato. El valor operativo de referencia actual es `PLACAPI_COST_PER_CREDIT_PEN=0.35`, correspondiente al tramo adquirido/evaluado; actualizarlo si cambia el plan.

Una ejecución controlada confirmó SOAT. En esa prueba, CITV y multas devolvieron HTTP 402 por falta de créditos. El código actual no debe imputar costo a esas respuestas 402.

## Enrutamiento

Generación inicial:

1. Masitaprex;
2. ConsultaDatos como fallback cuando corresponda;
3. PlacApi identity si hace falta completar identidad;
4. SOAT, CITV y papeletas según capacidades configuradas.

Refresh de reporte existente:

- reutiliza evidencia registral;
- consulta solo SOAT/CITV/papeletas;
- no debe crear una nueva llamada Masitaprex.

## Costos

Los costos se persisten en `provider_calls`. Son contabilidad operacional, no una factura conciliada del proveedor.

No usar valores históricos de documentación para afirmar margen actual sin revisar:

- precio del proveedor;
- créditos;
- respuestas reales;
- deducciones de Mercado Pago;
- costo persistido en la ejecución.

## Estados

Una respuesta HTTP 200 no convierte automáticamente todo en información disponible. El adaptador normaliza estados por campo/sección.

`NOT_FOUND` requiere una ausencia explícita documentada. Estructuras desconocidas deben quedar `UNAVAILABLE`, no inventarse como listas vacías.

## Sonda

`/admin/providers/probe` ejecuta llamadas reales y puede consumir saldo. Se usa solo para diagnóstico controlado, nunca como health check recurrente.

## Preview

El entorno comercial usa `PREVIEW_PROVIDER_MODE=NONE` por defecto: la consulta anónima valida placa y muestra cobertura sin gastar créditos.

`BASIC` y `FULL` solo se habilitan mediante decisión operacional explícita.
