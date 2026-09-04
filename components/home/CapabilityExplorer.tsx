"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Globe2,
  Headphones,
  Layers3,
  PenTool,
  Server,
  Share2,
  ShoppingBag,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Capability } from "@/data/studio";
import styles from "./capability-explorer.module.css";

const capabilityIcons: Record<Capability["visual"], LucideIcon> = {
  browser: Globe2,
  commerce: ShoppingBag,
  dashboard: Layers3,
  quote: SlidersHorizontal,
  mobile: Smartphone,
  flow: Share2,
  identity: PenTool,
  media: Clapperboard,
  server: Server,
  support: Headphones,
};

type SelectCapability = (index: number) => void;

function CapabilityButton({
  capability,
  index,
  active,
  wide = false,
  onSelect,
}: {
  capability: Capability;
  index: number;
  active: boolean;
  wide?: boolean;
  onSelect: SelectCapability;
}) {
  const Icon = capabilityIcons[capability.visual];
  const select = () => onSelect(index);

  return (
    <button
      aria-label={`Explorar ${capability.name}`}
      aria-pressed={active}
      className={`${styles.capabilityCard} ${wide ? styles.wideCard : ""} ${active ? styles.activeCard : ""}`}
      onClick={select}
      onFocus={select}
      onMouseEnter={select}
      type="button"
    >
      <span className={styles.cardIcon} aria-hidden="true"><Icon strokeWidth={1.45} /></span>
      <span className={styles.cardCopy}>
        <small>{capability.number}</small>
        <strong>{capability.name}</strong>
        {wide ? <em>{capability.description}</em> : null}
      </span>
      <ArrowRight className={styles.cardArrow} aria-hidden="true" strokeWidth={1.5} />
    </button>
  );
}

function ProductInterface({ capability }: { capability: Capability }) {
  return (
    <div className={styles.productInterface} data-visual={capability.visual} aria-hidden="true">
      <div className={styles.laptop}>
        <div className={styles.laptopFrame}>
          <div className={styles.appTopbar}>
            <span className={styles.miniMark}>w</span>
            <i /><i /><i /><b>Wilo Studio</b>
          </div>
          <div className={styles.appBody}>
            <div className={styles.appNav}>
              <span className={styles.navActive} /><span /><span /><span /><span />
            </div>
            <div className={styles.dashboard}>
              <div className={styles.dashboardHeading}>
                <span>Hola, Equipo Wilo</span><i>Este mes</i>
              </div>
              <div className={styles.metrics}>
                <div><small>VENTAS</small><strong>S/ 128,430</strong><b>+12.5%</b></div>
                <div><small>USUARIOS</small><strong>2,540</strong><b>+8.2%</b></div>
                <div><small>PROYECTOS</small><strong>18</strong><b>+2</b></div>
              </div>
              <div className={styles.charts}>
                <div className={styles.lineChart}>
                  <span>Desempeño</span>
                  <svg viewBox="0 0 260 94" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={`capability-chart-${capability.slug}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#f1b824" stopOpacity=".32" />
                        <stop offset="1" stopColor="#f1b824" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,82 C22,76 31,43 53,50 C72,57 78,23 102,34 C124,44 129,70 151,55 C171,42 184,17 203,29 C224,41 236,17 260,9 L260,94 L0,94 Z" fill={`url(#capability-chart-${capability.slug})`} />
                    <path className={styles.chartLine} d="M0,82 C22,76 31,43 53,50 C72,57 78,23 102,34 C124,44 129,70 151,55 C171,42 184,17 203,29 C224,41 236,17 260,9" />
                  </svg>
                </div>
                <div className={styles.activityPanel}>
                  <span>Actividad</span><i /><i /><i /><i />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.laptopBase} />
      </div>

      <div className={styles.phone}>
        <span className={styles.phoneSpeaker} />
        <div className={styles.phoneTitle}><i />Actividad</div>
        <div className={styles.progressRing}><strong>72%</strong><small>completo</small></div>
        <div className={styles.phoneRows}><i /><i /><i /></div>
      </div>
      <div className={styles.interfaceGlow} />
      <Sparkles className={styles.interfaceSpark} />
    </div>
  );
}

function ActiveCapability({
  active,
  activeIndex,
  items,
  onSelect,
  reducedMotion,
}: {
  active: Capability;
  activeIndex: number;
  items: readonly Capability[];
  onSelect: SelectCapability;
  reducedMotion: boolean;
}) {
  const previous = () => onSelect((activeIndex - 1 + items.length) % items.length);
  const next = () => onSelect((activeIndex + 1) % items.length);

  return (
    <section className={styles.stage} aria-live="polite" aria-label={`Capacidad activa: ${active.name}`}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className={styles.stageInner}
          exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          key={active.slug}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.stageCopy}>
            <span className={styles.stageNumber}>{active.number}</span>
            <h3>{active.name}</h3>
            <p>{active.description}</p>
            <ul>
              {active.items.map((item) => (
                <li key={item}><Check aria-hidden="true" strokeWidth={2} />{item}</li>
              ))}
            </ul>
            <Link href={`/contacto?servicio=${active.slug}`}>
              Ver más <ArrowRight aria-hidden="true" strokeWidth={1.6} />
            </Link>
          </div>
          <ProductInterface capability={active} />
        </motion.div>
      </AnimatePresence>

      <div className={styles.stageNavigation}>
        <button type="button" onClick={previous} aria-label="Capacidad anterior"><ChevronLeft aria-hidden="true" /></button>
        <div aria-label="Seleccionar capacidad">
          {items.map((item, index) => (
            <button
              aria-label={item.name}
              aria-pressed={index === activeIndex}
              className={index === activeIndex ? styles.activeDot : undefined}
              key={item.slug}
              onClick={() => onSelect(index)}
              type="button"
            />
          ))}
        </div>
        <button type="button" onClick={next} aria-label="Siguiente capacidad"><ChevronRight aria-hidden="true" /></button>
      </div>
    </section>
  );
}

