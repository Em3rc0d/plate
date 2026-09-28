import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CarFront,
  FileText,
  History,
  LockKeyhole,
  SearchCheck,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { CoverageList, capabilityDescriptions } from "@/components/marketing/coverage-list";
import { ReportPreview } from "@/components/marketing/report-preview";
import { PageEvent } from "@/components/marketing/page-event";
import { PlateForm } from "@/components/marketing/plate-form";
import { Button } from "@/components/ui/button";
import { env, mercadoPagoConfigured } from "@/src/config/env";
import { productName, publicSiteUrl } from "@/src/config/product";
import { offeringName } from "@/src/config/commercial";
import {
  capabilityLabels,
  enabledCapabilities,
  type Capability,
} from "@/src/config/providers";

export const metadata: Metadata = {
  title: "Reporte vehicular por placa en Perú",
  description:
    "Revisa información vehicular por placa antes de comprar un usado: identidad, registro, SOAT, CITV y papeletas según la cobertura habilitada, con fuente y fecha.",
  alternates: { canonical: publicSiteUrl },
  openGraph: {
    url: publicSiteUrl,
    title: "Reporte vehicular por placa en Perú | PlacaClara",
    description:
      "Revisa información vehicular con fuente, fecha y cobertura clara antes de comprar un usado.",
    images: [
      {
        url: "/placaclara-hero-master.webp",
        alt: "PlacaClara, reporte vehicular para compra de autos usados en Perú",
      },
    ],
  },
};

const states = [
  ["VERIFIED", "Información disponible", "La fuente devolvió datos para esta sección."],
  [
    "NOT_FOUND",
    "Sin registros devueltos",
    "La fuente consultada no devolvió registros. No demuestra que nunca hayan existido antecedentes.",
  ],
  ["UNAVAILABLE", "No disponible", "La información no pudo obtenerse."],
  [
    "CONFLICT",
    "Datos que no coinciden",
    "Encontramos información incompatible que requiere revisión.",
  ],
  [
    "NOT_CONFIGURED",
    "Fuente no habilitada",
    "Esta consulta no está incluida en la cobertura habilitada.",
  ],
  [
    "STALE",
    "Información desactualizada",
    "El dato superó su periodo de vigencia para consulta y necesita actualizarse.",
  ],
];

function FeatureIcon({ cap }: { cap: Capability }) {
  if (cap === "IDENTITY") return <CarFront size={26} aria-hidden="true" />;
  if (cap === "REGISTRY_CURRENT_OWNER")
    return <UserRound size={26} aria-hidden="true" />;
  if (cap === "REGISTRY_HISTORY") return <History size={26} aria-hidden="true" />;
  if (cap === "RESTRICTIONS")
    return <ShieldCheck size={26} aria-hidden="true" />;
  return <FileText size={26} aria-hidden="true" />;
}

