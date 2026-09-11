import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Globe2, UsersRound, ChartNoAxesCombined } from "lucide-react";
import { FullBleedSection } from "./HomeLayout";
import styles from "./closing-scenes.module.css";

const countries = [
  ["PE", "Perú", "Nuestro origen", "/flags/pe.svg"], ["MX", "México", "Atención remota", "/flags/mx.svg"],
  ["CO", "Colombia", "Atención remota", "/flags/co.svg"], ["CL", "Chile", "Atención remota", "/flags/cl.svg"],
  ["AR", "Argentina", "Atención remota", "/flags/ar.svg"], ["BR", "Brasil", "Atención remota", "/flags/br.svg"],
  ["US", "Estados Unidos", "Estructura internacional", "/flags/us.svg"], ["CA", "Canadá", "Atención remota", "/flags/ca.svg"],
  ["DE", "Alemania", "Atención remota", "/flags/de-country.svg"], ["EC", "Ecuador", "Atención remota", "/flags/ec.svg"],
  ["UY", "Uruguay", "Atención remota", "/flags/uy.svg"], ["BO", "Bolivia", "Atención remota", "/flags/bo.svg"],
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
          <div className={styles.entities} data-reveal="cards" aria-label="Entidades de Wilo Studio">
            <Link href="/#contacto-home" className={styles.entity}>
              <span className={styles.entityCountry}><Image src="/flags/pe.svg" alt="" width={44} height={30} /><b>PERÚ</b><small>01</small></span>
              <span className={styles.entityBody}><strong>WILO INDUSTRIES GROUP E.I.R.L.</strong><small>Facturación peruana</small></span>
              <span className={styles.entityArrow}><ArrowUpRight size={20} /></span>
            </Link>
            <Link href="/#contacto-home" className={styles.entity}>
              <span className={styles.entityCountry}><Image src="/flags/us.svg" alt="" width={44} height={30} /><b>USA</b><small>02</small></span>
              <span className={styles.entityBody}><strong>WILO GLOBAL INDUSTRIES LLC</strong><small>Facturación internacional</small></span>
              <span className={styles.entityArrow}><ArrowUpRight size={20} /></span>
            </Link>
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
        <strong>DE AREQUIPA<br /><em>AL MUNDO</em></strong>
        <div className={styles.countryWindow}><div className={styles.countryTrack}>{[0, 1].map((copy) => <div className={styles.countryGroup} key={copy} aria-hidden={copy === 1 ? true : undefined}>{countries.map(([code, name, note, flag]) => <div className={styles.country} key={code}><Image className={styles.countryFlag} src={flag} alt={copy ? "" : `Bandera de ${name}`} width={36} height={24} /><span><b>{name}</b><small>{note}</small></span></div>)}</div>)}</div></div>
      </div>
      <div className={styles.sceneSignature}><span>WILO STUDIO · IDEAS PARA UN MUNDO REAL</span><span>AREQUIPA, PERÚ — UNITED STATES — EL MUNDO</span></div>
    </FullBleedSection>
  );
}
