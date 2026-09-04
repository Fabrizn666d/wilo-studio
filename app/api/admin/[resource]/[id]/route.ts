import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { getAdminResource, getTransactionAdminDelegate, serializeAdminRecord } from "@/lib/admin-resources";
import { HttpError, handleRouteError, readJsonBody } from "@/lib/api";
import { requireAdminResource } from "@/lib/auth-guard";
import { canReadAdminRecord, type AdminResourceAction } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { confirmOrderPayment, releaseOrderReservation } from "@/lib/order-payment";
import { activityEntityTypeForResource, recordActivity } from "@/lib/wilo-os/activity";
import { updateQuote } from "@/lib/wilo-os/quotes";
import { assertProjectPublishable, isPublicProjectState } from "@/lib/wilo-os/project-publishing";
import { assertLeadStatusTransition } from "@/lib/wilo-os/leads";
import { revalidatePublicContent } from "@/lib/revalidate-public-content";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ resource: string; id: string }> };

async function authorize(resourceName: string, action: AdminResourceAction) {
  const resource = getAdminResource(resourceName);
  const user = await requireAdminResource(resourceName, action, resource.roles);
  return { resource, user };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { resource: resourceName, id } = await context.params;
    const { resource, user } = await authorize(resourceName, "read");
    const record = await resource.delegate.findUnique({
      where: { id },
      ...(resource.detailInclude || resource.include ? { include: resource.detailInclude || resource.include } : {}),
    });
    if (!record) throw new HttpError(404, "Registro no encontrado.", "NOT_FOUND");
    if (!canReadAdminRecord(user.role, resourceName, user.id, record)) {
      throw new HttpError(404, "Registro no encontrado.", "NOT_FOUND");
    }
    return NextResponse.json({ ok: true, data: serializeAdminRecord(record, resource) });
  } catch (error) {
    return handleRouteError(error);
  }
}

