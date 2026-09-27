import type { CanonicalVehicleReport, Finding } from "@/src/vehicle/canonical";
export function findings(r: CanonicalVehicleReport): Finding[] {
  const out: Finding[] = [];
  for (const key of ["insurance", "inspection"] as const) {
    const label = key === "insurance" ? "SOAT" : "Revisión técnica";
    const record = r[key].current ?? r[key].history[0];
    if (record?.status === "EXPIRED")
      out.push({
        severity: "IMPORTANT",
        title: `${label}: certificado devuelto vencido`,
        detail: "Revisa la vigencia actual en la fuente correspondiente.",
      });
    if (
      record?.status === "ACTIVE" &&
      record.validUntil &&
      Date.parse(record.validUntil) - Date.now() < 30 * 86400000
    )
      out.push({
        severity: "REVIEW",
        title: `${label}: vencimiento próximo`,
        detail: `Vence el ${record.validUntil.slice(0, 10)}.`,
      });
  }
  if (r.fines.pending > 0)
    out.push({
      severity: "IMPORTANT",
      title: `${r.fines.pending} papeletas pendientes devueltas`,
      detail:
        "El importe suma solo los montos publicados por las fuentes consultadas.",
    });
  if (r.registry.restrictions.length)
    out.push({
      severity: "IMPORTANT",
      title: "Restricciones registrales devueltas",
      detail:
        "Revisa cada registro y solicita certificación registral actualizada.",
    });
  if (!r.registry.currentOwner)
    out.push({
      severity: "REVIEW",
      title: "Propietario actual no disponible",
      detail: "La consulta no permite confirmar al titular registrado.",
    });
  if (new Set(r.registry.historicalOwners.map((x) => x.displayName)).size > 1)
    out.push({
      severity: "INFO",
      title: "Múltiples identidades en el historial",
      detail:
        "El historial devuelto no acredita por sí solo el número total de transferencias.",
    });
  if (
    r.registry.ownershipSince &&
    Date.now() - Date.parse(r.registry.ownershipSince) < 90 * 86400000
  )
    out.push({
      severity: "REVIEW",
      title: "Cambio de titularidad reciente",
      detail: "La fecha devuelta está dentro de los últimos 90 días.",
    });
  for (const status of [
    "CONFLICT",
    "STALE",
    "UNAVAILABLE",
    "NOT_CONFIGURED",
  ] as const)
    if (r.evidence.some((x) => !x.metadata.unsupported && x.status === status))
      out.push({
        severity: "REVIEW",
        title: {
          CONFLICT: "Discrepancias entre datos",
          STALE: "Información desactualizada",
          UNAVAILABLE: "Fuente o campo no disponible",
          NOT_CONFIGURED: "Fuente no configurada",
        }[status],
        detail: "Consulta la trazabilidad y las limitaciones de cada sección.",
      });
  out.push({
    severity: "INFO",
    title: "Cobertura limitada de papeletas",
    detail:
      "Solo SUTRAN, Lima y Callao. No incluye todas las municipalidades ni papeletas ya pagadas.",
  });
  if (r.registry.ownerIdentityAmbiguous)
    out.push({
      severity: "REVIEW",
      title: "Se detectaron registros históricos que requieren revisión",
      detail:
        "Las identidades o documentos no permiten afirmar un número exacto de propietarios.",
    });
  const missingFuture = [
    "theft",
    "captureOrders",
    "claims",
    "gnv",
    "valuation",
  ].filter((k) =>
    r.evidence.some((e) => e.fieldPath === k && e.status === "NOT_CONFIGURED"),
  );
  if (missingFuture.length)
    out.push({
      severity: "INFO",
      title: "Coberturas adicionales no consultadas",
      detail:
        "Robo, captura, siniestros, GNV y valorización no tienen proveedor integrado. No se acredita ausencia de antecedentes.",
    });
  return out;
}
