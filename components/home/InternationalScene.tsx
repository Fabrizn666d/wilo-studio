import Image from "next/image";
import { ArrowUpRight, Globe2, UsersRound, ChartNoAxesCombined } from "lucide-react";
import { FullBleedSection } from "./HomeLayout";
import styles from "./closing-scenes.module.css";

const countries = [
  ["PE", "Perú", "Nuestro origen"], ["MX", "México", "Atención remota"],
  ["CO", "Colombia", "Atención remota"], ["CL", "Chile", "Atención remota"],
  ["AR", "Argentina", "Atención remota"], ["BR", "Brasil", "Atención remota"],
  ["US", "Estados Unidos", "Estructura internacional"], ["CA", "Canadá", "Atención remota"],
  ["DE", "Alemania", "Atención remota"], ["EC", "Ecuador", "Atención remota"],
  ["UY", "Uruguay", "Atención remota"], ["BO", "Bolivia", "Atención remota"],
] as const;

export function InternationalScene() {
  return (
    <FullBleedSection id="internacional" className={styles.international} data-theme="light" aria-labelledby="international-heading">
      <div className={styles.internationalMain}>
        <div className={styles.desk} data-reveal="visual" data-parallax="10">
          <Image src="/images/wilo/closing/international-desk.webp" alt="Escritorio creativo con laptop, fotografía de Arequipa y herramientas de trabajo" fill sizes="(max-width: 760px) 100vw, 75vw" />
        </div>
        <div className={styles.internationalCopy}>
          <p className={styles.eyebrow} data-reveal="eyebrow"><span>12</span><i /> WILO SIN FRONTERAS</p>
          <h2 id="international-heading" data-reveal="heading">DE AREQUIPA<br />PARA DONDE<br /><em>LLEGUEN<br />LAS IDEAS<span>.</span></em></h2>
          <p className={styles.intro} data-reveal="copy">Wilo Studio nació en Arequipa, Perú. Hoy nuestra estructura nos permite desarrollar proyectos, coordinar equipos y atender a clientes dentro y fuera del país.</p>
          <div className={styles.entities} data-reveal="cards">
            <a href="/contacto" className={styles.entity}><span className={styles.entityMark}>w<span>ilo</span><small>STUDIO</small></span><span><strong>WILO GLOBAL INDUSTRIES LLC</strong><small>United States</small><small>Facturación internacional</small></span><ArrowUpRight size={20} /></a>
            <a href="/contacto" className={styles.entity}><span className={styles.entityMark}>w<span>ilo</span><small>STUDIO</small></span><span><strong>WILO INDUSTRIES GROUP E.I.R.L.</strong><small>Perú</small><small>Facturación peruana</small></span><ArrowUpRight size={20} /></a>
          </div>
          <div className={styles.internationalBenefits} data-reveal="details"><span><Globe2 />Atención<br />remota</span><span><UsersRound />Proyectos<br />sin fronteras</span><span><ChartNoAxesCombined />Mismos estándares<br />de calidad</span></div>
          <p className={styles.handNote} data-reveal="note">Las buenas ideas<br />no necesitan pasaporte.</p>
        </div>
        <div className={styles.connections} data-reveal="details" aria-label="Desde Arequipa hacia nuevos mercados">
          <svg viewBox="0 0 620 240" role="img" aria-label="Conexiones desde Arequipa hacia Latinoamérica, Estados Unidos, Canadá y Europa">
            <g className={styles.connectionLines}><path d="M245 196 Q237 55 84 25" /><path d="M245 196 Q205 101 65 84" /><path d="M245 196 Q165 189 51 150" /><path d="M245 196 Q298 72 489 44" /><path d="M245 196 Q335 128 553 115" /></g>
            <g fill="currentColor"><circle cx="84" cy="25" r="4" /><circle cx="65" cy="84" r="4" /><circle cx="51" cy="150" r="4" /><circle cx="489" cy="44" r="4" /><circle cx="553" cy="115" r="4" /></g>
            <circle className={styles.originPoint} cx="245" cy="196" r="6" />
            <g className={styles.connectionLabels}><text x="100" y="29">Canadá</text><text x="81" y="88">Estados Unidos</text><text x="67" y="154">Latinoamérica</text><text x="504" y="48">Europa</text><text x="445" y="140">Nuevos destinos</text><text x="262" y="200">Arequipa · PERÚ</text></g>
          </svg>
        </div>
        <p className={styles.globalNote} data-reveal="note">Un mismo propósito<br />en cualquier lugar.</p>
      </div>
      <div className={styles.countryRail} aria-label="Mercados que podemos atender">
        <strong>ATENCIÓN<br />SIN FRONTERAS</strong>
        <div className={styles.countryWindow}><div className={styles.countryTrack}>{[0, 1].map((copy) => <div className={styles.countryGroup} key={copy} aria-hidden={copy === 1 ? true : undefined}>{countries.map(([code, name, note]) => <div className={styles.country} key={code}><span className={styles.countryCode} data-country={code}>{code}</span><span><b>{name}</b><small>{note}</small></span></div>)}</div>)}</div></div>
      </div>
      <div className={styles.sceneSignature}><span>WILO STUDIO · IDEAS PARA UN MUNDO REAL</span><span>AREQUIPA, PERÚ — UNITED STATES — EL MUNDO</span></div>
    </FullBleedSection>
  );
}
