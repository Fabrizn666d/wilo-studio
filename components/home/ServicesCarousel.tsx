"use client";

import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { motion, type Variants } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesCombined,
  Database,
  Files,
  Globe2,
  Mail,
  MapPinned,
  MousePointerClick,
  Network,
  PanelsTopLeft,
  ReceiptText,
  ShoppingBag,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  UserRoundCog,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { serviceShowcaseItems, type ServiceShowcaseItem } from "@/data/services-showcase";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";
import { CarouselFrame, FullBleedSection, ViewportFrame } from "./HomeLayout";
import styles from "./services-carousel.module.css";
import { publicHref } from "@/lib/public-release";

const SERVICE_COUNT = serviceShowcaseItems.length;
const INITIAL_SERVICE = 3;

const serviceIcons: Record<string, LucideIcon> = {
  "webs-corporativas": Globe2,
  "landing-pages": MousePointerClick,
  "tiendas-catalogos-digitales": ShoppingBag,
  "apps-moviles": Smartphone,
  "sistemas-plataformas-medida": PanelsTopLeft,
  "crm-erp-saas": Database,
  "facturacion-electronica-pos": ReceiptText,
  "cotizadores-configuradores": SlidersHorizontal,
  "reservas-citas-turnos": CalendarDays,
  "tracking-logistica": MapPinned,
  "automatizacion-procesos": Workflow,
  "apis-sistemas-conectados": Network,
  "dashboards-bi-analitica": ChartNoAxesCombined,
  "inteligencia-artificial": Sparkles,
  "portales-clientes-autoservicio": UserRoundCog,
  "gestion-documental-firmas": Files,
  "correos-corporativos": Mail,
};

const headerVariants: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.08, staggerChildren: 0.13 } },
};

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } },
};

const carouselVariants: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.18, staggerChildren: 0.035 } },
};

const cardEntryVariants: Variants = {
  hidden: { opacity: 0.18, y: 28, scale: 0.985 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.56, ease: [0.22, 1, 0.36, 1] } },
};

function ServiceCard({
  item,
  active,
  onFocus,
}: {
  item: ServiceShowcaseItem;
  active: boolean;
  onFocus: () => void;
}) {
  const Icon = serviceIcons[item.slug] ?? Sparkles;
  const cardStyle = {
    "--service-color": item.color,
    "--service-rgb": item.rgb,
  } as CSSProperties;

  return (
    <article
      aria-label={`${item.number} de ${SERVICE_COUNT}: ${item.shortName}`}
      className={styles.slide}
      data-active={active}
      data-service={item.slug}
      role="group"
      style={cardStyle}
    >
      <motion.div className={styles.cardEntry} variants={cardEntryVariants}>
        <Link
          aria-label={`Cotizar solución: ${item.shortName}`}
          className={styles.card}
          href={publicHref("quote", `/cotizar?service=${item.slug}`)}
          onFocus={onFocus}
        >
          <div className={styles.cardHeader}>
            <span>{item.number}</span>
            <i aria-hidden="true"><Icon strokeWidth={1.65} /></i>
          </div>
          <h3>{item.name}</h3>
          <p className={styles.description}>{item.description}</p>
          <div className={styles.visual} data-service={item.slug}>
            <Image
              alt={item.imageAlt}
              fill
              loading={item.number === "03" || item.number === "04" || item.number === "05" ? "eager" : "lazy"}
              sizes="(max-width: 640px) 82vw, (max-width: 1100px) 32vw, 290px"
              src={item.image}
            />
            <span className={styles.visualGlow} aria-hidden="true" />
          </div>
          <span className={styles.cardCta}>Cotizar solución <ArrowUpRight aria-hidden="true" /></span>
        </Link>
      </motion.div>
    </article>
  );
}

