"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Braces,
  Layers3,
  MousePointer2,
  Workflow,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";
import styles from "./lab-explorer.module.css";

type LabModule = {
  key: string;
  label: string;
  description: string;
};

type LabCard = LabModule & {
  accent: string;
  accentRgb: string;
  asset: string;
  note: string;
  shortLabel: string;
  kind?: "cta";
};

const CARD_DETAILS: Record<string, Omit<LabCard, keyof LabModule>> = {
  dashboard: {
    accent: "#a9ef3f",
    accentRgb: "169, 239, 63",
    asset: "/wilo-lab/dashboard.webp",
    note: "Mira lo importante",
    shortLabel: "Dashboard",
  },
  admin: {
    accent: "#27d7f5",
    accentRgb: "39, 215, 245",
    asset: "/wilo-lab/admin.webp",
    note: "Todo bajo control",
    shortLabel: "Admin",
  },
  crm: {
    accent: "#438cff",
    accentRgb: "67, 140, 255",
    asset: "/wilo-lab/crm.webp",
    note: "Conecta relaciones",
    shortLabel: "CRM",
  },
  quote: {
    accent: "#f1c928",
    accentRgb: "241, 201, 40",
    asset: "/wilo-lab/quote.webp",
    note: "Cotiza sin fricción",
    shortLabel: "Cotizador",
  },
  tracking: {
    accent: "#37e88a",
    accentRgb: "55, 232, 138",
    asset: "/wilo-lab/tracking.webp",
    note: "Sigue el progreso",
    shortLabel: "Tracking",
  },
  api: {
    accent: "#845cff",
    accentRgb: "132, 92, 255",
    asset: "/wilo-lab/api.webp",
    note: "Conecta tu mundo",
    shortLabel: "API",
  },
  reports: {
    accent: "#ff6d73",
    accentRgb: "255, 109, 115",
    asset: "/wilo-lab/intelligence.webp",
    note: "Convierte datos en señales",
    shortLabel: "Inteligencia",
  },
};

const CTA_CARD: LabCard = {
  accent: "#37e88a",
  accentRgb: "55, 232, 138",
  asset: "/wilo-lab/custom-project.webp",
  description: "Estas son solo algunas de las cosas que podemos construir.",
  key: "custom",
  kind: "cta",
  label: "¿Tu proyecto no está acá?",
  note: "Lo hacemos posible",
  shortLabel: "¿Tu proyecto?",
};

const CHAMELEON_POSE: Record<string, { rotate: number; x: number; y: number }> = {
  api: { rotate: 4, x: 34, y: 2 },
  crm: { rotate: -4, x: -34, y: 2 },
  dashboard: { rotate: -1, x: 0, y: 0 },
  quote: { rotate: 2, x: 14, y: 3 },
  reports: { rotate: -2, x: -16, y: 1 },
  tracking: { rotate: 3, x: 30, y: 0 },
  admin: { rotate: -3, x: -22, y: 3 },
};

const VISUAL_ORDER = [
  "admin",
  "crm",
  "dashboard",
  "tracking",
  "api",
  "quote",
  "reports",
  "custom",
] as const;

function circularOffset(index: number, activeIndex: number, length: number) {
  let offset = index - activeIndex;
  if (offset > length / 2) offset -= length;
  if (offset < -length / 2) offset += length;
  return offset;
}

function samplePose(values: readonly number[], distance: number) {
  const bounded = Math.min(distance, values.length - 1);
  const lower = Math.floor(bounded);
  const upper = Math.ceil(bounded);
  const progress = bounded - lower;
  return values[lower] + (values[upper] - values[lower]) * progress;
}

function panelPose(offset: number) {
  const distance = Math.abs(offset);
  const side = Math.sign(offset);
  const forwardPositions = [0, 52, 84, 110, 128];
  const backwardPositions = [0, 40, 57, 92, 112];
  const scales = [1, .84, .68, .54, .46];
  const depths = [0, -180, -320, -420, -500];
  const opacity = [1, .9, .55, 0, 0];
  const rotateY = distance === 0 ? -1 : side * samplePose([0, -7, -10, -11, -12], distance);
  const rotateZ = distance === 0 ? -.35 : side * samplePose([0, 1.15, 2, 2.4, 2.7], distance);

  return {
    opacity: samplePose(opacity, distance),
    rotateY,
    rotateZ,
    scale: samplePose(scales, distance),
    x: `${side * samplePose(side < 0 ? backwardPositions : forwardPositions, distance)}%`,
    y: samplePose([14, 24, 42, 53, 60], distance),
    z: samplePose(depths, distance),
  };
}

