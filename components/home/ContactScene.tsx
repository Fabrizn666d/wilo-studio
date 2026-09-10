"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, FileText, Globe2, Headphones, Mail, MapPin, MessageCircle, UsersRound, Zap } from "lucide-react";
import type { PublicSiteSettings } from "@/lib/site-settings";
import { FullBleedSection } from "./HomeLayout";
import styles from "./closing-scenes.module.css";

const mapHref = "https://www.google.com/maps/search/?api=1&query=Arequipa%2C%20Per%C3%BA";

export function ContactScene({ settings }: { settings: PublicSiteSettings }) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const orientationHref = `https://wa.me/${settings.phone}?text=${encodeURIComponent("Hola Wilo Studio, tengo una idea y quisiera agendar una conversación para recibir orientación.")}`;
  const meetingHref = `https://wa.me/${settings.phone}?text=${encodeURIComponent("Hola Wilo Studio, quisiera coordinar una reunión por Google Meet para conversar sobre mi proyecto.")}`;
  return (
    <FullBleedSection id="contacto-home" className={styles.contact} data-theme="light" aria-labelledby="contact-scene-heading">
      <div className={styles.contactGrid}>
        <div className={styles.contactLead}>
          <p className={styles.eyebrow} data-reveal="eyebrow"><span>13</span><i /> HABLEMOS</p>
          <h2 id="contact-scene-heading" data-reveal="heading">¿QUÉ<br /><em>CONSTRUIMOS</em><br />AHORA?</h2>
          <p className={styles.contactIntro} data-reveal="copy">No necesitas tener todo resuelto.<br />Cuéntanos tu idea y la convertimos en una solución real, desde Arequipa para el mundo.</p>
          <div className={styles.contactMascot} data-reveal="visual" data-parallax="8"><Image src="/images/wilo/closing/contact-mascot.webp" alt="El camaleón de Wilo trabajando en su laptop y dando la bienvenida a tu idea" fill sizes="(max-width: 760px) 100vw, 43vw" /></div>
          <p className={styles.contactNote} data-reveal="note">Hablemos<br />de tu idea.</p>
        </div>
        <div className={styles.contactActions}>
          <div className={styles.optionGrid}>
            <article className={styles.contactOption} data-reveal="cards"><span className={styles.optionNumber}>01<MessageCircle /></span><h3>NECESITO<br />ORIENTACIÓN</h3><p>Tengo una idea, pero necesito que me guíen y me propongan la mejor solución.</p><a href={orientationHref} target="_blank" rel="noreferrer">Agendar conversación<ArrowRight size={19} /></a></article>
            <article className={styles.contactOption} data-reveal="cards"><span className={styles.optionNumber}>02<FileText /></span><h3>QUIERO<br />COTIZAR</h3><p>Ya sé lo que necesito. Quiero una propuesta formal para mi proyecto.</p><Link href="/cotizar" className={styles.quoteLink}>Iniciar proyecto<ArrowRight size={19} /></Link></article>
          </div>
          <div className={styles.mapPanel} data-reveal="visual">
            {mapLoaded ? <iframe title="Google Maps: ubicación general de Arequipa, Perú" src="https://maps.google.com/maps?q=Arequipa%2C%20Per%C3%BA&z=13&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /> : <button className={styles.mapPreview} onClick={() => setMapLoaded(true)} type="button"><span className={styles.mapStreets} aria-hidden="true" /><span className={styles.mapCenter}><MapPin /><strong>Arequipa, Perú</strong><small>Explorar en Google Maps</small></span><span className={styles.mapProvider}>Cargar mapa interactivo <ArrowUpRight size={17} /></span></button>}
            <a className={styles.mapExternal} href={mapHref} target="_blank" rel="noreferrer">Ver en Google Maps<ArrowUpRight size={16} /></a>
          </div>
        </div>
        <aside className={styles.quickContact}>
          <p className={styles.quickLabel} data-reveal="copy">O ESCRÍBENOS<br />DIRECTAMENTE</p>
          <div className={styles.quickLinks} data-reveal="details"><a className={styles.whatsappLink} href={settings.whatsapp} target="_blank" rel="noreferrer"><MessageCircle /><span>WhatsApp<strong>{settings.phoneDisplay}</strong></span><ArrowRight size={18} /></a>{settings.emailVerified ? <a href={`mailto:${settings.email}`}><Mail /><span>Correo<strong>{settings.email}</strong></span><ArrowRight size={18} /></a> : <Link href="/contacto"><Mail /><span>Escríbenos<strong>Enviar un mensaje</strong></span><ArrowRight size={18} /></Link>}<a href={meetingHref} target="_blank" rel="noreferrer"><CalendarDays /><span>Coordinar Google Meet</span><ArrowRight size={18} /></a></div>
          <div className={styles.locationCopy} data-reveal="copy"><MapPin /><div><span>NUESTRO ORIGEN</span><h3>Arequipa, Perú</h3><p>Atención remota a nivel nacional e internacional.</p></div></div>
          <div className={styles.locationPhoto} data-reveal="visual"><Image src="/images/wilo/generated/about-arequipa-v2.webp" alt="La arquitectura de Arequipa, nuestro punto de partida" fill sizes="(max-width: 760px) 90vw, 22vw" /><p>Arequipa siempre será<br />el punto de partida.</p></div>
        </aside>
      </div>
      <div className={styles.contactBenefits} data-reveal="details">{[[Headphones, "TE ESCUCHAMOS", "Sin compromiso"], [Zap, "RESPUESTA CERCANA", "Por WhatsApp o formulario"], [UsersRound, "ATENCIÓN PERSONALIZADA", "Para cada tipo de proyecto"], [Globe2, "DESDE AREQUIPA", "Hacia cualquier lugar"]].map(([Icon, title, subtitle]) => { const BenefitIcon = Icon as typeof Headphones; return <div key={String(title)}><BenefitIcon /><span><strong>{String(title)}</strong><small>{String(subtitle)}</small></span></div>; })}</div>
      <div className={styles.sceneSignature}><span>WILO STUDIO · IDEAS PARA UN MUNDO REAL</span><span>AREQUIPA, PERÚ — UNITED STATES — EL MUNDO</span></div>
    </FullBleedSection>
  );
}
