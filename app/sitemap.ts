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
