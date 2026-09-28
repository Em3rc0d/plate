import { requireAdmin } from "@/src/db/admin";
import { db, checked } from "@/src/db/client";

type Funnel = {
  days: number;
  landing: number;
  plate_submitted: number;
  preview_success: number;
  checkout_started: number;
  payment_submitted: number;
  payment_approved: number;
  report_ready: number;
  report_viewed: number;
  pdf_downloaded: number;
};

function percent(value: number, base: number) {
  if (!base) return "—";
  return `${((value / base) * 100).toFixed(1)}%`;
}

export default async function Page() {
  if (!(await requireAdmin().catch(() => null))) return null;

  const funnel = checked(
    await db().rpc("admin_funnel_metrics", { p_days: 30 }),
  ) as Funnel;

  const steps = [
    ["Visita landing", Number(funnel.landing || 0)],
    ["Envía placa", Number(funnel.plate_submitted || 0)],
    ["Ve cobertura", Number(funnel.preview_success || 0)],
    ["Inicia checkout", Number(funnel.checkout_started || 0)],
    ["Intenta pago", Number(funnel.payment_submitted || 0)],
    ["Pago aprobado", Number(funnel.payment_approved || 0)],
    ["Reporte generado", Number(funnel.report_ready || 0)],
    ["Reporte visto", Number(funnel.report_viewed || 0)],
    ["PDF descargado", Number(funnel.pdf_downloaded || 0)],
  ] as const;

  return (
    <>
      <div style={{ marginTop: 24 }}>
        <p className="eyebrow">CONVERSIÓN · ÚLTIMOS 30 DÍAS</p>
        <h2>Embudo comercial</h2>
        <p className="muted">
          Sesiones pseudónimas únicas. No guarda placa, correo, teléfono ni
          credenciales de pago en la tabla de analítica.
        </p>
      </div>

      <div className="grid3" style={{ marginTop: 24 }}>
        {[
          ["Visitas", funnel.landing],
          ["Pagos aprobados", funnel.payment_approved],
          ["Conversión visita → pago", percent(funnel.payment_approved, funnel.landing)],
          ["Reportes generados", funnel.report_ready],
          ["Reportes vistos", funnel.report_viewed],
          ["Pago → reporte visto", percent(funnel.report_viewed, funnel.payment_approved)],
        ].map(([label, value]) => (
          <div className="card" key={label}>
            <p>{label}</p>
            <div className="metric">{value}</div>
          </div>
        ))}
      </div>

      <div className="table-wrap" style={{ marginTop: 24 }}>
        <table>
          <thead>
            <tr>
              <th>Etapa</th>
              <th>Sesiones</th>
              <th>vs. etapa anterior</th>
              <th>vs. landing</th>
            </tr>
          </thead>
          <tbody>
            {steps.map(([label, value], index) => (
              <tr key={label}>
                <td>{label}</td>
                <td>{value}</td>
                <td>{index === 0 ? "—" : percent(value, steps[index - 1][1])}</td>
                <td>{index === 0 ? "100%" : percent(value, steps[0][1])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="micro">
        El embudo usa usuarios únicos por sesión, por lo que una recarga no debe
        inflar la etapa de landing. Eventos de pago y reporte se correlacionan
        con la sesión guardada en el pedido.
      </p>
    </>
  );
}
