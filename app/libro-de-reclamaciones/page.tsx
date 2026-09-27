import { Header, Footer } from "@/components/marketing/shell";
import { BusinessIdentity } from "@/components/marketing/legal-content";
import { ClaimForm } from "@/components/claims/claim-form";

export const metadata = { title: "Libro de Reclamaciones | PlacaClara", robots: { index: true, follow: true } };

export default function Page() {
  return (
    <>
      <Header />
      <main id="main" className="wrap page">
        <div className="narrow" style={{ maxWidth: 780 }}>
          <p className="eyebrow">Atención al consumidor</p>
          <h1>Libro de Reclamaciones</h1>
          <BusinessIdentity />
          <p>Registra aquí una queja o reclamo relacionado con PlacaClara. Al finalizar recibirás un código correlativo y podrás imprimir o guardar una copia de la Hoja de Reclamación.</p>
          <p className="notice">Un <strong>reclamo</strong> expresa disconformidad con el servicio. Una <strong>queja</strong> expresa malestar respecto de la atención. La atención de ambos se realiza dentro del plazo legal aplicable y no está condicionada a pago alguno.</p>
          <ClaimForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
