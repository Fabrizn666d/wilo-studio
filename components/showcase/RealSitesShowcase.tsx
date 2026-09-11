"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, Globe2, ShieldCheck, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { realSites, referenceSites, showcaseScreens, type RealSite } from "@/data/real-sites";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";
import styles from "./real-sites-showcase.module.css";

function SiteMark({ site }: { site: RealSite }) {
  return site.logo ? <Image src={site.logo} alt="" width={112} height={42} className={styles.siteLogo} /> : <span className={styles.initials}>{site.initials}</span>;
}

function SiteRow({ site, featured = false }: { site: RealSite; featured?: boolean }) {
  return (
    <a className={`${styles.siteRow} ${featured ? styles.featuredRow : ""}`} href={site.href} target="_blank" rel="noopener noreferrer">
      <span className={styles.mark}><SiteMark site={site} /></span>
      <span className={styles.siteCopy}><strong>{site.name}</strong><small>{site.category}</small><em>{site.displayUrl}</em></span>
      <span className={styles.external} aria-hidden="true"><ArrowUpRight /></span>
      <span className={styles.visuallyHidden}>Abrir {site.name} en una nueva pestaña</span>
    </a>
  );
}

export function RealSitesShowcase() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [pausedUntil, setPausedUntil] = useState(0);
  const dragStart = useRef<number | null>(null);
  const reducedMotion = useHydratedReducedMotion();

  const move = useCallback((step: number, interactive = true) => {
    setDirection(step);
    setActive((current) => (current + step + showcaseScreens.length) % showcaseScreens.length);
    if (interactive) setPausedUntil(Date.now() + 12000);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => {
      if (Date.now() >= pausedUntil) move(1, false);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [move, pausedUntil, reducedMotion]);

  return (
    <main id="contenido" className={styles.page}>
      <div className={styles.orbOne} aria-hidden="true" />
      <div className={styles.orbTwo} aria-hidden="true" />
      <section className={styles.layout} aria-labelledby="showcase-title">
        <header className={styles.intro}>
          <span className={styles.eyebrow}><Globe2 /> Proyectos reales</span>
          <h1 id="showcase-title">Sitios web <span>reales</span></h1>
          <p>Explora proyectos, plataformas y tiendas activas desarrolladas para marcas reales.</p>
        </header>

        <section className={styles.projects} aria-labelledby="real-projects-title">
          <h2 id="real-projects-title">Proyectos activos</h2>
          <div className={styles.siteList}>{realSites.map((site, index) => <SiteRow key={site.href} site={site} featured={index === 0} />)}</div>
          <div className={styles.proof}>
            <span><ShieldCheck /><b>Proyectos reales</b><small>y activos</small></span>
            <span><Users /><b>Marcas que</b><small>confían en nosotros</small></span>
            <span><BarChart3 /><b>Más que diseños,</b><small>negocios en línea</small></span>
          </div>
        </section>

        <section className={styles.references} aria-labelledby="references-title">
          <div><span className={styles.miniEyebrow}>Más trabajos</span><h2 id="references-title">Referencias adicionales</h2></div>
          <div className={styles.referenceGrid}>{referenceSites.map((site) => <SiteRow key={site.href} site={site} />)}</div>
        </section>

        <section className={styles.phoneStage} aria-label="Carrusel visual de proyectos">
          <p className={styles.handNote}>Ideas reales.<br />Resultados reales.</p>
          <div
            className={styles.phone}
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") move(-1);
              if (event.key === "ArrowRight") move(1);
            }}
            onPointerDown={(event) => { dragStart.current = event.clientX; }}
            onPointerUp={(event) => {
              if (dragStart.current === null) return;
              const delta = event.clientX - dragStart.current;
              if (Math.abs(delta) > 42) move(delta > 0 ? -1 : 1);
              dragStart.current = null;
            }}
            aria-roledescription="carrusel"
          >
            <span className={styles.phoneSpeaker} aria-hidden="true" />
            <div className={styles.screen}>
              <div key={`${active}-${direction}`} className={direction > 0 ? styles.screenNext : styles.screenPrevious}>
                <Image src={showcaseScreens[active].src} alt={`Vista del sitio ${showcaseScreens[active].name}`} fill priority={active === 0} sizes="(max-width: 760px) 78vw, 34vw" />
              </div>
            </div>
            <span className={styles.homeBar} aria-hidden="true" />
          </div>
          <div className={styles.phoneShadow} aria-hidden="true" />
          <div className={styles.carouselNav}>
            <span className={styles.counter}>{String(active + 1).padStart(2, "0")} <i>/</i> {String(showcaseScreens.length).padStart(2, "0")}</span>
            <div className={styles.arrows}>
              <button type="button" onClick={() => move(-1)} aria-label="Proyecto anterior"><ArrowLeft /></button>
              <button type="button" onClick={() => move(1)} aria-label="Proyecto siguiente"><ArrowRight /></button>
            </div>
            <small>{showcaseScreens[active].name}</small>
          </div>
        </section>
      </section>
    </main>
  );
}
