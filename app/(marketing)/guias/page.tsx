import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageEvent } from "@/components/marketing/page-event";
import { acquisitionPages } from "@/src/seo/acquisition-pages";
import { publicSiteUrl } from "@/src/config/product";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Guías para revisar un vehículo usado en Perú",
  description:
    "Guías de PlacaClara sobre consulta vehicular, historial, SOAT, revisión técnica, papeletas y qué revisar antes de comprar un auto usado.",
  alternates: { canonical: `${publicSiteUrl}/guias` },
  openGraph: {
    url: `${publicSiteUrl}/guias`,
    title: "Guías para revisar un vehículo usado en Perú | PlacaClara",
    description:
      "Consulta vehicular, historial, SOAT, CITV, papeletas y checklist precompra.",
    images: ["/placaclara-hero-master.webp"],
  },
};

const order = [
  "consulta-vehicular-por-placa",
  "comprar-auto-usado",
  "historial-vehicular",
  "soat-por-placa",
  "revision-tecnica-por-placa",
  "papeletas-por-placa",
];

export default function Page() {
  return (
    <main id="main" className={`wrap ${styles.page}`}>
      <PageEvent
        event="landing_view"
        scope="guias"
        properties={{ path: "/guias" }}
      />
      <div className={styles.hero}>
        <p className="eyebrow">GUÍAS PLACACLARA</p>
        <h1>Qué revisar antes de comprar un vehículo usado</h1>
        <p>
          Información práctica para entender qué puede decirte una placa, qué
          responde cada consulta y qué límites debes tener presentes antes de
          pagar.
        </p>
      </div>

      <div className={styles.grid}>
        {order.map((slug) => {
          const page = acquisitionPages[slug];
          return (
            <Link className={styles.card} href={`/${page.slug}`} key={slug}>
              <h2>{page.shortTitle}</h2>
              <p>{page.metaDescription}</p>
              <span>
                Leer guía <ArrowRight size={15} aria-hidden="true" />
              </span>
            </Link>
          );
        })}
      </div>

      <div className={styles.cta}>
        <h2>¿Ya tienes una placa?</h2>
        <p>
          Revisa primero la cobertura disponible para esa placa y decide si
          quieres generar el reporte.
        </p>
        <Button asChild>
          <Link href="/consulta">
            Consultar placa <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </main>
  );
}
