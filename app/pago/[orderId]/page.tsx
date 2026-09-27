import { StatusRefresh } from "@/components/checkout/status-refresh";
import { MercadoPagoCheckout } from "@/components/checkout/mercado-pago-checkout";
import Image from "next/image";
import Link from "next/link";
import { Header, Footer } from "@/components/marketing/shell";
import { customerOrder } from "@/src/orders/service";
import { env, mercadoPagoConfigured } from "@/src/config/env";
import { labels } from "@/src/config/product";
import { ProofForm } from "@/components/checkout/proof-form";
import { notFound } from "next/navigation";
import { db, checked } from "@/src/db/client";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

function paymentLabel(method: string) {
  if (method === "MP_YAPE") return "Yape · Mercado Pago";
  if (method === "MP_CARD") return "Tarjeta · Mercado Pago";
  return method;
}

export default async function Page({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await customerOrder(orderId).catch(() => null);
  if (!order) notFound();

  const mercadoPago = ["MP_YAPE", "MP_CARD"].includes(order.payment_method);
  const yape = order.payment_method === "YAPE";
  const qr = mercadoPago
    ? ""
    : yape
      ? env.NEXT_PUBLIC_YAPE_QR_URL
      : env.NEXT_PUBLIC_PLIN_QR_URL;
  const report = checked(
    await db()
      .from("reports")
      .select("public_code")
      .eq("order_id", orderId)
      .maybeSingle(),
  );
  const latestPayment = mercadoPago
    ? checked(
        await db()
          .from("payment_attempts")
          .select("status,live_mode,provider_status")
          .eq("order_id", orderId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      )
    : null;
  const paymentLocked =
    latestPayment &&
    ["CREATING", "PENDING", "APPROVED", "UNKNOWN"].includes(
      latestPayment.status,
    );

  return (
    <>
      <Header />
      <main id="main" className="wrap page">
        <div className="narrow" style={{ overflowWrap: "anywhere" }}>
          <p className="eyebrow">03 / Pago y entrega</p>
          <h1>{labels[order.status]}</h1>
          <dl className="order-details">
            <div>
              <dt>Placa</dt>
              <dd>{order.plate}</dd>
            </div>
            <div>
              <dt>Precio del reporte</dt>
              <dd>S/ {Number(order.amount_pen).toFixed(2)}</dd>
            </div>
            <div>
              <dt>Medio de pago</dt>
              <dd>{paymentLabel(order.payment_method)}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>{labels[order.status]}</dd>
            </div>
            <div className="order-reference">
              <dt>Número de pedido</dt>
              <dd>{order.id}</dd>
            </div>
          </dl>

          {["PAYMENT_PENDING", "REJECTED"].includes(order.status) ? (
            <div className="card">
              {mercadoPago ? (
                paymentLocked ? (
                  <>
                    <p className="notice">
                      {latestPayment?.status === "APPROVED" &&
                      latestPayment?.live_mode === false
                        ? "Pago TEST aprobado. No se ejecutó ninguna consulta pagada a Masitaprex."
                        : "Este pedido ya tiene un intento de pago activo. No realices un segundo pago mientras Mercado Pago confirma el resultado."}
                    </p>
                    {latestPayment?.status !== "APPROVED" && <StatusRefresh />}
                  </>
                ) : mercadoPagoConfigured ? (
                  <MercadoPagoCheckout
                    orderId={order.id}
                    publicKey={env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY}
                    amount={Number(order.amount_pen)}
                    method={order.payment_method as "MP_YAPE" | "MP_CARD"}
                    payerEmail={order.email}
                    testMode={!env.MERCADO_PAGO_LIVE_MODE}
                  />
                ) : (
                  <p className="notice">
                    Mercado Pago no está configurado. No realices ningún pago.
                  </p>
                )
              ) : (
                <>
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
                      El comprobante anterior fue rechazado. Verifica
                      destinatario y monto; adjunta un comprobante legible.
                    </p>
                  )}
                  <ProofForm id={order.id} />
                </>
              )}
            </div>
          ) : (
            <div className="card">
              <p>
                {order.status === "FAILED"
                  ? "El pedido requiere resolución manual o devolución. No vuelvas a pagar."
                  : mercadoPago
                    ? "Pago confirmado o en procesamiento. No realices un segundo pago por este pedido. Te mostraremos el reporte aquí cuando esté listo."
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
