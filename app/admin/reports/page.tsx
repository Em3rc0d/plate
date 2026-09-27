import { OrderActions } from "@/components/admin/actions";
import Link from "next/link";
import { requireAdmin } from "@/src/db/admin";
import { db, required } from "@/src/db/client";
import { labels } from "@/src/config/product";
import type { ReportRow } from "@/src/vehicle/canonical";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  if (!(await requireAdmin().catch(() => null))) return null;
  const page = Math.max(0, Number((await searchParams).page) || 0);
  const reports = required(
    await db()
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .range(page * 25, page * 25 + 24),
  ) as ReportRow[];
  return (
    <>
      <h2>Reportes</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Placa</th>
              <th>Estado</th>
              <th>Datos S/</th>
              <th>Fuentes con incidencias</th>
              <th>PDF / Correo</th>
              <th>Emisión</th>
              <th>Entrega</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/reporte/${r.public_code}`}>
                    {r.report_json.identity.plate} ↗
                  </Link>
                </td>
                <td>{labels[r.status]}</td>
                <td>{Number(r.total_data_cost_pen).toFixed(4)}</td>
                <td>
                  {[
                    ...new Set(
                      r.report_json.evidence
                        .filter(
                          (e) => !["VERIFIED", "NOT_FOUND"].includes(e.status),
                        )
                        .map((e) => e.provider),
                    ),
                  ].join(", ") || "—"}
                </td>
                <td>
                  {r.pdf_status} / {r.email_status}
                </td>
                <td>
                  {new Date(r.created_at).toLocaleDateString("es-PE", {
                    timeZone: "America/Lima",
                  })}
                </td>
                <td>
                  <OrderActions
                    id={r.order_id}
                    status={r.status}
                    reportId={r.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!reports.length && <p className="empty">No hay reportes generados.</p>}
      </div>
      <div className="flex">
        {page > 0 && (
          <Link href={`/admin/reports?page=${page - 1}`}>Anterior</Link>
        )}
        {reports.length === 25 && (
          <Link href={`/admin/reports?page=${page + 1}`}>Siguiente</Link>
        )}
      </div>
    </>
  );
}
