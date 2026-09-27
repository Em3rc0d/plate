import { documentarySummary } from "@/src/reports/summary";
import { summarySchema } from "@/src/findings/ai-summary";
import { PageEvent } from "@/components/marketing/page-event";
import { labels, legalNotice, productName } from "@/src/config/product";
import type { ReportRow } from "@/src/vehicle/canonical";
import { lines, reportSections, fieldLabels } from "@/src/reports/sections";
import Link from "next/link";
import { ShareButton } from "./share-button";
export function ReportView({ row }: { row: ReportRow }) {
  const r = row.report_json;
  const stats = documentarySummary(r);
  const summary = summarySchema.safeParse(row.summary_json);
  return (
    <main id="main" className="report">
      <PageEvent event="report_viewed" />
      <div className="wrap">
        <header className="report-header">
          <div className="flex spread">
            <Link href="/">{productName}</Link>
            <span className="muted">{labels[row.status]}</span>
          </div>
          <div className="plate">{r.identity.plate}</div>
          <h1>
            {r.identity.brand || "Reporte vehicular"} {r.identity.model}
          </h1>
          <p className="muted">
            Emitido:{" "}
            {new Date(row.created_at).toLocaleString("es-PE", {
              timeZone: "America/Lima",
            })}{" "}
            (Lima)
          </p>
          <div className="flex">
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
        <section className="card">
          <h2>{stats.label}</h2>
          <div className="flex">
            <strong>{stats.completed} verificaciones completadas</strong>
            <span>{stats.review} hallazgos para revisar</span>
            <span>
              {stats.unavailable} secciones con cobertura parcial/no disponible
            </span>
          </div>
          <p className="muted">
            Resumen de evidencia devuelta, no una recomendación de compra.
          </p>
          {r.registry.ownerIdentityAmbiguous ? (
            <p>
              Se detectaron registros históricos que requieren revisión. No se
              afirma un número exacto de propietarios.
            </p>
          ) : (
            r.registry.distinctOwnerCount !== undefined && (
              <p>
                {r.registry.distinctOwnerCount} identidades distintas en los
                registros devueltos; no es necesariamente el historial completo.
              </p>
            )
          )}
        </section>
        {reportSections(r).map((section) => {
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
              ["VERIFIED", "STALE", "CONFLICT", "NOT_FOUND"].includes(
                e.status,
              ) && e.value !== null,
          );
          return (
            <section className="card" key={section.key}>
              <h2>{section.title}</h2>
              <div
                className="section-statuses"
                aria-label="Estados de la evidencia"
              >
                {[...new Set(traces.map((e) => e.status))].map((status) => (
                  <span key={status} className={`status ${status}`}>
                    {labels[status]}
                  </span>
                ))}
              </div>
              {available ? (
                <div className="facts">
                  {lines(section.value).map((line, i) => (
                    <div className="fact" key={i}>
                      {line}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted">
                  No hay información disponible para esta sección. Esto no
                  acredita ausencia de registros.
                </p>
              )}
              <div className="evidence">
                {traces.map((e, i) => (
                  <p key={i}>
                    <span className={`status ${e.status}`}>
                      {labels[e.status]}
                    </span>{" "}
                    {fieldLabels[e.fieldPath.split(".").at(-1) || ""] ||
                      section.title}{" "}
                    · Fuente: {e.originalSource}
                    <br />
                    Consultado:{" "}
                    {new Date(e.checkedAt).toLocaleString("es-PE", {
                      timeZone: "America/Lima",
                    })}{" "}
                    (Lima)
                  </p>
                ))}
              </div>
              {traces.some((e) => e.status === "NOT_FOUND") && (
                <p>La fuente no devolvió registros para esta sección.</p>
              )}
              {section.key === "fines" && (
                <p className="muted">
                  Cobertura: SUTRAN, Lima y Callao. El monto suma solo importes
                  publicados; algunas papeletas no incluyen monto. No incluye
                  pagadas ni todas las municipalidades.
                </p>
              )}
              {traces.some((e) => e.status === "CONFLICT") && (
                <p>
                  Hay discrepancias entre fuentes. El valor mostrado no resuelve
                  el conflicto.
                </p>
              )}
              <p className="muted section-limit">
                La información corresponde a la cobertura y fecha de la fuente.
                No certifica ausencia de antecedentes fuera de ella.
              </p>
            </section>
          );
        })}
        <section className="card">
          <h2>Hallazgos para revisar</h2>
          {r.findings.map((f, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <strong>{f.title}</strong>
              <p className="muted">{f.detail}</p>
            </div>
          ))}
        </section>
        {summary.success && (
          <section className="card">
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
        <section className="card">
          <h2>Fuentes y cobertura</h2>
          {[...new Set(r.evidence.map((e) => e.originalSource))].map((x) => (
            <p key={x}>{x}</p>
          ))}
          <p className="muted">
            Verificado: la fuente devolvió el dato. Sin registros: la fuente
            devolvió cero resultados. No disponible: la consulta o el campo no
            se pudo obtener. Desactualizado: supera el plazo de frescura
            configurado. Conflicto: hay datos incompatibles.
          </p>
        </section>
        <section className="card">
          <h2>Limitaciones</h2>
          <p>{legalNotice}</p>
          <p className="muted">
            Este enlace privado contiene información del titular. Usa el enlace
            compartible para enviar una vista sin identidad del propietario.
          </p>
        </section>
        <footer
          style={{ padding: "20px 0 50px", overflowWrap: "anywhere" }}
          className="muted"
        >
          Reporte {row.id} · {row.created_at}
        </footer>
      </div>
    </main>
  );
}
