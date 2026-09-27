import { Header, Footer } from "@/components/marketing/shell";
import { BusinessIdentity } from "@/components/marketing/legal-content";
import { env } from "@/src/config/env";
export default function Page() {
  return (
    <>
      <Header />
      <main id="main" className="wrap page">
        <div className="narrow">
          <h1>Privacidad</h1>
          <p className="micro">Versión {env.PRIVACY_VERSION}</p>
          <BusinessIdentity />
          <h2>Datos y finalidad</h2>
          <p>
            Guardamos placa, correo, teléfono, versiones de políticas aceptadas
            y comprobante para gestionar el pedido, validar el pago y entregar
            el reporte. Consultamos datos documentales en los proveedores
            habilitados y conservamos evidencia normalizada y fechas de
            consulta.
          </p>
          <h2>Acceso y compartición</h2>
          <p>
            El comprobante y el PDF se almacenan en buckets privados. El reporte
            completo es accesible mediante un enlace secreto: contiene
            información registral y puede incluir nombres y documentos
            enmascarados, nunca domicilios ni documentos completos. El enlace
            compartible usa una clave independiente y elimina identidad de
            propietarios y datos del pedido. Quien tenga cada enlace podrá
            acceder a su respectiva vista.
          </p>
          <h2>Servicios de soporte</h2>
          <p>
            Utilizamos servicios de alojamiento, base de datos, correo y
            consulta vehicular. La explicación opcional con IA recibe
            información documental sin identidades de propietarios. La
            analítica, si se habilita, recibe eventos sin comprobantes ni
            documentos personales.
          </p>
          <h2>Conservación</h2>
          <p>
            La retención sigue la política de negocio configurada. Los plazos en
            blanco no activan eliminación automática. Una acción administrativa
            puede eliminar archivos vencidos sin borrar pedidos ni registros
            contables.
          </p>
          <p>
            Comprobantes:{" "}
            {env.PAYMENT_PROOF_RETENTION_DAYS
              ? `${env.PAYMENT_PROOF_RETENTION_DAYS} días, con ejecución administrativa`
              : "sin plazo de eliminación configurado"}
            . PDF:{" "}
            {env.REPORT_RETENTION_DAYS
              ? `${env.REPORT_RETENTION_DAYS} días, con ejecución administrativa`
              : "sin plazo de eliminación configurado"}
            .
          </p>
          <h2>Libro de Reclamaciones</h2>
          <p>
            Si registras una queja o reclamo, tratamos los datos de identificación,
            contacto, descripción del servicio y contenido presentado para registrar,
            atender y conservar la Hoja de Reclamación. Estos datos no se publican en
            el reporte vehicular ni en enlaces compartibles.
          </p>
          <h2>Solicitudes de privacidad</h2>
          <p>
            {env.PRIVACY_EMAIL ? (
              <a href={`mailto:${env.PRIVACY_EMAIL}`}>{env.PRIVACY_EMAIL}</a>
            ) : (
              "El canal de privacidad está pendiente de configuración antes de la apertura comercial."
            )}
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
