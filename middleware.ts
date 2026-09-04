import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
import { isUserRole } from "@/lib/auth/permissions";

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

export async function middleware(request: NextRequest) {
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
  const isStaff = isUserRole(token?.role);
  if (isStaff) return NextResponse.next();

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ ok: false, error: "Debes iniciar sesión.", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
