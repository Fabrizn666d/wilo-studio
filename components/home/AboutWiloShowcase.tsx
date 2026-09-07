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
    image: "/ecosystem/studio/studio-devices.png",
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
  { title: "Arequipa", text: "Nuestro origen", icon: MapPin, color: "#3978f6" },
  { title: "Todo el Perú", text: "Nuestra cobertura nacional", icon: MapPin, color: "#14b8a6" },
  { title: "Todo el mundo", text: "Soluciones digitales sin fronteras", icon: Globe2, color: "#7c4dff" },
  { title: "Ideas que funcionan", text: "Nuestra esencia", icon: Lightbulb, color: "#ff5d73" },
] as const;

const visualOrder = [2, 1, 0, 3, 4, 5];
const INITIAL_PHASE = 2;
const CARD_TRAVEL_MS = 7200;
const SNAP_STIFFNESS = 190;
const SNAP_DAMPING = 26;

function wrapOffset(value: number) {
  const length = capabilities.length;
  return ((value + length / 2) % length + length) % length - length / 2;
}

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3);
}

function relativePosition(index: number, activeIndex: number) {
  const length = capabilities.length;
  let offset = (visualOrder.indexOf(index) - visualOrder.indexOf(activeIndex) + length) % length;
  if (offset >= length / 2) offset -= length;
  return offset;
}

