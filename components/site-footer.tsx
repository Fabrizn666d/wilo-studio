"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUp,
  ArrowUpRight,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Youtube,
} from "lucide-react";
import { useSiteSettings } from "./site-settings-provider";
import { publicHref } from "@/lib/public-release";
import { siteConfig } from "@/lib/content";
import styles from "./site-footer.module.css";

type FooterLink = readonly [label: string, href: string];

const studioLinks: FooterLink[] = [
  ["Nosotros", publicHref("about", "/nosotros")],
  ["Servicios", "/#servicios"],
  ["Proyectos", publicHref("projects", "/proyectos")],
  ["Trabajos", "/#trabajos"],
  ["Contacto", "/#contacto-home"],
];

const ecosystemLinks: FooterLink[] = [
  ["Wilo Express", publicHref("express", process.env.NEXT_PUBLIC_WILO_EXPRESS_URL || "https://wilo.site")],
  ["Wilo Education", publicHref("education", "/education")],
  ["Wilo Events", publicHref("events", "/events")],
  ["Wilo Store", publicHref("store", "/tienda")],
  ["Todo el ecosistema", "/#ecosistema"],
];

const legalLinks: FooterLink[] = [
  ["Política de privacidad", "/privacidad"],
  ["Términos y condiciones", "/terminos"],
  ["Política de cookies", "/privacidad#cookies"],
  ["Medios de pago", "/medios-de-pago"],
];

function FooterNavLinks({ links }: { links: FooterLink[] }) {
  return (
    <div className={styles.links}>
      {links.map(([label, href]) => {
        const external = href.startsWith("http");
        return external ? (
          <a href={href} key={`${label}-${href}`} rel="noreferrer" target="_blank">
            {label}<ArrowUpRight aria-hidden="true" />
          </a>
        ) : (
          <Link href={href} key={`${label}-${href}`}>
            {label}{label.startsWith("Wilo ") ? <ArrowUpRight aria-hidden="true" /> : null}
          </Link>
        );
      })}
    </div>
  );
}

export function SiteFooter() {
  const settings = useSiteSettings();
  const ein = siteConfig.ein;
  const footerEmail = "comercial@wilostudio.site";
  const socialProfiles = [
    { label: "Instagram", href: process.env.NEXT_PUBLIC_WILO_INSTAGRAM_URL, Icon: Instagram },
    { label: "LinkedIn", href: process.env.NEXT_PUBLIC_WILO_LINKEDIN_URL, Icon: Linkedin },
    { label: "YouTube", href: process.env.NEXT_PUBLIC_WILO_YOUTUBE_URL, Icon: Youtube },
  ];

  return (
    <footer className={styles.footer} id="footer" aria-label="Pie de página de Wilo Studio">
      <div className={styles.footerMain}>
        <section className={styles.brandBlock} aria-label="Wilo Studio">
          <Link href="/" className={styles.logoLink} aria-label="Wilo Studio — Inicio">
            <Image
              className={styles.logo}
              src="/images/logo-wilo-new.png"
              alt="Wilo Studio"
              width={190}
              height={116}
              sizes="190px"
            />
          </Link>
          <p className={styles.brandPromise}>Ideas que <strong>conectan.</strong></p>
          <small>Experiencias digitales excepcionales.</small>
          <div className={styles.socials} aria-label="Redes sociales">
            {socialProfiles.map(({ label, href, Icon }) => href ? (
              <a href={href} key={label} aria-label={label} rel="noreferrer" target="_blank"><Icon aria-hidden="true" /></a>
            ) : (
              <span key={label} aria-label={`${label}, enlace pendiente de configurar`} role="img"><Icon aria-hidden="true" /></span>
            ))}
          </div>
        </section>

        <nav className={`${styles.footerGroup} ${styles.studio}`} aria-label="Estudio">
          <h2>ESTUDIO</h2>
          <i className={styles.headingRule} />
          <FooterNavLinks links={studioLinks} />
        </nav>

        <nav className={`${styles.footerGroup} ${styles.ecosystem}`} aria-label="Ecosistema">
          <h2>ECOSISTEMA</h2>
          <i className={styles.headingRule} />
          <FooterNavLinks links={ecosystemLinks} />
        </nav>

        <section className={`${styles.footerGroup} ${styles.legalBlock}`} aria-labelledby="footer-legal-title">
          <h2 id="footer-legal-title">LEGAL</h2>
          <i className={styles.headingRule} />
          <div className={styles.legalContent}>
            <div className={styles.entities}>
              <article>
                <strong>WILO INDUSTRIES GROUP E.I.R.L.</strong>
              </article>
              <article>
                <strong>WILO GLOBAL INDUSTRIES LLC</strong>
                {ein ? <span>EIN: {ein}</span> : process.env.NODE_ENV === "development" ? <span>EIN pendiente de confirmar</span> : null}
              </article>
            </div>
            <Link className={styles.complaintsBook} href="/libro-de-reclamaciones">
              <Image src="/images/wilo/legal/libro-reclamaciones.jpg" alt="Libro de Reclamaciones" width={137} height={93} sizes="137px" />
              <span>LIBRO DE<br />RECLAMACIONES <ArrowUpRight aria-hidden="true" /></span>
            </Link>
          </div>
          <FooterNavLinks links={legalLinks} />
        </section>

        <section className={`${styles.footerGroup} ${styles.footerContact}`} aria-labelledby="footer-contact-title">
          <h2 id="footer-contact-title">HABLEMOS</h2>
          <i className={styles.headingRule} />
          <div className={styles.contactList}>
            <a className={styles.contactItem} href={settings.whatsapp} rel="noreferrer" target="_blank">
              <i className={styles.whatsappIcon}><MessageCircle aria-hidden="true" /></i>
              <span><strong>{settings.phoneDisplay}</strong><small>Escríbenos por WhatsApp</small></span>
            </a>
            <a className={styles.contactItem} href={`mailto:${footerEmail}`}>
              <i className={styles.mailIcon}><Mail aria-hidden="true" /></i>
              <span><strong>{footerEmail}</strong><small>Envíanos un correo</small></span>
            </a>
            <div className={styles.contactItem}>
              <i className={styles.locationIcon}><MapPin aria-hidden="true" /></i>
              <span><strong>{settings.location}</strong><small>Desde aquí para el mundo</small></span>
            </div>
          </div>
        </section>

        <aside className={styles.mascotBlock} aria-label="Un mundo digital más increíble">
          <p>Un mundo<br />digital más<br />increíble.</p>
          <i className={styles.mascotRule} />
          <div className={styles.mascotArt}>
            <Image
              src="/images/wilo/hero/chameleon-pc.webp"
              alt="Camaleón de Wilo Studio mirando hacia nuevos proyectos"
              width={230}
              height={277}
              sizes="230px"
            />
          </div>
        </aside>
      </div>

      <div className={styles.footerBottom}>
        <p>© {new Date().getFullYear()} Wilo Studio. Todos los derechos reservados.</p>
        <div className={styles.worldLine} aria-label="Presencia de Wilo Studio">
          <span><MapPin aria-hidden="true" />Arequipa, Perú</span>
          <span>United States</span>
          <span>El mundo</span>
          <span>Ideas sin fronteras.</span>
        </div>
        <button
          type="button"
          onClick={() => window.scrollTo({
            top: 0,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          })}
        >
          <ArrowUp aria-hidden="true" /> Volver arriba
        </button>
      </div>
    </footer>
  );
}
