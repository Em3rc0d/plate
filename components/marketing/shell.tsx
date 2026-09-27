import { env } from "@/src/config/env";
import Link from "next/link";
import { ScanLine } from "lucide-react";
import { productName, legalNotice } from "@/src/config/product";
import { Button } from "@/components/ui/button";
export function Header() {
  return (
    <header className="wrap nav">
      <Link className="brand" href="/">
        <span className="brand-icon">
          <ScanLine size={22} />
        </span>
        {productName}
      </Link>
      <nav className="nav-links" aria-label="Principal">
        <Link href="/#cobertura">Qué incluye</Link>
        <Link href="/#como-funciona">Cómo funciona</Link>
        <Link href="/#precio">Precio</Link>
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
        <span>{productName} · Perú</span>
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
      <p>{legalNotice}</p>
      <p>No estamos afiliados a SUNARP, MTC, SBS, SAT ni SUTRAN.</p>
    </footer>
  );
}
