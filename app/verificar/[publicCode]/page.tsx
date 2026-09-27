import { notFound } from "next/navigation";
import { publicReport, sharedReport } from "@/src/reports/repository";
import { databaseConfigured } from "@/src/config/env";
import { labels } from "@/src/config/product";
import { Header, Footer } from "@/components/marketing/shell";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function Page({
  params,
}: {
  params: Promise<{ publicCode: string }>;
}) {
  if (!databaseConfigured) notFound();
  const code = (await params).publicCode;
  const row = (await publicReport(code)) || (await sharedReport(code));
  if (!row) notFound();
  return (
    <>
      <Header />
      <main id="main" className="wrap page">
        <div className="narrow card">
          <p className="eyebrow">Autenticidad del reporte</p>
          <h1>Reporte registrado.</h1>
          <p>Placa: {row.report_json.identity.plate}</p>
          <p>
            {row.report_json.identity.brand} {row.report_json.identity.model}
          </p>
          <p>Emisión: {row.created_at}</p>
          <p>Estado: {labels[row.status]}</p>
          <p className="micro" style={{ overflowWrap: "anywhere" }}>
            ID: {row.id}
          </p>
          <p className="notice">
            Esta página confirma la existencia del reporte. No certifica la
            condición del vehículo ni reemplaza los documentos de origen.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
