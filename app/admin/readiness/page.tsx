import { requireAdmin } from "@/src/db/admin";
import { readiness } from "@/src/config/readiness";
import { env } from "@/src/config/env";
import { RetentionControl } from "@/components/admin/retention";
export default async function Page() {
  if (!(await requireAdmin().catch(() => null))) return null;
  const data = await readiness(true);
  return (
    <>
      <h2>
        {data.blockers
          ? `NOT READY — ${data.blockers} blockers`
          : !env.MERCADO_PAGO_LIVE_MODE ||
              !env.VEHICLE_PROVIDER_EXECUTION_ENABLED
            ? "TEST / CONFIG READY"
            : "READY TO SELL"}
      </h2>
      <p className="muted">
        Estado de configuración, no certificación legal ni validación de
        respuestas reales. Completa la sonda y la compra interna antes de abrir
        tráfico.
      </p>
      {[...new Set(data.items.map((x) => x.group))].map((group) => (
        <section className="card" key={group} style={{ margin: "20px 0" }}>
          <h3>{group}</h3>
          {data.items
            .filter((x) => x.group === group)
            .map((item) => (
              <div className="spec-row" key={item.label}>
                <div>
                  {item.label}
                  {item.detail && <p className="micro">{item.detail}</p>}
                </div>
                <strong>{item.state}</strong>
              </div>
            ))}
        </section>
      ))}
      <section className="card">
        <h3>Retención controlada</h3>
        <p>
          Comprobantes:{" "}
          {env.PAYMENT_PROOF_RETENTION_DAYS
            ? `${env.PAYMENT_PROOF_RETENTION_DAYS} días`
            : "sin eliminación automática"}
          .
        </p>
        <p>
          PDF:{" "}
          {env.REPORT_RETENTION_DAYS
            ? `${env.REPORT_RETENTION_DAYS} días`
            : "sin eliminación automática"}
          .
        </p>
        <p>
          Solo ejecución manual. Los reportes JSON y pedidos se conservan. No se
          eliminan comprobantes en revisión o procesamiento. Confirma la
          política de negocio antes de configurar plazos.
        </p>
        <RetentionControl />
      </section>
    </>
  );
}
