import { documentarySummary } from "./summary";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type {
  EvidenceRecord,
  ReportRow,
} from "@/src/vehicle/canonical";
import { productName, legalNotice, labels } from "@/src/config/product";
import { lines, reportSections } from "./sections";
import { futureSections } from "./upgrade";

const c = {
  bg: "#F6F7F5",
  surface: "#FFFFFF",
  surface2: "#EDF1F0",
  border: "#D4DDDC",
  text: "#192D35",
  muted: "#53646B",
  accent: "#155C58",
  success: "#226348",
  successBg: "#EAF3ED",
  warning: "#80550D",
  warningBg: "#FFF3D9",
  danger: "#A33131",
  dangerBg: "#FBECEC",
  neutralBg: "#EEF2F4",
};

const s = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingHorizontal: 38,
    paddingBottom: 54,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.45,
    color: c.text,
    backgroundColor: c.bg,
  },
  header: {
    backgroundColor: c.surface,
    border: `1 solid ${c.border}`,
    borderRadius: 7,
    padding: 18,
    marginBottom: 14,
  },
  brandRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  brand: {
    fontSize: 11,
    fontWeight: 700,
    color: c.accent,
  },
  eyebrow: {
    fontSize: 7.5,
    color: c.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  heroRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  plate: {
    fontFamily: "Courier",
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: 1.2,
    border: `1.5 solid ${c.text}`,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 15,
    backgroundColor: c.surface,
  },
  vehicle: {
    flexGrow: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: 700,
    marginBottom: 3,
  },
  meta: {
    fontSize: 8,
    color: c.muted,
  },
  status: {
    fontSize: 7.5,
    fontWeight: 700,
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: 10,
    marginLeft: 10,
  },
  summary: {
    backgroundColor: c.surface,
    border: `1 solid ${c.border}`,
    borderRadius: 7,
    padding: 15,
    marginBottom: 14,
  },
  sectionKicker: {
    fontSize: 7.5,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: c.muted,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 10,
  },
  metrics: {
    display: "flex",
    flexDirection: "row",
    borderTop: `1 solid ${c.border}`,
    borderBottom: `1 solid ${c.border}`,
    marginVertical: 8,
  },
  metric: {
    flexGrow: 1,
    flexBasis: 0,
    paddingVertical: 9,
    paddingHorizontal: 8,
  },
  metricBorder: {
    borderLeft: `1 solid ${c.border}`,
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 7.5,
    color: c.muted,
  },
  callout: {
    backgroundColor: "#FFF8E8",
    borderLeft: `3 solid ${c.warning}`,
    padding: 9,
    marginTop: 8,
    borderRadius: 4,
    fontSize: 8.5,
  },
  blockTitle: {
    marginTop: 7,
    marginBottom: 7,
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: c.muted,
  },
  card: {
    backgroundColor: c.surface,
    border: `1 solid ${c.border}`,
    borderRadius: 7,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 700,
    paddingRight: 10,
  },
  factGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  fact: {
    width: "50%",
    paddingRight: 10,
    paddingBottom: 5,
    fontSize: 9,
  },
  recordLabel: {
    width: "100%",
    fontSize: 8,
    fontWeight: 700,
    color: c.accent,
    marginTop: 4,
    marginBottom: 3,
  },
  empty: {
    color: c.muted,
    fontSize: 9,
    paddingVertical: 4,
  },
  trace: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: `1 solid ${c.border}`,
  },
  traceTitle: {
    fontSize: 7.5,
    fontWeight: 700,
    color: c.muted,
    marginBottom: 3,
  },
  traceText: {
    fontSize: 7.5,
    color: c.muted,
    marginBottom: 2,
  },
  findings: {
    backgroundColor: c.surface,
    border: `1 solid ${c.border}`,
    borderRadius: 7,
    padding: 14,
    marginBottom: 12,
  },
  findingRow: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 8,
  },
  findingIndex: {
    width: 24,
    color: c.accent,
    fontSize: 8,
    fontWeight: 700,
  },
  findingBody: {
    flexGrow: 1,
  },
  findingTitle: {
    fontSize: 9.5,
    fontWeight: 700,
    marginBottom: 2,
  },
  findingText: {
    fontSize: 8.5,
    color: c.muted,
  },
  coverage: {
    backgroundColor: c.surface2,
    borderRadius: 7,
    padding: 12,
    marginBottom: 12,
  },
  coverageText: {
    fontSize: 8.5,
    color: c.muted,
    marginBottom: 3,
  },
  legal: {
    backgroundColor: c.surface,
    border: `1 solid ${c.border}`,
    borderRadius: 7,
    padding: 12,
    fontSize: 8,
    color: c.muted,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 38,
    right: 38,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: c.muted,
  },
});

