import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, FolderKanban, ImageIcon, MessageSquareQuote, Sparkles } from "lucide-react";
import { authOptions } from "@/lib/auth";

const modules = [
  { href: "/admin/proyectos", title: "Casos y proyectos", text: "Flujo editorial, portada, galería y SEO", icon: FolderKanban },
  { href: "/admin/servicios", title: "Servicios", text: "Oferta pública y páginas de capacidades", icon: BriefcaseBusiness },
  { href: "/admin/testimonios", title: "Testimonios", text: "Prueba social verificada", icon: MessageSquareQuote },
  { href: "/admin/promociones", title: "Promociones", text: "Campañas y periodos de visibilidad", icon: Sparkles },
  { href: "/admin/medios", title: "Biblioteca de medios", text: "Imágenes reutilizables con texto alternativo", icon: ImageIcon },
];

export default async function ContentPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(session.user.role)) redirect("/admin");
  return (
    <section className="ad-resource-page">
      <div className="ad-page-heading">
        <div>
          <span className="ad-eyebrow">CMS</span>
          <h1>Contenido</h1>
          <p>Publica y mantiene el sitio sin mezclar borradores con información comercial.</p>
        </div>
      </div>
      <div className="ad-quick-grid">
        {modules.map((item) => {
          const Icon = item.icon;
          return (
            <Link href={item.href} key={item.href}>
              <span><Icon size={20} /></span>
              <div><strong>{item.title}</strong><small>{item.text}</small></div>
              <ArrowRight size={17} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
