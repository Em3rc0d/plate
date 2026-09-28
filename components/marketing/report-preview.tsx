import {
  capabilityLabels,
  enabledCapabilities,
  type Capability,
} from "@/src/config/providers";

type DemoState = "VERIFIED" | "NOT_FOUND" | "UNAVAILABLE" | "CONFLICT";
type DemoItem = {
  state: DemoState;
  label: string;
  detail: string;
  source: string;
};

const demoByCapability: Partial<Record<Capability, DemoItem>> = {
  IDENTITY: {
    state: "VERIFIED",
    label: "Información disponible",
    detail: "RENAULT LOGAN · Año modelo 2015 · GRIS BEIGE",
    source: "Registro vehicular",
  },
  REGISTRY_CURRENT_OWNER: {
    state: "VERIFIED",
    label: "Información disponible",
    detail:
      "Titular registrado: CARLOS V. B. · Identidad parcialmente oculta en esta demostración.",
    source: "Registro vehicular",
  },
  REGISTRY_HISTORY: {
    state: "VERIFIED",
    label: "Información disponible",
    detail:
      "3 registros históricos devueltos. El número total de transferencias no se infiere automáticamente.",
    source: "Registro vehicular",
  },
  RESTRICTIONS: {
    state: "CONFLICT",
    label: "Requiere revisión",
    detail: "1 registro registral requiere revisión documental.",
    source: "Registro vehicular",
  },
  SOAT: {
    state: "VERIFIED",
    label: "Vigente",
    detail: "SOAT vigente hasta 25/09/2027 · 3 certificados encontrados.",
    source: "Consulta SOAT",
  },
  CITV: {
    state: "VERIFIED",
    label: "Vigente",
    detail: "Revisión técnica vigente hasta 06/07/2027.",
    source: "Consulta CITV",
  },
  FINES_NATIONAL: {
    state: "NOT_FOUND",
    label: "Sin registros devueltos",
    detail:
      "SUTRAN no devolvió registros dentro de la cobertura consultada.",
    source: "Consulta SUTRAN",
  },
  FINES_LIMA: {
    state: "VERIFIED",
    label: "Información disponible",
    detail: "2 papeletas pendientes · S/ 350.00 publicados.",
    source: "Consulta Lima",
  },
  FINES_CALLAO: {
    state: "UNAVAILABLE",
    label: "No disponible",
    detail:
      "La fuente no estuvo disponible en esta consulta de demostración.",
    source: "Consulta Callao",
  },
};

const DEMO_DATE = "28 sep 2026";

export function ReportPreview({ compact = false }: { compact?: boolean }) {
  const capabilities = enabledCapabilities();
  const examples = capabilities.slice(0, compact ? 3 : capabilities.length);
  const statuses = examples.map(
    (cap) =>
      demoByCapability[cap] ?? {
        state: "VERIFIED" as const,
        label: "Información disponible",
        detail: "Información ilustrativa devuelta por una fuente habilitada.",
        source: "Cobertura habilitada",
      },
  );

  const withData = statuses.filter((item) => item.state === "VERIFIED").length;
  const review = statuses.filter((item) => item.state === "CONFLICT").length;
  const notFound = statuses.filter(
    (item) => item.state === "NOT_FOUND",
  ).length;
  const unavailable = statuses.filter(
    (item) => item.state === "UNAVAILABLE",
  ).length;

  return (
    <article
      className={`report-sample ${compact ? "compact" : ""}`}
      aria-label="Vista ilustrativa del reporte, con datos ficticios"
    >
      <div className="document-top">
        <span>PLACACLARA / REPORTE VEHICULAR</span>
        <strong>DEMO · DATOS FICTICIOS</strong>
      </div>

      <div className="sample-identity">
        <div>
          <span className="document-label">PLACA DE EJEMPLO</span>
          <div className="plate sample-plate">XYZ-753</div>
        </div>
        <div>
          <h3>
            {capabilities.includes("IDENTITY")
              ? "RENAULT LOGAN"
              : "Ficha del vehículo"}
          </h3>
          <p className="micro">
            {capabilities.includes("IDENTITY")
              ? "Año modelo 2015 · GRIS BEIGE"
              : "Los campos dependen de la cobertura habilitada."}
          </p>
        </div>
      </div>

      {!compact && (
        <>
          <p className="sample-demo-note">
            Todos los datos, fuentes y fechas de esta muestra son ilustrativos.
          </p>
          <div
            className="sample-summary"
            aria-label="Resumen de la demostración"
          >
            <span>
              <strong>{withData}</strong> con información
            </span>
            <span>
              <strong>{review}</strong> observación
            </span>
            <span>
              <strong>{notFound}</strong> sin registros
            </span>
            <span>
              <strong>{unavailable}</strong> no disponible
            </span>
          </div>
        </>
      )}

      {examples.length ? (
        examples.map((cap) => {
          const demo =
            demoByCapability[cap] ?? {
              state: "VERIFIED" as const,
              label: "Información disponible",
              detail:
                "Información ilustrativa devuelta por una fuente habilitada.",
              source: "Cobertura habilitada",
            };

          return (
            <section className="sample-section" key={cap}>
              <div className="sample-section-heading">
                <h4>{capabilityLabels[cap]}</h4>
                <span className={`status ${demo.state}`}>{demo.label}</span>
              </div>

              {!compact && (
                <>
                  <p>{demo.detail}</p>
                  <p className="sample-meta">
                    Fuente ilustrativa · {demo.source} · {DEMO_DATE}
                  </p>
                </>
              )}
            </section>
          );
        })
      ) : (
        <div className="sample-section">
          <h4>Formato de evidencia</h4>
          <p>Sección → dato → fuente → fecha → limitación.</p>
          <p className="micro">
            No hay fuentes habilitadas. Esta muestra no anuncia cobertura ni
            contiene resultados.
          </p>
        </div>
      )}

      <p className="sample-footnote">
        El reporte real muestra únicamente la respuesta de las fuentes
        habilitadas para la placa consultada.
      </p>
    </article>
  );
}
