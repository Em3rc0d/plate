import type { Metadata, Viewport } from "next";
import "./globals.css";
import { productName, publicSiteUrl } from "@/src/config/product";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title: {
    default: "PlacaClara | Consulta vehicular por placa en Perú",
    template: `%s | ${productName}`,
  },
  description:
    "Consulta información vehicular por placa en Perú con fuente, fecha y cobertura clara. Revisa identidad, registro, SOAT, CITV y papeletas según las fuentes habilitadas.",
  applicationName: productName,
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: productName,
    title: "PlacaClara | Consulta vehicular por placa en Perú",
    description:
      "Información vehicular con fuente, fecha y cobertura clara antes de comprar un usado.",
    images: [
      {
        url: "/placaclara-hero-master.webp",
        alt: "PlacaClara, reporte vehicular para compra de autos usados en Perú",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PlacaClara | Consulta vehicular por placa en Perú",
    description:
      "Información vehicular con fuente, fecha y cobertura clara antes de comprar un usado.",
    images: ["/placaclara-hero-master.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
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