function limaDate(value: string) {
  return new Date(value).toLocaleString("es-PE", {
    timeZone: "America/Lima",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function evidenceForSection(
  evidence: EvidenceRecord[],
  key: string,
): EvidenceRecord[] {
  const exact = evidence.filter(
    (e) => e.fieldPath === key || e.fieldPath.startsWith(key + "."),
  );
  if (exact.length) return exact;
  return evidence.filter((e) => e.fieldPath === key.split(".")[0]);
}

function stateForEvidence(evidence: EvidenceRecord[]) {
  if (evidence.some((e) => e.status === "CONFLICT")) return "CONFLICT";
  if (evidence.some((e) => e.status === "STALE")) return "STALE";
  if (evidence.some((e) => e.status === "UNAVAILABLE")) return "UNAVAILABLE";
  if (evidence.some((e) => e.status === "NOT_CONFIGURED"))
    return "NOT_CONFIGURED";
  if (evidence.some((e) => e.status === "VERIFIED")) return "VERIFIED";
  if (evidence.some((e) => e.status === "NOT_FOUND")) return "NOT_FOUND";
  return "UNAVAILABLE";
}

function statusStyle(status: string) {
  if (status === "VERIFIED")
    return { backgroundColor: c.successBg, color: c.success };
  if (status === "CONFLICT")
    return { backgroundColor: c.dangerBg, color: c.danger };
  if (status === "STALE")
    return { backgroundColor: c.warningBg, color: c.warning };
  return { backgroundColor: c.neutralBg, color: c.muted };
}

function uniqueTrace(evidence: EvidenceRecord[]) {
  const seen = new Set<string>();
  return evidence.flatMap((e) => {
    const key = `${e.originalSource}|${e.provider}|${e.status}|${e.checkedAt}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [e];
  });
}

function FactLines({ value }: { value: unknown }) {
  return (
    <View style={s.factGrid}>
      {lines(value).map((line, index) =>
        /^Registro \d+$/.test(line) ||
        [
          "Certificado vigente",
          "Historial devuelto",
          "Papeletas",
          "Restricciones",
        ].includes(line) ? (
          <Text key={index} style={s.recordLabel}>
            {line}
          </Text>
        ) : (
          <Text key={index} style={s.fact}>
            {line}
          </Text>
        ),
      )}
    </View>
  );
}

export function PdfDocument({ row }: { row: ReportRow }) {
  const r = row.report_json;
  const stats = documentarySummary(r);
  const partial = row.status === "REPORT_PARTIAL";
  const supportedSections = reportSections(r).filter(
    (section) => !Object.prototype.hasOwnProperty.call(futureSections, section.key),
  );
  const unsupported = Object.values(futureSections);

  return (
    <Document title={`Reporte ${r.identity.plate}`} author={productName}>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.brandRow}>
            <Text style={s.brand}>{productName}</Text>
            <Text style={s.eyebrow}>Reporte vehicular · Perú</Text>
          </View>

          <View style={s.heroRow}>
            <Text style={s.plate}>{r.identity.plate}</Text>
            <View style={s.vehicle}>
              <Text style={s.title}>
                {[r.identity.brand, r.identity.model].filter(Boolean).join(" ") ||
                  "Vehículo consultado"}
              </Text>
              <Text style={s.meta}>
                Emitido {limaDate(row.created_at)} · hora de Lima
              </Text>
            </View>
            <Text
              style={[
                s.status,
                partial
                  ? { backgroundColor: c.warningBg, color: c.warning }
                  : { backgroundColor: c.successBg, color: c.success },
              ]}
            >
              {partial ? "REPORTE PARCIAL" : "REPORTE DISPONIBLE"}
            </Text>
          </View>
        </View>

        <View style={s.summary} wrap={false}>
          <Text style={s.sectionKicker}>Resumen ejecutivo</Text>
          <Text style={s.sectionTitle}>{stats.label}</Text>

          <View style={s.metrics}>
            <View style={s.metric}>
              <Text style={s.metricNumber}>{stats.completed}</Text>
              <Text style={s.metricLabel}>secciones verificadas</Text>
            </View>
            <View style={[s.metric, s.metricBorder]}>
              <Text style={s.metricNumber}>{stats.review}</Text>
              <Text style={s.metricLabel}>hallazgos para revisar</Text>
            </View>
            <View style={[s.metric, s.metricBorder]}>
              <Text style={s.metricNumber}>{stats.unavailable}</Text>
              <Text style={s.metricLabel}>secciones parciales</Text>
            </View>
          </View>

          {partial && (
            <View style={s.callout}>
              <Text>
                Algunas fuentes o campos no estuvieron disponibles en esta
                consulta. El reporte los separa para no interpretarlos como
                ausencia de antecedentes.
              </Text>
            </View>
          )}

          {r.registry.ownerIdentityAmbiguous && (
            <View style={s.callout}>
              <Text>
                Los registros históricos requieren revisión documental. No se
                afirma un número exacto de propietarios.
              </Text>
            </View>
          )}
        </View>

        {r.findings.length > 0 && (
          <>
            <Text style={s.blockTitle}>Hallazgos para revisar</Text>
            <View style={s.findings}>
              {r.findings.map((finding, index) => (
                <View style={s.findingRow} key={index} wrap={false}>
                  <Text style={s.findingIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                  <View style={s.findingBody}>
                    <Text style={s.findingTitle}>{finding.title}</Text>
                    <Text style={s.findingText}>{finding.detail}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={s.blockTitle}>Evidencia disponible</Text>

        {supportedSections.map((section) => {
          const evidence = evidenceForSection(r.evidence, section.key);
          const state = stateForEvidence(evidence);
          const available = evidence.some(
            (e) =>
              ["VERIFIED", "STALE", "CONFLICT", "NOT_FOUND"].includes(
                e.status,
              ) && e.value !== null,
          );
          const traces = uniqueTrace(evidence);

          return (
            <View style={s.card} key={section.key}>
              <View style={s.cardHeader} wrap={false}>
                <Text style={s.cardTitle}>{section.title}</Text>
                <Text style={[s.status, statusStyle(state)]}>
                  {labels[state] || state}
                </Text>
              </View>

              {available ? (
                <FactLines value={section.value} />
              ) : (
                <Text style={s.empty}>
                  No hay información disponible para esta sección. Esto no
                  acredita ausencia de registros.
                </Text>
              )}

              {traces.length > 0 && (
                <View style={s.trace}>
                  <Text style={s.traceTitle}>Fuente y trazabilidad</Text>
                  {traces.map((trace, index) => (
                    <Text style={s.traceText} key={index}>
                      {trace.originalSource} · {labels[trace.status]} ·{" "}
                      {limaDate(trace.checkedAt)}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <Text style={s.blockTitle}>Cobertura adicional</Text>
        <View style={s.coverage}>
          <Text style={[s.cardTitle, { marginBottom: 5 }]}>
            Fuentes aún no integradas
          </Text>
          <Text style={s.coverageText}>
            {unsupported.join(" · ")}
          </Text>
          <Text style={s.coverageText}>
            Estas coberturas no se interpretan como “sin antecedentes”. No hay
            una fuente integrada para ellas en esta consulta.
          </Text>
        </View>

        <Text style={s.blockTitle}>Transparencia y limitaciones</Text>
        <View style={s.legal}>
          <Text>{legalNotice}</Text>
          <Text style={{ marginTop: 6 }}>
            Este documento resume evidencia devuelta por las fuentes
            consultadas. No constituye una recomendación de compra.
          </Text>
        </View>

        <View style={s.footer} fixed>
          <Text>Reporte {row.id}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
