import { getServerSession } from "next-auth";
import { HttpError } from "@/lib/api";
import { authOptions } from "@/lib/auth";
import {
  isRoleAllowed,
  isUserRole,
  rolesForAdminResource,
  STAFF_ROLES,
  type AdminResourceAction,
  type AdminResourceRoleMap,
  type UserRole,
} from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export async function requireStaff(roles: readonly UserRole[] = STAFF_ROLES) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new HttpError(401, "Debes iniciar sesión.", "UNAUTHORIZED");
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, active: true, sessionVersion: true },
  });
  if (!user?.active || !isUserRole(user.role) || user.sessionVersion !== session.user.sessionVersion) {
    throw new HttpError(401, "Tu sesión ya no está autorizada.", "UNAUTHORIZED");
  }
  if (!isRoleAllowed(user.role, roles)) {
    throw new HttpError(403, "No tienes permiso para realizar esta acción.", "FORBIDDEN");
  }
  return { ...user, role: user.role };
}

export async function requireAdminResource(
  resource: string,
  action: AdminResourceAction,
  overrides?: AdminResourceRoleMap,
) {
  return requireStaff(rolesForAdminResource(resource, action, overrides));
}