export default function Home() {
  const capabilities = enabledCapabilities();
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: productName,
      url: publicSiteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${publicSiteUrl}/placaclara-mark.svg`,
        width: 512,
        height: 512,
      },
      legalName: env.BUSINESS_LEGAL_NAME || undefined,
      taxID: env.BUSINESS_RUC || undefined,
      areaServed: { "@type": "Country", name: "Perú" },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: productName,
      url: publicSiteUrl,
      inLanguage: "es-PE",
    },
  ];

  return (
    <main id="main" className="visual-master-page">
      <PageEvent event="landing_view" properties={{ path: "/" }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <section className="master-hero">
        <div className="wrap master-hero-grid">
          <div className="master-hero-copy">
            <p className="master-kicker">INFORMACIÓN VEHICULAR EN PERÚ</p>
            <h1>
              Antes de comprar un usado, revisa sus registros.
            </h1>
            <p className="master-lead">
              Consulta la información vehicular disponible, con fuente, fecha
              y límites claros antes de tomar una decisión.
            </p>

            <PlateForm />

            <div className="master-price-line">
              <strong>S/ {env.REPORT_PRICE_PEN.toFixed(2)}</strong>
              <span>· Pago único</span>
              <span>· Cobertura visible antes de pagar</span>
            </div>

            <div className="master-trust-row" aria-label="Señales de confianza">
              <span>
                <SearchCheck size={18} aria-hidden="true" />
                Consulta antes de pagar
              </span>
              <span>
                <ShieldCheck size={18} aria-hidden="true" />
                {mercadoPagoConfigured
                  ? "Pago seguro con Mercado Pago"
                  : "Pago según disponibilidad"}
              </span>
              <span>
                <LockKeyhole size={18} aria-hidden="true" />
                Datos sensibles enmascarados
              </span>
            </div>
          </div>

          <div className="master-hero-art" aria-label="Vista ilustrativa de PlacaClara">
            <Image
              src="/placaclara-hero-master.webp"
              alt=""
              fill
              priority
              sizes="(max-width: 900px) 100vw, 49vw"
              aria-hidden="true"
            />
            <div className="master-demo-badge">
              DEMO VISUAL · DATOS FICTICIOS
            </div>
            <p className="master-art-note">
              Imagen ilustrativa. XYZ-753 y los datos visibles son ficticios y no representan una consulta real.
            </p>
          </div>
        </div>
      </section>

      <section className="master-source-strip" id="fuentes">
        <div className="wrap master-source-inner">
          <p>COBERTURA HABILITADA:</p>
          <div className="master-source-items">
            {capabilities.length ? (
              capabilities.slice(0, 5).map((cap) => (
                <span key={cap}>{capabilityLabels[cap]}</span>
              ))
            ) : (
              <span>Fuentes pendientes de configuración comercial</span>
            )}
          </div>
        </div>
      </section>

      <section className="master-includes" id="cobertura">
        <div className="wrap">
          <div className="master-section-heading">
            <div>
              <h2>Qué incluye tu reporte</h2>
              <p>
                Información clara y organizada para revisar mejor un vehículo
                antes de comprar.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="#reporte-ejemplo">Ver ejemplo de reporte</Link>
            </Button>
          </div>

          {capabilities.length ? (
            <div className="master-feature-grid">
              {capabilities.slice(0, 6).map((cap) => (
                <article className="master-feature-card" key={cap}>
                  <FeatureIcon cap={cap} />
                  <div>
                    <h3>{capabilityLabels[cap]}</h3>
                    <p>{capabilityDescriptions[cap].detail}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="master-feature-grid">
              {[
                ["Identidad del vehículo", "Marca, modelo, años y características cuando exista cobertura."],
                ["Titularidad", "Información registral disponible, con datos personales enmascarados."],
                ["Restricciones", "Datos registrales devueltos por la fuente habilitada."],
              ].map(([title, detail], index) => (
                <article className="master-feature-card master-feature-card-muted" key={title}>
                  {[CarFront, UserRound, ShieldCheck].map((Icon, i) =>
                    i === index ? <Icon key={title} size={26} aria-hidden="true" /> : null,
                  )}
                  <div>
                    <h3>{title}</h3>
                    <p>{detail}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="content report-preview-section" id="reporte-ejemplo">
        <div className="wrap master-two-column">
          <div className="preview-intro">
            <p className="eyebrow">UN DOCUMENTO PARA REVISAR</p>
            <h2>Así se ve el reporte.</h2>
            <p className="muted">
              Cada sección muestra qué se obtuvo, de dónde viene, cuándo se
              consultó y qué limitaciones tiene.
            </p>
            <p className="micro">
              La muestra usa datos ficticios. Tu reporte real refleja únicamente
              la respuesta de las fuentes habilitadas para tu placa.
            </p>
            <Button asChild>
              <Link href="/consulta">
                Consultar mi placa <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <ReportPreview />
        </div>
      </section>

      <section className="content" id="como-funciona">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">CÓMO FUNCIONA</p>
              <h2>De la placa al reporte, en tres pasos.</h2>
            </div>
          </div>
          <ol className="steps">
            {[
              [
                "Ingresa la placa",
                "Consulta la disponibilidad para el vehículo que estás revisando.",
              ],
              [
                "Revisa cobertura y paga",
                mercadoPagoConfigured
                  ? "Confirma precio y cobertura y paga de forma segura con Mercado Pago."
                  : "Confirma precio y cobertura antes de continuar con el pago.",
              ],
              [
                "Recibe tu reporte",
                "Tras confirmar el pago, generamos el reporte con las fuentes habilitadas.",
              ],
            ].map(([title, text], i) => (
              <li key={title}>
                <span className="step" aria-hidden="true">
                  0{i + 1}
                </span>
                <h3>{title}</h3>
                <p className="muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="content" id="transparencia">
        <div className="wrap">
          <div className="transparency">
            <p className="eyebrow">CLARIDAD EN CADA CONSULTA</p>
            <h2>Te mostramos también lo que no pudimos comprobar.</h2>
            <div className="state-guide">
              {states.map(([state, title, text]) => (
                <article key={state}>
                  <span className={`status ${state}`}>{title}</span>
                  <p>{text}</p>
                </article>
              ))}
            </div>
            <p className="limitation">
              PlacaClara consolida información documental disponible. No
              inspecciona el vehículo físicamente y no sustituye una
              certificación registral.
            </p>
          </div>
        </div>
      </section>

      <section className="content" id="precio">
        <div className="wrap">
          <div className="purchase-sheet">
            <div>
              <p className="eyebrow">UN REPORTE PARA UNA PLACA</p>
              <h2>{offeringName()}</h2>
              <p className="muted">
                Información documental para hacer mejores preguntas antes de
                comprar.
              </p>
              <CoverageList />
            </div>
            <div className="purchase-total">
              <p className="document-label">PRECIO POR REPORTE</p>
              <div className="price">
                <small>S/</small> {env.REPORT_PRICE_PEN.toFixed(2)}
              </div>
              <p>
                {mercadoPagoConfigured
                  ? "Pago único · Procesado por Mercado Pago"
                  : "Pago único"}
              </p>
              <Button asChild>
                <Link href="/consulta">
                  Consultar placa <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="content" aria-labelledby="guias-title">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">ANTES DE COMPRAR</p>
              <h2 id="guias-title">Explora las guías de PlacaClara</h2>
            </div>
            <p>
              Entiende qué responde cada consulta y qué conviene revisar antes
              de pagar por un vehículo usado.
            </p>
          </div>
          <div className="grid3">
            {[
              ["Consulta vehicular por placa", "/consulta-vehicular-por-placa"],
              ["Qué revisar antes de comprar", "/comprar-auto-usado"],
              ["Historial vehicular", "/historial-vehicular"],
              ["SOAT por placa", "/soat-por-placa"],
              ["Revisión técnica por placa", "/revision-tecnica-por-placa"],
              ["Papeletas por placa", "/papeletas-por-placa"],
            ].map(([title, href]) => (
              <Link className="card" href={href} key={href}>
                <h3>{title}</h3>
                <p>
                  Guía práctica con alcance, límites y fuentes de referencia.
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="content faq" id="preguntas">
        <div className="wrap">
          <p className="eyebrow">PREGUNTAS FRECUENTES</p>
          <h2>Antes de consultar</h2>
          {[
            [
              "¿Confirma que el auto está en buen estado?",
              "No. El reporte reúne información documental disponible. La condición mecánica requiere una inspección independiente.",
            ],
            [
              "¿Cuándo recibiré el reporte?",
              "Después de confirmar el pago y consultar las fuentes habilitadas. El estado del pedido se actualiza automáticamente.",
            ],
            [
              "¿Qué ocurre si una fuente falla?",
              "La disponibilidad se refleja en el reporte. Una ausencia de respuesta no demuestra ausencia de antecedentes.",
            ],
            [
              "¿PlacaClara es una entidad oficial?",
              "No. Es un servicio independiente de información documental.",
            ],
          ].map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
