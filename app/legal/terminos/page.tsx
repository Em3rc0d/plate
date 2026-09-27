import { Header, Footer } from "@/components/marketing/shell";
import { BusinessIdentity } from "@/components/marketing/legal-content";
import { env } from "@/src/config/env";
export default function Page() {
  return (
    <>
      <Header />
      <main id="main" className="wrap page">
        <div className="narrow">
          <h1>Términos y condiciones</h1>
          <p className="micro">Versión {env.TERMS_VERSION}</p>
          <BusinessIdentity />
          <h2>Servicio</h2>
          <p>
            El reporte consolida información disponible de las fuentes
            habilitadas para una placa. No certifica condición mecánica,
            inexistencia universal de antecedentes ni conveniencia de compra.
            Los registros pueden presentar retrasos, omisiones o discrepancias.
          </p>
          <h2>Pedido y pago</h2>
          <p>
            El monto y medio elegido se muestran antes del pago. Yape y Plin se
            validan manualmente. Una captura por sí sola no acredita un abono.
            No realices un segundo pago por el mismo pedido ante un fallo de
            consulta.
          </p>
          <h2>Entrega</h2>
          <p>
            Después de aprobar el pago se procesa el reporte. Se muestra en la
            página del pedido; también se envía por correo cuando ese servicio
            está habilitado. Un fallo de correo o PDF no elimina el reporte web.
            Si algunas fuentes fallan, la entrega puede ser parcial y señala sus
            límites. No se promete entrega inmediata.
          </p>
          <h2>Cobertura</h2>
          <p>
            NOT_FOUND significa cero registros devueltos en la cobertura
            consultada. UNAVAILABLE significa fuente o campo no disponible.
            Ninguno de estos estados acredita ausencia de obligaciones o
            antecedentes fuera de esa cobertura.
          </p>
          <h2>Resolución</h2>
          <p>
            Los pedidos sin información útil se revisan manualmente, sin exigir
            otro pago. Consulta las{" "}
            <a href="/legal/reembolsos">condiciones de reembolso</a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
