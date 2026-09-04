import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Camera, MonitorCog, RadioTower } from "lucide-react";
import { RouteCta, PublicHero, SectionHeading } from "@/components/public-routes/route-ui";
import { serviceLines } from "@/lib/content";

export const metadata: Metadata = {
  title: "Servicios de tecnología, audiovisual y eventos",
  description: "Tecnología para negocios, producción audiovisual e infraestructura para eventos desde Arequipa para todo el Perú.",
  alternates: { canonical: "/servicios" },
  openGraph: { title: "Servicios de Wilo Studio", description: "Soluciones que hacen ver, vender y crecer tu negocio.", url: "/servicios", images: [{ url: "/brand/portfolio-showcase.webp", alt: "Servicios de Wilo Studio" }] },
  twitter: { card: "summary_large_image", title: "Servicios de Wilo Studio", description: "Soluciones que hacen ver, vender y crecer tu negocio.", images: ["/brand/portfolio-showcase.webp"] },
};

const icons = [MonitorCog, Camera, RadioTower];
const atmospheres = ["yellow", "cream", "dark"] as const;

export default function ServicesPage() {
  return (
    <main id="contenido" className="pr-page">
      <PublicHero
        description="Conectamos estrategia, diseño y ejecución para resolver proyectos digitales, producir contenido profesional y operar eventos exigentes."
        eyebrow="Servicios Wilo Studio"
        image="/brand/wilo-mascot-cutout.webp"
        imageAlt="Mascota camaleón de Wilo Studio sobre un iMac"
        imageContain
        badge="Tres líneas · una sola visión"
        tone="yellow"
        title={<>Todo lo que tu negocio necesita para <em>avanzar.</em></>}
      />

      <section className="pr-section pr-section--cream">
        <div className="pr-shell">
          <SectionHeading
            description="Puedes contratar una línea puntual o coordinar una solución integral. En ambos casos, el alcance se define según tu objetivo."
            eyebrow="Tres especialidades"
            title={<>De una idea a una solución <em>bien ejecutada.</em></>}
          />
          <div className="pr-service-overview">
            {serviceLines.map((service, index) => {
              const Icon = icons[index];
              return (
                <article className={`pr-service-overview__card is-${atmospheres[index]}`} key={service.key}>
                  <div className="pr-service-overview__top">
                    <span>{service.number}</span>
                    <Icon aria-hidden="true" size={30} />
                  </div>
                  <span className="pr-mini-label">{service.eyebrow}</span>
                  <h2>{service.title}</h2>
                  <p>{service.description}</p>
                  <ul>{service.items.map((item) => <li key={item}>{item}</li>)}</ul>
                  <Link aria-label={`Conocer ${service.title}`} href={service.href}>
                    Ver servicio <ArrowUpRight aria-hidden="true" size={18} />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pr-section pr-section--dark">
        <div className="pr-shell pr-service-proof">
          <div>
            <span className="pr-kicker">Visión integral</span>
            <h2>La estrategia no termina en una pantalla.</h2>
            <p>Una campaña puede necesitar una web que convierta, contenido que comunique y una ejecución técnica impecable en vivo. Coordinamos esas capacidades bajo una sola dirección.</p>
          </div>
          <figure>
            <Image alt="Presentación comercial de proyectos y servicios de Wilo Studio" fill sizes="(max-width: 820px) 100vw, 52vw" src="/brand/portfolio-showcase.webp" />
          </figure>
        </div>
      </section>

      <RouteCta title="¿Qué necesita resolver hoy tu negocio?" />
    </main>
  );
}
