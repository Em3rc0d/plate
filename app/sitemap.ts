import type { MetadataRoute } from "next";
import { publicSiteUrl } from "@/src/config/product";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: publicSiteUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${publicSiteUrl}/guias`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${publicSiteUrl}/consulta-vehicular-por-placa`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${publicSiteUrl}/historial-vehicular`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${publicSiteUrl}/soat-por-placa`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${publicSiteUrl}/revision-tecnica-por-placa`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${publicSiteUrl}/papeletas-por-placa`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${publicSiteUrl}/comprar-auto-usado`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${publicSiteUrl}/legal/privacidad`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${publicSiteUrl}/legal/terminos`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${publicSiteUrl}/legal/reembolsos`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${publicSiteUrl}/libro-de-reclamaciones`,
      changeFrequency: "monthly",
      priority: 0.2,
    },
  ];
}
