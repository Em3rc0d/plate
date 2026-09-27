import { coverageLabels } from "@/src/config/providers";
export function CoverageList() {
  const coverage = coverageLabels();
  return (
    <div>
      <h3>Disponible ahora</h3>
      {coverage.length ? (
        <ul>
          {coverage.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">
          Las fuentes aún no están habilitadas. La compra no está disponible.
        </p>
      )}
      <p className="micro">
        Disponibilidad de consulta según configuración; cada fuente puede
        responder parcialmente. La presencia de una clave no garantiza registros
        para una placa.
      </p>
    </div>
  );
}
