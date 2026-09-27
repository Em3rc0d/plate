import { capabilityLabels, enabledCapabilities } from "@/src/config/providers";

export function ReportPreview({ compact = false }: { compact?: boolean }) {
  const capabilities = enabledCapabilities();
  const examples = capabilities.slice(0, compact ? 3 : capabilities.length);
  return (
    <article
      className={`report-sample ${compact ? "compact" : ""}`}
      aria-label="Vista ilustrativa del reporte, con datos ficticios"
    >
      <div className="document-top">
        <span>PLACACLARA / REPORTE VEHICULAR</span>
        <strong>EJEMPLO FICTICIO</strong>
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
              ? "Fabricación 2014 · Año modelo 2015"
              : "Los campos dependen de la cobertura habilitada."}
          </p>
        </div>
      </div>
      {!compact && (
        <p className="sample-date">
          Fecha ilustrativa del reporte · datos ficticios
        </p>
      )}
      {examples.length ? (
        examples.map((cap, i) => (
          <section className="sample-section" key={cap}>
            <div className="sample-section-heading">
              <h4>{capabilityLabels[cap]}</h4>
              <span
                className={`status ${i === 0 ? "VERIFIED" : "UNAVAILABLE"}`}
              >
                {i === 0 ? "Verificado · ejemplo" : "No disponible · ejemplo"}
              </span>
            </div>
            {!compact && (
              <>
                <p>
                  {i === 0
                    ? cap === "IDENTITY"
                      ? "Marca: Renault · Modelo: Logan. Datos ficticios para mostrar el formato."
                      : "Ejemplo de información devuelta. No representa una consulta real."
                    : "Ejemplo de una consulta sin información disponible. No permite concluir que no existan antecedentes."}
                </p>
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
                <p className="micro">
                  Límite: solo ilustra esta sección. La respuesta real puede ser
                  parcial o no estar disponible.
                </p>
              </>
            )}
          </section>
        ))
      ) : (
        <div className="sample-section">
          <h4>Formato de evidencia</h4>
          <p>Sección → estado → dato → fuente → fecha → limitación.</p>
          <p className="micro">
            No hay fuentes habilitadas. Esta muestra no anuncia cobertura ni
            contiene resultados.
          </p>
        </div>
      )}
      <p className="sample-footnote">
        Vista ilustrativa del reporte. Placa ficticia, no consultable. No
        corresponde a un vehículo ni a una consulta real.
      </p>
    </article>
  );
}
