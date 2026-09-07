"use client";

import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CodeXml,
  Cog,
  Globe2,
  Lightbulb,
  MapPin,
  Network,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  type CSSProperties,
  type PointerEvent,
  type WheelEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";
import { FullBleedSection, ViewportFrame } from "./HomeLayout";
import styles from "./about-wilo-showcase.module.css";

const capabilities = [
  {
    key: "web",
    number: "01",
    name: "Desarrollo web",
    description: "Sitios corporativos · Tiendas · Plataformas · Apps",
    image: "/services/corporate-web/visual.webp",
    alt: "Composición de soluciones web creadas por Wilo Studio",
    color: "#3978f6",
  },
  {
    key: "production",
    number: "02",
    name: "Producción audiovisual",
    description: "Foto · Video · Contenido",
    image: "/images/wilo/generated/audiovisual-set-v2.webp",
    alt: "Set de producción audiovisual profesional",
    color: "#ff5d73",
  },
  {
    key: "systems",
    number: "03",
    name: "Sistemas y plataformas",
    description: "Operación · Datos · Dashboards",
    image: "/services/platforms/visual.webp",
    alt: "Plataforma digital y paneles de operación",
    color: "#14b8a6",
  },
  {
    key: "education",
    number: "04",
    name: "Educación y robótica",
    description: "Talleres · Kits · Programación",
    image: "/images/wilo/generated/education-robot-v2.webp",
    alt: "Robot educativo de Wilo Education",
    color: "#7c4dff",
  },
  {
    key: "events",
    number: "05",
    name: "Wilo Events",
    description: "Producción técnica · Escenarios · Experiencias",
    image: "/images/wilo/generated/events-stage-v2.webp",
    alt: "Producción técnica de un evento corporativo",
    color: "#ff5d73",
  },
  {
    key: "automation",
    number: "06",
    name: "Automatización e infraestructura",
    description: "APIs · Flujos · Cloud · Integraciones",
    image: "/services/automation/visual.webp",
    alt: "Flujos de automatización e infraestructura digital",
    color: "#14b8a6",
  },
] as const;

const stats = [
  { value: 2300, suffix: "+", label: "Proyectos realizados", color: "#3978f6" },
  { value: 8, suffix: "", label: "Años de experiencia", color: "#7c4dff" },
  { value: 5, suffix: "", label: "Líneas Wilo", color: "#14b8a6" },
  { value: 100, suffix: "%", label: "Clientes satisfechos", color: "#ff5d73" },
] as const;

const capabilityRail = [
  { name: "Digital", detail: "Webs · Tiendas · Sistemas · Apps", color: "#3978f6", icon: CodeXml },
  { name: "Producción", detail: "Fotografía · Video · Contenido · Campañas", color: "#ff5d73", icon: Camera },
  { name: "Operación", detail: "APIs · Automatización · Correos · Infraestructura", color: "#14b8a6", icon: Cog },
  { name: "Ecosistema", detail: "Studio · Express · Education · Events · Store", color: "#7c4dff", icon: Network },
] as const;

const clientMarks = [
  { name: "Tecnova Perú", logo: "/images/logo-tecnova.png" },
  { name: "Global Norte", logo: "/images/logo-globalnorte.png" },
  { name: "IBEX" },
  { name: "Biciem Ultra Trail" },
  { name: "Reuse" },
  { name: "Dayun", logo: "/images/logo-dayun.png" },
  { name: "Hingenia" },
  { name: "Geoingenieros" },
] as const;

const reachItems = [
  { title: "Todo el Perú", text: "Nuestra cobertura nacional", icon: MapPin, color: "#14b8a6" },
  { title: "Todo el mundo", text: "Soluciones digitales sin fronteras", icon: Globe2, color: "#7c4dff" },
  { title: "Ideas que funcionan", text: "Nuestra esencia", icon: Lightbulb, color: "#ff5d73" },
] as const;

const visualOrder = [2, 1, 0, 3, 4, 5];

function relativePosition(index: number, activeIndex: number) {
  const length = capabilities.length;
  let offset = (visualOrder.indexOf(index) - visualOrder.indexOf(activeIndex) + length) % length;
  if (offset >= length / 2) offset -= length;
  return offset;
}

