import type { Metadata } from "next";
import { CoverageList } from "@/components/marketing/coverage-list";
import { Header, Footer } from "@/components/marketing/shell";
import { OrderForm } from "@/components/checkout/order-form";
import { env, mercadoPagoConfigured } from "@/src/config/env";
import { offeringName } from "@/src/config/commercial";
import { commercialReadiness } from "@/src/config/commercial";
import { normalizePlate } from "@/src/vehicle/normalize-plate";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ plate?: string }>;
}) {
  let plate = "";
  try {
    plate = normalizePlate((await searchParams).plate || "");
  } catch {
    redirect("/consulta");
  }
  const ready = commercialReadiness().ready;
  return (
    <>
      <Header />
      <main id="main" className="wrap page">
        <p className="eyebrow">02 / Tu pedido</p>
        <h1>Revisa tu reporte antes de pagar.</h1>
        <div className="two-col">
          <aside className="card checkout-summary">
            <div className="plate">{plate}</div>
            <h2>{offeringName()}</h2>
            <p className="micro">
              Información documental de las fuentes habilitadas, con fecha y
              limitaciones.
            </p>
            <div className="price">
              <small>S/</small> {env.REPORT_PRICE_PEN.toFixed(2)}
            </div>
            <p className="muted">Pago único por esta placa.</p>
            <CoverageList />
            <p className="notice">
              {mercadoPagoConfigured
                ? "Pago procesado por Mercado Pago. El reporte se genera solo después de confirmar el pago."
                : "Validación manual del pago. La entrega comienza después de aprobar el comprobante."}
            </p>
            <p className="micro">
              No reemplaza una revisión mecánica ni certificación registral.
            </p>
          </aside>
          <section className="card">
            <h2>Datos de contacto del pedido</h2>
            {!ready && (
              <p className="notice">
                Las compras aún no están habilitadas. No realices ningún pago.
              </p>
            )}
            <OrderForm
              plate={plate}
              termsVersion={env.TERMS_VERSION}
              privacyVersion={env.PRIVACY_VERSION}
              enabled={{
                MP_YAPE:
                  ready &&
                  mercadoPagoConfigured &&
                  env.YAPE_CHECKOUT_ENABLED,
                MP_CARD: ready && mercadoPagoConfigured,
                YAPE:
                  ready &&
                  env.YAPE_CHECKOUT_ENABLED &&
                  !!env.YAPE_PHONE &&
                  !!env.YAPE_DISPLAY_NAME,
                PLIN: ready && !!env.PLIN_PHONE && !!env.PLIN_DISPLAY_NAME,
              }}
            />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
