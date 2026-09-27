# AKE473 — referencia de validación manual

Observaciones aportadas por el usuario, obtenidas en investigación manual previa. No son una consulta ejecutada en este batch, no constituyen estado actual certificado y nunca se inyectan en producción ni se usan como fallback. Documento administrativo: contiene un nombre de titular; no publicarlo como página abierta.

| Campo                          | Observación previa                |
| ------------------------------ | --------------------------------- |
| Placa                          | AKE473                            |
| Marca                          | RENAULT                           |
| Modelo                         | LOGAN                             |
| Año de fabricación             | 2014                              |
| Año de modelo                  | 2015                              |
| Color                          | GRIS BEIGE                        |
| VIN / serie                    | 9FBLSRADBFM499965                 |
| Motor                          | K7MF710Q170976                    |
| Estado registral               | EN CIRCULACION                    |
| Titular registrado observado   | Carlos Alberto Vasquez Betancourt |
| Fecha de titularidad observada | 14/03/2022                        |
| SOAT — aseguradora             | Rimac Seguros                     |
| SOAT — vigencia hasta          | 25/09/2027                        |
| CITV — resultado               | APROBADO                          |
| CITV — vigencia hasta          | 06/07/2027                        |
| CITV — certificador            | CORPORACION SOLPE SAC             |

Un proveedor económico devolvió CITV 2018–2019 mientras otra fuente más fresca devolvió vigencia en 2027. Elegir certificado vigente respaldado por fechas y estado, conservando fecha de consulta y discrepancias. La aparición de un dato nuevo no debe forzarse a coincidir con esta referencia.

En /admin/providers/probe introducir AKE473, comparar fabricación/modelo y vigencia CITV. La sonda solo muestra presencia de propietario, no su nombre; para comparar identidad, usar el reporte privado de una compra interna autorizada. Duplicados entre titular vigente e historial y documentos incompatibles requieren revisión: no contar filas como propietarios únicos.

Registrar fecha, proveedor, alias, estados normalizados y diferencias sin copiar DNI ni domicilios en logs. No es un test automatizado.
