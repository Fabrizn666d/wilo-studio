import type { Metadata } from "next";
import { EcosystemExplorer } from "@/components/home/EcosystemExplorer";
import { AboutWiloShowcase } from "@/components/home/AboutWiloShowcase";
import { HeroWilo } from "@/components/home/HeroWilo";
import { CarouselFrame, FullBleedSection, SectionShell, ViewportFrame } from "@/components/home/HomeLayout";
import { HomeSceneMotion } from "@/components/home/HomeSceneMotion";
import { ProcessJourney } from "@/components/home/ProcessJourney";
import { ServicesCarousel } from "@/components/home/ServicesCarousel";
import { StudioCarousel } from "@/components/home/StudioCarousel";
import { TechnologyScene } from "@/components/home/TechnologyScene";
import { InternationalScene } from "@/components/home/InternationalScene";
import { ContactScene } from "@/components/home/ContactScene";
import { ecosystemLines, processSteps } from "@/data/studio";
import { getPublicSiteSettings } from "@/lib/site-settings";
import { getStudioProjects } from "@/lib/studio-projects";
import styles from "./studio-home.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wilo Studio | Soluciones digitales, sistemas y producción",
  description: "Wilo Studio construye webs, e-commerce, plataformas, sistemas, aplicaciones, automatización y producción audiovisual desde Perú.",
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

export default async function HomePage() {
  const [settings, studioProjects] = await Promise.all([getPublicSiteSettings(), getStudioProjects()]);
  const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", name: "Wilo Studio", url: settings.url, inLanguage: "es-PE" };
  return (
    <main id="contenido" className={styles.page}>
      <HeroWilo />
      <AboutWiloShowcase />
      <FullBleedSection className={styles.workSection} id="trabajos" aria-labelledby="work-title" spacing="scene">
        <div className={styles.workArcades} aria-hidden="true" />
        <div className={styles.workEditorialLabel} data-reveal="detail" aria-hidden="true">
          <span>IDEAS</span><span>TECNOLOGÍA</span><span>MARCAS REALES</span><i />
        </div>
        <p className={`${styles.workNote} ${styles.workNoteTop}`} data-reveal="detail" aria-hidden="true">
          Desde<br />Arequipa<br />para el mundo<i />
        </p>
        <p className={`${styles.workNote} ${styles.workNoteLeft}`} data-reveal="detail" aria-hidden="true">
          Arequipa<br />inspira<br />grandes<br />ideas<i />
        </p>
        <p className={`${styles.workNote} ${styles.workNoteRight}`} data-reveal="detail" aria-hidden="true">
          Marcas<br />que no se detienen<i />
        </p>
        <ViewportFrame>
          <header className={styles.stageHeader}>
            <h2 id="work-title" data-reveal="heading">TRABAJOS <em>EN MOVIMIENTO</em></h2>
            <p data-reveal="copy">Sitios web reales para <em>marcas que no se detienen.</em></p>
          </header>
        </ViewportFrame>
        <CarouselFrame className={styles.workCarouselFrame} edge="wide" data-reveal="media">
          <StudioCarousel projects={studioProjects.slice(0, 6)} />
        </CarouselFrame>
      </FullBleedSection>
      <ServicesCarousel />
      <ProcessJourney steps={processSteps} />
      <TechnologyScene />
      <SectionShell className={styles.ecosystemSection} frame="wide" id="ecosistema" aria-labelledby="ecosystem-title" spacing="compact">
        <EcosystemExplorer lines={ecosystemLines} />
      </SectionShell>
      <InternationalScene />
      <ContactScene settings={settings} />
      <HomeSceneMotion />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c") }} />
    </main>
  );
}
