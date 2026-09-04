import type { Metadata } from "next";
import { ServiceDetailPage, type ServiceDetailData } from "@/components/public-routes/service-detail";
import { getPublicProjects } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Tecnología: páginas web, apps y sistemas",
  description: "Diseño de páginas web en Arequipa, tiendas virtuales, apps móviles, API SUNAT y sistemas a medida para negocios en Perú.",
  keywords: ["diseño de páginas web en Arequipa", "tiendas virtuales Perú", "desarrollo de apps móviles Perú", "facturación electrónica SUNAT"],
  alternates: { canonical: "/servicios/tecnologia" },
  openGraph: { title: "Tecnología para negocios | Wilo Studio", description: "Webs, ecommerce, apps, sistemas e integraciones que impulsan tu negocio.", url: "/servicios/tecnologia", images: [{ url: "/images/proyecto-tecnova.jpg", alt: "Tecnología para negocios de Wilo Studio" }] },
  twitter: { card: "summary_large_image", title: "Tecnología para negocios | Wilo Studio", description: "Webs, ecommerce, apps, sistemas e integraciones que impulsan tu negocio.", images: ["/images/proyecto-tecnova.jpg"] },
};

const data: ServiceDetailData = {
  eyebrow: "Tecnología · El corazón de Wilo",
  title: <>Herramientas digitales hechas para <em>hacer crecer.</em></>,
  description: "No solo creamos páginas. Creamos herramientas digitales que impulsan tu negocio: rápidas, administrables y pensadas alrededor de tus procesos.",
  tone: "yellow",
  image: "/images/proyecto-tecnova.jpg",
  imageAlt: "Proyecto web desarrollado para Tecnova",
  badge: "Web · Apps · Sistemas",
  statement: "Tu negocio en el mundo digital, donde todo sucede.",
  intro: "Diseñamos cada solución desde el problema que debe resolver: presentar mejor tu empresa, vender en línea, automatizar tareas, conectar sistemas o entregar información útil a tus clientes.",
  capabilities: [
    { title: "Webs y ecommerce", text: "Experiencias rápidas, claras y adaptadas a cada pantalla.", items: ["Landing pages y webs corporativas", "Catálogos con panel administrable", "Tiendas virtuales y pasarelas de pago"] },
    { title: "Apps y sistemas", text: "Software a medida para ordenar operaciones y abrir nuevos canales.", items: ["Apps Android e iOS", "Paneles, cotizadores e inventarios", "Flujos y sistemas web personalizados"] },
    { title: "Integraciones", text: "Conectamos las herramientas que tu equipo ya necesita usar.", items: ["Facturación electrónica y API SUNAT", "Login social, analítica y WhatsApp Business", "Pasarelas de pago y servicios externos"] },
  ],
  process: [
    { number: "01", title: "Diagnóstico", text: "Entendemos objetivos, usuarios, procesos e integraciones necesarias." },
    { number: "02", title: "Experiencia", text: "Ordenamos la información y validamos la dirección visual." },
    { number: "03", title: "Desarrollo", text: "Construimos, conectamos y probamos cada flujo en móvil y escritorio." },
    { number: "04", title: "Entrega", text: "Publicamos, capacitamos a tu equipo y continuamos con soporte." },
  ],
  ctaTitle: "Convierte tu próxima idea en una herramienta real.",
  ctaMessage: "Hola Wilo Studio, quiero cotizar una web, app o sistema para mi negocio.",
};

export const dynamic = "force-dynamic";

export default async function TechnologyPage() {
  const projects = (await getPublicProjects())
    .filter((project) => project.category === "Tecnología" && project.status === "Proyecto" && !project.image.includes("portfolio-showcase"))
    .slice(0, 3)
    .map((project) => ({ title: project.title, label: project.service, image: project.image }));
  return <ServiceDetailPage data={{ ...data, projects }} />;
}
