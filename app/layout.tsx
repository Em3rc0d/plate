import type { Metadata } from "next";
import "./globals.css";
import { productName } from "@/src/config/product";
export const metadata: Metadata = {
  title: { default: productName, template: `%s | ${productName}` },
  description:
    "La información del auto, clara antes de comprar. Consulta por placa los registros disponibles, con fuente, fecha y limitaciones.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" data-scroll-behavior="smooth">
      <body>
        <a className="skip" href="#main">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
