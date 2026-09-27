import { notFound } from "next/navigation";
import { sharedReport } from "@/src/reports/repository";
import { sanitizeSharedReport } from "@/src/reports/public-sanitizer";
import { databaseConfigured } from "@/src/config/env";
import { labels, productName, legalNotice } from "@/src/config/product";
import { lines, fieldLabels } from "@/src/reports/sections";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function Page({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}) {
  if (!databaseConfigured) notFound();
  const { shareCode } = await params;
  const row = await sharedReport(shareCode);
  if (!row) notFound();
  const r = sanitizeSharedReport(row);
  return (
    <main id="main" className="report">
      <div className="wrap">
        <header className="report-header">
          <p>{productName} · Vista compartible sin identidad del propietario</p>
          <div className="plate">{r.plate}</div>
          <h1>
            {r.brand} {r.model}
          </h1>
          <p>
            Fabricación: {r.manufactureYear ?? "No disponible"} · Modelo:{" "}
            {r.modelYear ?? "No disponible"}
          </p>
          <p>
            {labels[r.status]} · Emitido:{" "}
            {new Date(r.generatedAt).toLocaleString("es-PE", {
              timeZone: "America/Lima",
            })}{" "}
            (Lima)
          </p>
        </header>
        {[
          { key: "insurance", title: "SOAT", value: r.insurance },
          { key: "inspection", title: "Revisión técnica", value: r.inspection },
          {
            key: "fines",
            title: "Papeletas en la cobertura consultada",
            value: r.fines,
          },
          {
            key: "registry.restrictions",
            title: "Restricciones devueltas",
            value: r.restrictions,
          },
        ].map(({ key, title, value }) => (
          <section className="card" key={title}>
            <h2>{title}</h2>
            <span className={`status ${value.status}`}>
              {labels[value.status]}
            </span>
            {lines(value).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            <div className="evidence">
              {r.sources
                .filter(
                  (source) =>
                    source.section === key ||
                    source.section.startsWith(key + "."),
                )
                .map((source, i) => (
                  <p key={i}>
                    Fuente: {source.provider}
                    <br />
                    Consultado:{" "}
                    {new Date(source.checkedAt).toLocaleString("es-PE", {
                      timeZone: "America/Lima",
                    })}{" "}
                    (Lima)
                  </p>
                ))}
            </div>
            {value.status === "NOT_FOUND" && (
              <p>
                0 registros devueltos en la cobertura consultada. No acredita
                ausencia fuera de esa cobertura.
              </p>
            )}
            {["UNAVAILABLE", "NOT_CONFIGURED"].includes(value.status) && (
              <p>Esta información no estuvo disponible durante la consulta.</p>
            )}
            {value.status === "CONFLICT" && (
              <p>
                Hay discrepancias. No tomes el valor mostrado como una
                resolución del conflicto.
              </p>
            )}
          </section>
        ))}
        <section className="card">
          <h2>Hallazgos documentales</h2>
          {r.findings.length ? (
            r.findings.map((x) => <p key={x}>{x}</p>)
          ) : (
            <p>
              Esta vista no muestra hallazgos adicionales. No certifica ausencia
              de antecedentes.
            </p>
          )}
        </section>
        <section className="card">
          <h2>Cobertura adicional</h2>
          {r.additional.map((s) => (
            <p key={s.label}>
              {s.label}: {labels[s.status]}
            </p>
          ))}
        </section>
        <section className="card">
          <h2>Fuentes y cobertura</h2>
          {r.sources.map((s, i) => (
            <p key={i}>
              {fieldLabels[s.section.split(".").at(-1) || ""] ||
                "Información documental"}{" "}
              · Fuente: {s.provider} · {labels[s.status]} ·{" "}
              {new Date(s.checkedAt).toLocaleString("es-PE", {
                timeZone: "America/Lima",
              })}{" "}
              (Lima)
            </p>
          ))}
          <p>Papeletas: SUTRAN, Lima y Callao; no todas las municipalidades.</p>
          <p>{legalNotice}</p>
        </section>
        <footer style={{ padding: "30px 0" }}>
          ID de autenticidad: {r.id}
          <p>
            <a href={`/verificar/${shareCode}`}>
              Verificar existencia del reporte
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