async function update(request: NextRequest, context: RouteContext) {
  try {
    const { resource: resourceName, id } = await context.params;
    const { resource, user } = await authorize(resourceName, "update");
    const expectedUpdatedAt = request.headers.get("x-record-updated-at");
    let expectedVersion: Date | undefined;
    if (expectedUpdatedAt) {
      expectedVersion = new Date(expectedUpdatedAt);
      if (!Number.isFinite(expectedVersion.getTime())) {
        throw new HttpError(409, "Este registro cambió en otra sesión. Actualiza la vista antes de guardar.", "EDIT_CONFLICT");
      }
      if (resourceName !== "quotes") {
        const version = await resource.delegate.findUnique({ where: { id }, select: { updatedAt: true } });
        if (!version) throw new HttpError(404, "Registro no encontrado.", "NOT_FOUND");
        const currentTimestamp = version.updatedAt instanceof Date
          ? version.updatedAt.getTime()
          : new Date(String(version.updatedAt)).getTime();
        if (currentTimestamp !== expectedVersion.getTime()) {
          throw new HttpError(409, "Este registro cambió en otra sesión. Actualiza la vista antes de guardar.", "EDIT_CONFLICT");
        }
      }
    }
    const rawInput = await readJsonBody(request, 500_000);
    const input = resource.updateSchema.parse(rawInput);
    if (rawInput && typeof rawInput === "object" && !Array.isArray(rawInput)) {
      for (const key of Object.keys(input)) {
        if (!Object.prototype.hasOwnProperty.call(rawInput, key)) delete input[key];
      }
    }
    if (resourceName === "quotes") {
      if (!expectedVersion) {
        throw new HttpError(428, "Actualiza la cotización antes de guardar cambios.", "VERSION_REQUIRED");
      }
      const record = await updateQuote(id, input, { actorUserId: user.id, expectedUpdatedAt: expectedVersion });
      return NextResponse.json({ ok: true, data: serializeAdminRecord(record, resource) });
    }
    const data = { ...input };
    if (Object.keys(data).length === 0) throw new HttpError(422, "No hay cambios para guardar.", "EMPTY_UPDATE");

    if (resourceName === "users") {
      if (id === user.id && (data.active === false || (data.role !== undefined && data.role !== "SUPER_ADMIN"))) {
        throw new HttpError(409, "No puedes desactivar ni reducir el rol de tu propia sesión.", "SELF_LOCKOUT");
      }
      if (data.password) {
        data.passwordHash = await bcrypt.hash(String(data.password), 12);
        data.sessionVersion = { increment: 1 };
        delete data.password;
      }
    }
    if (resourceName === "settings") {
      const current = await prisma.siteSetting.findUnique({ where: { id }, select: { type: true } });
      if (!current) throw new HttpError(404, "Registro no encontrado.", "NOT_FOUND");
      const nextType = data.type ?? current.type;
      if (nextType === "secret") data.public = false;
      if (nextType === "json" && typeof data.value === "string") {
        try { JSON.parse(data.value); } catch { throw new HttpError(422, "El valor debe contener JSON válido.", "INVALID_JSON_SETTING"); }
      }
      if (data.value === "••••••••") delete data.value;
    }
    if (resourceName === "orders") {
      const current = await prisma.order.findUnique({ where: { id }, include: { items: true } });
      if (!current) throw new HttpError(404, "Registro no encontrado.", "NOT_FOUND");
      const terminalStatuses = ["CANCELLED", "REFUNDED"];
      if (data.status && data.status !== current.status && !["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
        throw new HttpError(403, "Solo un administrador puede confirmar, cancelar o reembolsar pagos.", "FORBIDDEN");
      }
      if (terminalStatuses.includes(current.status) && data.status && !terminalStatuses.includes(String(data.status))) {
        throw new HttpError(409, "Un pedido cancelado o reembolsado no puede reabrirse desde el editor.", "ORDER_TERMINAL");
      }
      if (data.status === "PAID") {
        const record = await confirmOrderPayment(id, {
          paymentReference: typeof data.paymentReference === "string" ? data.paymentReference : undefined,
          paidAt: data.paidAt instanceof Date ? data.paidAt : undefined,
          notes: typeof data.notes === "string" || data.notes === null ? data.notes : undefined,
        });
        return NextResponse.json({ ok: true, data: serializeAdminRecord(record, resource) });
      }
      if (data.status && terminalStatuses.includes(String(data.status))) {
        if (current.status === "DELIVERING") {
          throw new HttpError(409, "Espera a que finalice la entrega antes de cancelar o reembolsar.", "ORDER_DELIVERY_IN_PROGRESS");
        }
        if (current.status === "DELIVERED" && data.status === "CANCELLED") {
          throw new HttpError(409, "Un pedido entregado solo puede registrarse como reembolsado.", "ORDER_ALREADY_DELIVERED");
        }
        if (current.stockReserved) {
          const released = await releaseOrderReservation(id, String(data.status));
          if (!released) throw new HttpError(409, "La reserva cambió. Actualiza la vista antes de continuar.", "RESERVATION_RACE");
          const remainingData = { ...data };
          delete remainingData.status;
          const record = Object.keys(remainingData).length
            ? await prisma.order.update({ where: { id }, data: remainingData, include: { items: true } })
            : await prisma.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
          return NextResponse.json({ ok: true, data: serializeAdminRecord(record, resource) });
        }
        const record = await prisma.$transaction(async (transaction) => {
          const transition = await transaction.order.updateMany({
            where: { id, status: current.status },
            data,
          });
          if (transition.count === 1 && current.status === "PAID") {
            for (const item of current.items) {
              if (!item.productId) continue;
              await transaction.product.updateMany({
                where: { id: item.productId, stock: { not: null } },
                data: { stock: { increment: item.quantity } },
              });
            }
            await transaction.licenseKey.updateMany({
              where: { orderItem: { orderId: id }, status: "ASSIGNED" },
              data: { status: "AVAILABLE", orderItemId: null },
            });
          } else {
            throw new HttpError(409, "El estado del pedido cambió. Actualiza la vista antes de cancelar o reembolsar.", "ORDER_STATUS_RACE");
          }
          return transaction.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
        });
        return NextResponse.json({ ok: true, data: serializeAdminRecord(record, resource) });
      }
    }
    if (resourceName === "complaints" && data.status === "RESPONDED" && !data.respondedAt) data.respondedAt = new Date();

    const { before, record } = await prisma.$transaction(async (transaction) => {
      const delegate = getTransactionAdminDelegate(transaction, resourceName);
      const previous = await delegate.findUnique({ where: { id } });
      if (!previous) throw new HttpError(404, "Registro no encontrado.", "NOT_FOUND");
      if (expectedVersion) {
        const previousTimestamp = previous.updatedAt instanceof Date
          ? previous.updatedAt.getTime()
          : new Date(String(previous.updatedAt)).getTime();
        if (previousTimestamp !== expectedVersion.getTime()) {
          throw new HttpError(409, "Este registro cambió en otra sesión. Actualiza la vista antes de guardar.", "EDIT_CONFLICT");
        }
      }
      if (resourceName === "projects") assertProjectPublishable({ ...previous, ...data });
      if (resourceName === "leads" && data.status === "LOST") {
        const lostReason = data.lostReason ?? previous.lostReason;
        if (typeof lostReason !== "string" || !lostReason.trim()) {
          throw new HttpError(422, "Indica el motivo de pérdida del lead.", "LOST_REASON_REQUIRED");
        }
      }
      if (resourceName === "leads" && typeof data.status === "string") {
        assertLeadStatusTransition(String(previous.status), data.status);
      }
      if (resourceName === "leads" && data.status && !["NEW", "LOST"].includes(String(data.status)) && data.lastContactAt === undefined) {
        data.lastContactAt = new Date();
      }

      const updated = await delegate.update({
        where: { id },
        data,
        ...(resource.include ? { include: resource.include } : {}),
      });
      if (typeof updated.id === "string") {
        const entityType = activityEntityTypeForResource(resourceName);
        const previousStatus = previous.status;
        const currentStatus = updated.status;
        const contentPublished = resourceName === "projects"
          ? !isPublicProjectState(previous) && isPublicProjectState(updated)
          : previous.published !== true && updated.published === true;
        const leadAssigned = resourceName === "leads" && previous.assignedToId !== updated.assignedToId;
        const userRoleChanged = resourceName === "users" && previous.role !== updated.role;
        await recordActivity(transaction, {
          actorUserId: user.id,
          entityType,
          entityId: updated.id,
          action: contentPublished ? "CONTENT_PUBLISHED" : leadAssigned ? "LEAD_ASSIGNED" : userRoleChanged ? "USER_ROLE_CHANGED" : previousStatus !== currentStatus ? `${entityType}_STATUS_CHANGED` : `${entityType}_UPDATED`,
          metadata: {
            changedFields: Object.keys(data),
            resource: resourceName,
            ...(previousStatus !== currentStatus ? { from: previousStatus, to: currentStatus } : {}),
          },
        });
      }
      return { before: previous, record: updated };
    });
    revalidatePublicContent(resourceName, [
      typeof before?.slug === "string" ? before.slug : null,
      typeof record.slug === "string" ? record.slug : null,
    ]);
    return NextResponse.json({ ok: true, data: serializeAdminRecord(record, resource) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export { update as PATCH, update as PUT };

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { resource: resourceName, id } = await context.params;
    const { resource, user } = await authorize(resourceName, "delete");
    if (resource.canDelete === false) throw new HttpError(405, "Este tipo de registro se conserva por auditoría.", "METHOD_NOT_ALLOWED");
    if (resourceName === "users") {
      if (id === user.id) throw new HttpError(409, "No puedes eliminar tu propio usuario.", "SELF_DELETE");
      const target = await prisma.user.findUnique({ where: { id }, select: { role: true, active: true } });
      if (target?.role === "SUPER_ADMIN" && target.active) {
        const admins = await prisma.user.count({ where: { role: "SUPER_ADMIN", active: true } });
        if (admins <= 1) throw new HttpError(409, "Debe existir al menos un superadministrador activo.", "LAST_SUPER_ADMIN");
      }
    }
    if (resourceName === "products") {
      const product = await prisma.product.findUnique({
        where: { id },
        select: { _count: { select: { licenseKeys: true, orderItems: true } } },
      });
      if (!product) throw new HttpError(404, "Registro no encontrado.", "NOT_FOUND");
      if (product._count.licenseKeys > 0 || product._count.orderItems > 0) {
        throw new HttpError(
          409,
          "Este producto tiene licencias o pedidos asociados. Desactívalo para conservar el historial.",
          "PRODUCT_HAS_HISTORY",
        );
      }
    }
    await prisma.$transaction(async (transaction) => {
      const delegate = getTransactionAdminDelegate(transaction, resourceName);
      await delegate.delete({ where: { id } });
      const entityType = activityEntityTypeForResource(resourceName);
      await recordActivity(transaction, {
        actorUserId: user.id,
        entityType,
        entityId: id,
        action: `${entityType}_DELETED`,
        metadata: { resource: resourceName },
      });
    });
    revalidatePublicContent(resourceName);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
