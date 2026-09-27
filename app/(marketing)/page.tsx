import Link from "next/link";
import {
  CarFront,
  FileText,
  LockKeyhole,
  Download,
  ArrowRight,
} from "lucide-react";
import { CoverageList } from "@/components/marketing/coverage-list";
import { ReportPreview } from "@/components/marketing/report-preview";
import { PageEvent } from "@/components/marketing/page-event";
import { PlateForm } from "@/components/marketing/plate-form";
import { Button } from "@/components/ui/button";
import { env } from "@/src/config/env";
import { offeringName } from "@/src/config/commercial";

const states = [
  ["VERIFIED", "Información verificada", "La fuente devolvió información."],
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
export default function Home() {
  return (
    <main id="main">
      <PageEvent event="landing_view" />
      <div className="wrap">
        <section className="hero">
          <div>
            <p className="eyebrow">Antes de comprar un auto usado</p>
            <h1>
              Revisa lo que dicen sus registros <span>antes de comprar.</span>
            </h1>
            <p className="lead">
              Ingresa la placa y recibe un reporte de la información disponible
              en las fuentes habilitadas, con su origen, fecha y límites.
            </p>
            <PlateForm />
            <div className="hero-details">
              <span>
                <strong>S/ {env.REPORT_PRICE_PEN.toFixed(2)}</strong> · Pago
                único
              </span>
              <Link href="#cobertura">Ver qué incluye</Link>
            </div>
            <p className="micro">No reemplaza una revisión mecánica.</p>
          </div>
          <ReportPreview compact />
        </section>
        <div className="strip">
          <span>
            <CarFront size={19} aria-hidden="true" />
            Consulta por placa
          </span>
          <span>
            <FileText size={19} aria-hidden="true" />
            Información con fuente y fecha
          </span>
          <span>
            <LockKeyhole size={19} aria-hidden="true" />
            Documentos personales enmascarados
          </span>
          <span>
            <Download size={19} aria-hidden="true" />
            Reporte web y PDF
          </span>
        </div>
        <section className="content" id="cobertura">
          <div className="section-head">
            <div>
              <p className="eyebrow">Qué incluye</p>
              <h2>
                Los registros disponibles.
                <br />
                Sus límites, también.
              </h2>
            </div>
            <p>
              Estas son las consultas habilitadas. El reporte distingue la
              información recibida de lo que no pudo comprobarse.
            </p>
          </div>
          <CoverageList detailed />
        </section>
        <section
          className="content report-preview-section"
          id="reporte-ejemplo"
        >
          <div className="preview-intro">
            <p className="eyebrow">Un documento para revisar</p>
            <h2>Así se ve el reporte.</h2>
            <p className="muted">
              Cada sección muestra qué se obtuvo, de dónde viene y cuándo se
              consultó. Puedes guardarlo en PDF y revisarlo al conversar con el
              vendedor.
            </p>
            <p className="micro">
              La muestra usa datos ficticios. Tu reporte reflejará la respuesta
              de las fuentes para tu placa.
            </p>
            <Button asChild variant="outline">
              <Link href="/consulta">
                Consultar mi placa <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <ReportPreview />
        </section>
        <section className="content" id="como-funciona">
          <div className="section-head">
            <div>
              <p className="eyebrow">Cómo funciona</p>
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
                "Revisa la cobertura y realiza el pago",
                "Confirma el precio, paga con el medio habilitado y adjunta el comprobante. La validación es manual.",
              ],
              [
                "Recibe tu reporte",
                "Después de validar el pago y consultar las fuentes, encontrarás el reporte y el PDF en la página de tu pedido.",
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
        </section>
        <section className="content" id="transparencia">
          <div className="transparency">
            <p className="eyebrow">Claridad en cada consulta</p>
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
              inspecciona el vehículo físicamente. Algunas fuentes tienen
              cobertura geográfica o histórica limitada.
            </p>
          </div>
        </section>
        <section className="content" id="precio">
          <div className="purchase-sheet">
            <div>
              <p className="eyebrow">Un reporte para una placa</p>
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
              <p>Pago único · Yape / Plin según disponibilidad</p>
              <Button asChild>
                <Link href="/consulta">
                  Consultar placa <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </Button>
              <p className="micro">
                Revisa disponibilidad antes de pagar. La entrega comienza
                después de la validación manual del pago.
              </p>
            </div>
          </div>
        </section>
        <section className="content faq">
          <p className="eyebrow">Preguntas frecuentes</p>
          <h2>Antes de consultar</h2>
          {[
            [
              "¿Confirma que el auto está en buen estado?",
              "No. El reporte reúne información documental disponible. La condición mecánica requiere una inspección independiente.",
            ],
            [
              "¿Cuándo recibiré el reporte?",
              "Después de la validación manual del pago y la consulta a las fuentes. La entrega depende de su disponibilidad; no es inmediata.",
            ],
            [
              "¿Qué ocurre si una fuente falla?",
              "Si hay información útil, recibirás un reporte parcial claramente identificado. Si todas las fuentes fallan, el pedido pasa a resolución manual o devolución.",
            ],
            [
              "¿Puedo compartir el reporte?",
              "Usa el botón de enlace compartible para enviar una vista sin identidad del propietario. Mantén reservado el enlace privado completo.",
            ],
            [
              "¿PlacaClara es una entidad oficial?",
              "No. Es un servicio independiente de información documental, sin afiliación a las entidades mencionadas.",
            ],
          ].map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </section>
      </div>
    </main>
  );
}
