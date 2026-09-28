import type { Metadata } from "next";
import { Header, Footer } from "@/components/marketing/shell";
import { commercialReadiness } from "@/src/config/commercial";
import { coverageLabels } from "@/src/config/providers";
import { Preview } from "@/components/checkout/preview";
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

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
            Revisa la disponibilidad y la cobertura del reporte antes de pagar.
          </p>
          <Preview
            initial={(plate || "").slice(0, 12)}
            ready={commercialReadiness().ready}
            coverage={coverageLabels()}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
