import { requireAdmin } from "@/src/db/admin";
import { db, checked, required } from "@/src/db/client";
import { labels } from "@/src/config/product";
import type { OrderRow } from "@/src/vehicle/canonical";
export default async function Page() {
  if (!(await requireAdmin().catch(() => null))) return null;
  const stats = checked(await db().rpc("admin_metrics"));
  const orders = required(
    await db()
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
  ) as OrderRow[];
  return (
    <>
      <div className="grid3" style={{ marginTop: 24 }}>
        {[
          ["Pedidos hoy (Lima)", stats.orders_today],
          ["Pagos pendientes", stats.pending],
          ["Pedidos pagados", stats.paid_reports],
          ["Reportes listos", stats.ready],
          ["Reportes parciales", stats.partial],
          ["Pedidos fallidos", stats.failed],
          [
            "Éxito de proveedores",
            `${Number(stats.provider_success_rate).toFixed(1)}%`,
          ],
          [
            "Duración media de generación",
            `${(Number(stats.average_duration_ms) / 1000).toFixed(1)} s`,
          ],
          ["Reportes hoy (Lima)", stats.reports_today],
          ["Ingreso bruto aprobado", `S/ ${Number(stats.revenue).toFixed(2)}`],
          ["Costo estimado de datos", `S/ ${Number(stats.cost).toFixed(4)}`],
          ["Datos / reporte", `S/ ${Number(stats.average_cost).toFixed(4)}`],
        ].map(([label, value]) => (
          <div className="card" key={label}>
            <p>{label}</p>
            <div className="metric">{value}</div>
          </div>
        ))}
      </div>
      <h2>Pedidos recientes</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Placa</th>
              <th>Estado</th>
              <th>Monto</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.plate}</td>
                <td>{labels[o.status]}</td>
                <td>S/ {Number(o.amount_pen).toFixed(2)}</td>
                <td>
                  {new Date(o.created_at).toLocaleString("es-PE", {
                    timeZone: "America/Lima",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length && <p className="empty">Aún no hay pedidos.</p>}
      </div>
    </>
  );
}
