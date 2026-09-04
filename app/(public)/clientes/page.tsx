import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, Quote } from "lucide-react";
import { PublicHero, RouteCta, SectionHeading } from "@/components/public-routes/route-ui";
import { getPublicClients, getPublicTestimonials } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Clientes",
  description: "Proyectos, marcas y equipos con trabajo publicado o validado por Wilo Studio.",
  alternates: { canonical: "/clientes" },
  openGraph: { title: "Clientes de Wilo Studio", description: "Negocios y equipos que confiaron en Wilo Studio.", url: "/clientes", images: [{ url: "/brand/portfolio-showcase.webp", alt: "Clientes y proyectos de Wilo Studio" }] },
  twitter: { card: "summary_large_image", title: "Clientes de Wilo Studio", description: "Negocios y equipos que confiaron en Wilo Studio.", images: ["/brand/portfolio-showcase.webp"] },
};

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const [clients, testimonials] = await Promise.all([getPublicClients(), getPublicTestimonials()]);
  return (
    <main id="contenido" className="pr-page">
      <PublicHero
        badge="Trabajo verificable"
        description="Cada proyecto empieza escuchando un negocio distinto. Esta es una parte de las marcas y equipos que han confiado en Wilo Studio."
        eyebrow="Clientes"
        image="/brand/portfolio-showcase.webp"
        imageAlt="Muestra comercial de clientes y proyectos de Wilo Studio"
        tone="dark"
        title={<>La confianza se construye <em>proyecto a proyecto.</em></>}
      />

      <section className="pr-section pr-section--cream">
        <div className="pr-shell">
          <SectionHeading description="Cuando todavía no contamos con el archivo oficial de una marca, mostramos su nombre sin recrear ni alterar su identidad visual." eyebrow="Marcas" title={<>Equipos que ya son parte de <em>nuestro recorrido.</em></>} />
          {clients.length ? <div className="pr-client-wall">
            {clients.map((client) => (
              <div key={client.id}>
                {client.logoUrl?.startsWith("/") ? <Image alt={`Logo de ${client.name}`} fill sizes="(max-width: 560px) 50vw, 20vw" src={client.logoUrl} /> : <span>{client.name}</span>}
              </div>
            ))}
          </div> : <div className="pr-testimonial-empty"><BadgeCheck aria-hidden="true" /><div><h3>El muro se está actualizando.</h3><p>Las marcas volverán a aparecer cuando sus fichas estén activas y validadas desde el administrador.</p></div></div>}
        </div>
      </section>

      <section className="pr-section pr-section--dark">
        <div className="pr-shell">
          <SectionHeading eyebrow={testimonials.length ? "Experiencias" : "Referencias verificadas"} inverse title={testimonials.length ? <>Lo que valoran quienes <em>trabajan con Wilo.</em></> : <>Publicaremos cada historia <em>con autorización.</em></>} />
          {testimonials.length ? <div className="pr-testimonial-grid">
            {testimonials.map((testimonial) => (
              <article key={testimonial.id}>
                <Quote aria-hidden="true" />
                <blockquote>{testimonial.quote}</blockquote>
                <div>{testimonial.avatarUrl?.startsWith("/") && <Image alt="" height={52} src={testimonial.avatarUrl} width={52} />}<span><strong>{testimonial.name}</strong><small>{[testimonial.role, testimonial.company].filter(Boolean).join(" · ")}</small></span></div>
              </article>
            ))}
          </div> : <div className="pr-testimonial-empty"><BadgeCheck aria-hidden="true" /><div><h3>Sin citas atribuidas por ahora.</h3><p>El sitio solo mostrará testimonios aprobados desde el panel administrador. Así evitamos publicar nombres, cargos o declaraciones que el cliente no haya validado.</p></div></div>}
        </div>
      </section>

      <RouteCta title="Tu negocio puede ser el próximo caso que construyamos juntos." />
    </main>
  );
}