export function AboutWiloShowcase() {
  const reducedMotion = useHydratedReducedMotion();
  const rootRef = useRef<HTMLElement | null>(null);
  const pointerStart = useRef<number | null>(null);
  const pointerSlideIndex = useRef<number | null>(null);
  const pointerVelocity = useRef({ x: 0, time: 0, velocity: 0 });
  const suppressClick = useRef(false);
  const cooldownTimer = useRef<number | null>(null);
  const wheelResetTimer = useRef<number | null>(null);
  const wheelDistance = useRef(0);
  const countFrame = useRef<number | null>(null);
  const countDelayTimer = useRef<number | null>(null);
  const openingTimer = useRef<number | null>(null);
  const hasCounted = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [coolingDown, setCoolingDown] = useState(false);
  const [compactViewport, setCompactViewport] = useState(false);
  const [sectionActive, setSectionActive] = useState(false);
  const [motionReady, setMotionReady] = useState(false);
  const [sceneOpening, setSceneOpening] = useState(false);
  const [countStarted, setCountStarted] = useState(false);
  const [countValues, setCountValues] = useState<number[]>(stats.map(() => 0));
  const motionPaused = hovered || focused || dragging || coolingDown || !sectionActive;

  const previous = useCallback(() => setActiveIndex((index) => visualOrder[(visualOrder.indexOf(index) - 1 + capabilities.length) % capabilities.length]), []);
  const next = useCallback(() => setActiveIndex((index) => visualOrder[(visualOrder.indexOf(index) + 1) % capabilities.length]), []);

  const resumeAfterInteraction = useCallback((delay = 2800) => {
    setCoolingDown(true);
    if (cooldownTimer.current !== null) window.clearTimeout(cooldownTimer.current);
    cooldownTimer.current = window.setTimeout(() => setCoolingDown(false), delay);
  }, []);

  useEffect(() => {
    setMotionReady(true);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => setCompactViewport(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const section = rootRef.current;
    if (!section) return;
    let intersectionRatio = 0;
    let markedActive = section.dataset.fullpageActive === "true";
    const syncSceneState = () => {
      const fullpage = document.documentElement.classList.contains("wilo-fullpage");
      // FullPageController marks the destination at the beginning of its
      // transition. Waiting for real visibility keeps the reveal observable
      // after the Hero instead of completing while the section is off-screen.
      const active = fullpage
        ? markedActive && intersectionRatio >= 0.62
        : intersectionRatio >= 0.28;
      setSectionActive(active);
    };
    const updateFullpageState = () => {
      markedActive = section.dataset.fullpageActive === "true";
      syncSceneState();
    };
    const mutation = new MutationObserver(updateFullpageState);
    mutation.observe(section, { attributes: true, attributeFilter: ["data-fullpage-active"] });
    const intersection = new IntersectionObserver(([entry]) => {
      intersectionRatio = entry.isIntersecting ? entry.intersectionRatio : 0;
      syncSceneState();
    }, { threshold: [0, 0.28, 0.45, 0.62, 0.78] });
    intersection.observe(section);
    updateFullpageState();
    return () => {
      mutation.disconnect();
      intersection.disconnect();
    };
  }, []);

  useEffect(() => {
    if (openingTimer.current !== null) window.clearTimeout(openingTimer.current);
    if (!sectionActive || reducedMotion) {
      setSceneOpening(false);
      return;
    }
    setSceneOpening(true);
    openingTimer.current = window.setTimeout(() => setSceneOpening(false), 1500);
  }, [reducedMotion, sectionActive]);

  useEffect(() => {
    if (!sectionActive || hasCounted.current) return;
    if (reducedMotion) {
      hasCounted.current = true;
      setCountStarted(true);
      setCountValues(stats.map((stat) => stat.value));
      return;
    }
    countDelayTimer.current = window.setTimeout(() => {
      hasCounted.current = true;
      setCountStarted(true);
      setCountValues(stats.map(() => 0));
      // Keep the zero state on screen briefly so the count-up has a readable
      // origin instead of jumping on the very first painted frame.
      const startedAt = performance.now() + 300;
      const durations = [1900, 1050, 900, 1400];
      const tick = (now: number) => {
        let running = false;
        const values = stats.map((stat, index) => {
          const progress = Math.max(0, Math.min(1, (now - startedAt) / durations[index]));
          if (progress < 1) running = true;
          const eased = 1 - Math.pow(1 - progress, 3);
          return Math.round(stat.value * eased);
        });
        setCountValues(values);
        if (running) countFrame.current = window.requestAnimationFrame(tick);
      };
      countFrame.current = window.requestAnimationFrame(tick);
    }, 720);
    return () => {
      if (!hasCounted.current && countDelayTimer.current !== null) {
        window.clearTimeout(countDelayTimer.current);
        countDelayTimer.current = null;
      }
    };
  }, [reducedMotion, sectionActive]);

  useEffect(() => {
    if (motionPaused || reducedMotion || compactViewport) return;
    const timer = window.setInterval(next, 5800);
    return () => window.clearInterval(timer);
  }, [compactViewport, motionPaused, next, reducedMotion]);

  useEffect(() => () => {
    if (cooldownTimer.current !== null) window.clearTimeout(cooldownTimer.current);
    if (wheelResetTimer.current !== null) window.clearTimeout(wheelResetTimer.current);
    if (countDelayTimer.current !== null) window.clearTimeout(countDelayTimer.current);
    if (openingTimer.current !== null) window.clearTimeout(openingTimer.current);
    if (countFrame.current !== null) window.cancelAnimationFrame(countFrame.current);
  }, []);

  const runControl = (action: () => void) => {
    action();
    resumeAfterInteraction();
  };

  const onScenePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reducedMotion || compactViewport || dragging) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
    event.currentTarget.style.setProperty("--about-parallax-x", `${x.toFixed(2)}px`);
    event.currentTarget.style.setProperty("--about-parallax-y", `${y.toFixed(2)}px`);
  };

  const resetSceneParallax = () => {
    rootRef.current?.style.setProperty("--about-parallax-x", "0px");
    rootRef.current?.style.setProperty("--about-parallax-y", "0px");
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest("[data-carousel-controls]")) return;
    pointerStart.current = event.clientX;
    pointerVelocity.current = { x: event.clientX, time: performance.now(), velocity: 0 };
    suppressClick.current = false;
    const slide = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-slide-index]") : null;
    pointerSlideIndex.current = slide ? Number(slide.dataset.slideIndex) : null;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerStart.current === null) return;
    const time = performance.now();
    pointerVelocity.current = { x: event.clientX, time, velocity: (event.clientX - pointerVelocity.current.x) / Math.max(1, time - pointerVelocity.current.time) };
    setDragX(Math.max(-160, Math.min(160, event.clientX - pointerStart.current)));
  };

  const endPointer = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    if (pointerStart.current !== null && !cancelled) {
      const distance = event.clientX - pointerStart.current;
      const projected = distance + pointerVelocity.current.velocity * 100;
      suppressClick.current = Math.abs(distance) > 8;
      if (projected < -50) next();
      else if (projected > 50) previous();
      else if (Math.abs(distance) < 8 && pointerSlideIndex.current !== null) setActiveIndex(pointerSlideIndex.current);
    }
    pointerStart.current = null;
    pointerSlideIndex.current = null;
    setDragX(0);
    setDragging(false);
    resumeAfterInteraction();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaX) < 12 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    wheelDistance.current += event.deltaX;
    resumeAfterInteraction();
    if (Math.abs(wheelDistance.current) >= 42) {
      if (wheelDistance.current > 0) next();
      else previous();
      wheelDistance.current = 0;
    }
    if (wheelResetTimer.current !== null) window.clearTimeout(wheelResetTimer.current);
    wheelResetTimer.current = window.setTimeout(() => { wheelDistance.current = 0; }, 180);
  };

  return (
    <FullBleedSection
      aria-labelledby="about-wilo-title"
      className={styles.section}
      data-counted={countStarted}
      data-active={sectionActive}
      data-entered={sectionActive}
      data-motion-ready={motionReady}
      data-opening={sceneOpening}
      id="sobre-wilo"
      onPointerLeave={resetSceneParallax}
      onPointerMove={onScenePointerMove}
      ref={rootRef}
      spacing="scene"
    >
      <div className={styles.atmosphere} aria-hidden="true"><i /><i /><span>W</span></div>
      <ViewportFrame className={styles.frame} size="wide">
        <div className={styles.mainComposition}>
          <div className={styles.copy}>
            <span className={styles.eyebrow}><b>02</b><i /> SOBRE WILO STUDIO</span>
            <p className={styles.statement}>NO USAMOS WORDPRESS.</p>
            <h2 id="about-wilo-title"><em>NUESTRO LÍMITE</em><br />ES TU CREATIVIDAD.</h2>
            <p className={styles.subhead}>DISEÑAMOS Y CREAMOS HASTA LO QUE<br /> SE CREE <strong>IMPOSIBLE.</strong></p>
            <div className={styles.measureCopy}>
              <p>Wilo Studio es un estudio peruano de tecnología, diseño y producción que desarrolla soluciones digitales y creativas a medida.</p>
              <p>Construimos la tecnología alrededor de tu negocio. Soluciones a medida, pensadas para objetivos reales.</p>
            </div>
            <Link className={styles.cta} href="/#proceso">Conoce cómo trabajamos <ArrowRight aria-hidden="true" /></Link>
          </div>

          <div
            aria-label="Capacidades de Wilo Studio"
            aria-roledescription="carrusel"
            className={styles.carousel}
            data-paused={motionPaused}
            data-dragging={dragging}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setFocused(false);
                resumeAfterInteraction();
              }
            }}
            onFocus={() => setFocused(true)}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") { event.preventDefault(); runControl(previous); }
              if (event.key === "ArrowRight") { event.preventDefault(); runControl(next); }
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); resumeAfterInteraction(); }}
            onPointerCancel={(event) => endPointer(event, true)}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(event) => endPointer(event)}
            onWheel={onWheel}
            role="region"
            style={{ "--drag-x": `${dragX}px` } as CSSProperties}
            tabIndex={0}
          >
            <div className={styles.cardStack}>
              {capabilities.map((item, index) => {
                const position = relativePosition(index, activeIndex);
                return (
                  <button
                    aria-label={`Mostrar ${item.name}`}
                    aria-pressed={position === 0}
                    className={styles.capabilityCard}
                    data-position={position}
                    data-slide-index={index}
                    aria-hidden={Math.abs(position) > 2}
                    tabIndex={Math.abs(position) > 2 ? -1 : 0}
                    key={item.key}
                    onClick={() => { if (!suppressClick.current) setActiveIndex(index); resumeAfterInteraction(); }}
                    style={{ "--capability-color": item.color } as CSSProperties}
                    type="button"
                  >
                    <span className={styles.cardImage}>
                      <Image alt={item.alt} fill loading={index < 2 ? "eager" : "lazy"} sizes="(max-width: 760px) 86vw, 48vw" src={item.image} />
                      <i aria-hidden="true" />
                    </span>
                    <span className={styles.cardCaption}>
                      <span><small>{item.number}</small><b>{item.name}</b><em>{item.description}</em></span>
                      <strong>{item.number} / {String(capabilities.length).padStart(2, "0")}</strong>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className={styles.carouselControls} data-carousel-controls>
              <button onClick={() => runControl(previous)} type="button" aria-label="Ver capacidad anterior"><ArrowLeft aria-hidden="true" /></button>
              <div aria-hidden="true">{capabilities.map((item, index) => <i data-active={index === activeIndex} key={item.key} />)}</div>
              <button onClick={() => runControl(next)} type="button" aria-label="Ver capacidad siguiente"><ArrowRight aria-hidden="true" /></button>
            </div>
            <p className={styles.srOnly} aria-live="polite">{capabilities[activeIndex].name}, {activeIndex + 1} de {capabilities.length}</p>
          </div>
        </div>

        <div className={styles.statsRail} aria-label="Resultados de Wilo Studio">
          {stats.map((stat, index) => (
            <div key={stat.label} style={{ "--stat-color": stat.color } as CSSProperties}>
              <strong data-stat-value={stat.value}>{countValues[index]}{stat.suffix}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.capabilityRail}>
          {capabilityRail.map((item) => {
            const Icon = item.icon;
            return <div key={item.name} style={{ "--rail-color": item.color } as CSSProperties}><Icon aria-hidden="true" /><span><strong>{item.name}</strong><em>{item.detail}</em></span></div>;
          })}
        </div>

        <div className={styles.clientMarquee} aria-label="Carrusel infinito de marcas y proyectos de Wilo Studio">
          <div className={styles.marqueeViewport}>
            <div className={styles.marqueeTrack}>
              {[...clientMarks, ...clientMarks].map((item, index) => (
                <span aria-hidden={index >= clientMarks.length} className={styles.clientMark} key={`${item.name}-${index}`}>
                  {"logo" in item ? <Image alt={index < clientMarks.length ? item.name : ""} height={48} src={item.logo} width={120} /> : <b>{item.name}</b>}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.reachStrip}>
          {reachItems.map((item) => {
            const Icon = item.icon;
            return <div key={item.title} style={{ "--reach-color": item.color } as CSSProperties}><Icon aria-hidden="true" /><span><strong>{item.title}</strong><small>{item.text}</small></span></div>;
          })}
        </div>
      </ViewportFrame>
    </FullBleedSection>
  );
}
