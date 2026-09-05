import Image from "next/image";
import { ArrowUpRight, MapPin } from "lucide-react";
import { aboutWilo } from "@/data/studio";
import { FullBleedSection, ViewportFrame } from "./HomeLayout";
import styles from "./origin-scene.module.css";

export function OriginScene() {
  return (
    <FullBleedSection id="nosotros" aria-labelledby="origin-title" className={styles.section}>
      <ViewportFrame size="wide" className={styles.frame}>
        <div className={styles.topline} data-reveal><span>11 — NUESTRO ORIGEN</span><span>16°24′ S · 71°32′ O</span></div>
        <div className={styles.composition}>
          <div className={styles.copy}>
            <span className={styles.origin} data-reveal><MapPin aria-hidden="true" /> AREQUIPA, PERÚ</span>
            <h2 id="origin-title" data-reveal>SOMOS DE<br />AREQUIPA.<br /><em>CONSTRUIMOS</em><br />PARA CUALQUIER<br />LUGAR.</h2>
            <p data-reveal>{aboutWilo.story}</p>
            <a href="#internacional" className={styles.link} data-reveal>De aquí, al mundo <ArrowUpRight aria-hidden="true" /></a>
          </div>
          <figure className={styles.photograph} data-reveal="media">
            <div className={styles.photoSurface} data-parallax="10"><Image src="/images/wilo/generated/about-arequipa-v2.webp" alt="La arquitectura de Arequipa y el Misti bajo la luz de la mañana" fill sizes="(max-width: 800px) 100vw, 58vw" /></div>
            <figcaption><span>NUESTRA TIERRA.<br />NUESTRA FORMA DE VER.</span><span>Arequipa,<br /><em>siempre.</em></span></figcaption>
          </figure>
        </div>
        <div className={styles.intentions}>
          <article data-reveal><span>01 / MISIÓN</span><p>{aboutWilo.mission}</p></article>
          <article data-reveal><span>02 / VISIÓN</span><p>{aboutWilo.vision}</p></article>
          <div className={styles.signature} data-reveal><span>Ideas locales.</span><strong>Impacto real.</strong></div>
        </div>
        <ul className={styles.values} aria-label="Nuestros valores" data-reveal>{aboutWilo.values.map(value => <li key={value}>{value}</li>)}</ul>
      </ViewportFrame>
    </FullBleedSection>
  );
}
