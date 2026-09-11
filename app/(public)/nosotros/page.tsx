import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Compass, Globe2, Layers3, Lightbulb, MapPin, MoveUpRight, Sparkles } from "lucide-react";
import { aboutWilo } from "@/data/studio";
import { getPublicSiteSettings } from "@/lib/site-settings";
import styles from "./nosotros.module.css";

export const metadata: Metadata = {
  title: "Nosotros | Wilo Studio desde Arequipa",
  description: "Conoce el origen y la forma de pensar de Wilo Studio: tecnología, diseño y producción construidos desde Arequipa para cualquier lugar.",
  alternates: { canonical: "/nosotros" },
  openGraph: {
    title: "Nosotros | Wilo Studio",
    description: "Somos de Arequipa. Construimos para cualquier lugar.",
    url: "/nosotros",
    images: [{ url: "/images/wilo/generated/about-arequipa-v2.webp", width: 1920, height: 640, alt: "Arequipa y el Misti, origen de Wilo Studio" }],
  },
};

const principles = [
  { icon: Compass, number: "01", title: "Entender antes de diseñar", text: "Leemos el negocio, el contexto y a las personas antes de elegir una solución." },
  { icon: Lightbulb, number: "02", title: "Convertir ideas en sistemas", text: "Unimos estrategia, diseño y tecnología para que cada parte tenga una razón." },
  { icon: Layers3, number: "03", title: "Construir sin plantillas", text: "La solución se adapta al proyecto; el proyecto no se fuerza dentro de una fórmula." },
  { icon: MoveUpRight, number: "04", title: "Dejar espacio para crecer", text: "Entregamos una base clara, mantenible y preparada para evolucionar." },
] as const;

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getPublicSiteSettings();
  return (
    <main id="contenido" className={`pr-page ${styles.page}`}>
      <section className={styles.origin} aria-labelledby="about-origin-title">
        <Image className={styles.originImage} src="/images/wilo/generated/about-arequipa-v2.webp" alt="" aria-hidden="true" fill priority sizes="100vw" />
        <div className={styles.originVeil} aria-hidden="true" />
        <div className={styles.shell}>
          <div className={styles.originCopy}>
            <p className={styles.kicker}><span>01</span><i /> NUESTRO ORIGEN</p>
            <h1 id="about-origin-title">SOMOS DE <em>AREQUIPA.</em><small>Construimos para cualquier lugar.</small></h1>
            <p>{aboutWilo.story}</p>
            <div className={styles.actions}>
              <Link className={styles.primaryAction} href="/contacto">Iniciar un proyecto <ArrowRight aria-hidden="true" /></Link>
              <Link className={styles.textAction} href="/proyectos">Ver proyectos <ArrowUpRight aria-hidden="true" /></Link>
            </div>
          </div>
          <aside className={styles.originStamp}>
            <MapPin aria-hidden="true" /><span>16.4090° S · 71.5375° W</span><strong>AREQUIPA<br />PERÚ</strong><small>El punto de partida.</small>
          </aside>
          <p className={styles.originNote}>Las buenas ideas<br />también tienen origen.<i /></p>
        </div>
      </section>

      <section className={styles.thinking} aria-labelledby="about-thinking-title">
        <div className={styles.shell}>
          <header className={styles.thinkingHeading}>
            <p className={styles.kicker}><span>02</span><i /> CÓMO PENSAMOS</p>
            <h2 id="about-thinking-title">NO SOMOS UNA FÁBRICA DE WEBS.<br /><em>SOMOS UN ESTUDIO DE SOLUCIONES.</em></h2>
            <p>La tecnología es una herramienta. El criterio, la curiosidad y el trabajo cercano son lo que convierte una idea en algo útil.</p>
          </header>
          <div className={styles.thinkingStage} aria-hidden="true">
            <span className={styles.orbitOne} /><span className={styles.orbitTwo} /><span className={styles.thinkingW}>W</span>
            <Image src="/brand/wilo-mascot-cutout.webp" alt="" fill sizes="(max-width: 760px) 90vw, 42vw" />
            <p>Adaptarnos<br />sin perder<br />la esencia.<i /></p>
          </div>
          <ol className={styles.principles}>
            {principles.map(({ icon: Icon, number, title, text }) => <li key={title}><span>{number}</span><Icon aria-hidden="true" /><div><h3>{title}</h3><p>{text}</p></div></li>)}
          </ol>
        </div>
      </section>

      <section className={styles.structure} aria-labelledby="about-structure-title">
        <div className={styles.shell}>
          <header className={styles.structureHeading}>
            <p className={styles.kicker}><span>03</span><i /> UNA ESTRUCTURA, DOS ORILLAS</p>
            <h2 id="about-structure-title">RAÍCES EN PERÚ.<br /><em>ALCANCE INTERNACIONAL.</em></h2>
            <p>Una misma forma de trabajar, preparada para atender proyectos locales y coordinar oportunidades fuera del país.</p>
          </header>
          <div className={styles.routeMap} aria-hidden="true"><span className={styles.peruPoint}>AQP</span><i /><span className={styles.usaPoint}>USA</span><Globe2 /></div>
          <div className={styles.entityRail}>
            <article><Image src="/flags/pe.svg" alt="Bandera de Perú" width={62} height={42} /><div><span>OPERACIÓN LOCAL</span><h3>{settings.legalName}</h3><p>Arequipa, Perú · Facturación peruana</p></div><strong>PE</strong></article>
            <article><Image src="/flags/us.svg" alt="Bandera de Estados Unidos" width={62} height={42} /><div><span>ESTRUCTURA INTERNACIONAL</span><h3>WILO GLOBAL INDUSTRIES LLC</h3><p>United States · International business</p></div><strong>US</strong></article>
          </div>
          <p className={styles.structureNote}>Un mismo propósito.<br />Distintas coordenadas.<i /></p>
        </div>
      </section>

      <section className={styles.manifesto} aria-labelledby="about-manifesto-title">
        <div className={styles.manifestoGlow} aria-hidden="true" />
        <div className={styles.shell}>
          <div className={styles.manifestoCopy}>
            <p className={styles.kicker}><span>04</span><i /> LO QUE NOS MUEVE</p>
            <h2 id="about-manifesto-title">BUENAS IDEAS.<br />TRABAJO REAL.<br /><em>RESULTADOS QUE SÍ SE USAN.</em></h2>
            <p>No prometemos fórmulas universales. Escuchamos, diseñamos y construimos contigo una respuesta que tenga sentido.</p>
            <div className={styles.manifestoActions}><Link href="/cotizar">Cuéntanos tu idea <ArrowRight aria-hidden="true" /></Link><Link href="/proyectos">Explorar nuestro trabajo <ArrowUpRight aria-hidden="true" /></Link></div>
            <small>{settings.legalName} · RUC {settings.ruc}</small>
          </div>
          <div className={styles.manifestoVisual}>
            <Sparkles aria-hidden="true" /><Image src="/images/wilo/closing/contact-mascot.webp" alt="Camaleón de Wilo Studio listo para construir una nueva idea" fill sizes="(max-width: 760px) 94vw, 48vw" /><p>¿Qué construimos<br />ahora?<i /></p>
          </div>
        </div>
      </section>
    </main>
  );
}
