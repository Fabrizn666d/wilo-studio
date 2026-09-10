import type { Metadata } from "next";
import {
  Aperture,
  Camera,
  Check,
  Clapperboard,
  Film,
  Plane,
} from "lucide-react";
import { AudiovisualScene } from "@/components/home/AudiovisualScene";
import { HomeSceneMotion } from "@/components/home/HomeSceneMotion";
import { RouteCta } from "@/components/public-routes/route-ui";
import { siteConfig } from "@/lib/content";
import styles from "./audiovisual-cinematic.module.css";

const capabilities = [
  {
    number: "01",
    title: "Fotografía corporativa",
    text: "Imágenes para presentar equipos, espacios, productos y procesos.",
    items: ["Fotografía corporativa", "Contenido de marca", "Cobertura de eventos"],
    icon: Camera,
  },
  {
    number: "02",
    title: "Video profesional",
    text: "Piezas pensadas desde el mensaje hasta la edición final.",
    items: ["Video corporativo", "Contenido para marcas", "Registro profesional de eventos"],
    icon: Film,
  },
  {
    number: "03",
    title: "Cinematografía aérea",
    text: "Tomas con drones para sumar escala, contexto y una mirada distinta.",
    items: ["Tomas aéreas", "Cobertura de locaciones", "Integración con piezas de video"],
    icon: Plane,
  },
] as const;

const process = [
  { number: "01", title: "Objetivo", text: "Alineamos mensaje, audiencia, formatos y canales de publicación." },
  { number: "02", title: "Preproducción", text: "Planificamos locación, agenda, tomas y necesidades técnicas." },
  { number: "03", title: "Rodaje", text: "Ejecutamos la producción con cámaras y drones según el alcance." },
  { number: "04", title: "Edición", text: "Seleccionamos, editamos y entregamos las piezas acordadas." },
] as const;

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
    { "@type": "ListItem", position: 2, name: "Servicios", item: `${siteConfig.url}/servicios` },
    { "@type": "ListItem", position: 3, name: "Producción audiovisual", item: `${siteConfig.url}/servicios/produccion-audiovisual` },
  ],
};

export const metadata: Metadata = {
  title: "Producción audiovisual corporativa",
  description: "Foto y video corporativo, cinematografía con drones y contenido profesional para marcas y eventos en Perú.",
  alternates: { canonical: "/servicios/produccion-audiovisual" },
  openGraph: {
    title: "Producción audiovisual | Wilo Studio",
    description: "Historias visuales que conectan marcas.",
    url: "/servicios/produccion-audiovisual",
    images: [{ url: "/images/wilo/generated/audiovisual-set-v2.webp", alt: "Set profesional de producción audiovisual" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Producción audiovisual | Wilo Studio",
    description: "Fotografía, video y tomas aéreas con una dirección visual consistente.",
    images: ["/images/wilo/generated/audiovisual-set-v2.webp"],
  },
};

export default function AudiovisualPage() {
  return (
    <main className={`pr-page ${styles.page}`} id="contenido">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />

      <AudiovisualScene />

      <section className={styles.formatRail} aria-label="Formatos de producción audiovisual">
        <div className={styles.shell}>
          <span><Camera aria-hidden="true" /> Foto corporativa</span>
          <span><Clapperboard aria-hidden="true" /> Video profesional</span>
          <span><Plane aria-hidden="true" /> Tomas aéreas</span>
          <span><Aperture aria-hidden="true" /> Contenido de marca</span>
        </div>
      </section>

      <section className={styles.statementSection} aria-labelledby="audiovisual-statement">
        <div className={styles.shell}>
          <span className={styles.kicker}><b>01</b> Dirección visual</span>
          <div className={styles.statementGrid}>
            <h2 id="audiovisual-statement">Contenido que no solo se ve bien: <em>comunica lo que hace valiosa a tu marca.</em></h2>
            <p>Definimos el objetivo, planificamos cada toma y reunimos producción y edición dentro de una misma propuesta. La cobertura final se ajusta al formato, locación y canales de publicación.</p>
          </div>
        </div>
      </section>

      <section className={styles.capabilitySection} id="capacidades" aria-labelledby="audiovisual-capacidades">
        <div className={styles.shell}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}><b>02</b> Capacidades</span>
              <h2 id="audiovisual-capacidades">Una producción completa, <em>sin piezas sueltas.</em></h2>
            </div>
            <p>Definimos cada alcance alrededor del objetivo real y dejamos los entregables por escrito antes de empezar.</p>
          </div>
          <div className={styles.capabilityGrid}>
            {capabilities.map(({ icon: Icon, items, number, text, title }) => (
              <article key={title}>
                <div className={styles.capabilityTop}><span>{number}</span><Icon aria-hidden="true" /></div>
                <h3>{title}</h3>
                <p>{text}</p>
                <ul>
                  {items.map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.processSection} id="proceso" aria-labelledby="audiovisual-proceso">
        <div className={styles.shell}>
          <div className={styles.processIntro}>
            <span className={styles.kicker}><b>03</b> Método de producción</span>
            <h2 id="audiovisual-proceso">Claridad antes, durante y después de cada toma.</h2>
            <p>Un recorrido ordenado mantiene alineados a tu equipo y al nuestro, desde el objetivo hasta la entrega.</p>
          </div>
          <ol className={styles.processTimeline}>
            {process.map((step) => (
              <li key={step.number}>
                <span>{step.number}</span>
                <div><h3>{step.title}</h3><p>{step.text}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <RouteCta
        message="Hola Wilo Studio, quiero cotizar una producción de foto, video o drone."
        text="Cuéntanos qué necesitas, dónde se realizará y en qué canales quieres publicar el contenido."
        title="Haz que tu marca se vea tan profesional como lo que ofrece."
      />
      <HomeSceneMotion />
    </main>
  );
}
