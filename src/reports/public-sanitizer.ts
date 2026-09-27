import type {
  CanonicalVehicleReport,
  Certificate,
  ReportRow,
  EvidenceStatus,
} from "@/src/vehicle/canonical";
import { upgradeReport, futureSections } from "./upgrade";
function sectionStatus(
  report: CanonicalVehicleReport,
  key: string,
): EvidenceStatus {
  const evidence = report.evidence.filter(
    (e) => e.fieldPath === key || e.fieldPath.startsWith(key + "."),
  );
  for (const status of [
    "CONFLICT",
    "UNAVAILABLE",
    "STALE",
    "NOT_CONFIGURED",
  ] as const)
    if (evidence.some((e) => e.status === status)) return status;
  return evidence.some((e) => e.status === "VERIFIED")
    ? "VERIFIED"
    : evidence.some((e) => e.status === "NOT_FOUND")
      ? "NOT_FOUND"
      : "UNAVAILABLE";
}
function certificate(value: Certificate | undefined) {
  return value
    ? {
        issuer: value.issuer,
        validFrom: value.validFrom,
        validUntil: value.validUntil,
        status: value.status,
        result: value.result,
      }
    : undefined;
}
export function sanitizeSharedReport(row: ReportRow) {
  const r = upgradeReport(row.report_json);
  const insuranceStatus = sectionStatus(r, "insurance"),
    inspectionStatus = sectionStatus(r, "inspection"),
    finesStatus = sectionStatus(r, "fines"),
    restrictionsStatus = sectionStatus(r, "registry.restrictions");
  const findings: string[] = [];
  if (r.fines.pending > 0 && finesStatus !== "UNAVAILABLE")
    findings.push("La consulta devolvió papeletas pendientes.");
  if (r.registry.restrictions.length && restrictionsStatus !== "UNAVAILABLE")
    findings.push("La consulta devolvió registros de restricciones.");
  if (
    r.insurance.history.some((c) => c.status === "EXPIRED") &&
    !r.insurance.current
  )
    findings.push(
      "El SOAT más reciente devuelto no está confirmado como vigente.",
    );
  if (
    r.inspection.history.some((c) => c.status === "EXPIRED") &&
    !r.inspection.current
  )
    findings.push(
      "La revisión técnica más reciente devuelta no está confirmada como vigente.",
    );
  if (r.evidence.some((e) => e.status === "CONFLICT"))
    findings.push(
      "Existen datos documentales en conflicto; revisar el reporte privado.",
    );
  return {
    id: row.id,
    plate: r.identity.plate,
    brand: r.identity.brand,
    model: r.identity.model,
    manufactureYear: r.identity.manufactureYear,
    modelYear: r.identity.modelYear,
    generatedAt: r.generatedAt,
    status: row.status,
    insurance: {
      status: insuranceStatus,
      current: certificate(r.insurance.current),
      latest: certificate(r.insurance.history[0]),
    },
    inspection: {
      status: inspectionStatus,
      current: certificate(r.inspection.current),
      latest: certificate(r.inspection.history[0]),
    },
    fines: {
      status: finesStatus,
      count: ["VERIFIED", "NOT_FOUND", "STALE", "CONFLICT"].includes(
        finesStatus,
      )
        ? r.fines.pending
        : undefined,
      coverage: {
        nacional: r.fines.coverage.nacional,
        lima: r.fines.coverage.lima,
        callao: r.fines.coverage.callao,
      },
    },
    restrictions: {
      status: restrictionsStatus,
      count: ["VERIFIED", "NOT_FOUND", "STALE", "CONFLICT"].includes(
        restrictionsStatus,
      )
        ? r.registry.restrictions.length
        : undefined,
    },
    additional: Object.entries(futureSections).map(([key, label]) => ({
      label,
      status: r[key as keyof typeof futureSections].status,
    })),
    findings,
    sources: r.evidence
      .filter((e) =>
        [
          "identity",
          "insurance",
          "inspection",
          "fines",
          "registry.restrictions",
        ].some((k) => e.fieldPath === k || e.fieldPath.startsWith(k + ".")),
      )
      .map((e) => ({
        section: e.fieldPath,
        provider: e.provider,
        status: e.status,
        checkedAt: e.checkedAt,
      })),
  };
}
export type SharedReport = ReturnType<typeof sanitizeSharedReport>;
