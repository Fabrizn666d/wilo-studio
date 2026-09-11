import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/medios-de-pago", "/terminos", "/privacidad", "/libro-de-reclamaciones"];
  const now = new Date();
  return [
    ...staticRoutes.map((route) => ({ url: `${siteConfig.url}${route}`, lastModified: now, changeFrequency: route === "" ? "weekly" as const : "monthly" as const, priority: route === "" ? 1 : .7 })),
  ];
}
