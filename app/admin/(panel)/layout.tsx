import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { authOptions } from "@/lib/auth";
import { isUserRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isUserRole(session.user.role)) redirect("/admin/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true, role: true, active: true, sessionVersion: true } });
  if (!user?.active || !isUserRole(user.role) || user.sessionVersion !== session.user.sessionVersion) redirect("/admin/login");
  return <AdminShell user={{ name: user.name, email: user.email, role: user.role }}>{children}</AdminShell>;
}
