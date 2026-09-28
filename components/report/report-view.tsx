import { summarySchema } from "@/src/findings/ai-summary";
import { PageEvent } from "@/components/marketing/page-event";
import { legalNotice, productName } from "@/src/config/product";
import type {
  EvidenceRecord,
  EvidenceStatus,
  ReportRow,
} from "@/src/vehicle/canonical";
import { lines, reportSections } from "@/src/reports/sections";
import Link from "next/link";
import { ShareButton } from "./share-button";
import styles from "./report-view.module.css";

const customerStates: Record<EvidenceStatus, string> = {
  VERIFIED: "Información disponible",
  NOT_FOUND: "Sin registros devueltos",
  UNAVAILABLE: "No disponible en esta consulta",
  NOT_CONFIGURED: "Fuente no integrada",
  STALE: "Información desactualizada",
  CONFLICT: "Datos en conflicto",
};

function limaDate(value: string) {
  return new Date(value).toLocaleString("es-PE", {
    timeZone: "America/Lima",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function shortDate(value?: string) {
  if (!value) return "No informado";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return date.toLocaleDateString("es-PE", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function sectionState(traces: EvidenceRecord[]): EvidenceStatus {
  for (const status of [
    "CONFLICT",
    "STALE",
    "UNAVAILABLE",
    "NOT_CONFIGURED",
    "VERIFIED",
    "NOT_FOUND",
  ] as const) {
    if (traces.some((trace) => trace.status === status)) return status;
  }
  return "UNAVAILABLE";
}

function dedupeTraces(traces: EvidenceRecord[]) {
  return [
    ...new Map(
      traces.map((trace) => [
        `${trace.originalSource}|${trace.provider}|${trace.checkedAt}|${trace.status}`,
        trace,
      ]),
    ).values(),
  ];
}

export function ReportView({ row }: { row: ReportRow }) {
  const r = row.report_json;
  const summary = summarySchema.safeParse(row.summary_json);
  const sections = reportSections(r).map((section) => {
    const evidence = r.evidence.filter(
      (e) =>
        e.fieldPath === section.key ||
        e.fieldPath.startsWith(section.key + "."),
    );
    const parent = r.evidence.filter(
      (e) => e.fieldPath === section.key.split(".")[0],
    );
    const traces = evidence.length ? evidence : parent;
    const available = traces.some(
      (e) =>
        ["VERIFIED", "STALE", "CONFLICT", "NOT_FOUND"].includes(e.status) &&
        e.value !== null,
    );
    const unsupported =
      traces.length > 0 && traces.every((e) => e.metadata.unsupported);
    const configured =
      traces.length > 0 &&
      !unsupported &&
      traces.some((e) => e.status !== "NOT_CONFIGURED");
    return {
      ...section,
      traces,
      compactTraces: dedupeTraces(traces),
      state: sectionState(traces),
      available,
      configured,
      unsupported,
    };
  });

  const dataSections = sections.filter((s) => s.configured || s.available);
  const pendingSections = sections.filter((s) => !s.configured && !s.available);
  const byKey = (key: string) => sections.find((section) => section.key === key);
  const identity = byKey("identity");
  const registry = byKey("registry");
  const insurance = byKey("insurance");
  const inspection = byKey("inspection");
  const fines = byKey("fines");

  const overview = [
    {
      label: "Vehículo",
      status: identity ? customerStates[identity.state] : "Información disponible",
      detail: [
        r.identity.brand,
        r.identity.model,
        r.identity.modelYear || r.identity.manufactureYear,
        r.identity.color,
      ]
        .filter(Boolean)
        .join(" · "),
    },
    {
      label: "SOAT",
      status:
        insurance?.state === "VERIFIED" && r.insurance.current
          ? r.insurance.current.status === "ACTIVE"
            ? "Vigente"
            : "Información disponible"
          : customerStates[insurance?.state || "UNAVAILABLE"],
      detail: r.insurance.current
        ? [
            r.insurance.current.issuer,
            r.insurance.current.validUntil
              ? `hasta ${shortDate(r.insurance.current.validUntil)}`
              : undefined,
          ]
            .filter(Boolean)
            .join(" · ")
        : "Consulta incluida en el expediente",
    },
    {
      label: "Situación registral",
      status: customerStates[registry?.state || "UNAVAILABLE"],
      detail: r.registry.registryNumber
        ? `Partida ${r.registry.registryNumber}`
        : "Datos registrales de la consulta",
    },
    {
      label: "Cobertura pendiente",
      status:
        inspection?.state === "VERIFIED" && fines?.state === "VERIFIED"
          ? "Información disponible"
          : "Revisar cobertura",
      detail: `CITV: ${customerStates[inspection?.state || "UNAVAILABLE"]} · Papeletas: ${customerStates[fines?.state || "UNAVAILABLE"]}`,
    },
  ];

  return (
    <main id="main" className="report report-v2">
      <PageEvent event="report_viewed" />
      <div className="wrap report-document">
        <header className={`report-header ${styles.hero}`}>
          <div className={styles.topLine}>
            <Link className={styles.brand} href="/">
              {productName}
            </Link>
            <span className={`status ${styles.state}`}>
              {row.status === "REPORT_PARTIAL"
                ? "Reporte parcial"
                : "Reporte disponible"}
            </span>
          </div>

          <div className={styles.identity}>
            <div className="plate">{r.identity.plate}</div>
            <div>
              <p className={styles.kicker}>Reporte vehicular · Perú</p>
              <h1>
                {r.identity.brand || "Vehículo"} {r.identity.model}
              </h1>
              <p className="muted">
                {[r.identity.modelYear || r.identity.manufactureYear, r.identity.color]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="muted">
                Emitido {limaDate(row.created_at)} · hora de Lima
              </p>
            </div>
          </div>

          <div className={styles.actions}>
            <a
              className="button primary"
              href={`/api/reports/${row.public_code}/pdf`}
            >
              Descargar PDF
            </a>
            <ShareButton code={row.public_code} />
            <Link
              className="button outline"
              href={`/verificar/${row.public_code}`}
            >
              Verificar autenticidad
            </Link>
          </div>
        </header>

        <section className={`card ${styles.summaryCard}`}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kicker}>Resumen del reporte</p>
              <h2>Lo principal de esta consulta</h2>
            </div>
          </div>

          <div className={styles.overviewGrid}>
            {overview.map((item) => (
              <div className={styles.overviewCard} key={item.label}>
                <span>{item.label}</span>
                <strong>{item.status}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>

          <p className={styles.summaryNote}>
            La información mostrada corresponde a las fuentes consultadas. No
            constituye una certificación jurídica ni una recomendación de compra.
          </p>

          {r.registry.ownerIdentityAmbiguous && (
            <div className={styles.callout}>
              <strong>Historial registral para revisar</strong>
              <p>
                Los registros históricos devueltos no permiten afirmar por sí
                solos un número exacto de propietarios o transferencias.
              </p>
            </div>
          )}
        </section>

        <div className={styles.sectionTitle}>
          <div>
            <p className={styles.kicker}>01 · Evidencia disponible</p>
            <h2>Datos del vehículo y situación registral</h2>
          </div>
          <p>
            Se conservan todos los datos útiles devueltos por las fuentes; la
            metadata técnica repetitiva se agrupa por sección.
          </p>
        </div>

        {dataSections.map((section) => (
          <section className={`card ${styles.dataCard}`} key={section.key}>
            <div className={styles.sectionHeading}>
              <h2>{section.title}</h2>
              {section.state !== "VERIFIED" && (
                <span className={`status ${section.state}`}>
                  {customerStates[section.state]}
                </span>
              )}
            </div>

            {section.available ? (
              <div className={`facts ${styles.facts}`}>
                {lines(section.value).map((line, i) => (
                  <div className="fact" key={i}>
                    {line}
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>
                {customerStates[section.state]}. Esto no acredita ausencia de
                registros.
              </p>
            )}

            {section.state === "NOT_FOUND" && (
              <p className={styles.inlineNote}>
                La fuente respondió correctamente y no devolvió registros para
                esta sección.
              </p>
            )}

            {section.key === "fines" && (
              <p className={styles.inlineNote}>
                Cobertura declarada: SUTRAN, Lima y Callao. No incluye todas las
                municipalidades ni acredita ausencia de papeletas fuera de esa
                cobertura.
              </p>
            )}

            {section.state === "CONFLICT" && (
              <p className={`${styles.inlineNote} ${styles.warning}`}>
                Existen datos incompatibles entre fuentes. El reporte conserva
                la discrepancia para revisión.
              </p>
            )}

            {!!section.compactTraces.length && (
              <details className={styles.trace}>
                <summary>Fuente y fecha de consulta</summary>
                <div className="evidence">
                  {section.compactTraces.map((trace, i) => (
                    <div className={styles.traceRow} key={i}>
                      <strong>{trace.originalSource}</strong>
                      <p>
                        {trace.status !== "VERIFIED"
                          ? `${customerStates[trace.status]} · `
                          : ""}
                        Consultado {limaDate(trace.checkedAt)} · hora de Lima
                      </p>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </section>
        ))}

        {!!pendingSections.length && (
          <>
            <div className={styles.sectionTitle}>
              <div>
                <p className={styles.kicker}>02 · Cobertura pendiente</p>
                <h2>Fuentes aún no integradas</h2>
              </div>
              <p>
                Estas secciones no se presentan como “sin antecedentes” porque
                no fueron consultadas con una fuente activa.
              </p>
            </div>

            <div className={styles.coverageGrid}>
              {pendingSections.map((section) => (
                <section className={styles.coverageCard} key={section.key}>
                  <div className={styles.sectionHeading}>
                    <h3>{section.title}</h3>
                    <span className="status NOT_CONFIGURED">
                      Fuente no integrada
                    </span>
                  </div>
                  <p>
                    No hay información disponible para esta sección en esta
                    consulta. Esto no acredita ausencia de antecedentes.
                  </p>
                </section>
              ))}
            </div>
          </>
        )}

        <div className={styles.sectionTitle}>
          <div>
            <p className={styles.kicker}>03 · Revisión</p>
            <h2>Hallazgos para revisar</h2>
          </div>
        </div>

        <section className={`card ${styles.findings}`}>
          {r.findings.length ? (
            r.findings.map((f, i) => (
              <article
                className={`${styles.finding} ${f.severity === "REVIEW" ? styles.review : ""}`}
                key={i}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{f.title}</strong>
                  <p>{f.detail}</p>
                </div>
              </article>
            ))
          ) : (
            <p className={styles.empty}>
              No se registraron hallazgos adicionales en la evidencia disponible.
            </p>
          )}
        </section>

        {summary.success && (
          <section className={`card ${styles.aiCard}`}>
            <p className={styles.kicker}>Lectura asistida</p>
            <h2>Explicación asistida por IA</h2>
            <p className="muted">
              Lectura auxiliar de la evidencia; no sustituye los datos ni
              documentos de origen.
            </p>
            <p>{summary.data.summary}</p>
            {[
              ["Puntos para revisar", summary.data.reviewPoints],
              ["Preguntas al vendedor", summary.data.sellerQuestions],
              ["Documentos por verificar", summary.data.nextDocumentsToVerify],
            ].map(([title, items]) => (
              <div key={String(title)}>
                <h3>{String(title)}</h3>
                <ul>
                  {(items as string[]).map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        <div className={styles.sectionTitle}>
          <div>
            <p className={styles.kicker}>04 · Transparencia</p>
            <h2>Fuentes, cobertura y limitaciones</h2>
          </div>
        </div>

        <section className={`card ${styles.methodology}`}>
          <div>
            <h3>Fuentes mencionadas en esta consulta</h3>
            <ul>
              {[...new Set(r.evidence.map((e) => e.originalSource))].map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Cómo leer los estados</h3>
            <p>
              <strong>Información disponible:</strong> la fuente devolvió datos.{" "}
              <strong>Sin registros devueltos:</strong> la fuente respondió sin
              coincidencias dentro de su cobertura.{" "}
              <strong>No disponible:</strong> el dato no pudo obtenerse en esta
              consulta. <strong>Fuente no integrada:</strong> PlacaClara no tiene
              una fuente activa para esa sección.{" "}
              <strong>Datos en conflicto:</strong> existen discrepancias que deben
              contrastarse con los documentos de origen.
            </p>
          </div>
          <div className={styles.limitations}>
            <h3>Limitaciones</h3>
            <p>{legalNotice}</p>
            <p className="muted">
              Este enlace privado puede contener información del titular. Usa el
              enlace compartible para enviar una vista sin identidad del
              propietario.
            </p>
          </div>
        </section>

        <footer className={styles.footer}>
          <span>Reporte {row.id}</span>
          <span>Generado {limaDate(row.created_at)} · hora de Lima</span>
        </footer>
      </div>
    </main>
  );
}