export function CapabilityExplorer({ items }: { items: readonly Capability[] }) {
  const featuredIndex = Math.min(4, Math.max(items.length - 1, 0));
  const [activeIndex, setActiveIndex] = useState(featuredIndex);
  const reducedMotion = Boolean(useReducedMotion());
  const resolvedIndex = activeIndex < items.length ? activeIndex : featuredIndex;
  const active = items[resolvedIndex];

  if (!active) return null;

  const leftItems = items.slice(0, 4);
  const rightItems = items.slice(5, 8);
  const bottomItems = items.slice(8, 10);

  return (
    <div className={styles.explorer}>
      <nav className={styles.mobileCatalog} aria-label="Capacidades de Wilo Studio">
        {items.map((item, index) => (
          <CapabilityButton active={index === resolvedIndex} capability={item} index={index} key={item.slug} onSelect={setActiveIndex} />
        ))}
      </nav>

      <div className={styles.matrix}>
        <nav className={`${styles.sideCatalog} ${styles.leftCatalog}`} aria-label="Capacidades uno a cuatro">
          {leftItems.map((item, index) => (
            <CapabilityButton active={index === resolvedIndex} capability={item} index={index} key={item.slug} onSelect={setActiveIndex} />
          ))}
        </nav>

        <ActiveCapability active={active} activeIndex={resolvedIndex} items={items} onSelect={setActiveIndex} reducedMotion={reducedMotion} />

        <nav className={`${styles.sideCatalog} ${styles.rightCatalog}`} aria-label="Capacidades seis a ocho">
          {rightItems.map((item, offset) => {
            const index = offset + 5;
            return <CapabilityButton active={index === resolvedIndex} capability={item} index={index} key={item.slug} onSelect={setActiveIndex} />;
          })}
        </nav>

        <nav className={styles.bottomCatalog} aria-label="Capacidades nueve y diez">
          {bottomItems.map((item, offset) => {
            const index = offset + 8;
            return <CapabilityButton active={index === resolvedIndex} capability={item} index={index} key={item.slug} onSelect={setActiveIndex} wide />;
          })}
        </nav>
      </div>

      <div className={styles.signature} aria-hidden="true">
        <BarChart3 /><span>Tecnología con <b>propósito.</b> Resultados que <b>trascienden.</b></span>
      </div>
    </div>
  );
}
