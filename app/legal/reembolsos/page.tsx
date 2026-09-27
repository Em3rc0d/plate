import { Header, Footer } from "@/components/marketing/shell";
import { BusinessIdentity } from "@/components/marketing/legal-content";
import { env } from "@/src/config/env";
export default function Page() {
  return (
    <>
      <Header />
      <main id="main" className="wrap page">
        <div className="narrow">
          <h1>Reembolsos y resolución de pedidos</h1>
          <p className="micro">Versión {env.REFUND_POLICY_VERSION}</p>
          <BusinessIdentity />
          <h2>Si la consulta falla</h2>
          <p>
            Si no se obtiene información útil después de aprobar el pago, el
            pedido requiere resolución manual. El operador puede reprocesarlo
            sin otro pago o gestionar la devolución. No pagues nuevamente por el
            mismo pedido.
          </p>
          <h2>Reporte parcial</h2>
          <p>
            La disponibilidad varía por fuente. Un reporte parcial identifica
            qué datos se obtuvieron y cuáles faltaron. Si consideras que la
            entrega no corresponde al servicio adquirido, solicita revisión
            indicando el ID del pedido.
          </p>
          <h2>Entrega por correo o PDF</h2>
          <p>
            Si el reporte web existe y falla el PDF o el correo, podemos
            reintentar la entrega sin repetir consultas a proveedores ni cobrar
            nuevamente.
          </p>
          <h2>Solicitud</h2>
          <p>
            Contacta al soporte con el ID del pedido y código de operación. No
            envíes contraseñas ni claves bancarias. La revisión y devolución son
            manuales; esta página no promete un plazo no confirmado ni limita
            derechos aplicables.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
