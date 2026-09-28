import { processingAge, isStale } from "@/src/orders/recovery";
import { requireAdmin } from "@/src/db/admin";
import { db, checked } from "@/src/db/client";
import { labels } from "@/src/config/product";
import { OrderActions, PdfRuntimeCheck } from "@/components/admin/actions";
import { env } from "@/src/config/env";
import type { OrderRow } from "@/src/vehicle/canonical";
import Link from "next/link";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  if (!(await requireAdmin().catch(() => null))) return null;
  const params = await searchParams;
  const page = Math.max(0, Math.min(10000, Number(params.page) || 0));
  let query = db()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .range(page * 25, page * 25 + 24);
  if (params.status && Object.keys(labels).includes(params.status))
    query = query.eq("status", params.status);
  const orders = checked(await query) as OrderRow[];
  const reports = orders.length
    ? checked(
        await db()
          .from("reports")
          .select("id,order_id,email_status,pdf_status")
          .in(
            "order_id",
            orders.map((o) => o.id),
          ),
      ) || []
    : [];
  return (
    <>
      <h2>Pedidos</h2>
      <div className="card" style={{ marginBottom: 18 }}>
        <p>
          <strong>Certificación de entrega</strong>
        </p>
        <p className="micro">
          El smoke test de PDF no consulta proveedores ni consume Masitaprex.
        </p>
        <PdfRuntimeCheck />
        {!env.VEHICLE_PROVIDER_EXECUTION_ENABLED && (
          <p className="notice">
            Proveedores bloqueados: los pedidos pagados no se reprocesarán hasta
            habilitar VEHICLE_PROVIDER_EXECUTION_ENABLED.
          </p>
        )}
      </div>
      <form className="flex">
        <label>
          Estado{" "}
          <select
            className="filter"
            name="status"
            defaultValue={params.status || ""}
          >
            <option value="">Todos</option>
            {[
              "PAYMENT_PENDING",
              "PAYMENT_REVIEW",
              "PAID",
              "REPORT_PROCESSING",
              "REPORT_READY",
              "REPORT_PARTIAL",
              "FAILED",
              "REJECTED",
            ].map((s) => (
              <option key={s} value={s}>
                {labels[s]}
              </option>
            ))}
          </select>
        </label>
        <button className="button outline">Filtrar</button>
      </form>
      {orders.map((o) => (
        <article className="card" key={o.id} style={{ marginTop: 18 }}>
          <div className="flex spread">
            <h3>
              {o.plate} · S/ {Number(o.amount_pen).toFixed(2)}
            </h3>
            <span>
              {isStale(o) ? "Procesamiento atascado" : labels[o.status]}
            </span>
          </div>
          <p>
            {o.email} · {o.phone} · {o.payment_method}
          </p>
          <p className="micro">
            {o.id} · Operación: {o.payment_reference || "No indicada"}
          </p>
          {o.paid_at && (
            <p>
              <Link className="button outline" href={`/admin/orders/${o.id}`}>
                Continuar pedido pagado
              </Link>
            </p>
          )}
          {o.payment_proof_path && (
            <p>
              <a
                className="button outline"
                href={`/api/admin/orders/${o.id}/proof`}
                target="_blank"
                rel="noreferrer"
              >
                Ver comprobante privado
              </a>
            </p>
          )}
          {o.status === "FAILED" && (
            <p className="error">
              Requiere resolución manual / devolución. {o.failure_code}
            </p>
          )}
          {o.status === "REPORT_PROCESSING" && (
            <p className="notice">
              Antigüedad: {processingAge(o) ?? "desconocida"} min.{" "}
              {isStale(o)
                ? "Puede recuperarse desde esta página."
                : "El intento sigue dentro del plazo. No se reprocesa todavía."}
            </p>
          )}
          {o.failure_code && <p className="micro">Código: {o.failure_code}</p>}
          {reports
            .filter((r) => r.order_id === o.id)
            .map((r) => (
              <p key={r.id}>
                Correo: {r.email_status} · PDF: {r.pdf_status}
              </p>
            ))}
          <OrderActions
            id={o.id}
            status={o.status}
            stale={isStale(o)}
            reportId={reports.find((r) => r.order_id === o.id)?.id}
            providerExecutionEnabled={env.VEHICLE_PROVIDER_EXECUTION_ENABLED}
          />
          <p className="micro">
            Consentimiento: términos{" "}
            {o.terms_version || "sin registro anterior"}, privacidad{" "}
            {o.privacy_version || "sin registro anterior"} ·{" "}
            {o.accepted_at || "—"}
          </p>
        </article>
      ))}
      {!orders.length && (
        <p className="empty">No hay pedidos con este filtro.</p>
      )}
      <div className="flex" style={{ marginTop: 24 }}>
        {page > 0 && (
          <Link
            href={`/admin/orders?page=${page - 1}&status=${params.status || ""}`}
          >
            Anterior
          </Link>
        )}
        {orders.length === 25 && (
          <Link
            href={`/admin/orders?page=${page + 1}&status=${params.status || ""}`}
          >
            Siguiente
          </Link>
        )}
      </div>
    </>
  );
}