function mixPanelPose(from: ReturnType<typeof panelPose>, to: ReturnType<typeof panelPose>, progress: number) {
  const mix = (start: number, end: number) => start + (end - start) * progress;
  return {
    opacity: mix(from.opacity, to.opacity),
    rotateY: mix(from.rotateY, to.rotateY),
    rotateZ: mix(from.rotateZ, to.rotateZ),
    scale: mix(from.scale, to.scale),
    x: `${mix(Number.parseFloat(from.x), Number.parseFloat(to.x))}%`,
    y: mix(from.y, to.y),
    z: mix(from.z, to.z),
  };
}

function visualOffset(card: LabCard, active: LabCard) {
  const cardVisualIndex = VISUAL_ORDER.indexOf(card.key as typeof VISUAL_ORDER[number]);
  const activeVisualIndex = VISUAL_ORDER.indexOf(active.key as typeof VISUAL_ORDER[number]);
  return circularOffset(cardVisualIndex, activeVisualIndex, VISUAL_ORDER.length);
}

export function LabExplorer({ modules }: { modules: readonly LabModule[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragGestureRef = useRef<{ lastAt: number; lastX: number; startX: number; velocity: number; card: string | null } | null>(null);
  const wheelLockRef = useRef(false);
  const resumeTimeoutRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragProgress, setDragProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const suppressClickRef = useRef(false);
  const [showAllModules, setShowAllModules] = useState(false);
  const [desktopAutoplay, setDesktopAutoplay] = useState(false);
  const reducedMotion = useHydratedReducedMotion();
  const rawTiltX = useMotionValue(0);
  const rawTiltY = useMotionValue(0);
  const tiltX = useSpring(rawTiltX, { damping: 25, stiffness: 130 });
  const tiltY = useSpring(rawTiltY, { damping: 25, stiffness: 130 });

  const cards = useMemo<LabCard[]>(() => {
    const configured = modules.flatMap((module) => {
      const detail = CARD_DETAILS[module.key];
      return detail ? [{ ...module, ...detail }] : [];
    });
    return [...configured, CTA_CARD];
  }, [modules]);

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + cards.length) % cards.length);
  }, [cards.length]);

  const move = useCallback((direction: -1 | 1) => {
    setActiveIndex((current) => {
      const visualIndex = VISUAL_ORDER.indexOf(cards[current].key as typeof VISUAL_ORDER[number]);
      for (let step = 1; step <= VISUAL_ORDER.length; step += 1) {
        const key = VISUAL_ORDER[(visualIndex + direction * step + VISUAL_ORDER.length) % VISUAL_ORDER.length];
        const next = cards.findIndex((card) => card.key === key);
        if (next >= 0) return next;
      }
      return current;
    });
  }, [cards]);

  const pauseInteraction = useCallback(() => {
    if (resumeTimeoutRef.current) window.clearTimeout(resumeTimeoutRef.current);
    setPaused(true);
  }, []);

  const resumeInteraction = useCallback((delay = 4000) => {
    if (resumeTimeoutRef.current) window.clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = window.setTimeout(() => {
      if (!hoverRef.current && !focusRef.current) setPaused(false);
    }, delay);
  }, []);

  useEffect(() => () => {
    if (resumeTimeoutRef.current) window.clearTimeout(resumeTimeoutRef.current);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting && entry.intersectionRatio > .55)),
      { threshold: [0, .55, .85] },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 801px) and (pointer: fine)");
    const sync = () => setDesktopAutoplay(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!desktopAutoplay || !inView || paused || reducedMotion || cards.length < 2) return;
    const timer = window.setInterval(() => move(1), 6000);
    return () => window.clearInterval(timer);
  }, [cards.length, desktopAutoplay, inView, move, paused, reducedMotion]);

  if (!cards.length) return null;
  const active = cards[activeIndex] ?? cards[0];
  const activeVisualIndex = VISUAL_ORDER.indexOf(active.key as typeof VISUAL_ORDER[number]);
  const chameleonPose = CHAMELEON_POSE[active.key] ?? { rotate: 0, x: 0, y: 0 };
  const dragTargetKey = VISUAL_ORDER[(activeVisualIndex + (dragProgress < 0 ? 1 : -1) + VISUAL_ORDER.length) % VISUAL_ORDER.length];
  const dragTargetIndex = cards.findIndex((card) => card.key === dragTargetKey);
  const dragTarget = cards[dragTargetIndex] ?? active;
  const stageStyle = {
    "--lab-accent": active.accent,
    "--lab-accent-rgb": active.accentRgb,
  } as CSSProperties;

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = dragGestureRef.current;
    if (gesture) {
      const now = performance.now();
      const elapsed = Math.max(1, now - gesture.lastAt);
      const delta = event.clientX - gesture.startX;
      gesture.velocity = ((event.clientX - gesture.lastX) / elapsed) * 1000;
      gesture.lastAt = now;
      gesture.lastX = event.clientX;
      const cardWidth = Math.max(320, (stageRef.current?.clientWidth ?? 800) * .59);
      setDragProgress(Math.max(-.94, Math.min(.94, delta / cardWidth)));
    }
    if (event.pointerType !== "mouse" || reducedMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
    rawTiltY.set(x * 1.5);
    rawTiltX.set(y * -1);
  };

  const resetTilt = () => {
    rawTiltX.set(0);
    rawTiltY.set(0);
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>, cancelled = false) => {
    const gesture = dragGestureRef.current;
    if (!gesture) return;
    const delta = event.clientX - gesture.startX;
    const projected = delta + gesture.velocity * .13;
    const threshold = Math.max(54, Math.min(92, (stageRef.current?.clientWidth ?? 800) * .075));
    dragGestureRef.current = null;
    setDragging(false);
    setDragProgress(0);
    suppressClickRef.current = Math.abs(delta) > 8;
    if (!cancelled && Math.abs(projected) > threshold) move(projected < 0 ? 1 : -1);
    else if (!cancelled && Math.abs(delta) < 8 && gesture.card) {
      const index = cards.findIndex((card) => card.key === gesture.card);
      if (index >= 0) goTo(index);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    resumeInteraction();
  };

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest("a, button:not([data-stage-target])")) return;
    suppressClickRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragGestureRef.current = {
      lastAt: performance.now(),
      lastX: event.clientX,
      startX: event.clientX,
      velocity: 0,
      card: (event.target as HTMLElement).closest("[data-stage-target]")?.getAttribute("data-stage-target") ?? null,
    };
    setDragging(true);
    pauseInteraction();
  };

  const handleHorizontalWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 26 || wheelLockRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    wheelLockRef.current = true;
    pauseInteraction();
    move(event.deltaX > 0 ? 1 : -1);
    window.setTimeout(() => {
      wheelLockRef.current = false;
      resumeInteraction();
    }, 900);
  };

  return (
    <div
      className={styles.explorer}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) { focusRef.current = false; resumeInteraction(); }
      }}
      onFocusCapture={() => { focusRef.current = true; pauseInteraction(); }}
      onMouseEnter={() => { hoverRef.current = true; pauseInteraction(); }}
      onMouseLeave={() => {
        hoverRef.current = false;
        resumeInteraction();
        resetTilt();
      }}
      ref={rootRef}
    >
      <div className={styles.ambient} aria-hidden="true"><i /><i /><i /><i /><i /></div>

      <div className={styles.sceneGrid} style={stageStyle}>
        <aside className={styles.intro}>
          <span className={styles.eyebrow}><b>05</b><i /> WILO LAB</span>
          <h2 className={styles.labTitle}>WILO <em>LAB</em></h2>
          <p className={styles.headline}>LO QUE VES<br />ES SOLO LA <strong>SUPERFICIE.</strong></p>
          <div className={styles.manifesto}>
            <p>Detrás de cada experiencia hay herramientas, automatizaciones y sistemas trabajando para que tu negocio funcione mejor.</p>
            <p>Tu negocio no debería adaptarse al software. <strong>El software debería adaptarse a tu negocio.</strong></p>
          </div>

          <div aria-label="Módulos de Wilo Lab" className={styles.selector} role="group">
            {cards.slice(0, showAllModules ? cards.length : 6).map((card, index) => (
              <button
                aria-controls="wilo-lab-stage"
                aria-pressed={index === activeIndex}
                className={index === activeIndex ? styles.selected : undefined}
                key={card.key}
                onClick={() => goTo(index)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                    event.preventDefault();
                    move(1);
                  }
                  if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                    event.preventDefault();
                    move(-1);
                  }
                }}
                type="button"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{card.shortLabel}</strong>
                <i aria-hidden="true" />
              </button>
            ))}
            {!showAllModules ? (
              <button className={styles.moduleMore} onClick={() => setShowAllModules(true)} type="button">
                <span>+</span><strong>2 más</strong><i aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </aside>

        <div
          aria-label="Carrusel 3D de soluciones Wilo Lab"
          aria-roledescription="carrusel"
          className={styles.stage}
          id="wilo-lab-stage"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              move(-1);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              move(1);
            }
            if (event.key === "Home") {
              event.preventDefault();
              goTo(0);
            }
            if (event.key === "End") {
              event.preventDefault();
              goTo(cards.length - 1);
            }
          }}
          onPointerCancel={(event) => finishDrag(event, true)}
          onPointerDown={startDrag}
          onPointerLeave={resetTilt}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onWheel={handleHorizontalWheel}
          ref={stageRef}
          role="region"
          style={stageStyle}
          tabIndex={0}
        >
          <span className={`${styles.handNote} ${styles.relationsNote}`} aria-hidden="true">Conecta<br />relaciones</span>
          <span className={`${styles.handNote} ${styles.adaptNote}`} aria-hidden="true">Construido para<br />adaptarse a ti.</span>
          <span className={`${styles.handNote} ${styles.progressNote}`} aria-hidden="true">Sigue<br />el progreso</span>
          <span className={`${styles.handNote} ${styles.connectNote}`} aria-hidden="true">Conecta<br />tu mundo</span>

          <motion.div className={styles.tiltScene} style={{ rotateX: tiltX, rotateY: tiltY }}>
            <motion.div className={styles.panelPlane}>
              {cards.map((card, index) => {
                const offset = visualOffset(card, active);
                const targetOffset = visualOffset(card, dragTarget);
                const draggedPose = mixPanelPose(panelPose(offset), panelPose(targetOffset), Math.abs(dragProgress));
                const distance = Math.abs(offset);
                const isActive = offset === 0;
                const cardStyle = {
                  "--card-accent": card.accent,
                  "--card-accent-rgb": card.accentRgb,
                  zIndex: isActive ? 50 : Math.max(1, 40 - distance * 10),
                } as CSSProperties;

                return (
                  <motion.article
                    animate={draggedPose}
                    initial={false}
                    aria-hidden={distance > 2}
                    className={`${styles.panel} ${card.kind === "cta" ? styles.ctaPanel : ""}`}
                    data-active={isActive ? "true" : "false"}
                    data-card={card.key}
                    data-distance={distance}
                    data-offset={offset}
                    key={card.key}
                    style={cardStyle}
                    transition={reducedMotion || dragging
                      ? { duration: 0 }
                      : { type: "spring", duration: .68, bounce: 0 }}
                  >
                    {card.kind !== "cta" ? (
                      <motion.div
                        animate={{ opacity: isActive ? 1 : 0, x: reducedMotion ? 0 : chameleonPose.x * .35, rotate: reducedMotion ? 0 : chameleonPose.rotate * .35 }}
                        aria-hidden="true"
                        className={styles.chameleon}
                        transition={{ duration: reducedMotion ? 0 : .6 }}
                      >
                        <Image alt="" fill sizes="(max-width: 800px) 42vw, 360px" src="/wilo-lab/chameleon-peek.webp" />
                      </motion.div>
                    ) : null}
                    <div className={styles.panelFrame}>
                      <Image
                        alt={`Interfaz de ${card.label}`}
                        className={styles.panelImage}
                        fill
                        priority={index === 0}
                        sizes="(max-width: 700px) 92vw, (max-width: 1200px) 66vw, 900px"
                        src={card.asset}
                      />
                      <div className={styles.panelReflection} aria-hidden="true" />

                      {card.kind === "cta" ? (
                        <div className={styles.ctaCopy}>
                          <span>UNA IDEA DIFERENTE</span>
                          <h3>¿TU PROYECTO<br />NO ESTÁ ACÁ?</h3>
                          <strong>HACEMOS REAL<br />LO QUE SE CREE IMPOSIBLE.</strong>
                          <p>{card.description}</p>
                          {isActive ? <Link href="/contacto">CUÉNTANOS TU IDEA <ArrowRight aria-hidden="true" /></Link> : null}
                        </div>
                      ) : (
                        <div className={styles.panelCaption}>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <strong>{isActive ? card.label : card.shortLabel}</strong>
                          <p>{card.description}</p>
                          <b>{card.note}</b>
                        </div>
                      )}

                      {!isActive && distance <= 2 ? <button
                        aria-label={`Mostrar ${card.shortLabel}`}
                        className={styles.panelHit}
                        data-stage-target={card.key}
                        onClick={() => { if (!suppressClickRef.current) goTo(index); }}
                        type="button"
                      /> : null}
                    </div>
                    {card.kind !== "cta" ? (
                      <motion.div
                        animate={{ opacity: isActive ? 1 : 0, x: reducedMotion ? 0 : chameleonPose.x * .35, rotate: reducedMotion ? 0 : chameleonPose.rotate * .35 }}
                        aria-hidden="true"
                        className={`${styles.chameleon} ${styles.chameleonFront}`}
                        transition={{ duration: reducedMotion ? 0 : .6 }}
                      >
                        <Image alt="" fill sizes="(max-width: 800px) 42vw, 360px" src="/wilo-lab/chameleon-peek.webp" />
                      </motion.div>
                    ) : null}
                    {isActive && card.kind !== "cta" ? <div aria-hidden="true" className={styles.contactShadow} /> : null}
                  </motion.article>
                );
              })}
            </motion.div>

          </motion.div>

          <div className={styles.stageGlow} aria-hidden="true" />
          <div className={styles.stageControls}>
            <button aria-label="Ver módulo anterior" onClick={() => move(-1)} type="button"><ArrowLeft aria-hidden="true" /></button>
            <div className={styles.pagination} aria-label={`${activeIndex + 1} de ${cards.length}`}>
              {cards.map((card, index) => (
                <button
                  aria-label={`Ir a ${card.shortLabel}`}
                  aria-pressed={index === activeIndex}
                  key={card.key}
                  onClick={() => goTo(index)}
                  type="button"
                ><i /></button>
              ))}
            </div>
            <button aria-label="Ver módulo siguiente" onClick={() => move(1)} type="button"><ArrowRight aria-hidden="true" /></button>
          </div>
          <span className={styles.dragHint}><MousePointer2 aria-hidden="true" /> Arrastra para explorar</span>
        </div>
      </div>

      <div className={styles.emotionalLine}>
        <h3>NO <strong>VENDEMOS SOFTWARE</strong><br />POR VENDER <em>SOFTWARE.</em></h3>
        <div>
          <p>Construimos herramientas para quitarte problemas, tiempo perdido y procesos que ya no deberían hacerse a mano.</p>
          <span>MENOS FRICCIÓN <i /> MÁS CONTROL <i /> MÁS TIEMPO PARA TU NEGOCIO</span>
        </div>
      </div>

      <div className={styles.featureRail} aria-label="Principios de Wilo Lab">
        <div><span><Layers3 aria-hidden="true" /></span><p><strong>Interfaces reales</strong><small>Herramientas que tu equipo puede usar.</small></p></div>
        <div><span><Workflow aria-hidden="true" /></span><p><strong>Flujos inteligentes</strong><small>Procesos conectados con menos fricción.</small></p></div>
        <div><span><Braces aria-hidden="true" /></span><p><strong>Soluciones a medida</strong><small>Lo que tu negocio necesita, sin ruido.</small></p></div>
      </div>
    </div>
  );
}
