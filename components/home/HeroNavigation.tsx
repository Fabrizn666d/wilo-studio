"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./hero-wilo.module.css";

const heroLinks = [
  { label: "Trabajos", href: "/#trabajos" },
  { label: "Proyectos", href: "/proyectos" },
  { label: "Servicios", href: "/#servicios" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Ecosistema", href: "/#ecosistema" },
  { label: "Contacto", href: "/contacto" },
] as const;

export function HeroNavigation() {
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

  return (
    <header className={`${styles.navigation} ${scrolled ? styles.navigationScrolled : ""}`} data-home-navigation>
      <div className={styles.navigationInner}>
        {logo}
        <nav className={styles.desktopNavigation} aria-label="Navegación del inicio">
          {heroLinks.map((item) => {
            const id = item.href.startsWith("/#") ? item.href.slice(2) : "";
            const isActive = Boolean(id && id === activeSection);
            return <Link aria-current={isActive ? "location" : undefined} data-active={isActive} href={item.href} key={item.href}>{item.label}</Link>;
          })}
        </nav>
        <div className={styles.navigationActions}>
          <span className={styles.locale} aria-label="Idioma: español">ES <i aria-hidden="true">⌄</i></span>
          <Link className={styles.navigationCta} href="/contacto#cotizador">
            Iniciar un proyecto <span aria-hidden="true">↗</span>
          </Link>
          <button
            ref={menuButtonRef}
            className={styles.menuButton}
            type="button"
            aria-label="Abrir menú"
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
        aria-label="Menú principal"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className={styles.mobileNavigationHead}>
          {logo}
          <button
            ref={closeButtonRef}
            className={styles.menuClose}
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
          ><span aria-hidden="true">×</span></button>
        </div>
        <nav aria-label="Navegación móvil del inicio">
          {heroLinks.map((item, index) => (
            <Link aria-current={item.href === `/#${activeSection}` ? "location" : undefined} data-active={item.href === `/#${activeSection}`} href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>
              <span>0{index + 1}</span>{item.label}
            </Link>
          ))}
        </nav>
        <Link className={styles.mobileNavigationCta} href="/contacto#cotizador" onClick={() => setMenuOpen(false)}>
          Iniciar un proyecto <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}
