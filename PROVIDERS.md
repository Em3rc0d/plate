# Proveedores y contratos

Los endpoints se implementan exclusivamente servidor a servidor. Este documento describe contratos y comportamiento del código; la disponibilidad real depende de las credenciales y saldo del entorno. Los ejemplos públicos se usan únicamente para comprender contratos, nunca como respuesta de producción.

| Proveedor     | Propósito                  | Endpoint                                                     | Autenticación                  |
| ------------- | -------------------------- | ------------------------------------------------------------ | ------------------------------ |
| Masitaprex    | Registro primario          | POST https://api.masitaprex.com/v3/consulta/placa            | x-api-key / MASITAPREX_API_KEY |
| ConsultaDatos | Registro fallback          | GET https://api2.consultadatos.com/api/placa/leyenda/{PLATE} | Bearer / CONSULTADATOS_TOKEN   |
| PlacApi       | Identidad fallback/preview | POST https://placapi.com/api/vehiculo-pe                     | x-api-key / PLACAPI_API_KEY    |
| PlacApi       | SOAT                       | POST https://placapi.com/api/soat-pe                         | misma                          |
| PlacApi       | CITV                       | POST https://placapi.com/api/revision-tecnica-pe             | misma                          |
| PlacApi       | Papeletas                  | POST https://placapi.com/api/multas-pe                       | misma                          |

POST body {"placa":"PLACA_NORMALIZADA"}. GET no body. Timeout 12s; hasta 2 intentos seguros. Los costos por intento se registran y configuran por env, no son precios actuales certificados.

## Masitaprex

Documentación observada: https://masitaprex.com/API-Docs . Respuesta success/data/result; se admite también data plano. Campos case-insensitive. AnoFab→manufactureYear; AnMode→modelYear; Marca, Modelo, Color, NumSerie, NumMotor, NoVin, DescTipoComb, DescTipoCarr, Estado, NumPartida, FechaPropi, NoVers. Marcadores ######## se omiten como datos ausentes.

LISTPROP: propietario/nombres, documentos, fechaProp, tipoDocumento. LISTPROPHIST: nombres/propietario, documentos. Se excluye dirección; documentos enmascarados. Todos los titulares actuales se preservan. LISTGRAVLEV vacío produce NOT_FOUND solo en restricciones. Un registro de gravamen desconocido no se representa como lista vacía válida.

Costo configurable mediante `MASITAPREX_COST_PER_QUERY_PEN`. El costo debe mantenerse alineado con el plan/saldo real y con lo observado en `provider_calls`; no asumir que un valor histórico del repositorio sigue vigente.

## ConsultaDatos

Endpoint/autenticación aportados en el brief. No se pudo corroborar un contrato completo de respuesta en la página pública: https://www.consultadatos.com/ . Adaptador transporta y lee envolturas data/datos/resultado/result y alias registrales conocidos. Campos desconocidos quedan UNAVAILABLE; no se adivinan propietarios. Validar la respuesta real con una clave del plan Leyenda antes de abrir ventas. Se activa cuando Masitaprex no devuelve marca o titulares actuales. No se asume historial equivalente si no aparece.

Costo CONSULTADATOS_COST_PER_QUERY_PEN default 0.026, estimado del brief.

## PlacApi

Documentación consultada:

- https://placapi.com/docs/vehiculo-peru
- https://placapi.com/docs/soat-peru
- https://placapi.com/docs/revision-tecnica-peru
- https://placapi.com/docs/multas-peru

Wrapper status/data/fetchedAt/cost. Datos mínimos de vehículo: marca,linea,modelo (año),color,vin. No datos de propietario.

SOAT/CITV: certificados[], vigenciaInicio, vigenciaFin, estado, numeroPoliza/numero, aseguradora/centro, resultado. Se ordena y elige actual por fechas y VIGENTE; vigente=true sin certificado coincidente genera conflicto. No confiar en array order. La fuente CITV declara historial limitado a tres certificados, no historial completo.

Multas: total,pendientes,montoPendiente,papeletas[],cobertura. Campos numero,fecha,codigo,descripcion,monto,estado,entidad,origen. Monto null se conserva como desconocido. SUTRAN no publica importes; la suma no es necesariamente deuda total. Cobertura nacional/lima/callao: ok/sin_datos/error. No incluye pagadas ni todas las municipalidades. Cobertura incompleta fuerza reporte parcial.

Costo: créditos devueltos × `PLACAPI_COST_PER_CREDIT_PEN`. Si la respuesta no trae costo se estima 1 crédito por intento. El valor contable debe actualizarse cuando cambie el tramo comprado; el template actual usa el costo unitario del tramo de 349 COP como referencia operativa.

## Enrutamiento

Generación inicial: registro Masitaprex → ConsultaDatos como fallback; identidad puede completarse con PlacApi vehicle; SOAT, CITV y papeletas se consultan en paralelo. Refresh de un reporte existente: reutiliza la evidencia registral ya persistida y consulta únicamente SOAT, CITV y papeletas. Cualquier estructura desconocida se registra como información no disponible. Los datos normalizados se guardan; payloads originales se descartan.

## Registro de capacidades y sonda V0.2

src/config/providers.ts declara capacidades por adaptador; cada módulo exporta su conjunto. ConsultaDatos se limita comercialmente a identidad y titular hasta validar equivalencia de otros campos. Las cinco coberturas futuras no tienen proveedor y permanecen NOT_CONFIGURED.

/admin/providers/probe lanza todos los adaptadores con Promise.allSettled, no solo el fallback necesario. Registra costos por intento y muestra HTTP, latencia acumulada, timestamp, capacidades interpretadas, errores y una matriz limitada sin identidad del propietario. La matriz marca diferencias como revisión; no fuerza al proveedor a coincidir con AKE473. Una respuesta HTTP 200 puede tener campos UNAVAILABLE, visibles por separado.

La sonda consume créditos cuando existen claves configuradas. Debe usarse solo para diagnóstico manual controlado; no como health check periódico. El formato y alias documentados se conservan y ninguna llamada se suplanta con el documento golden.

Preview: BASIC por defecto; NONE sin consulta; FULL activa la cadena registral de forma explícita. La caché siempre guarda únicamente plate/brand/model/status, no propietarios.
