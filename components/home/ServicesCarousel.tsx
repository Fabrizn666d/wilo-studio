"use client";

import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Clapperboard,
  CloudCog,
  CodeXml,
  Gauge,
  Globe2,
  Hand,
  Headphones,
  Infinity as InfinityIcon,
  Mail,
  Palette,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { serviceShowcaseItems, type ServiceShowcaseItem } from "@/data/services-showcase";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";
import { CarouselFrame, FullBleedSection, ViewportFrame } from "./HomeLayout";
import styles from "./services-carousel.module.css";

const serviceIcons: Record<string, LucideIcon> = {
  "webs-corporativas": Globe2,
  "tiendas-catalogos": ShoppingBag,
  "plataformas-sistemas": CodeXml,
  "cotizadores-configuradores": SlidersHorizontal,
  "automatizacion-apis": CloudCog,
  "identidad-diseno": Palette,
  "produccion-audiovisual": Clapperboard,
  "infraestructura-digital": Gauge,
  "correos-corporativos": Mail,
  "soporte-evolucion": Headphones,
};

function ServiceCard({ item, active, onActivate }: { item: ServiceShowcaseItem; active: boolean; onActivate: () => void }) {
  const Icon = serviceIcons[item.slug] ?? Sparkles;
  const cardStyle = {
    "--service-color": item.color,
    "--service-rgb": item.rgb,
  } as CSSProperties;

  return (
    <article className={styles.slide} data-active={active} data-service={item.slug} style={cardStyle}>
      <Link
        aria-label={`Explorar servicio: ${item.shortName}`}
        className={styles.card}
        href={`/servicios/${item.slug}`}
        onFocus={onActivate}
        onMouseEnter={onActivate}
      >
        <div className={styles.cardHeader}>
          <span>{item.number}</span>
          <Icon aria-hidden="true" strokeWidth={1.65} />
        </div>
        <h3>{item.name}</h3>
        <div className={styles.visual} data-service={item.slug}>
          <Image
            alt={item.imageAlt}
            fill
            loading={item.number === "01" || item.number === "02" ? "eager" : "lazy"}
            sizes="(max-width: 640px) 82vw, (max-width: 1024px) 34vw, 330px"
            src={item.image}
          />
          <span className={styles.visualGlow} aria-hidden="true" />
        </div>
        <span className={styles.cardCta}>Explorar servicio <ArrowUpRight aria-hidden="true" /></span>
      </Link>
    </article>
  );
}

export function ServicesCarousel() {
  const reducedMotion = useHydratedReducedMotion();
  const [viewportRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    loop: true,
    skipSnaps: false,
    watchDrag: true,
  });
  const [activeIndex, setActiveIndex] = useState(3);
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = serviceShowcaseItems[activeIndex] ?? serviceShowcaseItems[0];

  const syncSelection = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const registerInteraction = useCallback(() => {
    setPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), 5000);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", syncSelection);
    emblaApi.on("reInit", syncSelection);
    emblaApi.scrollTo(3, true);
    syncSelection();
    return () => {
      emblaApi.off("select", syncSelection);
      emblaApi.off("reInit", syncSelection);
    };
  }, [emblaApi, syncSelection]);

  useEffect(() => {
    if (!emblaApi || paused || reducedMotion) return;
    const timer = window.setInterval(() => emblaApi.scrollNext(), 6200);
    return () => window.clearInterval(timer);
  }, [emblaApi, paused, reducedMotion]);

  useEffect(() => () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  }, []);

  const goPrevious = () => {
    registerInteraction();
    emblaApi?.scrollPrev();
  };
  const goNext = () => {
    registerInteraction();
    emblaApi?.scrollNext();
  };

  return (
    <FullBleedSection
      aria-labelledby="capabilities-title"
      className={styles.section}
      id="servicios"
      spacing="scene"
      style={{ "--active-rgb": active.rgb } as CSSProperties}
    >
      <div className={styles.halo} aria-hidden="true" />
      <ViewportFrame>
        <motion.header
          className={styles.header}
          initial={false}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ amount: 0.45, once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <span className={styles.eyebrow}><i />04 · SERVICIOS</span>
          <h2 id="capabilities-title">TODO LO QUE<br />PODEMOS <em>CONSTRUIR.</em></h2>
          <p>Soluciones digitales a medida que combinan estrategia, diseño y tecnología para <strong>impulsar negocios reales.</strong></p>
        </motion.header>
      </ViewportFrame>

      <CarouselFrame edge="wide">
        <motion.div
          className={styles.carouselStage}
          initial={false}
          transition={{ delay: 0.08, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ amount: 0.18, once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <button className={`${styles.arrow} ${styles.previous}`} onClick={goPrevious} type="button" aria-label="Ver servicio anterior"><ArrowLeft aria-hidden="true" /></button>
          <div
            aria-label="Servicios de Wilo Studio"
            aria-roledescription="carrusel"
            className={styles.viewport}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
            }}
            onFocus={() => setPaused(true)}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") { event.preventDefault(); goPrevious(); }
              if (event.key === "ArrowRight") { event.preventDefault(); goNext(); }
            }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onPointerDown={registerInteraction}
            ref={viewportRef}
            role="region"
            tabIndex={0}
          >
            <div className={styles.container}>
              {serviceShowcaseItems.map((item, index) => (
                <ServiceCard
                  active={index === activeIndex}
                  item={item}
                  key={item.slug}
                  onActivate={() => {
                    setPaused(true);
                    emblaApi?.scrollTo(index);
                  }}
                />
              ))}
            </div>
          </div>
          <button className={`${styles.arrow} ${styles.next}`} onClick={goNext} type="button" aria-label="Ver siguiente servicio"><ArrowRight aria-hidden="true" /></button>
        </motion.div>
      </CarouselFrame>

      <ViewportFrame>
        <div className={styles.carouselMeta}>
          <span><Hand aria-hidden="true" /> ARRASTRA PARA EXPLORAR</span>
          <div><i /><strong>{String(activeIndex + 1).padStart(2, "0")}</strong><b>—</b><strong>10</strong><i /></div>
          <span>DESPLAZAMIENTO INFINITO <InfinityIcon aria-hidden="true" /></span>
        </div>

        <p className={styles.srStatus} aria-live="polite">Servicio {activeIndex + 1} de 10: {active.shortName}</p>
      </ViewportFrame>
    </FullBleedSection>
  );
}
