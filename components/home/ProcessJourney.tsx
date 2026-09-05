"use client";

import {
  ChartNoAxesCombined,
  Check,
  CodeXml,
  LayoutTemplate,
  Lightbulb,
  ListChecks,
  Rocket,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";
import { FullBleedSection, ViewportFrame } from "./HomeLayout";
import styles from "./process-journey.module.css";

type ProcessStep = {
  readonly number: string;
  readonly name: string;
  readonly text: string;
};

const visualLabels = [
  "Idea y descubrimiento",
  "Mapa de estrategia",
  "Wireframes de interfaz",
  "Desarrollo de la solución",
  "Control de calidad",
  "Lanzamiento",
  "Métricas y evolución",
] as const;

function IdeaVisual() {
  return (
    <div className={styles.ideaVisual}>
      <div className={styles.ideaTabs}><i /><i /><i /></div>
      <div className={styles.notebook}>
        <span className={styles.notebookSpiral} />
        <Lightbulb aria-hidden="true" />
        <div className={styles.sketchGrid}><i /><i /><i /><i /></div>
      </div>
    </div>
  );
}

function StrategyVisual() {
  return (
    <div className={styles.panelVisual}>
      <strong>Mapa del proyecto</strong>
      <ul>
        <li><Target aria-hidden="true" /><span>Objetivos</span><i>›</i></li>
        <li><span className={styles.peopleGlyph}>•••</span><span>Audiencia</span><i>›</i></li>
        <li><span className={styles.radarGlyph} /><span>Competencia</span><i>›</i></li>
        <li><Lightbulb aria-hidden="true" /><span>Propuesta de valor</span><i>›</i></li>
      </ul>
    </div>
  );
}

function DesignVisual() {
  return (
    <div className={styles.designVisual}>
      <div className={styles.browserFrame}>
        <div className={styles.windowBar}><i /><i /><i /></div>
        <span className={styles.wireHero} />
        <div className={styles.wireCards}><i /><i /></div>
      </div>
      <div className={styles.phoneFrame}>
        <span />
        <i /><i /><i />
      </div>
      <LayoutTemplate className={styles.visualBadge} aria-hidden="true" />
    </div>
  );
}

function DevelopmentVisual() {
  return (
    <div className={styles.codeVisual}>
      <div className={styles.windowBar}><i /><i /><i /><span>build.tsx</span></div>
      <div className={styles.codeLines}>
        <i /><i /><i /><i /><i /><i /><i /><i />
      </div>
      <span className={styles.codeBadge}><CodeXml aria-hidden="true" /></span>
    </div>
  );
}

function QualityVisual() {
  return (
    <div className={styles.panelVisual}>
      <strong>Control de calidad</strong>
      <ul>
        {["Funcionalidad", "Usabilidad", "Rendimiento", "Seguridad"].map((item) => (
          <li key={item}><ListChecks aria-hidden="true" /><span>{item}</span><Check aria-hidden="true" /></li>
        ))}
      </ul>
    </div>
  );
}

function LaunchVisual() {
  return (
    <div className={styles.launchVisual}>
      <span className={styles.starField}><i /><i /><i /><i /><i /><i /></span>
      <span className={styles.launchHalo} />
      <Rocket aria-hidden="true" />
      <div className={styles.launchClouds}><i /><i /><i /></div>
    </div>
  );
}

function EvolutionVisual() {
  return (
    <div className={styles.evolutionVisual}>
      <span className={`${styles.orbitArrow} ${styles.orbitArrowTop}`}>↗</span>
      <div className={styles.metricCard}>
        <span>Métricas</span>
        <svg aria-hidden="true" viewBox="0 0 120 54" preserveAspectRatio="none">
          <path d="M0 47H120M0 27H120M0 8H120" />
          <polyline points="3,43 19,34 34,39 51,21 67,27 84,12 99,19 117,5" />
        </svg>
        <small><i /> Crecimiento</small>
      </div>
      <span className={`${styles.orbitArrow} ${styles.orbitArrowBottom}`}>↙</span>
      <ChartNoAxesCombined className={styles.metricIcon} aria-hidden="true" />
    </div>
  );
}

function ProcessVisual({ index }: { index: number }) {
  const visualIndex = index % visualLabels.length;
  return (
    <div
      aria-label={visualLabels[visualIndex]}
      className={styles.processVisual}
      data-visual={visualIndex}
      role="img"
    >
      {visualIndex === 0 ? <IdeaVisual /> : null}
      {visualIndex === 1 ? <StrategyVisual /> : null}
      {visualIndex === 2 ? <DesignVisual /> : null}
      {visualIndex === 3 ? <DevelopmentVisual /> : null}
      {visualIndex === 4 ? <QualityVisual /> : null}
      {visualIndex === 5 ? <LaunchVisual /> : null}
      {visualIndex === 6 ? <EvolutionVisual /> : null}
    </div>
  );
}

export function ProcessJourney({ steps }: { steps: readonly ProcessStep[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useHydratedReducedMotion();
  const [entered, setEntered] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const activate = () => {
      if (section.dataset.fullpageActive === "true") setEntered(true);
    };
    activate();
    const mutation = new MutationObserver(activate);
    mutation.observe(section, { attributes: true, attributeFilter: ["data-fullpage-active"] });
    const native = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !document.documentElement.classList.contains("wilo-fullpage")) setEntered(true);
    }, { threshold: .12 });
    native.observe(section);
    return () => { mutation.disconnect(); native.disconnect(); };
  }, []);

  useEffect(() => {
    if (!entered || reducedMotion) return;
    const timers = steps.map((_, index) => window.setTimeout(() => setActiveStep(index), 350 + index * 210));
    return () => timers.forEach(window.clearTimeout);
  }, [entered, reducedMotion, steps]);

  if (steps.length === 0) return null;

  return (
    <FullBleedSection className={styles.section} id="proceso" ref={sectionRef} aria-labelledby="process-journey-title" spacing="scene" data-scene-theme="dark" data-process-entered={entered || reducedMotion}>
      <div className={styles.atmosphere} aria-hidden="true"><i /><i /><i /></div>
      <ViewportFrame className={styles.shell} size="wide">
        <header className={styles.header}>
          <span className={styles.eyebrow} data-reveal="detail"><i aria-hidden="true" />07 <b>·</b> NUESTRO PROCESO<i aria-hidden="true" /></span>
          <h2 id="process-journey-title" data-reveal="title">CÓMO CONSTRUIMOS</h2>
          <p data-reveal="detail">De la idea al lanzamiento: un proceso claro, creativo y técnico.</p>
        </header>

        <div className={styles.journey}>
          <div className={styles.horizontalTrack} aria-hidden="true">
            <motion.i initial={false} animate={{ scaleX: reducedMotion || entered ? 1 : 0 }} transition={{ duration: reducedMotion ? 0 : 1.8, ease: "easeInOut", delay: .25 }} />
          </div>
          <div className={styles.verticalTrack} aria-hidden="true">
            <motion.i initial={false} animate={{ scaleY: reducedMotion || entered ? 1 : 0 }} transition={{ duration: reducedMotion ? 0 : 1.8, ease: "easeInOut", delay: .25 }} />
          </div>

          <ol className={styles.steps}>
            {steps.map((step, index) => {
              const state = hoveredStep === index ? "current" : reducedMotion || index < activeStep ? "complete" : index === activeStep ? "current" : "upcoming";
              return (
                <li
                  aria-current={state === "current" ? "step" : undefined}
                  className={styles.step}
                  data-state={state}
                  data-reveal="media"
                  style={{ "--reveal-order": index } as CSSProperties}
                  onMouseEnter={() => setHoveredStep(index)}
                  onMouseLeave={() => setHoveredStep(null)}
                  key={`${step.number}-${step.name}`}
                >
                  <ProcessVisual index={index} />
                  <div className={styles.marker} aria-hidden="true"><span>{step.number}</span></div>
                  <div className={styles.stepContent}>
                    <h3>{step.name}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <p className={styles.closing} data-reveal="detail"><span aria-hidden="true">[</span>Cada etapa tiene propósito. Cada decisión busca resultados.<span aria-hidden="true">]</span></p>
        <div className={styles.scrollCue} aria-hidden="true"><i /><span>⌄</span></div>
      </ViewportFrame>
    </FullBleedSection>
  );
}
