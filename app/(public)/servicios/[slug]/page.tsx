import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ServiceDetailPage, type ServiceDetailData } from "@/components/public-routes/service-detail";
import { serviceShowcaseItems } from "@/data/services-showcase";

const legacyDestinations: Readonly<Record<string, string>> = {
  "desarrollo-web": "/servicios/webs-corporativas",
  plataformas: "/servicios/plataformas-sistemas",
  aplicaciones: "/servicios/plataformas-sistemas",
  apps: "/servicios/plataformas-sistemas",
  automatizacion: "/servicios/automatizacion-apis",
  audiovisual: "/servicios/produccion-audiovisual",
  "infraestructura-soporte": "/servicios/infraestructura-digital",
};

function findService(slug: string) {
  return serviceShowcaseItems.find((item) => item.slug === slug);
}

export function generateStaticParams() {
  return serviceShowcaseItems
    .filter((item) => item.slug !== "produccion-audiovisual")
    .map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = findService(slug);
  if (!service) return {};

  return {
    title: `${service.shortName} | Wilo Studio`,
    description: service.description,
    alternates: { canonical: `/servicios/${service.slug}` },
    openGraph: {
      title: `${service.shortName} | Wilo Studio`,
      description: service.description,
      images: [{ url: service.image, alt: service.imageAlt }],
      url: `/servicios/${service.slug}`,
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const legacyDestination = legacyDestinations[slug];
  if (legacyDestination) permanentRedirect(legacyDestination);

  const service = findService(slug);
  if (!service) notFound();

  const data: ServiceDetailData = {
    eyebrow: `${service.number} · Servicios Wilo`,
    title: <>{service.shortName} para <em>hacer avanzar tu negocio.</em></>,
    description: service.description,
    tone: "cream",
    image: service.image,
    imageAlt: service.imageAlt,
    badge: service.shortName,
    statement: "Una solución real se diseña alrededor de tu operación, no alrededor de una plantilla.",
    intro: `Nuestro servicio de ${service.shortName.toLowerCase()} reúne estrategia, diseño, implementación y acompañamiento dentro de una sola ruta de trabajo.`,
    capabilities: [
      {
        title: service.features[0],
        text: "Definimos la solución desde el objetivo, el contexto y las personas que la utilizarán.",
        items: ["Diagnóstico del negocio", "Arquitectura a medida", "Alcance documentado"],
      },
      {
        title: service.features[1],
        text: "Construimos cada parte con criterios claros de calidad, rendimiento y mantenimiento.",
        items: ["Diseño funcional", "Implementación profesional", "Pruebas en escenarios reales"],
      },
      {
        title: service.features[2],
        text: "Preparamos la entrega para que pueda operar, medirse y seguir evolucionando.",
        items: ["Configuración y publicación", "Capacitación", "Soporte posterior"],
      },
    ],
    process: [
      { number: "01", title: "Diagnóstico", text: "Entendemos el objetivo, el contexto y los requisitos importantes." },
      { number: "02", title: "Dirección", text: "Acordamos arquitectura, experiencia, entregables y prioridades." },
      { number: "03", title: "Producción", text: "Diseñamos, construimos y validamos cada componente del alcance." },
      { number: "04", title: "Evolución", text: "Publicamos, acompañamos la operación y priorizamos las mejoras." },
    ],
    ctaTitle: `Conversemos sobre ${service.shortName.toLowerCase()}.`,
    ctaMessage: `Hola Wilo Studio, quiero cotizar el servicio de ${service.shortName.toLowerCase()}.`,
  };

  return <ServiceDetailPage data={data} />;
}

