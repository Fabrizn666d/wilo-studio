import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  AudioLines,
  Camera,
  Lightbulb,
  Monitor,
  PanelsTopLeft,
  Plane,
  Zap,
} from "lucide-react";
import { EcosystemLeadForm } from "@/components/public-routes/ecosystem-lead-form";
import { AudiovisualScene } from "@/components/home/AudiovisualScene";
import { HomeSceneMotion } from "@/components/home/HomeSceneMotion";
import { siteConfig } from "@/lib/content";
import styles from "./events-cinematic.module.css";

const offerings = [
  { number: "01", title: "Foto y video", text: "Cobertura audiovisual para registrar y comunicar el evento.", icon: Camera, group: "Imagen" },
  { number: "02", title: "Drones", text: "Tomas aéreas integradas a la cobertura audiovisual.", icon: Plane, group: "Imagen" },
  { number: "03", title: "Pantallas LED y TV", text: "Superficies visuales para mostrar contenido durante el evento.", icon: Monitor, group: "Visual" },
  { number: "04", title: "Audio", text: "Solución de sonido definida según las necesidades del evento.", icon: AudioLines, group: "Ambiente" },
  { number: "05", title: "Iluminación", text: "Iluminación incorporada al planteamiento técnico de la producción.", icon: Lightbulb, group: "Ambiente" },
  { number: "06", title: "Escenarios", text: "Estructura escénica considerada dentro del alcance coordinado.", icon: PanelsTopLeft, group: "Infraestructura" },
  { number: "07", title: "Energía", text: "Energía para sostener los componentes incluidos en la propuesta.", icon: Zap, group: "Infraestructura" },
] as const;

const groups = [
  { label: "Imagen", items: "Foto, video y drones" },
  { label: "Visual", items: "Pantallas LED y TV" },
  { label: "Ambiente", items: "Audio e iluminación" },
  { label: "Infraestructura", items: "Escenarios y energía" },
] as const;

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
    { "@type": "ListItem", position: 2, name: "Eventos", item: `${siteConfig.url}/events` },
  ],
};

export const metadata: Metadata = {
  title: "Eventos | Producción audiovisual e infraestructura",
  description:
    "Foto, video, drones, pantallas LED y TV, audio, iluminación, escenarios y energía para eventos con Wilo Studio.",
  keywords: ["producción para eventos", "pantallas LED para eventos", "audio e iluminación para eventos", "foto y video para eventos"],
  alternates: { canonical: "/events" },
  openGraph: {
    title: "Eventos | Wilo Studio",
    description: "Producción audiovisual e infraestructura técnica reunidas para tu evento.",
    url: "/events",
    type: "website",
    images: [{ url: "/images/wilo/generated/events-stage-v2.webp", alt: "Escenario preparado para un evento corporativo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventos | Wilo Studio",
    description: "Imagen, audio, iluminación, escenarios y energía para eventos.",
    images: ["/images/wilo/generated/events-stage-v2.webp"],
  },
};

export default function EventsBridgePage() {
  return (
    <main className={`pr-page ${styles.page}`} id="contenido">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />

      <AudiovisualScene />

      <section className={styles.offeringSection} id="capacidades" aria-labelledby="events-servicios">
        <div className={styles.shell}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}><b>01</b> Producción coordinada</span>
              <h2 id="events-servicios">Todo lo necesario para poner el evento <em>en escena.</em></h2>
            </div>
            <p>Selecciona una línea o combina varias según el evento que estás preparando. El alcance final queda documentado en la propuesta.</p>
          </div>

          <div className={styles.offeringGrid}>
            {offerings.map(({ icon: Icon, number, title, text, group }) => (
              <article key={title}>
                <div className={styles.cardTop}><span>{number}</span><Icon aria-hidden="true" /></div>
                <div><small>{group}</small><h3>{title}</h3><p>{text}</p></div>
                <i className={styles.cardSignal} aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.coordinationSection} aria-labelledby="events-coordinacion">
        <div className={styles.coordinationVisual} aria-hidden="true">
          <span>WILO</span>
          <i /><i /><i />
        </div>
        <div className={styles.shell}>
          <div className={styles.coordinationCopy}>
            <span className={styles.kicker}><b>02</b> Una solicitud, varias líneas</span>
            <h2 id="events-coordinacion">El contexto primero. La combinación técnica, después.</h2>
            <p>La fecha, la sede y los servicios elegidos nos permiten entender el requerimiento antes de responder.</p>
            <a href="#cotizar">Empezar solicitud <ArrowDown aria-hidden="true" /></a>
          </div>
          <div className={styles.groupList}>
            {groups.map((group, index) => (
              <div key={group.label}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{group.label}</strong>
                <p>{group.items}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.formSection} id="cotizar" aria-labelledby="events-cotizar">
        <div className={styles.shell}>
          <div className={styles.formIntro}>
            <span className={styles.kicker}><b>03</b> Hablemos del evento</span>
            <h2 id="events-cotizar">Empecemos por los datos que sí conoces.</h2>
            <p>No necesitas tener todo resuelto. Indica una fecha y sede tentativas, marca las líneas que necesitas y comparte el contexto disponible.</p>
            <div className={styles.formLegend}>
              <span><i /> Datos obligatorios</span>
              <span><i /> Selección múltiple</span>
              <span><i /> Respuesta por tus datos de contacto</span>
            </div>
          </div>
          <EcosystemLeadForm source="events-ecosystem-bridge" />
        </div>
      </section>

      <section className={styles.detailSection} aria-label="Más información sobre infraestructura para eventos">
        <div className={styles.shell}>
          <span>¿Quieres revisar primero el alcance de infraestructura?</span>
          <Link href="/servicios/infraestructura-eventos">Ver la página del servicio <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>
      <HomeSceneMotion />
    </main>
  );
}
