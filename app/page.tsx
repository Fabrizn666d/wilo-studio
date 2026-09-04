import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, MapPin, MessageCircle } from "lucide-react";
import { EcosystemExplorer } from "@/components/home/EcosystemExplorer";
import { HeroWilo } from "@/components/home/HeroWilo";
import { CarouselFrame, FullBleedSection, SectionShell, ViewportFrame } from "@/components/home/HomeLayout";
import { LabExplorer } from "@/components/home/LabExplorer";
import { ProcessJourney } from "@/components/home/ProcessJourney";
import { ServicesCarousel } from "@/components/home/ServicesCarousel";
import { StudioCarousel } from "@/components/home/StudioCarousel";
import {
  aboutWilo,
  audiovisualServices,
  ecosystemLines,
  labModules,
  processSteps,
  trustStatements,
} from "@/data/studio";
import { getPublicSiteSettings } from "@/lib/site-settings";
import { getStudioProjects } from "@/lib/studio-projects";
import styles from "./studio-home.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wilo Studio | Soluciones digitales, sistemas y producción",
  description:
    "Wilo Studio construye webs, e-commerce, plataformas, sistemas, aplicaciones, automatización y producción audiovisual desde Perú.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Wilo Studio — Diseño, tecnología y producción",
    description: "Soluciones digitales a medida, proyectos reales y un ecosistema para empresas e instituciones.",
    url: "/",
    images: [{ url: "/images/wilo/hero/misti.webp", width: 1672, height: 941, alt: "Wilo Studio en Arequipa, Perú" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wilo Studio",
    description: "Diseño, tecnología y producción para construir soluciones que funcionan.",
    images: ["/images/wilo/hero/misti.webp"],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Wilo Studio",
  url: "https://wilostudio.site",
  inLanguage: "es-PE",
};

export default async function HomePage() {
  const [settings, studioProjects] = await Promise.all([getPublicSiteSettings(), getStudioProjects()]);
  const whatsappUrl = `https://wa.me/${settings.phone}?text=${encodeURIComponent("Hola Wilo Studio, quiero conversar sobre un proyecto.")}`;

  return (
    <main id="contenido" className={styles.page}>
      <HeroWilo />

      <FullBleedSection className={styles.workSection} id="trabajos" aria-labelledby="work-title" spacing="scene">
        <ViewportFrame>
          <header className={styles.stageHeader}>
            <span><i />02<i /> TRABAJOS EN MOVIMIENTO</span>
            <h2 id="work-title">Trabajos en movimiento</h2>
            <p>Sitios web reales para <em>marcas que no se detienen.</em></p>
          </header>
        </ViewportFrame>
        <CarouselFrame className={styles.workCarouselFrame} edge="wide">
          <StudioCarousel projects={studioProjects} />
        </CarouselFrame>
      </FullBleedSection>

      <ServicesCarousel />

      <SectionShell className={styles.labSection} frame="wide" id="lab" aria-labelledby="lab-title">
        <h2 className={styles.srOnly} id="lab-title">Wilo Lab</h2>
        <LabExplorer modules={labModules} />
      </SectionShell>

      <FullBleedSection className={styles.audiovisualSection} id="audiovisual" aria-labelledby="audiovisual-title" spacing="scene">
        <div className={styles.audiovisualBackdrop} aria-hidden="true">
          <Image src="/images/wilo/generated/audiovisual-set-v2.webp" alt="" fill sizes="100vw" />
        </div>
        <div className={styles.audiovisualShade} aria-hidden="true" />
        <ViewportFrame size="wide">
          <div className={styles.audiovisualLayout}>
            <div className={styles.audiovisualCopy}>
              <span className={styles.eyebrow}>PRODUCCIÓN AUDIOVISUAL</span>
              <h2 id="audiovisual-title">Historias que <em>conectan marcas.</em></h2>
              <p>Producción audiovisual profesional para empresas que quieren comunicar, presentar y vender con una dirección coherente.</p>
              <Link href="/servicios/produccion-audiovisual">Ver trabajos <ArrowUpRight aria-hidden="true" /></Link>
            </div>
            <div className={styles.audiovisualFocus} aria-hidden="true"><span>REC</span><i /><i /><i /><i /></div>
            <ul className={styles.audiovisualAudience}>
              <li><span>01</span><strong>Empresas<br />y marcas</strong></li>
              <li><span>02</span><strong>Eventos<br />corporativos</strong></li>
              <li><span>03</span><strong>Productos<br />y servicios</strong></li>
            </ul>
          </div>
          <ul className={styles.audiovisualServices}>{audiovisualServices.map((service, index) => <li key={service}><span>{String(index + 1).padStart(2, "0")}</span>{service}</li>)}</ul>
        </ViewportFrame>
      </FullBleedSection>

      <ProcessJourney steps={processSteps} />

      <SectionShell className={styles.trustSection} frame="wide" id="confianza" aria-labelledby="trust-title" spacing="compact">
        <div className={styles.trustScene}>
          <div className={styles.trustIntro}>
            <span className={styles.eyebrow}>06 · CÓMO TRABAJAMOS</span>
            <h2 id="trust-title">Confianza sin cifras <em>inventadas.</em></h2>
            <p>Preferimos explicar qué sostiene el trabajo antes que llenar la página con métricas no verificadas.</p>
          </div>
          <div className={styles.trustGrid}>
            {trustStatements.map((item, index) => <article key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}
          </div>
        </div>
      </SectionShell>

      <SectionShell className={styles.ecosystemSection} frame="wide" id="ecosistema" aria-labelledby="ecosystem-title" spacing="compact">
        <EcosystemExplorer lines={ecosystemLines} />
      </SectionShell>

      <FullBleedSection className={styles.aboutSection} id="nosotros" aria-labelledby="about-title" spacing="scene">
        <div className={styles.aboutBackdrop} aria-hidden="true"><Image src="/images/wilo/generated/about-arequipa-v2.webp" alt="" fill sizes="100vw" /></div>
        <div className={styles.aboutShade} aria-hidden="true" />
        <ViewportFrame className={styles.aboutScene} size="wide">
          <div className={styles.aboutContent}>
            <span className={styles.eyebrow}>SOBRE WILO</span>
            <p>{aboutWilo.origin}</p>
            <h2 id="about-title">{aboutWilo.headline}</h2>
            <p className={styles.aboutStory}>{aboutWilo.story}</p>
            <div className={styles.missionGrid}>
              <article><span>MISIÓN</span><p>{aboutWilo.mission}</p></article>
              <article><span>VISIÓN</span><p>{aboutWilo.vision}</p></article>
            </div>
          </div>
          <ul className={styles.aboutValues}>{aboutWilo.values.map((value) => <li key={value}><Check aria-hidden="true" /><span>{value}</span></li>)}</ul>
        </ViewportFrame>
      </FullBleedSection>

      <FullBleedSection className={styles.finalCta} id="contacto-home" aria-labelledby="final-cta-title" spacing="compact">
        <span className={styles.giantMark} aria-hidden="true">W</span>
        <ViewportFrame className={styles.finalCtaScene} size="wide">
          <div>
            <span className={styles.eyebrow}>EL SIGUIENTE PASO</span>
            <h2 id="final-cta-title">¿Qué construimos ahora?</h2>
          </div>
          <div>
            <p>Cuéntanos el contexto. Te ayudaremos a convertirlo en una solución clara, útil y preparada para operar.</p>
            <div><Link href="/contacto" className={styles.darkButton}>Iniciar un proyecto <ArrowUpRight aria-hidden="true" /></Link><a href={whatsappUrl} target="_blank" rel="noreferrer" className={styles.lineDarkButton}>Hablar por WhatsApp <ArrowUpRight aria-hidden="true" /></a></div>
          </div>
          <div className={styles.contactStrip}>
            <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" /><span>WHATSAPP<strong>{settings.phoneDisplay}</strong></span></a>
            <span><MapPin aria-hidden="true" /><span>UBICACIÓN<strong>{settings.location}</strong></span></span>
            <span className={styles.contactClaim}><i aria-hidden="true">W</i><span>Wilo Studio<strong>Tecnología con propósito.</strong></span></span>
          </div>
        </ViewportFrame>
      </FullBleedSection>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c") }} />
    </main>
  );
}
