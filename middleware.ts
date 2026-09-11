import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
import { isUserRole } from "@/lib/auth/permissions";
import { PUBLIC_FEATURES } from "@/lib/public-release";

const guardedRoutes = [
  { prefixes: ["/proyectos", "/portafolio"], enabled: PUBLIC_FEATURES.projects },
  { prefixes: ["/nosotros"], enabled: PUBLIC_FEATURES.about },
  { prefixes: ["/contacto"], enabled: PUBLIC_FEATURES.contact },
  { prefixes: ["/servicios"], enabled: PUBLIC_FEATURES.services },
  { prefixes: ["/cotizar"], enabled: PUBLIC_FEATURES.quote },
  { prefixes: ["/tienda"], enabled: PUBLIC_FEATURES.store },
  { prefixes: ["/education"], enabled: PUBLIC_FEATURES.education },
  { prefixes: ["/events"], enabled: PUBLIC_FEATURES.events },
  { prefixes: ["/express"], enabled: PUBLIC_FEATURES.express },
  { prefixes: ["/checkout"], enabled: PUBLIC_FEATURES.checkout },
  { prefixes: ["/clientes"], enabled: PUBLIC_FEATURES.customers },
  { prefixes: ["/promos"], enabled: PUBLIC_FEATURES.promotions },
  { prefixes: ["/referidos"], enabled: PUBLIC_FEATURES.referrals },
] as const;

function addOrigin(target: Set<string>, value: string | null | undefined) {
  if (!value) return;
  try {
    target.add(new URL(value).origin);
  } catch {
    // An invalid deployment URL must never make the origin check more permissive.
  }
}

function requestOrigins(request: NextRequest) {
  const allowed = new Set<string>();
  addOrigin(allowed, process.env.SITE_URL);
  addOrigin(allowed, process.env.NEXTAUTH_URL);
  addOrigin(allowed, request.nextUrl.origin);

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto")?.split(",", 1)[0]?.trim()
    ?? request.nextUrl.protocol.replace(":", "")
    ?? "https";
  if (host) addOrigin(allowed, `${protocol}://${host.split(",", 1)[0]?.trim()}`);

  return allowed;
}

async function protectAdmin(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (["/admin/login", "/admin/recuperar", "/admin/restablecer"].includes(pathname)) return NextResponse.next();

  if (pathname.startsWith("/api/admin") && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin");
    let normalizedOrigin: string | null = null;
    try {
      normalizedOrigin = origin ? new URL(origin).origin : null;
    } catch {
      normalizedOrigin = null;
    }

    if (!normalizedOrigin || !requestOrigins(request).has(normalizedOrigin)) {
      return NextResponse.json(
        { ok: false, error: "Origen de solicitud no autorizado.", code: "INVALID_ORIGIN" },
        { status: 403 },
      );
    }
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (isUserRole(token?.role)) return NextResponse.next();

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ ok: false, error: "Debes iniciar sesión.", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    return protectAdmin(request);
  }

  const guarded = guardedRoutes.find(({ prefixes }) => prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)));
  if (!guarded || guarded.enabled) return NextResponse.next();

  const target = request.nextUrl.clone();
  target.pathname = "/en-construccion";
  target.search = "";
  return NextResponse.redirect(target);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/proyectos/:path*",
    "/portafolio/:path*",
    "/nosotros/:path*",
    "/contacto/:path*",
    "/servicios/:path*",
    "/cotizar/:path*",
    "/tienda/:path*",
    "/education/:path*",
    "/events/:path*",
    "/express/:path*",
    "/checkout/:path*",
    "/clientes/:path*",
    "/promos/:path*",
    "/referidos/:path*",
  ],
};
