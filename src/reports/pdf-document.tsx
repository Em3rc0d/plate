import { documentarySummary } from "./summary";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ReportRow } from "@/src/vehicle/canonical";
import { productName, legalNotice, labels } from "@/src/config/product";
import { lines, reportSections } from "./sections";
const s = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 62,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111827",
  },
  title: { fontSize: 24, marginBottom: 12 },
  heading: { fontSize: 15, marginTop: 20, marginBottom: 10 },
  muted: { color: "#64748b", fontSize: 9, marginBottom: 8 },
  line: { marginBottom: 5 },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#64748b",
  },
});
export function PdfDocument({ row }: { row: ReportRow }) {
  const r = row.report_json;
  const stats = documentarySummary(r);
  return (
    <Document title={`Reporte ${r.identity.plate}`} author={productName}>
      <Page size="A4" style={s.page}>
        <Text style={s.muted}>{productName}</Text>
        <Text style={s.title}>Reporte vehicular · {r.identity.plate}</Text>
        <Text>
          {r.identity.brand} {r.identity.model}
        </Text>
        <Text style={s.muted}>
          {row.created_at} · {labels[row.status]}
        </Text>
        <Text style={s.heading}>{stats.label}</Text>
        <Text>
          {stats.completed} verificaciones completadas · {stats.review}{" "}
          hallazgos para revisar · {stats.unavailable} secciones con cobertura
          parcial/no disponible
        </Text>
        {r.registry.ownerIdentityAmbiguous && (
          <Text>
            Se detectaron registros históricos que requieren revisión. No se
            afirma un número exacto de propietarios.
          </Text>
        )}

        {r.findings.map((f, i) => (
          <View key={i} wrap={false}>
            <Text style={s.heading}>{f.title}</Text>
            <Text>{f.detail}</Text>
          </View>
        ))}
        {reportSections(r).map((section) => (
          <View key={section.title}>
            <Text style={s.heading}>{section.title}</Text>
            {(r.evidence.some(
              (e) =>
                (e.fieldPath === section.key ||
                  e.fieldPath.startsWith(section.key + ".")) &&
                e.value !== null &&
                ["VERIFIED", "STALE", "CONFLICT", "NOT_FOUND"].includes(
                  e.status,
                ),
            )
              ? lines(section.value)
              : ["No disponible. Esto no acredita ausencia de registros."]
            ).map((line, i) => (
              <Text key={i} style={s.line}>
                {line}
              </Text>
            ))}
            {r.evidence
              .filter(
                (e) =>
                  e.fieldPath === section.key ||
                  e.fieldPath.startsWith(section.key + "."),
              )
              .map((e, i) => (
                <Text key={i} style={s.muted}>
                  {e.fieldPath}: {labels[e.status]} · {e.provider} ·{" "}
                  {e.checkedAt}
                </Text>
              ))}
          </View>
        ))}
        <Text style={s.heading}>Fuentes, cobertura y limitaciones</Text>
        {r.evidence.map((e, i) => (
          <Text key={i} style={s.muted}>
            {e.originalSource} · {labels[e.status]} · {e.checkedAt}
          </Text>
        ))}
        <Text>{legalNotice}</Text>
        <Text
          style={s.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `${row.id} | ${pageNumber} / ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}
