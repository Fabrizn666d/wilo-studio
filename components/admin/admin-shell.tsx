"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BadgePercent,
  Boxes,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FileClock,
  FileText,
  FileWarning,
  FolderKanban,
  Gauge,
  Handshake,
  ImageIcon,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquareQuote,
  PackageCheck,
  Settings,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { canAccessAdminResource, ROLE_LABELS, type UserRole } from "@/lib/auth/permissions";

type AdminUser = { name?: string | null; email?: string | null; role: UserRole };

const AdminSessionContext = createContext<AdminUser | null>(null);

export function useAdminSession() {
  return useContext(AdminSessionContext);
}

const navigation = [
  { href: "/admin", label: "Resumen", icon: Gauge, resource: "dashboard" },
  { href: "/admin/leads", label: "Leads", icon: LayoutGrid, resource: "leads" },
  { href: "/admin/clientes", label: "Clientes", icon: Building2, resource: "clients" },
  { href: "/admin/cotizaciones", label: "Cotizaciones", icon: ClipboardList, resource: "quotes" },
  { href: "/admin/proyectos", label: "Proyectos", icon: FolderKanban, resource: "projects" },
  { href: "/admin/actividad", label: "Actividad", icon: FileClock, resource: "activity" },
  { href: "/admin/contenido", label: "Contenido", icon: FileText, resource: "content" },
  { href: "/admin/servicios", label: "Servicios", icon: BriefcaseBusiness, resource: "services" },
  { href: "/admin/testimonios", label: "Testimonios", icon: MessageSquareQuote, resource: "testimonials" },
  { href: "/admin/promociones", label: "Promociones", icon: BadgePercent, resource: "promotions" },
  { href: "/admin/medios", label: "Medios", icon: ImageIcon, resource: "media" },
  { href: "/admin/planes", label: "Planes", icon: CircleDollarSign, resource: "plans" },
  { href: "/admin/productos", label: "Productos", icon: Boxes, resource: "products" },
  { href: "/admin/pedidos", label: "Pedidos", icon: PackageCheck, resource: "orders" },
  { href: "/admin/referidos", label: "Referidos", icon: Handshake, resource: "referrals" },
  { href: "/admin/reclamaciones", label: "Reclamaciones", icon: FileWarning, resource: "complaints" },
  { href: "/admin/usuarios", label: "Equipo", icon: Users, resource: "users" },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings, resource: "settings" },
];

function initials(user: AdminUser) {
  const source = user.name?.trim() || user.email || "Wilo";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AdminShell({ children, user }: { children: React.ReactNode; user: AdminUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const visibleNavigation = useMemo(
    () => navigation.filter((item) => canAccessAdminResource(user.role, item.resource, "read")),
    [user.role],
  );

  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const activeItem = [...visibleNavigation]
    .reverse()
    .find((item) => (item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href)));

  return (
    <AdminSessionContext.Provider value={user}>
      <div className="admin-route admin-app">
        <button
          className={`ad-sidebar-backdrop ${mobileOpen ? "is-open" : ""}`}
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar navegación"
          tabIndex={mobileOpen ? 0 : -1}
        />
        <aside className={`ad-sidebar ${mobileOpen ? "is-open" : ""}`} aria-label="Panel administrativo">
          <div className="ad-brand-row">
            <Link className="ad-brand" href="/admin" aria-label="Wilo Studio Admin">
              <span className="ad-brand-mark">W</span>
              <span><strong>wilo</strong><small>OS</small></span>
            </Link>
            <button className="ad-icon-button ad-sidebar-close" type="button" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú">
              <X size={19} />
            </button>
          </div>

          <div className="ad-workspace-label">Workspace</div>
          <nav className="ad-nav">
            {visibleNavigation.map((item) => {
              const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className={active ? "is-active" : ""} aria-current={active ? "page" : undefined}>
                  <Icon size={18} strokeWidth={1.9} />
                  <span>{item.label}</span>
                  {active && <ChevronRight className="ad-nav-arrow" size={15} />}
                </Link>
              );
            })}
          </nav>

          <div className="ad-sidebar-bottom">
            <Link href="/" target="_blank" className="ad-view-site">
              <ShoppingBag size={17} /> Ver sitio público
            </Link>
            <div className="ad-user-card">
              <span className="ad-avatar">{initials(user)}</span>
              <span className="ad-user-copy">
                <strong>{user.name || "Equipo Wilo"}</strong>
                <small>{ROLE_LABELS[user.role]}</small>
              </span>
              <button type="button" onClick={() => signOut({ callbackUrl: "/admin/login" })} aria-label="Cerrar sesión" title="Cerrar sesión">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </aside>

        <div className="ad-main">
          <header className="ad-topbar">
            <button className="ad-icon-button ad-menu-button" type="button" onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
              <Menu size={21} />
            </button>
            <div>
              <span>Wilo Studio</span>
              <strong>{activeItem?.label || "Administración"}</strong>
            </div>
            <div className="ad-topbar-actions">
              <span className="ad-role-pill">{ROLE_LABELS[user.role]}</span>
              <button className="ad-icon-button" type="button" onClick={() => signOut({ callbackUrl: "/admin/login" })} aria-label="Cerrar sesión" title="Cerrar sesión">
                <LogOut size={18} />
              </button>
            </div>
          </header>
          <main id="contenido" className="ad-content">{children}</main>
        </div>
      </div>
    </AdminSessionContext.Provider>
  );
}
