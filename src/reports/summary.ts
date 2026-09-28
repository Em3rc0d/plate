import type { CanonicalVehicleReport } from "@/src/vehicle/canonical";
import { reportSections } from "./sections";
export function documentarySummary(r: CanonicalVehicleReport) {
  const sections = reportSections(r);
  let completed = 0,
    unavailable = 0;
  for (const section of sections) {
    const entries = r.evidence.filter(
      (e) =>
        e.fieldPath === section.key ||
        e.fieldPath.startsWith(section.key + "."),
    );
    if (
      entries.length &&
      entries.every((e) => ["VERIFIED", "NOT_FOUND"].includes(e.status))
    )
      completed++;
    else unavailable++;
  }
  const review = r.findings.filter((f) => f.severity !== "INFO").length;
  const partial =
    r.evidence.some(
      (e) =>
        !e.metadata.unsupported &&
        !["VERIFIED", "NOT_FOUND"].includes(e.status),
    ) || Object.values(r.fines.coverage).includes("error");
  return {
    completed,
    review,
    unavailable,
    label: partial
      ? "Reporte parcial"
      : review
        ? "Hay observaciones para revisar"
        : "Sin observaciones adicionales en la evidencia consultada",
  };
}
