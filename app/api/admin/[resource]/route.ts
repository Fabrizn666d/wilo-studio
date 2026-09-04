import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { getAdminResource, getTransactionAdminDelegate, serializeAdminRecord } from "@/lib/admin-resources";
import { HttpError, handleRouteError, readJsonBody } from "@/lib/api";
import { requireAdminResource } from "@/lib/auth-guard";
import { adminResourceScope, type AdminResourceAction } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { activityEntityTypeForResource, recordActivity } from "@/lib/wilo-os/activity";
import { createQuote } from "@/lib/wilo-os/quotes";
import { assertProjectPublishable, isPublicProjectState } from "@/lib/wilo-os/project-publishing";
import { revalidatePublicContent } from "@/lib/revalidate-public-content";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ resource: string }> };

async function authorize(resourceName: string, action: AdminResourceAction) {
  const resource = getAdminResource(resourceName);
  const user = await requireAdminResource(resourceName, action, resource.roles);
  return { resource, user };
}

function parsePositiveInteger(value: string | null, fallback: number, max: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
}

function parseLimaDate(value: string | null, boundary: "start" | "end") {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, "El filtro de fecha es inválido.", "INVALID_DATE_FILTER");
  }
  const time = boundary === "start" ? "00:00:00.000" : "23:59:59.999";
  const date = new Date(`${value}T${time}-05:00`);
  if (!Number.isFinite(date.getTime())) {
    throw new HttpError(400, "El filtro de fecha es inválido.", "INVALID_DATE_FILTER");
  }
  return date;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { resource: resourceName } = await context.params;
    const { resource, user } = await authorize(resourceName, "read");
    const page = parsePositiveInteger(request.nextUrl.searchParams.get("page"), 1, 100_000);
    const limit = parsePositiveInteger(request.nextUrl.searchParams.get("limit"), 25, 100);
    const query = request.nextUrl.searchParams.get("q")?.trim().slice(0, 120);
    const filters: Record<string, unknown> = {};
    if (resource.archivable) {
      filters.archivedAt = request.nextUrl.searchParams.get("archived") === "true" ? { not: null } : null;
    }
    for (const [field, type] of Object.entries(resource.filterFields || {})) {
      const raw = request.nextUrl.searchParams.get(field);
      if (raw === null) continue;
      if (type === "boolean") {
        if (raw !== "true" && raw !== "false") throw new HttpError(400, `Filtro ${field} inválido.`, "INVALID_FILTER");
        filters[field] = raw === "true";
      } else {
        filters[field] = raw.slice(0, 160);
      }
    }
    if (resource.dateFilterField) {
      const from = parseLimaDate(request.nextUrl.searchParams.get("from"), "start");
      const to = parseLimaDate(request.nextUrl.searchParams.get("to"), "end");
      if (from && to && from > to) {
        throw new HttpError(400, "La fecha inicial no puede ser posterior a la final.", "INVALID_DATE_RANGE");
      }
      if (from || to) filters[resource.dateFilterField] = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) };
    }
    const searchConditions: Record<string, unknown>[] = query
      ? resource.searchFields.map((field) => ({ [field]: { contains: query } }))
      : [];
    if (query && resourceName === "quotes") searchConditions.push({ client: { name: { contains: query } } });

    const requestedSort = request.nextUrl.searchParams.get("sort") || "";
    const requestedDirection = request.nextUrl.searchParams.get("direction") || "desc";
    if (requestedDirection !== "asc" && requestedDirection !== "desc") {
      throw new HttpError(400, "Dirección de orden inválida.", "INVALID_SORT");
    }
    if (requestedSort && !resource.sortableFields?.includes(requestedSort)) {
      throw new HttpError(400, "Campo de orden inválido.", "INVALID_SORT");
    }
    const orderBy = requestedSort ? { [requestedSort]: requestedDirection } : resource.orderBy;
    const where: Record<string, unknown> = {
      ...adminResourceScope(user.role, resourceName, user.id),
      ...filters,
      ...(searchConditions.length ? { OR: searchConditions } : {}),
    };
    const args: Record<string, unknown> = {
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      ...(resource.include ? { include: resource.include } : {}),
    };
    const [records, total] = await Promise.all([resource.delegate.findMany(args), resource.delegate.count({ where })]);
    return NextResponse.json({
      ok: true,
      data: records.map((record) => serializeAdminRecord(record, resource)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { resource: resourceName } = await context.params;
    const { resource, user } = await authorize(resourceName, "create");
    if (!resource.createSchema) throw new HttpError(405, "Este módulo no admite creación manual.", "METHOD_NOT_ALLOWED");
    const input = resource.createSchema.parse(await readJsonBody(request, 500_000));
    if (resourceName === "quotes") {
      const record = await createQuote(input, { actorUserId: user.id });
      return NextResponse.json({ ok: true, data: serializeAdminRecord(record, resource) }, { status: 201 });
    }
    const data = { ...input };
    if (resourceName === "users") {
      const password = String(data.password);
      delete data.password;
      data.passwordHash = await bcrypt.hash(password, 12);
    }
    if (resourceName === "settings" && data.type === "secret") data.public = false;
    if (resourceName === "projects") assertProjectPublishable(data);
    const record = await prisma.$transaction(async (transaction) => {
      const delegate = getTransactionAdminDelegate(transaction, resourceName);
      const created = await delegate.create({
        data,
        ...(resource.include ? { include: resource.include } : {}),
      });
      if (typeof created.id === "string") {
        const entityType = activityEntityTypeForResource(resourceName);
        const published = resourceName === "projects"
          ? isPublicProjectState(created)
          : created.published === true;
        await recordActivity(transaction, {
          actorUserId: user.id,
          entityType,
          entityId: created.id,
          action: published ? "CONTENT_PUBLISHED" : `${entityType}_CREATED`,
          metadata: { origin: "WILO_OS", resource: resourceName },
        });
      }
      return created;
    });
    revalidatePublicContent(resourceName, [typeof record.slug === "string" ? record.slug : null]);
    return NextResponse.json({ ok: true, data: serializeAdminRecord(record, resource) }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
