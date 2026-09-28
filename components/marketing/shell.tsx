import { env } from "@/src/config/env";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { productName, legalNotice } from "@/src/config/product";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="master-header">
      <div className="wrap nav">
        <div className="brand-cluster">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>{productName}</span>
          </Link>
          <span className="brand-country">
            <i aria-hidden="true" />
            PERÚ
          </span>
        </div>

        <nav className="nav-links" aria-label="Principal">
          <Link href="/#cobertura">Qué incluye</Link>
          <Link href="/#fuentes">Cobertura</Link>
          <Link href="/#precio">Precio</Link>
          <Link href="/#preguntas">Preguntas</Link>
        </nav>

        <div className="nav-actions">
          <Button asChild variant="outline">
            <Link href="/#reporte-ejemplo">Ver ejemplo</Link>
          </Button>
          <Button asChild>
            <Link href="/consulta">
              Consultar placa <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="wrap footer">
      <div className="footer-top">
        <div>
          <strong>{productName} · Perú</strong>
          <p className="footer-tagline">
            La información del auto, clara antes de comprar.
          </p>
        </div>
        <div className="flex">
          <Link href="/guias">Guías</Link>
          <Link href="/legal/privacidad">Privacidad</Link>
          <Link href="/legal/terminos">Términos</Link>
          <Link href="/legal/reembolsos">Reembolsos</Link>
          <Link href="/libro-de-reclamaciones">Libro de Reclamaciones</Link>
        </div>
      </div>
      {env.BUSINESS_LEGAL_NAME && (
        <p>
          {env.BUSINESS_LEGAL_NAME}
          {env.BUSINESS_RUC ? ` · RUC ${env.BUSINESS_RUC}` : ""}
        </p>
      )}
      {env.SUPPORT_EMAIL && (
        <p>
          Soporte: <a href={`mailto:${env.SUPPORT_EMAIL}`}>Contactar soporte</a>
        </p>
      )}
      <p>{legalNotice}</p>
      <p>No estamos afiliados a SUNARP, MTC, SBS, SAT ni SUTRAN.</p>
    </footer>
  );
}
