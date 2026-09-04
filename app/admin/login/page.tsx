import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/login-form";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isUserRole } from "@/lib/auth/permissions";

type LoginPageProps = { searchParams: Promise<{ callbackUrl?: string }> };

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { active: true, role: true, sessionVersion: true },
    });
    if (user?.active && isUserRole(user.role) && user.sessionVersion === session.user.sessionVersion) redirect("/admin");
  }
  const parameters = await searchParams;
  const requested = parameters.callbackUrl || "/admin";
  const callbackUrl = requested.startsWith("/admin") && !requested.startsWith("/admin/login") ? requested : "/admin";

  return (
    <main id="contenido" className="admin-route ad-login-page">
      <section className="ad-login-brand-panel">
        <div className="ad-login-brand"><span className="ad-brand-mark">W</span><span><strong>wilo</strong><small>OS</small></span></div>
        <div className="ad-login-statement"><span>Operación interna</span><h2>Tu estudio.<br />Bajo control.</h2><p>Contenido, ventas y oportunidades en una experiencia hecha para Wilo.</p></div>
        <div className="ad-login-grid" aria-hidden="true" />
        <div className="ad-login-orbit orbit-one" aria-hidden="true" />
        <div className="ad-login-orbit orbit-two" aria-hidden="true" />
      </section>
      <section className="ad-login-form-panel"><AdminLoginForm callbackUrl={callbackUrl} /><footer><span>Wilo Studio</span><span>Acceso seguro</span></footer></section>
    </main>
  );
}
