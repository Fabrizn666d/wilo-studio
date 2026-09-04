export const USER_ROLES = ["SUPER_ADMIN", "ADMIN", "COMMERCIAL", "EDITOR"] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type AdminResourceAction = "read" | "create" | "update" | "delete";
export type AdminResourceRoleMap = Partial<Record<AdminResourceAction, readonly UserRole[]>>;

export const STAFF_ROLES: readonly UserRole[] = USER_ROLES;
export const SUPER_ADMIN_ROLES = ["SUPER_ADMIN"] as const satisfies readonly UserRole[];

const MANAGEMENT_ROLES = ["SUPER_ADMIN", "ADMIN"] as const satisfies readonly UserRole[];
const COMMERCIAL_ROLES = ["SUPER_ADMIN", "ADMIN", "COMMERCIAL"] as const satisfies readonly UserRole[];
const CONTENT_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"] as const satisfies readonly UserRole[];
const NO_ROLES = [] as const satisfies readonly UserRole[];

export type AdminResourcePermission = Readonly<Record<AdminResourceAction, readonly UserRole[]>>;

function permission(
  read: readonly UserRole[],
  create: readonly UserRole[] = read,
  update: readonly UserRole[] = create,
  remove: readonly UserRole[] = update,
): AdminResourcePermission {
  return { read, create, update, delete: remove };
}

/**
 * Server-side source of truth for Wilo OS resource permissions.
 * Unknown resources are restricted to SUPER_ADMIN by default.
 */
export const ADMIN_RESOURCE_PERMISSIONS = {
  dashboard: permission(STAFF_ROLES, NO_ROLES, NO_ROLES, NO_ROLES),
  projects: permission(STAFF_ROLES, CONTENT_ROLES, CONTENT_ROLES, MANAGEMENT_ROLES),
  services: permission(CONTENT_ROLES, CONTENT_ROLES, CONTENT_ROLES, MANAGEMENT_ROLES),
  plans: permission(MANAGEMENT_ROLES),
  productCategories: permission(CONTENT_ROLES, CONTENT_ROLES, CONTENT_ROLES, MANAGEMENT_ROLES),
  products: permission(MANAGEMENT_ROLES),
  clients: permission(COMMERCIAL_ROLES, COMMERCIAL_ROLES, COMMERCIAL_ROLES, SUPER_ADMIN_ROLES),
  testimonials: permission(CONTENT_ROLES),
  promotions: permission(CONTENT_ROLES),
  referrals: permission(COMMERCIAL_ROLES, COMMERCIAL_ROLES, COMMERCIAL_ROLES, SUPER_ADMIN_ROLES),
  leads: permission(COMMERCIAL_ROLES, COMMERCIAL_ROLES, COMMERCIAL_ROLES, SUPER_ADMIN_ROLES),
  complaints: permission(COMMERCIAL_ROLES, NO_ROLES, COMMERCIAL_ROLES, NO_ROLES),
  orders: permission(MANAGEMENT_ROLES, MANAGEMENT_ROLES, MANAGEMENT_ROLES, NO_ROLES),
  media: permission(CONTENT_ROLES),
  settings: permission(SUPER_ADMIN_ROLES),
  users: permission(SUPER_ADMIN_ROLES),
  quotes: permission(COMMERCIAL_ROLES, COMMERCIAL_ROLES, COMMERCIAL_ROLES, MANAGEMENT_ROLES),
  notes: permission(COMMERCIAL_ROLES, COMMERCIAL_ROLES, COMMERCIAL_ROLES, MANAGEMENT_ROLES),
  content: permission(CONTENT_ROLES, NO_ROLES, NO_ROLES, NO_ROLES),
  activity: permission(MANAGEMENT_ROLES, NO_ROLES, NO_ROLES, NO_ROLES),
  uploads: permission(CONTENT_ROLES, CONTENT_ROLES, NO_ROLES, NO_ROLES),
  licenseKeys: permission(MANAGEMENT_ROLES),
} as const satisfies Record<string, AdminResourcePermission>;

export type AdminPermissionResource = keyof typeof ADMIN_RESOURCE_PERMISSIONS;

export const ROLE_LABELS = {
  SUPER_ADMIN: "Superadministrador",
  ADMIN: "Administrador",
  COMMERCIAL: "Comercial",
  EDITOR: "Editor",
} as const satisfies Record<UserRole, string>;

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && (USER_ROLES as readonly string[]).includes(value);
}

/** SUPER_ADMIN remains a system-wide break-glass/full-access role. */
export function isRoleAllowed(role: UserRole, allowedRoles: readonly UserRole[]): boolean {
  return role === "SUPER_ADMIN" || allowedRoles.includes(role);
}

export function rolesForAdminResource(
  resource: string,
  action: AdminResourceAction,
  overrides?: AdminResourceRoleMap,
): readonly UserRole[] {
  const overriddenRoles = overrides?.[action];
  if (overriddenRoles) return overriddenRoles;
  const configured = ADMIN_RESOURCE_PERMISSIONS[resource as AdminPermissionResource];
  return configured?.[action] ?? SUPER_ADMIN_ROLES;
}

export function canAccessAdminResource(
  role: UserRole,
  resource: string,
  action: AdminResourceAction = "read",
  overrides?: AdminResourceRoleMap,
): boolean {
  return isRoleAllowed(role, rolesForAdminResource(resource, action, overrides));
}

/** COMMERCIAL may only inspect projects explicitly assigned to them. */
export function adminResourceScope(role: UserRole, resource: string, userId: string): Record<string, unknown> {
  if (role === "COMMERCIAL" && resource === "projects") return { assignedToId: userId };
  return {};
}

export function canReadAdminRecord(
  role: UserRole,
  resource: string,
  userId: string,
  record: Record<string, unknown>,
): boolean {
  if (role === "COMMERCIAL" && resource === "projects") return record.assignedToId === userId;
  return true;
}
