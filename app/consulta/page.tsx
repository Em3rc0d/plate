import { Header, Footer } from "@/components/marketing/shell";
import { Preview } from "@/components/checkout/preview";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ plate?: string }>;
}) {
  const { plate } = await searchParams;
  return (
    <>
      <Header />
      <main id="main" className="wrap page">
        <div className="narrow">
          <p className="eyebrow">01 / Consulta</p>
          <h1>Empecemos por tu placa.</h1>
          <p className="muted">
            Verifica la información básica disponible antes de continuar al
            pago.
          </p>
          <Preview initial={(plate || "").slice(0, 12)} />
        </div>
      </main>
      <Footer />
    </>
  );
}
