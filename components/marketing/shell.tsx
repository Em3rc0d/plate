import { env } from "@/src/config/env";
import Link from "next/link";
import { CarFront } from "lucide-react";
import { productName, legalNotice } from "@/src/config/product";
import { Button } from "@/components/ui/button";
export function Header() {
  return (
    <header className="wrap nav">
      <Link className="brand" href="/">
        <span className="brand-icon">
          <CarFront size={24} aria-hidden="true" />
        </span>
        {productName}
      </Link>
      <nav className="nav-links" aria-label="Principal">
        <Link href="/#cobertura">Qué incluye</Link>
        <Link href="/#como-funciona">Cómo funciona</Link>
        <Link className="mobile-price" href="/#precio">
          Precio
        </Link>
        <Button asChild variant="outline">
          <Link href="/consulta">Consultar placa</Link>
        </Button>
      </nav>
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
          <Link href="/legal/privacidad">Privacidad</Link>
          <Link href="/legal/terminos">Términos</Link>
          <Link href="/legal/reembolsos">Reembolsos</Link>
          {env.BOOK_OF_CLAIMS_URL && (
            <a href={env.BOOK_OF_CLAIMS_URL} rel="noreferrer">
              Libro de Reclamaciones
            </a>
          )}
          <Link href="/admin">Administración</Link>
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
          Soporte:{" "}
          <a href={`mailto:${env.SUPPORT_EMAIL}`}>{env.SUPPORT_EMAIL}</a>
        </p>
      )}
      <p>{legalNotice}</p>
      <p>No estamos afiliados a SUNARP, MTC, SBS, SAT ni SUTRAN.</p>
    </footer>
  );
}
