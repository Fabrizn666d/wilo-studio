"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Code2,
  Headphones,
  Layers3,
  Monitor,
  Play,
  Rocket,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./projects-showcase.module.css";

const projects = [
  {
    name: "Tecnova Perú",
    description: "Plataforma corporativa con catálogo de maquinaria, repuestos, servicios y sistema de cotización.",
    year: "2026",
    type: "Web Corporativa",
    services: ["Web", "Catálogo", "Cotizador", "Administración", "SEO"],
    image: "/images/portfolio/proyecto-4.jpg",
    position: "center 10%",
  },
  {
    name: "IBEX Constructora",
    description: "Sitio corporativo para presentar arquitectura, construcción, remodelación y proyectos inmobiliarios.",
    year: "2026",
    type: "Web Corporativa",
    services: ["Web", "Proyectos", "Servicios", "Administración", "SEO"],
    image: "/images/wilo/projects/ibex.webp",
    position: "center",
  },
  {
    name: "Biciem Ultra Trail",
    description: "Plataforma deportiva para comunicar rutas, comunidad, competencia e información para participantes.",
    year: "2026",
    type: "Plataforma Deportiva",
    services: ["Web", "Eventos", "Contenido", "Inscripciones", "SEO"],
    image: "/images/wilo/projects/biciem.webp",
    position: "center",
  },
  {
    name: "Industrial Remotos Perú",
    description: "Plataforma comercial para puertas industriales, automatización y presentación de proyectos ejecutados.",
    year: "2026",
    type: "Web Corporativa",
    services: ["Web", "Catálogo", "Proyectos", "Cotizador", "SEO"],
    image: "/images/wilo/projects/industrial-remotos.jpg",
    position: "center",
  },
  {
    name: "Global Norte",
    description: "E-commerce B2B con catálogo, precios, pedidos y una experiencia de compra pensada para mayoristas.",
    year: "2026",
    type: "E-commerce B2B",
    services: ["E-commerce", "Catálogo", "Pedidos", "Administración", "SEO"],
    image: "/images/portfolio/proyecto-3.jpg",
    position: "center 8%",
  },
  {
    name: "Boxy Drip",
    description: "E-commerce editorial de moda urbana con catálogo, ficha de producto y experiencia de compra completa.",
    year: "2026",
    type: "E-commerce",
    services: ["E-commerce", "Catálogo", "Carrito", "Dirección de arte", "SEO"],
    image: "/images/wilo/projects/boxy-drip.webp",
    position: "center",
  },
] as const;

const principles = [
  {
    icon: Rocket,
    title: "Diseño estratégico",
    text: "Experiencias digitales pensadas para convertir y posicionar.",
  },
  {
    icon: Code2,
    title: "Tecnología escalable",
    text: "Desarrollos modernos, rápidos y preparados para crecer.",
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    title: "Resultados medibles",
    text: "Sitios y plataformas que generan impacto real en tu negocio.",
  },
  {
    icon: Headphones,
    title: "Soporte continuo",
    text: "Acompañamiento en cada etapa después del lanzamiento.",
  },
] as const;

export function ProjectsShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const active = projects[activeIndex];

  useEffect(() => {
    const video = videoRef.current;
    if (activeIndex !== 0 || !video) return;
    video.load();
    void video.play().catch(() => undefined);
  }, [activeIndex]);

  const selectProject = (index: number) => {
    setActiveIndex((index + projects.length) % projects.length);
  };

  return (
    <section className={styles.section} id="proyectos" aria-labelledby="projects-showcase-title">
      <div className={styles.backdrop} aria-hidden="true">
        <Image src="/images/wilo/hero/misti.webp" alt="" fill sizes="100vw" />
      </div>
      <div className={styles.backdropShade} aria-hidden="true" />

      <div className={styles.shell}>
        <div className={styles.stage}>
          <div className={styles.intro}>
            <span className={styles.eyebrow}><b>02</b><i /> PROYECTOS REALES</span>
            <h2 id="projects-showcase-title">PROYECTOS REALES</h2>
            <p>
              Ideas, diseño y tecnología que impulsan negocios reales. Estas son algunas marcas que ya confiaron en <strong>Wilo Studio.</strong>
            </p>

            <div className={styles.projectNav} role="tablist" aria-label="Seleccionar proyecto">
              <span className={styles.progressLine} aria-hidden="true">
                <i style={{ transform: `scaleY(${(activeIndex + 1) / projects.length})` }} />
              </span>
              {projects.map((project, index) => (
                <button
                  className={index === activeIndex ? styles.activeProject : undefined}
                  key={project.name}
                  onClick={() => selectProject(index)}
                  role="tab"
                  aria-selected={index === activeIndex}
                  aria-controls="wilo-project-preview"
                  type="button"
                >
                  <i aria-hidden="true" />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{project.name}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.visual} id="wilo-project-preview" role="tabpanel" aria-live="polite">
            <div className={styles.laptop}>
              <div className={styles.displayFrame}>
                <span className={styles.camera} aria-hidden="true" />
                <div className={styles.screen}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      className={styles.preview}
                      key={active.name}
                      initial={reducedMotion ? false : { opacity: 0, scale: 1.025 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reducedMotion ? undefined : { opacity: 0, scale: 0.985 }}
                      transition={{ duration: reducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {activeIndex === 0 ? (
                        <video
                          ref={videoRef}
                          className={styles.previewVideo}
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="auto"
                          poster={active.image}
                          aria-hidden="true"
                          tabIndex={-1}
                        >
                          <source src="/videos/tecnova-showcase.webm" type="video/webm" />
                        </video>
                      ) : (
                        <Image
                          className={styles.previewImage}
                          src={active.image}
                          alt={`Vista del proyecto ${active.name}`}
                          fill
                          sizes="(max-width: 760px) 92vw, (max-width: 1180px) 62vw, 48vw"
                          style={{ objectPosition: active.position }}
                        />
                      )}
                      <div className={styles.screenShade} aria-hidden="true" />
                      <span className={styles.play} aria-hidden="true"><Play fill="currentColor" /></span>
                      <div className={styles.videoProgress} aria-hidden="true"><i key={active.name} /></div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <div className={styles.laptopBase} aria-hidden="true"><span /></div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.aside
              className={styles.details}
              key={active.name}
              initial={reducedMotion ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, x: -10 }}
              transition={{ duration: reducedMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className={styles.counter}><b>{String(activeIndex + 1).padStart(2, "0")}</b> / {String(projects.length).padStart(2, "0")}</span>
              <h3>{active.name}</h3>
              <p>{active.description}</p>
              <div className={styles.divider} />
              <dl>
                <div><dt><CalendarDays /> Año</dt><dd>{active.year}</dd></div>
                <div><dt><Monitor /> Tipo</dt><dd>{active.type}</dd></div>
                <div><dt><Layers3 /> Servicios</dt><dd /></div>
              </dl>
              <div className={styles.tags}>{active.services.map((service) => <span key={service}>{service}</span>)}</div>
              <Link className={styles.projectCta} href="/portafolio">
                Ver proyecto <ArrowUpRight />
              </Link>
              <div className={styles.arrows}>
                <button type="button" onClick={() => selectProject(activeIndex - 1)} aria-label="Proyecto anterior"><ArrowLeft /></button>
                <button type="button" onClick={() => selectProject(activeIndex + 1)} aria-label="Proyecto siguiente"><ArrowRight /></button>
              </div>
            </motion.aside>
          </AnimatePresence>
        </div>

        <div className={styles.principles}>
          {principles.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <Icon aria-hidden="true" />
              <span><strong>{title}</strong><small>{text}</small></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
