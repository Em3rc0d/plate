import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/src/db/admin";
import { db, checked } from "@/src/db/client";
import { labels } from "@/src/config/product";
import { env } from "@/src/config/env";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await requireAdmin().catch(() => null))) return null;

  const { id } = await params;
  const order = checked(
    await db().from("orders").select("*").eq("id", id).maybeSingle(),
  );
  if (!order) notFound();

  const report = checked(
    await db()
      .from("reports")
      .select("id,public_code,status,pdf_status,email_status")
      .eq("order_id", id)
      .maybeSingle(),
  );

  return (
    <>
      <p className="eyebrow">Continuidad del pedido</p>
      <h2>{order.plate}</h2>

      <div className="card" style={{ marginTop: 18 }}>
        <p>
          <strong>Estado:</strong> {labels[order.status] ?? order.status}
        </p>
        <p>
          <strong>Monto:</strong> S/ {Number(order.amount_pen).toFixed(2)}
        </p>
        <p>
          <strong>Medio:</strong> {order.payment_method}
        </p>
        <p>
          <strong>Operación:</strong> {order.payment_reference || "No indicada"}
        </p>
        <p className="micro">{order.id}</p>

        {order.paid_at && (
          <p className="notice">
            Pago confirmado. Este pedido no requiere ni permite un segundo cobro
            para continuar su procesamiento.
          </p>
        )}

        {!env.VEHICLE_PROVIDER_EXECUTION_ENABLED && (
          <p className="notice">
            La generación del reporte está detenida por el kill switch de
            proveedores. Masitaprex permanece bloqueado.
          </p>
        )}

        {report ? (
          <>
            <p>
              Reporte: {labels[report.status] ?? report.status} · PDF:{" "}
              {report.pdf_status} · Correo: {report.email_status}
            </p>
            <Link className="button primary" href={`/reporte/${report.public_code}`}>
              Ver reporte
            </Link>
          </>
        ) : (
          <p className="micro">
            Aún no existe reporte para este pedido. El pago ya está conservado y
            se podrá reanudar desde administración cuando se habilite la
            ejecución del proveedor.
          </p>
        )}
      </div>

      <p style={{ marginTop: 18 }}>
        <Link href="/admin/orders">Volver a pedidos</Link>
      </p>
    </>
  );
}
