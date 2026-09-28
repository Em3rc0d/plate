import { requireAdmin } from "@/src/db/admin";
import { db, checked, required } from "@/src/db/client";
import { labels } from "@/src/config/product";
import type { OrderRow } from "@/src/vehicle/canonical";
import { ReconcileMercadoPago } from "@/components/admin/payment-finance";
export default async function Page() {
  if (!(await requireAdmin().catch(() => null))) return null;
  const stats = checked(await db().rpc("admin_metrics"));
  const mpFinancialsComplete =
    Number(stats.mp_live_approved || 0) === Number(stats.mp_financials_known || 0);
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
          [
            "Deducciones Mercado Pago",
            mpFinancialsComplete
              ? `S/ ${Number(stats.mp_deductions).toFixed(2)}`
              : "Pendiente conciliación",
          ],
          [
            "Neto tras Mercado Pago",
            mpFinancialsComplete
              ? `S/ ${Number(stats.net_after_payment_fees).toFixed(2)}`
              : "Pendiente conciliación",
          ],
          ["Costo estimado de datos", `S/ ${Number(stats.cost).toFixed(4)}`],
          ["Datos / reporte", `S/ ${Number(stats.average_cost).toFixed(4)}`],
          [
            "Margen tras MP + datos",
            mpFinancialsComplete
              ? `S/ ${Number(stats.contribution_after_payment_and_data).toFixed(2)}`
              : "Pendiente conciliación",
          ],
        ].map(([label, value]) => (
          <div className="card" key={label}>
            <p>{label}</p>
            <div className="metric">{value}</div>
          </div>
        ))}
      </div>
      <ReconcileMercadoPago />
      <p className="micro">
        Las deducciones se calculan con el monto neto real reportado por Mercado
        Pago, no con una tasa estimada.
      </p>
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
