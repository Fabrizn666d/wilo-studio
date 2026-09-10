"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin, Monitor, UsersRound, Zap } from "lucide-react";
import {
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { StudioProject } from "@/data/studio";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";
import styles from "./studio-carousel.module.css";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const modulo = (value: number, length: number) => ((value % length) + length) % length;

function shortestDistance(index: number, position: number, total: number) {
  let distance = index - modulo(position, total);
  if (distance > total / 2) distance -= total;
  if (distance < -total / 2) distance += total;
  return distance;
}

function ProjectVideo({ project, visible }: { project: StudioProject; visible: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useHydratedReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!visible || reducedMotion) {
      video.pause();
      return;
    }
    void video.play().catch(() => {
      // El poster sigue visible cuando el navegador decide bloquear autoplay.
    });
    return () => video.pause();
  }, [reducedMotion, visible]);

  return (
    <div className={styles.media}>
      <Image
        alt=""
        aria-hidden="true"
        className={styles.poster}
        fill
        sizes="(max-width: 720px) 82vw, (max-width: 1100px) 64vw, 48vw"
        src={project.poster}
      />
      {project.video ? (
        <video
          ref={videoRef}
          aria-label={`Recorrido del proyecto ${project.name}`}
          className={styles.video}
          data-ready={ready && visible && !reducedMotion ? "true" : "false"}
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
    </div>
  );
}

type DragState = {
  pointerId: number | null;
  startX: number;
  startPosition: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  distance: number;
};

const emptyDrag: DragState = {
  pointerId: null,
  startX: 0,
  startPosition: 0,
  lastX: 0,
  lastTime: 0,
  velocity: 0,
  distance: 0,
};

export function StudioCarousel({ projects }: { projects: readonly StudioProject[] }) {
  const reducedMotion = useHydratedReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const positionRef = useRef(0);
  const activeIndexRef = useRef(0);
  const animationFrameRef = useRef(0);
  const animationTokenRef = useRef(0);
  const autoplayDueRef = useRef(0);
  const dragRef = useRef<DragState>({ ...emptyDrag });
  const suppressClickRef = useRef(false);
  const suppressTimerRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [projectCount, setProjectCount] = useState(0);
  const [yearsCount, setYearsCount] = useState(0);
  const countersStartedRef = useRef(false);
  const total = projects.length;

  const stageMetrics = useCallback(() => {
    const viewport = viewportRef.current;
    const viewportWidth = viewport?.clientWidth || 1200;
    const mobile = viewportWidth < 680;
    const tablet = viewportWidth < 980;
    const slideWidth = slideRefs.current[0]?.offsetWidth || viewportWidth * 0.66;
    return {
      mobile,
      tablet,
      step: mobile
        ? viewportWidth * 0.52
        : tablet
          ? clamp(viewportWidth * 0.31, slideWidth * 0.58, slideWidth * 0.7)
          : clamp(viewportWidth * 0.235, slideWidth * 0.59, slideWidth * 0.68),
      dragDistance: mobile
        ? Math.max(150, viewportWidth * 0.56)
        : clamp(slideWidth * 0.56, 280, 560),
    };
  }, []);

  const renderPosition = useCallback((announce = false) => {
    if (!total) return;
    const metrics = stageMetrics();
    const position = positionRef.current;
    const nearest = modulo(Math.round(position), total);

    slideRefs.current.forEach((slide, index) => {
      if (!slide) return;
      const distance = shortestDistance(index, position, total);
      const absolute = Math.abs(distance);
      const sign = Math.sign(distance);
      const visibleLimit = metrics.mobile ? 1.85 : metrics.tablet ? 2.4 : 2.45;
      const spread = absolute <= 1 ? absolute : 1 + (absolute - 1) * 0.5;
      const x = sign * metrics.step * spread;
      const rotation = sign * -(metrics.mobile
        ? clamp(26 + absolute * 5, 26, 38)
        : clamp(9 + Math.max(0, absolute - 1) * 6, 9, 19));
      const depth = metrics.mobile
        ? -Math.pow(absolute, 0.92) * 135
        : absolute <= 1
          ? 90 - absolute * 165
          : -75 - (absolute - 1) * 90;
      const scale = absolute <= 1
        ? 1 - absolute * (metrics.mobile ? 0.17 : 0.2)
        : clamp(0.8 - (absolute - 1) * 0.18, metrics.mobile ? 0.68 : 0.6, 1);
      const alpha = absolute <= 1
        ? 1 - absolute * (metrics.mobile ? 0.28 : 0.02)
        : clamp(0.98 - (absolute - 1) * 0.14, 0.78, 1);
      const y = metrics.mobile ? absolute * 8 : Math.pow(absolute, 1.12) * 7;
      const tilt = metrics.mobile ? 0 : sign * -Math.min(absolute * 0.8, 1.6);
      const isNearest = index === nearest;

      slide.style.setProperty("--carousel-x", `${x.toFixed(2)}px`);
      slide.style.setProperty("--carousel-y", `${y.toFixed(2)}px`);
      slide.style.setProperty("--carousel-z", `${depth.toFixed(2)}px`);
      slide.style.setProperty("--carousel-rotate", `${rotation.toFixed(2)}deg`);
      slide.style.setProperty("--carousel-tilt", `${tilt.toFixed(2)}deg`);
      slide.style.setProperty("--carousel-scale", scale.toFixed(4));
      slide.style.setProperty("--carousel-alpha", alpha.toFixed(4));
      slide.style.setProperty("--carousel-entry-x", `${(x * 0.12).toFixed(2)}px`);
      slide.style.setProperty("--carousel-entry-rotate", `${(rotation * 0.18).toFixed(2)}deg`);
      slide.style.setProperty("--carousel-entry-scale", absolute < 0.5 ? ".88" : ".74");
      slide.style.setProperty("--carousel-entry-delay", `${Math.round(Math.min(absolute, 2) * 90)}ms`);
      slide.style.zIndex = String(Math.max(1, 30 - Math.round(absolute * 5)));
      slide.dataset.hidden = absolute > visibleLimit ? "true" : "false";
      slide.dataset.active = isNearest ? "true" : "false";
      slide.setAttribute("aria-hidden", isNearest ? "false" : "true");
      const hitArea = slide.querySelector<HTMLButtonElement>("[data-carousel-hit]");
      if (hitArea) hitArea.tabIndex = isNearest ? 0 : -1;
    });

    rootRef.current?.style.setProperty("--carousel-progress", String((nearest + 1) / total));
    if (nearest !== activeIndexRef.current) {
      activeIndexRef.current = nearest;
      setActiveIndex(nearest);
    }
    if (announce) {
      setAnnouncement(`${projects[nearest]?.name ?? "Proyecto"}, ${nearest + 1} de ${total}`);
    }
  }, [projects, stageMetrics, total]);

  const stopAnimation = useCallback(() => {
    animationTokenRef.current += 1;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = 0;
    rootRef.current?.removeAttribute("data-settling");
  }, []);

  const animateTo = useCallback((target: number, announce = true, velocityHint = 0) => {
    stopAnimation();
    const token = animationTokenRef.current;
    const start = positionRef.current;
    const distance = target - start;
    if (reducedMotion || Math.abs(distance) < 0.001) {
      positionRef.current = target;
      renderPosition(announce);
      return;
    }

    const duration = clamp(330 + Math.abs(distance) * 95 + Math.abs(velocityHint) * 8000, 340, 820);
    const startedAt = performance.now();
    rootRef.current?.setAttribute("data-settling", "true");

    const tick = (time: number) => {
      if (token !== animationTokenRef.current) return;
      const elapsed = clamp((time - startedAt) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - elapsed, 4);
      positionRef.current = start + distance * eased;
      renderPosition(false);
      if (elapsed < 1) {
        animationFrameRef.current = requestAnimationFrame(tick);
        return;
      }
      positionRef.current = target;
      if (Math.abs(positionRef.current) > total * 100) {
        positionRef.current = modulo(positionRef.current, total);
      }
      rootRef.current?.removeAttribute("data-settling");
      renderPosition(announce);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
  }, [reducedMotion, renderPosition, stopAnimation, total]);

  const moveBy = useCallback((delta: number) => {
    animateTo(Math.round(positionRef.current) + delta, true);
  }, [animateTo]);

  const holdAutoplay = useCallback((duration = 6800) => {
    autoplayDueRef.current = performance.now() + duration;
  }, []);

  const navigateBy = useCallback((delta: number) => {
    holdAutoplay();
    moveBy(delta);
  }, [holdAutoplay, moveBy]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !total) return;
    renderPosition(false);
    const resizeObserver = new ResizeObserver(() => renderPosition(false));
    resizeObserver.observe(viewport);
    return () => resizeObserver.disconnect();
  }, [renderPosition, total]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting && entry.intersectionRatio > 0.18),
      { threshold: [0, 0.18, 0.45], rootMargin: "120px 0px" },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || reducedMotion || total < 2) return;
    autoplayDueRef.current = performance.now() + 5200;
    const timer = window.setInterval(() => {
      if (dragRef.current.pointerId !== null || performance.now() < autoplayDueRef.current) return;
      moveBy(1);
      autoplayDueRef.current = performance.now() + 5200;
    }, 420);
    return () => window.clearInterval(timer);
  }, [isVisible, moveBy, reducedMotion, total]);

  useEffect(() => {
    if (!isVisible || countersStartedRef.current) return;
    countersStartedRef.current = true;
    if (reducedMotion) {
      setProjectCount(2300);
      setYearsCount(8);
      return;
    }
    const startedAt = performance.now();
    const duration = 1350;
    let frame = 0;
    const tick = (time: number) => {
      const progress = clamp((time - startedAt) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setProjectCount(Math.round(2300 * eased));
      setYearsCount(Math.round(8 * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      setProjectCount(2300);
      setYearsCount(8);
    };
  }, [isVisible, reducedMotion]);

  useEffect(() => {
    return () => {
      stopAnimation();
      window.clearTimeout(suppressTimerRef.current);
    };
  }, [stopAnimation]);

  useEffect(() => {
    stopAnimation();
    positionRef.current = Math.round(positionRef.current);
    renderPosition(false);
  }, [reducedMotion, renderPosition, stopAnimation]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigateBy(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      navigateBy(1);
    } else if (event.key === "Home") {
      event.preventDefault();
      animateTo(positionRef.current + shortestDistance(0, positionRef.current, total));
    } else if (event.key === "End") {
      event.preventDefault();
      animateTo(positionRef.current + shortestDistance(total - 1, positionRef.current, total));
    }
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || dragRef.current.pointerId !== null) return;
    holdAutoplay();
    stopAnimation();
    const now = performance.now();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startPosition: positionRef.current,
      lastX: event.clientX,
      lastTime: now,
      velocity: 0,
      distance: 0,
    };
    suppressClickRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    rootRef.current?.setAttribute("data-dragging", "true");
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (event.pointerId !== drag.pointerId) return;
    const now = performance.now();
    const metrics = stageMetrics();
    const deltaX = event.clientX - drag.startX;
    const nextPosition = drag.startPosition - deltaX / metrics.dragDistance;
    const elapsed = Math.max(8, now - drag.lastTime);
    const instantaneous = (nextPosition - positionRef.current) / elapsed;
    drag.velocity = drag.velocity * 0.68 + instantaneous * 0.32;
    drag.distance = Math.max(drag.distance, Math.abs(event.clientX - drag.startX));
    drag.lastX = event.clientX;
    drag.lastTime = now;
    positionRef.current = nextPosition;
    suppressClickRef.current = drag.distance > 7;
    renderPosition(false);
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (event.pointerId !== drag.pointerId) return;
    const pointerId = drag.pointerId;
    const velocity = drag.velocity;
    dragRef.current = { ...emptyDrag };
    rootRef.current?.removeAttribute("data-dragging");
    if (pointerId !== null && event.currentTarget.hasPointerCapture(pointerId)) {
      event.currentTarget.releasePointerCapture(pointerId);
    }
    const projected = reducedMotion
      ? positionRef.current
      : positionRef.current + clamp(velocity * 165, -1.4, 1.4);
    animateTo(Math.round(projected), true, velocity);
    window.clearTimeout(suppressTimerRef.current);
    suppressTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 80);
  }

  function selectSlide(index: number) {
    if (suppressClickRef.current) return;
    holdAutoplay();
    const distance = shortestDistance(index, positionRef.current, total);
    if (Math.abs(distance) > 0.45) animateTo(positionRef.current + distance, true);
  }

  if (!total) return null;
  const activeProject = projects[activeIndex] ?? projects[0];

  return (
    <div className={styles.carousel} ref={rootRef}>
      <div
        ref={viewportRef}
        className={styles.viewport}
        role="region"
        aria-roledescription="carrusel"
        aria-label="Proyectos de Wilo Studio"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      >
        <div className={styles.track}>
          {projects.map((project, index) => (
            <article
              ref={(node) => { slideRefs.current[index] = node; }}
              className={styles.slide}
              data-active={index === 0 ? "true" : "false"}
              data-hidden="false"
              key={project.slug}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${index + 1} de ${total}: ${project.name}`}
              aria-hidden={index === 0 ? "false" : "true"}
            >
              <button
                className={styles.hitArea}
                data-carousel-hit
                onClick={() => selectSlide(index)}
                tabIndex={index === 0 ? 0 : -1}
                type="button"
                aria-label={index === activeIndex ? `${project.name}, proyecto activo` : `Seleccionar ${project.name}`}
              />
              <div className={styles.device} aria-hidden="true">
                <div className={styles.browserFrame}>
                  <div className={styles.browserBar}>
                    <span><i /><i /><i /></span>
                    <b>{project.slug}.wilo</b>
                  </div>
                  <div className={styles.screen}>
                    {index === activeIndex ? (
                      <ProjectVideo project={project} visible={isVisible} />
                    ) : (
                      <Image
                        alt=""
                        aria-hidden="true"
                        className={styles.poster}
                        fill
                        sizes="(max-width: 720px) 82vw, (max-width: 1100px) 64vw, 48vw"
                        src={project.poster}
                      />
                    )}
                    <span className={styles.screenShade} />
                  </div>
                </div>
                <div className={styles.deviceBase}><i /></div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className={styles.navigation}>
        <button className={styles.arrow} onClick={() => navigateBy(-1)} type="button" aria-label="Ver proyecto anterior">
          <ArrowLeft aria-hidden="true" />
        </button>
        <div className={styles.dots} aria-label="Seleccionar proyecto">
          {projects.map((project, index) => (
            <button
              aria-label={`Ver ${project.name}`}
              className={index === activeIndex ? styles.dotActive : undefined}
              key={project.slug}
              onClick={() => selectSlide(index)}
              type="button"
            />
          ))}
        </div>
        <button className={styles.arrow} onClick={() => navigateBy(1)} type="button" aria-label="Ver proyecto siguiente">
          <ArrowRight aria-hidden="true" />
        </button>
        <div className={styles.count} aria-hidden="true">
          <b>{String(activeIndex + 1).padStart(2, "0")}</b><i /><span>{String(total).padStart(2, "0")}</span>
        </div>
      </div>
      <p className={styles.instruction}>ARRASTRA O DESLIZA PARA EXPLORAR</p>
      <p className={styles.live} aria-live="polite" aria-atomic="true">{announcement}</p>

      <div className={styles.activePanel}>
        <div className={styles.activeCopy}>
          <span>PROYECTO SELECCIONADO</span>
          <h3>{activeProject.name}</h3>
          <p>{activeProject.shortDescription}</p>
        </div>
        <Link className={styles.projectLink} href={`/proyectos/${activeProject.slug}`}>
          Explorar proyecto <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>

      <div className={styles.projectFooter} aria-label="Identidad de nuestros proyectos">
        <div><Monitor aria-hidden="true" /><span><strong>+{projectCount}</strong><small>PROYECTOS REALIZADOS</small></span></div>
        <div><UsersRound aria-hidden="true" /><span><strong>{yearsCount} AÑOS</strong><small>DE EXPERIENCIA</small></span></div>
        <div><MapPin aria-hidden="true" /><span><strong>DESDE AREQUIPA</strong><small>CREANDO PARA EL MUNDO</small></span></div>
        <div><Zap aria-hidden="true" /><span><strong>SOLUCIONES A MEDIDA</strong><small>PARA MARCAS EN CRECIMIENTO</small></span></div>
      </div>
    </div>
  );
}