export function AboutWiloShowcase() {
  const reducedMotion = useHydratedReducedMotion();
  const rootRef = useRef<HTMLElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pointer = useRef({ id: -1, startX: 0, startPhase: INITIAL_PHASE, x: 0, time: 0, velocityX: 0 });
  const phaseRef = useRef(INITIAL_PHASE);
  const phaseVelocityRef = useRef(0);
  const phaseTargetRef = useRef<number | null>(null);
  const resumeAtRef = useRef(0);
  const sceneProgressRef = useRef(0);
  const sceneNearRef = useRef(false);
  const interactionPausedRef = useRef(false);
  const hoverSlowRef = useRef(false);
  const parallaxRef = useRef({ x: 0, y: 0 });
  const carouselFrame = useRef<number | null>(null);
  const renderCarouselRef = useRef<() => void>(() => undefined);
  const suppressClick = useRef(false);
  const countFrame = useRef<number | null>(null);
  const hasCounted = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [compactViewport, setCompactViewport] = useState(false);
  const [sectionActive, setSectionActive] = useState(false);
  const [countEligible, setCountEligible] = useState(false);
  const [motionReady, setMotionReady] = useState(false);
  const [countStarted, setCountStarted] = useState(false);
  const [countValues, setCountValues] = useState<number[]>(stats.map(() => 0));
  const motionPaused = dragging || !sectionActive;

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
    let markedActive = section.dataset.fullpageActive === "true";
    let measureFrame = 0;
    const measure = () => {
      measureFrame = 0;
      const rect = section.getBoundingClientRect();
      const visible = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
      const ratio = Math.max(0, Math.min(1, visible / Math.min(rect.height, window.innerHeight)));
      const relevant = ratio > 0.005 || markedActive;
      const progress = ratio;
      sceneProgressRef.current = progress;
      sceneNearRef.current = relevant && progress >= 0.06;
      section.style.setProperty("--about-progress", progress.toFixed(4));
      const active = relevant && progress >= 0.08;
      setSectionActive(active);
      setCountEligible(relevant && progress >= 0.56);
      setMotionReady(true);
    };
    const requestMeasure = () => {
      if (!measureFrame) measureFrame = window.requestAnimationFrame(measure);
    };
    const updateFullpageState = () => {
      markedActive = section.dataset.fullpageActive === "true";
      requestMeasure();
    };
    const mutation = new MutationObserver(updateFullpageState);
    mutation.observe(section, { attributes: true, attributeFilter: ["data-fullpage-active"] });
    window.addEventListener("scroll", requestMeasure, { passive: true });
    window.addEventListener("resize", requestMeasure, { passive: true });
    measure();
    return () => {
      mutation.disconnect();
      window.cancelAnimationFrame(measureFrame);
      window.removeEventListener("scroll", requestMeasure);
      window.removeEventListener("resize", requestMeasure);
    };
  }, []);

  useEffect(() => {
    interactionPausedRef.current = dragging;
    hoverSlowRef.current = hovered;
  }, [dragging, hovered]);

  useEffect(() => {
    if (!countEligible || hasCounted.current) return;
    hasCounted.current = true;
    setCountStarted(true);
    if (reducedMotion) {
      setCountValues(stats.map((stat) => stat.value));
      return;
    }
    setCountValues(stats.map(() => 0));
    const startedAt = performance.now() + 150;
    const durations = [1900, 1050, 900, 1400];
    const tick = (now: number) => {
      let running = false;
      const values = stats.map((stat, index) => {
        const progress = Math.max(0, Math.min(1, (now - startedAt) / durations[index]));
        if (progress < 1) running = true;
        return Math.round(stat.value * easeOutCubic(progress));
      });
      setCountValues(values);
      if (running) countFrame.current = window.requestAnimationFrame(tick);
    };
    countFrame.current = window.requestAnimationFrame(tick);
  }, [countEligible, reducedMotion]);

  useEffect(() => {
    let lastFrameAt = performance.now();
    let renderedActive = -1;

    const renderCards = () => {
      const carousel = carouselRef.current;
      if (!carousel) return;
      const width = carousel.clientWidth || 800;
      const entry = reducedMotion
        ? 1
        : Math.max(0, Math.min(1, (sceneProgressRef.current - 0.08) / 0.34));
      const phase = phaseRef.current;
      const nearestOrder = ((Math.round(phase) % capabilities.length) + capabilities.length) % capabilities.length;
      const nearestIndex = visualOrder[nearestOrder];
      if (nearestIndex !== renderedActive) {
        renderedActive = nearestIndex;
        carousel.style.setProperty("--active-glow", capabilities[nearestIndex].color);
        setActiveIndex(nearestIndex);
      }

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const order = visualOrder.indexOf(index);
        const offset = wrapOffset(order - phase);
        const absolute = Math.abs(offset);
        const sign = Math.sign(offset);
        const spread = compactViewport ? 0.64 : 0.45;
        const naturalX = sign * width * spread * (1 - Math.exp(-absolute * 0.92));
        const naturalZ = 120 - Math.min(absolute, 2.5) * 235;
        const naturalY = absolute * (compactViewport ? 5 : 8);
        const naturalScale = Math.max(0.7, 1.06 - absolute * 0.155);
        const naturalRotateY = -sign * Math.min(19, absolute * 13.5);
        const naturalRotateZ = sign * Math.min(5, absolute * 2.8);
        const edgeFade = absolute > 2.2 ? Math.max(0, 1 - (absolute - 2.2) / 0.55) : 1;
        const naturalOpacity = Math.max(0.5, 1 - absolute * 0.2) * edgeFade;
        const depthParallax = Math.max(-1.5, 0.75 - absolute * 1.125);
        const x = naturalX * entry + parallaxRef.current.x * depthParallax;
        const y = 24 * (1 - entry) + naturalY * entry + parallaxRef.current.y * depthParallax;
        const z = -270 + (naturalZ + 270) * entry;
        const scale = 0.84 + (naturalScale - 0.84) * entry;
        const rotateY = naturalRotateY * entry;
        const rotateZ = naturalRotateZ * entry;
        const opacity = 0.22 + (naturalOpacity - 0.22) * entry;
        const blur = (1 - entry) * 3.5 + Math.max(0, absolute - 1.2) * 0.7;
        card.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px), ${z.toFixed(2)}px) rotateY(${rotateY.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
        card.style.opacity = opacity.toFixed(3);
        card.style.filter = `blur(${blur.toFixed(2)}px) saturate(${(0.76 + entry * 0.24).toFixed(3)})`;
        card.style.zIndex = String(100 - Math.round(absolute * 20));
        card.dataset.phaseOffset = offset.toFixed(3);
      });
    };

    renderCarouselRef.current = renderCards;
    const tick = (now: number) => {
      const delta = Math.min(48, Math.max(0, now - lastFrameAt));
      lastFrameAt = now;
      if (phaseTargetRef.current !== null) {
        if (reducedMotion) {
          phaseRef.current = phaseTargetRef.current;
          phaseVelocityRef.current = 0;
          phaseTargetRef.current = null;
        } else {
          const step = Math.min(0.032, delta / 1000);
          const distance = phaseRef.current - phaseTargetRef.current;
          const acceleration = -SNAP_STIFFNESS * distance - SNAP_DAMPING * phaseVelocityRef.current;
          phaseVelocityRef.current += acceleration * step;
          phaseRef.current += phaseVelocityRef.current * step;
          if (Math.abs(distance) < 0.018 && Math.abs(phaseVelocityRef.current) < 0.16) {
            phaseRef.current = phaseTargetRef.current;
            phaseVelocityRef.current = 0;
            phaseTargetRef.current = null;
          }
        }
      } else if (!reducedMotion && sceneNearRef.current && !interactionPausedRef.current && now >= resumeAtRef.current) {
        const fractional = Math.abs(phaseRef.current - Math.round(phaseRef.current));
        const orbitEase = 0.68 + Math.sin(Math.min(1, fractional * 2) * Math.PI / 2) * 0.32;
        const hoverFactor = hoverSlowRef.current ? 0.14 : 1;
        phaseRef.current += (delta / CARD_TRAVEL_MS) * orbitEase * hoverFactor;
      }
      renderCards();
      carouselFrame.current = window.requestAnimationFrame(tick);
    };
    carouselFrame.current = window.requestAnimationFrame(tick);
    return () => {
      if (carouselFrame.current !== null) window.cancelAnimationFrame(carouselFrame.current);
      renderCarouselRef.current = () => undefined;
    };
  }, [compactViewport, reducedMotion]);

  useEffect(() => () => {
    if (countFrame.current !== null) window.cancelAnimationFrame(countFrame.current);
  }, []);

  const moveBy = (direction: -1 | 1) => {
    phaseVelocityRef.current = 0;
    phaseTargetRef.current = Math.round(phaseRef.current) + direction;
    resumeAtRef.current = performance.now() + 2200;
  };

  const moveToCard = (index: number) => {
    const order = visualOrder.indexOf(index);
    phaseVelocityRef.current = 0;
    phaseTargetRef.current = phaseRef.current + wrapOffset(order - phaseRef.current);
    resumeAtRef.current = performance.now() + 2200;
  };

  const onScenePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reducedMotion || compactViewport || dragging) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 6;
    parallaxRef.current = { x, y };
    event.currentTarget.style.setProperty("--about-parallax-x", `${x.toFixed(2)}px`);
    event.currentTarget.style.setProperty("--about-parallax-y", `${y.toFixed(2)}px`);
  };

  const resetSceneParallax = () => {
    parallaxRef.current = { x: 0, y: 0 };
    rootRef.current?.style.setProperty("--about-parallax-x", "0px");
    rootRef.current?.style.setProperty("--about-parallax-y", "0px");
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest("[data-carousel-controls]")) return;
    pointer.current = {
      id: event.pointerId,
      startX: event.clientX,
      startPhase: phaseRef.current,
      x: event.clientX,
      time: performance.now(),
      velocityX: 0,
    };
    phaseVelocityRef.current = 0;
    phaseTargetRef.current = null;
    suppressClick.current = false;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (pointer.current.id !== event.pointerId) return;
    const time = performance.now();
    const width = carouselRef.current?.clientWidth || 800;
    const step = width * (compactViewport ? 0.5 : 0.36);
    pointer.current.velocityX = (event.clientX - pointer.current.x) / Math.max(1, time - pointer.current.time);
    pointer.current.x = event.clientX;
    pointer.current.time = time;
    const distance = event.clientX - pointer.current.startX;
    suppressClick.current = Math.abs(distance) > 7;
    phaseRef.current = pointer.current.startPhase - distance / step;
    renderCarouselRef.current();
  };

  const endPointer = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    if (pointer.current.id === event.pointerId) {
      const width = carouselRef.current?.clientWidth || 800;
      const step = width * (compactViewport ? 0.5 : 0.36);
      if (cancelled) {
        phaseTargetRef.current = Math.round(phaseRef.current);
        phaseVelocityRef.current = 0;
      } else {
        const releaseVelocity = Math.max(-2.4, Math.min(2.4, (-pointer.current.velocityX / step) * 1000));
        const currentNearest = Math.round(phaseRef.current);
        let target = Math.round(phaseRef.current + releaseVelocity * 0.18);
        if (Math.abs(releaseVelocity) > 0.48 && target === currentNearest) {
          target = currentNearest + Math.sign(releaseVelocity);
        }
        phaseVelocityRef.current = releaseVelocity;
        phaseTargetRef.current = target;
      }
      resumeAtRef.current = performance.now() + 2000;
    }
    pointer.current.id = -1;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaX) < 12 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    moveBy(event.deltaX > 0 ? 1 : -1);
  };

  return (
    <FullBleedSection
      aria-labelledby="about-wilo-title"
      className={styles.section}
      data-counted={countStarted}
      data-active={sectionActive}
      data-entered={sectionActive}
      data-motion-ready={motionReady}
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
            <h2 id="about-wilo-title">
              <span className={styles.headlineLine}><em>NUESTRO LÍMITE</em></span>
              <span className={styles.headlineLine}><b>ES TU CREATIVIDAD.</b></span>
            </h2>
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
            ref={carouselRef}
            style={{ "--active-glow": capabilities[activeIndex].color } as CSSProperties}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") { event.preventDefault(); moveBy(-1); }
              if (event.key === "ArrowRight") { event.preventDefault(); moveBy(1); }
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onPointerCancel={(event) => endPointer(event, true)}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(event) => endPointer(event)}
            onWheel={onWheel}
            role="region"
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
                    data-slide-key={item.key}
                    data-slide-index={index}
                    aria-hidden={Math.abs(position) > 2}
                    tabIndex={Math.abs(position) > 2 ? -1 : 0}
                    key={item.key}
                    onClick={() => { if (!suppressClick.current) moveToCard(index); }}
                    ref={(node) => { cardRefs.current[index] = node; }}
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
              <button onClick={() => moveBy(-1)} type="button" aria-label="Ver capacidad anterior"><ArrowLeft aria-hidden="true" /></button>
              <div aria-hidden="true">{capabilities.map((item, index) => <i data-active={index === activeIndex} key={item.key} />)}</div>
              <button onClick={() => moveBy(1)} type="button" aria-label="Ver capacidad siguiente"><ArrowRight aria-hidden="true" /></button>
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
          <p>MARCAS Y PROYECTOS<br />QUE CONFÍAN EN WILO</p>
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
