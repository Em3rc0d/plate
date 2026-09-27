import { StatusRefresh } from "@/components/checkout/status-refresh";
import Image from "next/image";
import Link from "next/link";
import { Header, Footer } from "@/components/marketing/shell";
import { customerOrder } from "@/src/orders/service";
import { env } from "@/src/config/env";
import { labels } from "@/src/config/product";
import { ProofForm } from "@/components/checkout/proof-form";
import { notFound } from "next/navigation";
import { db, checked } from "@/src/db/client";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function Page({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await customerOrder(orderId).catch(() => null);
  if (!order) notFound();
  const yape = order.payment_method === "YAPE";
  const qr = yape ? env.NEXT_PUBLIC_YAPE_QR_URL : env.NEXT_PUBLIC_PLIN_QR_URL;
  const report = checked(
    await db()
      .from("reports")
      .select("public_code")
      .eq("order_id", orderId)
      .maybeSingle(),
  );
  return (
    <>
      <Header />
      <main id="main" className="wrap page">
        <div className="narrow" style={{ overflowWrap: "anywhere" }}>
          <p className="eyebrow">03 / Pago y entrega</p>
          <h1>{labels[order.status]}</h1>
          <p className="muted">
            Pedido {order.id} · Placa {order.plate} · S/{" "}
            {Number(order.amount_pen).toFixed(2)} · {order.payment_method}
          </p>
          {["PAYMENT_PENDING", "REJECTED"].includes(order.status) ? (
            <div className="card">
              <h2>
                Paga S/ {Number(order.amount_pen).toFixed(2)} con{" "}
                {yape ? "Yape" : "Plin"}
              </h2>
              {qr && (
                <Image
                  className="qr"
                  unoptimized
                  src={qr}
                  width={220}
                  height={220}
                  alt={`QR de pago ${order.payment_method}`}
                />
              )}
              <p>
                {yape ? env.YAPE_DISPLAY_NAME : env.PLIN_DISPLAY_NAME}
                <br />
                <strong>{yape ? env.YAPE_PHONE : env.PLIN_PHONE}</strong>
              </p>
              {order.status === "REJECTED" && (
                <p className="notice">
                  El comprobante anterior fue rechazado. Verifica destinatario y
                  monto; adjunta un comprobante legible.
                </p>
              )}
              <ProofForm id={order.id} />
            </div>
          ) : (
            <div className="card">
              <p>
                {order.status === "FAILED"
                  ? "El pedido requiere resolución manual o devolución. No vuelvas a pagar."
                  : `Pago enviado para validación. No realices un segundo pago por este pedido. Te mostraremos el reporte aquí${env.RESEND_API_KEY && env.REPORT_FROM_EMAIL ? " y también intentaremos enviarlo por email." : ". El envío por correo no está habilitado; conserva esta página en este navegador."}`}
              </p>
              {["PAYMENT_REVIEW", "REPORT_PROCESSING", "PAID"].includes(
                order.status,
              ) && <StatusRefresh />}
              {env.SUPPORT_EMAIL && (
                <p>
                  Soporte:{" "}
                  <a href={`mailto:${env.SUPPORT_EMAIL}`}>
                    {env.SUPPORT_EMAIL}
                  </a>
                </p>
              )}
              {report && (
                <Link
                  className="button primary"
                  href={`/reporte/${report.public_code}`}
                >
                  Ver mi reporte
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
