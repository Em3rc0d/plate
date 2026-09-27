import type { Metadata } from "next";
import "./globals.css";
import { productName } from "@/src/config/product";
export const metadata: Metadata = {
  title: { default: productName, template: `%s | ${productName}` },
  description:
    "Consulta una placa y revisa información registral, SOAT, revisión técnica y papeletas según cobertura disponible.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE">
      <body>
        <a className="skip" href="#main">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
