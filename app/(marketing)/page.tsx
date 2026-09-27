import { CoverageList } from "@/components/marketing/coverage-list";
import {
  supports,
  coverageLabels,
  type Capability,
} from "@/src/config/providers";
import { PageEvent } from "@/components/marketing/page-event";
import Link from "next/link";
import {
  Fingerprint,
  FileCheck2,
  ShieldCheck,
  History,
  ReceiptText,
  BookOpen,
  Check,
  ArrowUpRight,
  ScanLine,
  LockKeyhole,
  Download,
} from "lucide-react";
import { PlateForm } from "@/components/marketing/plate-form";
import { Button } from "@/components/ui/button";
import { env } from "@/src/config/env";
import { offeringName, offeringScopeNote } from "@/src/config/commercial";
const checks = [
  {
    cap: "IDENTITY" as Capability,
    icon: Fingerprint,
    title: "Identidad del vehículo",
    text: "Marca, modelo, años de fabricación y modelo, VIN y características devueltas.",
  },
  {
    cap: "REGISTRY_CURRENT_OWNER" as Capability,
    icon: History,
    title: "Situación registral",
    text: "Datos del titular registrado según la fuente habilitada.",
  },
  {
    cap: "SOAT" as Capability,
    icon: ShieldCheck,
    title: "SOAT",
    text: "Aseguradora, vigencia y certificados devueltos por la fuente consultada.",
  },
  {
    cap: "CITV" as Capability,
    icon: FileCheck2,
    title: "Revisión técnica",
    text: "Vigencia, resultado y certificados de inspección disponibles.",
  },
  {
    cap: "FINES_NATIONAL" as Capability,
    icon: ReceiptText,
    title: "Papeletas pendientes",
    text: "Registros de SUTRAN, Lima y Callao. Cobertura detallada por jurisdicción.",
  },
  {
    cap: "RESTRICTIONS" as Capability,
    icon: BookOpen,
    title: "Fuentes y hallazgos",
    text: "Restricciones devueltas, discrepancias y fecha de consulta. Cada dato con su contexto.",
  },
];
export default function Home() {
  return (
    <main id="main">
      <PageEvent event="landing_view" />
      <div className="wrap">
        <section className="hero">
          <div>
            <p className="eyebrow">Antes de comprar · Información vehicular</p>
            <h1>
              Revisa el historial documental{" "}
              <span>antes de comprar el auto.</span>
            </h1>
            <p className="lead">
              Consulta las fuentes documentales habilitadas desde una sola
              placa. Revisa la cobertura disponible antes de pagar.
            </p>
            <PlateForm />
            <p className="micro">
              La disponibilidad depende de cada fuente consultada. No reemplaza
              una revisión mecánica ni asesoría legal.
            </p>
          </div>
          <div
            className="specimen"
            aria-label="Vista ilustrativa de la estructura del reporte, sin datos reales"
          >
            <div className="spec-top">
              <ScanLine size={20} />
              <span>ASÍ SE ORGANIZA TU REPORTE</span>
            </div>
            <div className="plate">TU PLACA</div>
            <h3>La información, con contexto.</h3>
            {(coverageLabels().length
              ? coverageLabels().slice(0, 4)
              : ["Fuentes pendientes de habilitación"]
            ).map((x, i) => (
              <div className="spec-row" key={x}>
                <span>
                  <span className="micro">0{i + 1} / </span>
                  {x}
                </span>
                <span className="status">Con trazabilidad</span>
              </div>
            ))}
            <div className="spec-note">
              Vista ilustrativa · No corresponde a un vehículo consultado.
              <br />
              Cada sección indica fuente, fecha y disponibilidad.
            </div>
          </div>
        </section>
        <div className="strip">
          <span>
            <ScanLine size={18} /> Una placa, varias fuentes
          </span>
          <span>
            <LockKeyhole size={18} /> Documentos enmascarados
          </span>
          <span>
            <Download size={18} /> Reporte web + PDF
          </span>
        </div>
        <section className="content" id="cobertura">
          <div className="section-head">
            <div>
              <p className="eyebrow">Qué puedes revisar</p>
              <h2>
                Más contexto.
                <br />
                Menos puntos ciegos.
              </h2>
            </div>
            <p>
              Consolidamos los datos disponibles. Si una fuente no responde, lo
              verás claramente en el reporte.
            </p>
          </div>
          <CoverageList />
          <div className="grid3">
            {checks
              .filter((x) => supports(x.cap))
              .map(({ icon: Icon, title, text }) => (
                <article className="card" key={title}>
                  <Icon size={25} />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
          </div>
        </section>
        <section className="content" id="como-funciona">
          <div className="section-head">
            <div>
              <p className="eyebrow">Sin trámites innecesarios</p>
              <h2>De la placa al reporte.</h2>
            </div>
          </div>
          <div className="grid3">
            {[
              [
                "01",
                "Ingresa la placa",
                "Revisa los datos básicos y la cobertura disponible.",
              ],
              [
                "02",
                "Paga con Yape o Plin",
                "Adjunta el comprobante. Validamos el pago manualmente.",
              ],
              [
                "03",
                "Recibe tu reporte",
                "Tu reporte y PDF estarán en la página del pedido. Correo adicional si está habilitado.",
              ],
            ].map(([n, title, text]) => (
              <article key={n}>
                <div className="step">{n}</div>
                <h3>{title}</h3>
                <p className="muted">{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="content" id="precio">
          <div className="price-panel">
            <div>
              <p className="eyebrow">Una consulta · Un pago</p>
              <h2>
                Información para hacer
                <br />
                mejores preguntas.
              </h2>
              <p className="lead">
                Lleva datos concretos a la conversación con el vendedor. Conoce
                también qué falta verificar.
              </p>
              <ul className="list">
                {[
                  "Fuentes y fechas visibles",
                  "Hallazgos para revisar, sin puntajes inventados",
                  "Enlace privado y vista compartible sin identidad",
                ].map((x) => (
                  <li key={x}>
                    <Check size={18} />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="price-box">
              <p className="eyebrow">{offeringName()}</p>
              <div className="price">
                <small>S/</small> {env.REPORT_PRICE_PEN.toFixed(2)}
              </div>
              <p className="muted">Por placa · Pago único con Yape o Plin</p>
              <p className="micro">{offeringScopeNote()}</p>
              <Button asChild>
                <Link href="/consulta">
                  Consultar mi placa <ArrowUpRight size={18} />
                </Link>
              </Button>
              <p className="micro">
                Las secciones dependen de la respuesta de cada fuente. La
                entrega se inicia después de validar el pago.
              </p>
            </div>
          </div>
        </section>
        <section className="content">
          <div className="section-head">
            <div>
              <p className="eyebrow">Transparencia primero</p>
              <h2>
                Un dato ausente
                <br />
                también necesita contexto.
              </h2>
            </div>
            <p>
              “Sin registros” significa que esa fuente no devolvió resultados.
              “No disponible” significa que no pudimos consultarla. Son
              situaciones distintas.
            </p>
          </div>
          <p className="muted">
            Papeletas: SUTRAN, Lima Metropolitana y Callao. No incluye
            automáticamente todas las municipalidades del Perú ni el historial
            de multas pagadas.
          </p>
        </section>
        <section className="content">
          <p className="eyebrow">Preguntas frecuentes</p>
          {[
            [
              "¿Confirma que el auto está en buen estado?",
              "No. El reporte reúne información documental disponible. La condición mecánica requiere una inspección independiente.",
            ],
            [
              "¿Cuándo recibiré el reporte?",
              "Después de la validación manual del pago y la consulta a las fuentes. No prometemos entrega inmediata ni un plazo que dependa de terceros.",
            ],
            [
              "¿Qué ocurre si una fuente falla?",
              "Si hay información útil, recibirás un reporte parcial claramente identificado. Si todas las fuentes fallan, el pedido pasa a resolución manual o devolución.",
            ],
            [
              "¿El enlace del reporte se puede compartir?",
              "Usa el botón de enlace compartible para enviar una vista sin identidad del propietario. El enlace privado completo debe permanecer reservado.",
            ],
            [
              "¿Son una entidad oficial?",
              "No. Somos una plataforma de consolidación de información, sin afiliación a las entidades mencionadas.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
        <section className="content">
          <div className="section-head">
            <h2>Empieza por la placa.</h2>
            <Button asChild>
              <Link href="/consulta">
                Consultar placa <ArrowUpRight size={18} />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
