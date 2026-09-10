"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  Camera,
  Code2,
  Cpu,
  GraduationCap,
  Lightbulb,
  Monitor,
  MonitorSmartphone,
  ShieldCheck,
  ShoppingBag,
  Volume2,
  Zap,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "./ecosystem-explorer.module.css";

type EcosystemLine = {
  key: string;
  href: string;
};

const featureGroups = {
  express: [
    { label: "Rápido", icon: Zap },
    { label: "Seguro", icon: ShieldCheck },
    { label: "Responsive", icon: MonitorSmartphone },
  ],
  education: [
    { label: "Robótica", icon: Bot },
    { label: "Tecnología", icon: Cpu },
    { label: "Programación", icon: Code2 },
    { label: "Aprendizaje", icon: GraduationCap },
  ],
  events: [
    { label: "Audio", icon: Volume2 },
    { label: "Iluminación", icon: Lightbulb },
    { label: "Pantallas", icon: Monitor },
    { label: "Producción", icon: Camera },
  ],
} as const;

function FeatureRow({ group }: { group: keyof typeof featureGroups }) {
  return (
    <ul className={styles.featureRow} aria-label="Características principales">
      {featureGroups[group].map(({ label, icon: Icon }) => (
        <li key={label}><Icon aria-hidden="true" /><span>{label}</span></li>
      ))}
    </ul>
  );
}

export function EcosystemExplorer({ lines }: { lines: readonly EcosystemLine[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const href = (key: string, fallback: string) => lines.find((line) => line.key === key)?.href || fallback;

  useEffect(() => {
    setReady(true);
    const node = rootRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12%", threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={`${styles.showcase} ${ready ? styles.ready : ""} ${visible ? styles.visible : ""}`}>
      <header className={`${styles.heading} ${styles.reveal}`}>
        <div className={styles.headingCopy}>
          <span className={styles.eyebrow}><i />10 · ECOSISTEMA WILO</span>
          <h2 id="ecosystem-title">UNA MARCA.<br />CINCO FORMAS <em>DE CREAR.</em></h2>
          <p>Tecnología, educación, experiencias y equipamiento conectados bajo una misma visión.</p>
        </div>
        <span className={styles.giantW} aria-hidden="true">W</span>
        <span className={styles.dotField} aria-hidden="true" />
        <svg className={styles.editorialLine} viewBox="0 0 720 110" preserveAspectRatio="none" aria-hidden="true">
          <path d="M12 79 C120 86 190 31 290 58 S398 91 468 47 S584 69 700 33" />
          <circle cx="12" cy="79" r="5" /><circle cx="700" cy="33" r="7" />
        </svg>
      </header>

      <div className={styles.grid} data-horizontal-scroll>
        <article className={`${styles.card} ${styles.studio} ${styles.reveal}`} style={{ "--delay": "80ms" } as CSSProperties}>
          <span className={styles.backgroundWord} aria-hidden="true">CREATE</span>
          <div className={styles.cardCopy}>
            <div className={styles.cardIndex}><strong>01</strong><span>DIGITAL</span></div>
            <h3>Wilo Studio</h3>
            <p>Web, sistemas, aplicaciones y automatización a medida.</p>
            <Link href={href("studio", "/#servicios")}>Conocer Studio <ArrowUpRight aria-hidden="true" /></Link>
          </div>
          <Image className={`${styles.deviceArt} ${styles.mediaReveal}`} src="/ecosystem/studio/studio-devices.png" alt="Wilo Studio mostrado en una laptop y una tienda digital en celular" width={1800} height={1140} sizes="(max-width: 760px) 92vw, 48vw" />
        </article>

        <article className={`${styles.card} ${styles.express} ${styles.reveal}`} style={{ "--delay": "170ms" } as CSSProperties}>
          <span className={styles.backgroundWord} aria-hidden="true">FAST</span>
          <div className={styles.cardCopy}>
            <div className={styles.cardIndex}><strong>02</strong><span>EXPRESS</span></div>
            <h3>Wilo <em>Express</em></h3>
            <p>Webs rápidas, administrables y profesionales para lanzar tu negocio sin complicaciones.</p>
            <Link href={href("express", process.env.NEXT_PUBLIC_WILO_EXPRESS_URL || "https://wilo.site")}>Conocer Express <ArrowUpRight aria-hidden="true" /></Link>
          </div>
          <Image className={`${styles.deviceArt} ${styles.mediaReveal}`} src="/ecosystem/express/express-devices.png" alt="La web real de Wilo Express presentada en laptop y celular" width={1800} height={1140} sizes="(max-width: 760px) 92vw, 48vw" />
          <FeatureRow group="express" />
        </article>

        <article className={`${styles.card} ${styles.education} ${styles.reveal}`} style={{ "--delay": "260ms" } as CSSProperties}>
          <span className={styles.backgroundWord} aria-hidden="true">LEARN</span>
          <div className={styles.cardCopy}>
            <div className={styles.cardIndex}><strong>03</strong><span>STEM</span></div>
            <h3>Wilo <em>Education</em></h3>
            <p>Robótica, tecnología y experiencias STEM para instituciones y estudiantes.</p>
            <Link href={href("education", "/education")}>Conocer Education <ArrowUpRight aria-hidden="true" /></Link>
          </div>
          <Image className={`${styles.robotArt} ${styles.mediaReveal}`} src="/ecosystem/education/education-robot.webp" alt="Robot educativo modular de Wilo Education" width={1024} height={1024} sizes="(max-width: 760px) 88vw, 36vw" />
          <FeatureRow group="education" />
        </article>

        <article className={`${styles.card} ${styles.events} ${styles.reveal}`} style={{ "--delay": "350ms" } as CSSProperties}>
          <div className={`${styles.eventsMedia} ${styles.mediaReveal}`} aria-hidden="true">
            <Image src="/ecosystem/events/events-stage.webp" alt="" fill sizes="(max-width: 760px) 94vw, 48vw" />
          </div>
          <span className={styles.backgroundWord} aria-hidden="true">LIVE</span>
          <div className={styles.cardCopy}>
            <div className={styles.cardIndex}><strong>04</strong><span>EXPERIENCIAS</span></div>
            <h3>Wilo <em>Events</em></h3>
            <p>Producción audiovisual e infraestructura técnica para eventos y experiencias corporativas.</p>
            <Link href={href("events", "/events")}>Conocer Events <ArrowUpRight aria-hidden="true" /></Link>
          </div>
          <FeatureRow group="events" />
        </article>
      </div>

      <article className={`${styles.storeBand} ${styles.reveal}`} style={{ "--delay": "440ms" } as CSSProperties}>
        <div className={styles.storeIdentity}><span>05 · EQUIPAMIENTO</span><h3>Wilo <em>Store</em></h3></div>
        <p>Tecnología para trabajar, crear y crecer.<br /><span>Equipos · Componentes · Periféricos · Software</span></p>
        <ShoppingBag className={styles.storeGraphic} aria-hidden="true" />
        <Link href={href("store", "/tienda")}>Explorar catálogo <ArrowUpRight aria-hidden="true" /></Link>
      </article>
    </div>
  );
}
