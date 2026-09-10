"use client";

import Link from "next/link";
import { ArrowUp, ArrowUpRight, Globe2, Grid2X2, House, Mail, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { Fragment } from "react";
import { Brand } from "./brand";
import { useSiteSettings } from "./site-settings-provider";
import { useI18n } from "./i18n-provider";
import styles from "./site-footer.module.css";

function withBreaks(value: string) {
  return value.split("\n").map((line, index) => <Fragment key={`${line}-${index}`}>{index > 0 ? <br /> : null}{line}</Fragment>);
}

export function SiteFooter() {
  const settings = useSiteSettings();
  const { t } = useI18n();
  const confirmedCompanyRuc = settings.legalName.trim().toUpperCase() === "WILO INDUSTRIES GROUP E.I.R.L." && /^\d{11}$/.test(settings.ruc) ? settings.ruc : null;
  const columns = [
    { title: "ESTUDIO", subtitle: t("footer.studioSubtitle"), icon: House, links: [[t("nav.about"), "/nosotros"], [t("nav.services"), "/#servicios"], [t("nav.projects"), "/proyectos"], [t("nav.work"), "/#trabajos"], [t("nav.contact"), "/contacto"]] },
    { title: t("nav.ecosystem").toLocaleUpperCase(), subtitle: t("footer.ecosystemSubtitle"), icon: Grid2X2, links: [["Wilo Express", process.env.NEXT_PUBLIC_WILO_EXPRESS_URL || "https://wilo.site"], ["Wilo Education", "/education"], ["Wilo Events", "/events"], ["Wilo Store", "/tienda"], [t("footer.allEcosystem"), "/#ecosistema"]] },
    { title: t("footer.legal"), subtitle: t("footer.legalSubtitle"), icon: ShieldCheck, links: [[t("footer.privacy"), "/privacidad"], [t("footer.terms"), "/terminos"], [t("footer.cookies"), "/privacidad#cookies"], [t("footer.complaints"), "/libro-de-reclamaciones"], [t("footer.payments"), "/medios-de-pago"]] },
  ];
  return (
    <footer className={styles.footer} data-i18n-manual id="footer" aria-label={t("footer.aria")}>
      <div className={styles.main}>
        <div className={styles.identity}>
          <Brand />
          <p className={styles.promise}>{withBreaks(t("footer.promise"))}</p>
          <span className={styles.yellowRule} />
          <div className={styles.contacts}>
            {settings.emailVerified ? <a href={`mailto:${settings.email}`}><Mail /><span><strong>{settings.email}</strong><small>{t("footer.projectTalk")}</small></span></a> : <Link href="/contacto"><Mail /><span><strong>{t("footer.projectTalk")}</strong><small>{t("footer.writeHere")}</small></span></Link>}
            <a href={settings.whatsapp} target="_blank" rel="noreferrer"><MessageCircle /><span><strong>{settings.phoneDisplay}</strong><small>{t("footer.whatsappTalk")}</small></span></a>
            <span><MapPin /><span><strong>{settings.location}</strong><small>{t("footer.fromSouth")}</small></span></span>
          </div>
          <p className={styles.handNote}>{withBreaks(t("footer.connectingIdeas"))}</p>
        </div>
        {columns.map(({ title, subtitle, icon: Icon, links }) => <nav className={styles.column} key={title} aria-label={title}><div className={styles.columnHeading}><Icon /><div><h2>{title}</h2><p>{subtitle}</p></div></div><div className={styles.links}>{links.map(([label, href]) => href.startsWith("http") ? <a key={href} href={href} target="_blank" rel="noreferrer">{label}<ArrowUpRight size={14} /></a> : <Link key={href} href={href}>{label}<ArrowUpRight size={14} /></Link>)}</div></nav>)}
        <div className={styles.about}>
          <h2>{t("footer.weAre")}</h2>
          <p>{t("footer.about")}</p>
          <span className={styles.yellowRule} />
          <p className={styles.manifesto}>{withBreaks(t("footer.manifesto"))}</p>
          <span className={styles.smallW} aria-hidden="true">w<span>.</span></span>
          <p className={styles.keepCreating}>{t("footer.keepCreating")}</p>
        </div>
      </div>
      <div className={styles.legal}>
        <p><strong>© {new Date().getFullYear()} Wilo Studio.</strong><span>{t("footer.rights")}</span></p>
        <p><strong>WILO INDUSTRIES GROUP E.I.R.L.</strong><span>{confirmedCompanyRuc ? `RUC ${confirmedCompanyRuc} · ` : ""}{t("footer.peruvianBilling")}</span></p>
        <p><strong>WILO GLOBAL INDUSTRIES LLC</strong><span>{t("footer.globalBilling")}</span></p>
        <Link href="/medios-de-pago" className={styles.billing}><Globe2 /><span>{t("footer.borderlessIdeas")}<small>{t("footer.sameCommitment")}</small></span><ArrowUpRight size={16} /></Link>
      </div>
      <div className={styles.bottom}><span>{t("footer.worldLine")}</span><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}>{t("footer.backTop")}<ArrowUp size={16} /></button></div>
    </footer>
  );
}
