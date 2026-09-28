import {
  capabilityLabels,
  enabledCapabilities,
  type Capability,
} from "@/src/config/providers";

type DemoState = "VERIFIED" | "NOT_FOUND" | "UNAVAILABLE" | "CONFLICT";

const demoByCapability: Partial<
  Record<Capability, { state: DemoState; label: string; detail: string }>
> = {
  IDENTITY: {
    state: "VERIFIED",
    label: "Información disponible",
    detail:
      "RENAULT LOGAN · Año modelo 2015 · GRIS BEIGE. Datos ficticios para mostrar el formato.",
  },
  REGISTRY_CURRENT_OWNER: {
    state: "VERIFIED",
    label: "Información disponible",
    detail:
      "Titular registrado: CARLOS V***** B***** · Documento enmascarado. Ejemplo ficticio.",
  },
  REGISTRY_HISTORY: {
    state: "VERIFIED",
    label: "Información disponible",
    detail:
      "3 registros históricos devueltos. El número total de transferencias no se infiere automáticamente.",
  },
  RESTRICTIONS: {
    state: "VERIFIED",
    label: "Información disponible",
    detail:
      "1 registro registral requiere revisión documental. Ejemplo ficticio.",
  },
  SOAT: {
    state: "VERIFIED",
    label: "Vigente",
    detail:
      "Rimac Seguros · vigencia hasta 25/09/2027 · historial disponible. Ejemplo ficticio.",
  },
  CITV: {
    state: "VERIFIED",
    label: "Vigente",
    detail:
      "Revisión técnica vigente hasta 06/07/2027. Ejemplo ficticio.",
  },
  FINES_NATIONAL: {
    state: "NOT_FOUND",
    label: "Sin registros devueltos",
    detail:
      "SUTRAN no devolvió registros dentro de la cobertura consultada. Ejemplo ficticio.",
  },
  FINES_LIMA: {
    state: "VERIFIED",
    label: "Información disponible",
    detail:
      "2 papeletas pendientes · S/ 350.00 publicados. Ejemplo ficticio.",
  },
  FINES_CALLAO: {
    state: "UNAVAILABLE",
    label: "No disponible",
    detail:
      "La fuente no estuvo disponible en esta consulta de demostración.",
  },
};

export function ReportPreview({ compact = false }: { compact?: boolean }) {
  const capabilities = enabledCapabilities();
  const examples = capabilities.slice(0, compact ? 3 : capabilities.length);
  const statuses = examples.map(
    (cap) =>
      demoByCapability[cap] ?? {
        state: "VERIFIED" as const,
        label: "Información disponible",
        detail:
          "Ejemplo ficticio de información devuelta por una fuente habilitada.",
      },
  );
  const withData = statuses.filter((item) => item.state === "VERIFIED").length;
  const review = statuses.filter((item) => item.state === "CONFLICT").length;
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
          <p className="sample-date">
            Consulta ilustrativa · datos ficticios
          </p>
          <p className="sample-footnote" style={{ marginBottom: 8 }}>
            <strong>{withData}</strong> áreas con información ·{" "}
            <strong>{review}</strong> para revisar ·{" "}
            <strong>{unavailable}</strong> no disponible
          </p>
        </>
      )}

      {examples.length ? (
        examples.map((cap) => {
          const demo =
            demoByCapability[cap] ?? {
              state: "VERIFIED" as const,
              label: "Información disponible",
              detail:
                "Ejemplo ficticio de información devuelta por una fuente habilitada.",
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
                  <dl className="sample-provenance">
                    <div>
                      <dt>Fuente</dt>
                      <dd>Fuente de demostración (ficticia)</dd>
                    </div>
                    <div>
                      <dt>Consulta ilustrativa</dt>
                      <dd>Fecha ficticia de demostración</dd>
                    </div>
                  </dl>
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
        Vista ilustrativa. La placa, los importes, las fechas y todos los
        resultados son ficticios. El reporte real depende exclusivamente de las
        fuentes habilitadas y su respuesta para la placa consultada.
      </p>
    </article>
  );
}
