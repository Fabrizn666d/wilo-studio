import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Eye,
  Gauge,
  HeartHandshake,
  Layers3,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { RouteCta } from "@/components/public-routes/route-ui";
import { aboutWilo } from "@/data/studio";
import { getPublicSiteSettings } from "@/lib/site-settings";
import styles from "./nosotros.module.css";

export const metadata: Metadata = {
  title: "Nosotros | Wilo Studio desde Arequipa",
  description:
    "Conoce el origen, misión, visión y valores de Wilo Studio: tecnología, diseño, producción y educación construidos desde Arequipa, Perú.",
  alternates: { canonical: "/nosotros" },
  openGraph: {
    title: "Nosotros | Wilo Studio",
    description: "Somos de Arequipa. Construimos soluciones para cualquier lugar.",
    url: "/nosotros",
    images: [
      {
        url: "/images/wilo/generated/about-arequipa-v2.webp",
        width: 1920,
        height: 640,
        alt: "Composición visual inspirada en Arequipa y el Misti",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nosotros | Wilo Studio",
    description: "Tecnología y creatividad con origen en Arequipa.",
    images: ["/images/wilo/generated/about-arequipa-v2.webp"],
  },
};

const approach = [
  {
    icon: Compass,
    number: "01",
    title: "Partimos del contexto",
    text: "Antes de proponer una solución, entendemos el objetivo, las personas y las restricciones reales.",
  },
  {
    icon: Layers3,
    number: "02",
    title: "Ordenamos lo complejo",
    text: "Convertimos información, procesos y decisiones en una experiencia clara y utilizable.",
  },
  {
    icon: ShieldCheck,
    number: "03",
    title: "Construimos una base sólida",
    text: "Cuidamos estructura, accesibilidad, rendimiento y mantenimiento según el alcance del proyecto.",
  },
  {
    icon: Gauge,
    number: "04",
    title: "Dejamos espacio para evolucionar",
    text: "La entrega se prepara para que pueda mantenerse y crecer cuando el negocio lo necesite.",
  },
] as const;

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getPublicSiteSettings();

  return (
    <main id="contenido" className={`pr-page ${styles.page}`}>
      <header className={styles.hero}>
        <Image
          alt=""
          aria-hidden="true"
          className={styles.heroImage}
          fill
          priority
          sizes="100vw"
          src="/images/wilo/generated/about-arequipa-v2.webp"
        />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.shell}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>10 · Sobre Wilo</p>
            <h1>
              Somos de <em>Arequipa.</em>
              <span>Construimos para cualquier lugar.</span>
            </h1>
            <p>{aboutWilo.story}</p>
            <div className={styles.actions}>
              <Link className={styles.primaryButton} href="/contacto">
                Iniciar un proyecto <ArrowRight aria-hidden="true" />
              </Link>
              <Link className={styles.secondaryButton} href="/proyectos">
                Ver proyectos <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className={styles.locationCard}>
            <MapPin aria-hidden="true" />
            <div>
              <span>Origen</span>
              <strong>{aboutWilo.origin}</strong>
              <p>Identidad local y una forma de trabajo preparada para colaborar a distancia.</p>
            </div>
          </div>
          <p className={styles.imageCaption}>Composición visual inspirada en Arequipa y el Misti.</p>
        </div>
      </header>

      <section className={styles.storySection} aria-labelledby="about-story-title">
        <div className={styles.shell}>
          <div className={styles.storyIndex} aria-hidden="true">
            <span>W</span>
            <i />
          </div>
          <div className={styles.storyCopy}>
            <p className={styles.kicker}>01 · Nuestro origen</p>
            <h2 id="about-story-title">
              Tecnología y creatividad con un punto de partida <em>concreto.</em>
            </h2>
            <p>
              Wilo nace en Arequipa con una idea práctica: reunir distintas capacidades cuando un reto necesita más que una sola disciplina. La forma cambia con cada proyecto; el criterio se mantiene.
            </p>
          </div>
          <div className={styles.storyFacts} aria-label="Datos sobre Wilo Studio">
            <article>
              <span>Base</span>
              <strong>Arequipa, Perú</strong>
            </article>
            <article>
              <span>Trabajo</span>
              <strong>Tecnología, diseño y producción</strong>
            </article>
            <article>
              <span>Alcance</span>
              <strong>Proyectos coordinados en todo el Perú</strong>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.purposeSection} aria-labelledby="about-purpose-title">
        <div className={styles.shell}>
          <div className={styles.purposeHeading}>
            <p className={styles.kicker}>02 · Propósito</p>
            <h2 id="about-purpose-title">Una dirección compartida para todo el ecosistema.</h2>
            <p>La misión y la visión están escritas para orientar decisiones, no para llenar una presentación.</p>
          </div>

          <div className={styles.purposeGrid}>
            <article className={styles.missionCard}>
              <div>
                <HeartHandshake aria-hidden="true" />
                <span>01</span>
              </div>
              <p>Misión</p>
              <h3>{aboutWilo.mission}</h3>
            </article>
            <article className={styles.visionCard}>
              <div>
                <Eye aria-hidden="true" />
                <span>02</span>
              </div>
              <p>Visión</p>
              <h3>{aboutWilo.vision}</h3>
            </article>
          </div>

          <div className={styles.valuesBlock}>
            <div>
              <p className={styles.kicker}>03 · Valores</p>
              <h3>Principios para decidir y construir.</h3>
            </div>
            <ol>
              {aboutWilo.values.map((value, index) => (
                <li key={value}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{value}</strong>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className={styles.approachSection} aria-labelledby="about-approach-title">
        <div className={styles.shell}>
          <div className={styles.approachHeading}>
            <div>
              <p className={styles.kicker}>04 · Cómo trabajamos</p>
              <h2 id="about-approach-title">Adaptarnos no significa improvisar.</h2>
            </div>
            <p>
              La solución se ajusta al contexto, pero cada decisión conserva una razón clara y una base que se puede mantener.
            </p>
          </div>
          <div className={styles.approachGrid}>
            {approach.map(({ icon: Icon, number, title, text }) => (
              <article key={title}>
                <div>
                  <Icon aria-hidden="true" />
                  <span>{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.identitySection} aria-labelledby="about-identity-title">
        <div className={styles.shell}>
          <div className={styles.identityCard}>
            <div className={styles.identityCopy}>
              <p className={styles.kicker}>05 · Identidad</p>
              <h2 id="about-identity-title">Cambiar de enfoque sin perder la esencia.</h2>
              <p>
                El camaleón representa esa capacidad: leer el contexto de cada negocio, adaptarse al reto y conservar una identidad reconocible.
              </p>
              <div className={styles.legalCard}>
                <span>Titular</span>
                <strong>{settings.legalName}</strong>
                <small>
                  {settings.name} · RUC {settings.ruc}
                </small>
              </div>
            </div>
            <figure className={styles.mascotStage}>
              <span aria-hidden="true">W</span>
              <Image
                alt="Camaleón, personaje visual de Wilo Studio"
                fill
                sizes="(max-width: 820px) 92vw, 48vw"
                src="/brand/wilo-mascot-cutout.webp"
              />
            </figure>
          </div>
        </div>
        <Sparkles className={styles.identitySpark} aria-hidden="true" />
      </section>

      <RouteCta
        message="Hola Wilo Studio, quiero conversar sobre un proyecto."
        text="Cuéntanos qué necesitas resolver y te responderemos con una ruta clara para evaluar el proyecto."
        title="Construyamos algo que tenga sentido para tu negocio."
      />
    </main>
  );
}
