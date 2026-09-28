import type { ReactNode } from "react";
import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type {
  Certificate,
  EvidenceRecord,
  EvidenceStatus,
  PublicOwner,
  ReportRow,
} from "@/src/vehicle/canonical";
import { productName, legalNotice } from "@/src/config/product";
import { fieldLabels } from "./sections";
import { futureSections } from "./upgrade";

// Bundle fonts locally: consistent metrics across PDF viewers and offline rendering.
Font.register({
  family: "Dossier",
  fonts: [
    { src: `${process.cwd()}/assets/fonts/DejaVuSans.ttf`, fontWeight: 400 },
    {
      src: `${process.cwd()}/assets/fonts/DejaVuSans-Bold.ttf`,
      fontWeight: 700,
    },
  ],
});
const colors = {
  navy: "#102537",
  ivory: "#F6F3EC",
  white: "#FFFFFF",
  teal: "#236A65",
  muted: "#596873",
  line: "#DADFDF",
  amber: "#825D26",
};
const s = StyleSheet.create({
  page: {
    paddingTop: 66,
    paddingHorizontal: 38,
    paddingBottom: 54,
    fontFamily: "Dossier",
    fontSize: 9,
    color: colors.navy,
    backgroundColor: colors.ivory,
  },
  running: {
    position: "absolute",
    top: 23,
    left: 38,
    right: 38,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: colors.muted,
    borderBottom: `1 solid ${colors.line}`,
    paddingBottom: 10,
  },
  footer: {
    position: "absolute",
    top: 805,
    height: 12,
    left: 38,
    right: 38,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: colors.muted,
  },
  kicker: {
    fontSize: 8,
    color: colors.teal,
    marginBottom: 9,
    textTransform: "uppercase",
  },
  heading: { fontSize: 24, fontWeight: 700, marginBottom: 20 },
  subheading: { fontSize: 12, fontWeight: 700, marginTop: 12, marginBottom: 8 },
  card: {
    backgroundColor: colors.white,
    border: `1 solid ${colors.line}`,
    borderRadius: 5,
    padding: 12,
    marginBottom: 10,
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  fact: { width: "50%", paddingRight: 12, paddingBottom: 12 },
  label: { fontSize: 7.5, color: colors.muted, marginBottom: 3 },
  value: { fontSize: 10, fontWeight: 700 },
  note: { fontSize: 8, color: colors.muted, marginBottom: 6 },
  exception: { fontSize: 8, color: colors.amber, marginBottom: 8 },
  trace: {
    borderTop: `1 solid ${colors.line}`,
    paddingTop: 7,
    marginTop: 6,
    marginBottom: 12,
    fontSize: 7,
    color: colors.muted,
  },
  row: {
    flexDirection: "row",
    borderBottom: `0.5 solid ${colors.line}`,
    paddingVertical: 8,
  },
  th: {
    backgroundColor: colors.navy,
    color: colors.white,
    flexDirection: "row",
    paddingVertical: 8,
  },
  cell: { paddingHorizontal: 6, fontSize: 7.4 },
  summaryCard: { width: "50%", paddingRight: 10, paddingBottom: 10 },
  finding: {
    borderLeft: `2 solid ${colors.teal}`,
    paddingLeft: 12,
    marginBottom: 15,
  },
});
const stateLabels: Record<EvidenceStatus, string> = {
  VERIFIED: "Información disponible",
  NOT_FOUND: "Sin registros devueltos",
  UNAVAILABLE: "No disponible en esta consulta",
  NOT_CONFIGURED: "Fuente no integrada",
  STALE: "Información desactualizada",
  CONFLICT: "Datos en conflicto",
};
function date(value: string | undefined, time = false) {
  if (!value) return "No informado";
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return value;
  return parsed.toLocaleString("es-PE", {
    timeZone: time ? "America/Lima" : "UTC",
    day: "2-digit",
    month: time ? "short" : "2-digit",
    year: "numeric",
    ...(time ? ({ hour: "numeric", minute: "2-digit" } as const) : {}),
  });
}
function human(value: unknown, key = ""): string {
  if (value === undefined || value === null) return "No informado";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  const translations: Record<string, string> = {
    ACTIVE: "Vigente",
    EXPIRED: "Vencido",
    UNKNOWN: "Estado no determinado",
    CONSISTENT: "Consistente",
    MISSING: "No informada / requiere revisión",
    INVALID: "Inválida / requiere revisión",
    ...stateLabels,
    ok: "Consulta disponible",
    sin_datos: "Sin registros devueltos",
    error: "No disponible en esta consulta",
  };
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}(T|$)/.test(value))
    return date(value);
  if (key === "documentConsistency" && value === "CONFLICT")
    return "Datos en conflicto / requiere revisión";
  return translations[String(value)] || String(value);
}
function evidenceFor(evidence: EvidenceRecord[], key: string) {
  const exact = evidence.filter(
    (e) => e.fieldPath === key || e.fieldPath.startsWith(`${key}.`),
  );
  return exact.length
    ? exact
    : evidence.filter((e) => e.fieldPath === key.split(".")[0]);
}
function state(evidence: EvidenceRecord[]): EvidenceStatus {
  for (const status of [
    "CONFLICT",
    "STALE",
    "UNAVAILABLE",
    "NOT_CONFIGURED",
    "VERIFIED",
    "NOT_FOUND",
  ] as const) {
    if (evidence.some((e) => e.status === status)) return status;
  }
  return "UNAVAILABLE";
}
function Trace({ evidence }: { evidence: EvidenceRecord[] }) {
  const traces = [
    ...new Map(
      evidence.map((e) => [
        `${e.originalSource}|${e.provider}|${e.checkedAt}`,
        e,
      ]),
    ).values(),
  ];
  return (
    <View style={s.trace}>
      {traces.map((e, i) => (
        <Text key={i}>
          Fuente: {e.originalSource}
          {e.provider !== "Router" &&
          e.provider !== "Sin proveedor" &&
          !e.originalSource.toLowerCase().includes(e.provider.toLowerCase())
            ? ` vía ${e.provider}`
            : ""}{" "}
          · Consultado {date(e.checkedAt, true)} (Lima)
        </Text>
      ))}
    </View>
  );
}
function Status({ evidence }: { evidence: EvidenceRecord[] }) {
  const status = state(evidence);
  return status === "VERIFIED" ? null : (
    <Text style={s.exception}>
      {stateLabels[status]}
      {status === "UNAVAILABLE"
        ? ". Esto no acredita ausencia de registros."
        : status === "NOT_FOUND"
          ? " por la fuente consultada."
          : ""}
    </Text>
  );
}
function Facts({
  value,
  compact = false,
}: {
  value: object;
  compact?: boolean;
}) {
  return (
    <View style={s.grid}>
      {Object.entries(value)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([key, v]) => (
          <View
            key={key}
            style={[
              s.fact,
              compact ? { width: "33.33%", paddingBottom: 6 } : {},
            ]}
            wrap={false}
          >
            <Text style={s.label}>{fieldLabels[key] || key}</Text>
            <Text style={s.value}>{human(v, key)}</Text>
          </View>
        ))}
    </View>
  );
}
function Heading({
  number,
  children,
}: {
  number: string;
  children: ReactNode;
}) {
  return (
    <View wrap={false}>
      <Text style={s.kicker}>Expediente vehicular / {number}</Text>
      <Text style={s.heading}>{children}</Text>
    </View>
  );
}
function Owner({ owner, index }: { owner: PublicOwner; index?: number }) {
  const { displayName, ...details } = owner;
  return (
    <View style={s.card} wrap={false}>
      {index !== undefined && (
        <Text style={s.kicker}>Registro {index + 1}</Text>
      )}
      <Text style={[s.value, { fontSize: 12, marginBottom: 10 }]}>
        {displayName}
      </Text>
      <Facts value={details} compact />
    </View>
  );
}
const certWidths = [19, 13, 13, 13, 26, 16];
function Certificates({ records }: { records: Certificate[] }) {
  // Chunking keeps a real column header with every continuation, without truncation.
  return (
    <>
      {Array.from({ length: Math.ceil(records.length / 4) }, (_, page) => (
        <View key={page} wrap={false} style={{ marginBottom: 10 }}>
          <View style={s.th}>
            {[
              "Aseguradora / centro",
              "Estado",
              "Desde",
              "Hasta",
              "Certificado",
              "Cobertura",
            ].map((label, i) => (
              <Text
                key={label}
                style={[s.cell, { width: `${certWidths[i]}%` }]}
              >
                {label}
              </Text>
            ))}
          </View>
          {records.slice(page * 4, page * 4 + 4).map((cert, i) => (
            <View
              key={i}
              style={{ backgroundColor: i % 2 ? colors.ivory : colors.white }}
            >
              <View style={s.row}>
                {[
                  cert.issuer,
                  human(cert.status),
                  date(cert.validFrom),
                  date(cert.validUntil),
                  cert.number,
                  cert.coverage,
                ].map((v, j) => (
                  <Text
                    key={j}
                    hyphenationCallback={(word) => [word]}
                    style={[s.cell, { width: `${certWidths[j]}%` }]}
                  >
                    {v || "No informado"}
                  </Text>
                ))}
              </View>
              {(cert.providerStatus || cert.result) && (
                <Text style={[s.note, { paddingHorizontal: 6, paddingTop: 3 }]}>
                  {[
                    cert.providerStatus &&
                      `Estado devuelto: ${human(cert.providerStatus)}`,
                    cert.result && `Resultado: ${human(cert.result)}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </>
  );
}
function CertificateSection({
  value,
  evidence,
  kind,
}: {
  value: { current?: Certificate; history: Certificate[] };
  evidence: EvidenceRecord[];
  kind: string;
}) {
  return (
    <>
      <Status evidence={evidence} />
      {value.current && (
        <View style={s.card} wrap={false}>
          <Text style={s.kicker}>{kind} actual</Text>
          <Text style={[s.heading, { fontSize: 20, marginBottom: 10 }]}>
            {value.current.issuer || "Emisor no informado"}
          </Text>
          <Facts
            value={Object.fromEntries(
              Object.entries(value.current).filter(([key]) => key !== "issuer"),
            )}
          />
        </View>
      )}
      {value.history.length > 0 && (
        <>
          <Text style={s.subheading}>
            Historial {kind} devuelto · {value.history.length} registros
          </Text>
          <Certificates records={value.history} />
        </>
      )}
      <Trace evidence={evidence} />
    </>
  );
}
// Render alternative source values when canonical consolidation selected one value.
// The customer sees meaningful labels, never internal field paths or raw metadata.
function AlternativeValues({ evidence }: { evidence: EvidenceRecord[] }) {
  const paths = [
    ...new Set(
      evidence
        .filter((e) => e.status === "CONFLICT" && e.value !== null)
        .map((e) => e.fieldPath),
    ),
  ];
  return (
    <>
      {paths.map((path) => {
        const entries = evidence.filter(
          (e) => e.fieldPath === path && e.value !== null,
        );
        if (new Set(entries.map((e) => JSON.stringify(e.value))).size < 2)
          return null;
        return (
          <View key={path} style={s.card}>
            <Text style={s.subheading}>
              Datos en conflicto ·{" "}
              {fieldLabels[path.split(".").at(-1)!] || "Información devuelta"}
            </Text>
            {entries.map((e, i) => (
              <View key={i}>
                <Text style={s.note}>
                  {e.originalSource} · {e.provider}
                </Text>
                <ReturnedValue value={e.value} />
              </View>
            ))}
          </View>
        );
      })}
    </>
  );
}
function ReturnedValue({ value }: { value: unknown }) {
  if (Array.isArray(value))
    return (
      <>
        {value.map((v, i) => (
          <View key={i}>
            <Text style={s.note}>Registro {i + 1}</Text>
            <ReturnedValue value={v} />
          </View>
        ))}
      </>
    );
  if (value && typeof value === "object")
    return (
      <>
        {Object.entries(value).map(([k, v]) => (
          <View key={k}>
            <Text style={s.label}>{fieldLabels[k] || k}</Text>
            <ReturnedValue value={v} />
          </View>
        ))}
      </>
    );
  return <Text style={s.note}>{human(value)}</Text>;
}

export function PdfDocument({
  row,
  verificationUrl,
}: {
  row: ReportRow;
  verificationUrl?: string;
}) {
  const r = row.report_json;
  const ev = (key: string) => evidenceFor(r.evidence, key);
  const vehicle =
    [r.identity.brand, r.identity.model].filter(Boolean).join(" ") ||
    "Vehículo consultado";
  const currentOwners = r.registry.currentOwners.length
    ? r.registry.currentOwners
    : r.registry.currentOwner
      ? [r.registry.currentOwner]
      : [];
  const unsupported = Object.entries(futureSections).filter(([key]) => {
    const value = r[key as keyof typeof futureSections];
    return (
      !value ||
      (value.status === "NOT_CONFIGURED" &&
        (!("records" in value) || value.records.length === 0))
    );
  });
  const additional = Object.entries(futureSections).filter(
    ([key]) => !unsupported.some(([k]) => k === key),
  );
  const findings = [
    ...new Map(
      r.findings
        .filter((f) => {
          // These generated notices repeat the section-level coverage explanations.
          if (
            [
              "Fuente o campo no disponible",
              "Fuente no configurada",
              "Discrepancias entre datos",
              "Información desactualizada",
            ].includes(f.title) &&
            f.detail ===
              "Consulta la trazabilidad y las limitaciones de cada sección."
          )
            return false;
          if (
            f.title === "Coberturas adicionales no consultadas" &&
            unsupported.length === 5 &&
            f.detail ===
              "Robo, captura, siniestros, GNV y valorización no tienen proveedor integrado. No se acredita ausencia de antecedentes."
          )
            return false;
          if (
            r.registry.ownerIdentityAmbiguous &&
            f.title === "Múltiples identidades en el historial" &&
            f.detail ===
              "El historial devuelto no acredita por sí solo el número total de transferencias."
          )
            return false;
          return true;
        })
        .map((f) => [`${f.title.trim()}|${f.detail.trim()}`, f]),
    ).values(),
  ];
  const frame = (children: ReactNode) => (
    <Page size="A4" style={s.page}>
      <View fixed style={s.running}>
        <Text>{productName}</Text>
        <Text>Reporte vehicular · Perú · {r.identity.plate}</Text>
      </View>
      <View fixed style={s.footer}>
        <Text>
          {productName} · {r.identity.plate} · {vehicle}
        </Text>
        <Text
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} / ${totalPages}`
          }
        />
      </View>
      {children}
    </Page>
  );
  const summary = [
    {
      title: "Identificación",
      status: stateLabels[state(ev("identity"))],
      detail: `${vehicle}${r.identity.modelYear ? ` · ${r.identity.modelYear}` : ""}`,
    },
    {
      title: "SOAT",
      status:
        state(ev("insurance")) === "VERIFIED"
          ? r.insurance.current
            ? human(r.insurance.current.status)
            : "Historial disponible"
          : stateLabels[state(ev("insurance"))],
      detail: r.insurance.current
        ? `${r.insurance.current.issuer || ""} · hasta ${date(r.insurance.current.validUntil)}`
        : r.insurance.history.length || state(ev("insurance")) === "NOT_FOUND"
          ? `${r.insurance.history.length} registros devueltos`
          : "No se pudo obtener el historial",
    },
    {
      title: "Situación registral",
      status: stateLabels[state(ev("registry"))],
      detail: r.registry.registryNumber
        ? `Partida ${r.registry.registryNumber}`
        : "Consulta registral",
    },
    {
      title: "Cobertura de la consulta",
      status: "Revisión técnica y papeletas",
      detail: `CITV: ${stateLabels[state(ev("inspection"))]}. Papeletas: ${stateLabels[state(ev("fines"))]}.`,
    },
  ];
  return (
    <Document
      title={`Reporte vehicular ${r.identity.plate}`}
      author={productName}
    >
      {frame(
        <>
          <Text style={[s.kicker, { marginTop: 35 }]}>
            Reporte vehicular · Perú
          </Text>
          <Text style={{ fontSize: 36, fontWeight: 700, marginBottom: 40 }}>
            {productName}
          </Text>
          <Text
            style={{
              fontSize: 31,
              maxWidth: 430,
              marginBottom: 34,
            }}
          >
            Conoce la información disponible del vehículo antes de comprar.
          </Text>
          <View
            style={{
              backgroundColor: colors.navy,
              borderRadius: 8,
              padding: 26,
              marginBottom: 24,
            }}
          >
            <View
              style={{
                width: 250,
                backgroundColor: colors.white,
                borderRadius: 6,
                border: "2 solid #B8BEC3",
                padding: 8,
                marginBottom: 24,
              }}
            >
              <Text style={{ textAlign: "center", fontSize: 9 }}>PERÚ</Text>
              <Text
                style={{
                  textAlign: "center",
                  fontFamily: "Dossier",
                  fontWeight: 700,
                  fontSize: 45,
                }}
              >
                {r.identity.plate}
              </Text>
            </View>
            <Text
              style={{ fontSize: 23, fontWeight: 700, color: colors.white }}
            >
              {vehicle}
            </Text>
            <Text style={{ color: "#D4DDDF", marginTop: 7 }}>
              {[r.identity.modelYear, r.identity.color]
                .filter(Boolean)
                .join(" · ")}
            </Text>
            {r.identity.registryStatus && (
              <Text style={{ color: colors.white, marginTop: 12 }}>
                Estado registral: {r.identity.registryStatus}
              </Text>
            )}
          </View>
          <Text style={s.note}>
            Emitido {date(row.created_at, true)} · hora de Lima
          </Text>
          <Text style={s.value}>
            {row.status === "REPORT_PARTIAL"
              ? "Reporte parcial"
              : "Reporte disponible"}
          </Text>
          <Text style={[s.note, { marginTop: 14 }]}>
            Información de las fuentes consultadas. PlacaClara no certifica
            jurídicamente los datos de origen ni emite un veredicto de compra.
          </Text>
        </>,
      )}
      {frame(
        <>
          <Heading number="01">Resumen del reporte</Heading>
          <View style={s.grid}>
            {summary.map((card) => (
              <View key={card.title} style={s.summaryCard}>
                <View style={[s.card, { minHeight: 100, marginBottom: 0 }]}>
                  <Text style={s.kicker}>{card.title}</Text>
                  <Text style={[s.value, { marginBottom: 6 }]}>
                    {card.status}
                  </Text>
                  <Text style={s.note}>{card.detail}</Text>
                </View>
              </View>
            ))}
          </View>
          {r.registry.ownerIdentityAmbiguous && (
            <Text style={s.exception}>
              Los registros históricos de propietarios requieren revisión
              documental.
            </Text>
          )}
          <Text style={s.subheading}>02 / Identificación del vehículo</Text>
          <Status evidence={ev("identity")} />
          <View style={s.card}>
            <Facts value={r.identity} />
          </View>
          <Trace evidence={ev("identity")} />
          <AlternativeValues evidence={ev("identity")} />
        </>,
      )}
      {frame(
        <>
          <Heading number="03">Situación registral y propietarios</Heading>
          <View style={s.card}>
            <Facts
              value={{
                registryNumber: r.registry.registryNumber,
                titleNumber: r.registry.titleNumber,
                ownershipSince: r.registry.ownershipSince,
                distinctOwnerCount: r.registry.distinctOwnerCount,
                ownerIdentityAmbiguous: r.registry.ownerIdentityAmbiguous,
              }}
            />
          </View>
          <Text style={s.subheading}>
            Propietario actual
            {currentOwners.length > 1 ? " · titulares registrados" : ""}
          </Text>
          <Status evidence={ev("registry.currentOwners")} />
          {currentOwners.map((o, i) => (
            <Owner key={i} owner={o} />
          ))}
          <Text style={s.subheading}>Historial de propietarios devuelto</Text>
          <Status evidence={ev("registry.historicalOwners")} />
          <Text style={s.note}>
            {r.registry.historicalOwners.length > 0 ||
            state(ev("registry.historicalOwners")) === "NOT_FOUND"
              ? `${r.registry.historicalOwners.length} registros históricos devueltos. `
              : ""}
            El historial devuelto no permite afirmar por sí solo el número total
            de transferencias.
          </Text>
          {r.registry.historicalOwners.map((o, i) => (
            <Owner key={i} owner={o} index={i} />
          ))}
          <Text style={s.subheading}>Restricciones / gravámenes</Text>
          <Status evidence={ev("registry.restrictions")} />
          {r.registry.restrictions.map((record, i) => (
            <View key={i} style={s.card} wrap={false}>
              <Facts value={record} />
            </View>
          ))}
          <Trace evidence={ev("registry")} />
          <AlternativeValues evidence={ev("registry")} />
        </>,
      )}
      {frame(
        <>
          <Heading number="04">SOAT</Heading>
          <CertificateSection
            value={r.insurance}
            evidence={ev("insurance")}
            kind="SOAT"
          />
          <AlternativeValues evidence={ev("insurance")} />
        </>,
      )}
      {frame(
        <>
          <Heading number="05">Revisión técnica y papeletas</Heading>
          <Text style={s.subheading}>Revisión técnica (CITV)</Text>
          <CertificateSection
            value={r.inspection}
            evidence={ev("inspection")}
            kind="CITV"
          />
          <AlternativeValues evidence={ev("inspection")} />
          <Text style={s.subheading}>Papeletas</Text>
          <Status evidence={ev("fines")} />
          {(r.fines.items.length > 0 ||
            ev("fines").some((e) => e.value !== null)) && (
            <View style={s.card}>
              <Facts
                value={{
                  total: r.fines.total,
                  pending: r.fines.pending,
                  pendingAmountPen: r.fines.pendingAmountPen,
                }}
              />
            </View>
          )}
          <View style={s.card}>
            <Text style={s.note}>Cobertura por jurisdicción</Text>
            <Facts value={r.fines.coverage} />
            <Text style={s.note}>
              Esta cobertura no representa todas las municipalidades del Perú.
              La falta de información no acredita ausencia de papeletas.
            </Text>
          </View>
          {r.fines.items.map((fine, i) => (
            <View style={s.card} key={i} wrap={false}>
              <Text style={s.kicker}>Papeleta {i + 1}</Text>
              <Facts value={fine} />
            </View>
          ))}
          <Trace evidence={ev("fines")} />
          <AlternativeValues evidence={ev("fines")} />
          {unsupported.length > 0 && (
            <View style={s.card} wrap={false}>
              <Text style={s.subheading}>Coberturas aún no integradas</Text>
              <Text style={{ marginBottom: 8 }}>
                {unsupported.map(([, label]) => label).join(" · ")}
              </Text>
              <Text style={s.note}>
                Estas fuentes no fueron consultadas porque todavía no forman
                parte de la cobertura activa de PlacaClara. No se interpreta
                como ausencia de antecedentes.
              </Text>
            </View>
          )}
          {additional.map(([key, label]) => (
            <View key={key}>
              <Text style={s.subheading}>{label}</Text>
              <ReturnedValue value={r[key as keyof typeof futureSections]} />
              <Trace evidence={ev(key)} />
            </View>
          ))}
          {findings.length > 0 && (
            <>
              <Text style={s.subheading}>06 / Hallazgos para revisar</Text>
              {findings.map((f, i) => (
                <View key={i} style={s.finding} wrap={false}>
                  <Text style={s.kicker}>{String(i + 1).padStart(2, "0")}</Text>
                  <Text style={[s.value, { marginBottom: 6 }]}>{f.title}</Text>
                  <Text style={s.note}>{f.detail}</Text>
                </View>
              ))}
            </>
          )}
        </>,
      )}
      {frame(
        <>
          <Heading number={findings.length ? "07" : "06"}>
            Fuentes y transparencia
          </Heading>
          <View style={s.th}>
            {["Información", "Proveedor", "Resultado de consulta"].map(
              (v, i) => (
                <Text
                  key={v}
                  style={[s.cell, { width: i === 2 ? "46%" : "27%" }]}
                >
                  {v}
                </Text>
              ),
            )}
          </View>
          {[
            ["identity", "Identificación"],
            ["registry", "Información registral"],
            ["insurance", "SOAT"],
            ["inspection", "CITV"],
            ["fines", "Papeletas"],
          ].map(([key, label]) => (
            <View style={s.row} key={key} wrap={false}>
              <Text style={[s.cell, { width: "27%" }]}>{label}</Text>
              <Text style={[s.cell, { width: "27%" }]}>
                {[...new Set(ev(key).map((e) => e.provider))]
                  .filter((p) => p !== "Router" && p !== "Sin proveedor")
                  .join(" / ") || "No disponible"}
              </Text>
              <Text style={[s.cell, { width: "46%" }]}>
                {stateLabels[state(ev(key))]}
              </Text>
            </View>
          ))}
          <Text style={s.subheading}>Cómo interpretar este reporte</Text>
          {[
            [
              "Información disponible",
              "La fuente devolvió datos. No equivale a una certificación de PlacaClara.",
            ],
            [
              "Sin registros devueltos",
              "La fuente respondió sin registros coincidentes dentro de su cobertura.",
            ],
            [
              "No disponible",
              "La información no pudo obtenerse en esta consulta.",
            ],
            [
              "Fuente no integrada",
              "PlacaClara no tiene un proveedor activo para esa sección.",
            ],
            [
              "Información desactualizada",
              "La evidencia superó el plazo de actualización previsto para esa fuente.",
            ],
            [
              "Datos en conflicto",
              "Existen discrepancias que requieren contrastar documentos de origen.",
            ],
          ].map(([label, description]) => (
            <Text key={label} style={s.note}>
              <Text style={{ fontWeight: 700 }}>{label}: </Text>
              {description}
            </Text>
          ))}
          <Text style={s.subheading}>Aviso legal</Text>
          <Text style={s.note}>{legalNotice}</Text>
          <View style={[s.card, { marginTop: 16 }]} wrap={false}>
            <Text style={s.kicker}>Autenticidad del reporte</Text>
            <Text style={s.note}>ID: {row.id}</Text>
            <Text style={s.note}>
              Emitido: {date(row.created_at, true)} · Lima
            </Text>
            {verificationUrl && (
              <Link
                src={verificationUrl}
                style={[s.note, { color: colors.teal }]}
              >
                {verificationUrl}
              </Link>
            )}
            <Text style={s.note}>
              La verificación confirma la existencia del reporte; no certifica
              la condición del vehículo.
            </Text>
          </View>
        </>,
      )}
    </Document>
  );
}
