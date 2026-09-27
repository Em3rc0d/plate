import {
  enabledCapabilities,
  capabilityLabels,
  type Capability,
} from "@/src/config/providers";

export const capabilityDescriptions: Record<
  Capability,
  { detail: string; limit: string }
> = {
  IDENTITY: {
    detail:
      "Marca, modelo, años y características identificativas devueltas por la fuente.",
    limit:
      "Algunos campos pueden no estar disponibles. No confirma el estado físico del auto.",
  },
  REGISTRY_CURRENT_OWNER: {
    detail:
      "Información del titular registrado, con documentos personales enmascarados.",
    limit:
      "Refleja lo devuelto al consultar; no sustituye una certificación registral.",
  },
  REGISTRY_HISTORY: {
    detail:
      "Registros de titularidad anteriores y fechas, cuando estén disponibles.",
    limit:
      "Puede ser parcial. Los registros ambiguos se señalan para revisión.",
  },
  RESTRICTIONS: {
    detail:
      "Restricciones e información asociada devueltas por la fuente registral.",
    limit: "Sin registros devueltos no equivale a ausencia de gravámenes.",
  },
  SOAT: {
    detail: "Aseguradora, vigencia y certificados disponibles.",
    limit: "Sujeto a la actualización y cobertura de la fuente.",
  },
  CITV: {
    detail:
      "Fechas y resultados de certificados de revisión técnica disponibles.",
    limit: "No reemplaza una inspección mecánica actual.",
  },
  FINES_NATIONAL: {
    detail: "Papeletas pendientes devueltas para SUTRAN.",
    limit: "No incluye todas las municipalidades ni multas pagadas.",
  },
  FINES_LIMA: {
    detail: "Papeletas pendientes devueltas para Lima.",
    limit: "Solo la jurisdicción consultada; no un historial nacional.",
  },
  FINES_CALLAO: {
    detail: "Papeletas pendientes devueltas para Callao.",
    limit:
      "Solo la jurisdicción consultada; puede haber importes no publicados.",
  },
  THEFT: {
    detail: "Registros devueltos por la fuente habilitada.",
    limit: "No certifica ausencia de antecedentes fuera de la cobertura.",
  },
  CAPTURE_ORDERS: {
    detail: "Órdenes devueltas por la fuente habilitada.",
    limit: "Información limitada a la fuente y fecha consultadas.",
  },
  CLAIMS: {
    detail: "Siniestros devueltos por la fuente habilitada.",
    limit: "No garantiza un historial completo de accidentes.",
  },
  GNV: {
    detail: "Información de GNV devuelta por la fuente habilitada.",
    limit: "No reemplaza una inspección física.",
  },
  VALUATION: {
    detail: "Información de valor devuelta por la fuente habilitada.",
    limit: "No garantiza precio de venta ni condición del vehículo.",
  },
};

export function CoverageList({ detailed = false }: { detailed?: boolean }) {
  const coverage = enabledCapabilities();
  return (
    <div className="coverage">
      {!detailed && <h3>Cobertura habilitada</h3>}
      {coverage.length ? (
        detailed ? (
          <div className="coverage-modules">
            {coverage.map((cap, i) => (
              <article className="coverage-module" key={cap}>
                <span className="document-number" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{capabilityLabels[cap]}</h3>
                  <p>{capabilityDescriptions[cap].detail}</p>
                  <p className="coverage-limit">
                    <strong>Ten en cuenta:</strong>{" "}
                    {capabilityDescriptions[cap].limit}
                  </p>
                  <p className="micro">
                    Fuente y fecha visibles en el reporte.
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <ul className="coverage-items">
            {coverage.map((cap) => (
              <li key={cap}>{capabilityLabels[cap]}</li>
            ))}
          </ul>
        )
      ) : (
        <p className="notice">
          Las fuentes aún no están habilitadas. La compra no está disponible.
        </p>
      )}
      <p className="micro">
        La cobertura indica qué puede consultarse. Cada fuente puede devolver
        información parcial o no devolver registros para una placa.
      </p>
    </div>
  );
}
