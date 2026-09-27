export const productName =
  process.env.NEXT_PUBLIC_PRODUCT_NAME || "Vehicle Intelligence PE";
export const legalNotice =
  "Este reporte consolida información disponible en las fuentes consultadas al momento de la consulta. La ausencia de registros no acredita por sí sola la inexistencia de obligaciones, siniestros, gravámenes u otros antecedentes fuera de la cobertura indicada. No reemplaza una revisión mecánica, certificación registral ni asesoría legal profesional.";
export const ttl = {
  identity: 180 * 86400,
  registry: 86400,
  insurance: 21600,
  inspection: 86400,
  fines: 3600,
};
export const labels: Record<string, string> = {
  VERIFIED: "Verificado",
  NOT_FOUND: "Sin registros devueltos",
  UNAVAILABLE: "No disponible",
  NOT_CONFIGURED: "Fuente no configurada",
  STALE: "Información desactualizada",
  CONFLICT: "Información en conflicto",
  READY: "Placa válida",
  PAYMENT_PENDING: "Pendiente de pago",
  PAYMENT_REVIEW: "Pago en revisión",
  PAID: "Pago aprobado",
  REJECTED: "Pago rechazado",
  REPORT_PROCESSING: "Preparando reporte",
  REPORT_READY: "Reporte disponible",
  REPORT_PARTIAL: "Reporte parcial disponible",
  FAILED: "Requiere resolución manual / devolución",
};
