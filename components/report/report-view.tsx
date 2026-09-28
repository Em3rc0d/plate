import { documentarySummary } from "@/src/reports/summary";
import { summarySchema } from "@/src/findings/ai-summary";
import { PageEvent } from "@/components/marketing/page-event";
import { labels, legalNotice, productName } from "@/src/config/product";
import type { ReportRow } from "@/src/vehicle/canonical";
import { lines, reportSections, fieldLabels } from "@/src/reports/sections";
import Link from "next/link";
import { ShareButton } from "./share-button";
import styles from "./report-view.module.css";

function limaDate(value: string) {
  return new Date(value).toLocaleString("es-PE", {
    timeZone: "America/Lima",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ReportView({ row }: { row: ReportRow }) {
  const r = row.report_json;
  const stats = documentarySummary(r);
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
    return { ...section, traces, available, configured, unsupported };
  });

  const dataSections = sections.filter((s) => s.configured || s.available);
  const pendingSections = sections.filter((s) => !s.configured && !s.available);

  return (
    <main id="main" className="report report-v2">
      <PageEvent event="report_viewed" />
      <div className="wrap report-document">
        <header className={`report-header ${styles.hero}`}>
          <div className={styles.topLine}>
            <Link className={styles.brand} href="/">
              {productName}
            </Link>
            <span className={`status ${styles.state}`}>{labels[row.status]}</span>
          </div>

          <div className={styles.identity}>
            <div className="plate">{r.identity.plate}</div>
            <div>
              <p className={styles.kicker}>Reporte vehicular</p>
              <h1>
                {r.identity.brand || "Vehículo"} {r.identity.model}
              </h1>
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
              <p className={styles.kicker}>Resumen ejecutivo</p>
              <h2>{stats.label}</h2>
            </div>
            <span className="status report-state">{labels[row.status]}</span>
          </div>

          <div className={styles.metrics}>
            <div>
              <strong>{stats.completed}</strong>
              <span>secciones verificadas</span>
            </div>
            <div>
              <strong>{stats.review}</strong>
              <span>hallazgos para revisar</span>
            </div>
            <div>
              <strong>{stats.unavailable}</strong>
              <span>secciones parciales o no disponibles</span>
            </div>
          </div>

          <p className={styles.summaryNote}>
            Este documento resume evidencia devuelta por las fuentes consultadas.
            No constituye una recomendación de compra.
          </p>

          {r.registry.ownerIdentityAmbiguous ? (
            <div className={styles.callout}>
              <strong>Revisión registral recomendada</strong>
              <p>
                Se detectaron registros históricos cuya identidad documental no
                permite afirmar un número exacto de propietarios.
              </p>
            </div>
          ) : (
            r.registry.distinctOwnerCount !== undefined && (
              <div className={styles.callout}>
                <strong>Historial registral</strong>
                <p>
                  {r.registry.distinctOwnerCount} identidades distintas aparecen
                  en los registros devueltos. Esto no implica que sea el historial
                  completo de transferencias.
                </p>
              </div>
            )
          )}
        </section>

        <div className={styles.sectionTitle}>
          <div>
            <p className={styles.kicker}>01 · Evidencia disponible</p>
            <h2>Datos del vehículo y situación registral</h2>
          </div>
          <p>
            La información visible proviene directamente de la evidencia
            almacenada para esta consulta.
          </p>
        </div>

        {dataSections.map((section) => (
          <section className={`card ${styles.dataCard}`} key={section.key}>
            <div className={styles.sectionHeading}>
              <h2>{section.title}</h2>
              <div className="section-statuses" aria-label="Estados de la evidencia">
                {[...new Set(section.traces.map((e) => e.status))].map(
                  (status) => (
                    <span key={status} className={`status ${status}`}>
                      {labels[status]}
                    </span>
                  ),
                )}
              </div>
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
                No hay información disponible para esta sección. Esto no
                acredita ausencia de registros.
              </p>
            )}

            {section.traces.some((e) => e.status === "NOT_FOUND") && (
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

            {section.traces.some((e) => e.status === "CONFLICT") && (
              <p className={`${styles.inlineNote} ${styles.warning}`}>
                Existen datos incompatibles entre fuentes. El reporte conserva
                la discrepancia para revisión.
              </p>
            )}

            {!!section.traces.length && (
              <details className={styles.trace}>
                <summary>
                  Ver trazabilidad y fuentes ({section.traces.length})
                </summary>
                <div className="evidence">
                  {section.traces.map((e, i) => (
                    <div className={styles.traceRow} key={i}>
                      <div>
                        <span className={`status ${e.status}`}>
                          {labels[e.status]}
                        </span>{" "}
                        <strong>
                          {fieldLabels[e.fieldPath.split(".").at(-1) || ""] ||
                            section.title}
                        </strong>
                      </div>
                      <p>
                        {e.originalSource}
                        <br />
                        Consultado {limaDate(e.checkedAt)} · hora de Lima
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
                <h2>Fuentes aún no integradas o no configuradas</h2>
              </div>
              <p>
                Estas secciones no se interpretan como “sin antecedentes”. Se
                muestran separadas para no mezclarlas con datos efectivamente
                consultados.
              </p>
            </div>

            <div className={styles.coverageGrid}>
              {pendingSections.map((section) => {
                const sources = [
                  ...new Set(section.traces.map((e) => e.originalSource)),
                ];
                return (
                  <section className={styles.coverageCard} key={section.key}>
                    <div className={styles.sectionHeading}>
                      <h3>{section.title}</h3>
                      <span className="status NOT_CONFIGURED">
                        Fuente no configurada
                      </span>
                    </div>
                    <p>
                      No hay información disponible para esta sección en esta
                      consulta.
                    </p>
                    {!!sources.length && (
                      <p className="micro">
                        Fuente prevista: {sources.join(" · ")}
                      </p>
                    )}
                  </section>
                );
              })}
            </div>
          </>
        )}

        <div className={styles.sectionTitle}>
          <div>
            <p className={styles.kicker}>03 · Revisión</p>
            <h2>Hallazgos y próximos puntos de control</h2>
          </div>
        </div>

        <section className={`card ${styles.findings}`}>
          {r.findings.length ? (
            r.findings.map((f, i) => (
              <article className={`${styles.finding} ${f.severity === "REVIEW" ? styles.review : ""}`} key={i}>
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
              <strong>Verificado:</strong> la fuente devolvió el dato.{" "}
              <strong>Sin registros:</strong> la fuente respondió con cero
              resultados. <strong>No disponible:</strong> la consulta o el campo
              no se pudo obtener. <strong>Desactualizado:</strong> supera el
              plazo de frescura configurado. <strong>Conflicto:</strong> existen
              datos incompatibles.
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
