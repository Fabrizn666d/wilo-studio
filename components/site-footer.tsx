"use client";

import Link from "next/link";
import { ArrowUp, ArrowUpRight, Globe2, Grid2X2, House, Mail, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { Brand } from "./brand";
import { useSiteSettings } from "./site-settings-provider";
import styles from "./site-footer.module.css";

const columns = [
  { title: "ESTUDIO", subtitle: "Conoce nuestro mundo", icon: House, links: [["Nosotros", "/nosotros"], ["Servicios", "/servicios"], ["Proyectos", "/proyectos"], ["Trabajos", "/#trabajos"], ["Contacto", "/contacto"]] },
  { title: "ECOSISTEMA", subtitle: "Más allá de un estudio", icon: Grid2X2, links: [["Wilo Express", "/express"], ["Wilo Education", "/education"], ["Wilo Events", "/events"], ["Wilo Store", "/tienda"], ["Todo el ecosistema", "/#ecosistema"]] },
  { title: "LEGAL", subtitle: "Transparencia siempre", icon: ShieldCheck, links: [["Política de privacidad", "/privacidad"], ["Términos y condiciones", "/terminos"], ["Política de cookies", "/privacidad#cookies"], ["Libro de reclamaciones", "/libro-de-reclamaciones"], ["Medios de pago", "/medios-de-pago"]] },
];

export function SiteFooter() {
  const settings = useSiteSettings();
  const confirmedCompanyRuc = settings.legalName.trim().toUpperCase() === "WILO INDUSTRIES GROUP S.A.C." && /^\d{11}$/.test(settings.ruc) ? settings.ruc : null;
  return (
    <footer className={styles.footer} id="footer" aria-label="Información de Wilo Studio">
      <div className={styles.main}>
        <div className={styles.identity}>
          <Brand />
          <p className={styles.promise}>Transformamos ideas<br />en experiencias<br />digitales excepcionales.</p>
          <span className={styles.yellowRule} />
          <div className={styles.contacts}>
            {settings.emailVerified ? <a href={`mailto:${settings.email}`}><Mail /><span><strong>{settings.email}</strong><small>Hablemos de tu proyecto</small></span></a> : <Link href="/contacto"><Mail /><span><strong>Hablemos de tu proyecto</strong><small>Escríbenos aquí</small></span></Link>}
            <a href={settings.whatsapp} target="_blank" rel="noreferrer"><MessageCircle /><span><strong>{settings.phoneDisplay}</strong><small>Conversemos por WhatsApp</small></span></a>
            <span><MapPin /><span><strong>{settings.location}</strong><small>Desde el sur para el mundo</small></span></span>
          </div>
          <p className={styles.handNote}>Ideas<br />que conectan.</p>
        </div>
        {columns.map(({ title, subtitle, icon: Icon, links }) => <nav className={styles.column} key={title} aria-label={title}><div className={styles.columnHeading}><Icon /><div><h2>{title}</h2><p>{subtitle}</p></div></div><div className={styles.links}>{links.map(([label, href]) => <Link key={href} href={href}>{label}<ArrowUpRight size={14} /></Link>)}</div></nav>)}
        <div className={styles.about}>
          <h2>SOMOS WILO STUDIO</h2>
          <p>Creatividad, tecnología y personas, trabajando por un mundo digital más increíble.</p>
          <span className={styles.yellowRule} />
          <p className={styles.manifesto}>Buenas ideas.<br />Trabajo real.<br /><strong>Grandes posibilidades.</strong></p>
          <span className={styles.smallW} aria-hidden="true">w<span>.</span></span>
          <p className={styles.keepCreating}>¡Sigamos creando!</p>
        </div>
      </div>
      <div className={styles.legal}>
        <p><strong>© {new Date().getFullYear()} Wilo Studio.</strong><span>Todos los derechos reservados.</span></p>
        <p><strong>WILO INDUSTRIES GROUP S.A.C.</strong><span>{confirmedCompanyRuc ? `RUC ${confirmedCompanyRuc} · ` : ""}Perú · Facturación peruana.</span></p>
        <p><strong>WILO GLOBAL INDUSTRIES LLC</strong><span>United States · Facturación internacional.</span></p>
        <Link href="/medios-de-pago" className={styles.billing}><Globe2 /><span>Ideas sin fronteras<small>Un mismo compromiso.</small></span><ArrowUpRight size={16} /></Link>
      </div>
      <div className={styles.bottom}><span>AREQUIPA, PERÚ · UNITED STATES · EL MUNDO</span><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}>Volver arriba<ArrowUp size={16} /></button></div>
    </footer>
  );
}
