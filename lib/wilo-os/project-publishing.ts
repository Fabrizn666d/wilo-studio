import { HttpError } from "@/lib/api";

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasList(value: unknown) {
  if (Array.isArray(value)) return value.some(hasText);
  if (typeof value !== "string") return false;
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) && parsed.some(hasText);
  } catch {
    return false;
  }
}

export function isPublicProjectState(project: Record<string, unknown>) {
  return project.published === true
    && project.publicCaseStudy === true
    && project.contentStatus === "PUBLISHED"
    && !project.archivedAt;
}

export function assertProjectPublishable(project: Record<string, unknown>) {
  if (!isPublicProjectState(project)) return;

  const missing = [
    ["slug", "slug"],
    ["title", "nombre"],
    ["summary", "resumen"],
    ["challenge", "reto"],
    ["solution", "solución"],
    ["coverImage", "portada"],
    ["seoTitle", "título SEO"],
    ["seoDescription", "descripción SEO"],
  ].filter(([field]) => !hasText(project[field])).map(([, label]) => label);

  if (!hasList(project.services)) missing.push("servicios");
  if (!hasList(project.deliverables)) missing.push("entregables");

  if (missing.length) {
    throw new HttpError(
      422,
      `Completa antes de publicar: ${missing.join(", ")}.`,
      "PROJECT_PUBLISHING_CHECKLIST",
    );
  }
}
