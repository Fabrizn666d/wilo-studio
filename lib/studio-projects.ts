import "server-only";

import { studioProjects, type StudioProject } from "@/data/studio";
import { prisma } from "@/lib/prisma";

function parseStringList(value: string | null | undefined) {
  try {
    const parsed = JSON.parse(value || "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
  } catch {
    return [];
  }
}

function localAssets(value: string | null | undefined) {
  return parseStringList(value).filter((item) => item.startsWith("/") && !item.startsWith("//"));
}

function themeForCategory(category: string): StudioProject["theme"] {
  const key = category.toLowerCase();
  if (key.includes("audio")) return "amber";
  if (key.includes("infra")) return "green";
  if (key.includes("education")) return "lime";
  return "blue";
}

/**
 * Stable code projects remain the launch-safe fallback. A CMS record can
 * override them only after passing every public publishing gate. New CMS-only
 * records additionally need enough editorial material to render a real case.
 */
export async function getStudioProjects(): Promise<StudioProject[]> {
  const fallback = studioProjects.map((project) => ({ ...project })) as StudioProject[];

  try {
    const records = await prisma.project.findMany({
      include: { client: { select: { name: true, active: true } } },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    });

    const bySlug = new Map(fallback.map((project) => [project.slug, project]));
    const databaseOrder: string[] = [];
    const suppressedFallbackSlugs = new Set<string>();

    for (const record of records) {
      const isPublic = record.published
        && record.publicCaseStudy
        && record.contentStatus === "PUBLISHED"
        && !record.archivedAt;
      if (!isPublic) {
        // Internal/legacy projects may share a slug without taking ownership
        // of the editorial case. Only an explicit public-case draft, unpublish
        // or archive suppresses a launch-safe code-backed case study.
        const managesPublicCase = record.publicCaseStudy
          || !record.published
          || Boolean(record.archivedAt)
          || record.contentStatus === "ARCHIVED";
        if (managesPublicCase) suppressedFallbackSlugs.add(record.slug);
        continue;
      }
      const existing = bySlug.get(record.slug);
      const services = parseStringList(record.services);
      const deliverables = parseStringList(record.deliverables);
      const poster = record.coverImage?.startsWith("/") ? record.coverImage : existing?.poster;
      const hasMinimumCase = Boolean(
        record.title.trim()
        && record.summary?.trim()
        && record.challenge?.trim()
        && record.solution?.trim()
        && poster
        && (services.length || existing?.services.length)
        && (deliverables.length || existing?.deliverables.length),
      );
      if (!existing && !hasMinimumCase) continue;

      const clientName = record.client?.active ? record.client.name : null;
      const shortDescription = record.summary?.trim() || existing?.shortDescription || "Caso de estudio de Wilo Studio.";
      const mapped: StudioProject = {
        slug: record.slug,
        name: record.title.trim(),
        descriptor: [record.category, clientName].filter(Boolean).join(" · ") || existing?.descriptor || "Caso de estudio",
        shortDescription,
        summary: record.description?.trim() || existing?.summary || shortDescription,
        challenge: record.challenge?.trim() || existing?.challenge || "El proyecto partió de una necesidad concreta del negocio.",
        solution: record.solution?.trim() || existing?.solution || "Construimos una respuesta digital alineada con el contexto del proyecto.",
        services: services.length ? services : existing?.services || [],
        deliverables: deliverables.length ? deliverables : existing?.deliverables || [],
        poster: poster || "/brand/portfolio-showcase.webp",
        ...(record.videoUrl?.startsWith("/") ? { video: record.videoUrl } : existing?.video ? { video: existing.video } : {}),
        ...((localAssets(record.gallery).length ? localAssets(record.gallery) : existing?.gallery)?.length
          ? { gallery: localAssets(record.gallery).length ? localAssets(record.gallery) : existing?.gallery }
          : {}),
        ...(record.liveUrl ? { liveUrl: record.liveUrl } : existing?.liveUrl ? { liveUrl: existing.liveUrl } : {}),
        ...(record.seoTitle ? { seoTitle: record.seoTitle } : existing?.seoTitle ? { seoTitle: existing.seoTitle } : {}),
        ...(record.seoDescription ? { seoDescription: record.seoDescription } : existing?.seoDescription ? { seoDescription: existing.seoDescription } : {}),
        theme: existing?.theme || themeForCategory(record.category),
        featured: record.featured,
      };
      bySlug.set(record.slug, mapped);
      databaseOrder.push(record.slug);
    }

    const orderedDatabase = databaseOrder.map((slug) => bySlug.get(slug)).filter((project): project is StudioProject => Boolean(project));
    const untouchedFallback = fallback.filter((project) => !databaseOrder.includes(project.slug) && !suppressedFallbackSlugs.has(project.slug));
    return [...orderedDatabase, ...untouchedFallback];
  } catch {
    return fallback;
  }
}

export async function getStudioProject(slug: string) {
  return (await getStudioProjects()).find((project) => project.slug === slug);
}
