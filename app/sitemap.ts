import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/content";
import { getPublicProducts } from "@/lib/public-data";
import { getStudioProjects } from "@/lib/studio-projects";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/proyectos", "/servicios", "/servicios/tecnologia", "/servicios/produccion-audiovisual", "/servicios/infraestructura-eventos", "/education", "/express", "/events", "/tienda", "/nosotros", "/clientes", "/referidos", "/promos", "/contacto", "/medios-de-pago", "/terminos", "/privacidad", "/libro-de-reclamaciones"];
  const now = new Date();
  const [products, studioProjects] = await Promise.all([getPublicProducts(), getStudioProjects()]);
  return [
    ...staticRoutes.map((route) => ({ url: `${siteConfig.url}${route}`, lastModified: now, changeFrequency: route === "" ? "weekly" as const : "monthly" as const, priority: route === "" ? 1 : .7 })),
    ...studioProjects.map((project) => ({ url: `${siteConfig.url}/proyectos/${project.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: "featured" in project && project.featured ? .8 : .65 })),
    ...products.map((product) => ({ url: `${siteConfig.url}/tienda/${product.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: .6 })),
  ];
}
