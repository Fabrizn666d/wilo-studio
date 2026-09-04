import { revalidatePath } from "next/cache";

const publicPathsByResource: Record<string, readonly string[]> = {
  clients: ["/", "/clientes"],
  plans: ["/"],
  productCategories: ["/", "/tienda", "/sitemap.xml"],
  products: ["/", "/tienda", "/sitemap.xml"],
  projects: ["/", "/proyectos", "/sitemap.xml"],
  promotions: ["/", "/promos"],
  services: ["/", "/servicios", "/sitemap.xml"],
  settings: ["/"],
  testimonials: ["/", "/clientes"],
};

export function revalidatePublicContent(resource: string, slugs: Array<string | null | undefined> = []) {
  for (const path of publicPathsByResource[resource] ?? []) revalidatePath(path);

  const prefix = resource === "projects" ? "/proyectos/" : resource === "products" ? "/tienda/" : resource === "services" ? "/servicios/" : null;
  if (!prefix) return;
  for (const slug of new Set(slugs.filter((value): value is string => typeof value === "string" && value.length > 0))) {
    revalidatePath(`${prefix}${slug}`);
  }
}
