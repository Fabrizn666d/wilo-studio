"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { StudioProject } from "@/data/studio";
import styles from "./project-deep-dive.module.css";


function ActivePreview({ project, visible }: { project: StudioProject; visible: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = Boolean(useReducedMotion());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!visible || reducedMotion) {
      video.pause();
      return;
    }
    void video.play().catch(() => undefined);
    return () => video.pause();
  }, [reducedMotion, visible]);

  return (
    <div className={styles.previewMedia}>
      <Image
        alt={`Vista del proyecto ${project.name}`}
        className={styles.previewPoster}
        fill
        sizes="(max-width: 840px) 92vw, 50vw"
        src={project.poster}
      />
      {project.video && !reducedMotion ? (
        <video
          ref={videoRef}
          aria-label={`Recorrido del proyecto ${project.name}`}
          className={styles.previewVideo}
          data-ready={ready && visible ? "true" : "false"}
          loop
          muted
          onCanPlay={() => setReady(true)}
          onLoadedData={() => setReady(true)}
          playsInline
          poster={project.poster}
          preload={visible ? "metadata" : "none"}
        >
          <source src={project.video} type="video/webm" />
        </video>
      ) : null}
      <span aria-hidden="true" className={styles.previewShade} />
    </div>
  );
}

export function ProjectDeepDive({ projects }: { projects: readonly StudioProject[] }) {
  const reducedMotion = Boolean(useReducedMotion());
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const active = projects[activeIndex] ?? projects[0];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio > 0.12),
      { threshold: [0, 0.12, 0.4], rootMargin: "100px 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  if (!active) return null;
  const transition = reducedMotion ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className={styles.layout} ref={sectionRef}>
      <div className={styles.selector}>
        <span className={styles.kicker}>03 · PROYECTOS REALES</span>
        <h2>Proyectos<br /><em>reales.</em></h2>
        <p>Ideas, diseño y tecnología que impulsan negocios reales. Cada caso responde a una operación y una audiencia distinta.</p>
        <div className={styles.projectList} aria-label="Seleccionar proyecto">
          {projects.map((project, index) => (
            <button
              aria-pressed={index === activeIndex}
              className={index === activeIndex ? styles.activeButton : undefined}
              key={project.slug}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{project.name}</strong>
              <i aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <div className={styles.visualColumn}>
        <div className={styles.visualGlow} aria-hidden="true" />
        <div className={styles.laptop}>
          <div className={styles.display}>
            <i className={styles.camera} aria-hidden="true" />
            <div className={styles.screen}>
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  className={styles.motionMedia}
                  initial={reducedMotion ? false : { opacity: 0, clipPath: "inset(0 0 100% 0)", scale: 1.02 }}
                  animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)", scale: 1 }}
                  exit={reducedMotion ? { opacity: 1 } : { opacity: 0, clipPath: "inset(100% 0 0 0)", scale: 0.99 }}
                  key={active.slug}
                  transition={transition}
                >
                  <ActivePreview project={active} visible={visible} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className={styles.base}><span /></div>
        </div>
        <span className={styles.mediaNote}>{active.video ? "RECORRIDO ACTIVO · SIN AUDIO" : "VISTA DEL PROYECTO"}</span>
      </div>

      <div className={styles.details} aria-live="polite">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -14 }}
            key={active.slug}
            transition={transition}
          >
            <span className={styles.index}>{String(activeIndex + 1).padStart(2, "0")} <i /> {String(projects.length).padStart(2, "0")}</span>
            <p className={styles.type}>{active.descriptor}</p>
            <h3>{active.name}</h3>
            <p className={styles.description}>{active.shortDescription}</p>
            <div className={styles.tags}>{active.services.map((service) => <span key={service}>{service}</span>)}</div>
            <Link className={styles.cta} href={`/proyectos/${active.slug}`}>Ver proyecto <span aria-hidden="true">↗</span></Link>
          </motion.div>
        </AnimatePresence>
        <div className={styles.navigation}>
          <button type="button" aria-label="Proyecto anterior" onClick={() => setActiveIndex((activeIndex - 1 + projects.length) % projects.length)}>←</button>
          <button type="button" aria-label="Proyecto siguiente" onClick={() => setActiveIndex((activeIndex + 1) % projects.length)}>→</button>
        </div>
      </div>
    </div>
  );
}
