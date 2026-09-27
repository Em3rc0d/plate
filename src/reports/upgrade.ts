import type { CanonicalVehicleReport } from "@/src/vehicle/canonical";
export const futureSections = {
  theft: "Registros de robo",
  captureOrders: "Órdenes de captura",
  claims: "Siniestros reportados",
  gnv: "GNV",
  valuation: "Valorización",
} as const;
export function futureDefaults() {
  return {
    theft: { status: "NOT_CONFIGURED" as const, records: [] },
    captureOrders: { status: "NOT_CONFIGURED" as const, records: [] },
    claims: { status: "NOT_CONFIGURED" as const, records: [] },
    gnv: { status: "NOT_CONFIGURED" as const, records: [] },
    valuation: { status: "NOT_CONFIGURED" as const, currency: "PEN" as const },
  };
}
export function upgradeReport(
  input: CanonicalVehicleReport,
): CanonicalVehicleReport {
  const report = structuredClone(input);
  const defaults = futureDefaults();
  for (const key of Object.keys(defaults) as (keyof typeof defaults)[]) {
    if (!report[key]) Object.assign(report, { [key]: defaults[key] });
    if (!report.evidence.some((e) => e.fieldPath === key))
      report.evidence.push({
        fieldPath: key,
        value: null,
        provider: "Sin proveedor",
        originalSource: "No hay una fuente integrada para esta sección",
        checkedAt: report.generatedAt,
        status: report[key].status,
        freshnessExpiresAt: report.generatedAt,
        metadata: { unsupported: true },
      });
  }
  return report;
}
