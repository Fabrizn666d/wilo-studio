"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, Mail, MapPin, MessageCircle } from "lucide-react";
import type { PublicSiteSettings } from "@/lib/site-settings";
import { publicHref } from "@/lib/public-release";
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
          <div className={styles.contactMascot} data-reveal="visual" data-parallax="8">
            <Image src="/images/wilo/closing/contact-mascot.webp" alt="El camaleón de Wilo trabajando en su laptop y dando la bienvenida a tu idea" fill sizes="(max-width: 760px) 100vw, 45vw" />
          </div>
          <p className={styles.contactNote} data-reveal="note">Hablemos<br />de tu idea.</p>
        </div>

        <section className={styles.contactHub} data-reveal="cards" aria-labelledby="contact-hub-heading">
          <div className={styles.contactHubTop}>
            <span className={styles.hubKicker}>CONVERSEMOS</span>
            <h3 id="contact-hub-heading">Cuéntanos tu idea.</h3>
            <p>Empecemos con una conversación simple. Nosotros te ayudamos a encontrar el camino.</p>
            <a className={styles.contactPrimary} href={orientationHref} target="_blank" rel="noreferrer">
              <span className={styles.contactPrimaryIcon}><MessageCircle aria-hidden="true" /></span>
              <span>Escríbenos por WhatsApp<strong>{settings.phoneDisplay}</strong></span>
              <ArrowRight aria-hidden="true" />
            </a>
            <div className={styles.contactSecondary}>
              {settings.emailVerified ? (
                <a href={`mailto:${settings.email}`}><Mail aria-hidden="true" /><span>Correo<strong>{settings.email}</strong></span><ArrowUpRight aria-hidden="true" /></a>
              ) : (
                <Link href={publicHref("contact", "/contacto")}><Mail aria-hidden="true" /><span>Correo<strong>Enviar un mensaje</strong></span><ArrowUpRight aria-hidden="true" /></Link>
              )}
              <a href={meetingHref} target="_blank" rel="noreferrer"><CalendarDays aria-hidden="true" /><span>Google Meet<strong>Coordinar reunión</strong></span><ArrowUpRight aria-hidden="true" /></a>
            </div>
          </div>

          <div className={styles.mapPanel} data-reveal="visual" aria-label="Ubicación de Wilo Studio">
            {mapLoaded ? (
              <iframe title="Google Maps: ubicación general de Arequipa, Perú" src="https://maps.google.com/maps?q=Arequipa%2C%20Per%C3%BA&z=13&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            ) : (
              <button className={styles.mapPreview} onClick={() => setMapLoaded(true)} type="button">
                <span className={styles.mapStreets} aria-hidden="true" />
                <span className={styles.mapCenter}><MapPin /><strong>Arequipa, Perú</strong><small>Explorar en Google Maps</small></span>
                <span className={styles.mapProvider}>Cargar mapa interactivo <ArrowUpRight size={17} /></span>
              </button>
            )}
            <a className={styles.mapExternal} href={mapHref} target="_blank" rel="noreferrer">Ver en Google Maps<ArrowUpRight size={16} /></a>
            <div className={styles.mapIdentity}><MapPin aria-hidden="true" /><span><small>NUESTRO ORIGEN</small><strong>Arequipa, Perú</strong></span></div>
          </div>
        </section>
      </div>
      <div className={styles.sceneSignature}><span>WILO STUDIO · IDEAS PARA UN MUNDO REAL</span><span>AREQUIPA, PERÚ — UNITED STATES — EL MUNDO</span></div>
    </FullBleedSection>
  );
}
