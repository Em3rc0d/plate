import type { MetadataRoute } from "next";
import { publicSiteUrl } from "@/src/config/product";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: publicSiteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${publicSiteUrl}/legal/privacidad`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${publicSiteUrl}/legal/terminos`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${publicSiteUrl}/legal/reembolsos`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${publicSiteUrl}/libro-de-reclamaciones`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.2,
    },
  ];
}
