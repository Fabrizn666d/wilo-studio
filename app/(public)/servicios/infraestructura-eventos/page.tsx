import type { Metadata } from "next";
import { ServiceDetailPage, type ServiceDetailData } from "@/components/public-routes/service-detail";

export const metadata: Metadata = {
  title: "Infraestructura y coordinación técnica para eventos",
  description: "Planificación y coordinación de los sistemas visuales, sonoros y escénicos que requiere cada evento.",
  keywords: ["infraestructura para eventos Perú", "producción técnica de eventos", "coordinación audiovisual para eventos"],
  alternates: { canonical: "/servicios/infraestructura-eventos" },
  openGraph: { title: "Infraestructura para eventos | Wilo Studio", description: "Planificación visual, sonora y escénica bajo una sola coordinación.", url: "/servicios/infraestructura-eventos", images: [{ url: "/images/wilo/generated/events-stage-v2.webp", alt: "Escenario de una producción corporativa" }] },
  twitter: { card: "summary_large_image", title: "Infraestructura para eventos | Wilo Studio", description: "Planificación visual, sonora y escénica bajo una sola coordinación.", images: ["/images/wilo/generated/events-stage-v2.webp"] },
};

const data: ServiceDetailData = {
  eyebrow: "Infraestructura y eventos",
  title: <>La técnica que sostiene un <em>gran evento.</em></>,
  description: "Organizamos los componentes visuales, sonoros y escénicos de cada producción bajo una dirección técnica clara.",
  tone: "dark",
  image: "/images/wilo/generated/events-stage-v2.webp",
  imageAlt: "Escenario iluminado durante una producción corporativa",
  badge: "Imagen · Sonido · Escena",
  statement: "Cuando cada sistema debe responder al mismo tiempo, la coordinación también es parte del servicio.",
  intro: "Levantamos los requerimientos del evento y ordenamos cada componente como una sola operación. El equipamiento y el equipo técnico se confirman después de revisar la sede, el formato y el programa.",
  capabilities: [
    { title: "Sistema visual", text: "Definimos cómo debe verse el contenido dentro del espacio.", items: ["Pantallas según requerimiento", "Iluminación de escena", "Distribución visual"] },
    { title: "Sistema sonoro", text: "Planificamos la cobertura de audio según el formato y el recinto.", items: ["Refuerzo sonoro", "Consola y microfonía", "Pruebas previas"] },
    { title: "Coordinación técnica", text: "Conectamos proveedores, montaje y operación dentro de un plan común.", items: ["Levantamiento de sede", "Plan de montaje", "Operación coordinada"] },
  ],
  process: [
    { number: "01", title: "Levantamiento", text: "Revisamos sede, formato, tiempos, recorridos y programación." },
    { number: "02", title: "Plan técnico", text: "Definimos equipamiento, distribución y coordinación necesaria." },
    { number: "03", title: "Montaje", text: "Instalamos y verificamos los sistemas incluidos en el alcance." },
    { number: "04", title: "Operación", text: "Acompañamos la ejecución técnica durante el evento contratado." },
  ],
  ctaTitle: "Planifiquemos la infraestructura de tu próximo evento.",
  ctaMessage: "Hola Wilo Studio, quiero cotizar infraestructura técnica para un evento.",
};

export default function InfrastructurePage() {
  return <ServiceDetailPage data={data} />;
}
