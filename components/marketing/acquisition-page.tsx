import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PlateForm } from "@/components/marketing/plate-form";
import { PageEvent } from "@/components/marketing/page-event";
import { CoverageList } from "@/components/marketing/coverage-list";
import { Button } from "@/components/ui/button";
import { publicSiteUrl } from "@/src/config/product";
import {
  acquisitionPages,
  type AcquisitionPage as AcquisitionPageData,
} from "@/src/seo/acquisition-pages";
import styles from "./acquisition-page.module.css";

export function metadataForAcquisitionPage(page: AcquisitionPageData): Metadata {
  const url = `${publicSiteUrl}/${page.slug}`;
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "es_PE",
      url,
      title: `${page.metaTitle} | PlacaClara`,
      description: page.metaDescription,
      images: [
        {
          url: "/placaclara-hero-master.webp",
          alt: "PlacaClara, consulta vehicular por placa en Perú",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.metaTitle} | PlacaClara`,
      description: page.metaDescription,
      images: ["/placaclara-hero-master.webp"],
    },
    robots: { index: true, follow: true },
  };
}

export function AcquisitionPage({ page }: { page: AcquisitionPageData }) {
  const url = `${publicSiteUrl}/${page.slug}`;
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.metaTitle,
      description: page.metaDescription,
      url,
      inLanguage: "es-PE",
      isPartOf: {
        "@type": "WebSite",
        name: "PlacaClara",
        url: publicSiteUrl,
      },
      dateModified: "2026-09-28",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "PlacaClara",
          item: publicSiteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Guías",
          item: `${publicSiteUrl}/guias`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: page.shortTitle,
          item: url,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];

  return (
    <main id="main" className={styles.page}>
      <PageEvent
        event="landing_view"
        scope={page.slug}
        properties={{ path: `/${page.slug}` }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemas).replace(/</g, "\\u003c"),
        }}
      />

      <section className={styles.hero}>
        <div className="wrap">
          <nav className={styles.breadcrumbs} aria-label="Migas de pan">
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">/</span>
            <Link href="/guias">Guías</Link>
            <span aria-hidden="true">/</span>
            <span>{page.shortTitle}</span>
          </nav>

          <div className={styles.heroGrid}>
            <div>
              <p className="eyebrow">{page.eyebrow}</p>
              <h1>{page.title}</h1>
              <p className={styles.lead}>{page.lead}</p>
            </div>

            <aside className={styles.summaryCard}>
              <h2>La idea clave</h2>
              <p>{page.summary}</p>
            </aside>
          </div>
        </div>
      </section>

      <div className={`wrap ${styles.main}`}>
        <div className={styles.contentGrid}>
          <article className={styles.article}>
            <h2>Qué conviene comprobar</h2>
            <ul className={styles.checklist}>
              {page.checks.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>

            {page.sections.map((section) => (
              <section key={section.title}>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}

            <p className={styles.caveat}>
              <strong>Límite importante:</strong> {page.limitation}
            </p>

            <section>
              <h2>Fuentes de referencia</h2>
              <p>
                Estos enlaces oficiales sirven para contrastar información y
                entender el alcance de cada consulta. PlacaClara es un servicio
                independiente y no está afiliado a estas entidades.
              </p>
              <div className={styles.sources}>
                {page.sources.map((source) => (
                  <a
                    className={styles.source}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    key={source.url}
                  >
                    <strong>{source.label}</strong>
                    <span>{source.note}</span>
                  </a>
                ))}
              </div>
            </section>

            <section className={styles.faq}>
              <p className="eyebrow">PREGUNTAS FRECUENTES</p>
              <h2>Preguntas sobre esta consulta</h2>
              {page.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </section>

            <section>
              <h2>Continúa revisando</h2>
              <div className={styles.relatedGrid}>
                {page.related.map((slug) => {
                  const related = acquisitionPages[slug];
                  return (
                    <Link
                      className={styles.related}
                      href={`/${related.slug}`}
                      key={slug}
                    >
                      {related.shortTitle}
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className={styles.cta}>
              <h2>Consulta la cobertura de una placa antes de pagar</h2>
              <p>
                Ingresa una placa real. PlacaClara muestra la cobertura
                habilitada antes de que continúes al pago.
              </p>
              <PlateForm />
            </section>
          </article>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <h2>Cobertura habilitada hoy</h2>
              <CoverageList />
            </div>
            <div className={styles.sidebarCard}>
              <h3>¿Listo para revisar una placa?</h3>
              <p>
                Primero comprueba la cobertura. El reporte real depende de la
                respuesta de cada fuente para esa placa.
              </p>
              <Button asChild>
                <Link href="/consulta">
                  Consultar placa <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
