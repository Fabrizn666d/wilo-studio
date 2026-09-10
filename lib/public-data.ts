import type { Product, ProductCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  clients as fallbackClients,
  products as fallbackProducts,
  projects as fallbackProjects,
  type ProjectCategory,
  type StoreProduct,
} from "@/lib/content";

export type PublicProject = {
  slug: string;
  title: string;
  category: ProjectCategory;
  image: string;
  service: string;
  result: string;
  status: "Proyecto" | "Demo" | "Por confirmar";
  gallery?: string[];
  liveUrl?: string | null;
  description?: string | null;
  clientName?: string | null;
};

export type PublicClient = {
  id: string;
  name: string;
  logoUrl: string | null;
};

export type PublicTestimonial = {
  id: string;
  name: string;
  company: string;
  role: string | null;
  quote: string;
  avatarUrl: string | null;
};

function parseImages(value: string) {
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : []; } catch { return []; }
}

function mapProduct(item: Product & { category: ProductCategory }): StoreProduct {
  const images = parseImages(item.images);
  const totalPriceCents = item.includesTax ? item.priceCents : item.priceCents + Math.round(item.priceCents * 0.18);
  const delivery = item.stock === 0 ? "Sin stock" : item.digital ? "Entrega digital" : "Entrega coordinada";
  return {
    id: item.id,
    slug: item.slug,
    sku: item.sku,
    name: item.name,
    category: item.category.name,
    brand: item.licenseType || item.category.name,
    license: [item.licenseType, item.licenseDuration].filter(Boolean).join(" · ") || "Detalle en la ficha",
    price: totalPriceCents / 100,
    currency: item.currency,
    image: images[0] || "/images/icon-sistemas.png",
    images: images.length ? images : ["/images/icon-sistemas.png"],
    stock: item.stock,
    featured: item.featured,
    delivery,
    description: item.description || "Producto original con soporte de Wilo Studio.",
    specs: parseImages(item.specifications),
  };
}

export async function getPublicProjects(): Promise<PublicProject[]> {
  try {
    const records = await prisma.project.findMany({
      where: { published: true, publicCaseStudy: true, contentStatus: "PUBLISHED", archivedAt: null },
      include: { client: { select: { name: true, active: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return records.map((item) => {
      const isDemo = item.summary?.startsWith("DEMO:");
      const needsConfirmation = item.summary?.startsWith("POR CONFIRMAR:");
      const cleanSummary = item.summary?.replace(/^(DEMO:|POR CONFIRMAR:)\s*/, "");
      return ({
      slug: item.slug,
      title: item.title,
      category: (["Tecnología", "Audiovisual", "Infraestructura", "Education"].includes(item.category) ? item.category : "Tecnología") as ProjectCategory,
      image: item.coverImage || "/brand/portfolio-showcase.webp",
      service: parseImages(item.services).join(" · ") || cleanSummary || "Proyecto Wilo Studio",
      result: cleanSummary || item.description || "Solución creada alrededor de un objetivo comercial concreto.",
      status: isDemo ? "Demo" as const : needsConfirmation ? "Por confirmar" as const : "Proyecto" as const,
      gallery: parseImages(item.gallery),
      liveUrl: item.liveUrl,
      description: item.description,
      clientName: item.client?.active ? item.client.name : null,
      });
    });
  } catch {
    return [...fallbackProjects];
  }
}

export async function getPublicProject(slug: string) {
  return (await getPublicProjects()).find((item) => item.slug === slug);
}

export async function getPublicClients(): Promise<PublicClient[]> {
  try {
    const records = await prisma.client.findMany({
      where: { active: true, archivedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true, logoUrl: true },
    });
    return records;
  } catch {}
  return fallbackClients.map((name, index) => ({ id: `fallback-${index}`, name, logoUrl: null }));
}

export async function getPublicProducts(): Promise<StoreProduct[]> {
  try {
    const records = await prisma.product.findMany({
      where: { active: true, category: { active: true } },
      include: { category: true },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });
    return records.map(mapProduct);
  } catch {
    return fallbackProducts.map((item) => ({ ...item }));
  }
}

export async function getPublicProduct(slug: string): Promise<StoreProduct | undefined> {
  try {
    const record = await prisma.product.findFirst({
      where: { slug, active: true, category: { active: true } },
      include: { category: true },
    });
    return record ? mapProduct(record) : undefined;
  } catch {
    return fallbackProducts.find((item) => item.slug === slug);
  }
}

export async function getPublicTestimonials(): Promise<PublicTestimonial[]> {
  try {
    return await prisma.testimonial.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: { id: true, name: true, company: true, role: true, quote: true, avatarUrl: true },
    });
  } catch {
    return [];
  }
}

export async function getActivePromotion() {
  try {
    const now = new Date();
    const promo = await prisma.promotion.findFirst({
      where: {
        active: true,
        AND: [
          { OR: [{ startAt: null }, { startAt: { lte: now } }] },
          { OR: [{ endAt: null }, { endAt: { gte: now } }] },
        ],
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    if (!promo) return null;
    return { ...promo, detailsList: parseImages(promo.details) };
  } catch {
    return null;
  }
}