export function ServicesCarousel() {
  const reducedMotion = useHydratedReducedMotion();
  const autoScroll = useRef(
    AutoScroll({
      direction: "forward",
      playOnInit: false,
      speed: 0.85,
      startDelay: 1200,
      stopOnFocusIn: false,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
    }),
  );
  const [viewportRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    duration: 36,
    loop: true,
    skipSnaps: false,
    watchDrag: true,
  }, [autoScroll.current]);
  const [activeIndex, setActiveIndex] = useState(INITIAL_SERVICE);
  const [sectionInView, setSectionInView] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const active = serviceShowcaseItems[activeIndex] ?? serviceShowcaseItems[0];

  const syncSelection = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const registerInteraction = useCallback(() => {
    emblaApi?.plugins().autoScroll?.reset();
  }, [emblaApi]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSectionInView(entry.isIntersecting && entry.intersectionRatio >= 0.3),
      { threshold: [0, 0.3, 0.55] },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", syncSelection);
    emblaApi.on("reInit", syncSelection);
    emblaApi.scrollTo(INITIAL_SERVICE, true);
    syncSelection();

    return () => {
      emblaApi.off("select", syncSelection);
      emblaApi.off("reInit", syncSelection);
    };
  }, [emblaApi, syncSelection]);

  useEffect(() => {
    if (!emblaApi) return;
    const plugin = emblaApi.plugins().autoScroll;
    if (sectionInView) plugin?.play(600);
    else plugin?.stop();
    return () => plugin?.stop();
  }, [emblaApi, sectionInView]);

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
      ref={sectionRef}
      spacing="scene"
      style={{ "--active-rgb": active.rgb } as CSSProperties}
    >
      <div className={styles.ambient} aria-hidden="true">
        <i /><i /><i /><i />
      </div>
      <div className={styles.halo} aria-hidden="true" />

      <ViewportFrame size="wide">
        <motion.header
          className={styles.header}
          initial={reducedMotion ? false : "hidden"}
          variants={headerVariants}
          viewport={{ amount: 0.35, once: true }}
          whileInView="visible"
        >
          <motion.span className={styles.eyebrow} variants={revealVariants}><i />04 · SERVICIOS</motion.span>
          <div className={styles.titleMask}>
            <motion.h2 id="capabilities-title" variants={revealVariants}>
              TODO LO QUE<br />PODEMOS <em>CONSTRUIR.</em>
            </motion.h2>
          </div>
          <motion.p variants={revealVariants}>
            Soluciones digitales a medida que combinan estrategia, diseño y tecnología<br className={styles.desktopBreak} /> para <strong>impulsar negocios reales.</strong>
          </motion.p>
        </motion.header>
      </ViewportFrame>

      <CarouselFrame edge="wide">
        <motion.div
          className={styles.carouselStage}
          initial={reducedMotion ? false : "hidden"}
          variants={carouselVariants}
          viewport={{ amount: 0.12, once: true }}
          whileInView="visible"
        >
          <div
            aria-label="Catálogo de servicios digitales de Wilo Studio"
            aria-roledescription="carrusel"
            className={styles.viewport}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") { event.preventDefault(); goPrevious(); }
              if (event.key === "ArrowRight") { event.preventDefault(); goNext(); }
            }}
            ref={viewportRef}
            role="region"
            tabIndex={0}
          >
            <motion.div className={styles.container} variants={carouselVariants}>
              {serviceShowcaseItems.map((item, index) => (
                <ServiceCard
                  active={index === activeIndex}
                  item={item}
                  key={item.slug}
                  onFocus={() => {
                    registerInteraction();
                    emblaApi?.scrollTo(index);
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </CarouselFrame>

      <ViewportFrame>
        <motion.nav
          aria-label="Navegación del catálogo de servicios"
          className={styles.carouselMeta}
          initial={false}
        >
          <button onClick={goPrevious} type="button" aria-label="Ver servicio anterior"><ArrowLeft aria-hidden="true" /></button>
          <span className={styles.progress} aria-hidden="true"><i style={{ transform: `scaleX(${(activeIndex + 1) / SERVICE_COUNT})` }} /></span>
          <span className={styles.count}><strong>{String(activeIndex + 1).padStart(2, "0")}</strong><b>/</b><strong>{SERVICE_COUNT}</strong></span>
          <button onClick={goNext} type="button" aria-label="Ver siguiente servicio"><ArrowRight aria-hidden="true" /></button>
        </motion.nav>

        <p className={styles.srStatus} aria-live="polite">Servicio {activeIndex + 1} de {SERVICE_COUNT}: {active.shortName}</p>
      </ViewportFrame>
    </FullBleedSection>
  );
}
