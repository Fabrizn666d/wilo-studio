"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./hero-wilo.module.css";
import { LanguageSwitcher } from "../language-switcher";
import { useI18n } from "../i18n-provider";
import { publicHref } from "@/lib/public-release";

const heroLinks = [
  { label: "nav.work", href: "/#trabajos" },
  { label: "nav.projects", href: publicHref("projects", "/proyectos") },
  { label: "nav.services", href: "/#servicios" },
  { label: "nav.about", href: publicHref("about", "/nosotros") },
  { label: "nav.ecosystem", href: "/#ecosistema" },
  { label: "nav.contact", href: "/#contacto-home" },
] as const;

const showcaseLinks = [
  { label: "nav.home", href: "/" },
  { label: "nav.work", href: "/#trabajos" },
  { label: "nav.services", href: "/#servicios" },
  { label: "nav.about", href: publicHref("about", "/nosotros") },
  { label: "nav.contact", href: "/#contacto-home" },
] as const;

export function HeroNavigation({ subpage = false }: { subpage?: boolean }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const navigationLinks = pathname === "/sitios-reales" ? showcaseLinks : heroLinks;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateNavigation = () => setScrolled(window.scrollY > 24);

    updateNavigation();
    window.addEventListener("scroll", updateNavigation, { passive: true });
    return () => window.removeEventListener("scroll", updateNavigation);
  }, []);

  useEffect(() => {
    const syncActiveSection = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (id) setActiveSection(id);
    };
    window.addEventListener("wilo:fullpagechange", syncActiveSection);
    return () => window.removeEventListener("wilo:fullpagechange", syncActiveSection);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const menuTrigger = menuButtonRef.current;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? [],
      ).filter((element) => element.tabIndex >= 0);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      menuTrigger?.focus();
    };
  }, [menuOpen]);

  const logo = (
    <Link
      className={styles.logoLink}
      href="/"
      aria-label="Wilo Studio — Inicio"
      data-wilo-logo-target
    >
      <Image
        className={styles.logoImage}
        src="/images/wilo/hero/wilo-logo.webp"
        alt="Wilo Studio"
        width={1045}
        height={639}
        priority
        sizes="84px"
      />
    </Link>
  );

  const labTheme = !subpage && activeSection === "lab";
  const lightScene = subpage || (scrolled && ["sobre-wilo", "servicios", "audiovisual", "confianza", "tecnologia", "store", "ecosistema", "nosotros", "internacional", "pie-de-pagina"].includes(activeSection));
  const routeIsActive = (href: string) => {
    if (!subpage) return false;
    if (href === "/proyectos") return pathname.startsWith("/proyectos") || pathname.startsWith("/portafolio");
    if (href === "/nosotros") return pathname.startsWith("/nosotros");
    if (href === "/contacto") return pathname.startsWith("/contacto") || pathname.startsWith("/cotizar");
    if (href === "/#servicios") return pathname.startsWith("/servicios");
    if (href === "/#ecosistema") return ["/education", "/events", "/express", "/tienda"].some((route) => pathname.startsWith(route));
    return false;
  };

  return (
    <header
      className={`${styles.navigation} ${scrolled ? styles.navigationScrolled : ""} ${labTheme ? styles.navigationLab : ""} ${subpage ? styles.navigationSubpage : ""}`}
      data-home-navigation
      data-i18n-manual
      data-theme={labTheme ? "lab" : "default"}
      data-scene-tone={lightScene ? "light" : "dark"}
    >
      <div className={styles.navigationInner}>
        {logo}
        <nav className={styles.desktopNavigation} aria-label={t("a11y.homeNavigation")}>
          {navigationLinks.map((item) => {
            const id = item.href.startsWith("/#") ? item.href.slice(2) : "";
            const isActive = routeIsActive(item.href) || Boolean(!subpage && id && id === activeSection);
            return <Link aria-current={isActive ? (subpage ? "page" : "location") : undefined} data-active={isActive} href={item.href} key={item.label}>{t(item.label)}</Link>;
          })}
        </nav>
        <div className={styles.navigationActions}>
          <LanguageSwitcher compact />
          <Link className={styles.navigationCta} href={publicHref("quote", "/cotizar")}>
            {t("nav.startProject")} <span aria-hidden="true">↗</span>
          </Link>
          <button
            ref={menuButtonRef}
            className={styles.menuButton}
            type="button"
            aria-label={t("a11y.openMenu")}
            aria-controls="hero-mobile-navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <span /><span />
          </button>
        </div>
      </div>

      <div
        ref={menuRef}
        id="hero-mobile-navigation"
        className={`${styles.mobileNavigation} ${menuOpen ? styles.mobileNavigationOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("a11y.mobileNavigation")}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className={styles.mobileNavigationHead}>
          {logo}
          <button
            ref={closeButtonRef}
            className={styles.menuClose}
            type="button"
            aria-label={t("a11y.closeMenu")}
            onClick={() => setMenuOpen(false)}
          ><span aria-hidden="true">×</span></button>
        </div>
        <nav aria-label={t("a11y.mobileNavigation")}>
          {navigationLinks.map((item, index) => (
            <Link aria-current={routeIsActive(item.href) || item.href === `/#${activeSection}` ? (subpage ? "page" : "location") : undefined} data-active={routeIsActive(item.href) || item.href === `/#${activeSection}`} href={item.href} key={item.label} onClick={() => setMenuOpen(false)}>
              <span>0{index + 1}</span>{t(item.label)}
            </Link>
          ))}
        </nav>
        <Link className={styles.mobileNavigationCta} href={publicHref("quote", "/cotizar")} onClick={() => setMenuOpen(false)}>
          {t("nav.startProject")} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}
